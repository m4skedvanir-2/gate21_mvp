use actix_web::{web, HttpResponse, HttpRequest};
use uuid::Uuid;
use crate::AppState;
use crate::models::asset::CreateAssetRequest;
use crate::auth::jwt::verify_token;
use crate::crypto::aes::{encrypt, decrypt, generate_dek};
use crate::crypto::kek::{encrypt_dek, decrypt_dek};
use crate::db::assets::{
    get_assets_by_project,
    create_asset,
    get_asset_for_decrypt,
    delete_asset,
};
use crate::db::projects::get_projects_by_user;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/assets")
            .route("/{project_id}", web::get().to(get_assets))
            .route("", web::post().to(post_asset))
            .route("/decrypt/{asset_id}", web::get().to(decrypt_asset))
            .route("/{asset_id}", web::delete().to(delete_asset_handler))
    );
}

fn extract_claims(req: &HttpRequest) -> Option<crate::auth::jwt::Claims> {
    let token = req.headers()
        .get("Authorization")?
        .to_str().ok()?
        .replace("Bearer ", "");
    verify_token(&token).ok()
}

// プロジェクトへのアクセス権確認
async fn has_project_access(
    state: &AppState,
    user_id: Uuid,
    project_id: Uuid,
) -> bool {
    match get_projects_by_user(&state.db, user_id).await {
        Ok(projects) => projects.iter().any(|p| p.id == project_id),
        Err(_) => false,
    }
}

async fn get_assets(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<Uuid>,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = Uuid::parse_str(&claims.sub).unwrap();
    let project_id = path.into_inner();

    // 権限チェック
    if !has_project_access(&state, user_id, project_id).await {
        return HttpResponse::Forbidden().finish();
    }

    match get_assets_by_project(&state.db, project_id).await {
        Ok(assets) => HttpResponse::Ok().json(assets),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn post_asset(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<CreateAssetRequest>,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = Uuid::parse_str(&claims.sub).unwrap();

    // 権限チェック
    if !has_project_access(&state, user_id, body.project_id).await {
        return HttpResponse::Forbidden().finish();
    }

    // DEK生成
    let dek = generate_dek();

    // 資産値をDEKで暗号化
    let encrypted = match encrypt(&body.value, &dek) {
        Ok(e) => e,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // DEKをKEKで暗号化
    let (encrypted_dek, dek_iv) = match encrypt_dek(&dek) {
        Ok(e) => e,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // ivはデータのivとDEKのivを":"で結合して保存
    let iv_combined = format!("{}:{}", encrypted.iv, dek_iv);

    match create_asset(
        &state.db,
        body.project_id,
        user_id,
        &body.name,
        &body.asset_type,
        &encrypted.ciphertext,
        &encrypted_dek,
        &iv_combined,
        body.note.as_deref(),
    ).await {
        Ok(asset) => HttpResponse::Created().json(asset),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn decrypt_asset(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<Uuid>,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = Uuid::parse_str(&claims.sub).unwrap();
    let asset_id = path.into_inner();

    // 資産取得
    let asset = match get_asset_for_decrypt(&state.db, asset_id, Uuid::nil()).await {
        Ok(a) => a,
        Err(_) => return HttpResponse::NotFound().finish(),
    };

    // 権限チェック
    if !has_project_access(&state, user_id, asset.project_id).await {
        return HttpResponse::Forbidden().finish();
    }

    // ivを分割
    let ivs: Vec<&str> = asset.iv.split(':').collect();
    if ivs.len() != 2 {
        return HttpResponse::InternalServerError().finish();
    }

    // DEKを復号
    let dek = match decrypt_dek(&asset.encrypted_dek, ivs[1]) {
        Ok(d) => d,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // 資産値を復号
    match decrypt(&asset.encrypted_value, ivs[0], &dek) {
        Ok(value) => HttpResponse::Ok().json(serde_json::json!({
            "id": asset.id,
            "name": asset.name,
            "value": value,
        })),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn delete_asset_handler(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<Uuid>,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = Uuid::parse_str(&claims.sub).unwrap();
    let asset_id = path.into_inner();

    // 資産取得して権限確認
    let asset = match get_asset_for_decrypt(&state.db, asset_id, Uuid::nil()).await {
        Ok(a) => a,
        Err(_) => return HttpResponse::NotFound().finish(),
    };

    if !has_project_access(&state, user_id, asset.project_id).await {
        return HttpResponse::Forbidden().finish();
    }

    match delete_asset(&state.db, asset_id, asset.project_id).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({ "deleted": true })),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}