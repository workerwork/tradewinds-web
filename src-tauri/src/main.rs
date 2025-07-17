// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use sqlx::MySqlPool;
use std::sync::Mutex;
mod config;
mod error;
mod handlers;
mod utils;

pub struct AppState {
    pool: Mutex<Option<MySqlPool>>,
}

async fn create_pool() -> Result<MySqlPool, Box<dyn std::error::Error>> {
    let database_url = std::env::var("DATABASE_URL")?;
    let pool = MySqlPool::connect(&database_url).await?;
    Ok(pool)
}

#[tauri::command]
async fn initialize_database(state: tauri::State<'_, AppState>) -> Result<(), String> {
    match create_pool().await {
        Ok(pool) => {
            *state.pool.lock().unwrap() = Some(pool);
            Ok(())
        }
        Err(e) => {
            eprintln!("Database connection error: {}", e);
            Err(format!("Failed to connect to database: {}", e))
        }
    }
}

#[tokio::main]
async fn main() {
    // 加载 .env 文件
    dotenv().ok();

    tauri::Builder::default()
        .manage(AppState {
            pool: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            handlers::config::get_config_list,
            handlers::config::add_config,
            handlers::config::update_config,
            handlers::config::delete_config,
            handlers::config::batch_delete_config,
            handlers::config::get_config_value,
            handlers::auth::auth_login,
            handlers::auth::auth_logout,
            handlers::auth::auth_get_current_user,
            handlers::auth::auth_refresh_token,
            handlers::auth::auth_get_user_info,
            initialize_database,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
