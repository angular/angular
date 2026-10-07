//! The sync, within-one-file partial evaluation interpreter.
//!
//! Mirror of `@angular/compiler-cli`'s `ngtsc/partial_evaluator` `StaticInterpreter`
//! (`interpreter.ts`), restructured for oxc's arena-allocated AST: the interpreter runs
//! synchronously over a single file's AST (typically under that file's `ParsedFile` lock) and
//! returns fully owned [`ResolvedValue`]s. It never crosses a file boundary itself — an import
//! binding in value position yields an [`IncompleteValue`] hole, which the async semantic
//! driver resolves between locks and feeds back through the [`ResolvedEnv`] on a re-run.

use crate::analyzer::{ImportKind, ImportedSymbol};
use crate::evaluator::foreign::{ForeignFunctionResolver, FunctionTarget, TypeNameRef};
use crate::evaluator::value::{
    fingerprint_args, first_spread_hole, is_truthy, js_number_to_string, DeclKind, DynamicReason,
    DynamicValue, EnumValue, HoleKey, IncompleteDep, KnownFn, ResolvedEnv, ResolvedValue,
    UnresolvedReference, ValueMap, ValueReference,
};
use crate::query::{FileId, ReferenceId};
use crate::types::ParsedFileDependent;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, BindingPattern, BindingProperty, CallExpression,
    ChainExpression, Class, ClassElement, Expression, FormalParameters, ObjectExpression,
    ObjectPropertyKind, PropertyKey, TSEnumDeclaration, TSEnumMemberName, TemplateLiteral,
    VariableDeclarator,
};
use oxc_ast::AstKind;
use oxc_semantic::Semantic;
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::{BinaryOperator, LogicalOperator, UnaryOperator};
use oxc_syntax::symbol::SymbolFlags;
use std::cell::{Cell, RefCell};
use std::collections::{HashMap, HashSet};

/// Hard cap on interpreter recursion (expressions + declaration chains), preventing stack
/// overflow on adversarial input. Exceeding it yields `Dynamic(Unknown)`.
const MAX_EVAL_DEPTH: u32 = 256;

/// Whether the evaluation is willing to chase imports.
///
/// - [`EvalMode::Syntax`]: single-file only. An import binding in value position is a *final*
///   [`ResolvedValue::Incomplete`] hole; the [`ResolvedEnv`] is ignored.
/// - [`EvalMode::Semantic`]: used by the semantic driver's re-runs. The env is consulted for
///   every hole; a miss still yields a hole, which the driver resolves and feeds back.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum EvalMode {
    Syntax,
    Semantic,
}

/// Everything one evaluation pass needs about the file it runs in.
pub struct EvalInput<'a, 'e> {
    pub semantic: &'a Semantic<'a>,
    /// The file being evaluated.
    pub file: FileId,
    /// Local import bindings, from
    /// [`crate::analyzer::extract_import_map`] over the file's module record.
    pub import_map: &'e HashMap<String, ImportedSymbol>,
    pub mode: EvalMode,
    /// Resolved-hole environment (empty and ignored in [`EvalMode::Syntax`]).
    pub env: &'e ResolvedEnv,
    /// Foreign-function recognizers, tried in order.
    pub foreign: &'e [&'e dyn ForeignFunctionResolver],
}

impl<'a, 'e> EvalInput<'a, 'e> {
    /// Build an input from a cached [`ParsedFileDependent`] view (the normal production path —
    /// no loose `source_text`/`Semantic` threading).
    pub fn new(
        parsed: &'a ParsedFileDependent<'a>,
        import_map: &'e HashMap<String, ImportedSymbol>,
        file: FileId,
        mode: EvalMode,
        env: &'e ResolvedEnv,
        foreign: &'e [&'e dyn ForeignFunctionResolver],
    ) -> Self {
        Self {
            semantic: &parsed.semantic,
            file,
            import_map,
            mode,
            env,
            foreign,
        }
    }
}

/// Function-body parameter scope, keyed by each parameter binding's `SymbolId`. (Upstream keys
/// its scope by `ts.ParameterDeclaration`; oxc's `Semantic` resolves body identifiers straight
/// to the parameter's `SymbolId`, which is cleaner.)
pub(crate) type Scope = HashMap<oxc_semantic::SymbolId, ResolvedValue>;

pub fn evaluate_expression(expr: &Expression<'_>, input: &EvalInput<'_, '_>) -> ResolvedValue {
    Interpreter::new(input).visit_expression_direct(expr, &Scope::new())
}

/// Evaluate a TypeScript type node. Sync, single-file.
pub fn evaluate_type(
    ts_type: &oxc_ast::ast::TSType<'_>,
    input: &EvalInput<'_, '_>,
) -> ResolvedValue {
    Interpreter::new(input).visit_type(ts_type, &Scope::new())
}

/// Re-evaluate an AST expression node by its `NodeId` using the filled `input.env`.
pub fn evaluate_node_id(
    node_id: oxc_semantic::NodeId,
    input: &EvalInput<'_, '_>,
) -> Option<ResolvedValue> {
    let interp = Interpreter::new(input);
    interp.current_node_id.set(Some(node_id));
    let ast_node = input.semantic.nodes().get_node(node_id);
    // TODO(parity): a hole propagated inside a function body evaluated for a call (`function
    // first(xs) { return xs[0]; }` called with an import) re-evaluates here without the call's
    // parameter bindings, so it degrades to Dynamic where ngtsc, which evaluates the call
    // afresh, produces the element.
    let scope = Scope::new();
    let span = ast_node.kind().span();
    let result = match ast_node.kind() {
        AstKind::BooleanLiteral(b) => Some(ResolvedValue::Boolean(b.value)),
        AstKind::NullLiteral(_) => Some(ResolvedValue::Null),
        AstKind::NumericLiteral(n) => Some(ResolvedValue::Number(n.value)),
        AstKind::StringLiteral(s) => Some(ResolvedValue::String(s.value.to_string())),
        AstKind::TemplateLiteral(t) => Some(interp.visit_template(t, &scope)),
        AstKind::IdentifierReference(ident) => {
            let ref_id = ident.reference_id.get()?;
            Some(interp.visit_reference(ref_id, &ident.name, span, &scope))
        }
        AstKind::ArrayExpression(arr) => {
            let mut out = Vec::with_capacity(arr.elements.len());
            for element in &arr.elements {
                match element {
                    oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                        interp.spread_into(&spread.argument, spread.span, &scope, &mut out);
                    }
                    oxc_ast::ast::ArrayExpressionElement::Elision(elision) => {
                        out.push(interp.dynamic(elision.span, DynamicReason::UnsupportedSyntax));
                    }
                    _ => {
                        let Some(item) = element.as_expression() else {
                            continue;
                        };
                        out.push(interp.visit_expression(item, &scope));
                    }
                }
            }
            Some(ResolvedValue::Array(out))
        }
        AstKind::ObjectExpression(obj) => Some(interp.visit_object(obj, span, &scope)),
        AstKind::BinaryExpression(b) => {
            let lhs = interp.visit_expression(&b.left, &scope);
            let rhs = interp.visit_expression(&b.right, &scope);
            Some(interp.apply_binary_op(b.operator, lhs, rhs, span, b.left.span(), b.right.span()))
        }
        AstKind::LogicalExpression(l) => {
            let lhs = interp.visit_expression(&l.left, &scope);
            let rhs = interp.visit_expression(&l.right, &scope);
            if !matches!(
                lhs,
                ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_)
            ) {
                if let ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) = rhs {
                    return Some(interp.propagate_failure(span, rhs));
                }
            }
            match lhs {
                ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                    Some(interp.propagate_failure(span, lhs))
                }
                _ => match l.operator {
                    LogicalOperator::And => Some(if is_truthy(&lhs) { rhs } else { lhs }),
                    LogicalOperator::Or => Some(if is_truthy(&lhs) { lhs } else { rhs }),
                    LogicalOperator::Coalesce => {
                        Some(interp.dynamic(span, DynamicReason::UnsupportedSyntax))
                    }
                },
            }
        }
        AstKind::UnaryExpression(u) => {
            Some(interp.visit_unary(u.operator, &u.argument, span, &scope))
        }
        AstKind::ConditionalExpression(c) => {
            let test = interp.visit_expression(&c.test, &scope);
            match test {
                ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                    Some(interp.propagate_failure(span, test))
                }
                _ if is_truthy(&test) => Some(interp.visit_expression(&c.consequent, &scope)),
                _ => Some(interp.visit_expression(&c.alternate, &scope)),
            }
        }
        AstKind::StaticMemberExpression(m) => {
            let lhs = interp.visit_expression(&m.object, &scope);
            Some(interp.access(span, lhs, AccessKey::Str(m.property.name.as_str()), &scope))
        }
        AstKind::ComputedMemberExpression(m) => {
            let key = interp.visit_expression(&m.expression, &scope);
            let key = match key {
                ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                    return Some(interp.propagate_failure(span, key));
                }
                ResolvedValue::String(s) => AccessKeyOwned::Str(s),
                ResolvedValue::Number(n) => AccessKeyOwned::Num(n),
                ResolvedValue::EnumValue(ev) => match ev.resolved {
                    ResolvedValue::String(s) => AccessKeyOwned::Str(s),
                    ResolvedValue::Number(n) => AccessKeyOwned::Num(n),
                    _ => return Some(interp.dynamic(span, DynamicReason::InvalidExpressionType)),
                },
                _ => return Some(interp.dynamic(span, DynamicReason::InvalidExpressionType)),
            };
            let lhs = interp.visit_expression(&m.object, &scope);
            match &key {
                AccessKeyOwned::Str(s) => Some(interp.access(span, lhs, AccessKey::Str(s), &scope)),
                AccessKeyOwned::Num(n) => {
                    Some(interp.access(span, lhs, AccessKey::Num(*n), &scope))
                }
            }
        }
        AstKind::ChainExpression(chain) => Some(interp.visit_chain(chain, span, &scope)),
        AstKind::CallExpression(call) => Some(interp.visit_call(call, &scope)),
        AstKind::ParenthesizedExpression(p) => Some(interp.visit_expression(&p.expression, &scope)),
        AstKind::TSTypeQuery(q) => Some(interp.visit_type_query(q, &scope)),
        AstKind::TSQualifiedName(q) => Some(interp.visit_qualified_name(q, span, &scope)),
        AstKind::TSTypeReference(r) => Some(interp.visit_type_reference(r, &scope)),
        _ => None,
    };
    // This dispatcher stands in for `visit_expression` on the Stage-2 resume path, so it owes
    // the same postlude: without it an identifier, conditional, or parenthesized expression
    // hands back a dynamic anchored on a sub-expression instead of on `node_id` itself.
    result.map(|value| match value {
        ResolvedValue::Dynamic(dynamic) => interp.chain_dynamic_boxed(span, dynamic),
        other => other,
    })
}

/// Driver entry point for resolving [`IncompleteDep::Call`] holes: evaluate a call of the
/// function-like declaration `callee` *local to `input`'s file*, with pre-resolved arguments.
/// Runs foreign-function recognizers (e.g. `ModuleWithProviders` return-type inspection) and
/// single-return bodies exactly like the in-expression call path.
pub fn evaluate_function_call(
    callee: &ValueReference,
    args: &[ResolvedValue],
    call_span: Span,
    input: &EvalInput<'_, '_>,
) -> ResolvedValue {
    let interp = Interpreter::new(input);
    let Some(target) = interp.resolve_function_target(callee) else {
        return ResolvedValue::dynamic(input.file, call_span, DynamicReason::InvalidExpressionType);
    };
    interp.call_function(&target, callee, args.to_vec(), call_span)
}

/// Driver entry point for resolving [`IncompleteDep::Member`] holes: evaluate a static member
/// access on a class declared in `input`'s file. `base` must reference that class
/// (`base.file == input.file`).
pub fn evaluate_static_member(
    base: &ValueReference,
    member: &str,
    input: &EvalInput<'_, '_>,
) -> ResolvedValue {
    let interp = Interpreter::new(input);
    interp.class_static_access(base, member, base.span, &Scope::new())
}

/// Driver entry point for evaluating a top-level declaration of `input`'s file by symbol
/// (used for exported `const`/`class`/`function`/`enum` resolution): same semantics as an
/// identifier reference to that symbol.
pub fn evaluate_symbol_declaration(
    symbol_id: oxc_semantic::SymbolId,
    input: &EvalInput<'_, '_>,
) -> ResolvedValue {
    let interp = Interpreter::new(input);
    let span = input.semantic.symbol_declaration(symbol_id).kind().span();
    interp.visit_declaration(symbol_id, span, &Scope::new())
}

struct Interpreter<'a, 'e, 'i> {
    input: &'i EvalInput<'a, 'e>,
    /// Local-const-chain cycle guard (`resolve_local_expression` in `analyzer/utils` has no
    /// such guard — `const a = b; const b = a;` must not loop here).
    visiting: RefCell<HashSet<oxc_semantic::SymbolId>>,
    depth: Cell<u32>,
    current_node_id: Cell<Option<oxc_semantic::NodeId>>,
    traversed_reference: Cell<bool>,
}

impl<'a, 'e, 'i> Interpreter<'a, 'e, 'i> {
    fn new(input: &'i EvalInput<'a, 'e>) -> Self {
        Self {
            input,
            visiting: RefCell::new(HashSet::new()),
            depth: Cell::new(0),
            current_node_id: Cell::new(None),
            traversed_reference: Cell::new(false),
        }
    }

    fn file(&self) -> FileId {
        self.input.file
    }

    fn dynamic(&self, span: Span, reason: DynamicReason) -> ResolvedValue {
        ResolvedValue::dynamic(self.file(), span, reason)
    }

    /// Look up a hole in the env. Only `Semantic` mode consults the env: `Syntax` mode never
    /// chases imports, so holes are final there.
    fn lookup_env(&self, key: &HoleKey) -> Option<ResolvedValue> {
        match self.input.mode {
            EvalMode::Semantic => self.input.env.get(key).cloned(),
            EvalMode::Syntax => None,
        }
    }

    /// Chain a dynamic value produced by a sub-expression onto the current node, mirroring
    /// upstream `DynamicValue.fromDynamicInput`.
    fn chain_dynamic(&self, span: Span, inner: DynamicValue) -> ResolvedValue {
        crate::evaluator::value::chain_dynamic(self.file(), span, inner)
    }

    /// [`Self::chain_dynamic`] reusing an existing box rather than reboxing its contents.
    fn chain_dynamic_boxed(&self, span: Span, inner: Box<DynamicValue>) -> ResolvedValue {
        crate::evaluator::value::chain_dynamic_boxed(self.file(), span, inner)
    }

    /// Propagate a non-value result (`Dynamic` or `Incomplete`) out of a containing operation
    /// at `span`. Dynamics chain (`DynamicInput`); holes are marked non-transparent because the
    /// hole node now stands for the larger expression, so the env entry for the hole alone is
    /// not the final value — completion requires a re-run. That expression takes one value, so
    /// the hole is no longer a spread either, even if it was one.
    fn propagate_failure(&self, span: Span, failure: ResolvedValue) -> ResolvedValue {
        match failure {
            ResolvedValue::Dynamic(d) => self.chain_dynamic_boxed(span, d),
            ResolvedValue::Incomplete(mut hole) => {
                hole.transparent = false;
                hole.spread = None;
                hole.span = span;
                hole.node_id = self.current_node_id.get();
                ResolvedValue::Incomplete(hole)
            }
            other => other,
        }
    }

    fn visit_type(&self, ts_type: &oxc_ast::ast::TSType<'a>, scope: &Scope) -> ResolvedValue {
        use oxc_ast::ast::{TSType, TSTypeOperatorOperator};

        match ts_type {
            TSType::TSTypeQuery(query) => {
                let old_node_id = self.current_node_id.replace(Some(query.node_id()));
                let res = self.visit_type_query(query, scope);
                self.current_node_id.set(old_node_id);
                res
            }
            TSType::TSTypeReference(type_ref) => {
                let old_node_id = self.current_node_id.replace(Some(type_ref.node_id()));
                let res = self.visit_type_reference(type_ref, scope);
                self.current_node_id.set(old_node_id);
                res
            }
            TSType::TSTupleType(tuple) => {
                let mut out = Vec::with_capacity(tuple.element_types.len());
                for element in &tuple.element_types {
                    out.push(self.visit_tuple_element(element, scope));
                }
                ResolvedValue::Array(out)
            }
            TSType::TSTypeOperatorType(op) if op.operator == TSTypeOperatorOperator::Readonly => {
                self.visit_type(&op.type_annotation, scope)
            }
            TSType::TSNeverKeyword(_) => ResolvedValue::Array(Vec::new()),
            // TODO(parity): Support `TSType::TSImportType` (`import("./mod").Foo`) in `.d.ts` type
            // evaluation (`StaticInterpreter.visitImportType` in `ngtsc/partial_evaluator`).
            _ => self.dynamic(ts_type.span(), DynamicReason::UnsupportedSyntax),
        }
    }

    fn try_visit_return_type(
        &self,
        type_ref: &oxc_ast::ast::TSTypeReference<'a>,
        scope: &Scope,
    ) -> Option<ResolvedValue> {
        use oxc_ast::ast::TSTypeName;

        let TSTypeName::IdentifierReference(ident) = &type_ref.type_name else {
            return None;
        };
        if ident.name != "ReturnType" {
            return None;
        }
        let type_args = type_ref.type_arguments.as_ref()?;
        if type_args.params.len() != 1 {
            return None;
        }

        let callee = self.visit_type(&type_args.params[0], scope);
        let resolved = match callee {
            ResolvedValue::Dynamic(_) => self.propagate_failure(type_ref.span, callee),
            ResolvedValue::Incomplete(hole) => {
                self.propagate_failure(type_ref.span, ResolvedValue::Incomplete(hole))
            }
            ResolvedValue::Reference(reference) if reference.file != self.file() => {
                let hole_key = HoleKey::Call {
                    callee: reference.clone(),
                    args_fingerprint: fingerprint_args(&[]),
                };
                if let Some(value) = self.lookup_env(&hole_key) {
                    return Some(value);
                }
                ResolvedValue::incomplete(
                    self.file(),
                    type_ref.span,
                    self.current_node_id.get(),
                    IncompleteDep::Call {
                        callee: reference,
                        args: Vec::new(),
                    },
                )
            }
            ResolvedValue::Reference(reference) => {
                let Some(target) = self.resolve_function_target(&reference) else {
                    return Some(self.dynamic(type_ref.span, DynamicReason::InvalidExpressionType));
                };
                self.call_function(&target, &reference, Vec::new(), type_ref.span)
            }
            _ => self.dynamic(type_ref.span, DynamicReason::InvalidExpressionType),
        };
        Some(resolved)
    }

    fn visit_type_reference(
        &self,
        type_ref: &oxc_ast::ast::TSTypeReference<'a>,
        scope: &Scope,
    ) -> ResolvedValue {
        use oxc_ast::ast::TSTypeName;

        // `ReturnType<typeof someFn>` — resolve `someFn` and, if it returns `ModuleWithProviders<T>`,
        // resolve to `T`. Mirrors `Interpreter.visitTypeReference` in
        // `ngtsc/partial_evaluator/src/interpreter.ts`.
        if let Some(return_type_val) = self.try_visit_return_type(type_ref, scope) {
            return return_type_val;
        }

        match &type_ref.type_name {
            TSTypeName::IdentifierReference(ident) => {
                if let Some(ref_id) = ident.reference_id.get() {
                    self.visit_reference(ref_id, &ident.name, type_ref.span, scope)
                } else if let Some(imported) = self.input.import_map.get(ident.name.as_str()) {
                    let target = UnresolvedReference {
                        importer: self.file(),
                        specifier: imported.source.clone(),
                        symbol: imported.kind.clone(),
                        local_name: Some(ident.name.to_string()),
                        is_namespace_member: false,
                    };
                    self.import_hole(type_ref.span, target)
                } else {
                    self.dynamic(
                        type_ref.span,
                        DynamicReason::UnknownIdentifier(ident.name.to_string()),
                    )
                }
            }
            TSTypeName::QualifiedName(qualified) => {
                self.visit_qualified_name(qualified, type_ref.span, scope)
            }
            TSTypeName::ThisExpression(_) => {
                self.dynamic(type_ref.span, DynamicReason::UnsupportedSyntax)
            }
        }
    }

    fn visit_tuple_element(
        &self,
        elem: &oxc_ast::ast::TSTupleElement<'a>,
        scope: &Scope,
    ) -> ResolvedValue {
        use oxc_ast::ast::TSTupleElement;

        match elem {
            TSTupleElement::TSNamedTupleMember(member) => {
                self.visit_tuple_element(&member.element_type, scope)
            }
            _ => {
                if let Some(ty) = elem.as_ts_type() {
                    self.visit_type(ty, scope)
                } else {
                    self.dynamic(elem.span(), DynamicReason::UnsupportedSyntax)
                }
            }
        }
    }

    fn visit_type_query(
        &self,
        query: &oxc_ast::ast::TSTypeQuery<'a>,
        scope: &Scope,
    ) -> ResolvedValue {
        use oxc_ast::ast::TSTypeQueryExprName;

        match &query.expr_name {
            TSTypeQueryExprName::IdentifierReference(ident) => {
                if let Some(ref_id) = ident.reference_id.get() {
                    self.visit_reference(ref_id, &ident.name, query.span, scope)
                } else if let Some(imported) = self.input.import_map.get(ident.name.as_str()) {
                    let target = UnresolvedReference {
                        importer: self.file(),
                        specifier: imported.source.clone(),
                        symbol: imported.kind.clone(),
                        local_name: Some(ident.name.to_string()),
                        is_namespace_member: false,
                    };
                    self.import_hole(query.span, target)
                } else if let Some(symbol_id) =
                    self.input.semantic.scoping().get_root_binding(ident.name)
                {
                    self.visit_declaration(symbol_id, query.span, scope)
                } else {
                    self.dynamic(
                        query.span,
                        DynamicReason::UnknownIdentifier(ident.name.to_string()),
                    )
                }
            }
            TSTypeQueryExprName::QualifiedName(qualified) => {
                self.visit_qualified_name(qualified, query.span, scope)
            }
            _ => self.dynamic(query.span, DynamicReason::UnsupportedSyntax),
        }
    }

    fn visit_qualified_name(
        &self,
        qualified: &oxc_ast::ast::TSQualifiedName<'a>,
        span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        use oxc_ast::ast::TSTypeName;

        let lhs = match &qualified.left {
            TSTypeName::IdentifierReference(ident) => {
                let Some(ref_id) = ident.reference_id.get() else {
                    return self.dynamic(
                        ident.span,
                        DynamicReason::UnknownIdentifier(ident.name.to_string()),
                    );
                };
                self.visit_reference(ref_id, &ident.name, ident.span, scope)
            }
            TSTypeName::QualifiedName(inner) => self.visit_qualified_name(inner, inner.span, scope),
            TSTypeName::ThisExpression(_) => {
                return self.dynamic(qualified.left.span(), DynamicReason::UnsupportedSyntax);
            }
        };
        self.access(
            span,
            lhs,
            AccessKey::Str(qualified.right.name.as_str()),
            scope,
        )
    }

    // ---------------------------------------------------------------- expressions

    fn visit_expression_direct(&self, expr: &Expression<'a>, scope: &Scope) -> ResolvedValue {
        let val = self.visit_expression(expr, scope);
        if self.traversed_reference.get() {
            return val;
        }

        match expr.get_inner_expression() {
            Expression::Identifier(ident)
                if matches!(
                    val,
                    ResolvedValue::Incomplete(_) | ResolvedValue::Dynamic(_)
                ) =>
            {
                ResolvedValue::Named {
                    span: ident.span,
                    value: Box::new(val),
                    synthetic: false,
                }
            }
            Expression::StaticMemberExpression(m)
                if matches!(
                    val,
                    ResolvedValue::Incomplete(_) | ResolvedValue::Dynamic(_)
                ) =>
            {
                let lhs = self.visit_expression(&m.object, scope);
                let unwrapped_lhs = lhs.unwrap_named();
                let is_namespace = if let ResolvedValue::Incomplete(hole) = unwrapped_lhs {
                    if let IncompleteDep::Reference(unresolved) = &hole.dep {
                        unresolved.symbol == ImportKind::Namespace
                    } else {
                        false
                    }
                } else {
                    false
                };
                if is_namespace {
                    ResolvedValue::Named {
                        span: m.span,
                        value: Box::new(val),
                        synthetic: false,
                    }
                } else {
                    val
                }
            }
            _ => val,
        }
    }

    fn visit_expression(&self, expr: &Expression<'a>, scope: &Scope) -> ResolvedValue {
        // Upstream reaches through parens and type assertions by *recursing* on the inner
        // expression, so its postlude below still re-anchors on the outer node. Stripping
        // them here instead loses that node, so keep it: it is the one a consumer emitting
        // the expression verbatim has to reproduce, and dropping the parens off, say,
        // `(a, b)` would splice two values into a position that holds one.
        let outer_span = expr.span();
        let expr = expr.get_inner_expression();
        let span = expr.span();
        let old_node_id = self.current_node_id.replace(Some(expr.node_id()));
        if self.depth.get() >= MAX_EVAL_DEPTH {
            self.current_node_id.set(old_node_id);
            return self.dynamic(span, DynamicReason::Unknown);
        }
        self.depth.set(self.depth.get() + 1);
        let result = self.dispatch_expression(expr, span, scope);
        self.depth.set(self.depth.get() - 1);
        self.current_node_id.set(old_node_id);
        // Upstream's `visitExpression` postlude: a dynamic value that came out of a
        // *sub*-expression is re-anchored on the node being visited, so the node a caller
        // reads off a dynamic value is always the expression it asked about — a reference to
        // an unevaluable constant reports the reference, not the constant's initializer.
        // `chain_dynamic` skips the wrap when the inner value is already at this node, which
        // is upstream's `result.node !== node` guard.
        // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.ts#L155-L158
        match result {
            ResolvedValue::Dynamic(dynamic) => self.chain_dynamic_boxed(outer_span, dynamic),
            other => other,
        }
    }

    fn dispatch_expression(
        &self,
        expr: &Expression<'a>,
        span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        match expr {
            Expression::BooleanLiteral(b) => ResolvedValue::Boolean(b.value),
            Expression::NullLiteral(_) => ResolvedValue::Null,
            Expression::NumericLiteral(n) => ResolvedValue::Number(n.value),
            Expression::StringLiteral(s) => ResolvedValue::String(s.value.to_string()),
            Expression::TemplateLiteral(t) => self.visit_template(t, scope),
            Expression::Identifier(ident) => {
                if let Some(ref_id) = ident.reference_id.get() {
                    self.visit_reference(ref_id, &ident.name, span, scope)
                } else if let Some(imported) = self.input.import_map.get(ident.name.as_str()) {
                    let target = UnresolvedReference {
                        importer: self.file(),
                        specifier: imported.source.clone(),
                        symbol: imported.kind.clone(),
                        local_name: Some(ident.name.to_string()),
                        is_namespace_member: false,
                    };
                    self.import_hole(span, target)
                } else if let Some(symbol_id) =
                    self.input.semantic.scoping().get_root_binding(ident.name)
                {
                    self.visit_declaration(symbol_id, span, scope)
                } else {
                    self.dynamic(
                        span,
                        DynamicReason::UnknownIdentifier(ident.name.to_string()),
                    )
                }
            }
            Expression::ArrayExpression(arr) => {
                let mut out = Vec::with_capacity(arr.elements.len());
                for element in &arr.elements {
                    match element {
                        ArrayExpressionElement::SpreadElement(spread) => {
                            self.spread_into(&spread.argument, spread.span, scope, &mut out);
                        }
                        ArrayExpressionElement::Elision(elision) => {
                            // Parity: upstream treats `ts.OmittedExpression` as unsupported.
                            out.push(self.dynamic(elision.span, DynamicReason::UnsupportedSyntax));
                        }
                        _ => {
                            let Some(item) = element.as_expression() else {
                                continue;
                            };
                            out.push(self.visit_expression(item, scope));
                        }
                    }
                }
                ResolvedValue::Array(out)
            }
            Expression::ObjectExpression(obj) => self.visit_object(obj, span, scope),
            Expression::BinaryExpression(b) => {
                let lhs = self.visit_expression(&b.left, scope);
                let rhs = self.visit_expression(&b.right, scope);
                self.apply_binary_op(b.operator, lhs, rhs, span, b.left.span(), b.right.span())
            }
            Expression::LogicalExpression(l) => {
                let lhs = self.visit_expression(&l.left, scope);
                let rhs = self.visit_expression(&l.right, scope);
                // Parity: upstream evaluates both operands eagerly and propagates a dynamic
                // operand even when short-circuiting would have skipped it.
                if !matches!(
                    lhs,
                    ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_)
                ) {
                    if let ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) = rhs {
                        return self.propagate_failure(span, rhs);
                    }
                }
                match lhs {
                    ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                        self.propagate_failure(span, lhs)
                    }
                    _ => match l.operator {
                        LogicalOperator::And => {
                            if is_truthy(&lhs) {
                                rhs
                            } else {
                                lhs
                            }
                        }
                        LogicalOperator::Or => {
                            if is_truthy(&lhs) {
                                lhs
                            } else {
                                rhs
                            }
                        }
                        // Parity: `??` is absent from upstream's operator table too.
                        LogicalOperator::Coalesce => {
                            self.dynamic(span, DynamicReason::UnsupportedSyntax)
                        }
                    },
                }
            }
            Expression::UnaryExpression(u) => {
                self.visit_unary(u.operator, &u.argument, span, scope)
            }
            Expression::ConditionalExpression(c) => {
                let test = self.visit_expression(&c.test, scope);
                match test {
                    ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                        self.propagate_failure(span, test)
                    }
                    _ if is_truthy(&test) => self.visit_expression(&c.consequent, scope),
                    _ => self.visit_expression(&c.alternate, scope),
                }
            }
            Expression::StaticMemberExpression(m) => {
                let lhs = self.visit_expression(&m.object, scope);
                self.access(span, lhs, AccessKey::Str(m.property.name.as_str()), scope)
            }
            Expression::ComputedMemberExpression(m) => {
                let key = self.visit_expression(&m.expression, scope);
                let key = match key {
                    ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                        return self.propagate_failure(span, key);
                    }
                    ResolvedValue::String(s) => AccessKeyOwned::Str(s),
                    ResolvedValue::Number(n) => AccessKeyOwned::Num(n),
                    ResolvedValue::EnumValue(ev) => match ev.resolved {
                        ResolvedValue::String(s) => AccessKeyOwned::Str(s),
                        ResolvedValue::Number(n) => AccessKeyOwned::Num(n),
                        _ => {
                            return self.dynamic(span, DynamicReason::InvalidExpressionType);
                        }
                    },
                    _ => return self.dynamic(span, DynamicReason::InvalidExpressionType),
                };
                let lhs = self.visit_expression(&m.object, scope);
                match &key {
                    AccessKeyOwned::Str(s) => self.access(span, lhs, AccessKey::Str(s), scope),
                    AccessKeyOwned::Num(n) => self.access(span, lhs, AccessKey::Num(*n), scope),
                }
            }
            Expression::ChainExpression(chain) => self.visit_chain(chain, span, scope),
            Expression::CallExpression(call) => self.visit_call(call, scope),
            Expression::ClassExpression(class) => {
                let Some(id) = &class.id else {
                    return self.dynamic(span, DynamicReason::UnsupportedSyntax);
                };
                ResolvedValue::Reference(self.make_reference(
                    id.name.to_string(),
                    id.symbol_id.get(),
                    class.span,
                    DeclKind::Class,
                ))
            }
            // Parity: upstream evaluates arrow/function expressions only through call sites and
            // foreign-function resolvers, never as first-class values.
            // TODO(parity-extension): consider arrow-const callables.
            _ => self.dynamic(span, DynamicReason::UnsupportedSyntax),
        }
    }

    /// Evaluate a spread argument and splice it into `out` (array-literal and call-argument
    /// spread semantics, mirroring upstream `visitSpreadElement`).
    fn spread_into(
        &self,
        argument: &Expression<'a>,
        spread_span: Span,
        scope: &Scope,
        out: &mut Vec<ResolvedValue>,
    ) {
        let value = self.visit_expression(argument, scope);
        match value.into_unwrapped_named() {
            ResolvedValue::Array(items) => out.extend(items),
            ResolvedValue::Dynamic(dynamic) => {
                out.push(self.chain_dynamic_boxed(spread_span, dynamic))
            }
            // A hole under a spread is non-final by definition — how many elements it splices
            // is unknown until its dependency resolves.
            ResolvedValue::Incomplete(hole) => {
                let argument_node = argument.get_inner_expression().node_id();
                out.push(ResolvedValue::Incomplete(Box::new(
                    hole.into_spread(spread_span, Some(argument_node)),
                )));
            }
            _ => out.push(self.dynamic(spread_span, DynamicReason::InvalidExpressionType)),
        }
    }

    fn visit_template(&self, t: &TemplateLiteral<'a>, scope: &Scope) -> ResolvedValue {
        let span = t.span;
        let mut result = String::new();
        for (i, quasi) in t.quasis.iter().enumerate() {
            match &quasi.value.cooked {
                Some(cooked) => result.push_str(cooked.as_str()),
                None => result.push_str(quasi.value.raw.as_str()),
            }
            let Some(expr) = t.expressions.get(i) else {
                continue;
            };
            let mut value = self.visit_expression(expr, scope);
            if let ResolvedValue::EnumValue(ev) = value {
                value = ev.resolved;
            }
            match value {
                ResolvedValue::String(s) => result.push_str(&s),
                ResolvedValue::Number(n) => result.push_str(&js_number_to_string(n)),
                ResolvedValue::Boolean(b) => result.push_str(if b { "true" } else { "false" }),
                ResolvedValue::Null => result.push_str("null"),
                ResolvedValue::Undefined => result.push_str("undefined"),
                ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                    return self.propagate_failure(span, value);
                }
                _ => {
                    // Parity: a non-primitive substitution makes the string non-static.
                    let inner = DynamicValue {
                        file: self.file(),
                        span: expr.span(),
                        reason: DynamicReason::DynamicString,
                    };
                    return self.chain_dynamic(span, inner);
                }
            }
        }
        ResolvedValue::String(result)
    }

    fn visit_object(&self, obj: &ObjectExpression<'a>, span: Span, scope: &Scope) -> ResolvedValue {
        let mut map = ValueMap::new();
        for prop in &obj.properties {
            match prop {
                ObjectPropertyKind::ObjectProperty(p) => {
                    let key = if p.computed {
                        let Some(key_expr) = p.key.as_expression() else {
                            return self.dynamic(span, DynamicReason::UnsupportedSyntax);
                        };
                        let mut key_value = self.visit_expression(key_expr, scope);
                        if let ResolvedValue::EnumValue(ev) = key_value {
                            key_value = ev.resolved;
                        }
                        match key_value {
                            ResolvedValue::String(s) => s,
                            ResolvedValue::Number(n) => js_number_to_string(n),
                            ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                                return self.propagate_failure(span, key_value);
                            }
                            _ => {
                                let inner = DynamicValue {
                                    file: self.file(),
                                    span: key_expr.span(),
                                    reason: DynamicReason::DynamicString,
                                };
                                return self.chain_dynamic(span, inner);
                            }
                        }
                    } else {
                        let Some(name) = crate::analyzer::utils::extract_property_key(&p.key)
                        else {
                            return self.dynamic(span, DynamicReason::UnsupportedSyntax);
                        };
                        name.into_owned()
                    };
                    map.insert(key, self.visit_expression(&p.value, scope));
                }
                ObjectPropertyKind::SpreadProperty(spread) => {
                    let value = self.visit_expression(&spread.argument, scope);
                    match value {
                        ResolvedValue::Map(spread_map) => {
                            for (k, v) in spread_map.iter() {
                                map.insert(k.clone(), v.clone());
                            }
                        }
                        ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {
                            // The whole object depends on the spread; completion needs a re-run.
                            return self.propagate_failure(span, value);
                        }
                        // TODO(parity): upstream also spreads `ResolvedModule` namespaces; a
                        // namespace-import spread arrives here as an Incomplete hole instead
                        // (handled above) and resolves through the driver.
                        _ => {
                            let inner = DynamicValue {
                                file: self.file(),
                                span: spread.span,
                                reason: DynamicReason::InvalidExpressionType,
                            };
                            return self.chain_dynamic(span, inner);
                        }
                    }
                }
            }
        }
        ResolvedValue::Map(map)
    }

    fn visit_unary(
        &self,
        operator: UnaryOperator,
        argument: &Expression<'a>,
        span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        let value = self.visit_expression(argument, scope);
        if let ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) = value {
            return self.propagate_failure(span, value);
        }
        match operator {
            UnaryOperator::LogicalNot => ResolvedValue::Boolean(!is_truthy(&value)),
            UnaryOperator::UnaryPlus | UnaryOperator::UnaryNegation | UnaryOperator::BitwiseNot => {
                // NOTE: slightly stricter than upstream, which applies raw JS coercion (so e.g.
                // `-[1]` would be NaN there); non-primitive operands are rare in metadata.
                let Some(n) = self.literal_to_number(&value) else {
                    return self.dynamic(span, DynamicReason::InvalidExpressionType);
                };
                match operator {
                    UnaryOperator::UnaryPlus => ResolvedValue::Number(n),
                    UnaryOperator::UnaryNegation => ResolvedValue::Number(-n),
                    UnaryOperator::BitwiseNot => ResolvedValue::Number(!to_int32(n) as f64),
                    _ => unreachable!(),
                }
            }
            // Parity: `typeof`/`void`/`delete` are absent from upstream's unary table.
            UnaryOperator::Typeof | UnaryOperator::Void | UnaryOperator::Delete => {
                self.dynamic(span, DynamicReason::UnsupportedSyntax)
            }
        }
    }

    // ---------------------------------------------------------------- identifiers

    fn visit_reference(
        &self,
        ref_id: oxc_semantic::ReferenceId,
        name: &str,
        span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        let scoping = self.input.semantic.scoping();
        let reference = scoping.get_reference(ref_id);
        let Some(symbol_id) = reference.symbol_id() else {
            // Unresolved global. `undefined` is the only one with a static value.
            if name == "undefined" {
                return ResolvedValue::Undefined;
            }
            return self.dynamic(span, DynamicReason::UnknownIdentifier(name.to_string()));
        };

        if let Some(value) = scope.get(&symbol_id) {
            return value.clone();
        }

        let flags = scoping.symbol_flags(symbol_id);
        if flags.contains(SymbolFlags::Import) {
            let local_name = scoping.symbol_name(symbol_id);
            let Some(imported) = self.input.import_map.get(local_name) else {
                return self.dynamic(span, DynamicReason::UnknownIdentifier(name.to_string()));
            };
            let target = UnresolvedReference {
                importer: self.file(),
                specifier: imported.source.clone(),
                symbol: imported.kind.clone(),
                local_name: Some(local_name.to_string()),
                is_namespace_member: false,
            };
            return self.import_hole(span, target);
        }

        self.visit_declaration(symbol_id, span, scope)
    }

    /// The reference we couldn't chase: consult the env (Semantic mode), else emit a hole.
    fn import_hole(&self, span: Span, target: UnresolvedReference) -> ResolvedValue {
        let key = HoleKey::Reference(target.clone());
        if let Some(value) = self.lookup_env(&key) {
            return value;
        }
        ResolvedValue::incomplete(
            self.file(),
            span,
            self.current_node_id.get(),
            IncompleteDep::Reference(target),
        )
    }

    fn visit_declaration(
        &self,
        symbol_id: oxc_semantic::SymbolId,
        usage_span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        let old_traversed = self.traversed_reference.get();
        self.traversed_reference.set(true);
        let result = self.visit_declaration_inner(symbol_id, usage_span, scope);
        self.traversed_reference.set(old_traversed);
        result
    }

    fn visit_declaration_inner(
        &self,
        symbol_id: oxc_semantic::SymbolId,
        usage_span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        let semantic = self.input.semantic;
        let name = semantic.scoping().symbol_name(symbol_id).to_string();
        let decl_node = semantic.symbol_declaration(symbol_id);
        match decl_node.kind() {
            AstKind::Class(class) => ResolvedValue::Reference(self.make_reference(
                name,
                Some(symbol_id),
                class.span,
                DeclKind::Class,
            )),
            AstKind::Function(function) => ResolvedValue::Reference(self.make_reference(
                name,
                Some(symbol_id),
                function.span,
                DeclKind::Function,
            )),
            AstKind::TSEnumDeclaration(enum_decl) => {
                self.visit_enum_declaration(enum_decl, symbol_id, scope)
            }
            AstKind::VariableDeclarator(declarator) => {
                let BindingPattern::BindingIdentifier(_) = &declarator.id else {
                    return self.visit_binding_element(declarator, symbol_id, usage_span, scope);
                };
                if !self.visiting.borrow_mut().insert(symbol_id) {
                    // `const a = b; const b = a;` — cyclic local constant chain.
                    return self.dynamic(usage_span, DynamicReason::Unknown);
                }
                let result = match &declarator.init {
                    Some(init) => self.visit_expression(init, scope),
                    None if self.is_declared_variable(decl_node.id()) => {
                        let mut type_val = None;
                        if let Some(type_annotation) = &declarator.type_annotation {
                            let val = self.visit_type(&type_annotation.type_annotation, scope);
                            if !matches!(val, ResolvedValue::Dynamic(_)) {
                                type_val = Some(val);
                            }
                        }
                        type_val.unwrap_or_else(|| {
                            ResolvedValue::Reference(self.make_reference(
                                name,
                                Some(symbol_id),
                                declarator.span,
                                DeclKind::Variable,
                            ))
                        })
                    }
                    None => ResolvedValue::Undefined,
                };
                self.visiting.borrow_mut().remove(&symbol_id);
                result
            }
            // A parameter that is not in the current scope map: we are not evaluating the
            // enclosing function's body, so its value is unknowable. (Upstream falls through to
            // a Reference-to-parameter here; ours is stricter.)
            AstKind::FormalParameter(_) => self.dynamic(usage_span, DynamicReason::Unknown),
            _ => ResolvedValue::Reference(self.make_reference(
                name,
                Some(symbol_id),
                decl_node.kind().span(),
                DeclKind::Other,
            )),
        }
    }

    /// Resolve an identifier bound by a destructuring pattern: replay the path from the pattern
    /// down to the binding as property accesses over the declaration's initializer.
    ///
    /// Upstream walks *up* from the `ts.BindingElement` it was handed. oxc attributes every
    /// destructured binding to the enclosing `VariableDeclarator`, so this walks *down* from the
    /// pattern looking for `symbol_id`. The resulting path is identical.
    /// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.ts#L651-L695
    fn visit_binding_element(
        &self,
        declarator: &VariableDeclarator<'a>,
        symbol_id: oxc_semantic::SymbolId,
        usage_span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        let mut path = Vec::new();
        match collect_binding_path(&declarator.id, symbol_id, &mut path) {
            BindingPathSearch::Found => {}
            BindingPathSearch::Unsupported(span) => {
                return self.dynamic(span, DynamicReason::Unknown);
            }
            BindingPathSearch::NotFound => return self.dynamic(usage_span, DynamicReason::Unknown),
        }

        // Nothing to destructure: `for (const {a} of xs)` lands here.
        let element_span = path.last().map_or(usage_span, |step| step.span);
        let Some(init) = &declarator.init else {
            return self.dynamic(element_span, DynamicReason::Unknown);
        };

        if !self.visiting.borrow_mut().insert(symbol_id) {
            // `const {a} = b; const b = {a};` — cyclic local constant chain.
            return self.dynamic(usage_span, DynamicReason::Unknown);
        }
        let mut value = self.visit_expression(init, scope);
        for step in &path {
            value = self.access(step.span, value, step.key, scope);
            if matches!(value, ResolvedValue::Dynamic(_)) {
                // Upstream returns the dynamic value as-is, without a link per remaining step.
                break;
            }
        }
        self.visiting.borrow_mut().remove(&symbol_id);
        value
    }

    fn is_declared_variable(&self, declarator_node_id: oxc_semantic::NodeId) -> bool {
        let parent = self.input.semantic.nodes().parent_node(declarator_node_id);
        let AstKind::VariableDeclaration(decl) = parent.kind() else {
            return false;
        };
        decl.declare
    }

    /// Mirror of upstream `visitEnumDeclaration`: a `Map` of member name → [`EnumValue`].
    ///
    /// NOTE: parity quirk preserved — an uninitialized member resolves to its *index*, so
    /// `enum E { A = 5, B }` gives `B == 1` (not 6), exactly like upstream.
    fn visit_enum_declaration(
        &self,
        enum_decl: &TSEnumDeclaration<'a>,
        symbol_id: oxc_semantic::SymbolId,
        scope: &Scope,
    ) -> ResolvedValue {
        let enum_ref = self.make_reference(
            enum_decl.id.name.to_string(),
            Some(symbol_id),
            enum_decl.span,
            DeclKind::Enum,
        );
        let mut map = ValueMap::new();
        for (index, member) in enum_decl.body.members.iter().enumerate() {
            let name = match &member.id {
                TSEnumMemberName::Identifier(ident) => ident.name.to_string(),
                TSEnumMemberName::String(s) | TSEnumMemberName::ComputedString(s) => {
                    s.value.to_string()
                }
                TSEnumMemberName::ComputedTemplateString(t) => {
                    let ResolvedValue::String(s) = self.visit_template(t, scope) else {
                        continue;
                    };
                    s
                }
            };
            let resolved = match &member.initializer {
                Some(init) => self.visit_expression(init, scope),
                None => ResolvedValue::Number(index as f64),
            };
            map.insert(
                name.clone(),
                ResolvedValue::EnumValue(Box::new(EnumValue {
                    enum_ref: enum_ref.clone(),
                    name,
                    resolved,
                })),
            );
        }
        ResolvedValue::Map(map)
    }

    fn make_reference(
        &self,
        name: String,
        symbol_id: Option<oxc_semantic::SymbolId>,
        span: Span,
        kind: DeclKind,
    ) -> ValueReference {
        let reference_id = symbol_id.map(|sym| ReferenceId::new(self.file(), sym));
        ValueReference {
            file: self.file(),
            name,
            member: None,
            reference_id,
            span,
            kind,
            owning_reference: None,
            synthetic: false,
            // A symbol resolved inside the file being evaluated; `Reference` seeds the
            // declaring file's own name, so there is no chain to record here.
            aliases: Vec::new(),
            is_default_export: false,
        }
    }

    // ---------------------------------------------------------------- property access

    fn access(
        &self,
        span: Span,
        lhs: ResolvedValue,
        key: AccessKey<'_>,
        scope: &Scope,
    ) -> ResolvedValue {
        match lhs {
            ResolvedValue::Dynamic(_) => self.propagate_failure(span, lhs),
            ResolvedValue::Incomplete(hole) => {
                // Namespace-import refinement: `ns.Foo` is the same kind of unresolved
                // reference as a named import of `Foo`, so refine the hole instead of giving
                // up — the driver never needs an upstream-style `ResolvedModule`.
                if let IncompleteDep::Reference(unresolved) = &hole.dep {
                    if unresolved.symbol == ImportKind::Namespace {
                        if let AccessKey::Str(member) = key {
                            let refined = UnresolvedReference {
                                importer: unresolved.importer,
                                specifier: unresolved.specifier.clone(),
                                symbol: ImportKind::Named(member.to_string()),
                                // The importer binds the namespace, not the member.
                                local_name: None,
                                is_namespace_member: true,
                            };
                            return self.import_hole(span, refined);
                        }
                    }
                }
                self.propagate_failure(span, ResolvedValue::Incomplete(hole))
            }
            ResolvedValue::Map(map) => {
                let key_str = key.as_string();
                map.get(&key_str)
                    .cloned()
                    .unwrap_or(ResolvedValue::Undefined)
            }
            ResolvedValue::Array(items) => match &key {
                AccessKey::Str("length") => {
                    // A spread hole contributes an unknown number of elements.
                    if let Some(spread) = first_spread_hole(&items) {
                        return self.propagate_failure(span, spread.clone());
                    }
                    ResolvedValue::Number(items.len() as f64)
                }
                AccessKey::Str("slice") => ResolvedValue::KnownFn(KnownFn::ArraySlice(items)),
                AccessKey::Str("concat") => ResolvedValue::KnownFn(KnownFn::ArrayConcat(items)),
                _ => {
                    let Some(index) = key.as_array_index() else {
                        return self.dynamic(span, DynamicReason::InvalidExpressionType);
                    };
                    // Positions from a spread hole on are unknown until it completes.
                    let known = items.get(..=index).unwrap_or(&items);
                    if let Some(spread) = first_spread_hole(known) {
                        return self.propagate_failure(span, spread.clone());
                    }
                    items
                        .get(index)
                        .cloned()
                        .unwrap_or(ResolvedValue::Undefined)
                }
            },
            ResolvedValue::String(s) => match key {
                AccessKey::Str("concat") => ResolvedValue::KnownFn(KnownFn::StringConcat(s)),
                // Parity: upstream supports *only* `string.concat`.
                // TODO(parity-extension): `string.length` would be trivial and useful.
                _ => self.dynamic(span, DynamicReason::Unknown),
            },
            ResolvedValue::Reference(reference) => {
                let AccessKey::Str(member) = key else {
                    return self.dynamic(span, DynamicReason::Unknown);
                };
                if reference.file != self.file() {
                    // Foreign reference (placed by the driver's env): member resolution must
                    // happen in the declaring file.
                    let hole_key = HoleKey::Member {
                        base: reference.clone(),
                        member: member.to_string(),
                    };
                    if let Some(value) = self.lookup_env(&hole_key) {
                        return value;
                    }
                    return ResolvedValue::incomplete(
                        self.file(),
                        span,
                        self.current_node_id.get(),
                        IncompleteDep::Member {
                            base: reference,
                            member: member.to_string(),
                        },
                    );
                }
                if reference.kind == DeclKind::Class {
                    return self.class_static_access(&reference, member, span, scope);
                }
                self.dynamic(span, DynamicReason::ExternalReference(Box::new(reference)))
            }
            ResolvedValue::Synthetic(_) => self.dynamic(span, DynamicReason::SyntheticInput),
            // EnumValue, KnownFn, Null, Undefined, Number, Boolean.
            _ => self.dynamic(span, DynamicReason::Unknown),
        }
    }

    /// Static member lookup on a class declared in this file (upstream `accessHelper`'s
    /// class branch).
    fn class_static_access(
        &self,
        class_ref: &ValueReference,
        member: &str,
        span: Span,
        scope: &Scope,
    ) -> ResolvedValue {
        let Some(class) = self.find_class_node(class_ref) else {
            return self.dynamic(span, DynamicReason::Unknown);
        };
        for element in &class.body.body {
            match element {
                ClassElement::PropertyDefinition(prop) if prop.r#static => {
                    let Some(name) = crate::analyzer::utils::extract_property_key(&prop.key) else {
                        continue;
                    };
                    if name != member {
                        continue;
                    }
                    let Some(init) = &prop.value else {
                        return ResolvedValue::Reference(ValueReference {
                            member: Some(member.to_string()),
                            span: prop.span,
                            kind: DeclKind::Other,
                            ..class_ref.clone()
                        });
                    };
                    return self.visit_expression(init, scope);
                }
                ClassElement::MethodDefinition(method) if method.r#static => {
                    let Some(name) = crate::analyzer::utils::extract_property_key(&method.key)
                    else {
                        continue;
                    };
                    if name != member {
                        continue;
                    }
                    return ResolvedValue::Reference(ValueReference {
                        member: Some(member.to_string()),
                        span: method.span,
                        kind: DeclKind::StaticMethod,
                        ..class_ref.clone()
                    });
                }
                _ => {}
            }
        }
        // Parity: a missing static member is `undefined`, like any missing JS property.
        ResolvedValue::Undefined
    }

    fn find_class_node(&self, class_ref: &ValueReference) -> Option<&'a Class<'a>> {
        if class_ref.file != self.input.file {
            return None;
        }
        let symbol_id = match class_ref.reference_id {
            Some(ref_id) => ref_id.symbol,
            None => self
                .input
                .semantic
                .scoping()
                .get_root_binding(class_ref.name.as_str().into())?,
        };
        let node = self.input.semantic.symbol_declaration(symbol_id);
        let AstKind::Class(class) = node.kind() else {
            return None;
        };
        Some(class)
    }

    fn visit_chain(&self, chain: &ChainExpression<'a>, span: Span, scope: &Scope) -> ResolvedValue {
        // Parity: optionality (`?.`) is ignored — upstream takes the normal access path.
        use oxc_ast::ast::ChainElement;
        match &chain.expression {
            ChainElement::CallExpression(call) => self.visit_call(call, scope),
            ChainElement::TSNonNullExpression(e) => self.visit_expression(&e.expression, scope),
            other => {
                let Some(member) = other.as_member_expression() else {
                    return self.dynamic(span, DynamicReason::UnsupportedSyntax);
                };
                use oxc_ast::ast::MemberExpression;
                match member {
                    MemberExpression::StaticMemberExpression(m) => {
                        let lhs = self.visit_expression(&m.object, scope);
                        self.access(span, lhs, AccessKey::Str(m.property.name.as_str()), scope)
                    }
                    MemberExpression::ComputedMemberExpression(m) => {
                        let key = self.visit_expression(&m.expression, scope);
                        let lhs = self.visit_expression(&m.object, scope);
                        match key {
                            ResolvedValue::String(s) => {
                                self.access(span, lhs, AccessKey::Str(&s), scope)
                            }
                            ResolvedValue::Number(n) => {
                                self.access(span, lhs, AccessKey::Num(n), scope)
                            }
                            _ => self.dynamic(span, DynamicReason::InvalidExpressionType),
                        }
                    }
                    MemberExpression::PrivateFieldExpression(_) => {
                        self.dynamic(span, DynamicReason::UnsupportedSyntax)
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------- calls

    fn visit_call(&self, call: &CallExpression<'a>, scope: &Scope) -> ResolvedValue {
        let span = call.span;
        let callee = self.visit_expression(&call.callee, scope);
        match callee {
            ResolvedValue::Dynamic(_) => self.propagate_failure(span, callee),
            ResolvedValue::Incomplete(hole) => {
                // The callee is an unresolved import: give foreign-function recognizers a shot
                // (this is how `forwardRef` works even in pure Syntax mode).
                if let IncompleteDep::Reference(unresolved) = &hole.dep {
                    let imported = ImportedSymbol {
                        source: unresolved.specifier.clone(),
                        kind: unresolved.symbol.clone(),
                    };
                    let mut resolve =
                        |expr: &Expression<'a>| self.resolve_ffr_expression(expr, scope);
                    for foreign_fn in self.input.foreign {
                        let Some(result) =
                            foreign_fn.resolve_import_call(&imported, call, &mut resolve)
                        else {
                            continue;
                        };
                        return result;
                    }
                }
                // Unclaimed: the call wraps the callee hole; the driver resolves the import and
                // the next pass sees a foreign Reference (emitting a Call hole).
                self.propagate_failure(span, ResolvedValue::Incomplete(hole))
            }
            ResolvedValue::KnownFn(known) => {
                let args = self.evaluate_args(call, scope);
                self.apply_known_fn(known, args, span)
            }
            ResolvedValue::Reference(reference) => {
                // Check foreign recognizers on the resolved callee before deferring cross-file calls.
                {
                    let mut resolve =
                        |expr: &Expression<'a>| self.resolve_ffr_expression(expr, scope);
                    for foreign_fn in self.input.foreign {
                        if let Some(result) =
                            foreign_fn.resolve_reference_call(&reference, call, &mut resolve)
                        {
                            return result;
                        }
                    }
                }
                if reference.file != self.file() {
                    // Foreign function-like reference: the call must be evaluated in its
                    // declaring file.
                    let args = self.evaluate_args(call, scope);
                    let hole_key = HoleKey::Call {
                        callee: reference.clone(),
                        args_fingerprint: fingerprint_args(&args),
                    };
                    if let Some(value) = self.lookup_env(&hole_key) {
                        return value;
                    }
                    return ResolvedValue::incomplete(
                        self.file(),
                        span,
                        self.current_node_id.get(),
                        IncompleteDep::Call {
                            callee: reference,
                            args,
                        },
                    );
                }
                let Some(target) = self.resolve_function_target(&reference) else {
                    return self.dynamic(span, DynamicReason::InvalidExpressionType);
                };
                let args = self.evaluate_args(call, scope);
                self.call_function(&target, &reference, args, span)
            }
            ResolvedValue::Synthetic(_) => self.dynamic(span, DynamicReason::SyntheticInput),
            _ => self.dynamic(span, DynamicReason::InvalidExpressionType),
        }
    }

    /// Evaluate an expression on behalf of a foreign-function resolver, marking any resulting
    /// reference synthetic (upstream `visitFfrExpression`).
    fn resolve_ffr_expression(&self, expr: &Expression<'a>, scope: &Scope) -> ResolvedValue {
        let value = self.visit_expression_direct(expr, scope);
        crate::evaluator::value::mark_value_synthetic(value)
    }

    fn evaluate_args(&self, call: &CallExpression<'a>, scope: &Scope) -> Vec<ResolvedValue> {
        let mut args = Vec::with_capacity(call.arguments.len());
        for argument in &call.arguments {
            match argument {
                Argument::SpreadElement(spread) => {
                    self.spread_into(&spread.argument, spread.span, scope, &mut args);
                }
                _ => {
                    let Some(expr) = argument.as_expression() else {
                        continue;
                    };
                    args.push(self.visit_expression(expr, scope));
                }
            }
        }
        args
    }

    fn apply_known_fn(
        &self,
        known: KnownFn,
        args: Vec<ResolvedValue>,
        span: Span,
    ) -> ResolvedValue {
        // A hole among the arguments makes the builtin's result non-final; defer to a re-run.
        if let Some(hole) = args.iter().find(|a| a.is_incomplete()) {
            return self.propagate_failure(span, hole.clone());
        }
        known.evaluate(self.file(), span, args)
    }

    fn resolve_function_target(&self, reference: &ValueReference) -> Option<FunctionTarget<'a>> {
        match reference.kind {
            DeclKind::Function => {
                let symbol_id = self.reference_symbol_id(reference)?;
                let node = self.input.semantic.symbol_declaration(symbol_id);
                let AstKind::Function(function) = node.kind() else {
                    return None;
                };
                Some(FunctionTarget::Function(function))
            }
            DeclKind::StaticMethod => {
                let member = reference.member.as_deref()?;
                let class_ref = ValueReference {
                    member: None,
                    kind: DeclKind::Class,
                    ..reference.clone()
                };
                let class = self.find_class_node(&class_ref)?;
                for element in &class.body.body {
                    let ClassElement::MethodDefinition(method) = element else {
                        continue;
                    };
                    if !method.r#static {
                        continue;
                    }
                    let Some(name) = crate::analyzer::utils::extract_property_key(&method.key)
                    else {
                        continue;
                    };
                    if name == member {
                        return Some(FunctionTarget::Function(&method.value));
                    }
                }
                None
            }
            _ => None,
        }
    }

    fn reference_symbol_id(&self, reference: &ValueReference) -> Option<oxc_semantic::SymbolId> {
        if reference.file != self.input.file {
            return None;
        }
        if let Some(ref_id) = reference.reference_id {
            return Some(ref_id.symbol);
        }
        self.input
            .semantic
            .scoping()
            .get_root_binding(reference.name.as_str().into())
    }

    fn call_function(
        &self,
        target: &FunctionTarget<'a>,
        callee: &ValueReference,
        args: Vec<ResolvedValue>,
        call_span: Span,
    ) -> ResolvedValue {
        let Some(return_expr) = target.single_return_expression() else {
            if target.has_body() {
                // Body present but not a single `return` statement.
                let fallback = self.dynamic(call_span, DynamicReason::ComplexFunctionCall);
                return self
                    .try_foreign_function_call(target, callee, call_span, &args)
                    .unwrap_or(fallback);
            }
            // Body-less declaration (`.d.ts` / `declare` / overload signature): foreign
            // recognizers first (ModuleWithProviders return-type inspection lives here).
            let Some(result) = self.try_foreign_function_call(target, callee, call_span, &args)
            else {
                return self.dynamic(
                    call_span,
                    DynamicReason::ExternalReference(Box::new(callee.clone())),
                );
            };
            return result;
        };

        let callee_scope = self.bind_params(target.params(), &args);
        let result = match return_expr {
            Some(expr) => self.visit_expression(expr, &callee_scope),
            // `return;` — explicit undefined.
            None => ResolvedValue::Undefined,
        };
        if result.is_dynamic() {
            // Upstream ordering: a dynamic body result still gets a foreign-function fallback.
            if let Some(ffr) = self.try_foreign_function_call(target, callee, call_span, &args) {
                return ffr;
            }
        }
        match result {
            ResolvedValue::Dynamic(d) => self.chain_dynamic_boxed(call_span, d),
            other => other,
        }
    }

    fn try_foreign_function_call(
        &self,
        target: &FunctionTarget<'a>,
        callee: &ValueReference,
        call_span: Span,
        args: &[ResolvedValue],
    ) -> Option<ResolvedValue> {
        let mut resolve_type =
            |name: TypeNameRef<'_, 'a>| self.resolve_type_name(name, &Scope::new());
        for foreign_fn in self.input.foreign {
            let result = foreign_fn.resolve_function_call(
                target,
                callee,
                call_span,
                args,
                self.input,
                &mut resolve_type,
            );
            if result.is_some() {
                return result;
            }
        }
        None
    }

    fn bind_params(&self, params: &FormalParameters<'a>, args: &[ResolvedValue]) -> Scope {
        let mut scope = Scope::new();
        for (index, param) in params.items.iter().enumerate() {
            // Destructured parameters bind nothing: body identifiers referencing them resolve
            // to a FormalParameter declaration and evaluate to Dynamic (upstream-equivalent
            // failure mode).
            let BindingPattern::BindingIdentifier(binding) = &param.pattern else {
                continue;
            };
            let Some(symbol_id) = binding.symbol_id.get() else {
                continue;
            };
            let value = match args.get(index) {
                Some(arg) => arg.clone(),
                None => match &param.initializer {
                    // Default parameter values are evaluated in the callee's context with the
                    // parameters bound so far (upstream parity).
                    Some(init) => self.visit_expression(init, &scope),
                    None => ResolvedValue::Undefined,
                },
            };
            scope.insert(symbol_id, value);
        }
        if let Some(rest) = &params.rest {
            if let BindingPattern::BindingIdentifier(binding) = &rest.rest.argument {
                if let Some(symbol_id) = binding.symbol_id.get() {
                    let rest_args = args.get(params.items.len()..).unwrap_or(&[]).to_vec();
                    scope.insert(symbol_id, ResolvedValue::Array(rest_args));
                }
            }
        }
        scope
    }

    // ---------------------------------------------------------------- type names (for FFRs)

    /// Resolve a type-position name (e.g. the `T` in `ModuleWithProviders<T>`) to a value.
    /// oxc's `Semantic` resolves type references through the same reference table, so this
    /// funnels into the standard identifier machinery (class → `Reference`, import → hole).
    pub(crate) fn resolve_type_name(
        &self,
        name: TypeNameRef<'_, 'a>,
        scope: &Scope,
    ) -> ResolvedValue {
        match name {
            TypeNameRef::Ident(ident) => {
                let Some(ref_id) = ident.reference_id.get() else {
                    return self.dynamic(
                        ident.span,
                        DynamicReason::UnknownIdentifier(ident.name.to_string()),
                    );
                };
                self.visit_reference(ref_id, &ident.name, ident.span, scope)
            }
            TypeNameRef::Qualified(qualified) => {
                let left = match &qualified.left {
                    oxc_ast::ast::TSTypeName::IdentifierReference(ident) => {
                        self.resolve_type_name(TypeNameRef::Ident(ident), scope)
                    }
                    oxc_ast::ast::TSTypeName::QualifiedName(inner) => {
                        self.resolve_type_name(TypeNameRef::Qualified(inner), scope)
                    }
                    oxc_ast::ast::TSTypeName::ThisExpression(_) => {
                        return self.dynamic(qualified.span, DynamicReason::UnsupportedSyntax);
                    }
                };
                self.access(
                    qualified.span,
                    left,
                    AccessKey::Str(qualified.right.name.as_str()),
                    scope,
                )
            }
        }
    }

    // ---------------------------------------------------------------- operators

    fn apply_binary_op(
        &self,
        operator: BinaryOperator,
        lhs: ResolvedValue,
        rhs: ResolvedValue,
        span: Span,
        lhs_span: Span,
        rhs_span: Span,
    ) -> ResolvedValue {
        if let ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) = lhs {
            return self.propagate_failure(span, lhs);
        }
        if let ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) = rhs {
            return self.propagate_failure(span, rhs);
        }
        // Parity: `in`/`instanceof` are absent from upstream's operator table.
        if matches!(operator, BinaryOperator::In | BinaryOperator::Instanceof) {
            return self.dynamic(span, DynamicReason::UnsupportedSyntax);
        }
        // All remaining operators are "literal" ops: operands must reduce to primitives
        // (unwrapping EnumValue), mirroring upstream's `literal()` gate.
        let Some(lhs) = literal_of(lhs) else {
            return self.literal_gate_failure(span, lhs_span);
        };
        let Some(rhs) = literal_of(rhs) else {
            return self.literal_gate_failure(span, rhs_span);
        };

        use BinaryOperator::*;
        match operator {
            Addition => match (&lhs, &rhs) {
                (Lit::Str(_), _) | (_, Lit::Str(_)) => ResolvedValue::String(format!(
                    "{}{}",
                    lit_to_js_string(&lhs),
                    lit_to_js_string(&rhs)
                )),
                _ => ResolvedValue::Number(lit_to_number(&lhs) + lit_to_number(&rhs)),
            },
            Subtraction => ResolvedValue::Number(lit_to_number(&lhs) - lit_to_number(&rhs)),
            Multiplication => ResolvedValue::Number(lit_to_number(&lhs) * lit_to_number(&rhs)),
            Division => ResolvedValue::Number(lit_to_number(&lhs) / lit_to_number(&rhs)),
            Remainder => ResolvedValue::Number(lit_to_number(&lhs) % lit_to_number(&rhs)),
            Exponential => ResolvedValue::Number(lit_to_number(&lhs).powf(lit_to_number(&rhs))),
            BitwiseAnd => ResolvedValue::Number(
                (to_int32(lit_to_number(&lhs)) & to_int32(lit_to_number(&rhs))) as f64,
            ),
            BitwiseOR => ResolvedValue::Number(
                (to_int32(lit_to_number(&lhs)) | to_int32(lit_to_number(&rhs))) as f64,
            ),
            BitwiseXOR => ResolvedValue::Number(
                (to_int32(lit_to_number(&lhs)) ^ to_int32(lit_to_number(&rhs))) as f64,
            ),
            ShiftLeft => ResolvedValue::Number(
                (to_int32(lit_to_number(&lhs)) << (to_uint32(lit_to_number(&rhs)) & 31)) as f64,
            ),
            ShiftRight => ResolvedValue::Number(
                (to_int32(lit_to_number(&lhs)) >> (to_uint32(lit_to_number(&rhs)) & 31)) as f64,
            ),
            ShiftRightZeroFill => ResolvedValue::Number(
                (to_uint32(lit_to_number(&lhs)) >> (to_uint32(lit_to_number(&rhs)) & 31)) as f64,
            ),
            LessThan | LessEqualThan | GreaterThan | GreaterEqualThan => {
                let result = match (&lhs, &rhs) {
                    (Lit::Str(a), Lit::Str(b)) => match operator {
                        LessThan => a < b,
                        LessEqualThan => a <= b,
                        GreaterThan => a > b,
                        _ => a >= b,
                    },
                    _ => {
                        let (a, b) = (lit_to_number(&lhs), lit_to_number(&rhs));
                        match operator {
                            LessThan => a < b,
                            LessEqualThan => a <= b,
                            GreaterThan => a > b,
                            _ => a >= b,
                        }
                    }
                };
                ResolvedValue::Boolean(result)
            }
            StrictEquality => ResolvedValue::Boolean(lit_strict_equals(&lhs, &rhs)),
            StrictInequality => ResolvedValue::Boolean(!lit_strict_equals(&lhs, &rhs)),
            Equality => ResolvedValue::Boolean(lit_loose_equals(&lhs, &rhs)),
            Inequality => ResolvedValue::Boolean(!lit_loose_equals(&lhs, &rhs)),
            In | Instanceof => unreachable!(),
        }
    }

    fn literal_gate_failure(&self, span: Span, operand_span: Span) -> ResolvedValue {
        let inner = DynamicValue {
            file: self.file(),
            span: operand_span,
            reason: DynamicReason::InvalidExpressionType,
        };
        self.chain_dynamic(span, inner)
    }

    fn literal_to_number(&self, value: &ResolvedValue) -> Option<f64> {
        let lit = literal_of(value.clone())?;
        Some(lit_to_number(&lit))
    }
}

// -------------------------------------------------------------------- access keys

#[derive(Clone, Copy)]
enum AccessKey<'k> {
    Str(&'k str),
    Num(f64),
}

enum AccessKeyOwned {
    Str(String),
    Num(f64),
}

// ------------------------------------------------------------- destructuring binding paths

/// One property access on the way from a destructuring declaration's initializer down to a
/// single bound name. `span` is the binding element the access came from, matching the node
/// upstream passes to `accessHelper`.
struct BindingPathStep<'a> {
    key: AccessKey<'a>,
    span: Span,
}

/// Outcome of searching a binding pattern for the symbol being resolved.
enum BindingPathSearch {
    NotFound,
    Found,
    /// Found, but its path runs through a computed, string-literal or numeric key.
    Unsupported(Span),
}

/// Collect the property accesses leading from a destructuring declaration's initializer to the
/// binding of `target`.
fn collect_binding_path<'a>(
    pattern: &BindingPattern<'a>,
    target: oxc_semantic::SymbolId,
    path: &mut Vec<BindingPathStep<'a>>,
) -> BindingPathSearch {
    match pattern {
        BindingPattern::BindingIdentifier(id) => {
            if id.symbol_id.get() == Some(target) {
                BindingPathSearch::Found
            } else {
                BindingPathSearch::NotFound
            }
        }
        // A default (`const {a = 1} = init`) is not a path step, and upstream never evaluates it:
        // a missing property resolves to `undefined`, not to the default.
        BindingPattern::AssignmentPattern(assignment) => {
            collect_binding_path(&assignment.left, target, path)
        }
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                let Some(name) = static_property_name(property) else {
                    // Descend even though the key is unusable: if `target` is under it the path
                    // is unsupported, otherwise a sibling may still bind it.
                    let mark = path.len();
                    match collect_binding_path(&property.value, target, path) {
                        BindingPathSearch::NotFound => {
                            path.truncate(mark);
                            continue;
                        }
                        _ => return BindingPathSearch::Unsupported(property.span),
                    }
                };
                match descend(
                    path,
                    AccessKey::Str(name),
                    property.span,
                    &property.value,
                    target,
                ) {
                    BindingPathSearch::NotFound => {}
                    found => return found,
                }
            }
            // Upstream has no `dotDotDotToken` case, so a rest binding's own name becomes the
            // property key and `const {a, ...rest} = init` resolves `rest` to `init.rest`.
            // Mirrored deliberately: diverging would reject sources ngtsc compiles.
            if let Some(rest) = &object.rest {
                let BindingPattern::BindingIdentifier(id) = &rest.argument else {
                    return BindingPathSearch::NotFound;
                };
                if id.symbol_id.get() == Some(target) {
                    path.push(BindingPathStep {
                        key: AccessKey::Str(id.name.as_str()),
                        span: rest.span,
                    });
                    return BindingPathSearch::Found;
                }
            }
            BindingPathSearch::NotFound
        }
        BindingPattern::ArrayPattern(array) => {
            // Upstream key: `element.parent.elements.indexOf(element)`, so elisions
            // (`const [, second] = init`) still occupy their slot.
            for (index, element) in array.elements.iter().enumerate() {
                let Some(element) = element else { continue };
                match descend(
                    path,
                    AccessKey::Num(index as f64),
                    element.span(),
                    element,
                    target,
                ) {
                    BindingPathSearch::NotFound => {}
                    found => return found,
                }
            }
            // As above: `const [a, ...rest] = init` resolves `rest` to `init[1]`. oxc stores the
            // rest element outside `elements`, so its index is the element count.
            if let Some(rest) = &array.rest {
                let key = AccessKey::Num(array.elements.len() as f64);
                return descend(path, key, rest.span, &rest.argument, target);
            }
            BindingPathSearch::NotFound
        }
    }
}

/// The statically nameable key of an object binding property, or `None` when upstream's
/// `ts.isIdentifier(element.propertyName || element.name)` guard would reject it.
fn static_property_name<'a>(property: &BindingProperty<'a>) -> Option<&'a str> {
    match (property.computed, &property.key) {
        (false, PropertyKey::StaticIdentifier(name)) => Some(name.name.as_str()),
        _ => None,
    }
}

/// Push `key` onto `path` and search `child` for `target`, rolling the step back if the
/// symbol is not bound underneath it.
fn descend<'a>(
    path: &mut Vec<BindingPathStep<'a>>,
    key: AccessKey<'a>,
    span: Span,
    child: &BindingPattern<'a>,
    target: oxc_semantic::SymbolId,
) -> BindingPathSearch {
    let mark = path.len();
    path.push(BindingPathStep { key, span });
    match collect_binding_path(child, target, path) {
        BindingPathSearch::NotFound => {
            path.truncate(mark);
            BindingPathSearch::NotFound
        }
        found => found,
    }
}

impl AccessKey<'_> {
    fn as_string(&self) -> String {
        match self {
            AccessKey::Str(s) => (*s).to_string(),
            AccessKey::Num(n) => js_number_to_string(*n),
        }
    }

    fn as_array_index(&self) -> Option<usize> {
        let n = match self {
            AccessKey::Num(n) => *n,
            AccessKey::Str(s) => s.parse::<f64>().ok()?,
        };
        if n.fract() != 0.0 || n < 0.0 {
            return None;
        }
        Some(n as usize)
    }
}

// -------------------------------------------------------------------- literal helpers

/// A primitive literal operand for the binary/unary operator tables.
enum Lit {
    Str(String),
    Num(f64),
    Bool(bool),
    Null,
    Undefined,
}

/// Upstream's `literal()` gate: reduce a resolved value to a primitive, unwrapping
/// [`EnumValue`]s; anything else is an invalid operand.
fn literal_of(value: ResolvedValue) -> Option<Lit> {
    match value {
        ResolvedValue::String(s) => Some(Lit::Str(s)),
        ResolvedValue::Number(n) => Some(Lit::Num(n)),
        ResolvedValue::Boolean(b) => Some(Lit::Bool(b)),
        ResolvedValue::Null => Some(Lit::Null),
        ResolvedValue::Undefined => Some(Lit::Undefined),
        ResolvedValue::EnumValue(ev) => literal_of(ev.resolved),
        _ => None,
    }
}

/// ECMA `ToNumber` over primitives.
fn lit_to_number(lit: &Lit) -> f64 {
    match lit {
        Lit::Num(n) => *n,
        Lit::Bool(true) => 1.0,
        Lit::Bool(false) => 0.0,
        Lit::Null => 0.0,
        Lit::Undefined => f64::NAN,
        Lit::Str(s) => {
            let trimmed = s.trim();
            if trimmed.is_empty() {
                0.0
            } else {
                trimmed.parse::<f64>().unwrap_or(f64::NAN)
            }
        }
    }
}

fn lit_to_js_string(lit: &Lit) -> String {
    match lit {
        Lit::Str(s) => s.clone(),
        Lit::Num(n) => js_number_to_string(*n),
        Lit::Bool(b) => if *b { "true" } else { "false" }.to_string(),
        Lit::Null => "null".to_string(),
        Lit::Undefined => "undefined".to_string(),
    }
}

fn lit_strict_equals(a: &Lit, b: &Lit) -> bool {
    match (a, b) {
        (Lit::Str(x), Lit::Str(y)) => x == y,
        (Lit::Num(x), Lit::Num(y)) => x == y, // NaN !== NaN falls out of f64 PartialEq.
        (Lit::Bool(x), Lit::Bool(y)) => x == y,
        (Lit::Null, Lit::Null) | (Lit::Undefined, Lit::Undefined) => true,
        _ => false,
    }
}

/// ECMA loose equality over primitives.
// TODO(parity): exotic corners of `==` coercion (upstream gets full JS `==` for free).
fn lit_loose_equals(a: &Lit, b: &Lit) -> bool {
    match (a, b) {
        (Lit::Null, Lit::Undefined) | (Lit::Undefined, Lit::Null) => true,
        (Lit::Null, _) | (_, Lit::Null) | (Lit::Undefined, _) | (_, Lit::Undefined) => {
            lit_strict_equals(a, b)
        }
        (Lit::Str(x), Lit::Str(y)) => x == y,
        (Lit::Bool(x), Lit::Bool(y)) => x == y,
        // Mixed number/string/boolean: compare via ToNumber.
        _ => lit_to_number(a) == lit_to_number(b),
    }
}

/// ECMA `ToInt32` (modular conversion).
fn to_int32(n: f64) -> i32 {
    to_uint32(n) as i32
}

/// ECMA `ToUint32` (modular conversion).
fn to_uint32(n: f64) -> u32 {
    if !n.is_finite() || n == 0.0 {
        return 0;
    }
    let n = n.trunc();
    let modulus = 4_294_967_296.0; // 2^32
    let r = n % modulus;
    let r = if r < 0.0 { r + modulus } else { r };
    r as u32
}
