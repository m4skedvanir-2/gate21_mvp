use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Asset {
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub asset_type: String,
    pub encrypted_value: String, // AES-256-GCM暗号化済み
    pub encrypted_dek: String,   // KEKで暗号化されたDEK
    pub iv: String,              // 初期化ベクトル
    pub note: Option<String>,
    pub created_by: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAssetRequest {
    pub project_id: Uuid,
    pub name: String,
    pub asset_type: String,
    pub value: String, // 平文（サーバで暗号化）
    pub note: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AssetResponse {
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub asset_type: String,
    pub note: Option<String>,
    pub created_at: DateTime<Utc>,
    // valueは含めない（復号APIを別途叩く）
}

#[derive(Debug, Serialize)]
pub struct AssetDecryptedResponse {
    pub id: Uuid,
    pub name: String,
    pub value: String, // 復号済み
}