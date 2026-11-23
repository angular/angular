#[allow(dead_code)]
#[path = "../types/error_code.rs"]
mod error_code;

use std::io::{self, Write};

fn main() -> io::Result<()> {
    io::stdout().write_all(error_code::ErrorCode::render_ts().as_bytes())
}
