use crate::config::{ConfigQuery, SysConfig};
use crate::error::AppError;
use crate::utils::pagination::{PageRequest, PageResponse};
use crate::utils::response::Response;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_config_list(
    state: State<'_, AppState>,
    param_name: Option<String>,
    param_key: Option<String>,
    current_page: u64,
    page_size: u64,
) -> Result<Response<PageResponse<SysConfig>>, AppError> {
    let pool = {
        let guard = state.pool.lock().unwrap();
        guard
            .as_ref()
            .ok_or(AppError::DatabaseNotConnected)?
            .clone()
    };

    let query = ConfigQuery {
        param_name,
        param_key,
    };
    let page_request = PageRequest {
        current_page,
        page_size,
    };
    let result = SysConfig::get_list(&pool, &query, &page_request).await?;
    Ok(Response::success(result))
}

#[tauri::command]
pub async fn add_config(
    state: State<'_, AppState>,
    config: SysConfig,
) -> Result<Response<()>, AppError> {
    let pool = {
        let guard = state.pool.lock().unwrap();
        guard
            .as_ref()
            .ok_or(AppError::DatabaseNotConnected)?
            .clone()
    };

    SysConfig::add(&pool, &config).await?;
    Ok(Response::success(()))
}

#[tauri::command]
pub async fn update_config(
    state: State<'_, AppState>,
    config: SysConfig,
) -> Result<Response<()>, AppError> {
    let pool = {
        let guard = state.pool.lock().unwrap();
        guard
            .as_ref()
            .ok_or(AppError::DatabaseNotConnected)?
            .clone()
    };

    SysConfig::update(&pool, &config).await?;
    Ok(Response::success(()))
}

#[tauri::command]
pub async fn delete_config(state: State<'_, AppState>, id: i64) -> Result<Response<()>, AppError> {
    let pool = {
        let guard = state.pool.lock().unwrap();
        guard
            .as_ref()
            .ok_or(AppError::DatabaseNotConnected)?
            .clone()
    };

    SysConfig::delete(&pool, id).await?;
    Ok(Response::success(()))
}

#[tauri::command]
pub async fn batch_delete_config(
    state: State<'_, AppState>,
    ids: Vec<i64>,
) -> Result<Response<()>, AppError> {
    let pool = {
        let guard = state.pool.lock().unwrap();
        guard
            .as_ref()
            .ok_or(AppError::DatabaseNotConnected)?
            .clone()
    };

    SysConfig::batch_delete(&pool, &ids).await?;
    Ok(Response::success(()))
}

#[tauri::command]
pub async fn get_config_value(
    state: State<'_, AppState>,
    key: String,
) -> Result<Response<Option<String>>, AppError> {
    let pool = {
        let guard = state.pool.lock().unwrap();
        guard
            .as_ref()
            .ok_or(AppError::DatabaseNotConnected)?
            .clone()
    };

    let value = SysConfig::get_value(&pool, &key).await?;
    Ok(Response::success(value))
}
