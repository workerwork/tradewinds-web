use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct PageRequest {
    pub current_page: u64,
    pub page_size: u64,
}

#[derive(Debug, Serialize)]
pub struct PageResponse<T> {
    pub records: Vec<T>,
    pub total: u64,
    pub current_page: u64,
    pub page_size: u64,
}
