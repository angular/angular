use self::utils::{
    expression_to_string, extract_decorator_name, get_canonical_decorator_name, get_decorator_args,
    is_angular_decorator,
};
use crate::types::metadata::SpanMetadata;

use oxc_ast_visit::utf8_to_utf16::Utf8ToUtf16;

pub mod class_data;
mod closure_nocollapse;
mod component;
mod directive;
mod dts;
pub(crate) mod evaluated_io;
mod host_binding;
pub mod import_emit;
mod imports;
mod injectable;
mod input_output;
mod ngmodule;
mod pipe;
mod queries;
pub mod resolver;
pub mod resolvers;
mod service;
pub mod signal_debug_name;
pub mod transforms;
pub mod utils;
mod visitor;

pub use class_data::*;
pub use dts::analyze_dts;
pub use import_emit::{
    strip_extension_str, ApfImportStrategy, PrefixImportStrategy, ReferenceEmitStrategy,
};
pub use imports::{
    extract_import_map, FileExportInfo, ImportDeclarationInfo, ImportKind, ImportedSymbol,
};
pub use resolver::{flatten_class_info, resolve_declaration_async, resolve_to_dts};
pub use visitor::{analyze_parsed, ParsedFileAnalysis, RegistrationInfo};

/// Span covering a decorator's argument list (first arg start..last arg end), or `None` when the
/// decorator has no call arguments. Used to slice the original source so `ɵsetClassMetadata` emits
/// each decorator's `args: [...]` verbatim, matching ngtsc which re-emits the original arg nodes.
fn decorator_args_span(
    decorator: &oxc_ast::ast::Decorator,
    converter: &Utf8ToUtf16,
) -> Option<crate::types::metadata::SpanMetadata> {
    use oxc_span::GetSpan;
    let args = get_decorator_args(decorator)?;
    let first = args.first()?;
    let last = args.last()?;
    Some(crate::types::metadata::SpanMetadata::new(
        oxc_span::Span::new(first.span().start, last.span().end),
        converter,
    ))
}

use oxc_ast_visit::Visit;

struct TypeArgumentSpanCollector {
    spans: Vec<oxc_span::Span>,
}

impl<'a> Visit<'a> for TypeArgumentSpanCollector {
    fn visit_ts_instantiation_expression(
        &mut self,
        inst: &oxc_ast::ast::TSInstantiationExpression<'a>,
    ) {
        self.spans.push(inst.type_arguments.span);
        self.visit_expression(&inst.expression);
    }

    fn visit_call_expression(&mut self, call: &oxc_ast::ast::CallExpression<'a>) {
        if let Some(type_args) = &call.type_arguments {
            self.spans.push(type_args.span);
        }
        oxc_ast_visit::walk::walk_call_expression(self, call);
    }

    fn visit_new_expression(&mut self, new_expr: &oxc_ast::ast::NewExpression<'a>) {
        if let Some(type_args) = &new_expr.type_arguments {
            self.spans.push(type_args.span);
        }
        oxc_ast_visit::walk::walk_new_expression(self, new_expr);
    }
}

/// Line inserted before an identifier in `ɵsetClassMetadata` arguments that names a later
/// declaration; see [`later_declaration_references`]. Mirrored by `FORWARD_REFERENCE_GUARD` in
/// `src/processor.ts`.
const FORWARD_REFERENCE_GUARD: &str = "// @ts-ignore\n";

/// Copies `source_text[from..to]` into `out`, inserting [`FORWARD_REFERENCE_GUARD`] before every
/// position in `guards` (sorted) that falls in the range.
fn push_guarded(out: &mut String, source_text: &str, from: u32, to: u32, guards: &[u32]) {
    let mut cursor = from;
    for &pos in guards.iter().filter(|&&pos| pos >= from && pos < to) {
        out.push_str(&source_text[cursor as usize..pos as usize]);
        out.push_str(FORWARD_REFERENCE_GUARD);
        cursor = pos;
    }
    out.push_str(&source_text[cursor as usize..to as usize]);
}

/// Extracts the argument string for a decorator with generic type arguments stripped, with a
/// [`FORWARD_REFERENCE_GUARD`] before each of `guards`.
/// Returns `None` if there are no type arguments in the decorator arguments, allowing
/// the caller to use `args_span` for zero-allocation source slicing (and to insert the guards
/// itself).
fn extract_decorator_args_string<'a>(
    decorator: &oxc_ast::ast::Decorator<'a>,
    source_text: &str,
    guards: &[oxc_span::Span],
) -> Option<String> {
    use oxc_span::GetSpan;
    let args = get_decorator_args(decorator)?;
    let first = args.first()?;
    let last = args.last()?;
    let first_start = first.span().start;
    let last_end = last.span().end;

    let mut collector = TypeArgumentSpanCollector { spans: Vec::new() };
    for arg in args {
        collector.visit_argument(arg);
    }

    if collector.spans.is_empty() {
        return None;
    }

    collector.spans.sort_by_key(|s| s.start);
    let mut guard_starts: Vec<u32> = guards.iter().map(|span| span.start).collect();
    guard_starts.sort_unstable();
    guard_starts.dedup();

    let mut result = String::new();
    let mut cursor = first_start;
    for span in collector.spans {
        if span.start >= cursor && span.end <= last_end {
            push_guarded(&mut result, source_text, cursor, span.start, &guard_starts);
            cursor = span.end;
        }
    }
    if cursor < last_end {
        push_guarded(&mut result, source_text, cursor, last_end, &guard_starts);
    }

    Some(result)
}

/// Returns `true` if any property declaration (`TSPropertySignature`, `PropertyDefinition`, or
/// `AccessorProperty`) in the same file at or after `class_end` declares a property named
/// `prop_name`.
fn has_later_property_declaration(
    semantic: &oxc_semantic::Semantic<'_>,
    prop_name: &str,
    class_end: u32,
) -> bool {
    use oxc_ast::AstKind;
    use oxc_span::GetSpan;

    semantic.nodes().iter().any(|node| {
        if node.kind().span().start < class_end {
            return false;
        }
        let key = match node.kind() {
            AstKind::TSPropertySignature(sig) => &sig.key,
            AstKind::PropertyDefinition(prop) => &prop.key,
            AstKind::AccessorProperty(acc) => &acc.key,
            _ => return false,
        };
        self::utils::extract_property_key(key).as_deref() == Some(prop_name)
    })
}

/// Looks for an identifier or member access that a lowered static field initializer or
/// `ɵsetClassMetadata` static block would evaluate while the binding or property declaration it
/// resolves to is still after `class_end`. See [`later_declaration_references`].
struct LaterDeclarationFinder<'s, 'a> {
    semantic: &'s oxc_semantic::Semantic<'a>,
    class_end: u32,
    spans: &'s mut Vec<oxc_span::Span>,
}

impl<'a> Visit<'a> for LaterDeclarationFinder<'_, 'a> {
    fn visit_identifier_reference(&mut self, ident: &oxc_ast::ast::IdentifierReference<'a>) {
        use oxc_syntax::symbol::SymbolFlags;
        let scoping = self.semantic.scoping();
        let Some(symbol_id) = ident
            .reference_id
            .get()
            .and_then(|id| scoping.get_reference(id).symbol_id())
        else {
            return;
        };
        let flags = scoping.symbol_flags(symbol_id);
        if !flags.intersects(SymbolFlags::BlockScoped) || flags.contains(SymbolFlags::Ambient) {
            return;
        }
        if scoping.symbol_span(symbol_id).start >= self.class_end {
            self.spans.push(ident.span);
        }
    }

    fn visit_static_member_expression(&mut self, expr: &oxc_ast::ast::StaticMemberExpression<'a>) {
        let prev_len = self.spans.len();
        oxc_ast_visit::walk::walk_static_member_expression(self, expr);
        // Only non-chained member accesses (`obj.prop`, `this.prop`, `super.prop`) are checked by
        // TypeScript's `checkPropertyNotUsedBeforeDeclaration` (TS2729). If `expr.object` was
        // itself already recorded as a later block-scoped declaration, its guard at
        // `expr.span.start` already covers this expression.
        if self.spans.len() == prev_len
            && matches!(
                expr.object,
                oxc_ast::ast::Expression::Identifier(_)
                    | oxc_ast::ast::Expression::ThisExpression(_)
                    | oxc_ast::ast::Expression::Super(_)
            )
            && has_later_property_declaration(
                self.semantic,
                expr.property.name.as_str(),
                self.class_end,
            )
        {
            self.spans.push(expr.span);
        }
    }

    fn visit_function(
        &mut self,
        _func: &oxc_ast::ast::Function<'a>,
        _flags: oxc_syntax::scope::ScopeFlags,
    ) {
    }

    fn visit_arrow_function_expression(
        &mut self,
        _arrow: &oxc_ast::ast::ArrowFunctionExpression<'a>,
    ) {
    }

    // Types are erased and never evaluated.
    fn visit_ts_type(&mut self, _ty: &oxc_ast::ast::TSType<'a>) {}
}

/// Pushes onto `spans` every identifier or static member expression in `decorator`'s arguments
/// that eagerly references a declaration after `class_end`.
pub(crate) fn later_declaration_references<'a>(
    decorator: &oxc_ast::ast::Decorator<'a>,
    semantic: &oxc_semantic::Semantic<'a>,
    class_end: u32,
    spans: &mut Vec<oxc_span::Span>,
) {
    let Some(args) = get_decorator_args(decorator) else {
        return;
    };
    let mut finder = LaterDeclarationFinder {
        semantic,
        class_end,
        spans,
    };
    for arg in args {
        finder.visit_argument(arg);
    }
}

const DI_PARAMETER_DECORATORS: [&str; 6] = [
    "Inject",
    "Optional",
    "SkipSelf",
    "Self",
    "Host",
    "Attribute",
];

pub struct ConstructorParams {
    pub params: Vec<crate::ConstructorParamMetadata>,
    pub unexpected_decorators: Vec<crate::analyzer::UnexpectedParamDecorator>,
}

/// Extract constructor parameter types from a class
pub fn get_constructor_params(
    class: &oxc_ast::ast::Class,
    semantic: &oxc_semantic::Semantic,
    converter: &Utf8ToUtf16,
    import_map: &std::collections::HashMap<String, ImportedSymbol>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<ConstructorParams> {
    let mut target_method = None;

    for element in &class.body.body {
        let oxc_ast::ast::ClassElement::MethodDefinition(method) = element else {
            continue;
        };
        if method.kind != oxc_ast::ast::MethodDefinitionKind::Constructor {
            continue;
        }
        if method.value.body.is_some() {
            // Found the implementation constructor with a body. Stop searching immediately.
            target_method = Some(method);
            break;
        }
        if target_method.is_none() {
            // Fallback to the first overload signature if no implementation constructor is found
            target_method = Some(method);
        }
    }

    let target_method = target_method?;

    let mut params = Vec::new();
    let mut unexpected_decorators = Vec::new();
    for param in &target_method.value.params.items {
        let type_info = extract_type_info(param, semantic, import_map);
        let mut is_type_only = type_info
            .as_ref()
            .is_some_and(|(_, info)| info.is_type_only);
        let is_value_verified = type_info
            .as_ref()
            .is_some_and(|(_, info)| info.is_value_verified);
        // `type_name` stays `None` when the parameter has no runtime-referenceable type (a
        // primitive keyword, an inline type, no annotation). ngtsc emits `type: undefined` for
        // such parameters in `ɵsetClassMetadata` (typeValueReference UNAVAILABLE); consumers that
        // need the legacy `Object` DI-token fallback apply it themselves.
        let type_name = type_info.map(|(name, _)| name);
        let mut decorators = Vec::new();

        // Resolve the type to its import source so a DI token that references an imported
        // symbol can be emitted through the corresponding namespace import (e.g.
        // `i0.ElementRef`), matching ngtsc's import manager. Only non-aliased named imports
        // are namespaced; aliased or locally declared types keep their bare local name.
        let type_module = type_name.as_deref().and_then(|name| {
            import_map.get(name).and_then(|sym| match &sym.kind {
                crate::analyzer::ImportKind::Named(original) if original == name => {
                    Some(sym.source.clone())
                }
                _ => None,
            })
        });

        // Extract decorators
        for decorator in &param.decorators {
            let Some(name) = extract_decorator_name(decorator) else {
                continue;
            };

            let canonical_name = get_canonical_decorator_name(decorator, semantic, angular_imports);
            let is_angular = is_angular_decorator(decorator, semantic, angular_imports);
            let args = if is_angular {
                extract_decorator_args(decorator, semantic.source_text())
            } else {
                None
            };
            let decorator_span = is_angular.then(|| SpanMetadata::new(decorator.span, converter));

            // Flag unrecognized @angular/core decorators on constructor parameters (NG1005).
            if is_angular && !canonical_name.is_some_and(|c| DI_PARAMETER_DECORATORS.contains(&c)) {
                if let Some(reported) =
                    self::utils::reported_decorator_name(decorator, angular_imports, import_map)
                {
                    unexpected_decorators.push(crate::analyzer::UnexpectedParamDecorator {
                        name: reported,
                        span: decorator.span,
                    });
                }
            }

            // KNOWN DEVIATION from ngtsc, tracked in #533. `is_type_only` gates the `type:`
            // field of the constructor-parameter entry in `ɵsetClassMetadata`, and ngtsc derives
            // that field *purely* from `param.typeValueReference`; no decorator, `@Inject`
            // included, influences it. ngtsc emits
            // `{type: SomeClass, decorators: [{type: Inject, …}]}`, not `{type: undefined, …}`.
            // https://github.com/angular/angular/blob/16fe27bfefa6/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L160-L181
            //
            // We suppress the type anyway. It was introduced while `ɵsetClassMetadata` carried no
            // `@ts-ignore`: standard mode cannot distinguish an imported interface from an
            // imported class, and an `@Inject`ed dependency is the common case where the declared
            // type is not a value, so emitting it was a TS2693 in the consumer's build. That
            // reason is gone — `@angular/compiler` now guards every parameter type that is not
            // `is_value_verified` — so this can be removed; it is left for #533 because doing so
            // moves a lot of goldens. Until then it also overrides a verified value (a class in
            // the same file), leaving `is_type_only` and `is_value_verified` both set.
            //
            // The token axis needs nothing from this flag: `buildDeps` in `src/compiler-utils.ts`
            // resolves the token from the decorator itself for both `@Inject` and `@Attribute`,
            // mirroring `getConstructorDependency`. That is why `@Attribute` is absent here and
            // correctly stays absent.
            // https://github.com/angular/angular/blob/16fe27bfefa6/packages/compiler-cli/src/ngtsc/annotations/common/src/di.ts#L67-L100
            if canonical_name == Some("Inject") {
                is_type_only = true;
            }

            decorators.push(crate::DecoratorMetadata {
                name,
                canonical_name: canonical_name.map(String::from),
                args,
                decorator_span,
                args_span: if is_angular {
                    decorator_args_span(decorator, converter)
                } else {
                    None
                },
                args_string: if is_angular {
                    extract_decorator_args_string(decorator, semantic.source_text(), &[])
                } else {
                    None
                },
                is_angular,
            });
        }

        params.push(crate::ConstructorParamMetadata {
            type_name,
            type_module,
            is_type_only,
            is_value_verified,
            decorators,
        });
    }

    Some(ConstructorParams {
        params,
        unexpected_decorators,
    })
}

/// Extract the decorated, non-static, non-(ES-private) members of a class, in source order, for
/// the property-decorator map (4th argument) of `ɵsetClassMetadata`. Only members carrying at
/// least one decorator are returned; whether each decorator is Angular is resolved through the
/// semantic symbol table (non-Angular decorators are kept so the member still appears with an
/// empty array, matching ngtsc).
///
/// Pushes each Angular decorator's removal span onto `removal_spans`.
/// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L91-L131
pub fn get_member_decorators<'a>(
    class: &'a oxc_ast::ast::Class<'a>,
    converter: &Utf8ToUtf16,
    semantic: &oxc_semantic::Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    source_text: &str,
    later_references: &mut Vec<oxc_span::Span>,
    removal_spans: &mut Vec<oxc_span::Span>,
) -> Vec<crate::DecoratedMemberMetadata> {
    use oxc_ast::ast::{ClassElement, PropertyKey};

    let mut members = Vec::new();
    for element in &class.body.body {
        let (decorators, is_static, key) = match element {
            ClassElement::PropertyDefinition(p) => (&p.decorators, p.r#static, &p.key),
            ClassElement::MethodDefinition(m) => (&m.decorators, m.r#static, &m.key),
            ClassElement::AccessorProperty(a) => (&a.decorators, a.r#static, &a.key),
            _ => continue,
        };
        // ES-private (`#field`) members are not supported in the metadata emit.
        if is_static || decorators.is_empty() || matches!(key, PropertyKey::PrivateIdentifier(_)) {
            continue;
        }
        let Some(property_name) = self::utils::extract_property_key(key) else {
            continue;
        };

        let captured: Vec<crate::DecoratorMetadata> = decorators
            .iter()
            .filter_map(|decorator| {
                let name = extract_decorator_name(decorator)?;
                let canonical_name =
                    get_canonical_decorator_name(decorator, semantic, angular_imports);
                let is_angular = is_angular_decorator(decorator, semantic, angular_imports);
                let mut guards = Vec::new();
                if is_angular {
                    later_declaration_references(decorator, semantic, class.span.end, &mut guards);
                    removal_spans.push(self::utils::decorator_removal_span(decorator, source_text));
                }
                // `args` is intentionally omitted as an optimization, because `ɵsetClassMetadata`
                // emission in TypeScript only requires `args_span` for verbatim source slicing.
                let metadata = crate::DecoratorMetadata {
                    name,
                    canonical_name: canonical_name.map(String::from),
                    args: None,
                    decorator_span: is_angular
                        .then(|| SpanMetadata::new(decorator.span, converter)),
                    args_span: if is_angular {
                        decorator_args_span(decorator, converter)
                    } else {
                        None
                    },
                    args_string: if is_angular {
                        extract_decorator_args_string(decorator, source_text, &guards)
                    } else {
                        None
                    },
                    is_angular,
                };
                later_references.extend(guards);
                Some(metadata)
            })
            .collect();
        if captured.is_empty() {
            continue;
        }

        members.push(crate::DecoratedMemberMetadata {
            property_name: property_name.into_owned(),
            is_string_literal: matches!(key, PropertyKey::StringLiteral(_)),
            decorators: captured,
        });
    }
    members
}

/// What the analyzer was able to work out about a constructor parameter's type reference.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeRefInfo {
    /// The reference has no runtime value, so it must be emitted as `undefined` and cannot be a
    /// DI token.
    pub is_type_only: bool,
    /// The reference was resolved to a declaration that has a runtime value. The in-file pass can
    /// only establish this for a class declared in the same file; the cross-file pass in
    /// `query::engine` upgrades imported references that it manages to chase to a declaration.
    pub is_value_verified: bool,
}

impl TypeRefInfo {
    /// There is no reason to think the reference is type-only, but we could not resolve it to a
    /// declaration either. Emitting a DI token that turns out to be missing degrades at runtime,
    /// whereas withholding one from a real class breaks injection outright, so we emit it and let
    /// the compiler guard the metadata entry with `@ts-ignore`.
    const UNVERIFIED_VALUE: Self = Self {
        is_type_only: false,
        is_value_verified: false,
    };

    /// Resolved to a declaration in this file that has a runtime value.
    const VERIFIED_VALUE: Self = Self {
        is_type_only: false,
        is_value_verified: true,
    };

    /// No runtime value: `undefined` in the metadata, `ɵɵinvalidFactory()` in the factory.
    const TYPE_ONLY: Self = Self {
        is_type_only: true,
        is_value_verified: false,
    };
}

/// Extract the type name and what we know about the reference from a parameter.
fn extract_type_info(
    param: &oxc_ast::ast::FormalParameter,
    semantic: &oxc_semantic::Semantic,
    import_map: &std::collections::HashMap<String, ImportedSymbol>,
) -> Option<(String, TypeRefInfo)> {
    let type_annotation = param.type_annotation.as_ref()?;
    let unwrapped_type = unwrap_union_type(&type_annotation.type_annotation);

    let oxc_ast::ast::TSType::TSTypeReference(type_ref) = unwrapped_type else {
        return None;
    };

    let (name, leftmost_ident, is_qualified) = match &type_ref.type_name {
        oxc_ast::ast::TSTypeName::IdentifierReference(ref_ident) => {
            (ref_ident.name.to_string(), Some(&**ref_ident), false)
        }
        oxc_ast::ast::TSTypeName::QualifiedName(qualified) => {
            let name = self::utils::qualified_name_to_string(qualified);
            let leftmost = self::utils::get_leftmost_identifier_in_qualified(qualified);
            (name, leftmost, true)
        }
        _ => return None,
    };

    let info = leftmost_ident.map_or(TypeRefInfo::UNVERIFIED_VALUE, |ident| {
        get_type_reference_info(ident, &name, semantic, import_map, is_qualified)
    });

    Some((name, info))
}

fn unwrap_union_type<'a>(ts_type: &'a oxc_ast::ast::TSType<'a>) -> &'a oxc_ast::ast::TSType<'a> {
    let oxc_ast::ast::TSType::TSUnionType(union_type) = ts_type else {
        return ts_type;
    };
    let non_null_types: Vec<&oxc_ast::ast::TSType<'a>> = union_type
        .types
        .iter()
        .filter(|t| !matches!(t, oxc_ast::ast::TSType::TSNullKeyword(_)))
        .collect();
    if non_null_types.len() == 1 {
        return non_null_types[0];
    }
    ts_type
}

// TypeScript built-in types from lib.es5.d.ts (and friends) that have no runtime value
// declaration (decl.valueDeclaration === undefined in ngtsc): the utility type aliases, plus the
// structural interfaces that shadow no global object. `ReadonlyMap` is the trap — `Map` exists at
// runtime, `ReadonlyMap` does not — so emitting one as a DI token is a `ReferenceError`.
// Kept in sorted order.
const TS_BUILTIN_UTILITY_TYPES: &[&str] = &[
    "ArrayBufferLike",
    "ArrayBufferView",
    "ArrayConstructor",
    "ArrayLike",
    "AsyncGenerator",
    "AsyncIterable",
    "AsyncIterableIterator",
    "AsyncIterator",
    "Awaited",
    "Capitalize",
    "ClassDecorator",
    "ConstructorParameters",
    "Disposable",
    "Exclude",
    "Extract",
    "FlatArray",
    "Generator",
    "IArguments",
    "InstanceType",
    "Iterable",
    "IterableIterator",
    "Iterator",
    "Lowercase",
    "MapIterator",
    "NoInfer",
    "NonNullable",
    "Omit",
    "OmitThisParameter",
    "ParameterDecorator",
    "Parameters",
    "Partial",
    "Pick",
    "PromiseLike",
    "PropertyDescriptor",
    "PropertyKey",
    "Readonly",
    "ReadonlyArray",
    "ReadonlyMap",
    "ReadonlySet",
    "ReadonlySetLike",
    "Record",
    "Required",
    "ReturnType",
    "StringIterator",
    "TemplateStringsArray",
    "ThisParameterType",
    "ThisType",
    "TypedPropertyDescriptor",
    "Uncapitalize",
    "Uppercase",
    "WeakKey",
];

// Exports of `@angular/core` that are interfaces or type aliases, with no runtime value.
//
// This list is about *runtime*, not typechecking: the `@ts-ignore` the compiler attaches to a
// metadata entry silences TS2339/TS2693, but `import {OnInit} from '@angular/core'` still has no
// binding to resolve once the emitted code names it in a value position. So these have to be
// withheld, not guarded.
// Kept in sorted order for binary_search.
//
// TODO: Feature Parity: this list is a single-file-mode stopgap and is deliberately not
// exhaustive — `@angular/core` exports ~195 type-only symbols and the set moves between versions,
// so enumerating it here would rot. It covers the names that realistically appear as a constructor
// parameter type. Optimize mode answers the same question exactly, from the package's own `.d.ts`,
// via `resolve_qualified_symbol_value_kind`; the list can go once single-file mode can reach a
// resolver.
const ANGULAR_CORE_TYPE_ONLY_EXPORTS: &[&str] = &[
    "AbstractType",
    "AfterContentChecked",
    "AfterContentInit",
    "AfterRenderRef",
    "AfterViewChecked",
    "AfterViewInit",
    "DoBootstrap",
    "DoCheck",
    "EnvironmentProviders",
    "ModuleWithProviders",
    "OnChanges",
    "OnDestroy",
    "OnInit",
    "OutputRef",
    "PipeTransform",
    "Provider",
    "Signal",
    "SimpleChanges",
    "StaticProvider",
    "TrackByFunction",
    "WritableSignal",
];

/// The `@angular/core` export a type reference names, when it resolves there: `core.OnInit`
/// through a namespace import, or `OnInit` / `OnInit as Hook` through a named one (the original
/// exported name is what `ANGULAR_CORE_TYPE_ONLY_EXPORTS` holds, so an alias still matches).
fn angular_core_member<'n>(
    sym: &'n ImportedSymbol,
    local_name: &str,
    full_type_name: &'n str,
    is_qualified: bool,
) -> Option<&'n str> {
    if sym.source != "@angular/core" && !sym.source.starts_with("@angular/core/") {
        return None;
    }
    match (&sym.kind, is_qualified) {
        // Only a single qualification step names an export of the package: in `core.Foo.Bar`,
        // `Bar` is a member of something nested inside `core.Foo`, not of `@angular/core`.
        (ImportKind::Namespace, true) => full_type_name
            .strip_prefix(local_name)?
            .strip_prefix('.')
            .filter(|member| !member.contains('.')),
        (ImportKind::Named(original), false) => Some(original.as_str()),
        _ => None,
    }
}

// Mirrors ngtsc's typeToValue() which determines if a type reference can be used
// as a runtime DI token. ngtsc checks decl.valueDeclaration (undefined for interfaces/
// type aliases), InterfaceDeclaration/TypeAliasDeclaration SyntaxKinds in local compilation
// mode, and isTypeOnly/phaseModifier for type-only imports.
// https://github.com/angular/angular/blob/50e599e73ec5/packages/compiler-cli/src/ngtsc/reflection/src/type_to_value.ts#L25-L179
//
// We use oxc's semantic analysis (SymbolFlags) as our equivalent of ts.TypeChecker:
// - Interface/TypeAlias without Value ≈ decl.valueDeclaration === undefined
// - TypeImport ≈ firstDecl.isTypeOnly || phaseModifier === TypeKeyword
fn get_type_reference_info<'a>(
    ref_ident: &oxc_ast::ast::IdentifierReference<'a>,
    full_type_name: &str,
    semantic: &oxc_semantic::Semantic<'a>,
    import_map: &std::collections::HashMap<String, ImportedSymbol>,
    is_qualified: bool,
) -> TypeRefInfo {
    let symbol_id = ref_ident
        .reference_id
        .get()
        .and_then(|id| semantic.scoping().get_reference(id).symbol_id());
    let Some(symbol_id) = symbol_id else {
        // Unresolved identifier with no local declaration or import: this is an ambient
        // or global symbol.
        //
        // For a qualified reference whose namespace is not imported (`Gtag.Gtag`,
        // `google.maps.Map`), treat it as type-only. The upstream `@ts-ignore` would clear the
        // TS2708 this used to produce, but it cannot make the namespace exist: `Gtag` is a pure
        // `.d.ts` namespace with no runtime object, while `google.maps` is a script-loaded global
        // that does have one, and single-file analysis cannot tell them apart. Withholding costs
        // a DI token that mostly would not have resolved anyway; emitting costs a `ReferenceError`
        // from `ɵfac`, which runs in production.
        if is_qualified && !import_map.contains_key(ref_ident.name.as_str()) {
            return TypeRefInfo::TYPE_ONLY;
        }
        // If it's a known TypeScript built-in utility type (e.g. Partial, Record, Omit), it has no
        // runtime value declaration and must be treated as type-only. Otherwise, assume it is an
        // ambient/global runtime value (e.g. `Window`, `FileReader`, `Date`, `Storage`) so that DI
        // constructor injection continues to work. We have no way to confirm the binding from
        // source, so the metadata entry is emitted under a `@ts-ignore`.
        if TS_BUILTIN_UTILITY_TYPES.contains(&ref_ident.name.as_str()) {
            return TypeRefInfo::TYPE_ONLY;
        }
        return TypeRefInfo::UNVERIFIED_VALUE;
    };
    let flags = semantic.scoping().symbol_flags(symbol_id);

    // Case 1: Locally declared interface, type alias, type parameter, or namespace module
    // without a value declaration (e.g. `namespace N { export type T = string; }`).
    // Equivalent to ngtsc's NO_VALUE_DECLARATION check for InterfaceDeclaration,
    // TypeAliasDeclaration, and type-only NamespaceDeclaration.
    if (flags.contains(oxc_syntax::symbol::SymbolFlags::Interface)
        || flags.contains(oxc_syntax::symbol::SymbolFlags::TypeAlias)
        || flags.contains(oxc_syntax::symbol::SymbolFlags::TypeParameter)
        || flags.contains(oxc_syntax::symbol::SymbolFlags::NamespaceModule))
        && !flags.intersects(oxc_syntax::symbol::SymbolFlags::Value)
    {
        return TypeRefInfo::TYPE_ONLY;
    }

    // Case 2: `import type { X }` or `import type * as X` — always type-only.
    // Equivalent to ngtsc's TYPE_ONLY_IMPORT check.
    // https://github.com/angular/angular/blob/50e599e73ec5/packages/compiler-cli/src/ngtsc/reflection/src/type_to_value.ts#L106-L110
    if flags.contains(oxc_syntax::symbol::SymbolFlags::TypeImport) {
        return TypeRefInfo::TYPE_ONLY;
    }

    // Case 2b: a known type-only export of `@angular/core`, reached either as `core.OnInit` or as
    // a named `OnInit`. Both forms name the same declaration, so both have to answer the same way.
    if let Some(sym) = import_map.get(ref_ident.name.as_str()) {
        let member =
            angular_core_member(sym, ref_ident.name.as_str(), full_type_name, is_qualified);
        if member.is_some_and(|m| ANGULAR_CORE_TYPE_ONLY_EXPORTS.binary_search(&m).is_ok()) {
            return TypeRefInfo::TYPE_ONLY;
        }
    }

    // Case 3: Qualified type references (`A.B`) where `A` is not in `import_map` and has no local
    // `Value` declaration in scope.
    if is_qualified
        && !import_map.contains_key(ref_ident.name.as_str())
        && !flags.intersects(oxc_syntax::symbol::SymbolFlags::Value)
    {
        return TypeRefInfo::TYPE_ONLY;
    }

    // A class declared in this file is the one case we can prove: the binding exists at runtime and
    // the emitted reference is safe without a suppression. A qualified reference is excluded
    // because the class only tells us about the namespace object, not the member being accessed.
    if !is_qualified
        && flags.contains(oxc_syntax::symbol::SymbolFlags::Class)
        && !flags.intersects(
            oxc_syntax::symbol::SymbolFlags::Import | oxc_syntax::symbol::SymbolFlags::TypeImport,
        )
    {
        return TypeRefInfo::VERIFIED_VALUE;
    }

    // For regular imports (`import { X }` or `import * as X`), we can't determine cross-file
    // whether X is a class or interface without a type checker. Default to
    // assuming it's a value (class) since Angular DI uses constructor param
    // types as runtime tokens — emitting ɵɵinject(null) for a class would
    // break injection. Cross-file resolution is handled separately in
    // processor.ts via getTypeOnlyExports().
    TypeRefInfo::UNVERIFIED_VALUE
}

fn extract_decorator_args<'a>(
    decorator: &oxc_ast::ast::Decorator<'a>,
    source_text: &str,
) -> Option<Vec<crate::DecoratorArg>> {
    use oxc_span::GetSpan;

    let call_args = get_decorator_args(decorator)?;
    if call_args.is_empty() {
        return None;
    }

    let mut decorator_args = Vec::new();
    for arg in call_args {
        match arg {
            oxc_ast::ast::Argument::StringLiteral(lit) => {
                decorator_args.push(crate::DecoratorArg {
                    value: lit.value.to_string(),
                    is_literal: true,
                });
            }
            oxc_ast::ast::Argument::Identifier(ident) => {
                decorator_args.push(crate::DecoratorArg {
                    value: ident.name.to_string(),
                    is_literal: false,
                });
            }
            oxc_ast::ast::Argument::StaticMemberExpression(member) => {
                let Some(obj) = expression_to_string(&member.object) else {
                    continue;
                };
                decorator_args.push(crate::DecoratorArg {
                    value: format!("{}.{}", obj, member.property.name),
                    is_literal: false,
                });
            }
            // Fallback: any other non-literal expression (e.g. a call like
            // `@Attribute(dynamicAttrName())`) is captured verbatim from source so the
            // emitted token is the original expression.
            // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/di.ts#L84-L93
            other => {
                let span = other.span();
                if let Some(text) = source_text.get(span.start as usize..span.end as usize) {
                    decorator_args.push(crate::DecoratorArg {
                        value: text.to_string(),
                        is_literal: false,
                    });
                }
            }
        }
    }

    if decorator_args.is_empty() {
        None
    } else {
        Some(decorator_args)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn type_only_name_lists_are_sorted_and_unique() {
        // `ANGULAR_CORE_TYPE_ONLY_EXPORTS` is looked up with `binary_search`, which silently
        // misses entries once the list is out of order. Strict ordering also rejects duplicates,
        // which a merge of two independently extended lists is prone to leave behind.
        for list in [ANGULAR_CORE_TYPE_ONLY_EXPORTS, TS_BUILTIN_UTILITY_TYPES] {
            assert!(
                list.windows(2).all(|w| w[0] < w[1]),
                "not strictly sorted: {list:?}"
            );
        }
    }
}
