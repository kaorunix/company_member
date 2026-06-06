use actix_web::{web, HttpResponse};
use chrono::Local;
use sqlx::PgPool;

use crate::errors::AppError;
use crate::models::employee::AccountStatus;
use crate::models::personnel_history::{CreateHistoryRequest, EventType};

pub async fn list_histories(
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
) -> Result<HttpResponse, AppError> {
    let employee_id = path.into_inner();

    let exists: Option<i64> = sqlx::query_scalar("SELECT id FROM employees WHERE id = $1")
        .bind(employee_id)
        .fetch_optional(pool.get_ref())
        .await?;
    if exists.is_none() {
        return Err(AppError::NotFound);
    }

    let histories = sqlx::query_as::<_, crate::models::personnel_history::PersonnelHistory>(
        "SELECT id, employee_id, event_type, event_date, \
         dept_before, dept_after, position_before, position_after, note, created_at \
         FROM personnel_histories \
         WHERE employee_id = $1 \
         ORDER BY event_date DESC, id DESC"
    )
    .bind(employee_id)
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(histories))
}

pub async fn create_history(
    pool: web::Data<PgPool>,
    path: web::Path<i64>,
    body: web::Json<CreateHistoryRequest>,
) -> Result<HttpResponse, AppError> {
    let employee_id = path.into_inner();

    let current_status_str: Option<String> =
        sqlx::query_scalar("SELECT account_status::text FROM employees WHERE id = $1")
            .bind(employee_id)
            .fetch_optional(pool.get_ref())
            .await?;

    let status_str = current_status_str.ok_or(AppError::NotFound)?;
    let current_status = AccountStatus::from_str(&status_str)
        .ok_or_else(|| AppError::Validation("不明なアカウント状態です".into()))?;

    let today = Local::now().date_naive();
    if body.event_date > today {
        return Err(AppError::Validation("発令日に未来の日付は指定できません".into()));
    }

    validate_status_transition(&current_status, &body.event_type)?;

    let mut tx = pool.begin().await?;

    let history = sqlx::query_as::<_, crate::models::personnel_history::PersonnelHistory>(
        "INSERT INTO personnel_histories \
         (employee_id, event_type, event_date, dept_before, dept_after, position_before, position_after, note) \
         VALUES ($1, $2::event_type, $3, $4, $5, $6, $7, $8) \
         RETURNING id, employee_id, event_type, event_date, \
                   dept_before, dept_after, position_before, position_after, note, created_at"
    )
    .bind(employee_id)
    .bind(body.event_type.as_str())
    .bind(body.event_date)
    .bind(body.dept_before.as_deref())
    .bind(body.dept_after.as_deref())
    .bind(body.position_before.as_deref())
    .bind(body.position_after.as_deref())
    .bind(body.note.as_deref())
    .fetch_one(&mut *tx)
    .await?;

    let new_status: Option<&str> = match &body.event_type {
        EventType::OnLeave  => Some("on_leave"),
        EventType::Returned => Some("active"),
        EventType::Retired  => Some("retired"),
        _                   => None,
    };

    if let Some(s) = new_status {
        sqlx::query(
            "UPDATE employees SET account_status = $1::account_status WHERE id = $2"
        )
        .bind(s)
        .bind(employee_id)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    Ok(HttpResponse::Created().json(history))
}

fn validate_status_transition(
    current: &AccountStatus,
    event: &EventType,
) -> Result<(), AppError> {
    match (current, event) {
        (AccountStatus::Retired, _) =>
            Err(AppError::Validation("退職済みの社員に対して人事操作はできません".into())),
        (AccountStatus::OnLeave, EventType::Returned) => Ok(()),
        (AccountStatus::OnLeave, _) =>
            Err(AppError::Validation("休職中の社員には復職以外の操作はできません".into())),
        (AccountStatus::Active, _) => Ok(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_transition_valid() {
        assert!(validate_status_transition(&AccountStatus::Active, &EventType::OnLeave).is_ok());
        assert!(validate_status_transition(&AccountStatus::Active, &EventType::Retired).is_ok());
        assert!(validate_status_transition(&AccountStatus::Active, &EventType::Transferred).is_ok());
        assert!(validate_status_transition(&AccountStatus::Active, &EventType::Promoted).is_ok());
        assert!(validate_status_transition(&AccountStatus::OnLeave, &EventType::Returned).is_ok());
    }

    #[test]
    fn test_status_transition_invalid() {
        assert!(validate_status_transition(&AccountStatus::Retired, &EventType::Hired).is_err());
        assert!(validate_status_transition(&AccountStatus::Retired, &EventType::Returned).is_err());
        assert!(validate_status_transition(&AccountStatus::OnLeave, &EventType::Promoted).is_err());
        assert!(validate_status_transition(&AccountStatus::OnLeave, &EventType::Transferred).is_err());
    }
}
