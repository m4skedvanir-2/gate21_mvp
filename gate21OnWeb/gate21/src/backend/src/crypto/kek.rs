use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce, Key,
};
use aes_gcm::aead::rand_core::{RngCore, OsRng};
use anyhow::Result;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use std::env;

// KEKは環境変数から取得
fn get_kek() -> Result<[u8; 32]> {
    let kek_b64 = env::var("KEK_SECRET").expect("KEK_SECRET must be set");
    let kek_bytes = BASE64.decode(&kek_b64)
        .map_err(|e| anyhow::anyhow!("KEK decode failed: {}", e))?;

    let mut kek = [0u8; 32];
    kek.copy_from_slice(&kek_bytes[..32]);
    Ok(kek)
}

// DEKをKEKで暗号化
pub fn encrypt_dek(dek: &[u8; 32]) -> Result<(String, String)> {
    let kek = get_kek()?;
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&kek));

    let mut iv_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut iv_bytes);
    let nonce = Nonce::from_slice(&iv_bytes);

    let encrypted_dek = cipher
        .encrypt(nonce, dek.as_ref())
        .map_err(|e| anyhow::anyhow!("DEK encryption failed: {}", e))?;

    Ok((
        BASE64.encode(&encrypted_dek),
        BASE64.encode(&iv_bytes),
    ))
}

// DEKをKEKで復号
pub fn decrypt_dek(encrypted_dek_b64: &str, iv_b64: &str) -> Result<[u8; 32]> {
    let kek = get_kek()?;
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&kek));

    let encrypted_dek = BASE64.decode(encrypted_dek_b64)
        .map_err(|e| anyhow::anyhow!("Base64 decode failed: {}", e))?;

    let iv_bytes = BASE64.decode(iv_b64)
        .map_err(|e| anyhow::anyhow!("IV decode failed: {}", e))?;

    let nonce = Nonce::from_slice(&iv_bytes);

    let dek_bytes = cipher
        .decrypt(nonce, encrypted_dek.as_ref())
        .map_err(|e| anyhow::anyhow!("DEK decryption failed: {}", e))?;

    let mut dek = [0u8; 32];
    dek.copy_from_slice(&dek_bytes[..32]);
    Ok(dek)
}