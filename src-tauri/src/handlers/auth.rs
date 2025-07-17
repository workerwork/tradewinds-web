use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct Role {
    pub id: i32,
    pub name: String,
    pub code: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub status: i32,
    pub create_time: String,
}

#[derive(Debug, Serialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub real_name: String,
    pub email: String,
    pub phone: String,
    pub roles: Vec<Role>,
    pub permissions: Vec<String>,
    pub status: i32,
    pub create_time: String,
    pub last_login_time: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: User,
}

#[tauri::command]
pub async fn auth_login(
    state: tauri::State<'_, AppState>,
    data: LoginRequest,
) -> Result<LoginResponse, String> {
    // TODO: 实现真实的登录逻辑
    // 这里先返回模拟数据
    Ok(LoginResponse {
        token: "mock-token".to_string(),
        user: User {
            id: 1,
            username: data.username,
            real_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            phone: "1234567890".to_string(),
            roles: vec![Role {
                id: 1,
                name: "管理员".to_string(),
                code: "admin".to_string(),
                description: "系统管理员".to_string(),
                permissions: vec!["*".to_string()],
                status: 1,
                create_time: "2024-01-01".to_string(),
            }],
            permissions: vec!["*".to_string()],
            status: 1,
            create_time: "2024-01-01".to_string(),
            last_login_time: "2024-01-01".to_string(),
        },
    })
}

#[tauri::command]
pub async fn auth_logout() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub async fn auth_get_current_user(state: tauri::State<'_, AppState>) -> Result<User, String> {
    // TODO: 实现获取当前用户信息的逻辑
    Ok(User {
        id: 1,
        username: "admin".to_string(),
        real_name: "Test User".to_string(),
        email: "test@example.com".to_string(),
        phone: "1234567890".to_string(),
        roles: vec![Role {
            id: 1,
            name: "管理员".to_string(),
            code: "admin".to_string(),
            description: "系统管理员".to_string(),
            permissions: vec!["*".to_string()],
            status: 1,
            create_time: "2024-01-01".to_string(),
        }],
        permissions: vec!["*".to_string()],
        status: 1,
        create_time: "2024-01-01".to_string(),
        last_login_time: "2024-01-01".to_string(),
    })
}

#[tauri::command]
pub async fn auth_refresh_token(state: tauri::State<'_, AppState>) -> Result<String, String> {
    Ok("new-mock-token".to_string())
}

#[tauri::command]
pub async fn auth_get_user_info(state: tauri::State<'_, AppState>) -> Result<User, String> {
    // 复用获取当前用户的逻辑
    auth_get_current_user(state).await
}
