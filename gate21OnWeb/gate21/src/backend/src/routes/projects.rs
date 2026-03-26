use actix_web::{web, HttpResponse, HttpRequest};
use uuid::Uuid;
use crate::AppState;
use crate::models::project::CreateProjectRequest;
use crate::auth::jwt::verify_token;
use crate::db::projects::{
    get_projects_by_user,
    create_project,
    request_join_project,
    approve_join_request,
};

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/projects")
            .route("", web::get().to(get_projects))
            .route("", web::post().to(post_project))
            .route("/join", web::post().to(join_project))
            .route("/approve/{request_id}", web::post().to(approve_request))
    );
}

fn extract_claims(req: &HttpRequest) -> Option<crate::auth::jwt::Claims> {
    let token = req.headers()
        .get("Authorization")?
        .to_str().ok()?
        .replace("Bearer ", "");
    verify_token(&token).ok()
}

async fn get_projects(
    state: web::Data<AppState>,
    req: HttpRequest,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().finish(),
    };

    match get_projects_by_user(&state.db, user_id).await {
        Ok(projects) => HttpResponse::Ok().json(projects),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn post_project(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<CreateProjectRequest>,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = Uuid::parse_str(&claims.sub).unwrap();
    let company_id = Uuid::parse_str(&claims.company_id).unwrap();

    match create_project(
        &state.db,
        company_id,
        user_id,
        &body.name,
        body.description.as_deref(),
        &body.color,
    ).await {
        Ok(project) => HttpResponse::Created().json(project),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn join_project(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<crate::models::project::ProjectJoinRequest>,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let user_id = Uuid::parse_str(&claims.sub).unwrap();

    match request_join_project(&state.db, body.project_id, user_id).await {
        Ok(request) => HttpResponse::Created().json(request),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn approve_request(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<Uuid>,
) -> HttpResponse {
    let claims = match extract_claims(&req) {
        Some(c) => c,
        None => return HttpResponse::Unauthorized().finish(),
    };

    // オーナーのみ承認可能
    if claims.role != "owner" && claims.role != "admin" {
        return HttpResponse::Forbidden().finish();
    }

    let approver_id = Uuid::parse_str(&claims.sub).unwrap();
    let request_id = path.into_inner();

    match approve_join_request(&state.db, request_id, approver_id).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({ "status": "approved" })),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}