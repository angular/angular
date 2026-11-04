use std::collections::{HashMap, HashSet};
use std::path::Path;

use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, BindingPattern, CallExpression, Class, ClassElement,
    Expression, FormalParameter, IdentifierReference, MethodDefinitionKind, ObjectPropertyKind,
    PropertyKey, PropertyKind, Statement, TSType, TSTypeAnnotation, TSTypeName,
};
use oxc_semantic::{Semantic, SymbolFlags};

use super::imports::{ImportKind, ImportedSymbol};
use super::utils::extract_property_key;
use crate::evaluator::strip_dts_alias_suffix;
use crate::query::{QueryCtx, ReferenceId};
use crate::utils::ANGULAR_CORE;
use crate::{DeclarationTuple, ResourceResolverFs};

const ANGULAR_RXJS_INTEROP: &str = "@angular/core/rxjs-interop";
const MAX_OBJECT_LITERAL_DEPTH: usize = 8;

/// Signal member facts extracted directly from a single class body (before inheritance).
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct OwnSignalFacts {
    /// Dot-separated signal member paths on the class (`"count"`, `"nested.count"`).
    pub signal_members: Vec<String>,
    /// Root member names explicitly declared on this class, used to shadow inherited base-class
    /// signals when a subclass overrides a member with a non-signal.
    pub declared_members: HashSet<String>,
}

/// Per-class signal facts indexed on [`crate::types::analysis::FileData`] so Stage 2 can walk
/// `extends` chains across source and `.d.ts` files, including undecorated base classes.
#[derive(Clone, Debug)]
pub struct ClassSignalFacts {
    pub reference_id: ReferenceId,
    pub class_name: String,
    pub own: OwnSignalFacts,
    pub super_class: Option<DeclarationTuple>,
}

pub(crate) fn ts_class_signal_facts(
    class: &Class<'_>,
    reference_id: ReferenceId,
    own: OwnSignalFacts,
    super_class: Option<DeclarationTuple>,
) -> Option<ClassSignalFacts> {
    let class_name = class.id.as_ref()?.name.to_string();
    Some(ClassSignalFacts {
        reference_id,
        class_name,
        own,
        super_class,
    })
}

pub(crate) fn dts_class_signal_facts<'a>(
    class: &Class<'a>,
    reference_id: ReferenceId,
    semantic: &Semantic<'a>,
    import_map: &HashMap<String, ImportedSymbol>,
    super_class: Option<DeclarationTuple>,
    signal_input_names: impl IntoIterator<Item = &'a str>,
) -> (OwnSignalFacts, Option<ClassSignalFacts>) {
    let mut own = extract_own_signal_facts(class, semantic, import_map, false, true);
    for name in signal_input_names {
        if !name.is_empty() && !name.contains('.') {
            own.declared_members.insert(name.to_string());
            push_unique(&mut own.signal_members, name.to_string());
        }
    }
    let class_facts = class.id.as_ref().map(|id| ClassSignalFacts {
        reference_id,
        class_name: id.name.to_string(),
        own: own.clone(),
        super_class,
    });
    (own, class_facts)
}

pub(crate) fn index_signal_facts(
    facts: Vec<ClassSignalFacts>,
) -> HashMap<String, ClassSignalFacts> {
    facts
        .into_iter()
        .map(|facts| (facts.class_name.clone(), facts))
        .collect()
}

#[derive(Default)]
struct OwnExtractState {
    own: OwnSignalFacts,
    /// Signal member paths rooted at an ECMAScript private field (`#count`, `#state.count`),
    /// stored without the leading `#`. Tracked only to resolve `this.#foo.asReadonly()` on the
    /// same class; never exposed on `OwnSignalFacts` since private fields cannot be read in
    /// templates or inherited.
    private_signals: Vec<String>,
    /// Members (`(name, is_private)`) with an explicit non-signal type annotation (such as a
    /// nullable union `Signal<string> | null`), preventing constructor assignments from treating
    /// them as non-nullable signals.
    explicit_non_signals: HashSet<(String, bool)>,
    /// Deferred `this.<path>.asReadonly()` / `this.#<path>.asReadonly()` aliases whose source
    /// member had not yet been recorded when visited.
    pending_readonly: Vec<PendingReadonly>,
}

struct PendingReadonly {
    target: String,
    target_is_private: bool,
    declare_root_on_resolve: bool,
    source: String,
    source_is_private: bool,
}

impl OwnExtractState {
    fn has_signal(&self, path: &str, is_private: bool) -> bool {
        if is_private {
            self.private_signals.iter().any(|s| s == path)
        } else {
            self.own.signal_members.iter().any(|s| s == path)
        }
    }

    fn record_signal(&mut self, path: String, is_private: bool, declare_root: bool) {
        if is_private {
            push_unique(&mut self.private_signals, path);
        } else {
            if declare_root {
                if let Some(root) = path.split('.').next() {
                    self.own.declared_members.insert(root.to_string());
                }
            }
            push_unique(&mut self.own.signal_members, path);
        }
    }

    fn resolve_pending_readonly(&mut self) {
        let Self {
            own,
            private_signals,
            pending_readonly,
            ..
        } = self;
        loop {
            let mut progressed = false;
            pending_readonly.retain(|item| {
                let is_known = if item.source_is_private {
                    private_signals.iter().any(|s| s == &item.source)
                } else {
                    own.signal_members.iter().any(|s| s == &item.source)
                };
                if !is_known {
                    return true;
                }
                if item.target_is_private {
                    push_unique(private_signals, item.target.clone());
                } else {
                    if item.declare_root_on_resolve {
                        if let Some(root) = item.target.split('.').next() {
                            own.declared_members.insert(root.to_string());
                        }
                    }
                    push_unique(&mut own.signal_members, item.target.clone());
                }
                progressed = true;
                false
            });
            if !progressed {
                break;
            }
        }
    }
}

/// Extract signal members and declared root member names from `class`'s own body.
pub(crate) fn extract_own_signal_facts<'a>(
    class: &Class<'a>,
    semantic: &Semantic<'a>,
    import_map: &HashMap<String, ImportedSymbol>,
    is_core: bool,
    in_declaration_file: bool,
) -> OwnSignalFacts {
    let mut state = OwnExtractState::default();
    let cx = SignalDetectCtx {
        semantic,
        import_map,
        is_core,
    };

    for element in &class.body.body {
        match element {
            ClassElement::PropertyDefinition(prop) if !prop.r#static => {
                cx.collect_field_signals(
                    &prop.key,
                    prop.computed,
                    prop.type_annotation.as_deref(),
                    prop.value.as_ref(),
                    &mut state,
                );
            }
            ClassElement::AccessorProperty(prop) if !prop.r#static => {
                cx.collect_field_signals(
                    &prop.key,
                    prop.computed,
                    prop.type_annotation.as_deref(),
                    prop.value.as_ref(),
                    &mut state,
                );
            }
            ClassElement::MethodDefinition(method) if !method.r#static => {
                if method.kind == MethodDefinitionKind::Constructor {
                    continue;
                }
                let Some(member) = member_key(&method.key, method.computed) else {
                    continue;
                };
                let (name, is_private): (&str, bool) = match &member {
                    MemberKey::Public(name) => {
                        state.own.declared_members.insert(name.to_string());
                        (name.as_ref(), false)
                    }
                    MemberKey::Private(name) => (name, true),
                };
                if method.kind == MethodDefinitionKind::Get
                    && method
                        .value
                        .return_type
                        .as_ref()
                        .is_some_and(|ret| cx.is_explicit_signal_type(&ret.type_annotation))
                {
                    state.record_signal(name.to_string(), is_private, false);
                }
            }
            _ => {}
        }
    }

    if let Some(ctor) = super::constructor_method(class, in_declaration_file) {
        for param in &ctor.value.params.items {
            extract_parameter_property_signal(param, &cx, &mut state);
        }

        if let Some(body) = &ctor.value.body {
            for stmt in &body.statements {
                cx.collect_ctor_statement_signals(stmt, &mut state);
            }
        }
    }

    state.resolve_pending_readonly();
    state.own
}

fn extract_parameter_property_signal<'a>(
    param: &FormalParameter<'a>,
    cx: &SignalDetectCtx<'a, '_>,
    state: &mut OwnExtractState,
) {
    if !param.has_modifier() {
        return;
    }
    let BindingPattern::BindingIdentifier(ident) = &param.pattern else {
        return;
    };
    let name = ident.name.as_str();
    if !is_valid_segment(name) {
        return;
    }
    state.own.declared_members.insert(name.to_string());
    if let Some(ann) = &param.type_annotation {
        if cx.is_explicit_signal_type(&ann.type_annotation) {
            state.record_signal(name.to_string(), false, false);
        } else {
            state.explicit_non_signals.insert((name.to_string(), false));
        }
        return;
    }
    if let Some(init) = &param.initializer {
        cx.collect_initializer_signals(name, false, false, init, 0, state);
    }
}

struct SignalDetectCtx<'a, 'b> {
    semantic: &'b Semantic<'a>,
    import_map: &'b HashMap<String, ImportedSymbol>,
    is_core: bool,
}

impl<'a> SignalDetectCtx<'a, '_> {
    fn collect_field_signals(
        &self,
        key: &PropertyKey<'a>,
        computed: bool,
        type_annotation: Option<&TSTypeAnnotation<'a>>,
        initializer: Option<&Expression<'a>>,
        state: &mut OwnExtractState,
    ) {
        let Some(member) = member_key(key, computed) else {
            return;
        };
        let (name, is_private): (&str, bool) = match &member {
            MemberKey::Public(name) => {
                state.own.declared_members.insert(name.to_string());
                (name.as_ref(), false)
            }
            MemberKey::Private(name) => (name, true),
        };
        if let Some(ann) = type_annotation {
            if self.is_explicit_signal_type(&ann.type_annotation) {
                state.record_signal(name.to_string(), is_private, false);
            } else {
                state
                    .explicit_non_signals
                    .insert((name.to_string(), is_private));
            }
            return;
        }
        if let Some(init) = initializer {
            self.collect_initializer_signals(name, is_private, false, init, 0, state);
        }
    }

    fn collect_initializer_signals(
        &self,
        prefix: &str,
        target_is_private: bool,
        declare_root_on_resolve: bool,
        expr: &Expression<'a>,
        depth: usize,
        state: &mut OwnExtractState,
    ) {
        let inner = expr.get_inner_expression();
        if self.is_signal_call_expression(inner) {
            state.record_signal(
                prefix.to_string(),
                target_is_private,
                declare_root_on_resolve,
            );
            return;
        }
        if let Some((source, source_is_private)) = extract_this_as_readonly_source(inner) {
            if state.has_signal(&source, source_is_private) {
                state.record_signal(
                    prefix.to_string(),
                    target_is_private,
                    declare_root_on_resolve,
                );
            } else {
                state.pending_readonly.push(PendingReadonly {
                    target: prefix.to_string(),
                    target_is_private,
                    declare_root_on_resolve,
                    source,
                    source_is_private,
                });
            }
            return;
        }
        if depth >= MAX_OBJECT_LITERAL_DEPTH {
            return;
        }
        let Expression::ObjectExpression(obj) = inner else {
            return;
        };
        for prop_kind in &obj.properties {
            let ObjectPropertyKind::ObjectProperty(prop) = prop_kind else {
                continue;
            };
            if prop.method || prop.kind != PropertyKind::Init {
                continue;
            }
            let Some(key) = static_property_name(&prop.key, prop.computed) else {
                continue;
            };
            if !is_valid_segment(&key) {
                continue;
            }
            let nested_prefix = format!("{prefix}.{key}");
            self.collect_initializer_signals(
                &nested_prefix,
                target_is_private,
                declare_root_on_resolve,
                &prop.value,
                depth + 1,
                state,
            );
        }
    }

    fn collect_ctor_statement_signals(&self, stmt: &Statement<'a>, state: &mut OwnExtractState) {
        match stmt {
            Statement::BlockStatement(block) => {
                for inner in &block.body {
                    self.collect_ctor_statement_signals(inner, state);
                }
            }
            Statement::IfStatement(if_stmt) => {
                self.collect_ctor_statement_signals(&if_stmt.consequent, state);
                if let Some(alt) = &if_stmt.alternate {
                    self.collect_ctor_statement_signals(alt, state);
                }
            }
            Statement::ExpressionStatement(expr_stmt) => {
                self.collect_this_assignment_signals(&expr_stmt.expression, state);
            }
            _ => {}
        }
    }

    fn collect_this_assignment_signals(&self, expr: &Expression<'a>, state: &mut OwnExtractState) {
        let Expression::AssignmentExpression(assign) = expr.get_inner_expression() else {
            return;
        };
        if assign.operator != AssignmentOperator::Assign {
            return;
        }
        let (name, is_private) = match &assign.left {
            AssignmentTarget::StaticMemberExpression(member)
                if matches!(
                    member.object.get_inner_expression(),
                    Expression::ThisExpression(_)
                ) =>
            {
                (member.property.name.as_str(), false)
            }
            AssignmentTarget::PrivateFieldExpression(field)
                if matches!(
                    field.object.get_inner_expression(),
                    Expression::ThisExpression(_)
                ) =>
            {
                (field.field.name.as_str(), true)
            }
            _ => return,
        };
        if !is_valid_segment(name)
            || state
                .explicit_non_signals
                .contains(&(name.to_string(), is_private))
        {
            return;
        }
        self.collect_initializer_signals(name, is_private, !is_private, &assign.right, 0, state);
    }

    fn is_signal_call_expression(&self, expr: &Expression<'a>) -> bool {
        let Expression::CallExpression(call) = expr.get_inner_expression() else {
            return false;
        };
        self.is_signal_call(call)
    }

    fn is_signal_call(&self, call: &CallExpression<'a>) -> bool {
        let callee = call.callee.get_inner_expression();
        if let Expression::StaticMemberExpression(member) = callee {
            if member.property.name == "asReadonly"
                && call.arguments.is_empty()
                && self.is_signal_call_expression(&member.object)
            {
                return true;
            }
        }

        let Some((binding, namespace_prop, is_required)) = decompose_signal_callee(callee) else {
            return false;
        };
        let Some((source, exported_name)) = self.resolve_symbol_origin(binding, namespace_prop)
        else {
            return false;
        };

        if is_required {
            return source == ANGULAR_CORE
                && matches!(
                    exported_name,
                    "input" | "model" | "viewChild" | "contentChild"
                );
        }

        match source {
            ANGULAR_CORE => matches!(
                exported_name,
                "signal"
                    | "computed"
                    | "linkedSignal"
                    | "input"
                    | "model"
                    | "viewChild"
                    | "viewChildren"
                    | "contentChild"
                    | "contentChildren"
            ),
            ANGULAR_RXJS_INTEROP => exported_name == "toSignal",
            _ => false,
        }
    }

    /// Match explicit direct `Signal` / `WritableSignal` / `InputSignal` /
    /// `InputSignalWithTransform` / `ModelSignal` type references from `@angular/core`.
    fn is_explicit_signal_type(&self, mut ty: &TSType<'a>) -> bool {
        while let TSType::TSParenthesizedType(paren) = ty {
            ty = &paren.type_annotation;
        }
        let TSType::TSTypeReference(type_ref) = ty else {
            return false;
        };
        let (binding, namespace_prop) = match &type_ref.type_name {
            TSTypeName::IdentifierReference(ident) => (&**ident, None),
            TSTypeName::QualifiedName(qn) => {
                let TSTypeName::IdentifierReference(ns_ident) = &qn.left else {
                    return false;
                };
                (&**ns_ident, Some(qn.right.name.as_str()))
            }
            TSTypeName::ThisExpression(_) => return false,
        };
        let Some((source, exported_name)) = self.resolve_symbol_origin(binding, namespace_prop)
        else {
            return false;
        };
        source == ANGULAR_CORE
            && matches!(
                exported_name,
                "Signal"
                    | "WritableSignal"
                    | "InputSignal"
                    | "InputSignalWithTransform"
                    | "ModelSignal"
            )
    }

    fn resolve_symbol_origin<'s>(
        &'s self,
        ident: &IdentifierReference<'a>,
        namespace_prop: Option<&'s str>,
    ) -> Option<(&'s str, &'s str)> {
        let ref_id = ident.reference_id.get()?;
        let scoping = self.semantic.scoping();
        let symbol_id = scoping.get_reference(ref_id).symbol_id()?;
        let flags = scoping.symbol_flags(symbol_id);

        if flags.intersects(SymbolFlags::Import | SymbolFlags::TypeImport) {
            let symbol_name = scoping.symbol_name(symbol_id);
            let imported = self.import_map.get(symbol_name)?;
            return match (&imported.kind, namespace_prop) {
                (ImportKind::Named(orig_name), None) => Some((
                    imported.source.as_str(),
                    strip_dts_alias_suffix(orig_name.as_str()),
                )),
                (ImportKind::Namespace, Some(prop)) => {
                    Some((imported.source.as_str(), strip_dts_alias_suffix(prop)))
                }
                _ => None,
            };
        }

        if self.is_core
            && namespace_prop.is_none()
            && scoping.symbol_scope_id(symbol_id) == scoping.root_scope_id()
        {
            return Some((
                ANGULAR_CORE,
                strip_dts_alias_suffix(scoping.symbol_name(symbol_id)),
            ));
        }

        None
    }
}

fn decompose_signal_callee<'a>(
    callee: &'a Expression<'a>,
) -> Option<(&'a IdentifierReference<'a>, Option<&'a str>, bool)> {
    if let Expression::Identifier(ident) = callee {
        return Some((ident, None, false));
    }
    let Expression::StaticMemberExpression(member) = callee else {
        return None;
    };
    let prop_name = member.property.name.as_str();
    let object = member.object.get_inner_expression();
    if prop_name == "required" {
        return match object {
            Expression::Identifier(ident) => Some((ident, None, true)),
            Expression::StaticMemberExpression(inner) => {
                let Expression::Identifier(ns_ident) = inner.object.get_inner_expression() else {
                    return None;
                };
                Some((ns_ident, Some(inner.property.name.as_str()), true))
            }
            _ => None,
        };
    }
    let Expression::Identifier(ns_ident) = object else {
        return None;
    };
    Some((ns_ident, Some(prop_name), false))
}

/// Match `this.<path>.asReadonly()` or `this.#<path>.asReadonly()` (with zero arguments),
/// returning `(path_without_leading_hash, is_private_root)`.
fn extract_this_as_readonly_source(expr: &Expression<'_>) -> Option<(String, bool)> {
    let Expression::CallExpression(call) = expr.get_inner_expression() else {
        return None;
    };
    if !call.arguments.is_empty() {
        return None;
    }
    let Expression::StaticMemberExpression(member) = call.callee.get_inner_expression() else {
        return None;
    };
    if member.property.name != "asReadonly" {
        return None;
    }
    extract_this_member_path(&member.object)
}

fn extract_this_member_path(expr: &Expression<'_>) -> Option<(String, bool)> {
    let mut segments = Vec::new();
    let mut current = expr.get_inner_expression();
    loop {
        match current {
            Expression::StaticMemberExpression(member) => {
                let seg = member.property.name.as_str();
                if !is_valid_segment(seg) {
                    return None;
                }
                segments.push(seg.to_string());
                current = member.object.get_inner_expression();
                if matches!(current, Expression::ThisExpression(_)) {
                    segments.reverse();
                    return Some((segments.join("."), false));
                }
            }
            Expression::ComputedMemberExpression(member) => {
                let Expression::StringLiteral(str_lit) = member.expression.get_inner_expression()
                else {
                    return None;
                };
                let seg = str_lit.value.as_str();
                if !is_valid_segment(seg) {
                    return None;
                }
                segments.push(seg.to_string());
                current = member.object.get_inner_expression();
                if matches!(current, Expression::ThisExpression(_)) {
                    segments.reverse();
                    return Some((segments.join("."), false));
                }
            }
            Expression::PrivateFieldExpression(field) => {
                if !matches!(
                    field.object.get_inner_expression(),
                    Expression::ThisExpression(_)
                ) {
                    return None;
                }
                let seg = field.field.name.as_str();
                if !is_valid_segment(seg) {
                    return None;
                }
                segments.push(seg.to_string());
                segments.reverse();
                return Some((segments.join("."), true));
            }
            _ => return None,
        }
    }
}

enum MemberKey<'a> {
    Public(std::borrow::Cow<'a, str>),
    Private(&'a str),
}

fn member_key<'a>(key: &'a PropertyKey<'a>, computed: bool) -> Option<MemberKey<'a>> {
    if !computed {
        if let PropertyKey::PrivateIdentifier(ident) = key {
            let name = ident.name.as_str();
            return is_valid_segment(name).then_some(MemberKey::Private(name));
        }
    }
    let name = static_property_name(key, computed)?;
    is_valid_segment(&name).then_some(MemberKey::Public(name))
}

fn static_property_name<'a>(
    key: &'a PropertyKey<'a>,
    computed: bool,
) -> Option<std::borrow::Cow<'a, str>> {
    if matches!(key, PropertyKey::PrivateIdentifier(_)) {
        return None;
    }
    if computed {
        return key.static_name();
    }
    extract_property_key(key)
}

fn is_valid_segment(segment: &str) -> bool {
    !segment.is_empty() && !segment.contains('.')
}

fn push_unique(out: &mut Vec<String>, item: String) {
    if !out.contains(&item) {
        out.push(item);
    }
}

async fn resolve_signal_facts<Fs: ResourceResolverFs + Clone + 'static>(
    decl: &DeclarationTuple,
    module_file: &Path,
    ctx: &QueryCtx<Fs>,
) -> Option<ClassSignalFacts> {
    let mut visited = HashSet::new();
    let Ok(Some(resolved)) = crate::evaluator::cross_file::cross_file_resolve(
        ctx,
        module_file,
        decl.import_source.as_deref(),
        decl.export_name().to_owned(),
        &mut visited,
    )
    .await
    else {
        return None;
    };
    let decl_file_id = ctx.engine.intern_path(&resolved.file_path);
    let syntax = ctx.analyze_file_syntax(decl_file_id).await;
    let parsed = ctx.parse_file(decl_file_id).await;
    let guard = parsed.lock().unwrap();
    let symbol_name = guard
        .borrow_dependent()
        .semantic
        .scoping()
        .symbol_name(resolved.symbol_id);
    syntax.signal_facts.get(symbol_name).cloned()
}

/// Flatten `own` signal members with inherited signal members along the `extends` chain,
/// respecting subclass member overrides that shadow base-class signals.
pub(crate) async fn flatten_signal_members<Fs: ResourceResolverFs + Clone + 'static>(
    own: &OwnSignalFacts,
    reference_id: ReferenceId,
    super_class: Option<&DeclarationTuple>,
    ctx: &QueryCtx<Fs>,
) -> Vec<String> {
    let mut result = own.signal_members.clone();
    let Some(mut next_super) = super_class.cloned() else {
        return result;
    };

    let mut shadowed_roots = own.declared_members.clone();
    let mut visited = HashSet::from([reference_id]);
    let mut current_file = reference_id.file;

    loop {
        let module_file = ctx.engine.lookup_path(current_file);
        let Some(base) = resolve_signal_facts(&next_super, &module_file, ctx).await else {
            break;
        };
        if !visited.insert(base.reference_id) {
            break;
        }
        for path in &base.own.signal_members {
            let root = path.split('.').next().unwrap_or(path.as_str());
            if !shadowed_roots.contains(root) {
                push_unique(&mut result, path.clone());
            }
        }
        shadowed_roots.extend(base.own.declared_members.iter().cloned());
        let Some(super_decl) = base.super_class else {
            break;
        };
        current_file = base.reference_id.file;
        next_super = super_decl;
    }

    result
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;
    use std::sync::{Arc, RwLock};

    fn engine_for(
        files: &[(&str, &str)],
        entry: &str,
    ) -> Arc<crate::query::engine::QueryEngine<crate::fs::OverlayFileSystem>> {
        let fs = crate::test_utils::create_test_fs(files);
        let resolver = Arc::new(oxc_resolver::ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..oxc_resolver::ResolveOptions::default()
            },
        ));
        let registry = Arc::new(crate::resource_registry::ResourceRegistry::default());
        let entrypoints = Arc::new(RwLock::new(vec![PathBuf::from(entry)]));
        crate::query::engine::QueryEngine::new_default(fs, resolver, registry, entrypoints)
    }

    #[test]
    fn extracts_signal_calls_types_and_nested_objects() {
        let cmp_ts = r#"
            import {
                Component,
                signal as createSig,
                computed,
                linkedSignal,
                input,
                model,
                viewChild,
                viewChildren,
                contentChild,
                contentChildren,
                effect,
                resource,
                output,
                type Signal,
                WritableSignal,
            } from '@angular/core';
            import * as core from '@angular/core';
            import { toSignal } from '@angular/core/rxjs-interop';

            function localNotSignal() { return 123; }

            @Component({ selector: 'app-cmp', template: '' })
            export class AppCmp {
                s = createSig(0);
                ro = createSig(0).asReadonly();
                roFromProp = this.s.asReadonly();
                c = computed(() => this.s() + 1);
                ls = linkedSignal(() => this.s());
                inp = input<string>();
                reqInp = input.required<string>();
                mdl = model(false);
                vc = viewChild('el');
                vcs = viewChildren('el');
                cc = contentChild.required('el');
                ccs = contentChildren('el');
                nsSig = core.signal(1);
                fromObs = toSignal({} as any);
                protected explicitSig!: Signal<string>;
                explicitNs!: core.InputSignal<number>;
                roFromGetter = this.sigGetter.asReadonly();
                get sigGetter(): WritableSignal<boolean> { return null!; }
                unionNotMatched: Signal<string> | null = createSig('nullable');
                unionAssignedInCtor: Signal<number> | null;
                nested = {
                    inner: computed(() => 1),
                    deep: { leaf: createSig('ok') },
                    plain: 42,
                };
                eff = effect(() => {});
                res = resource({ loader: async () => 1 });
                roRes = this.res.asReadonly();
                out = output<void>();
                plain = localNotSignal();
                #priv = createSig(0);
                roFromPriv = this.#priv.asReadonly();
                #privNested = { leaf: createSig(0) };
                roFromPrivNested = this.#privNested.leaf.asReadonly();
                #sameName = createSig(0);
                sameName = { asReadonly: () => 'not-a-signal' };
                notFromPubSameName = this.sameName.asReadonly();
                static statSig = createSig(0);

                constructor(
                    public ctorSig: Signal<number>,
                    private ctorInit = createSig('x'),
                    public ctorUnion: Signal<number> | null = createSig(0),
                    notProp: Signal<number>,
                ) {
                    this.assignedInCtor = computed(() => 2);
                    this.unionAssignedInCtor = createSig(99);
                    this.#ctorPriv = createSig(3);
                    this.roAssignedFromPriv = this.#ctorPriv.asReadonly();
                }
                assignedInCtor;
                #ctorPriv;
                roAssignedFromPriv;
            }
        "#;

        let engine = engine_for(&[("/app/cmp.ts", cmp_ts)], "/app/cmp.ts");
        let semantic =
            futures::executor::block_on(engine.analyze_optimized(PathBuf::from("/app/cmp.ts")));
        let members = &semantic.classes[0].signal_members;

        let expected = vec![
            "s",
            "ro",
            "roFromProp",
            "c",
            "ls",
            "inp",
            "reqInp",
            "mdl",
            "vc",
            "vcs",
            "cc",
            "ccs",
            "nsSig",
            "fromObs",
            "explicitSig",
            "explicitNs",
            "sigGetter",
            "nested.inner",
            "nested.deep.leaf",
            "roFromPriv",
            "roFromPrivNested",
            "ctorSig",
            "ctorInit",
            "assignedInCtor",
            "roAssignedFromPriv",
            "roFromGetter",
        ];
        assert_eq!(members, &expected);
    }

    #[test]
    fn flattens_inherited_signals_across_undecorated_and_dts_bases_with_override_shadowing() {
        let dts_base = r#"
            import * as i0 from '@angular/core';
            export declare class DtsGrandBase {
                dtsSig: i0.Signal<string>;
                overriddenByMid: i0.WritableSignal<number>;
                overriddenByLeaf: i0.InputSignal<boolean>;
            }
        "#;
        let mid_ts = r#"
            import { signal } from '@angular/core';
            import { DtsGrandBase } from './dts_base';
            export class UndecoratedMid extends DtsGrandBase {
                midSig = signal('mid');
                midNested = { a: signal(1) };
                override overriddenByMid: any = 'not-a-signal';
            }
        "#;
        let leaf_ts = r#"
            import { Component, computed } from '@angular/core';
            import { UndecoratedMid } from './mid';

            @Component({ selector: 'app-leaf', template: '' })
            export class LeafCmp extends UndecoratedMid {
                leafSig = computed(() => 42);
                override overriddenByLeaf() { return false; }
            }
        "#;

        let engine = engine_for(
            &[
                ("/app/dts_base.d.ts", dts_base),
                ("/app/mid.ts", mid_ts),
                ("/app/leaf.ts", leaf_ts),
            ],
            "/app/leaf.ts",
        );
        let semantic =
            futures::executor::block_on(engine.analyze_optimized(PathBuf::from("/app/leaf.ts")));
        let members = &semantic.classes[0].signal_members;

        assert_eq!(members, &vec!["leafSig", "midSig", "midNested.a", "dtsSig"]);
    }
}
