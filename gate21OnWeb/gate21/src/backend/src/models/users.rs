use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub company_id: String,
    pub email: String,
    pub password_hash: String,
    pub role: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Company {
    pub id: Uuid,
    pub name: String,
    pub slug: String, // ← UserIDで入力する会社名
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub company_slug: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: UserPublic,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct UserPublic {
    pub id: Uuid,
    pub email: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct CheckCompanyRequest {
    pub slug: String,
}

#[derive(Debug, Serialize)]
pub struct CheckCompanyResponse {
    pub exists: bool,
    pub company_name: Option<String>,
}