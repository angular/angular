// g3 requires extra security review for any `unsafe` Rust code; do not introduce `unsafe` without
// explicit human approval.
#![deny(unsafe_code)]
// This crate is embedded via napi/wasm and backs a stdio JSON-RPC sidecar where stdout carries the
// protocol and stderr is noise on every compilation. Debug prints are denied unless explicitly
// allowed with justification.
#![deny(clippy::print_stdout, clippy::print_stderr, clippy::dbg_macro)]
#![cfg_attr(test, allow(clippy::print_stdout, clippy::print_stderr))]
// Unused helpers drift from the live path; delete them rather than keep them alive via tests.
// This misses `pub` items in the `pub mod`s below (treated as API surface); review those by hand.
#![deny(dead_code)]
#![allow(clippy::too_many_arguments)]

mod analyzer;
pub mod compiler;
pub mod evaluator;
pub mod fs;
pub mod physical_fs;
pub mod query;
pub mod resource_loader;
pub use resource_loader::{ResourceResolver, ResourceResolverFs};
pub mod resource_registry;
pub mod tsconfig_resolution;
pub mod types;
pub mod utils;

pub mod test_analyzer;
pub use test_analyzer::{TestAnalyzer, TestAnalyzerOptions};

#[cfg(target_arch = "wasm32")]
pub mod wasm;

pub use analyzer::{
    flatten_class_info, resolve_declaration_async, resolve_to_dts, strip_extension_str,
    ApfImportStrategy, ParsedFileAnalysis, PrefixImportStrategy, ReferenceEmitStrategy,
    WireContext, WireMode,
};
pub use compiler::{AnalysisIterator, Analyzer, SharedQuery, Spawner};
pub use evaluator::cross_file::{
    cross_file_resolve, resolve_specifier, ChaseSymbolError, DeclaredSymbol,
};
pub use physical_fs::{DirEntry, PhysicalFs};
pub use query::{QueryCtx, QueryEngine, QueryKey, QueryValue, ReferenceId};
pub use utils::QueryCache;

pub use types::*;

#[cfg(target_arch = "wasm32")]
pub use wasm::wasm_block_on as block_on;

#[cfg(not(target_arch = "wasm32"))]
pub use futures::executor::block_on;

#[cfg(test)]
mod test_utils;
