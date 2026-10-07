//! Partial static evaluation of decorator metadata expressions.
//!
//! Mirror of `@angular/compiler-cli`'s `ngtsc/partial_evaluator`, split for the hybrid
//! compiler's two analysis modes:
//!
//! - **Syntax mode** ([`EvalMode::Syntax`], used inside `AnalyzeFileSyntax`): the sync
//!   [`interpreter`] evaluates within one file; anything that would cross a file boundary
//!   produces a structured [`ResolvedValue::Incomplete`] hole capturing the reference it could
//!   not chase.
//! - **Semantic mode** ([`EvalMode::Semantic`], used inside `AnalyzeFileSemantic`): an async
//!   driver resolves holes through the query engine (cached `AnalyzeFileSyntax` symbol tables
//!   for re-export chasing, the target file's own `ParseFile` arena for evaluating its
//!   declarations) and re-runs the interpreter with a [`ResolvedEnv`] until the value is
//!   complete or genuinely [`ResolvedValue::Dynamic`]. Semantic-mode results never contain
//!   `Incomplete`.
//!
//! Special call forms with known semantics (`forwardRef(() => X)`, `Module.forRoot(...)` with
//! a `ModuleWithProviders<T>` return type) are handled by [`foreign`] recognizers.

pub mod cross_file;
pub mod diagnostics;
pub mod driver;
pub mod foreign;
pub mod interpreter;
pub mod resolved;
pub mod value;

pub use cross_file::{cross_file_resolve, resolve_specifier, ChaseSymbolError, DeclaredSymbol};

#[cfg(test)]
mod tests;

// Re-export the import types that appear in this module's public surface (the `analyzer`
// module itself is crate-private).
pub use crate::analyzer::{ImportKind, ImportedSymbol};
pub use crate::types::analysis::Reference;
pub use crate::types::metadata::ReferenceMetadata;
pub use driver::evaluate_value_completely;
pub use foreign::{
    strip_dts_alias_suffix, ForeignFunctionResolver, FunctionTarget, ResolveExpr, ResolveTypeName,
    TypeNameRef,
};
pub use interpreter::{
    evaluate_expression, evaluate_function_call, evaluate_static_member, evaluate_type, EvalInput,
    EvalMode,
};
pub use resolved::{
    is_enum_member_value, ChangeDetectionStrategyValue, ComponentStyles, ComponentStylesError,
    ExportAsNames, FromResolved, HostMetadata, HostMetadataValue, InlineStyles, QuerySelectors,
    Resolved, StillIncomplete, StringList, UnresolvedCause, ViewEncapsulationValue,
};
pub use value::{
    collect_holes, demote_incomplete_to_dynamic, fingerprint, fingerprint_args, is_truthy,
    js_number_to_string, substitute, DeclKind, DynamicReason, DynamicValue, EnumValue, HoleKey,
    IncompleteDep, IncompleteValue, KnownFn, ResolvedEnv, ResolvedValue, SyntheticValue,
    UnresolvedReference, ValueMap, ValueReference,
};
