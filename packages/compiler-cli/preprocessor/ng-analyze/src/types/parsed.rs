#![allow(unsafe_code)]

use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_semantic::Semantic;
use std::path::PathBuf;

pub struct ParsedFileOwner {
    pub file_path: PathBuf,
    pub source_text: String,
    pub allocator: Allocator,
}

pub struct ParsedFileDependent<'a> {
    pub program: &'a Program<'a>,
    pub module_record: oxc_syntax::module_record::ModuleRecord<'a>,
    pub semantic: Semantic<'a>,
    pub errors: Vec<String>,
}

self_cell::self_cell! {
    pub struct ParsedFile {
        owner: ParsedFileOwner,
        #[covariant]
        dependent: ParsedFileDependent,
    }
}

// SAFETY: `ParsedFile` encapsulates both the `Allocator` arena and all references (`Program`,
// `Semantic`) allocated within that arena. When `ParsedFile` is moved across thread boundaries,
// the entire self-contained arena and object graph move together atomically.
//
// NOTE: `ParsedFile` deliberately does NOT implement `Sync`. Oxc AST nodes and Semantic models
// contain internal `Cell`s and interior mutability that are mutated through shared `&` references.
// Allowing concurrent shared access across threads via `Sync` would trigger undefined behavior.
unsafe impl Send for ParsedFile {}
