use wasm_bindgen::prelude::*;
use ed25519_compact::{PublicKey,Signature};


// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


// This is like the `main` function, except for JavaScript.
#[wasm_bindgen()]
pub fn verify(key: &[u8], sig: &[u8], msg: &[u8]) -> bool {
    let pk = PublicKey::from_slice(key).expect("Error creating key");
    return 
        key.len() == 32 &&
        sig.len() == 64 &&
        pk.verify(msg, &Signature::from_slice(sig).expect("Error unwrapping sig")).is_ok()
    ;
}