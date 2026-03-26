use actix_web::{web, HttpResponse, HttpRequest};
use crate::AppState;
use crate::models::user::{LoginRequest, LoginResponse, CheckCompanyRequest, CheckCompanyResponse, UserPublic};
use crate::db::users::{find_company_by_slug, find_user_by_email};
use crate::auth::jwt::{generate_access_token, generate_refresh_token, verify_refresh_token};
use crate::auth::password::verify_password;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/auth")
            .route("/check-company", web::post().to(check_company))
            .route("/login", web::post().to(login))
            .route("/refresh", web::post().to(refresh))
    );
}

// 会社名チェック（ギミックログイン用）
async fn check_company(
    state: web::Data<AppState>,
    body: web::Json<CheckCompanyRequest>,
) -> HttpResponse {
    match find_company_by_slug(&state.db, &body.slug).await {
        Ok(Some(company)) => HttpResponse::Ok().json(CheckCompanyResponse {
            exists: true,
            company_name: Some(company.name),
        }),
        Ok(None) => HttpResponse::Ok().json(CheckCompanyResponse {
            exists: false,
            company_name: None,
        }),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// ログイン
async fn login(
    state: web::Data<AppState>,
    body: web::Json<LoginRequest>,
) -> HttpResponse {
    // 会社確認
    let company = match find_company_by_slug(&state.db, &body.company_slug).await {
        Ok(Some(c)) => c,
        Ok(None) => return HttpResponse::Unauthorized().json("Invalid credentials"),
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // ユーザー確認
    let user = match find_user_by_email(&state.db, &body.email, company.id).await {
        Ok(Some(u)) => u,
        Ok(None) => return HttpResponse::Unauthorized().json("Invalid credentials"),
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // パスワード検証
    match verify_password(&body.password, &user.password_hash) {
        Ok(true) => {},
        _ => return HttpResponse::Unauthorized().json("Invalid credentials"),
    }

    // JWT発行
    let access_token = match generate_access_token(
        &user.id.to_string(),
        &company.id.to_string(),
        &user.role,
    ) {
        Ok(t) => t,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let refresh_token = match generate_refresh_token(&user.id.to_string()) {
        Ok(t) => t,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    HttpResponse::Ok().json(LoginResponse {
        access_token,
        refresh_token,
        user: UserPublic {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    })
}

// リフレッシュトークン
async fn refresh(req: HttpRequest) -> HttpResponse {
    let token = match req.headers().get("Authorization") {
        Some(v) => v.to_str().unwrap_or("").replace("Bearer ", ""),
        None => return HttpResponse::Unauthorized().finish(),
    };

    match verify_refresh_token(&token) {
        Ok(claims) => {
            let new_token = generate_access_token(&claims.sub, &claims.company_id, &claims.role)
                .unwrap_or_default();
            HttpResponse::Ok().json(serde_json::json!({ "access_token": new_token }))
        }
        Err(_) => HttpResponse::Unauthorized().finish(),
    }
}