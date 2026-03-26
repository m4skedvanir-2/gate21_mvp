use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce, Key,
};
use aes_gcm::aead::rand_core::RngCore;
use anyhow::Result;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

pub struct EncryptedData {
    pub ciphertext: String, // base64
    pub iv: String,         // base64
}

pub fn encrypt(plaintext: &str, key: &[u8; 32]) -> Result<EncryptedData> {
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));

    // ランダムなIV生成（96bit = 12bytes）
    let mut iv_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut iv_bytes);
    let nonce = Nonce::from_slice(&iv_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;

    Ok(EncryptedData {
        ciphertext: BASE64.encode(&ciphertext),
        iv: BASE64.encode(&iv_bytes),
    })
}

pub fn decrypt(ciphertext_b64: &str, iv_b64: &str, key: &[u8; 32]) -> Result<String> {
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));

    let ciphertext = BASE64.decode(ciphertext_b64)
        .map_err(|e| anyhow::anyhow!("Base64 decode failed: {}", e))?;

    let iv_bytes = BASE64.decode(iv_b64)
        .map_err(|e| anyhow::anyhow!("IV decode failed: {}", e))?;

    let nonce = Nonce::from_slice(&iv_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;

    Ok(String::from_utf8(plaintext)?)
}

// DEK生成（32bytes ランダム）
pub fn generate_dek() -> [u8; 32] {
    let mut dek = [0u8; 32];
    OsRng.fill_bytes(&mut dek);
    dek
}