//! Shared parsing utility functions for extracting values from AST expressions.

use oxc_ast::ast::{
    Argument, BindingPattern, Decorator, Expression, IdentifierReference, Program, PropertyKey,
    Statement, TSQualifiedName, TSTypeName,
};
use oxc_ast::AstKind;
use oxc_semantic::{Scoping, Semantic, SymbolFlags};
use oxc_span::GetSpan;
use oxc_syntax::module_record::{ExportEntry, ExportExportName, ModuleRecord};
use oxc_syntax::operator::BinaryOperator;
use oxc_syntax::scope::ScopeId;

/// Recursively resolves a local identifier reference to its assigned expression.
/// Returns the original expression if it cannot be resolved or is imported from another file.
pub fn resolve_local_expression<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
) -> &'a Expression<'a> {
    let Expression::Identifier(ident_ref) = expr else {
        return expr;
    };
    let Some(ref_id) = ident_ref.reference_id.get() else {
        return expr;
    };
    let scoping = semantic.scoping();
    let reference = scoping.get_reference(ref_id);
    let Some(symbol_id) = reference.symbol_id() else {
        return expr;
    };

    // Do not resolve if imported from an external module
    if scoping
        .symbol_flags(symbol_id)
        .contains(SymbolFlags::Import)
    {
        return expr;
    }

    let decl_node = semantic.symbol_declaration(symbol_id);
    let AstKind::VariableDeclarator(vd) = decl_node.kind() else {
        return expr;
    };

    // A pattern binds parts of the initializer, not the whole of it: `const [first] = STYLES`
    // must not resolve `first` to the entire array. Only the partial evaluator walks patterns.
    let BindingPattern::BindingIdentifier(_) = &vd.id else {
        return expr;
    };

    if let Some(init_expr) = &vd.init {
        // Recursively resolve in case of chained constants (e.g. const A = B; const B = 'my-template';)
        resolve_local_expression(init_expr, semantic)
    } else {
        expr
    }
}

pub fn expression_to_string(expr: &Expression) -> Option<String> {
    match expr.get_inner_expression() {
        Expression::Identifier(ident) => Some(ident.name.to_string()),
        Expression::StaticMemberExpression(member) => {
            let obj = expression_to_string(&member.object)?;
            Some(format!("{}.{}", obj, member.property.name))
        }
        _ => None,
    }
}

pub fn extract_decorator_name(decorator: &Decorator<'_>) -> Option<String> {
    let expr = match decorator.expression.get_inner_expression() {
        Expression::CallExpression(call) => call.callee.get_inner_expression(),
        other => other,
    };
    expression_to_string(expr)
}

/// The span to delete when stripping a decorator: the decorator plus any whitespace after it.
///
/// Deleting only the decorator leaves a blank line between the declaration and a JSDoc above
/// it. TypeScript then treats the JSDoc as detached and may emit it elsewhere (e.g. in a lowered
/// constructor), where tsickle leaves `@param` untyped and Closure rejects it.
pub fn decorator_removal_span(decorator: &Decorator<'_>, source_text: &str) -> oxc_span::Span {
    use oxc_syntax::identifier::is_white_space_single_line;
    use oxc_syntax::line_terminator::is_line_terminator;

    let end = decorator.span.end as usize;
    let whitespace_len: usize = source_text[end..]
        .chars()
        .take_while(|&c| is_white_space_single_line(c) || is_line_terminator(c))
        .map(char::len_utf8)
        .sum();
    oxc_span::Span::new(decorator.span.start, (end + whitespace_len) as u32)
}

/// Extract arguments from a decorator.
pub fn get_decorator_args<'a, 'b>(
    decorator: &'a Decorator<'b>,
) -> Option<&'a oxc_allocator::Vec<'a, Argument<'b>>> {
    match &decorator.expression {
        Expression::CallExpression(call) => Some(&call.arguments),
        _ => None,
    }
}

/// Extract a string value from a PropertyKey expression.
pub fn extract_property_key<'a>(key: &'a PropertyKey<'a>) -> Option<std::borrow::Cow<'a, str>> {
    if let Some(name) = key.static_name() {
        return Some(name);
    }
    match key {
        PropertyKey::Identifier(ident) => Some(std::borrow::Cow::Borrowed(ident.name.as_str())),
        _ => None,
    }
}

/// Extract a literal string value from a StringLiteral or no-substitution TemplateLiteral expression
/// without performing partial evaluation.
pub fn extract_literal_string(expr: &Expression<'_>) -> Option<String> {
    match expr {
        Expression::StringLiteral(s) => Some(s.value.to_string()),
        Expression::TemplateLiteral(t) if t.expressions.is_empty() => {
            let q = t.quasis.first()?;
            Some(
                q.value
                    .cooked
                    .as_deref()
                    .unwrap_or(q.value.raw.as_str())
                    .to_string(),
            )
        }
        _ => None,
    }
}

/// Extract a string value from an already resolved expression.
pub fn extract_string_resolved<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
) -> Option<String> {
    match expr {
        Expression::StringLiteral(s) => Some(s.value.to_string()),
        Expression::NumericLiteral(n) => Some(n.value.to_string()),
        Expression::BooleanLiteral(b) => Some(b.value.to_string()),
        Expression::NullLiteral(_) => Some("null".to_string()),
        Expression::TemplateLiteral(t) => {
            // Constant-fold the template literal: interleave the cooked quasis with
            // each interpolated expression, requiring every `${...}` to itself
            // resolve to a constant string. Roughly mirrors ngtsc's static evaluation
            // of non-literal inline templates.
            // https://github.com/angular/angular/blob/0e16bb7/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.ts#L67
            let mut result = String::new();
            for (i, quasi) in t.quasis.iter().enumerate() {
                let cooked = quasi
                    .value
                    .cooked
                    .as_deref()
                    .unwrap_or(quasi.value.raw.as_str());
                result.push_str(cooked);
                if let Some(sub) = t.expressions.get(i) {
                    result.push_str(&extract_string(sub, semantic)?);
                }
            }
            Some(result)
        }
        // Constant-fold string concatenation (`'a' + greeting + 'c'`).
        Expression::BinaryExpression(b) if matches!(b.operator, BinaryOperator::Addition) => {
            let left = extract_string(&b.left, semantic)?;
            let right = extract_string(&b.right, semantic)?;
            Some(left + &right)
        }
        _ => None,
    }
}

/// Extract a string value from an expression.
pub fn extract_string<'a>(expr: &'a Expression<'a>, semantic: &Semantic<'a>) -> Option<String> {
    let resolved = resolve_local_expression(expr, semantic);
    extract_string_resolved(resolved.get_inner_expression(), semantic)
}

/// Extract a boolean value from a BooleanLiteral expression.
pub fn extract_bool<'a>(expr: &'a Expression<'a>, semantic: &Semantic<'a>) -> Option<bool> {
    let resolved = resolve_local_expression(expr, semantic);
    let expr = resolved.get_inner_expression();
    if let Expression::BooleanLiteral(b) = expr {
        Some(b.value)
    } else {
        None
    }
}

/// Extract an array of identifiers or member expressions as strings for schemas
pub fn extract_schemas<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
) -> Option<Vec<String>> {
    let resolved = resolve_local_expression(expr, semantic);
    let expr = resolved.get_inner_expression();
    if let Expression::ArrayExpression(arr) = expr {
        let mut schemas = Vec::new();
        for elem in &arr.elements {
            match elem {
                oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                    let resolved_spread = resolve_local_expression(&spread.argument, semantic);
                    let inner_expr = resolved_spread.get_inner_expression();
                    if let Some(nested) = extract_schemas(inner_expr, semantic) {
                        schemas.extend(nested);
                    }
                }
                oxc_ast::ast::ArrayExpressionElement::Elision(_) => {}
                _ => {
                    if let Some(expr) = elem.as_expression() {
                        if let Some(name) = extract_schema_name(expr, semantic) {
                            schemas.push(name);
                        }
                    }
                }
            }
        }
        Some(schemas)
    } else {
        None
    }
}

use crate::utils::ANGULAR_CORE;

/// The import binding an identifier resolves to, as `(module specifier, imported name)`.
///
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/reflection/src/typescript.ts#L131-L143
pub(crate) fn import_of_identifier<'a>(
    ident: &oxc_ast::ast::IdentifierReference<'a>,
    semantic: &Semantic<'a>,
) -> Option<(&'a str, Option<&'a str>)> {
    let ref_id = ident.reference_id.get()?;
    let scoping = semantic.scoping();
    let symbol_id = scoping.get_reference(ref_id).symbol_id()?;
    if !scoping
        .symbol_flags(symbol_id)
        .contains(SymbolFlags::Import)
    {
        return None;
    }

    let decl_node = semantic.symbol_declaration(symbol_id);
    let imported_name = match decl_node.kind() {
        // `import {forwardRef}` / `import {forwardRef as fwd}`: `imported` is the name the
        // module exports, which is what upstream compares against.
        AstKind::ImportSpecifier(spec) => Some(spec.imported.name().as_str()),
        // `import * as core`: the name comes from the member access at the use site.
        AstKind::ImportNamespaceSpecifier(_) => None,
        // Default and `import x = require(...)` bindings. Upstream's `getExportedName` falls
        // back to the local name here, so it would accept a default import; `@angular/core`
        // has no default export, so the difference is unreachable and not worth mirroring.
        _ => return None,
    };

    let parent = semantic.nodes().parent_node(decl_node.id());
    let AstKind::ImportDeclaration(decl) = parent.kind() else {
        return None;
    };
    Some((decl.source.value.as_str(), imported_name))
}

/// Whether a call's callee is `@angular/core`'s `forwardRef`, reached through an import
/// binding.
///
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L224-L238
///
/// The callee identifier — or, for `core.forwardRef(...)`, the accessed property — must
/// resolve to an import of `forwardRef` from `@angular/core`.
///
/// Note this deliberately does NOT follow local aliases such as
/// `const fref = forwardRef;`. Upstream's syntactic helper does not either, because
/// `getImportOfIdentifier` returns `null` for a variable declaration; the alias-resolving
/// path is the partial evaluator's `createForwardRefResolver`, which the evaluator side
/// (`evaluator/foreign.rs`) already mirrors.
fn is_angular_forward_ref_callee<'a>(callee: &Expression<'a>, semantic: &Semantic<'a>) -> bool {
    // Upstream: `ts.isPropertyAccessExpression(node.expression) ? node.expression.name : ...`,
    // followed by `ts.isIdentifier(fn)`. Note it never unwraps the *callee* — `unwrapExpression`
    // is applied to the call node and to the argument only — so `(forwardRef as any)(...)` and
    // `(forwardRef)(...)` are rejected upstream. Match on the callee as written.
    match callee {
        Expression::Identifier(ident) => {
            matches!(
                import_of_identifier(ident, semantic),
                Some((ANGULAR_CORE, Some("forwardRef")))
            )
        }
        Expression::StaticMemberExpression(member) => {
            if member.property.name.as_str() != "forwardRef" {
                return false;
            }
            // Upstream's `getFarLeftIdentifier` walks nested property accesses only, so a
            // parenthesized or cast object (`(core as any).forwardRef`) does not resolve.
            // TODO(parity): that walk also accepts a chain (`core.ns.forwardRef(...)`);
            // we only handle a direct member access off the namespace import.
            let Expression::Identifier(object) = &member.object else {
                return false;
            };
            matches!(
                import_of_identifier(object, semantic),
                Some((ANGULAR_CORE, None))
            )
        }
        _ => false,
    }
}

/// Strip what upstream's `unwrapExpression` strips: parentheses and `as` casts.
///
/// Narrower than oxc's [`Expression::get_inner_expression`], which also strips `x!`, `<T>x`,
/// `satisfies` and `f<T>`. Upstream keeps those, so `@ContentChild(<any>forwardRef(() => Dep))`
/// queries `forwardRef(() => Dep)` rather than `Dep`.
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L176-L181
pub fn unwrap_expression<'r, 'a>(expr: &'r Expression<'a>) -> &'r Expression<'a> {
    let mut expr = expr;
    loop {
        expr = match expr {
            Expression::ParenthesizedExpression(paren) => &paren.expression,
            Expression::TSAsExpression(as_expr) => &as_expr.expression,
            _ => return expr,
        };
    }
}

/// Strip what the partial evaluator sees through: parentheses, `as` casts and non-null
/// assertions — one wrapper wider than [`unwrap_expression`]. `<T>x`, `x satisfies T` and `f<T>`
/// reach `DynamicValue.fromUnsupportedSyntax` upstream instead.
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.ts#L142-L153
///
/// TODO(parity): our own `visit_expression` opens with `get_inner_expression`, so it sees through
/// all six. `imports: [<any>forwardRef(() => Dep)]` resolves for us where ngc raises NG1010
/// (verified). Narrowing affects every evaluated expression, so it is its own change.
fn unwrap_evaluated_expression<'r, 'a>(expr: &'r Expression<'a>) -> &'r Expression<'a> {
    let mut expr = expr;
    loop {
        expr = match expr {
            Expression::ParenthesizedExpression(paren) => &paren.expression,
            Expression::TSAsExpression(as_expr) => &as_expr.expression,
            Expression::TSNonNullExpression(non_null) => &non_null.expression,
            _ => return expr,
        };
    }
}

/// Unwrap `forwardRef(() => Target)` or `forwardRef(function() { return Target; })` to `Target`.
///
/// Mirrors upstream's *syntactic* `tryUnwrapForwardRef`. Use [`unwrap_forward_ref_evaluated`] for
/// the positions upstream resolves with the partial evaluator instead.
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L216-L243
pub fn unwrap_forward_ref<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
) -> Option<&'a Expression<'a>> {
    unwrap_forward_ref_call(unwrap_expression(expr), semantic)
}

/// [`unwrap_forward_ref`] for the positions upstream resolves through the partial evaluator plus
/// `createForwardRefResolver` — `imports` and `hostDirectives`. Only the wrapper set differs, so
/// `imports: [forwardRef(() => Dep)!]` resolves here but not syntactically.
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L253-L268
///
/// TODO(parity): the callee is still matched as written. Upstream resolves it through the
/// reference graph, so `(forwardRef)(() => Dep)`, `(forwardRef as any)(() => Dep)` and
/// `const fref = forwardRef;` all resolve there and not here (verified against ngc).
/// `evaluator/foreign.rs`'s `ForwardRefFn` already handles aliasing.
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L128-L137
pub fn unwrap_forward_ref_evaluated<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
) -> Option<&'a Expression<'a>> {
    unwrap_forward_ref_call(unwrap_evaluated_expression(expr), semantic)
}

/// The shared body of both entry points: everything after the outer wrappers are stripped.
fn unwrap_forward_ref_call<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
) -> Option<&'a Expression<'a>> {
    let Expression::CallExpression(call) = expr else {
        return None;
    };

    if call.arguments.len() != 1 {
        return None;
    }

    // Upstream expands the argument before consulting the reflector, so a call that is not
    // shaped like `forwardRef(() => X)` short-circuits before any symbol resolution.
    let expanded = expand_forward_ref(call.arguments.first()?.as_expression()?)?;
    if !is_angular_forward_ref_callee(&call.callee, semantic) {
        return None;
    }
    Some(expanded)
}

/// Unwrap `() => X`, `() => { return X; }`, or `function () { return X; }` to `X`.
///
/// Upstream applies `unwrapExpression` to the argument, so `forwardRef((() => X))` expands while
/// `forwardRef((() => X)!)` does not. Upstream shares one `expandForwardRef` between both
/// resolvers; this is the single copy both of our paths use, including
/// `evaluator::foreign::ForwardRefFn`, which used to disagree here.
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L183-L205
pub(crate) fn expand_forward_ref<'r, 'a>(arg: &'r Expression<'a>) -> Option<&'r Expression<'a>> {
    match unwrap_expression(arg) {
        Expression::ArrowFunctionExpression(arrow) => {
            if let Some(expr) = arrow.get_expression() {
                return Some(expr);
            }
            single_return_argument(&arrow.get_function_body()?.statements)
        }
        Expression::FunctionExpression(func) => {
            single_return_argument(&func.body.as_ref()?.statements)
        }
        _ => None,
    }
}

/// The argument of a lone `return <expr>;` statement. Upstream requires exactly one statement, so
/// `() => { return X; log(); }` is rejected rather than expanded.
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L192-L200
fn single_return_argument<'r, 'a>(
    statements: &'r [oxc_ast::ast::Statement<'a>],
) -> Option<&'r Expression<'a>> {
    let [oxc_ast::ast::Statement::ReturnStatement(ret_stmt)] = statements else {
        return None;
    };
    ret_stmt.argument.as_ref()
}

/// Helper to extract the actual schema name from an expression (Identifier or MemberExpression)
fn extract_schema_name<'a>(expr: &'a Expression<'a>, semantic: &Semantic<'a>) -> Option<String> {
    let resolved = resolve_local_expression(expr, semantic);
    let expr = resolved.get_inner_expression();
    match expr {
        Expression::Identifier(ident) => Some(ident.name.to_string()),
        Expression::StaticMemberExpression(member) => Some(member.property.name.to_string()),
        _ => None,
    }
}

fn collect_type_name_parts<'t, 'a>(
    type_name: &'t TSTypeName<'a>,
    path: &mut Vec<&'t str>,
) -> Option<&'t oxc_ast::ast::IdentifierReference<'a>> {
    match type_name {
        TSTypeName::IdentifierReference(ident) => Some(ident),
        TSTypeName::QualifiedName(qn) => {
            let leftmost = collect_type_name_parts(&qn.left, path)?;
            path.push(qn.right.name.as_str());
            Some(leftmost)
        }
        _ => None,
    }
}

fn collect_type_query_parts<'t, 'a>(
    expr_name: &'t oxc_ast::ast::TSTypeQueryExprName<'a>,
    path: &mut Vec<&'t str>,
) -> Option<&'t oxc_ast::ast::IdentifierReference<'a>> {
    match expr_name {
        oxc_ast::ast::TSTypeQueryExprName::IdentifierReference(ident) => Some(ident),
        oxc_ast::ast::TSTypeQueryExprName::QualifiedName(qn) => {
            let leftmost = collect_type_name_parts(&qn.left, path)?;
            path.push(qn.right.name.as_str());
            Some(leftmost)
        }
        _ => None,
    }
}

use crate::analyzer::class_data::TypeRefData;
use crate::analyzer::imports::{ImportKind, ImportedSymbol};
use oxc_ast_visit::Visit;
use std::collections::{HashMap, HashSet};

struct TypeRefCollector<'a, 'b> {
    semantic: &'b Semantic<'a>,
    import_map: &'b HashMap<String, ImportedSymbol>,
    local_exported_names: &'b HashSet<&'a str>,
    type_param_names: &'b HashSet<&'a str>,
    type_refs: Vec<TypeRefData>,
    pub has_non_exported: bool,
}

impl<'a, 'b> TypeRefCollector<'a, 'b> {
    fn record_reference(
        &mut self,
        leftmost: &oxc_ast::ast::IdentifierReference<'_>,
        path: &[&str],
        span: oxc_span::Span,
    ) {
        let name = leftmost.name.as_str();

        if self.type_param_names.contains(name) {
            return;
        }

        let scoping = self.semantic.scoping();
        let Some(ref_id) = leftmost.reference_id.get() else {
            return;
        };
        let reference = scoping.get_reference(ref_id);
        let Some(symbol_id) = reference.symbol_id() else {
            return;
        };
        let flags = scoping.symbol_flags(symbol_id);

        if flags.contains(SymbolFlags::TypeParameter) {
            return;
        }

        if self.import_map.contains_key(name)
            || flags.contains(SymbolFlags::Import)
            || flags.contains(SymbolFlags::TypeImport)
        {
            let symbol_name = scoping.symbol_name(symbol_id);
            if let Some(imported) = self
                .import_map
                .get(symbol_name)
                .or_else(|| self.import_map.get(name))
            {
                let (full_name, symbol) = if path.is_empty() {
                    let symbol = match &imported.kind {
                        ImportKind::Named(orig_name) => orig_name.clone(),
                        ImportKind::Default => "default".to_string(),
                        ImportKind::Namespace => name.to_string(),
                    };
                    (name.to_string(), symbol)
                } else {
                    let path_str = path.join(".");
                    let symbol = match &imported.kind {
                        ImportKind::Namespace => path_str.clone(),
                        ImportKind::Named(orig_name) => format!("{}.{}", orig_name, path_str),
                        ImportKind::Default => format!("default.{}", path_str),
                    };
                    (format!("{}.{}", name, path_str), symbol)
                };
                self.type_refs.push(TypeRefData {
                    span,
                    name: full_name,
                    module_specifier: imported.source.clone(),
                    symbol,
                });
                return;
            }
        }

        if self.local_exported_names.contains(name) {
            let full_name = if path.is_empty() {
                name.to_string()
            } else {
                format!("{}.{}", name, path.join("."))
            };
            self.type_refs.push(TypeRefData {
                span,
                name: full_name.clone(),
                module_specifier: String::new(),
                symbol: full_name,
            });
            return;
        }

        self.has_non_exported = true;
    }
}

impl<'a, 'b> Visit<'a> for TypeRefCollector<'a, 'b> {
    fn visit_ts_type_reference(&mut self, type_ref: &oxc_ast::ast::TSTypeReference<'a>) {
        let mut path = Vec::new();
        if let Some(leftmost) = collect_type_name_parts(&type_ref.type_name, &mut path) {
            self.record_reference(leftmost, &path, type_ref.type_name.span());
        }
        oxc_ast_visit::walk::walk_ts_type_reference(self, type_ref);
    }

    fn visit_ts_type_query(&mut self, type_query: &oxc_ast::ast::TSTypeQuery<'a>) {
        let mut path = Vec::new();
        if let Some(leftmost) = collect_type_query_parts(&type_query.expr_name, &mut path) {
            self.record_reference(leftmost, &path, type_query.expr_name.span());
        }
        oxc_ast_visit::walk::walk_ts_type_query(self, type_query);
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ExtractedTypeParameters {
    pub params: Vec<crate::analyzer::class_data::TypeParameterData>,
    pub has_non_exported_bounds: bool,
}

/// Extract type parameters from a class declaration or signature.
pub fn extract_type_parameters<'a>(
    type_parameters: &Option<oxc_allocator::Box<oxc_ast::ast::TSTypeParameterDeclaration<'a>>>,
    semantic: &Semantic<'a>,
    import_map: Option<&HashMap<String, ImportedSymbol>>,
    local_exported_names: Option<&HashSet<&str>>,
) -> Option<ExtractedTypeParameters> {
    let tp = type_parameters.as_ref()?;
    let empty_set = HashSet::new();
    let empty_map = HashMap::new();

    let type_param_names: HashSet<&'a str> =
        tp.params.iter().map(|p| p.name.name.as_str()).collect();

    let mut collector = TypeRefCollector {
        semantic,
        import_map: import_map.unwrap_or(&empty_map),
        local_exported_names: local_exported_names.unwrap_or(&empty_set),
        type_param_names: &type_param_names,
        type_refs: Vec::new(),
        has_non_exported: false,
    };

    let params = tp
        .params
        .iter()
        .map(|p| {
            let name = p.name.name.to_string();

            let end = if let Some(constraint) = &p.constraint {
                constraint.span().end
            } else {
                p.name.span.end
            };

            let span_base = oxc_span::Span::new(p.span.start, end);
            let span = if p.default.is_some() {
                p.span
            } else {
                span_base
            };
            let span_with_default = span;

            let mut type_refs = Vec::new();
            if import_map.is_some() {
                if let Some(constraint) = &p.constraint {
                    collector.visit_ts_type(constraint);
                }
                if let Some(default) = &p.default {
                    collector.visit_ts_type(default);
                }
                let mut seen = HashSet::new();
                for r in collector.type_refs.drain(..) {
                    if seen.insert(r.clone()) {
                        type_refs.push(r);
                    }
                }
            }

            crate::analyzer::class_data::TypeParameterData {
                name,
                span,
                span_with_default,
                has_default: p.default.is_some(),
                type_refs,
            }
        })
        .collect();

    Some(ExtractedTypeParameters {
        params,
        has_non_exported_bounds: collector.has_non_exported,
    })
}

/// Extract a provider span, detecting and unwrapping forwardRef if present.
pub fn extract_provider_span_with_forward_ref<'a>(
    expr: &'a oxc_ast::ast::Expression<'a>,
    semantic: &Semantic<'a>,
) -> crate::analyzer::class_data::ProviderFieldData {
    let mut is_forward_ref = false;
    let target_expr = if let Some(unwrapped) = unwrap_forward_ref(expr, semantic) {
        is_forward_ref = true;
        unwrapped
    } else {
        expr
    };

    let target_expr = target_expr.get_inner_expression();
    let base_expr = match target_expr {
        oxc_ast::ast::Expression::TSInstantiationExpression(inst) => &inst.expression,
        _ => target_expr,
    };

    crate::analyzer::class_data::ProviderFieldData {
        span: base_expr.span(),
        is_forward_ref,
    }
}

/// Extract `hasNgTemplateContextGuard`, `ngTemplateGuards`, and `hasNgFieldDirective` from a class body.
pub fn extract_template_guards_and_field_directive(
    class: &oxc_ast::ast::Class<'_>,
) -> (bool, Vec<crate::TemplateGuardMetadata>, bool) {
    let mut has_ng_template_context_guard = false;
    let mut ng_template_guards = Vec::new();
    let mut has_ng_field_directive = false;

    for member in &class.body.body {
        match member {
            oxc_ast::ast::ClassElement::MethodDefinition(method) => {
                if !method.r#static {
                    continue;
                }
                let Some(property_name) = extract_property_key(&method.key) else {
                    continue;
                };

                if property_name == "ngTemplateContextGuard" {
                    has_ng_template_context_guard = true;
                } else if let Some(input_name) = property_name.strip_prefix("ngTemplateGuard_") {
                    ng_template_guards.push(crate::TemplateGuardMetadata {
                        input_name: input_name.to_string(),
                        type_: "invocation".to_string(),
                    });
                }
            }
            oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
                let is_field_directive = matches!(
                    prop.key.as_expression(),
                    Some(oxc_ast::ast::Expression::Identifier(ident)) if ident.name == "ɵNgFieldDirective"
                );
                if is_field_directive {
                    has_ng_field_directive = true;
                    continue;
                }

                if !prop.r#static {
                    continue;
                }

                let Some(property_name) = extract_property_key(&prop.key) else {
                    continue;
                };

                let Some(input_name) = property_name.strip_prefix("ngTemplateGuard_") else {
                    continue;
                };

                let Some(type_ann) = &prop.type_annotation else {
                    continue;
                };
                let oxc_ast::ast::TSType::TSLiteralType(literal) = &type_ann.type_annotation else {
                    continue;
                };
                let oxc_ast::ast::TSLiteral::StringLiteral(s) = &literal.literal else {
                    continue;
                };

                if s.value == "binding" {
                    ng_template_guards.push(crate::TemplateGuardMetadata {
                        input_name: input_name.to_string(),
                        type_: "binding".to_string(),
                    });
                }
            }
            _ => {}
        }
    }

    (
        has_ng_template_context_guard,
        ng_template_guards,
        has_ng_field_directive,
    )
}

fn is_local_type_export(entry: &ExportEntry<'_>, scoping: &Scoping, root_scope: ScopeId) -> bool {
    let Some(local_name) = entry.local_name.name() else {
        return false;
    };
    let Some(symbol_id) = scoping.get_binding(root_scope, local_name.into()) else {
        return false;
    };
    let flags = scoping.symbol_flags(symbol_id);
    (flags.contains(oxc_syntax::symbol::SymbolFlags::Interface)
        || flags.contains(oxc_syntax::symbol::SymbolFlags::TypeAlias)
        || flags.contains(oxc_syntax::symbol::SymbolFlags::TypeImport))
        && !flags.intersects(oxc_syntax::symbol::SymbolFlags::Value)
}

pub fn get_local_exported_names<'a>(module_record: &'a ModuleRecord<'a>) -> HashSet<&'a str> {
    let mut local_exported_names = HashSet::new();
    for entry in &module_record.local_export_entries {
        let Some(local_name) = entry.local_name.name() else {
            continue;
        };
        let ExportExportName::Name(ref export_name) = entry.export_name else {
            continue;
        };
        // Only consider same-name exports, ignoring aliases and defaults
        if local_name == export_name.name {
            local_exported_names.insert(local_name.as_str());
        }
    }
    local_exported_names
}

/// Whether this file binds the local name `local_name` through `import type` (including the inline
/// `import { type X }` form). Such a binding has no runtime value to hand on, even when it goes on
/// to resolve to a class: `import type { X } from './x'; export { X };` re-exports a class that
/// importers still cannot name as a value.
pub fn binds_type_only(module_record: &ModuleRecord<'_>, local_name: &str) -> bool {
    module_record
        .import_entries
        .iter()
        .any(|entry| entry.is_type && entry.local_name.name.as_str() == local_name)
}

/// Whether this file exports `exported_name` in type position only, through `export type { … }`
/// or `export { type … }`, with or without a `from` clause.
///
/// The name is matched against what the file *exports*, so a rename is judged by its outer name:
/// `class X {} export { X as Y }; export type { X };` exports `Y` as a value and `X` as a type.
/// Exported names are unique within a module, so at most one specifier can match.
///
/// Exports are read from the AST rather than the module record, for two reasons. oxc folds
/// `import { X } from './x'; export type { X };` into a single indirect entry (ECMA-262
/// ParseModule, step 10.a.ii.3) that takes `is_type` from the import, dropping the export's own
/// modifier. And it marks `export declare class X {}` as TypeScript-only syntax although the
/// declaration has a runtime value. Only specifier lists (`export { … }`) are considered: whether an
/// exported *declaration* has a value is its symbol's business, which the caller already checked.
pub fn exports_type_only(program: &Program<'_>, exported_name: &str) -> bool {
    program.body.iter().any(|stmt| {
        let Statement::ExportNamedDeclaration(decl) = stmt else {
            return false;
        };
        decl.specifiers.iter().any(|specifier| {
            specifier.exported.name() == exported_name
                && (decl.export_kind.is_type() || specifier.export_kind.is_type())
        })
    })
}

pub fn get_type_only_exports(
    module_record: &ModuleRecord<'_>,
    semantic: &Semantic<'_>,
) -> Vec<String> {
    let mut type_only = Vec::new();
    let scoping = semantic.scoping();
    let root_scope = scoping.root_scope_id();

    let entries = module_record
        .local_export_entries
        .iter()
        .chain(module_record.indirect_export_entries.iter());

    for entry in entries {
        let is_type = entry.is_type || is_local_type_export(entry, scoping, root_scope);
        if !is_type {
            continue;
        }

        match &entry.export_name {
            ExportExportName::Name(name_span) => {
                type_only.push(name_span.name.to_string());
            }
            ExportExportName::Default(_) => {
                type_only.push("default".to_string());
            }
            ExportExportName::Null => {}
        }
    }
    type_only
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ResolvedAngularCall {
    Input { is_required: bool },
    Model { is_required: bool },
    Output,
    OutputFromObservable,
    ViewChild { is_required: bool },
    ViewChildren,
    ContentChild { is_required: bool },
    ContentChildren,
}

/// Resolve an initializer-API call such as `input()`, `input.required()` or `core.viewChild()` to
/// the API it invokes.
pub fn resolve_angular_call(
    call: &oxc_ast::ast::CallExpression<'_>,
    semantic: &Semantic<'_>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<ResolvedAngularCall> {
    use crate::analyzer::imports::AngularImportSymbol;

    let callee = parse_initializer_callee(&call.callee)?;
    let is_required = callee.is_required;

    let ref_id = callee.binding.reference_id.get()?;
    let symbol_id = semantic.scoping().get_reference(ref_id).symbol_id()?;
    let bound_symbol = angular_imports.symbols.get(&symbol_id).copied()?;

    let matched_symbol = match (bound_symbol, callee.namespace_property) {
        (AngularImportSymbol::CoreNamespace, Some(property)) => {
            AngularImportSymbol::from_core_export(property)
                .filter(|symbol| symbol.is_initializer_fn())?
        }
        (AngularImportSymbol::RxjsInteropNamespace, Some("outputFromObservable")) => {
            AngularImportSymbol::OutputFromObservableFn
        }
        (_, Some(_)) => return None,
        (symbol, None) => symbol,
    };

    match matched_symbol {
        AngularImportSymbol::InputFn => Some(ResolvedAngularCall::Input { is_required }),
        AngularImportSymbol::ModelFn => Some(ResolvedAngularCall::Model { is_required }),
        AngularImportSymbol::OutputFn => Some(ResolvedAngularCall::Output),
        AngularImportSymbol::OutputFromObservableFn => {
            Some(ResolvedAngularCall::OutputFromObservable)
        }
        AngularImportSymbol::ViewChildFn => Some(ResolvedAngularCall::ViewChild { is_required }),
        AngularImportSymbol::ViewChildrenFn => Some(ResolvedAngularCall::ViewChildren),
        AngularImportSymbol::ContentChildFn => {
            Some(ResolvedAngularCall::ContentChild { is_required })
        }
        AngularImportSymbol::ContentChildrenFn => Some(ResolvedAngularCall::ContentChildren),
        _ => None,
    }
}

pub fn resolve_expression_symbol<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<crate::analyzer::imports::AngularImportSymbol> {
    let callee = match expr.get_inner_expression() {
        Expression::CallExpression(call) => &call.callee,
        Expression::NewExpression(new_expr) => &new_expr.callee,
        other => other,
    };

    let (callee_ident, property_name) = get_callee_identifier_and_property(callee)?;

    let ref_id = callee_ident.reference_id.get()?;
    let symbol_id = semantic.scoping().get_reference(ref_id).symbol_id()?;

    let matched_symbol = angular_imports.symbols.get(&symbol_id).copied();

    // `a.b` only resolves when `a` is an Angular namespace import; any other qualified callee
    // (e.g. `someObject.Component`) is not an Angular reference.
    let Some(property) = property_name else {
        return matched_symbol;
    };
    if matched_symbol != Some(crate::analyzer::imports::AngularImportSymbol::CoreNamespace) {
        return None;
    }

    // Only decorators resolve here; `core.input()` and the other initializer functions are
    // resolved by `resolve_angular_call`, which is the entry point for call expressions.
    let symbol = crate::analyzer::imports::AngularImportSymbol::from_core_export(property)?;
    symbol.decorator_name().map(|_| symbol)
}

pub fn resolve_decorator<'a>(
    decorator: &oxc_ast::ast::Decorator<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<crate::analyzer::imports::AngularImportSymbol> {
    resolve_expression_symbol(&decorator.expression, semantic, angular_imports)
}

/// The name a decorator is exported under from `@angular/core`, or `None` when the decorator is
/// not an Angular decorator this analyzer knows.
///
/// Mirrors ngtsc's `decorator.import.name`, which is the *exported* name rather than the local
/// one, so `import {Component as Cmp}` and `import * as core` (`@core.Component`) both canonicalise
/// to `"Component"`.
///
/// Under `isCore` (compiling `@angular/core` itself) ngtsc compares the decorator's *local* name
/// instead, because core imports its own decorators through relative paths; the local-name branch
/// below is that case and only that case.
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L147-L154
pub fn get_canonical_decorator_name<'a>(
    decorator: &'a Decorator<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<&'static str> {
    if let Some(symbol) = resolve_decorator(decorator, semantic, angular_imports) {
        return symbol.decorator_name();
    }

    if !angular_imports.is_core {
        return None;
    }
    crate::analyzer::imports::AngularImportSymbol::from_core_export(decorator_local_name(
        decorator,
    )?)?
    .decorator_name()
}

/// The decorator's local name as written: `Cmp` for `@Cmp()`, and the rightmost identifier
/// (`Component`) for `@core.Component()`. Mirrors ngtsc's `Decorator.name`, which is
/// `decoratorIdentifier.text` where the identifier is `expr.name` for a namespaced decorator.
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/reflection/src/typescript.ts#L446-L447
fn decorator_local_name<'a>(decorator: &'a Decorator<'a>) -> Option<&'a str> {
    let callee = match decorator.expression.get_inner_expression() {
        Expression::CallExpression(call) => call.callee.get_inner_expression(),
        Expression::NewExpression(new_expr) => new_expr.callee.get_inner_expression(),
        other => other,
    };
    match callee {
        Expression::Identifier(ident) => Some(ident.name.as_str()),
        // ngtsc only accepts a single-level `a.b` namespaced decorator, never `a.b.c`.
        Expression::StaticMemberExpression(member)
            if matches!(
                member.object.get_inner_expression(),
                Expression::Identifier(_)
            ) =>
        {
            Some(member.property.name.as_str())
        }
        _ => None,
    }
}

/// Returns the decorator name to report in diagnostics, matching ngtsc's exported vs local name logic.
pub fn reported_decorator_name<'a>(
    decorator: &'a Decorator<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    import_map: &std::collections::HashMap<String, crate::analyzer::ImportedSymbol>,
) -> Option<String> {
    let callee = match &decorator.expression {
        Expression::CallExpression(call) => &call.callee,
        other => other,
    };
    match callee {
        Expression::StaticMemberExpression(member)
            if matches!(member.object, Expression::Identifier(_)) =>
        {
            Some(member.property.name.to_string())
        }
        Expression::Identifier(ident) => {
            let local = ident.name.as_str();
            if angular_imports.is_core {
                return Some(local.to_string());
            }
            match import_map.get(local).map(|symbol| &symbol.kind) {
                Some(crate::analyzer::ImportKind::Named(exported)) => Some(exported.clone()),
                _ => Some(local.to_string()),
            }
        }
        _ => None,
    }
}

/// Whether a decorator should be treated as Angular's at all, regardless of *which* decorator it
/// is. Mirrors ngtsc's `isAngularDecorator(decorator, isCore)`: in `isCore` mode every decorator
/// qualifies, otherwise the decorator must resolve to a binding imported from `@angular/core`.
///
/// Deliberately name-agnostic, matching ngtsc — a decorator imported from `@angular/core` that
/// this analyzer has no [`crate::analyzer::imports::AngularImportSymbol`] for still counts, so
/// that it is emitted into `ɵsetClassMetadata` with its arguments.
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L222-L229
pub fn is_angular_decorator<'a>(
    decorator: &'a Decorator<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> bool {
    if angular_imports.is_core {
        return true;
    }
    let callee = match decorator.expression.get_inner_expression() {
        Expression::CallExpression(call) => &call.callee,
        Expression::NewExpression(new_expr) => &new_expr.callee,
        other => other,
    };
    let Some((callee_ident, _)) = get_callee_identifier_and_property(callee) else {
        return false;
    };
    let Some(symbol_id) = callee_ident
        .reference_id
        .get()
        .and_then(|ref_id| semantic.scoping().get_reference(ref_id).symbol_id())
    else {
        return false;
    };
    angular_imports.core_bindings.contains(&symbol_id)
}

/// Whether `decorator` is the Angular decorator exported from `@angular/core` as `name`.
///
/// Mirrors ngtsc's `isAngularDecorator(decorator, name, isCore)`: aliased and namespaced imports
/// match, and an identically-named decorator from anywhere else does not.
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L147-L154
pub fn is_angular_decorator_named<'a>(
    decorator: &'a Decorator<'a>,
    name: &str,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> bool {
    get_canonical_decorator_name(decorator, semantic, angular_imports) == Some(name)
}

/// An initializer-API callee decomposed into its import-binding identifier, optional namespace property,
/// and whether `.required` was invoked.
struct InitializerCallee<'a> {
    binding: &'a IdentifierReference<'a>,
    namespace_property: Option<&'a str>,
    is_required: bool,
}

/// Match an initializer-API callee against the shapes accepted by ngtsc:
/// `input()`, `input.required()`, `core.input()`, or `core.input.required()`.
fn parse_initializer_callee<'a>(callee: &'a Expression<'a>) -> Option<InitializerCallee<'a>> {
    if let Expression::Identifier(ident) = callee {
        return Some(InitializerCallee {
            binding: ident,
            namespace_property: None,
            is_required: false,
        });
    }

    let Expression::StaticMemberExpression(member) = callee else {
        return None;
    };

    let is_required = member.property.name == "required";
    match &member.object {
        Expression::Identifier(ident) if is_required => Some(InitializerCallee {
            binding: ident,
            namespace_property: None,
            is_required: true,
        }),
        Expression::Identifier(ident) => Some(InitializerCallee {
            binding: ident,
            namespace_property: Some(member.property.name.as_str()),
            is_required: false,
        }),
        Expression::StaticMemberExpression(inner) if is_required => {
            let Expression::Identifier(ident) = &inner.object else {
                return None;
            };
            Some(InitializerCallee {
                binding: ident,
                namespace_property: Some(inner.property.name.as_str()),
                is_required: true,
            })
        }
        _ => None,
    }
}

/// Extract the base identifier and optional property name for decorator expressions.
fn get_callee_identifier_and_property<'a>(
    callee: &'a oxc_ast::ast::Expression<'a>,
) -> Option<(&'a oxc_ast::ast::IdentifierReference<'a>, Option<&'a str>)> {
    match callee.get_inner_expression() {
        Expression::Identifier(ident) => Some((ident, None)),
        Expression::StaticMemberExpression(member) => {
            let Expression::Identifier(obj_ident) = member.object.get_inner_expression() else {
                return None;
            };
            Some((obj_ident, Some(member.property.name.as_str())))
        }
        _ => None,
    }
}

/// Recursively stringify a TypeScript qualified type name (e.g. `a.b.c`).
pub fn qualified_name_to_string(qualified: &TSQualifiedName) -> String {
    let left_str = match &qualified.left {
        TSTypeName::IdentifierReference(ident) => ident.name.to_string(),
        TSTypeName::QualifiedName(inner) => qualified_name_to_string(inner),
        TSTypeName::ThisExpression(_) => "this".to_string(),
    };
    format!("{}.{}", left_str, qualified.right.name)
}

/// Retrieve the leftmost (root) identifier of a TypeScript qualified name (`a` in `a.b.c`).
pub fn get_leftmost_identifier_in_qualified<'a>(
    mut qualified: &'a TSQualifiedName<'a>,
) -> Option<&'a IdentifierReference<'a>> {
    loop {
        match &qualified.left {
            TSTypeName::IdentifierReference(ident) => return Some(&**ident),
            TSTypeName::QualifiedName(inner) => qualified = inner,
            TSTypeName::ThisExpression(_) => return None,
        }
    }
}

#[cfg(test)]
mod tests;
