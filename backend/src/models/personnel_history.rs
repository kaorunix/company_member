use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "event_type", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum EventType {
    Hired,
    Transferred,
    Promoted,
    OnLeave,
    Returned,
    Retired,
}

impl EventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            EventType::Hired       => "hired",
            EventType::Transferred => "transferred",
            EventType::Promoted    => "promoted",
            EventType::OnLeave     => "on_leave",
            EventType::Returned    => "returned",
            EventType::Retired     => "retired",
        }
    }
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct PersonnelHistory {
    pub id:              i64,
    pub employee_id:     i64,
    pub event_type:      EventType,
    pub event_date:      NaiveDate,
    pub dept_before:     Option<String>,
    pub dept_after:      Option<String>,
    pub position_before: Option<String>,
    pub position_after:  Option<String>,
    pub note:            Option<String>,
    pub created_at:      DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateHistoryRequest {
    pub event_type:      EventType,
    pub event_date:      NaiveDate,
    pub dept_before:     Option<String>,
    pub dept_after:      Option<String>,
    pub position_before: Option<String>,
    pub position_after:  Option<String>,
    pub note:            Option<String>,
}
