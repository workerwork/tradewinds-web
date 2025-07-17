use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Response<T> {
    pub code: i32,
    pub message: String,
    pub data: Option<T>,
}

impl<T> Response<T> {
    pub fn success(data: T) -> Self {
        Response {
            code: 0,
            message: "success".to_string(),
            data: Some(data),
        }
    }

    pub fn error(code: i32, message: String) -> Self
    where
        T: Default,
    {
        Response {
            code,
            message,
            data: None,
        }
    }
}
