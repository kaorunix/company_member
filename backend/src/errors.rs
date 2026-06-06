use actix_web::HttpResponse;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Not found")]
    NotFound,

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
}

impl actix_web::ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::NotFound =>
                HttpResponse::NotFound().json(error_body("NOT_FOUND", self.to_string())),
            AppError::Validation(msg) =>
                HttpResponse::BadRequest().json(error_body("VALIDATION_ERROR", msg.clone())),
            AppError::Conflict(msg) =>
                HttpResponse::Conflict().json(error_body("CONFLICT", msg.clone())),
            AppError::Database(_) =>
                HttpResponse::InternalServerError()
                    .json(error_body("INTERNAL_ERROR", "サーバーエラーが発生しました".into())),
        }
    }
}

fn error_body(code: &str, message: String) -> serde_json::Value {
    serde_json::json!({ "error": { "code": code, "message": message } })
}
