// Google Third-Party / internal infrastructure (g3) has strict security standards that require extra
// security review for any `unsafe` Rust code. To maintain compatibility and safety, `unsafe` is disallowed
// by default in this project. AI agents and contributors MUST NOT introduce new `unsafe` usage without
// receiving explicit human approval.
#![deny(unsafe_code)]
// This crate is embedded in the compiler (napi/wasm) and also backs a JSON-RPC sidecar that
// speaks over stdio, where stdout carries the protocol and anything on stderr is noise emitted
// on every compilation. Debug prints must therefore never ship. They are denied crate-wide and
// permitted only at sites annotated with an explicit `#[allow]` plus a justification, the same
// arrangement used for `unsafe_code` above.
#![deny(clippy::print_stdout, clippy::print_stderr, clippy::dbg_macro)]
#![cfg_attr(test, allow(clippy::print_stdout, clippy::print_stderr))]
// A helper with no production callers is either an unused duplicate of a live code path (the
// usual case here — two implementations drift apart and only one is exercised) or a leftover,
// and either way it should be deleted rather than kept alive by its own tests.
//
// Reach: `dead_code` only fires on items unreachable from the crate root, so this covers
// everything private or `pub(crate)`, plus `pub` items under a private `mod` (`analyzer`).
// It does NOT cover `pub` items in the `pub mod`s below — those count as the crate's API
// surface even though nothing but `main.rs` and the napi bindings consume it. Judge those by
// review; the lint will not.
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
