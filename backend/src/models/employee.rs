use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "account_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AccountStatus {
    Active,
    OnLeave,
    Retired,
}

impl AccountStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            AccountStatus::Active   => "active",
            AccountStatus::OnLeave  => "on_leave",
            AccountStatus::Retired  => "retired",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "active"   => Some(AccountStatus::Active),
            "on_leave" => Some(AccountStatus::OnLeave),
            "retired"  => Some(AccountStatus::Retired),
            _          => None,
        }
    }
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Employee {
    pub id:              i64,
    pub employee_number: String,
    pub name_kanji:      String,
    pub name_kana:       String,
    pub name_initial:    Option<String>,
    pub name_alphabet:   Option<String>,
    pub email:           String,
    pub department:      String,
    pub position:        String,
    pub account_status:  AccountStatus,
    pub created_at:      DateTime<Utc>,
    pub updated_at:      DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEmployeeRequest {
    pub employee_number: String,
    pub name_kanji:      String,
    pub name_kana:       String,
    pub name_initial:    Option<String>,
    pub name_alphabet:   Option<String>,
    pub email:           String,
    pub department:      String,
    pub position:        String,
    pub account_status:  Option<AccountStatus>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEmployeeRequest {
    pub name_kanji:     Option<String>,
    pub name_kana:      Option<String>,
    pub name_initial:   Option<String>,
    pub name_alphabet:  Option<String>,
    pub email:          Option<String>,
    pub department:     Option<String>,
    pub position:       Option<String>,
    pub account_status: Option<AccountStatus>,
}

#[derive(Debug, Deserialize)]
pub struct ListEmployeesQuery {
    pub name:           Option<String>,
    pub department:     Option<String>,
    pub position:       Option<String>,
    pub account_status: Option<String>,
    pub page:           Option<i64>,
    pub per_page:       Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct EmployeeListResponse {
    pub total:     i64,
    pub page:      i64,
    pub per_page:  i64,
    pub employees: Vec<Employee>,
}
