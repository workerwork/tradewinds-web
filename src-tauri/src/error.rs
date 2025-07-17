use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    InternalError(String),
    DatabaseNotConnected,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            AppError::BadRequest(msg) => write!(f, "Bad Request: {}", msg),
            AppError::InternalError(msg) => write!(f, "Internal Error: {}", msg),
            AppError::DatabaseNotConnected => write!(f, "Database not connected"),
        }
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::NotFound("Record not found".into()),
            _ => AppError::InternalError(err.to_string()),
        }
    }
}
