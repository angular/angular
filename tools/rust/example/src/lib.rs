use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn say_hello(name: &str) -> String {
    format!("Hello, {}!", name)
}
