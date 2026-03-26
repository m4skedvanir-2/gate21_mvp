use sqlx::PgPool;
use uuid::Uuid;
use anyhow::Result;
use crate::models::project::{Project, ProjectMember, ProjectRequest};

pub async fn get_projects_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Project>> {
    let projects = sqlx::query_as!(
        Project,
        r#"
        SELECT p.* FROM projects p
        INNER JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = $1
        "#,
        user_id
    )
    .fetch_all(pool)
    .await?;

    Ok(projects)
}

pub async fn create_project(
    pool: &PgPool,
    company_id: Uuid,
    owner_id: Uuid,
    name: &str,
    description: Option<&str>,
    color: &str,
) -> Result<Project> {
    let mut tx = pool.begin().await?;

    let project = sqlx::query_as!(
        Project,
        r#"
        INSERT INTO projects (id, company_id, name, description, color, owner_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
        "#,
        Uuid::new_v4(),
        company_id,
        name,
        description,
        color,
        owner_id,
    )
    .fetch_one(&mut *tx)
    .await?;

    // オーナーをメンバーに追加
    sqlx::query!(
        r#"
        INSERT INTO project_members (project_id, user_id, role, joined_at)
        VALUES ($1, $2, 'owner', NOW())
        "#,
        project.id,
        owner_id,
    )
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(project)
}

pub async fn request_join_project(
    pool: &PgPool,
    project_id: Uuid,
    user_id: Uuid,
) -> Result<ProjectRequest> {
    let request = sqlx::query_as!(
        ProjectRequest,
        r#"
        INSERT INTO project_requests (id, project_id, user_id, status, requested_at)
        VALUES ($1, $2, $3, 'pending', NOW())
        RETURNING *
        "#,
        Uuid::new_v4(),
        project_id,
        user_id,
    )
    .fetch_one(pool)
    .await?;

    Ok(request)
}

pub async fn approve_join_request(
    pool: &PgPool,
    request_id: Uuid,
    approver_id: Uuid,
) -> Result<()> {
    let mut tx = pool.begin().await?;

    let request = sqlx::query!(
        "SELECT * FROM project_requests WHERE id = $1 AND status = 'pending'",
        request_id
    )
    .fetch_one(&mut *tx)
    .await?;

    // ステータス更新
    sqlx::query!(
        "UPDATE project_requests SET status = 'approved' WHERE id = $1",
        request_id
    )
    .execute(&mut *tx)
    .await?;

    // メンバーに追加
    sqlx::query!(
        r#"
        INSERT INTO project_members (project_id, user_id, role, joined_at)
        VALUES ($1, $2, 'member', NOW())
        "#,
        request.project_id,
        request.user_id,
    )
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(())
}