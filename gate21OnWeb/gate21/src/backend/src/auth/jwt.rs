use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use anyhow::Result;
use std::env;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,      // user_id
    pub company_id: String,
    pub role: String,
    pub exp: usize,
    pub iat: usize,
}

pub fn generate_access_token(user_id: &str, company_id: &str, role: &str) -> Result<String> {
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let now = Utc::now();
    let exp = now + Duration::hours(1);

    let claims = Claims {
        sub: user_id.to_string(),
        company_id: company_id.to_string(),
        role: role.to_string(),
        exp: exp.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;

    Ok(token)
}

pub fn generate_refresh_token(user_id: &str) -> Result<String> {
    let secret = env::var("JWT_REFRESH_SECRET").expect("JWT_REFRESH_SECRET must be set");
    let now = Utc::now();
    let exp = now + Duration::days(30);

    let claims = Claims {
        sub: user_id.to_string(),
        company_id: String::new(),
        role: String::new(),
        exp: exp.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;

    Ok(token)
}

pub fn verify_token(token: &str) -> Result<Claims> {
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;

    Ok(token_data.claims)
}

pub fn verify_refresh_token(token: &str) -> Result<Claims> {
    let secret = env::var("JWT_REFRESH_SECRET").expect("JWT_REFRESH_SECRET must be set");

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;

    Ok(token_data.claims)
}