//! Foreign-function resolvers: recognizers for specific call syntax forms with known
//! semantics, mirroring `@angular/compiler-cli`'s `ForeignFunctionResolver` hooks.
//!
//! Two hook points reflect the two ways a foreign callee appears in a single-file world:
//! - [`ForeignFunctionResolver::resolve_import_call`]: the callee is an unresolved import binding
//!   (recognition needs only the import map, not the target file).
//! - [`ForeignFunctionResolver::resolve_function_call`]: the callee resolved to a function-like
//!   declaration in the *current* file — directly, or via the semantic driver's `Call`-hole
//!   resolution running in the target file. Invoked for body-less declarations and as a
//!   fallback when body evaluation was dynamic (upstream ordering).
//!
//! `None` means "not mine" (upstream's `unresolvable` sentinel); the interpreter then proceeds
//! with its default behavior.

use crate::analyzer::ImportedSymbol;
use crate::evaluator::interpreter::EvalInput;
use crate::evaluator::value::{ResolvedValue, ValueReference};
use oxc_ast::ast::{
    ArrowFunctionExpression, CallExpression, Expression, FormalParameters, Function,
    IdentifierReference, Statement, TSQualifiedName, TSTypeAnnotation, TSTypeName,
};
use oxc_span::Span;

/// Resolve callback into the interpreter: evaluates an expression from the call's file in the
/// current scope, marking any resulting `Reference` as synthetic (upstream
/// `visitFfrExpression`).
pub type ResolveExpr<'r, 'a> = &'r mut dyn FnMut(&Expression<'a>) -> ResolvedValue;

/// Resolve callback for type-position names (e.g. the `T` of `ModuleWithProviders<T>`).
pub type ResolveTypeName<'r, 'a> = &'r mut dyn for<'x> FnMut(TypeNameRef<'x, 'a>) -> ResolvedValue;

/// Borrowed view of a type-position name. [`TSTypeName`] and [`oxc_ast::ast::TSTypeQueryExprName`] are
/// distinct oxc enums with the same identifier/qualified shapes; this unifies them for the
/// resolve callback.
#[derive(Clone, Copy)]
pub enum TypeNameRef<'r, 'a> {
    Ident(&'r IdentifierReference<'a>),
    Qualified(&'r TSQualifiedName<'a>),
}

impl<'r, 'a> TypeNameRef<'r, 'a> {
    pub fn from_type_name(name: &'r TSTypeName<'a>) -> Option<Self> {
        match name {
            TSTypeName::IdentifierReference(ident) => Some(TypeNameRef::Ident(ident)),
            TSTypeName::QualifiedName(qualified) => Some(TypeNameRef::Qualified(qualified)),
            TSTypeName::ThisExpression(_) => None,
        }
    }

    /// The rightmost identifier text (`ModuleWithProviders` in `i0.ModuleWithProviders`).
    pub fn rightmost_name(&self) -> &'r str {
        match self {
            TypeNameRef::Ident(ident) => ident.name.as_str(),
            TypeNameRef::Qualified(qualified) => qualified.right.name.as_str(),
        }
    }
}

/// Borrowed view of a function-like AST node, as resolved from a call's callee.
pub enum FunctionTarget<'a> {
    /// Function declarations, function expressions, and method values.
    Function(&'a Function<'a>),
    Arrow(&'a ArrowFunctionExpression<'a>),
}

impl<'a> FunctionTarget<'a> {
    pub fn params(&self) -> &'a FormalParameters<'a> {
        match self {
            FunctionTarget::Function(f) => &f.params,
            FunctionTarget::Arrow(a) => &a.params,
        }
    }

    pub fn return_type(&self) -> Option<&'a TSTypeAnnotation<'a>> {
        match self {
            FunctionTarget::Function(f) => f.return_type.as_deref(),
            FunctionTarget::Arrow(a) => a.return_type.as_deref(),
        }
    }

    pub fn has_body(&self) -> bool {
        match self {
            FunctionTarget::Function(f) => f.body.is_some(),
            FunctionTarget::Arrow(_) => true,
        }
    }

    /// The function's single-`return` expression, if its body is statically evaluable:
    /// - `Some(Some(expr))`: body is exactly `return expr;` (or an arrow expression body)
    /// - `Some(None)`: body is exactly `return;`
    /// - `None`: no body, or a body too complex to evaluate
    pub fn single_return_expression(&self) -> Option<Option<&'a Expression<'a>>> {
        let statements = match self {
            FunctionTarget::Function(f) => &f.body.as_ref()?.statements,
            FunctionTarget::Arrow(a) => {
                if let Some(expr) = a.get_expression() {
                    return Some(Some(expr));
                }
                &a.get_function_body()?.statements
            }
        };
        if statements.len() != 1 {
            return None;
        }
        let Statement::ReturnStatement(ret) = &statements[0] else {
            return None;
        };
        Some(ret.argument.as_ref())
    }
}

/// A recognizer for a specific call form with known semantics.
///
/// Mirrors `@angular/compiler-cli`'s `ForeignFunctionResolver` in
/// `packages/compiler-cli/src/ngtsc/partial_evaluator/src/interface.ts`.
pub trait ForeignFunctionResolver: Send + Sync {
    /// The callee is an unresolved import binding. `target` is the normalized
    /// [`ImportedSymbol`] (local aliases already mapped to original exported names; namespace
    /// member calls like `core.forwardRef(...)` arrive refined to `Named`).
    fn resolve_import_call<'a>(
        &self,
        target: &ImportedSymbol,
        call: &CallExpression<'a>,
        resolve: ResolveExpr<'_, 'a>,
    ) -> Option<ResolvedValue> {
        let _ = (target, call, resolve);
        None
    }

    /// The callee resolved to a declaration in any file (enabling value aliases like `const fref = forwardRef`).
    fn resolve_reference_call<'a>(
        &self,
        callee: &ValueReference,
        call: &CallExpression<'a>,
        resolve: ResolveExpr<'_, 'a>,
    ) -> Option<ResolvedValue> {
        let _ = (callee, call, resolve);
        None
    }

    /// The callee resolved to a function-like declaration in `input`'s file.
    fn resolve_function_call<'a>(
        &self,
        target: &FunctionTarget<'a>,
        callee: &ValueReference,
        call_span: Span,
        args: &[ResolvedValue],
        input: &EvalInput<'a, '_>,
        resolve_type: ResolveTypeName<'_, 'a>,
    ) -> Option<ResolvedValue> {
        let _ = (target, callee, call_span, args, input, resolve_type);
        None
    }
}

/// Strip the `.d.ts`-bundler aliasing suffix (`forwardRef$1` → `forwardRef`), mirroring
/// upstream `isAngularCoreReferenceWithPotentialAliasing`. No regex: split on the last `$` and
/// require an all-digits, non-empty tail.
pub fn strip_dts_alias_suffix(name: &str) -> &str {
    let Some(idx) = name.rfind('$') else {
        return name;
    };
    let tail = &name[idx + 1..];
    if tail.is_empty() || !tail.bytes().all(|b| b.is_ascii_digit()) {
        return name;
    }
    &name[..idx]
}
