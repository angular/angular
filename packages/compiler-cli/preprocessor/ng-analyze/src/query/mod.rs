//! Unified query layer.
//!
//! Every question the analyzer answers is modeled as a [`QueryKey`]; the [`QueryEngine`] caches and
//! self-drives each query (the body is spawned onto the executor the moment the key is first
//! requested, so `join_all` over several queries fans out across pool threads). Queries may request
//! other queries, forming an acyclic dependency graph.

pub mod context;
pub mod engine;
pub mod file_id;
pub mod keys;
pub mod reference_id;
mod scope;
pub(crate) use scope::propagate_owning_reference_validated;
pub(crate) use scope::resolve_reference_async;

pub use context::QueryContext;
pub use engine::QueryEngine;
pub type QueryCtx<Fs> = QueryContext<Fs>;
pub use file_id::{FileId, FileIdInterner};
pub use keys::{QueryKey, QueryValue};
pub use reference_id::ReferenceId;
