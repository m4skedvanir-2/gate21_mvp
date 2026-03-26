use sqlx::PgPool;
use uuid::Uuid;
use anyhow::Result;
use crate::models::asset::{Asset, AssetResponse};

pub async fn get_assets_by_project(pool: &PgPool, project_id: Uuid) -> Result<Vec<AssetResponse>> {
    let assets = sqlx::query_as!(
        AssetResponse,
        r#"
        SELECT id, project_id, name, asset_type, note, created_at
        FROM assets
        WHERE project_id = $1
        ORDER BY created_at DESC
        "#,
        project_id
    )
    .fetch_all(pool)
    .await?;

    Ok(assets)
}

pub async fn create_asset(
    pool: &PgPool,
    project_id: Uuid,
    created_by: Uuid,
    name: &str,
    asset_type: &str,
    encrypted_value: &str,
    encrypted_dek: &str,
    iv: &str,
    note: Option<&str>,
) -> Result<Asset> {
    let asset = sqlx::query_as!(
        Asset,
        r#"
        INSERT INTO assets (
            id, project_id, name, asset_type,
            encrypted_value, encrypted_dek, iv,
            note, created_by, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
        "#,
        Uuid::new_v4(),
        project_id,
        name,
        asset_type,
        encrypted_value,
        encrypted_dek,
        iv,
        note,
        created_by,
    )
    .fetch_one(pool)
    .await?;

    Ok(asset)
}

pub async fn get_asset_for_decrypt(
    pool: &PgPool,
    asset_id: Uuid,
    project_id: Uuid,
) -> Result<Asset> {
    let asset = sqlx::query_as!(
        Asset,
        "SELECT * FROM assets WHERE id = $1 AND project_id = $2",
        asset_id,
        project_id,
    )
    .fetch_one(pool)
    .await?;

    Ok(asset)
}

pub async fn delete_asset(pool: &PgPool, asset_id: Uuid, project_id: Uuid) -> Result<()> {
    sqlx::query!(
        "DELETE FROM assets WHERE id = $1 AND project_id = $2",
        asset_id,
        project_id,
    )
    .execute(pool)
    .await?;

    Ok(())
}