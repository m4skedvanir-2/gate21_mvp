use sqlx::PgPool;
use uuid::Uuid;
use anyhow::Result;
use crate::models::user::{User, Company};

pub async fn find_company_by_slug(pool: &PgPool, slug: &str) -> Result<Option<Company>> {
    let company = sqlx::query_as!(
        Company,
        "SELECT * FROM companies WHERE slug = $1",
        slug
    )
    .fetch_optional(pool)
    .await?;

    Ok(company)
}

pub async fn find_user_by_email(pool: &PgPool, email: &str, company_id: Uuid) -> Result<Option<User>> {
    let user = sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE email = $1 AND company_id = $2",
        email,
        company_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn create_user(
    pool: &PgPool,
    company_id: Uuid,
    email: &str,
    password_hash: &str,
    role: &str,
) -> Result<User> {
    let user = sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (id, company_id, email, password_hash, role, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
        "#,
        Uuid::new_v4(),
        company_id,
        email,
        password_hash,
        role,
    )
    .fetch_one(pool)
    .await?;

    Ok(user)
}