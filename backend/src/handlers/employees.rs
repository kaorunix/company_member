use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::errors::AppError;
use crate::models::employee::{
    AccountStatus, CreateEmployeeRequest, EmployeeListResponse, ListEmployeesQuery,
    UpdateEmployeeRequest,
};

fn validate_employee_number(s: &str) -> Result<(), AppError> {
    if s.len() != 4 || !s.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::Validation(
            "社員番号は4桁の数字で入力してください".into(),
        ));
    }
    Ok(())
}

fn validate_email(s: &str) -> Result<(), AppError> {
    if s.is_empty() || s.len() > 255 || !s.contains('@') || s.ends_with('@') {
        return Err(AppError::Validation(
            "メールアドレスの形式が正しくありません".into(),
        ));
    }
    Ok(())
}

fn validate_required_str(s: &str, field: &str, max: usize) -> Result<(), AppError> {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return Err(AppError::Validation(format!("{}は必須です", field)));
    }
    if trimmed.chars().count() > max {
        return Err(AppError::Validation(format!(
            "{}は{}文字以内で入力してください",
            field, max
        )));
    }
    Ok(())
}

pub async fn list_employees(
    pool: web::Data<PgPool>,
    query: web::Query<ListEmployeesQuery>,
) -> Result<HttpResponse, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let name_pat = query.name.as_deref().map(|s| format!("%{}%", s));
    let dept_pat = query.department.as_deref().map(|s| format!("%{}%", s));
    let pos_pat  = query.position.as_deref().map(|s| format!("%{}%", s));

    let status_sql: Option<&str> = match query.account_status.as_deref() {
        Some("active")   => Some("active"),
        Some("on_leave") => Some("on_leave"),
        Some("retired")  => Some("retired"),
        _                => None,
    };

    // 動的クエリ構築
    let mut where_parts: Vec<String> = vec!["1=1".into()];
    let args: Vec<Box<dyn sqlx::Encode<'_, sqlx::Postgres> + Send + Sync>> = vec![];
    let mut idx = 1usize;

    if name_pat.is_some() {
        where_parts.push(format!(
            "(name_kanji ILIKE ${idx} OR name_kana ILIKE ${idx} OR name_alphabet ILIKE ${idx} OR name_initial ILIKE ${idx})"
        ));
        idx += 1;
    }
    if dept_pat.is_some() {
        where_parts.push(format!("department ILIKE ${idx}"));
        idx += 1;
    }
    if pos_pat.is_some() {
        where_parts.push(format!("position ILIKE ${idx}"));
        idx += 1;
    }
    if status_sql.is_some() {
        where_parts.push(format!("account_status = ${idx}::account_status"));
        idx += 1;
    }

    let where_clause = where_parts.join(" AND ");

    // sqlx QueryBuilder を使用
    use sqlx::QueryBuilder;

    let employees = {
        let mut qb: QueryBuilder<sqlx::Postgres> = QueryBuilder::new(
            "SELECT id, employee_number, name_kanji, name_kana, name_initial, name_alphabet, \
             email, department, position, account_status, created_at, updated_at FROM employees WHERE "
        );
        let mut sep = qb.separated(" AND ");
        sep.push("1=1");
        if let Some(ref p) = name_pat {
            sep.push("(name_kanji ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(" OR name_kana ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(" OR name_alphabet ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(" OR name_initial ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(")");
        }
        if let Some(ref p) = dept_pat {
            sep.push("department ILIKE ").push_bind_unseparated(p);
        }
        if let Some(ref p) = pos_pat {
            sep.push("position ILIKE ").push_bind_unseparated(p);
        }
        if let Some(s) = status_sql {
            sep.push("account_status = ");
            sep.push_bind_unseparated(s);
            sep.push_unseparated("::account_status");
        }
        qb.push(" ORDER BY employee_number LIMIT ");
        qb.push_bind(per_page);
        qb.push(" OFFSET ");
        qb.push_bind(offset);

        qb.build_query_as::<crate::models::employee::Employee>()
            .fetch_all(pool.get_ref())
            .await?
    };

    let total: i64 = {
        let mut qb: QueryBuilder<sqlx::Postgres> =
            QueryBuilder::new("SELECT COUNT(*) FROM employees WHERE ");
        let mut sep = qb.separated(" AND ");
        sep.push("1=1");
        if let Some(ref p) = name_pat {
            sep.push("(name_kanji ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(" OR name_kana ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(" OR name_alphabet ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(" OR name_initial ILIKE ");
            sep.push_bind_unseparated(p);
            sep.push_unseparated(")");
        }
        if let Some(ref p) = dept_pat {
            sep.push("department ILIKE ").push_bind_unseparated(p);
        }
        if let Some(ref p) = pos_pat {
            sep.push("position ILIKE ").push_bind_unseparated(p);
        }
        if let Some(s) = status_sql {
            sep.push("account_status = ");
            sep.push_bind_unseparated(s);
            sep.push_unseparated("::account_status");
        }
        qb.build_query_scalar()
            .fetch_one(pool.get_ref())
            .await?
    };

    // 使わない変数の警告抑制
    let _ = (idx, where_clause, args);

    Ok(HttpResponse::Ok().json(EmployeeListResponse {
        total,
        page,
        per_page,
        employees,
    }))
}

pub async fn get_employee(
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let emp = sqlx::query_as::<_, crate::models::employee::Employee>(
        "SELECT id, employee_number, name_kanji, name_kana, name_initial, name_alphabet, \
         email, department, position, account_status, created_at, updated_at \
         FROM employees WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(HttpResponse::Ok().json(emp))
}

pub async fn create_employee(
    pool: web::Data<PgPool>,
    body: web::Json<CreateEmployeeRequest>,
) -> Result<HttpResponse, AppError> {
    validate_employee_number(&body.employee_number)?;
    validate_required_str(&body.name_kanji, "氏名（漢字）", 100)?;
    validate_required_str(&body.name_kana,  "氏名（かな）", 100)?;
    validate_email(&body.email)?;
    validate_required_str(&body.department, "部署", 100)?;
    validate_required_str(&body.position,   "役職", 100)?;

    let status = body.account_status.clone().unwrap_or(AccountStatus::Active);

    let emp = sqlx::query_as::<_, crate::models::employee::Employee>(
        "INSERT INTO employees \
         (employee_number, name_kanji, name_kana, name_initial, name_alphabet, \
          email, department, position, account_status) \
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::account_status) \
         RETURNING id, employee_number, name_kanji, name_kana, name_initial, name_alphabet, \
                   email, department, position, account_status, created_at, updated_at"
    )
    .bind(&body.employee_number)
    .bind(body.name_kanji.trim())
    .bind(body.name_kana.trim())
    .bind(body.name_initial.as_deref())
    .bind(body.name_alphabet.as_deref())
    .bind(body.email.trim())
    .bind(body.department.trim())
    .bind(body.position.trim())
    .bind(status.as_str())
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| match &e {
        sqlx::Error::Database(db) if db.constraint() == Some("uq_employees_number") =>
            AppError::Conflict("この社員番号は既に使用されています".into()),
        sqlx::Error::Database(db) if db.constraint() == Some("uq_employees_email") =>
            AppError::Conflict("このメールアドレスは既に使用されています".into()),
        _ => AppError::Database(e),
    })?;

    Ok(HttpResponse::Created().json(emp))
}

pub async fn update_employee(
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
    body: web::Json<UpdateEmployeeRequest>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();

    let exists: Option<i64> = sqlx::query_scalar("SELECT id FROM employees WHERE id = $1")
        .bind(id)
        .fetch_optional(pool.get_ref())
        .await?;
    if exists.is_none() {
        return Err(AppError::NotFound);
    }

    if let Some(ref v) = body.name_kanji  { validate_required_str(v, "氏名（漢字）", 100)?; }
    if let Some(ref v) = body.name_kana   { validate_required_str(v, "氏名（かな）", 100)?; }
    if let Some(ref v) = body.email       { validate_email(v)?; }
    if let Some(ref v) = body.department  { validate_required_str(v, "部署", 100)?; }
    if let Some(ref v) = body.position    { validate_required_str(v, "役職", 100)?; }

    let status_str = body.account_status.as_ref().map(|s| s.as_str());

    let emp = sqlx::query_as::<_, crate::models::employee::Employee>(
        "UPDATE employees SET \
         name_kanji     = COALESCE($2, name_kanji), \
         name_kana      = COALESCE($3, name_kana), \
         name_initial   = CASE WHEN $4::text IS NOT NULL THEN $4 ELSE name_initial END, \
         name_alphabet  = CASE WHEN $5::text IS NOT NULL THEN $5 ELSE name_alphabet END, \
         email          = COALESCE($6, email), \
         department     = COALESCE($7, department), \
         position       = COALESCE($8, position), \
         account_status = COALESCE($9::account_status, account_status) \
         WHERE id = $1 \
         RETURNING id, employee_number, name_kanji, name_kana, name_initial, name_alphabet, \
                   email, department, position, account_status, created_at, updated_at"
    )
    .bind(id)
    .bind(body.name_kanji.as_deref())
    .bind(body.name_kana.as_deref())
    .bind(body.name_initial.as_deref())
    .bind(body.name_alphabet.as_deref())
    .bind(body.email.as_deref())
    .bind(body.department.as_deref())
    .bind(body.position.as_deref())
    .bind(status_str)
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| match &e {
        sqlx::Error::Database(db) if db.constraint() == Some("uq_employees_email") =>
            AppError::Conflict("このメールアドレスは既に使用されています".into()),
        _ => AppError::Database(e),
    })?;

    Ok(HttpResponse::Ok().json(emp))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_employee_number_valid() {
        assert!(validate_employee_number("0001").is_ok());
        assert!(validate_employee_number("9999").is_ok());
        assert!(validate_employee_number("0100").is_ok());
    }

    #[test]
    fn test_validate_employee_number_invalid() {
        assert!(validate_employee_number("001").is_err());
        assert!(validate_employee_number("00001").is_err());
        assert!(validate_employee_number("00A1").is_err());
        assert!(validate_employee_number("").is_err());
    }

    #[test]
    fn test_validate_email_valid() {
        assert!(validate_email("user@example.com").is_ok());
        assert!(validate_email("user@mail.example.co.jp").is_ok());
    }

    #[test]
    fn test_validate_email_invalid() {
        assert!(validate_email("userexample.com").is_err());
        assert!(validate_email("user@").is_err());
        assert!(validate_email("").is_err());
        let long = format!("{}@example.com", "a".repeat(250));
        assert!(validate_email(&long).is_err());
    }

    #[test]
    fn test_validate_required_str() {
        assert!(validate_required_str("開発部", "部署", 100).is_ok());
        assert!(validate_required_str("", "部署", 100).is_err());
        assert!(validate_required_str("   ", "部署", 100).is_err());
        assert!(validate_required_str(&"a".repeat(101), "部署", 100).is_err());
    }
}
