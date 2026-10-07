use super::api::{DeclarationMetadata, ResolvedHostDirectiveMetadata};
#[cfg(feature = "napi")]
use napi_derive::napi;

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpanMetadata {
    pub start: u32,
    pub end: u32,
}

impl SpanMetadata {
    pub fn new(span: oxc_span::Span, converter: &crate::utils::Utf8ToUtf16) -> Self {
        let mut start = span.start;
        let mut end = span.end;
        if let Some(mut c) = converter.converter() {
            c.convert_offset(&mut start);
            c.convert_offset(&mut end);
        }
        Self { start, end }
    }
}

/// Text to splice into the source at `position`, a UTF-16 offset.
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TextInsertionMetadata {
    pub position: u32,
    pub text: String,
}

impl TextInsertionMetadata {
    pub fn new(position: u32, text: String, converter: &crate::utils::Utf8ToUtf16) -> Self {
        let mut position = position;
        if let Some(mut c) = converter.converter() {
            c.convert_offset(&mut position);
        }
        Self { position, text }
    }
}

/// One binding introduced by a static `import` declaration.
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportBindingMetadata {
    /// Source span of the individual specifier (`Foo`, `Foo as Bar`, `type Foo`, or `* as ns`).
    pub span: SpanMetadata,
    /// The identifier this declaration binds in the importing file.
    pub local: String,
    /// The name the module exports this binding under: the named export, the reserved key
    /// `"default"` for a default import, or absent for a namespace import (`import * as ns`),
    /// which binds the module object itself rather than any one export.
    pub imported: Option<String>,
    /// Whether a reference to `local` survives the edits this compiler makes to the file, so
    /// the binding must keep its import. References inside a component's `imports: [...]` array
    /// do not count — the decorator is stripped from the output.
    pub eagerly_referenced: bool,
    /// Whether any such surviving reference is in value position, i.e. would still be there if
    /// this compiler emitted JavaScript. ngtsc decides deferrability on this narrower set;
    /// `eagerly_referenced` tells the emitter whether a deferrable declaration can be deleted
    /// outright or must have its non-type specifiers converted to `type` specifiers.
    pub value_referenced: bool,
    /// `import type { X }` / `import { type X }`: the binding exists only in type position.
    /// ngtsc ignores these entirely when deciding whether a declaration can be deferred.
    pub is_type: bool,
}

/// A static `import` declaration: enough to decide whether it may be dropped in favour of the
/// dynamic `import()`s a `@defer` block emits, and the exact range to delete when it may.
///
/// Deferral is all-or-nothing per declaration, matching ngtsc's `DeferredSymbolTracker`.
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportDeclarationMetadata {
    /// The declaration's own span, for anchoring a diagnostic on the statement.
    pub span: SpanMetadata,
    /// `span` extended over a trailing line terminator, so deleting it leaves no blank line
    /// behind. Only removal wants the extension; a diagnostic underlining it would drag the
    /// squiggle onto the next line.
    pub removal_span: SpanMetadata,
    /// The module specifier, verbatim (unresolved).
    pub specifier: String,
    /// Every binding the declaration introduces, including type-only ones. A bare
    /// `import './side-effect'` introduces none, and can never be removed.
    pub bindings: Vec<ImportBindingMetadata>,
}

impl ImportDeclarationMetadata {
    pub(crate) fn to_wire(
        info: &crate::analyzer::ImportDeclarationInfo,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> Self {
        Self {
            span: SpanMetadata::new(info.span, converter),
            removal_span: SpanMetadata::new(info.removal_span, converter),
            specifier: info.specifier.clone(),
            bindings: info
                .bindings
                .iter()
                .map(|binding| ImportBindingMetadata {
                    span: SpanMetadata::new(binding.span, converter),
                    local: binding.local.clone(),
                    imported: binding.imported.clone(),
                    eagerly_referenced: binding.eagerly_referenced,
                    value_referenced: binding.value_referenced,
                    is_type: binding.is_type,
                })
                .collect(),
        }
    }
}

/// Where to add a signal's implicit `debugName`: the edit ngtsc's `signalMetadataTransform`
/// makes to one signal-creating call.
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/transform/src/implicit_signal_debug_name_transform.ts
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalDebugNameMetadata {
    /// Insertion offset: just after the options object literal's `{` when spreading into it,
    /// else the end of the call's last argument, or its `)` when it has none.
    pub position: u32,
    /// The name, unescaped: the declared name's source text, or the assigned property's name.
    pub debug_name: String,
    /// Spread the `debugName` into the existing options object literal, rather than append it
    /// as a new spread argument.
    pub into_options: bool,
    /// The insertion sits next to existing code and needs a `, `: after it when spreading into
    /// a non-empty options literal, before it when appending to a call that has arguments.
    pub needs_separator: bool,
    /// When appending: pass `undefined` for the initial value ahead of the options, because
    /// the call has no arguments but its options are not its first parameter.
    pub prepend_undefined: bool,
}

impl SignalDebugNameMetadata {
    pub(crate) fn to_wire(
        insertion: &crate::analyzer::signal_debug_name::SignalDebugNameInsertion,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> Self {
        use crate::analyzer::signal_debug_name::SignalDebugNameInsertionKind;
        let mut position = insertion.position;
        if let Some(mut c) = converter.converter() {
            c.convert_offset(&mut position);
        }
        let (into_options, needs_separator, prepend_undefined) = match insertion.kind {
            SignalDebugNameInsertionKind::Arguments {
                has_arguments,
                prepend_undefined,
            } => (false, has_arguments, prepend_undefined),
            SignalDebugNameInsertionKind::Options { has_properties } => {
                (true, has_properties, false)
            }
        };
        Self {
            position,
            debug_name: insertion.debug_name.clone(),
            into_options,
            needs_separator,
            prepend_undefined,
        }
    }
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyAnimationTriggerNames {
    pub static_trigger_names: Vec<String>,
    pub includes_dynamic_animations: bool,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TypeRefMetadata {
    pub name: String,
    pub module_specifier: String,
    pub symbol: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub span: Option<SpanMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TypeParameterMetadata {
    pub name: String,
    pub representation: String,
    pub representation_with_default: String,
    pub has_default: bool,
    pub type_refs: Option<Vec<TypeRefMetadata>>,
}

impl TypeParameterMetadata {
    /// Rebase/resolve relative module specifiers in this type parameter's type references
    /// from `declaring_path` into `consumer_path` using the given reference strategy.
    pub fn resolve_specifiers(
        &mut self,
        strategy: &dyn crate::analyzer::import_emit::ReferenceEmitStrategy,
        declaring_path: &std::path::Path,
        consumer_path: &std::path::Path,
    ) {
        let Some(type_refs) = &mut self.type_refs else {
            return;
        };
        for r in type_refs {
            r.module_specifier = strategy.resolve_import_specifier(
                declaring_path,
                consumer_path,
                &r.module_specifier,
            );
        }
    }
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderField {
    pub span: SpanMetadata,
    pub is_forward_ref: bool,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DependencyMetadata {
    pub token_span: Option<SpanMetadata>,
    pub host: bool,
    pub optional: bool,
    #[cfg_attr(feature = "napi", napi(js_name = "self"))]
    #[serde(rename = "self")]
    pub self_qualifier: bool,
    pub skip_self: bool,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InjectableMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_name: Option<String>,
    pub provided_in: Option<ProviderField>,
    pub use_class: Option<ProviderField>,
    pub use_existing: Option<ProviderField>,
    pub use_factory: Option<ProviderField>,
    pub use_value: Option<ProviderField>,
    pub args_span: Option<SpanMetadata>,
    pub deps: Option<Vec<DependencyMetadata>>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_name: Option<String>,
    pub auto_provided: Option<bool>,
    pub factory: Option<ProviderField>,
    pub args_span: Option<SpanMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeclaringNgModule {
    pub file_path: String,
    pub symbol_id: u32,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PipeMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_name: Option<String>,
    pub name: String,
    pub pure: Option<bool>,
    pub standalone: Option<bool>,
    pub args_span: Option<SpanMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub declaring_ng_module: Option<DeclaringNgModule>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostDirectiveBinding {
    pub public_name: String,
    pub binding_name: String,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostDirectiveMetadata {
    /// Reference to the host directive class in the emitting file's frame.
    pub directive: ReferenceMetadata,
    pub inputs: Option<Vec<HostDirectiveBinding>>,
    pub outputs: Option<Vec<HostDirectiveBinding>>,
    pub is_forward_ref: bool,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
/// `UrlMetadata` represents a URL resource (like a template or style sheet URL) referenced in a component decorator.
/// It tracks the raw URL string, the resolved absolute file path, and the exact text span of the string literal
/// in the source file. This is crucial for the Kythe indexer to establish cross-references (links) from the
/// TypeScript source files to the external HTML/CSS files.
pub struct UrlMetadata {
    pub url: String,
    pub resolved_path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string_literal_span: Option<SpanMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ComponentMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_name: Option<String>,
    pub selector: Option<String>,
    pub imports: Option<Vec<ReferenceMetadata>>,
    pub template: Option<String>,
    /// The source text of an inline template declared as a string literal or a
    /// no-substitution template literal, between (excluding) the literal's delimiters
    /// (ngtsc's `getTemplateRange`). Present only for such a literal, which is parsed out of
    /// the component file's source text with escape sequences decoded by the template lexer
    /// (`sourceMapping.type === 'direct'`); absent for external templates and for inline
    /// templates computed by any other expression (`'indirect'`), whose spans are offsets into
    /// the resolved `template` string rather than into the component file.
    pub template_content_span: Option<SpanMetadata>,
    /// The inline `template` property's value expression span — the node ngtsc anchors
    /// template-attributed diagnostics on when the template is declared inline.
    pub template_span: Option<SpanMetadata>,
    /// True when an inline `template` was present but not statically resolvable
    /// (dynamic template literal). Signals the processor to fall back to JIT / error
    /// rather than emit an empty template.
    pub template_dynamic: bool,
    pub template_url: Option<UrlMetadata>,
    pub styles: Option<Vec<String>>,
    pub styles_from_urls: Option<Vec<String>>,
    pub style_urls: Option<Vec<UrlMetadata>>,
    pub standalone: bool,
    pub signals: bool,
    pub export_as: Option<Vec<String>>,
    pub schemas: Option<Vec<String>>,
    pub raw_imports_span: Option<SpanMetadata>,
    /// Preserved copy of `@Component.imports` expression span, unaffected by same-file scope
    /// resolution. Required by local compilation mode for runtime dependency resolution.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imports_factory_span: Option<SpanMetadata>,
    pub resolved_declarations: Option<Vec<DeclarationMetadata>>,
    /// The component's own `hostDirectives`, resolved in its own frame: the directives the
    /// type-check block places on the component's host element ahead of the component itself.
    pub resolved_host_directives: Option<Vec<ResolvedHostDirectiveMetadata>>,
    /// Module specifiers to emit as bare side-effect imports (`import '<specifier>';`) in
    /// local compilation mode, mirroring ngtsc's `LocalCompilationExtraImportsTracker`.
    ///
    /// Only populated for a non-standalone `@Component` whose declaring `@NgModule` lives in a
    /// different file: those are the files ngtsc marks via `markFileForExtraImportGeneration`.
    /// The specifiers are already projected into this component file's frame by Rust; the
    /// emitter must use them verbatim.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_compilation_extra_imports: Option<Vec<String>>,
    /// Syntax of the `host` object literal, for the type-check block.
    pub host_properties: Vec<HostPropertyMetadata>,
    /// The `host` property's value expression span — the node ngtsc anchors host binding
    /// parse/verify diagnostics on.
    pub host_span: Option<SpanMetadata>,
    /// The `host` object reduced by the partial evaluator, in source order. `None` when the
    /// decorator has no `host` field or it did not evaluate to an object.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub host_metadata: Option<Vec<HostMetadataEntry>>,
    /// Raw hostDirectives expression from the decorator
    pub host_directives: Option<Vec<HostDirectiveMetadata>>,
    pub providers_span: Option<SpanMetadata>,
    pub view_providers_span: Option<SpanMetadata>,
    /// `encapsulation` resolved to its numeric `ViewEncapsulation` member value, mirroring
    /// ngtsc's `resolveEnumValue`, with its textual local-compilation resolver
    /// (`resolveEncapsulationEnumValueLocally`) as the fallback. `None` when absent or
    /// unresolved — consumers default to `Emulated`.
    /// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L532-L542
    #[serde(skip_serializing_if = "Option::is_none")]
    pub encapsulation: Option<i32>,
    /// `changeDetection` expression as written in the decorator, matching ngtsc's local compilation behavior. `None` when absent.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub change_detection: Option<String>,
    pub preserve_whitespaces: Option<bool>,
    pub animations_span: Option<SpanMetadata>,
    pub animation_trigger_names: Option<LegacyAnimationTriggerNames>,
    pub args_span: Option<SpanMetadata>,
    pub preserved_decorator_properties: Option<Vec<SpanMetadata>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub declaring_ng_module: Option<DeclaringNgModule>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foreign_imports: Option<Vec<ForeignImportMetadata>>,
    #[serde(default)]
    pub is_jit: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deferred_imports: Option<Vec<ReferenceMetadata>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deferred_imports_by_block:
        Option<std::collections::HashMap<String, Vec<ReferenceMetadata>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deferred_imports_span: Option<SpanMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resolved_deferred_declarations: Option<Vec<DeclarationMetadata>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resolved_deferred_declarations_by_block:
        Option<std::collections::HashMap<String, Vec<DeclarationMetadata>>>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ForeignImportMetadata {
    pub name: String,
    pub span: SpanMetadata,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostPropertyMetadata {
    pub key: ExpressionValueMetadata,
    pub value: ExpressionValueMetadata,
}

/// One entry of the `host` object as the partial evaluator reduced it. Mirror of ngtsc's
/// `hostMetadata: Record<string, string | Expression>`, whose values are either a folded
/// string or a `WrappedNodeExpr` over an unevaluable node:
/// https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L2021-L2047
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostMetadataEntry {
    pub key: String,
    /// The string the evaluator folded this entry to. Exactly one of `value` and `expression`
    /// is set.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    /// Source text of a value that is not statically evaluable, for verbatim re-emission.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression: Option<String>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectiveMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_name: Option<String>,
    pub selector: Option<String>,
    pub standalone: bool,
    pub signals: bool,
    pub is_structural: bool,
    pub export_as: Option<Vec<String>>,
    /// Syntax of the `host` object literal, for the type-check block.
    pub host_properties: Vec<HostPropertyMetadata>,
    /// The `host` property's value expression span — the node ngtsc anchors host binding
    /// parse/verify diagnostics on.
    pub host_span: Option<SpanMetadata>,
    /// The `host` object reduced by the partial evaluator, in source order. `None` when the
    /// decorator has no `host` field or it did not evaluate to an object.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub host_metadata: Option<Vec<HostMetadataEntry>>,
    /// Raw hostDirectives expression from the decorator
    pub host_directives: Option<Vec<HostDirectiveMetadata>>,
    pub providers_span: Option<SpanMetadata>,
    pub args_span: Option<SpanMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub declaring_ng_module: Option<DeclaringNgModule>,
    #[serde(default)]
    pub is_jit: bool,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TemplateGuardMetadata {
    pub input_name: String,
    pub type_: String, // "binding" or "invocation"
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformMetadata {
    pub kind: String, // "type" or "expression"
    pub span: SpanMetadata,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_span: Option<SpanMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InputMetadata {
    pub name: String, // class property name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias: Option<String>, // binding property name (if different)
    pub required: bool,
    pub is_signal: bool, // true for input() signal version
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_span: Option<SpanMetadata>, // span for @Input() decorator (None for signals)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub property_span: Option<SpanMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transform: Option<TransformMetadata>,
    #[serde(default)]
    pub is_restricted: bool,
    #[serde(default)]
    pub is_literal: bool,
    #[serde(default)]
    pub is_coerced: bool,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OutputMetadata {
    pub name: String, // class property name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alias: Option<String>, // binding property name (if different)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_span: Option<SpanMetadata>, // span for @Output() decorator (None for signals)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub property_span: Option<SpanMetadata>,
    #[serde(default)]
    pub is_signal: bool,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryMetadata {
    pub property_name: String,
    pub first: bool,
    pub is_forward_ref: bool,
    /// The predicate expression with `forwardRef` removed. The query definition emits it
    /// verbatim when the predicate has no selectors. A signal query's class metadata is always
    /// built from it (ngtsc's `memberMetadataFromSignalQuery`).
    pub predicate_span: SpanMetadata,
    /// The selector strings, when the predicate is a list of them (the `string[]` arm of
    /// ngtsc's `R3QueryMetadata.predicate`). Each is kept whole; the compiler splits it on
    /// commas.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub predicate_selectors: Option<Vec<String>>,
    pub descendants: bool,
    pub emit_distinct_changes_only: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub read_span: Option<SpanMetadata>,
    pub is_static: bool,
    pub is_signal: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_span: Option<SpanMetadata>,
    pub is_view: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub property_span: Option<SpanMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AngularFieldMetadata {
    pub kind: String, // "input" | "output" | "query" | "coercion"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub input: Option<InputMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<OutputMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<QueryMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub coercion: Option<String>,
}

// NOTE: `SourceNodeKind` requires duplicated #[cfg] blocks rather than #[cfg_attr] because
// `napi-derive` proc macro limitations prevent evaluating #[cfg_attr] on individual enum variants
// inside a `#[napi(string_enum)]` container.
#[cfg(feature = "napi")]
#[napi(string_enum)]
#[derive(Clone, Debug, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExpressionValueKindMetadata {
    #[napi(value = "string")]
    String,
    #[napi(value = "identifier")]
    Identifier,
    #[napi(value = "unspecified")]
    Unspecified,
}

#[cfg(not(feature = "napi"))]
#[derive(Clone, Debug, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExpressionValueKindMetadata {
    String,
    Identifier,
    Unspecified,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExpressionValueMetadata {
    pub kind: ExpressionValueKindMetadata,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    pub source_span: SpanMetadata,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostBindingMetadata {
    pub member_name: ExpressionValueMetadata,
    pub arguments: Vec<ExpressionValueMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub host_property_name: Option<String>,
    pub decorator_span: SpanMetadata,
    pub member_span: SpanMetadata,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeclarationTuple {
    /// The local binding: `Bar` in `import {Foo as Bar}`.
    pub local_name: String,
    /// The exported name, when it differs from `local_name`: `Foo` in `import {Foo as Bar}`,
    /// `default` for a default import.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub imported_name: Option<String>,
    pub import_source: Option<String>,
}

impl DeclarationTuple {
    /// The name to look the symbol up by in `import_source`.
    pub fn export_name(&self) -> &str {
        self.imported_name.as_deref().unwrap_or(&self.local_name)
    }
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportViaMetadata {
    pub module_specifier: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub symbol: Option<String>,
}

/// How to write an import for a symbol, if the consumer decides it needs one.
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportableRef {
    /// Module specifier to import from.
    pub specifier: String,
    /// The name `specifier` exports the symbol under — not necessarily its declared name, since
    /// a barrel may rename on the way through, nor its name in the consuming file.
    pub symbol: String,
}

/// How a consuming file can refer to a symbol. The two fields are independent facts, not a
/// two-state choice: a cross-file symbol the consumer already imports has both, and callers
/// pick per use — an eager reference wants the local binding, while a `@defer` block writes
/// How a consuming file can refer to a symbol. Encodes how to reference the target both in-situ
/// (within the consumer file) and for type-checking (.ngtypecheck.ts).
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReferenceMetadata {
    /// How to import the target into the consumer file (in-situ), if not bound locally.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub consumer_import: Option<ImportableRef>,
    /// How to import the target into an external type-checking file (.ngtypecheck.ts).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub typecheck_import: Option<ImportableRef>,
    /// Identifier in the consumer file's lexical scope (for same-file declarations or local aliases).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_alias: Option<String>,
}

impl ReferenceMetadata {
    pub(crate) fn for_local_declaration(name: String) -> Self {
        Self {
            consumer_import: None,
            typecheck_import: None,
            local_alias: Some(name),
        }
    }

    pub(crate) fn for_consumer(
        reference: &crate::types::analysis::Reference,
        consumer: crate::query::FileId,
        specifier: Option<String>,
    ) -> Self {
        let importable = specifier.map(|specifier| ImportableRef {
            specifier,
            symbol: reference.export_name().to_string(),
        });
        Self {
            consumer_import: importable.clone(),
            typecheck_import: importable,
            local_alias: reference.aliases.get(&consumer).cloned(),
        }
    }
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NgModuleMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_name: Option<String>,
    /// True when any declaration or import of this NgModule came from a `forwardRef`-like
    /// foreign resolver, so the runtime value may not be available when `ɵɵsetComponentScope`
    /// runs and remote-scope arrays must be wrapped in a closure.
    /// https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L705-L706
    pub remote_scopes_may_require_cycle_protection: bool,
    pub declarations: Option<Vec<ReferenceMetadata>>,
    /// The subset of `declarations` this NgModule also lists in `exports`, in declaration
    /// order: ngtsc's `exportedDeclarations`, which `onlyPublishPublicTypingsForNgModules`
    /// narrows the declarations tuple of the `ɵmod` type to.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_declarations: Option<Vec<ReferenceMetadata>>,
    pub imports: Option<Vec<ReferenceMetadata>>,
    pub injector_imports: Option<Vec<ReferenceMetadata>>,
    pub exports: Option<Vec<ReferenceMetadata>>,
    pub bootstrap: Option<Vec<ReferenceMetadata>>,
    /// `imports` elements to re-emit verbatim into `ɵinj.imports` because they contain a
    /// `ModuleWithProviders` call. `index` is the position in the final list, interleaved
    /// with the resolved injector imports.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub injector_import_raw_spans: Option<Vec<RawInjectorImportMetadata>>,
    pub providers_span: Option<SpanMetadata>,
    pub id_span: Option<SpanMetadata>,
    pub schemas: Option<Vec<String>>,

    pub args_span: Option<SpanMetadata>,

    /// Raw source spans of the `declarations`/`imports`/`exports`/`bootstrap` value
    /// expressions, emitted verbatim in LOCAL compilation mode's `ɵɵsetNgModuleScope`.
    pub declarations_span: Option<SpanMetadata>,
    pub imports_span: Option<SpanMetadata>,
    pub exports_span: Option<SpanMetadata>,
    pub bootstrap_span: Option<SpanMetadata>,
    /// Raw source spans of the top-level `imports`/`exports` array elements, emitted
    /// verbatim (concatenated) in LOCAL compilation mode's `ɵinj.imports`.
    pub local_imports_element_spans: Option<Vec<SpanMetadata>>,
    pub local_exports_element_spans: Option<Vec<SpanMetadata>>,
    /// Syntactic type-tuple representation of `imports` for `emitDeclarationOnly`
    /// (`R3NgModuleMetadataKind.Isolated`), mirroring `transformToTypeTupleExpression` in
    /// `ngtsc/annotations/ng_module/src/handler.ts`. `None` when the slot is absent or an
    /// empty array literal (both emit `never`).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub isolated_imports: Option<IsolatedTypeTupleMetadata>,
    /// Syntactic type-tuple representation of `exports` for `emitDeclarationOnly`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub isolated_exports: Option<IsolatedTypeTupleMetadata>,
}

#[cfg(feature = "napi")]
#[napi(string_enum)]
#[derive(Clone, Debug, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum IsolatedTypeElementKind {
    /// `typeof <span|refs>`: an entity-name expression (`Foo`, `ns.Foo`), optionally
    /// pre-evaluated to one or more references when it aliases a local const.
    #[napi(value = "typeof")]
    Typeof,
    /// `ReturnType<typeof <span>>`: a call expression whose callee is an entity name
    /// (`StoreModule.forFeature(...)`, `fn()`), where `span` covers the callee.
    #[napi(value = "callReturnType")]
    CallReturnType,
    /// `[typeof A, typeof B, ...]`: an element that locally evaluates to an array of
    /// references.
    #[napi(value = "referenceTuple")]
    ReferenceTuple,
    /// `never`: an expression that cannot be represented with `typeof`.
    #[napi(value = "never")]
    Never,
}

#[cfg(not(feature = "napi"))]
#[derive(Clone, Debug, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum IsolatedTypeElementKind {
    Typeof,
    CallReturnType,
    ReferenceTuple,
    Never,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IsolatedTypeElementMetadata {
    pub kind: IsolatedTypeElementKind,
    /// Source span to slice: the unwrapped entity name for `Typeof`, the callee entity name
    /// for `CallReturnType`, or the offending expression for `Never` diagnostics.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub span: Option<SpanMetadata>,
    /// Resolved references when the element was folded through the partial evaluator (a single
    /// reference for `Typeof`, or the full list for `ReferenceTuple`).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub references: Option<Vec<ReferenceMetadata>>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IsolatedTypeTupleMetadata {
    /// True when the decorator slot was written as an array literal (`imports: [...]`), so the
    /// emitter wraps `elements` in a tuple `[...]`; false when the whole slot is a single
    /// non-array expression (`imports: MY_IMPORTS`), emitted bare as `typeof MY_IMPORTS`.
    pub is_array_literal: bool,
    pub elements: Vec<IsolatedTypeElementMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RawInjectorImportMetadata {
    pub index: u32,
    pub span: SpanMetadata,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostListenerMetadata {
    pub method_name: ExpressionValueMetadata, // class method name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_name: Option<ExpressionValueMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resolved_event_name: Option<String>,
    pub args: Vec<ExpressionValueMetadata>, // arguments like ['$event']
    #[serde(skip_serializing_if = "Option::is_none")]
    pub runtime_args: Option<Vec<String>>,
    pub decorator_span: SpanMetadata,
    pub member_span: SpanMetadata,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConstructorParamMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_name: Option<String>,
    /// Module specifier the type was imported from, when the type resolves to a (non-aliased)
    /// named import (e.g. `@angular/core` for `ElementRef`). `None` for locally declared types.
    /// Used so DI tokens that reference an imported symbol are emitted through the matching
    /// namespace import (e.g. `i0.ElementRef`), mirroring ngtsc's import manager.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_module: Option<String>,
    pub is_type_only: bool,
    /// Whether `type_name` was resolved to a declaration that has a runtime value, either in this
    /// file or by chasing the import across files. References we could not resolve at all —
    /// ambient globals, members of an ambient namespace, specifiers outside the compilation — are
    /// emitted optimistically, so the `ɵsetClassMetadata` entry has to be guarded with
    /// `@ts-ignore`. This is the inverse of ngtsc's `TypeValueReference#valueUnverified`.
    pub is_value_verified: bool,
    pub decorators: Vec<DecoratorMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecoratorArg {
    pub value: String,
    pub is_literal: bool,
}

/// A single decorator captured on a class member or constructor parameter for `ɵsetClassMetadata`.
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecoratorMetadata {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub canonical_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Vec<DecoratorArg>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub decorator_span: Option<SpanMetadata>,
    /// Span of the decorator's argument list (first arg start..last arg end), used to emit the
    /// `args: [...]` of `ɵsetClassMetadata` verbatim from source. `None` when there are no args.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args_span: Option<SpanMetadata>,
    /// Pre-rendered argument string with type arguments stripped (e.g. for `ChildComponent<T>` -> `ChildComponent`),
    /// emitted when generic type arguments are stripped for static block compatibility in `ɵsetClassMetadata`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args_string: Option<String>,
    /// Whether the decorator is imported from `@angular/core`. Only Angular decorators are
    /// captured in the `ɵsetClassMetadata` constructor-parameter metadata.
    /// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L172-L179
    pub is_angular: bool,
}

/// A non-static, non-private class member that carries at least one decorator. Mirrors the
/// per-member entries ngtsc builds for the property-decorator map of `ɵsetClassMetadata`.
/// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L91-L131
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecoratedMemberMetadata {
    pub property_name: String,
    /// Whether the member name must be quoted (the name node is a string literal).
    pub is_string_literal: bool,
    pub decorators: Vec<DecoratorMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClassMetadata {
    pub symbol_id: u32,
    pub span: SpanMetadata,
    pub decorated_span: SpanMetadata,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_span: Option<SpanMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub class_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#ref: Option<ReferenceMetadata>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub constructor_params: Option<Vec<ConstructorParamMetadata>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub member_decorators: Option<Vec<DecoratedMemberMetadata>>,
    pub later_declaration_references: Vec<SpanMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub injectable: Option<InjectableMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub service: Option<ServiceMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub component: Option<ComponentMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directive: Option<DirectiveMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pipe: Option<PipeMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ng_module: Option<NgModuleMetadata>,
    pub fields: Vec<AngularFieldMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flattened_fields: Option<Vec<AngularFieldMetadata>>,
    /// Member API surface pre-derived from `fields`: `model()` members are expanded into a
    /// signal input plus a `<name>Change` output, and inputs matched by an
    /// `ngAcceptInputType_` coercion member are marked coerced. Query lists are sorted
    /// signal-first, then `first`, then the rest (stable). `fields` stays on the wire for
    /// consumers that need the raw per-member view (TCB adapter, indexer).
    pub inputs: Vec<InputMetadata>,
    pub outputs: Vec<OutputMetadata>,
    pub queries: Vec<QueryMetadata>,
    pub view_queries: Vec<QueryMetadata>,
    /// Every span the preprocessor must delete for this class: the class's Angular decorators
    /// plus each member-level `@Input`/`@Output`/query/`@HostBinding`/`@HostListener`
    /// decorator.
    pub removal_spans: Vec<SpanMetadata>,
    /// Edits adding the `@nocollapse` tsickle would have put on static properties had the
    /// class decorators not been stripped. Apply only when annotating for Closure Compiler.
    pub nocollapse_insertions: Vec<TextInsertionMetadata>,
    /// The ready-to-splice `declare static ngAcceptInputType_...` member block for
    /// decorator-based inputs with a `transform`, empty when there are none.
    pub coercion_members: String,
    pub host_bindings: Vec<HostBindingMetadata>,
    pub host_listeners: Vec<HostListenerMetadata>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub type_parameters: Option<Vec<TypeParameterMetadata>>,

    pub has_ng_template_context_guard: bool,
    pub ng_template_guards: Vec<TemplateGuardMetadata>,
    pub has_ng_field_directive: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub super_class: Option<DeclarationTuple>,
    pub uses_inheritance: bool,
    pub uses_on_changes: bool,
    pub is_exported: bool,
    pub has_non_exported_bounds: bool,
}
