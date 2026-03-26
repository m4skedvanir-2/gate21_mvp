use actix_web::{web, App, HttpServer, middleware};
use actix_cors::Cors;
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

mod auth;
mod crypto;
mod routes;
mod db;
mod models;

pub struct AppState {
    pub db: sqlx::PgPool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("✅ Database connected");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::CONTENT_TYPE,
            ])
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(AppState { db: pool.clone() }))
            .wrap(cors)
            .configure(routes::auth::config)
            .configure(routes::projects::config)
            .configure(routes::assets::config)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await?;

    Ok(())
}