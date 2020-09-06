extern crate wasm_bindgen;
use myna::crypto::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn verify(cert: Box<[u8]>, sig: Box<[u8]>, hash: Box<[u8]>) -> Result<bool, JsValue> {
    let pubkey = extract_pubkey(&cert).map_err(|_| "Certificate is not DER format")?;
    myna::crypto::verify(pubkey, &hash, &sig).map_err(|_| "Failed to verify signature")?;
    Ok(true)
}