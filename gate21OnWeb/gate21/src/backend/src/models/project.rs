use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: Uuid,
    pub company_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub color: String,
    pub owner_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ProjectMember {
    pub project_id: Uuid,
    pub user_id: Uuid,
    pub role: String, // owner / member
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ProjectRequest {
    pub id: Uuid,
    pub project_id: Uuid,
    pub user_id: Uuid,
    pub status: String, // pending / approved / rejected
    pub requested_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: String,
}

#[derive(Debug, Deserialize)]
pub struct ProjectJoinRequest {
    pub project_id: Uuid,
}