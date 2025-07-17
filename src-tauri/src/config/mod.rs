use crate::error::AppError;
use crate::utils::pagination::{PageRequest, PageResponse};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql, MySqlPool, QueryBuilder};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SysConfig {
    pub id: Option<i64>,
    pub param_name: String,
    pub param_key: String,
    pub param_value: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub status: String,
    pub remark: Option<String>,
    pub create_time: Option<chrono::DateTime<chrono::Local>>,
    pub update_time: Option<chrono::DateTime<chrono::Local>>,
}

#[derive(Debug, Deserialize)]
pub struct ConfigQuery {
    pub param_name: Option<String>,
    pub param_key: Option<String>,
}

impl SysConfig {
    // 获取参数列表
    pub async fn get_list(
        pool: &MySqlPool,
        query: &ConfigQuery,
        page_request: &PageRequest,
    ) -> Result<PageResponse<SysConfig>, AppError> {
        let mut sql = String::from("SELECT * FROM sys_config WHERE 1=1");
        let mut count_sql = String::from("SELECT COUNT(*) FROM sys_config WHERE 1=1");
        let mut params = Vec::new();

        if let Some(param_name) = &query.param_name {
            sql.push_str(" AND param_name LIKE CONCAT('%', ?, '%')");
            count_sql.push_str(" AND param_name LIKE CONCAT('%', ?, '%')");
            params.push(param_name);
        }

        if let Some(param_key) = &query.param_key {
            sql.push_str(" AND param_key LIKE CONCAT('%', ?, '%')");
            count_sql.push_str(" AND param_key LIKE CONCAT('%', ?, '%')");
            params.push(param_key);
        }

        let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new(&count_sql);
        for param in &params {
            query_builder.push_bind(param);
        }
        let total = sqlx::query_scalar::<_, i64>(&count_sql)
            .fetch_one(pool)
            .await?;

        sql.push_str(" ORDER BY create_time DESC LIMIT ? OFFSET ?");
        let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new(&sql);
        for param in &params {
            query_builder.push_bind(param);
        }
        query_builder.push_bind(page_request.page_size);
        query_builder.push_bind((page_request.current_page - 1) * page_request.page_size);

        let configs = query_builder
            .build_query_as::<SysConfig>()
            .fetch_all(pool)
            .await?;

        Ok(PageResponse {
            records: configs,
            total: total as u64,
            current_page: page_request.current_page,
            page_size: page_request.page_size,
        })
    }

    // 新增参数
    pub async fn add(pool: &MySqlPool, config: &SysConfig) -> Result<(), AppError> {
        // 检查参数键名是否已存在
        let exists: Option<(i64,)> =
            sqlx::query_as("SELECT id FROM sys_config WHERE param_key = ?")
                .bind(&config.param_key)
                .fetch_optional(pool)
                .await?;

        if exists.is_some() {
            return Err(AppError::BadRequest("参数键名已存在".into()));
        }

        sqlx::query(
            r#"
            INSERT INTO sys_config (param_name, param_key, param_value, type, status, remark)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&config.param_name)
        .bind(&config.param_key)
        .bind(&config.param_value)
        .bind(&config.type_)
        .bind(&config.status)
        .bind(&config.remark)
        .execute(pool)
        .await?;

        Ok(())
    }

    // 更新参数
    pub async fn update(pool: &MySqlPool, config: &SysConfig) -> Result<(), AppError> {
        if config.id.is_none() {
            return Err(AppError::BadRequest("参数ID不能为空".into()));
        }

        // 检查是否存在
        let exists: Option<(String,)> = sqlx::query_as("SELECT type FROM sys_config WHERE id = ?")
            .bind(config.id)
            .fetch_optional(pool)
            .await?;

        if exists.is_none() {
            return Err(AppError::NotFound("参数不存在".into()));
        }

        // 如果是系统内置参数，不允许修改键名
        if exists.unwrap().0 == "Y" {
            let current: Option<(String,)> =
                sqlx::query_as("SELECT param_key FROM sys_config WHERE id = ?")
                    .bind(config.id)
                    .fetch_optional(pool)
                    .await?;

            if current.unwrap().0 != config.param_key {
                return Err(AppError::BadRequest("系统内置参数不允许修改键名".into()));
            }
        }

        sqlx::query(
            r#"
            UPDATE sys_config 
            SET param_name = ?, param_key = ?, param_value = ?, 
                status = ?, remark = ?
            WHERE id = ?
            "#,
        )
        .bind(&config.param_name)
        .bind(&config.param_key)
        .bind(&config.param_value)
        .bind(&config.status)
        .bind(&config.remark)
        .bind(config.id)
        .execute(pool)
        .await?;

        Ok(())
    }

    // 删除参数
    pub async fn delete(pool: &MySqlPool, id: i64) -> Result<(), AppError> {
        // 检查是否是系统内置参数
        let type_: Option<(String,)> = sqlx::query_as("SELECT type FROM sys_config WHERE id = ?")
            .bind(id)
            .fetch_optional(pool)
            .await?;

        if let Some(t) = type_ {
            if t.0 == "Y" {
                return Err(AppError::BadRequest("系统内置参数不允许删除".into()));
            }
        }

        sqlx::query("DELETE FROM sys_config WHERE id = ?")
            .bind(id)
            .execute(pool)
            .await?;

        Ok(())
    }

    // 批量删除参数
    pub async fn batch_delete(pool: &MySqlPool, ids: &[i64]) -> Result<(), AppError> {
        let ids_str = ids
            .iter()
            .map(|id| id.to_string())
            .collect::<Vec<String>>()
            .join(",");

        let query = format!("SELECT type FROM sys_config WHERE id IN ({})", ids_str);

        let types: Vec<(String,)> = sqlx::query_as(&query).fetch_all(pool).await?;

        if types.iter().any(|t| t.0 == "Y") {
            return Err(AppError::BadRequest(
                "选中的参数包含系统内置参数，不允许删除".into(),
            ));
        }

        let query = format!("DELETE FROM sys_config WHERE id IN ({})", ids_str);

        sqlx::query(&query).execute(pool).await?;

        Ok(())
    }

    // 获取参数值
    pub async fn get_value(pool: &MySqlPool, key: &str) -> Result<Option<String>, AppError> {
        let value: Option<(String,)> = sqlx::query_as(
            "SELECT param_value FROM sys_config WHERE param_key = ? AND status = '0'",
        )
        .bind(key)
        .fetch_optional(pool)
        .await?;

        Ok(value.map(|v| v.0))
    }
}
