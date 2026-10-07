//! Internal per-class analysis data, projected to the wire [`ClassMetadata`] only at
//! `to_wire_syntax` / `to_wire_semantic`. Nothing here serializes.
//!
//! Layering cut line: decorator-level data is fully internal (no decorator-level wire struct
//! appears below). Small *value* types ([`InputMetadata`], [`SymbolReference`],
//! [`DeclarationTuple`], [`ProviderField`], spans, …) remain shared crate currency for now.
// TODO: migrate value types to internal representations per-field as they diverge from the
// wire form (e.g. when InputMetadata's transform becomes a partially evaluated value).

use crate::analyzer::imports::ImportInfo;
use crate::evaluator::Resolved;
use crate::query::ReferenceId;

/// The `imports` entries a class declares, in the shape `may_export_providers` resolves them by.
fn tuples(imports: &[ImportInfo]) -> Vec<crate::DeclarationTuple> {
    imports
        .iter()
        .map(ImportInfo::to_declaration_tuple)
        .collect()
}

use crate::types::analysis::{HostDirectiveEntry, Reference};
use crate::types::metadata::ReferenceMetadata;
use crate::{
    types::analysis::{DeclarationData, ResolvedHostDirective},
    ClassMetadata, ClassType, ComponentMetadata, ConstructorParamMetadata, DeclarationMetadata,
    DeclarationTuple, DirectiveMetadata, ExpressionValueKindMetadata, ExpressionValueMetadata,
    HostBindingMetadata, HostDirectiveMetadata, HostListenerMetadata, HostPropertyMetadata,
    InjectableMetadata, InputMetadata, LegacyAnimationTriggerNames, NgModuleMetadata,
    OutputMetadata, PipeMetadata, ProviderField, QueryMetadata, ResolvedHostDirectiveMetadata,
    ServiceMetadata, TemplateGuardMetadata, TransformMetadata,
};
#[derive(Clone, Debug)]
pub enum TransformData {
    Type {
        type_span: oxc_span::Span,
        value_span: oxc_span::Span,
    },
    Expression(oxc_span::Span),
}

#[derive(Clone, Debug)]
pub struct InputData {
    pub name: String,
    pub alias: Option<String>,
    pub required: bool,
    pub is_signal: bool,
    pub decorator_span: Option<oxc_span::Span>,
    pub property_span: Option<oxc_span::Span>,
    pub transform: Option<TransformData>,
    pub is_restricted: bool,
    pub is_literal: bool,
}

#[derive(Clone, Debug)]
pub enum AngularField {
    Input(InputData),
    Output(OutputData),
    Query(QueryData),
    InputCoercion(String),
}

#[derive(Clone, Debug)]
pub struct OutputData {
    pub name: String,
    pub alias: Option<String>,
    pub decorator_span: Option<oxc_span::Span>,
    pub property_span: Option<oxc_span::Span>,
    pub is_signal: bool,
}

/// How a query's predicate was read. Either way it yields selector strings or nothing, and
/// nothing means the predicate is emitted as the expression at [`QueryData::predicate_span`].
#[derive(Clone, Debug)]
pub enum QueryPredicate {
    /// A decorator query (`@ViewChild(...)`, or `new ViewChild(...)` under `queries`), which
    /// ngtsc's `extractDecoratorQueryMetadata` partially evaluates once `forwardRef` is
    /// unwrapped.
    Evaluated(Resolved<crate::evaluator::QuerySelectors>),
    /// A signal query whose locator is string-literal-like. ngtsc's `parseLocator` never
    /// evaluates: it takes only `ts.isStringLiteralLike` nodes, by their cooked text.
    Literal(String),
    /// A signal query whose locator is anything else, emitted as written.
    Expression,
}

impl QueryPredicate {
    /// The selector strings, or `None` when the predicate is emitted as an expression.
    pub fn selectors(&self) -> Option<Vec<String>> {
        match self {
            QueryPredicate::Evaluated(resolved) => resolved.get_optional().map(|s| s.0),
            QueryPredicate::Literal(text) => Some(vec![text.clone()]),
            QueryPredicate::Expression => None,
        }
    }
}

#[derive(Clone, Debug)]
pub struct QueryData {
    pub property_name: String,
    pub first: bool,
    /// The predicate expression, with `forwardRef` and TypeScript-only wrappers removed. It is
    /// emitted verbatim when [`QueryPredicate::selectors`] is `None`.
    pub predicate_span: oxc_span::Span,
    pub predicate: QueryPredicate,
    pub is_forward_ref: bool,
    pub descendants: bool,
    pub emit_distinct_changes_only: bool,
    pub read_span: Option<oxc_span::Span>,
    pub is_static: bool,
    pub is_signal: bool,
    pub decorator_span: Option<oxc_span::Span>,
    pub is_view: bool,
    pub property_span: Option<oxc_span::Span>,
}

/// One decorated class: the class-body facts every classification shares, plus the parsed
/// [`DecoratorData`] that classifies it.
#[derive(Clone, Debug)]
pub struct ClassData {
    pub reference_id: ReferenceId,

    /// Spans of ALL recognized Angular decorators on the class (kept even for decorators the
    /// classification dropped — wire parity).
    pub ng_decorator_spans: Vec<oxc_span::Span>,
    /// Spans the processor deletes to strip Angular class and member decorators, including
    /// trailing whitespace. Separate from `ng_decorator_spans`, which diagnostics use.
    pub decorator_removal_spans: Vec<oxc_span::Span>,
    /// `@nocollapse` edits for static properties; see [`super::closure_nocollapse`].
    pub nocollapse_insertions: Vec<super::closure_nocollapse::NoCollapseInsertion>,
    pub span: oxc_span::Span,
    /// `span` widened to open the class's whole declaration statement: its first decorator
    /// (Angular or not) or an enclosing `export`/`export default` keyword, whichever comes first.
    /// `span` itself starts at the `class`/`export` keyword, which is *below* a custom decorator
    /// sitting on top of the Angular one, so it is not a safe anchor for text spliced above the
    /// class. The start is an AST offset, so it never falls inside a comment.
    pub decorated_span: oxc_span::Span,
    pub name_span: Option<oxc_span::Span>,
    pub class_name: Option<String>,
    pub constructor_params: Option<Vec<ConstructorParamMetadata>>,
    /// Constructor parameter decorators ngtsc rejects outright; see [`UnexpectedParamDecorator`].
    pub unexpected_param_decorators: Vec<UnexpectedParamDecorator>,
    pub member_decorators: Vec<crate::DecoratedMemberMetadata>,
    pub later_declaration_references: Vec<oxc_span::Span>,
    pub type_parameters: Option<Vec<TypeParameterData>>,
    pub has_ng_template_context_guard: bool,
    pub ng_template_guards: Vec<TemplateGuardMetadata>,
    pub has_ng_field_directive: bool,
    pub uses_inheritance: bool,
    pub uses_on_changes: bool,
    pub is_exported: bool,
    pub has_non_exported_bounds: bool,
    pub decorator: DecoratorData,
    pub super_class: Option<DeclarationTuple>,
    pub flattened_fields: Option<Vec<crate::AngularFieldMetadata>>,
}

/// The class's classification by its *primary* Angular decorator. Priority on collisions:
/// Component > Directive > Pipe > NgModule > Injectable > Service.
///
/// `@Injectable` and `@Service` are *weak* decorators (mirroring ngtsc's
/// `HandlerPrecedence.WEAK`): they may legally accompany a primary classification
/// (`@Component + @Injectable` is valid Angular) and then nest inside the primary's data
/// (e.g. [`DirectiveData::injectable`], [`PipeData::injectable`]). A class whose only
/// Angular decorators are weak classifies as `Injectable`/`Service` directly.
// TODO(parity): ngtsc reports an error when a class carries two colliding *primary*
// decorators (e.g. @Component + @Directive); we silently keep the highest-priority
// classification and drop the rest. No fixture exercises that case.
#[derive(Clone, Debug)]
#[allow(clippy::large_enum_variant)] // Components dominate real codebases; boxing the common
                                     // case would add indirection to the hot path for a size win on the rare variants.
pub enum DecoratorData {
    Component(ComponentData),
    Directive(DirectiveData),
    Pipe(PipeData),
    NgModule(NgModuleData),
    Injectable(InjectableData),
    Service(ServiceData),
}

#[derive(Clone, Debug, PartialEq)]
pub enum ExpressionValueKind {
    String,
    Identifier,
    Unspecified,
}

#[derive(Clone, Debug, PartialEq)]
pub struct ExpressionValueData {
    pub kind: ExpressionValueKind,
    pub text: Option<String>,
    pub span: oxc_span::Span,
}

#[derive(Clone, Debug, PartialEq)]
pub struct HostPropertyData {
    pub key: ExpressionValueData,
    pub value: ExpressionValueData,
}

#[derive(Clone, Debug)]
pub struct HostBindingData {
    pub member_name: ExpressionValueData,
    pub arguments: Vec<ExpressionValueData>,
    pub host_property_name: Option<Resolved<String>>,
    pub decorator_span: oxc_span::Span,
    pub member_span: oxc_span::Span,
}

#[derive(Clone, Debug, PartialEq)]
pub enum HostListenerArgsError {
    NotStringArray(oxc_span::Span),
    ElementNotString { span: oxc_span::Span, index: usize },
}

#[derive(Clone, Debug)]
pub struct HostListenerData {
    pub method_name: ExpressionValueData,
    pub event_name: Option<ExpressionValueData>,
    pub resolved_event_name: Resolved<String>,
    pub args: Vec<ExpressionValueData>,
    pub runtime_args: Option<Vec<String>>,
    pub decorator_span: oxc_span::Span,
    pub member_span: oxc_span::Span,
    pub args_errors: Vec<HostListenerArgsError>,
}

/// A directive: decorator facts, member-level API surface, and any weak decorators accompanying it.
#[derive(Clone, Debug)]
pub struct DirectiveData {
    pub selector: Option<Resolved<String>>,
    pub selector_span: Option<oxc_span::Span>,
    pub standalone: bool,
    /// The `standalone` property's value expression span, present whenever the property is.
    pub standalone_span: Option<oxc_span::Span>,
    /// True when the `standalone` property was present but did not fold to a boolean, in
    /// which case `standalone` falls back to `true` (the implicit default).
    pub standalone_dynamic: bool,
    pub signals: bool,
    pub is_structural: bool,
    /// `exportAs` as the partial evaluator sees it.
    pub export_as: Option<Resolved<crate::evaluator::ExportAsNames>>,
    /// The `exportAs` property's value expression span, present whenever the property is.
    pub export_as_span: Option<oxc_span::Span>,
    /// The `host` object as the partial evaluator sees it — what compilation binds against.
    /// Boxed because `host` is absent from most directives while this field sits on every
    /// `DirectiveData`, hence every `ComponentData` — the widest `DecoratorData` variant, whose
    /// size every class in the program pays.
    pub host_expr: Option<Box<Resolved<crate::evaluator::HostMetadata>>>,
    /// The `host` property's value expression span — the node ngtsc anchors host binding
    /// parse/verify diagnostics on.
    pub host_span: Option<oxc_span::Span>,
    /// The `host` object literal's *syntax*, for the type-check block only.
    pub host_properties: Vec<HostPropertyData>,
    /// The `hostDirectives` expression, partially evaluated. Kept as a `Resolved` so
    /// Stage 2 can chase cross-file arrays and aliases before it is projected onto the wire.
    pub host_directives: Option<Resolved<Vec<HostDirectiveEntry>>>,
    pub providers_span: Option<oxc_span::Span>,
    pub args_span: Option<oxc_span::Span>,
    pub preserved_decorator_properties: Option<Vec<oxc_span::Span>>,

    pub fields: Vec<AngularField>,
    /// Input/output declarations (`inputs`/`outputs` arrays, `@Input`/`@Output` arguments)
    /// still waiting on constants from other files; Stage 2 folds them into `fields`. Boxed
    /// for the same reason as `host_expr`: it is absent from nearly every directive.
    pub evaluated_io: Option<Box<crate::analyzer::evaluated_io::EvaluatedIo>>,
    /// Input/output declarations that did not evaluate to the shape ngtsc requires.
    pub io_issues: Vec<ValueIssue>,
    pub host_bindings: Vec<HostBindingData>,
    pub host_listeners: Vec<HostListenerData>,

    pub injectable: Option<InjectableData>,
    pub service: Option<ServiceData>,
    pub declaring_ng_module: Option<crate::query::ReferenceId>,
    /// Every NgModule declaring this class when more than one does (ngtsc's
    /// `LocalModuleScopeRegistry.getDuplicateDeclarations`). `declaring_ng_module` is then
    /// `None`, and validation reports NG6007. Only the semantic pass fills it in.
    pub duplicate_declaring_ng_modules: Vec<crate::query::ReferenceId>,
    pub is_jit: bool,
    pub decorator_name: Option<String>,
}

impl DirectiveData {
    /// The `exportAs` names, when the property evaluated to a string.
    pub fn export_as_names(&self) -> Option<Vec<String>> {
        self.export_as
            .as_ref()
            .and_then(Resolved::get_optional)
            .map(|names| names.0)
    }

    fn has_incomplete_declaration_metadata(&self) -> bool {
        self.selector
            .as_ref()
            .is_some_and(Resolved::contains_incomplete)
            || self
                .export_as
                .as_ref()
                .is_some_and(Resolved::contains_incomplete)
            || self
                .host_directives
                .as_ref()
                .is_some_and(Resolved::contains_incomplete)
            || self
                .evaluated_io
                .as_ref()
                .is_some_and(|io| io.contains_incomplete())
    }

    async fn complete_declaration_metadata<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
        foreign: &[&dyn crate::evaluator::ForeignFunctionResolver],
    ) {
        if let Some(selector) = &mut self.selector {
            selector.complete_with(ctx, foreign).await;
        }
        if let Some(export_as) = &mut self.export_as {
            export_as.complete_with(ctx, foreign).await;
        }
        if let Some(host_directives) = &mut self.host_directives {
            host_directives.complete_with(ctx, foreign).await;
        }
        if let Some(io) = &mut self.evaluated_io {
            io.complete_with(ctx, foreign).await;
        }
        self.fold_pending_io();
    }

    fn demote_resolved(&mut self) {
        if let Some(selector) = &mut self.selector {
            selector.demote();
        }
        if let Some(export_as) = &mut self.export_as {
            export_as.demote();
        }
        if let Some(host) = &mut self.host_expr {
            host.demote();
        }
        if let Some(host_directives) = &mut self.host_directives {
            host_directives.demote();
        }
        for predicate in self.evaluated_query_predicates_mut() {
            predicate.demote();
        }
        for name in self.host_binding_names_mut() {
            name.demote();
        }
        for name in self.host_listener_event_names_mut() {
            name.demote();
        }
        if let Some(io) = &mut self.evaluated_io {
            io.demote();
        }
        self.fold_pending_io();
    }
}

/// Stage 2 for `styleUrl`/`styleUrls` that named a constant from another file: complete the
/// expressions, then read the stylesheets they name exactly as Stage 1 reads literal ones, and
/// register them so an edit to one invalidates this component.
async fn complete_style_urls<Fs: crate::ResourceResolverFs + Clone + 'static>(
    c: &mut ComponentData,
    reference_id: crate::query::ReferenceId,
    ctx: &crate::query::QueryContext<Fs>,
    foreign: &[&dyn crate::evaluator::ForeignFunctionResolver],
) {
    let Some(mut sources) = c.pending_style_urls.take() else {
        return;
    };
    for source in &mut sources {
        source.complete_with(ctx, foreign).await;
    }
    let file_path = ctx.lookup_path(reference_id.file);
    let resource_resolver = crate::ResourceResolver::new(&ctx.fs, ctx.resolver.as_ref());
    crate::analyzer::component::load_style_urls(
        &sources,
        c,
        &resource_resolver,
        &file_path,
        &ctx.fs,
    );
    for style_url in c.style_urls.iter().flatten() {
        ctx.resource_registry.register_template(
            std::path::PathBuf::from(&style_url.resolved_path),
            file_path.clone(),
            reference_id.symbol,
        );
    }
}

impl Default for DirectiveData {
    fn default() -> Self {
        Self {
            selector: None,
            selector_span: None,
            standalone: true,
            standalone_span: None,
            standalone_dynamic: false,
            signals: false,
            is_structural: false,
            export_as: None,
            export_as_span: None,
            host_expr: None,
            host_span: None,
            host_properties: Vec::new(),
            host_directives: None,
            providers_span: None,
            args_span: None,
            preserved_decorator_properties: None,
            fields: Vec::new(),
            evaluated_io: None,
            io_issues: Vec::new(),
            host_bindings: Vec::new(),
            host_listeners: Vec::new(),

            injectable: None,
            service: None,
            declaring_ng_module: None,
            duplicate_declaring_ng_modules: Vec::new(),
            is_jit: false,
            decorator_name: None,
        }
    }
}

impl DirectiveData {
    /// The query predicates that went through the partial evaluator. Stage 2 completes or
    /// demotes them together with the decorator's own `Resolved` fields.
    fn evaluated_query_predicates_mut(
        &mut self,
    ) -> impl Iterator<Item = &mut Resolved<crate::evaluator::QuerySelectors>> {
        self.fields.iter_mut().filter_map(|field| match field {
            AngularField::Query(QueryData {
                predicate: QueryPredicate::Evaluated(resolved),
                ..
            }) => Some(resolved),
            _ => None,
        })
    }

    fn host_binding_names_mut(&mut self) -> impl Iterator<Item = &mut Resolved<String>> {
        self.host_bindings
            .iter_mut()
            .filter_map(|binding| binding.host_property_name.as_mut())
    }

    fn host_listener_event_names_mut(&mut self) -> impl Iterator<Item = &mut Resolved<String>> {
        self.host_listeners
            .iter_mut()
            .map(|listener| &mut listener.resolved_event_name)
    }
}

/// The selector ngtsc gives a component whose decorator has no `selector`, or an empty one:
/// `ComponentDecoratorHandler.analyze` passes
/// `DomElementSchemaRegistry.getDefaultComponentElementName()` to `extractDirectiveMetadata` as
/// its `defaultSelector`. Directives get no default (`DirectiveDecoratorHandler` passes `null`).
const DEFAULT_COMPONENT_SELECTOR: &str = "ng-component";

/// Applies `extractDirectiveMetadata`'s `defaultSelector` rule to a decorator's `selector`.
///
/// `selector` is `None` when the decorator has no `selector` property, `Some(None)` when the
/// property does not evaluate to a string (ngtsc rejects that with a diagnostic, so there is
/// nothing to match against), and `Some(Some(value))` otherwise. An absent or empty selector
/// takes `default_selector`.
fn apply_default_selector(
    selector: Option<Option<String>>,
    default_selector: Option<&str>,
) -> Option<String> {
    match selector {
        None => default_selector.map(str::to_owned),
        Some(Some(value)) if value.is_empty() => default_selector.map(str::to_owned),
        Some(resolved) => resolved,
    }
}

impl DirectiveData {
    /// The selector a directive is matched with in templates: its evaluated `selector`, with
    /// no default. An empty selector is not matchable (ngtsc reports
    /// `DIRECTIVE_MISSING_SELECTOR` for it).
    pub fn effective_selector(&self) -> Option<String> {
        apply_default_selector(self.selector.as_ref().map(Resolved::get_optional), None)
    }
}

impl ComponentData {
    /// The selector a component is matched with in templates and compiled with, as ngtsc's
    /// `R3ComponentMetadata.selector`: its evaluated `selector`, defaulting to
    /// `DEFAULT_COMPONENT_SELECTOR` when absent or empty.
    pub fn effective_selector(&self) -> Option<String> {
        apply_default_selector(
            self.directive.selector.as_ref().map(Resolved::get_optional),
            Some(DEFAULT_COMPONENT_SELECTOR),
        )
    }
}
/// A decorator value that evaluated to the wrong shape: ngtsc's `VALUE_HAS_WRONG_TYPE`
/// (`NG1010`), reported by `validate()` on `span` with ngtsc's message.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ValueIssue {
    pub span: oxc_span::Span,
    pub message: String,
}

/// One stylesheet URL expression, as ngtsc's `extractComponentStyleUrls` walks `styleUrl` and
/// `styleUrls`.
#[derive(Clone, Debug)]
pub enum StyleUrlSource {
    /// `styleUrl`, or one element of a `styleUrls` array literal: must evaluate to a string.
    Single {
        url: Resolved<String>,
        span: oxc_span::Span,
        /// The span of the element when it is written as a string literal.
        string_literal_span: Option<oxc_span::Span>,
    },
    /// A `styleUrls` expression that is not an array literal (a constant, a call, ...), or the
    /// argument of a spread inside one: must evaluate to an array of strings.
    List {
        urls: Resolved<crate::evaluator::StringList>,
        span: oxc_span::Span,
    },
}

impl StyleUrlSource {
    pub fn contains_incomplete(&self) -> bool {
        match self {
            StyleUrlSource::Single { url, .. } => url.contains_incomplete(),
            StyleUrlSource::List { urls, .. } => urls.contains_incomplete(),
        }
    }

    pub async fn complete_with<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
        foreign: &[&dyn crate::evaluator::ForeignFunctionResolver],
    ) {
        match self {
            StyleUrlSource::Single { url, .. } => url.complete_with(ctx, foreign).await,
            StyleUrlSource::List { urls, .. } => urls.complete_with(ctx, foreign).await,
        }
    }
}

#[derive(Clone, Debug)]
pub struct UrlData {
    pub url: String,
    pub resolved_path: String,
    pub string_literal_span: Option<oxc_span::Span>,
    pub is_missing: bool,
}

impl UrlData {
    pub fn to_wire(&self, converter: &crate::utils::Utf8ToUtf16) -> crate::UrlMetadata {
        crate::UrlMetadata {
            url: self.url.clone(),
            resolved_path: self.resolved_path.clone(),
            string_literal_span: self
                .string_literal_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
        }
    }
}

#[derive(Clone, Debug, Default)]
pub struct ComponentData {
    pub directive: DirectiveData,
    pub template: Option<Resolved<String>>,
    /// The source text of an inline template declared as a string literal or a
    /// no-substitution template literal, between (excluding) the literal's delimiters —
    /// ngtsc's `getTemplateRange`. Such a template is parsed from the component file's source
    /// text (`sourceMapping.type === 'direct'`), so its spans are offsets into that file.
    /// `None` for any other `template` expression, which ngtsc evaluates and parses on its own
    /// (`'indirect'`), so no span of it maps to a position in the component file.
    pub template_content_span: Option<oxc_span::Span>,
    /// The `template` property's value expression span, present whenever the property is.
    pub template_span: Option<oxc_span::Span>,
    /// The `templateUrl` property's value expression span, present whenever the property is
    /// (even when its value could not be read as a string).
    pub template_url_span: Option<oxc_span::Span>,
    /// True when an inline `template` property was present in the decorator but its
    /// value could not be statically evaluated to a string (e.g. a template literal
    /// with runtime `${...}` interpolation). ngtsc rejects such templates; we surface
    /// it so the pipeline errors instead of silently emitting an empty template.
    pub template_dynamic: bool,
    pub template_url: Option<UrlData>,
    /// `@Component.styles` as the partial evaluator sees it.
    pub styles: Option<Resolved<crate::evaluator::ComponentStyles>>,
    pub styles_span: Option<oxc_span::Span>,
    pub styles_from_urls: Option<Vec<String>>,
    pub style_urls: Option<Vec<UrlData>>,
    /// The `styleUrl`/`styleUrls` expressions, kept only while one of them still waits on a
    /// constant from another file. Stage 2 completes them and reloads `style_urls` and
    /// `styles_from_urls` from the result.
    pub pending_style_urls: Option<Vec<StyleUrlSource>>,
    /// `styleUrl`/`styleUrls` values that did not evaluate to strings.
    pub style_url_issues: Vec<ValueIssue>,
    pub style_conflict_span: Option<oxc_span::Span>,
    pub encapsulation_span: Option<oxc_span::Span>,
    pub encapsulation: Option<Resolved<crate::evaluator::ViewEncapsulationValue>>,
    /// The `encapsulation` value's source text, for the same textual fallback resolution
    /// `read_core_enum_field` applies when the evaluator could not answer.
    pub encapsulation_text: Option<String>,
    pub schemas: Option<Vec<String>>,
    pub raw_imports_span: Option<oxc_span::Span>,
    /// Preserved copy of `@Component.imports` expression span, unaffected by same-file scope
    /// resolution. Required by local compilation mode for runtime dependency resolution.
    pub imports_factory_span: Option<oxc_span::Span>,
    pub resolved_declarations: Option<Vec<DeclarationData>>,
    /// The component's own `hostDirectives`, resolved in stage 2 — what ngtsc's
    /// `TypeCheckScopeRegistry` puts in `directivesOnHost` ahead of the component itself. Kept
    /// apart from `resolved_declarations`, which is the template scope.
    pub resolved_host_directives: Option<Vec<ResolvedHostDirective>>,
    /// Module specifiers to emit as bare side-effect imports in local compilation mode.
    /// Populated only by `populate_local_component_extra_imports`, i.e. only when
    /// `generateExtraImportsInLocalMode` is on and this component is non-standalone with its
    /// `@NgModule` in another file. `None` everywhere else, including in optimized mode.
    pub local_compilation_extra_imports: Option<Vec<String>>,
    pub view_providers_span: Option<oxc_span::Span>,
    pub change_detection_span: Option<oxc_span::Span>,
    pub change_detection: Option<Resolved<crate::evaluator::ChangeDetectionStrategyValue>>,
    pub preserve_whitespaces: Option<bool>,
    pub animations_span: Option<oxc_span::Span>,
    pub animation_trigger_names: Option<LegacyAnimationTriggerNames>,
    pub parsed_imports: Vec<ImportInfo>,
    pub imports: Option<Resolved<Vec<Reference>>>,
    pub deferred_imports_span: Option<oxc_span::Span>,
    pub deferred_imports: Option<Resolved<crate::evaluator::ResolvedValue>>,
    pub parsed_deferred_imports: Vec<ImportInfo>,
    pub parsed_deferred_imports_by_block:
        Option<std::collections::HashMap<String, Vec<ImportInfo>>>,
    pub resolved_deferred_declarations: Option<Vec<DeclarationData>>,
    pub resolved_deferred_declarations_by_block:
        Option<std::collections::HashMap<String, Vec<DeclarationData>>>,
    pub ng_content_selectors: Option<Vec<String>>,
    pub foreign_imports: Option<Vec<ForeignImportData>>,
    /// The `foreignImports` property's value expression span, present whenever the
    /// property itself is (even if its value is malformed).
    pub foreign_imports_span: Option<oxc_span::Span>,
    /// Malformed `foreignImports` shapes recorded during extraction, reported by `validate()`.
    pub foreign_import_issues: Vec<ForeignImportIssue>,
}

#[derive(Clone, Debug)]
pub struct ForeignImportData {
    pub name: String,
    pub span: oxc_span::Span,
}

/// A malformed shape found while extracting `foreignImports`. The parser records the shape
/// and its span as pure syntax facts; `validate()` projects each onto the `NG1010` message
/// ngtsc reports for the same input.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/util.ts#L167-L241
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ForeignImportIssueKind {
    /// The `foreignImports` value is not an array literal.
    NotAnArray,
    /// An array entry is not a call expression.
    EntryNotCall,
    /// A call entry's callee is not a simple identifier.
    CalleeNotIdentifier,
    /// A call entry does not receive exactly one argument.
    WrongArity,
    /// A call entry's argument is not a simple identifier.
    ArgNotIdentifier,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ForeignImportIssue {
    pub kind: ForeignImportIssueKind,
    pub span: oxc_span::Span,
}

/// An unrecognized `@angular/core` parameter decorator reported as NG1005.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct UnexpectedParamDecorator {
    pub name: String,
    pub span: oxc_span::Span,
}

#[derive(Clone, Debug, Default)]
pub struct PipeData {
    /// `@Pipe.name` as the partial evaluator sees it.
    pub name: Option<Resolved<String>>,
    pub name_span: Option<oxc_span::Span>,
    /// `@Pipe.pure` as the partial evaluator sees it.
    pub pure: Option<Resolved<bool>>,
    /// The `pure` property's value expression span, present whenever the property is.
    pub pure_span: Option<oxc_span::Span>,
    pub standalone: Option<bool>,
    /// The `standalone` property's value expression span, present whenever the property is.
    pub standalone_span: Option<oxc_span::Span>,
    pub args_span: Option<oxc_span::Span>,
    /// Weak `@Injectable` accompanying this pipe.
    pub injectable: Option<InjectableData>,
    /// Weak `@Service` accompanying this pipe.
    pub service: Option<ServiceData>,
    pub declaring_ng_module: Option<crate::query::ReferenceId>,
    /// Every NgModule declaring this class when more than one does (ngtsc's
    /// `LocalModuleScopeRegistry.getDuplicateDeclarations`). `declaring_ng_module` is then
    /// `None`, and validation reports NG6007. Only the semantic pass fills it in.
    pub duplicate_declaring_ng_modules: Vec<crate::query::ReferenceId>,
    pub decorator_name: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct TypeRefData {
    pub span: oxc_span::Span,
    pub name: String,
    pub module_specifier: String,
    pub symbol: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct TypeParameterData {
    pub name: String,
    pub span: oxc_span::Span,
    pub span_with_default: oxc_span::Span,
    pub has_default: bool,
    pub type_refs: Vec<TypeRefData>,
}

impl TypeParameterData {
    pub fn into_wire(
        self,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> crate::types::metadata::TypeParameterMetadata {
        let base_slice = &source_text[self.span.start as usize..self.span.end as usize];
        let representation = base_slice.to_string();
        let representation_with_default = if self.has_default {
            source_text[self.span_with_default.start as usize..self.span_with_default.end as usize]
                .to_string()
        } else {
            format!("{} = any", representation)
        };

        let tp_start_utf16 = {
            let mut s = self.span.start;
            if let Some(mut c) = converter.converter() {
                c.convert_offset(&mut s);
            }
            s
        };

        let type_refs = if self.type_refs.is_empty() {
            None
        } else {
            Some(
                self.type_refs
                    .into_iter()
                    .map(|r| {
                        let mut start = r.span.start;
                        let mut end = r.span.end;
                        if let Some(mut c) = converter.converter() {
                            c.convert_offset(&mut start);
                            c.convert_offset(&mut end);
                        }
                        let span = crate::types::metadata::SpanMetadata {
                            start: start.saturating_sub(tp_start_utf16),
                            end: end.saturating_sub(tp_start_utf16),
                        };
                        crate::types::metadata::TypeRefMetadata {
                            name: r.name,
                            module_specifier: r.module_specifier,
                            symbol: r.symbol,
                            span: Some(span),
                        }
                    })
                    .collect(),
            )
        };

        crate::types::metadata::TypeParameterMetadata {
            name: self.name,
            representation,
            representation_with_default,
            has_default: self.has_default,
            type_refs,
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ProviderFieldData {
    pub span: oxc_span::Span,
    pub is_forward_ref: bool,
}

impl ProviderFieldData {
    pub fn into_wire(
        self,
        _source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> ProviderField {
        ProviderField {
            span: crate::types::metadata::SpanMetadata::new(self.span, converter),
            is_forward_ref: self.is_forward_ref,
        }
    }
}

#[derive(Clone, Debug)]
pub struct DependencyData {
    pub token_span: Option<oxc_span::Span>,
    pub host: bool,
    pub optional: bool,
    pub self_qualifier: bool,
    pub skip_self: bool,
}

#[derive(Clone, Debug)]
pub struct InjectableData {
    pub provided_in: Option<ProviderFieldData>,
    pub use_class: Option<ProviderFieldData>,
    pub use_existing: Option<ProviderFieldData>,
    pub use_factory: Option<ProviderFieldData>,
    pub use_value: Option<ProviderFieldData>,
    pub args_span: Option<oxc_span::Span>,
    pub deps: Option<Vec<DependencyData>>,
    pub decorator_name: Option<String>,
}

#[derive(Clone, Debug)]
pub struct ServiceData {
    pub auto_provided: Option<bool>,
    pub factory: Option<ProviderFieldData>,
    pub args_span: Option<oxc_span::Span>,
    pub decorator_name: Option<String>,
}

/// One top-level element of an `@NgModule.imports` value, mirroring ngtsc's
/// `TopLevelImportedExpression`.
///
/// ngtsc evaluates `imports` twice: once as a whole, to resolve the NgModule's scope, and once
/// per top-level element, to decide what `ɵinj.imports` emits. The second pass is what makes
/// verbatim emission possible at all — an element whose references all survive filtering is
/// emitted as the user wrote it (`new WrappedNodeExpr(topLevelImport.expression)`), so the
/// element must be evaluated in isolation to know which references belong to it.
/// A single whole-array evaluation cannot substitute: array spreads splice their contents into
/// the result, so evaluated items no longer correspond 1:1 to source elements.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L621-L660
#[derive(Clone, Debug)]
pub struct TopLevelImport {
    /// Span of the expression ngtsc wraps in a `WrappedNodeExpr`. For a spread element this is
    /// the spread *argument* — ngtsc pushes `element.expression`, so `...SHARED` contributes
    /// `SHARED` — and for a non-array `imports` value it covers the whole expression.
    pub span: oxc_span::Span,
    /// This element's own partial evaluation, independent of its siblings.
    pub resolved: Resolved<Vec<Reference>>,
}

#[derive(Clone, Debug)]
pub struct NgModuleData {
    pub declarations: Option<Resolved<Vec<Reference>>>,
    pub imports: Option<Resolved<Vec<Reference>>>,
    /// The `imports` entries as written, for the recursive provider question in
    /// `may_export_providers`. Mirrors `ComponentData::parsed_imports`.
    pub parsed_imports: Vec<crate::analyzer::imports::ImportInfo>,
    pub injector_imports: Option<Resolved<Vec<Reference>>>,
    /// `imports` elements kept verbatim for `ɵinj.imports` because they contain a
    /// `ModuleWithProviders` call or only unfiltered references:
    /// `(final list index, span of the element expression)`.
    pub injector_import_raws: Option<Vec<(u32, oxc_span::Span)>>,
    /// The top-level elements of `imports`, each with its own independent evaluation.
    /// `None` when the module has no `imports` (or came from a `.d.ts`, which has no source
    /// expression to re-print). See [`TopLevelImport`].
    pub top_level_imports: Option<Vec<TopLevelImport>>,
    pub exports: Option<Resolved<Vec<Reference>>>,
    pub bootstrap: Option<Resolved<Vec<Reference>>>,
    pub providers_span: Option<oxc_span::Span>,
    pub id_span: Option<oxc_span::Span>,
    pub module_id_span: Option<oxc_span::Span>,
    pub schemas: Option<Vec<String>>,
    pub args_span: Option<oxc_span::Span>,

    /// Raw source spans of the `declarations`/`imports`/`exports`/`bootstrap` VALUE
    /// expressions (the whole expression, verbatim). Used by LOCAL compilation mode to
    /// emit `ɵɵsetNgModuleScope` fields as `WrappedNodeExpr` of the raw node, matching
    /// ngtsc's local mode:
    /// https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L566-L603
    pub declarations_span: Option<oxc_span::Span>,
    pub imports_span: Option<oxc_span::Span>,
    pub exports_span: Option<oxc_span::Span>,
    pub bootstrap_span: Option<oxc_span::Span>,
    /// Raw source spans of the top-level elements of the `imports`/`exports` arrays (each
    /// element verbatim, spreads kept). When the value is not an array literal, a single span
    /// covering the whole expression. Used by LOCAL mode to emit `ɵinj.imports` as the raw
    /// concatenation of imports+exports elements:
    /// https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L670-L688
    /// (Distinct from [`imports_element_spans`](Self::imports_element_spans), which is the
    /// selective, index-keyed set the OPTIMIZE path uses for `ModuleWithProviders` splicing.)
    pub local_imports_element_spans: Option<Vec<oxc_span::Span>>,
    pub local_exports_element_spans: Option<Vec<oxc_span::Span>>,

    /// Syntactic type-tuple classification of `imports`/`exports` for `emitDeclarationOnly`
    /// (`R3NgModuleMetadataKind.Isolated`). Computed at syntax time from the single-file AST +
    /// partial evaluator, matching `analyzeForDeclarationOnly` in
    /// `ngtsc/annotations/ng_module/src/handler.ts`.
    pub isolated_imports: Option<IsolatedTypeTupleData>,
    pub isolated_exports: Option<IsolatedTypeTupleData>,

    /// Weak `@Injectable` accompanying this module.
    pub injectable: Option<InjectableData>,
    /// Weak `@Service` accompanying this module.
    pub service: Option<ServiceData>,
    pub decorator_name: Option<String>,
}

#[derive(Clone, Debug)]
pub enum IsolatedTypeElementData {
    /// `typeof <span|ref>` — an entity-name expression, or a single locally-evaluated reference.
    Typeof {
        span: Option<oxc_span::Span>,
        reference: Option<Reference>,
    },
    /// `ReturnType<typeof <span>>` — a call expression with an entity-name callee.
    CallReturnType { callee_span: oxc_span::Span },
    /// `[typeof A, typeof B, ...]` — locally evaluates to an array of references.
    ReferenceTuple { references: Vec<Reference> },
    /// `never` — unsupported expression shape in declaration-only mode.
    Never { span: oxc_span::Span },
}

#[derive(Clone, Debug)]
pub struct IsolatedTypeTupleData {
    pub is_array_literal: bool,
    pub elements: Vec<IsolatedTypeElementData>,
}

// ==================================================================== errors

/// A wire projection failed. Carries enough context for a future structured diagnostics
/// channel on `AnalysisResult`.
#[derive(Clone, Debug)]
pub struct WireError {
    pub class_name: Option<String>,
    pub field: &'static str,
    pub cause: WireErrorCause,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum WireErrorCause {
    /// The value still contains cross-file holes. Normal at the syntax stage for
    /// yet-unmigrated required fields; an internal invariant violation after semantic
    /// resolution (the driver demotes holes).
    Incomplete,
    /// A *required* field is genuinely not statically evaluable.
    Dynamic,
    /// A *required* field resolved to the wrong shape.
    WrongShape,
}

impl std::fmt::Display for WireError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let cause = match self.cause {
            WireErrorCause::Incomplete => "still incomplete",
            WireErrorCause::Dynamic => "not statically evaluable",
            WireErrorCause::WrongShape => "resolved to the wrong shape",
        };
        write!(
            f,
            "class {}: field `{}` is {} at wire projection",
            self.class_name.as_deref().unwrap_or("<anonymous>"),
            self.field,
            cause
        )
    }
}

impl std::error::Error for WireError {}

/// Which projection is running; selects the per-field read policy.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum WireMode {
    Syntax,
    Semantic,
}

/// Pure data object holding the context needed for wire serialization.
pub struct WireContext<'a> {
    pub mode: WireMode,
    pub source_text: &'a str,
    pub converter: &'a crate::utils::Utf8ToUtf16,
    pub reference_strategy: &'a dyn crate::analyzer::import_emit::ReferenceEmitStrategy,
    pub path_lookup: Option<&'a dyn Fn(crate::query::FileId) -> std::path::PathBuf>,
    /// Pre-resolved answers for [`crate::analyzer::import_emit::ReferenceEmitStrategy::emit`]'s
    /// `declaring_export_name`; build it with `declaring_export_names[_blocking]`.
    pub declaring_exports: &'a crate::analyzer::import_emit::DeclaringExportNames,
}

impl WireContext<'_> {
    /// The pre-resolved `declaring_export_name` for `(file, name)`. An absent key means the
    /// pre-pass never resolved the pair — a drift from [`ClassData::wire_reference_slots`] —
    /// which asserts in debug and degrades to "unexported" in release.
    fn declaring_export_name(&self, file: crate::query::FileId, name: &str) -> Option<&str> {
        let entry = self.declaring_exports.get(&(file, name.to_string()));
        debug_assert!(
            entry.is_some(),
            "export-name pre-pass never resolved ({file:?}, {name})"
        );
        entry.and_then(|exported| exported.as_deref())
    }
}

// ==================================================================== accessors

impl ClassData {
    pub fn as_component(&self) -> Option<&ComponentData> {
        let DecoratorData::Component(component) = &self.decorator else {
            return None;
        };
        Some(component)
    }

    pub fn as_component_mut(&mut self) -> Option<&mut ComponentData> {
        let DecoratorData::Component(component) = &mut self.decorator else {
            return None;
        };
        Some(component)
    }

    pub fn as_ng_module(&self) -> Option<&NgModuleData> {
        let DecoratorData::NgModule(module) = &self.decorator else {
            return None;
        };
        Some(module)
    }

    /// The directive-shaped part, when this class has one (components extend directives).
    fn directive_part(&self) -> Option<&DirectiveData> {
        match &self.decorator {
            DecoratorData::Component(c) => Some(&c.directive),
            DecoratorData::Directive(d) => Some(d),
            _ => None,
        }
    }

    fn directive_part_mut(&mut self) -> Option<&mut DirectiveData> {
        match &mut self.decorator {
            DecoratorData::Component(c) => Some(&mut c.directive),
            DecoratorData::Directive(d) => Some(d),
            _ => None,
        }
    }

    pub async fn complete_selector<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
    ) {
        let Some(selector) = self.directive_part_mut().and_then(|d| d.selector.as_mut()) else {
            return;
        };
        selector
            .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
            .await;
    }

    pub async fn complete_styles<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
    ) {
        let Some(styles) = self.as_component_mut().and_then(|c| c.styles.as_mut()) else {
            return;
        };
        styles
            .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
            .await;
    }

    /// The `@Injectable` data, whether it is the classification itself or a weak decorator
    /// nested in the primary's data.
    fn injectable_data(&self) -> Option<&InjectableData> {
        match &self.decorator {
            DecoratorData::Injectable(i) => Some(i),
            DecoratorData::Component(c) => c.directive.injectable.as_ref(),
            DecoratorData::Directive(d) => d.injectable.as_ref(),
            DecoratorData::Pipe(p) => p.injectable.as_ref(),
            DecoratorData::NgModule(m) => m.injectable.as_ref(),
            DecoratorData::Service(_) => None,
        }
    }

    /// The `@Service` data, classification or weak. (A weak `@Service` on an
    /// `@Injectable`-only class is dropped — both are weak, Injectable outranks, and the
    /// combination has no meaning.)
    fn service_data(&self) -> Option<&ServiceData> {
        match &self.decorator {
            DecoratorData::Service(s) => Some(s),
            DecoratorData::Component(c) => c.directive.service.as_ref(),
            DecoratorData::Directive(d) => d.service.as_ref(),
            DecoratorData::Pipe(p) => p.service.as_ref(),
            DecoratorData::NgModule(m) => m.service.as_ref(),
            DecoratorData::Injectable(_) => None,
        }
    }

    /// The Stage-1 evaluation of `property`, when the class carries it. A field projection —
    /// for consumers that handle several properties parametrically (the scope queries).
    pub fn evaluated_property(
        &self,
        decorator_name: &str,
        property_name: &str,
    ) -> Option<&Resolved<Vec<Reference>>> {
        match (&self.decorator, decorator_name, property_name) {
            (DecoratorData::Component(c), "Component", "imports") => c.imports.as_ref(),
            (DecoratorData::NgModule(m), "NgModule", "declarations") => m.declarations.as_ref(),
            (DecoratorData::NgModule(m), "NgModule", "imports") => m.imports.as_ref(),
            (DecoratorData::NgModule(m), "NgModule", "exports") => m.exports.as_ref(),
            _ => None,
        }
    }

    /// The reference slots [`Self::to_wire`] projects through the emit strategy. The
    /// export-name pre-pass iterates the same list, so the two cannot drift apart.
    pub(crate) fn wire_reference_slots(&self) -> Vec<&Option<Resolved<Vec<Reference>>>> {
        match &self.decorator {
            DecoratorData::Component(c) => vec![&c.imports],
            DecoratorData::NgModule(m) => vec![
                &m.declarations,
                &m.imports,
                &m.injector_imports,
                &m.exports,
                &m.bootstrap,
            ],
            _ => Vec::new(),
        }
    }

    /// Whether any metadata a *consumer* reads through this class's symbol-table entry still
    /// waits on a constant from another file. See [`Self::complete_declaration_metadata`].
    pub fn has_incomplete_declaration_metadata(&self) -> bool {
        match &self.decorator {
            DecoratorData::Component(c) => c.directive.has_incomplete_declaration_metadata(),
            DecoratorData::Directive(d) => d.has_incomplete_declaration_metadata(),
            DecoratorData::Pipe(p) => p.name.as_ref().is_some_and(Resolved::contains_incomplete),
            _ => false,
        }
    }

    /// Complete the partially evaluated metadata another file reads when it uses this class
    /// as a template dependency: the selector, the pipe name, `exportAs`, and the evaluated
    /// input/output declarations. Only the partial evaluator is involved — never another
    /// file's scope or semantic analysis — so `AnalyzeFileEvaluated` can run this for any file
    /// its consumers name without creating a query cycle.
    pub async fn complete_declaration_metadata<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
    ) {
        let foreign = crate::analyzer::resolvers::angular_foreign_resolvers();
        self.complete_selector(ctx).await;
        match &mut self.decorator {
            DecoratorData::Component(c) => {
                c.directive
                    .complete_declaration_metadata(ctx, foreign)
                    .await;
            }
            DecoratorData::Directive(d) => d.complete_declaration_metadata(ctx, foreign).await,
            DecoratorData::Pipe(p) => {
                if let Some(name) = &mut p.name {
                    name.complete_with(ctx, foreign).await;
                }
            }
            _ => {}
        }
    }

    /// Completely resolve all partially-evaluated fields in-place during Stage 2.
    pub async fn resolve_semantic<Fs: crate::ResourceResolverFs + Clone + 'static>(
        &mut self,
        ctx: &crate::query::QueryContext<Fs>,
    ) {
        self.complete_declaration_metadata(ctx).await;
        let foreign = crate::analyzer::resolvers::angular_foreign_resolvers();
        let reference_id = self.reference_id;
        match &mut self.decorator {
            DecoratorData::Component(c) => {
                if let Some(host) = &mut c.directive.host_expr {
                    host.complete_with(ctx, foreign).await;
                }
                for predicate in c.directive.evaluated_query_predicates_mut() {
                    predicate.complete_with(ctx, foreign).await;
                }
                for name in c.directive.host_binding_names_mut() {
                    name.complete_with(ctx, foreign).await;
                }
                for name in c.directive.host_listener_event_names_mut() {
                    name.complete_with(ctx, foreign).await;
                }
                if let Some(imports) = &mut c.imports {
                    imports.complete_with(ctx, foreign).await;
                }
                if let Some(template) = &mut c.template {
                    template.complete_with(ctx, foreign).await;
                }
                if let Some(styles) = &mut c.styles {
                    styles.complete_with(ctx, foreign).await;
                }
                if let Some(encapsulation) = &mut c.encapsulation {
                    encapsulation.complete_with(ctx, foreign).await;
                }
                if let Some(change_detection) = &mut c.change_detection {
                    change_detection.complete_with(ctx, foreign).await;
                }
                complete_style_urls(c, reference_id, ctx, foreign).await;
            }
            DecoratorData::Directive(d) => {
                if let Some(host) = &mut d.host_expr {
                    host.complete_with(ctx, foreign).await;
                }
                for predicate in d.evaluated_query_predicates_mut() {
                    predicate.complete_with(ctx, foreign).await;
                }
                for name in d.host_binding_names_mut() {
                    name.complete_with(ctx, foreign).await;
                }
                for name in d.host_listener_event_names_mut() {
                    name.complete_with(ctx, foreign).await;
                }
            }
            DecoratorData::Pipe(p) => {
                if let Some(pure) = &mut p.pure {
                    pure.complete_with(ctx, foreign).await;
                }
            }
            DecoratorData::NgModule(m) => {
                if let Some(decls) = &mut m.declarations {
                    decls.complete_with(ctx, foreign).await;
                }
                if let Some(imports) = &mut m.imports {
                    imports.complete_with(ctx, foreign).await;
                }
                if let Some(injector_imports) = &mut m.injector_imports {
                    injector_imports.complete_with(ctx, foreign).await;
                }
                if let Some(exports) = &mut m.exports {
                    exports.complete_with(ctx, foreign).await;
                }
                if let Some(bootstrap) = &mut m.bootstrap {
                    bootstrap.complete_with(ctx, foreign).await;
                }
            }
            _ => {}
        }
    }

    /// Demote every remaining `Incomplete` hole in every `Resolved` field to `Dynamic`.
    /// Stage 2 runs this on its `FileData` copy, making `to_wire_semantic`'s no-hole
    /// invariant hold by construction.
    pub fn demote_resolved(&mut self) {
        match &mut self.decorator {
            DecoratorData::Component(c) => {
                c.directive.demote_resolved();
                if let Some(imports) = &mut c.imports {
                    imports.demote();
                }
                if let Some(template) = &mut c.template {
                    template.demote();
                }
                if let Some(styles) = &mut c.styles {
                    styles.demote();
                }
                if let Some(encapsulation) = &mut c.encapsulation {
                    encapsulation.demote();
                }
                if let Some(change_detection) = &mut c.change_detection {
                    change_detection.demote();
                }
            }
            DecoratorData::Directive(d) => d.demote_resolved(),
            DecoratorData::Pipe(p) => {
                if let Some(name) = &mut p.name {
                    name.demote();
                }
                if let Some(pure) = &mut p.pure {
                    pure.demote();
                }
            }
            DecoratorData::NgModule(m) => {
                for slot in [
                    &mut m.declarations,
                    &mut m.imports,
                    &mut m.injector_imports,
                    &mut m.exports,
                    &mut m.bootstrap,
                ]
                .into_iter()
                .flatten()
                {
                    slot.demote();
                }
            }
            _ => {}
        }
    }

    /// Validates metadata values (selector, resources, enums, etc.) against Angular rules.
    pub fn validate(
        &self,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        if self.directive_part().is_some_and(|d| d.is_jit) {
            return;
        }
        self.validate_constructor_param_decorators(file_path, converter, diagnostics);
        match &self.decorator {
            DecoratorData::Component(c) => {
                self.validate_directive(&c.directive, false, file_path, converter, diagnostics);
                self.validate_component(c, file_path, converter, diagnostics);
                self.validate_unique_declaration(
                    "Component",
                    &c.directive.duplicate_declaring_ng_modules,
                    file_path,
                    converter,
                    diagnostics,
                );
            }
            DecoratorData::Directive(d) => {
                self.validate_directive(d, true, file_path, converter, diagnostics);
                self.validate_unique_declaration(
                    "Directive",
                    &d.duplicate_declaring_ng_modules,
                    file_path,
                    converter,
                    diagnostics,
                );
            }
            DecoratorData::Pipe(p) => {
                self.validate_pipe(p, file_path, converter, diagnostics);
                self.validate_unique_declaration(
                    "Pipe",
                    &p.duplicate_declaring_ng_modules,
                    file_path,
                    converter,
                    diagnostics,
                );
            }
            DecoratorData::NgModule(m) => {
                self.validate_ng_module(m, file_path, converter, diagnostics);
            }
            _ => {}
        }
    }

    /// Report a class declared by more than one NgModule (NG6007) on its name, as ngtsc's
    /// `makeDuplicateDeclarationError` does from `getDirectiveDiagnostics` (components and
    /// directives) and the pipe handler's `resolve`. `kind` is the word ngtsc uses in the message.
    // TODO: Feature Parity with @angular/compiler-cli — `makeDuplicateDeclarationError` attaches
    // one related-information entry per declaring NgModule ("'C' is listed in the declarations of
    // the NgModule 'M1Module'.") at the class's reference in that module's `declarations`;
    // `NgDiagnostic` has no related information yet, so those entries are dropped.
    // TODO: Feature Parity with @angular/compiler-cli — ngtsc skips a component's `resolve`, and
    // with it NG6007, when the component's analysis is poisoned (e.g. by NG2010); and it reports
    // a standalone component listed in two NgModules too, while `optimize_component` only looks
    // up the declaring NgModules of a non-standalone one.
    fn validate_unique_declaration(
        &self,
        kind: &str,
        duplicate_declaring_ng_modules: &[crate::query::ReferenceId],
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        if duplicate_declaring_ng_modules.is_empty() {
            return;
        }
        let (Some(name_span), Some(class_name)) = (self.name_span, self.class_name.as_deref())
        else {
            return;
        };
        push_error(
            diagnostics,
            file_path,
            converter,
            "6007",
            name_span,
            format!("The {kind} '{class_name}' is declared by more than one NgModule."),
        );
    }

    /// Report the `id: module.id` anti-pattern (NG6100).
    fn validate_ng_module(
        &self,
        m: &NgModuleData,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        let Some(span) = m.module_id_span else {
            return;
        };
        push_warning(
            diagnostics,
            file_path,
            converter,
            "6100",
            span,
            "Using 'module.id' for NgModule.id is a common anti-pattern that is ignored by \
             the Angular compiler."
                .to_string(),
        );
    }

    fn validate_constructor_param_decorators(
        &self,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        // @Service classes reject constructor DI entirely via SERVICE_CONSTRUCTOR_DI.
        if matches!(self.decorator, DecoratorData::Service(_)) {
            return;
        }

        for decorator in &self.unexpected_param_decorators {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1005",
                decorator.span,
                format!("Unexpected decorator {} on parameter.", decorator.name),
            );
        }
    }

    fn validate_directive(
        &self,
        d: &DirectiveData,
        is_directive: bool,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        if let (Some(span), Some(ref sel)) = (d.selector_span, &d.selector) {
            let Some(ref s) = sel.get_optional() else {
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "1010",
                    span,
                    "selector must be a string".to_string(),
                );
                return;
            };
            if s.is_empty() && is_directive {
                let class_name = self.class_name.as_deref().unwrap_or("unknown");
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "2004",
                    span,
                    format!("Directive {class_name} has no selector, please add it!"),
                );
            }
        }

        for issue in d.io_issues.iter().chain(&d.unresolved_io_issues()) {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                issue.span,
                issue.message.clone(),
            );
        }

        // ngtsc evaluates `exportAs` and rejects anything that is not statically a string.
        let export_as = d.export_as.as_ref().map(Resolved::get_optional);
        if let (Some(span), Some(None)) = (d.export_as_span, export_as) {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                span,
                "exportAs must be a string".to_string(),
            );
        }

        // ngtsc evaluates the `standalone` flag and rejects anything that is not
        // statically a boolean.
        // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L375-L380
        if let (true, Some(span)) = (d.standalone_dynamic, d.standalone_span) {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                span,
                "standalone flag must be a boolean".to_string(),
            );
        }

        // ngtsc rejects a @HostBinding with more than one argument, or whose argument does not
        // statically resolve to a string.
        // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L641-L671
        for binding in &d.host_bindings {
            if binding.arguments.len() > 1 {
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "1002",
                    binding.decorator_span,
                    format!(
                        "@HostBinding can have at most one argument, got {} argument(s)",
                        binding.arguments.len()
                    ),
                );
                continue;
            }
            let Some(name) = &binding.host_property_name else {
                continue;
            };

            // TODO(parity): the single-file pipeline drops such a binding instead of binding
            // it under the imported name.
            if name.contains_incomplete() {
                continue;
            }
            if name.get_optional().is_none() {
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "1010",
                    binding.decorator_span,
                    "@HostBinding's argument must be a string".to_string(),
                );
            }
        }

        for listener in &d.host_listeners {
            if listener.resolved_event_name.contains_incomplete() {
                continue;
            }
            if listener.resolved_event_name.get_optional().is_none() {
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "1010",
                    listener
                        .event_name
                        .as_ref()
                        .map_or(listener.decorator_span, |name| name.span),
                    "@HostListener's event name argument must be a string".to_string(),
                );
            }
        }

        // ngtsc rejects @HostListener arguments that cannot be statically resolved to a string array.
        // https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L742-L754
        // https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L1091-L1105
        for listener in &d.host_listeners {
            for err in &listener.args_errors {
                match err {
                    HostListenerArgsError::NotStringArray(span) => {
                        push_error(
                            diagnostics,
                            file_path,
                            converter,
                            "1010",
                            *span,
                            "@HostListener's second argument must be a string array".to_string(),
                        );
                    }
                    HostListenerArgsError::ElementNotString { span, index } => {
                        push_error(
                            diagnostics,
                            file_path,
                            converter,
                            "1010",
                            *span,
                            format!("Failed to resolve @HostListener.args at position {index} to a string"),
                        );
                    }
                }
            }
        }
    }

    fn validate_component(
        &self,
        c: &ComponentData,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        let default_span = c.directive.args_span.unwrap_or(self.span);

        if let Some(span) = c.style_conflict_span {
            push_error(
                diagnostics,
                file_path,
                converter,
                "2021",
                span,
                "@Component cannot define both `styleUrl` and `styleUrls`. Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple".to_string(),
            );
        }

        for issue in &c.style_url_issues {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                issue.span,
                issue.message.clone(),
            );
        }

        if let Some(ref urls) = c.style_urls {
            for u in urls {
                if u.is_missing {
                    let span = u.string_literal_span.unwrap_or(default_span);
                    push_error(
                        diagnostics,
                        file_path,
                        converter,
                        "2008",
                        span,
                        format!("Could not find stylesheet file '{}'.", u.url),
                    );
                }
            }
        }

        if let Some(ref t_url) = c.template_url {
            if t_url.is_missing {
                let span = t_url.string_literal_span.unwrap_or(default_span);
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "2008",
                    span,
                    format!("Could not find template file '{}'.", t_url.url),
                );
            }
        }

        self.validate_template_declaration(c, file_path, converter, diagnostics);
        self.validate_component_styles(c, file_path, converter, diagnostics);
        self.validate_component_imports(c, file_path, converter, diagnostics);
        self.validate_shadow_dom_selector(c, file_path, converter, diagnostics);
    }

    /// `@Component.styles` must evaluate to a string or an array of strings (`NG1010`).
    // TODO(parity): ngtsc chains the reason (e.g. "Value could not be determined statically.")
    // under the message.
    // TODO(parity): local compilation should report NG11001 for unresolved identifiers.
    fn validate_component_styles(
        &self,
        c: &ComponentData,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        let (Some(styles), Some(span)) = (&c.styles, c.styles_span) else {
            return;
        };
        let Err(error) = crate::evaluator::ComponentStyles::parse(styles.raw()) else {
            return;
        };
        let message = match error {
            crate::evaluator::ComponentStylesError::NotStringOrArray => {
                "Failed to resolve @Component.styles to a string or an array of strings".to_string()
            }
            crate::evaluator::ComponentStylesError::EntryNotString(index) => {
                format!("Failed to resolve styles at position {index} to a string")
            }
        };
        push_error(diagnostics, file_path, converter, "1010", span, message);
    }

    fn validate_shadow_dom_selector(
        &self,
        c: &ComponentData,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        // A ShadowDom-encapsulated component's selector must satisfy the custom element
        // tag name rules, checked against the resolved selector and reported on the
        // `selector` property like ngtsc's component handler.
        // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L922-L940
        let encapsulation = c
            .encapsulation
            .as_ref()
            .and_then(|e| e.get_optional())
            .map(|v| v.0)
            .or_else(|| {
                c.encapsulation_text
                    .as_deref()
                    .and_then(|text| VIEW_ENCAPSULATION.resolve_locally(text))
            });
        const SHADOW_DOM: i32 = 3;
        const EXPERIMENTAL_ISOLATED_SHADOW_DOM: i32 = 4;
        if !matches!(
            encapsulation,
            Some(SHADOW_DOM) | Some(EXPERIMENTAL_ISOLATED_SHADOW_DOM)
        ) {
            return;
        }

        let Some(selector) = c.directive.selector.as_ref().and_then(|s| s.get_optional()) else {
            return;
        };
        let Some(span) = c.directive.selector_span else {
            return;
        };
        let Some(message) = check_custom_element_selector_for_errors(&selector) else {
            return;
        };
        push_error(
            diagnostics,
            file_path,
            converter,
            "2009",
            span,
            message.to_string(),
        );
    }

    fn validate_pipe(
        &self,
        p: &PipeData,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        let Some(args_span) = p.args_span else {
            return;
        };

        // ngtsc's pipe handler: a missing `name` property is NG2002 on the metadata
        // object; a present one that does not statically resolve to a string is
        // NG1010 on the value. Note an empty string is a *valid* name to the
        // handler, so it is not reported here.
        // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/src/pipe.ts#L161-L196
        if p.name_span.is_none() {
            push_error(
                diagnostics,
                file_path,
                converter,
                "2002",
                args_span,
                "@Pipe decorator is missing name field".to_string(),
            );
        } else if p.name.as_ref().and_then(Resolved::get_optional).is_none() {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                p.name_span.unwrap_or(args_span),
                "@Pipe.name must be a string".to_string(),
            );
        }

        let pure = p.pure.as_ref().map(Resolved::get_optional);
        if let (Some(span), Some(None)) = (p.pure_span, pure) {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                span,
                "@Pipe.pure must be a boolean".to_string(),
            );
        }

        if let (Some(span), None) = (p.standalone_span, p.standalone) {
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                span,
                "standalone flag must be a boolean".to_string(),
            );
        }
    }

    /// Validates the component's template declaration the way ngtsc's
    /// `parseTemplateDeclaration` does: `templateUrl` takes precedence over `template`, each
    /// must statically resolve to a string (`NG1010`), and a component with neither is
    /// missing its template (`NG2001`).
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/resources.ts#L392-L439
    fn validate_template_declaration(
        &self,
        c: &ComponentData,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        if let Some(span) = c.template_url_span {
            // `template_url` is only populated when the value read as a string, so a present
            // property with no `UrlData` is ngtsc's "templateUrl must be a string" case.
            // TODO(parity): `templateUrl` is read syntactically (single-file), while ngtsc
            // evaluates it, so a constant imported from another file resolves there but is
            // reported here. Route it through the evaluator like `template` to close the gap.
            if c.template_url.is_none() {
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "1010",
                    span,
                    "templateUrl must be a string".to_string(),
                );
            }
        } else if let Some(span) = c.template_span {
            // An inline template that did not statically resolve to a string. Only checked
            // when `templateUrl` is absent, matching the reference's precedence.
            let dynamic = c
                .template
                .as_ref()
                .map(|t| t.get_optional().is_none())
                .unwrap_or(false);
            if dynamic {
                push_error(
                    diagnostics,
                    file_path,
                    converter,
                    "1010",
                    span,
                    "template must be a string".to_string(),
                );
            }
        } else if c.directive.args_span.is_some() {
            // Metadata object present but declares neither `template` nor `templateUrl`.
            // ngtsc reports this on the decorator node.
            let span = self
                .ng_decorator_spans
                .first()
                .copied()
                .unwrap_or(self.span);
            push_error(
                diagnostics,
                file_path,
                converter,
                "2001",
                span,
                "@Component is missing a template. Add either a `template` or `templateUrl`"
                    .to_string(),
            );
        }
    }

    /// Validates `imports`/`foreignImports` usage on a component the way ngtsc's component
    /// handler does: a non-standalone component may not use either field (`NG2010`, reported
    /// once on the first field present), and only a standalone component's `foreignImports`
    /// shapes are checked further (`NG1010` per malformed entry).
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L614-L652
    fn validate_component_imports(
        &self,
        c: &ComponentData,
        file_path: &std::path::Path,
        converter: &crate::utils::Utf8ToUtf16,
        diagnostics: &mut Vec<crate::NgDiagnostic>,
    ) {
        if !c.directive.standalone {
            // ngtsc reports the standalone violation and poisons the component instead of
            // extracting the import fields, so the per-entry shape diagnostics never fire.
            // `imports_factory_span` rather than `raw_imports_span`: the latter doubles as
            // "imports still needing runtime resolution" and is cleared as resolution
            // progresses, while the former is a stable record of the `imports` property.
            let (field, span) = if let Some(span) = c.imports_factory_span {
                ("imports", span)
            } else if let Some(span) = c.deferred_imports_span {
                ("deferredImports", span)
            } else if let Some(span) = c.foreign_imports_span {
                ("foreignImports", span)
            } else {
                return;
            };
            push_error(
                diagnostics,
                file_path,
                converter,
                "2010",
                span,
                format!("'{field}' is only valid on a component that is standalone."),
            );
            return;
        }

        for issue in &c.foreign_import_issues {
            // Messages mirror `extractForeignImportsFromAst` verbatim.
            // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/util.ts#L167-L241
            let message = match issue.kind {
                ForeignImportIssueKind::NotAnArray => {
                    "'foreignImports' must be an array of foreign imports, e.g. 'foreignImports: [myImport(MyComponent)]'."
                }
                ForeignImportIssueKind::EntryNotCall => {
                    "Each foreign import must be a call expression, e.g. 'myImport(MyComponent)'."
                }
                ForeignImportIssueKind::CalleeNotIdentifier => {
                    "The foreign import function must be a simple identifier, e.g. 'myImport(MyComponent)'."
                }
                ForeignImportIssueKind::WrongArity => {
                    "Foreign import calls must receive exactly one argument, e.g. 'myImport(MyComponent)'."
                }
                ForeignImportIssueKind::ArgNotIdentifier => {
                    "The component reference passed to the foreign import must be a simple identifier, e.g. 'myImport(MyComponent)'."
                }
            };
            push_error(
                diagnostics,
                file_path,
                converter,
                "1010",
                issue.span,
                message.to_string(),
            );
        }
    }
}

/// Checks whether a selector is a valid custom element tag name, returning the reference's
/// message for the first violated rule. Port of ngtsc's
/// `checkCustomElementSelectorForErrors`, including its attribute/class selector escape hatch.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/diagnostics.ts#L36-L57
fn check_custom_element_selector_for_errors(selector: &str) -> Option<&'static str> {
    // Avoid flagging components with an attribute or class selector. This isn't bulletproof
    // since it won't catch cases like `foo[]bar`, but it doesn't need to be — it exists to
    // avoid flagging something like `foo-bar[baz]` incorrectly.
    if selector.contains('.') || (selector.contains('[') && selector.contains(']')) {
        return None;
    }

    if !selector.starts_with(|c: char| c.is_ascii_lowercase()) {
        return Some(
            "Selector of a ShadowDom-encapsulated component must start with a lower case letter.",
        );
    }

    if selector.chars().any(|c| c.is_ascii_uppercase()) {
        return Some("Selector of a ShadowDom-encapsulated component must all be in lower case.");
    }

    if !selector.contains('-') {
        return Some(
            "Selector of a component that uses ViewEncapsulation.ShadowDom must contain a hyphen.",
        );
    }

    None
}

/// Build an error-severity `NgDiagnostic` carrying the given `NG` code and push it onto the
/// file's diagnostics list.
fn push_error(
    diagnostics: &mut Vec<crate::NgDiagnostic>,
    file_path: &std::path::Path,
    converter: &crate::utils::Utf8ToUtf16,
    code: &'static str,
    span: oxc_span::Span,
    message: String,
) {
    push_diagnostic(
        diagnostics,
        file_path,
        converter,
        oxc_diagnostics::OxcDiagnostic::error(message),
        code,
        span,
    );
}

/// [`push_error`] for the codes ngtsc reports as warnings rather than errors, which compile
/// successfully but flag something the author probably did not intend.
fn push_warning(
    diagnostics: &mut Vec<crate::NgDiagnostic>,
    file_path: &std::path::Path,
    converter: &crate::utils::Utf8ToUtf16,
    code: &'static str,
    span: oxc_span::Span,
    message: String,
) {
    push_diagnostic(
        diagnostics,
        file_path,
        converter,
        oxc_diagnostics::OxcDiagnostic::warn(message),
        code,
        span,
    );
}

/// Stamp the `NG` code and source span onto a diagnostic and push it. The severity already
/// on `diag` is what `NgDiagnostic::from_oxc` turns into the wire category.
fn push_diagnostic(
    diagnostics: &mut Vec<crate::NgDiagnostic>,
    file_path: &std::path::Path,
    converter: &crate::utils::Utf8ToUtf16,
    diag: oxc_diagnostics::OxcDiagnostic,
    code: &'static str,
    span: oxc_span::Span,
) {
    let oxc_diag = diag.with_error_code("NG", code).with_label(span);
    diagnostics.push(crate::NgDiagnostic::from_oxc(
        &oxc_diag,
        Some(file_path.to_string_lossy().into_owned()),
        converter,
    ));
}

// ==================================================================== wire projection

/// Project an evaluated `host` object onto the wire, resolving each unevaluable value to the
/// source text at its span so the consumer can re-emit it verbatim — the equivalent of ngtsc
/// handing the node itself to `WrappedNodeExpr`. A span that does not name a non-empty slice
/// of this file's text (only reachable if the analyzer and the text disagree) drops its entry
/// rather than panicking or emitting an expression that prints as nothing.
fn host_metadata_wire(
    host: crate::evaluator::HostMetadata,
    source_text: &str,
) -> Vec<crate::types::metadata::HostMetadataEntry> {
    let mut entries = Vec::with_capacity(host.0.len());
    for (key, value) in host.0 {
        let (value, expression) = match value {
            crate::evaluator::HostMetadataValue::Static(text) => (Some(text), None),
            crate::evaluator::HostMetadataValue::Dynamic(span) => {
                match source_text.get(span.start as usize..span.end as usize) {
                    Some(text) if !text.is_empty() => (None, Some(text.to_string())),
                    _ => continue,
                }
            }
        };
        entries.push(crate::types::metadata::HostMetadataEntry {
            key,
            value,
            expression,
        });
    }
    entries
}

/// An `@angular/core` enum the analyzer resolves by hand, with this tree's member numbering.
struct CoreEnum {
    name: &'static str,
    members: &'static [(&'static str, i32)],
}

/// Numbered as `@angular/compiler` (and this tree's `@angular/core`) number them.
const VIEW_ENCAPSULATION: CoreEnum = CoreEnum {
    name: "ViewEncapsulation",
    members: &[
        ("Emulated", 0),
        ("None", 2),
        ("ShadowDom", 3),
        ("ExperimentalIsolatedShadowDom", 4),
    ],
};

const CHANGE_DETECTION_ON_PUSH: i32 = 0;

/// In this tree, as upstream, `OnPush` is the default (0) and `Default` is the deprecated
/// equivalent of `Eager` (both 1).
const CHANGE_DETECTION_STRATEGY: CoreEnum = CoreEnum {
    name: "ChangeDetectionStrategy",
    members: &[
        ("OnPush", CHANGE_DETECTION_ON_PUSH),
        ("Default", 1),
        ("Eager", 1),
    ],
};

impl CoreEnum {
    /// ngtsc's local-compilation resolver: the text must be exactly `Enum.Member`, or end in
    /// `.Enum.Member` (namespace access).
    /// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/evaluation.ts#L54-L77
    fn resolve_locally(&self, expr_text: &str) -> Option<i32> {
        let text = expr_text.trim();
        for (member, value) in self.members {
            let Some(receiver) = text
                .strip_suffix(member)
                .and_then(|t| t.strip_suffix('.'))
                .and_then(|t| t.strip_suffix(self.name))
            else {
                continue;
            };
            if receiver.is_empty() || receiver.ends_with('.') {
                return Some(*value);
            }
        }
        None
    }
}

impl InjectableData {
    fn to_wire(
        &self,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> InjectableMetadata {
        InjectableMetadata {
            decorator_name: self.decorator_name.clone(),
            provided_in: self
                .provided_in
                .clone()
                .map(|p| p.into_wire(source_text, converter)),
            use_class: self
                .use_class
                .clone()
                .map(|p| p.into_wire(source_text, converter)),
            use_existing: self
                .use_existing
                .clone()
                .map(|p| p.into_wire(source_text, converter)),
            use_factory: self
                .use_factory
                .clone()
                .map(|p| p.into_wire(source_text, converter)),
            use_value: self
                .use_value
                .clone()
                .map(|p| p.into_wire(source_text, converter)),
            args_span: self
                .args_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
            deps: self.deps.as_ref().map(|deps| {
                deps.iter()
                    .map(|d| crate::types::metadata::DependencyMetadata {
                        token_span: d
                            .token_span
                            .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
                        host: d.host,
                        optional: d.optional,
                        self_qualifier: d.self_qualifier,
                        skip_self: d.skip_self,
                    })
                    .collect()
            }),
        }
    }
}

impl ServiceData {
    fn to_wire(&self, source_text: &str, converter: &crate::utils::Utf8ToUtf16) -> ServiceMetadata {
        ServiceMetadata {
            decorator_name: self.decorator_name.clone(),
            auto_provided: self.auto_provided,
            factory: self
                .factory
                .clone()
                .map(|f| f.into_wire(source_text, converter)),
            args_span: self
                .args_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
        }
    }
}

impl TransformData {
    pub fn to_wire(
        &self,
        _source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> TransformMetadata {
        match self {
            TransformData::Type {
                type_span,
                value_span,
            } => TransformMetadata {
                kind: "type".to_string(),
                span: crate::types::metadata::SpanMetadata::new(*value_span, converter),
                type_span: Some(crate::types::metadata::SpanMetadata::new(
                    *type_span, converter,
                )),
            },
            TransformData::Expression(span) => TransformMetadata {
                kind: "expression".to_string(),
                span: crate::types::metadata::SpanMetadata::new(*span, converter),
                type_span: None,
            },
        }
    }
}

impl ExpressionValueData {
    pub fn into_wire(
        self,
        _source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> ExpressionValueMetadata {
        ExpressionValueMetadata {
            kind: match self.kind {
                ExpressionValueKind::String => ExpressionValueKindMetadata::String,
                ExpressionValueKind::Identifier => ExpressionValueKindMetadata::Identifier,
                ExpressionValueKind::Unspecified => ExpressionValueKindMetadata::Unspecified,
            },
            text: self.text,
            source_span: crate::types::metadata::SpanMetadata::new(self.span, converter),
        }
    }
}

impl HostPropertyData {
    pub fn into_wire(
        self,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> HostPropertyMetadata {
        HostPropertyMetadata {
            key: self.key.into_wire(source_text, converter),
            value: self.value.into_wire(source_text, converter),
        }
    }
}

impl HostBindingData {
    pub fn to_wire(
        &self,
        host_property_name: Option<String>,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> HostBindingMetadata {
        HostBindingMetadata {
            member_name: self.member_name.clone().into_wire(source_text, converter),
            arguments: self
                .arguments
                .iter()
                .cloned()
                .map(|arg| arg.into_wire(source_text, converter))
                .collect(),
            host_property_name,
            decorator_span: crate::types::metadata::SpanMetadata::new(
                self.decorator_span,
                converter,
            ),
            member_span: crate::types::metadata::SpanMetadata::new(self.member_span, converter),
        }
    }
}

impl HostListenerData {
    pub fn to_wire(
        &self,
        resolved_event_name: Option<String>,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> HostListenerMetadata {
        HostListenerMetadata {
            method_name: self.method_name.clone().into_wire(source_text, converter),
            event_name: self
                .event_name
                .clone()
                .map(|name| name.into_wire(source_text, converter)),
            resolved_event_name,
            args: self
                .args
                .iter()
                .cloned()
                .map(|arg| arg.into_wire(source_text, converter))
                .collect(),
            runtime_args: self.runtime_args.clone(),
            decorator_span: crate::types::metadata::SpanMetadata::new(
                self.decorator_span,
                converter,
            ),
            member_span: crate::types::metadata::SpanMetadata::new(self.member_span, converter),
        }
    }
}

impl AngularField {
    pub fn to_wire(
        &self,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> crate::AngularFieldMetadata {
        match self {
            AngularField::Input(i) => crate::AngularFieldMetadata {
                kind: "input".to_string(),
                input: Some(i.to_wire(source_text, converter, false)),
                output: None,
                query: None,
                coercion: None,
            },
            AngularField::Output(o) => crate::AngularFieldMetadata {
                kind: "output".to_string(),
                input: None,
                output: Some(o.to_wire(source_text, converter)),
                query: None,
                coercion: None,
            },
            AngularField::Query(q) => crate::AngularFieldMetadata {
                kind: "query".to_string(),
                input: None,
                output: None,
                query: Some(q.to_wire(source_text, converter)),
                coercion: None,
            },
            AngularField::InputCoercion(name) => crate::AngularFieldMetadata {
                kind: "coercion".to_string(),
                input: None,
                output: None,
                query: None,
                coercion: Some(name.clone()),
            },
        }
    }
}

/// The member API surface pre-derived from a directive part's `fields`, plus the ready-made
/// coercion member block.
#[derive(Default)]
struct PreparedMembers {
    inputs: Vec<InputMetadata>,
    outputs: Vec<OutputMetadata>,
    queries: Vec<QueryMetadata>,
    view_queries: Vec<QueryMetadata>,
    coercion_members: String,
}

/// `ngAcceptInputType_` coercion members are type-checking-only declarations: ngtsc adds them
/// solely to the `.d.ts` (via DtsTransform) and never to the emitted JS. They are spliced as
/// `declare static` ambient members so TypeScript strips them entirely from JS (a plain
/// type-only field would otherwise leak as a value-less `static ngAcceptInputType_x;` under
/// `useDefineForClassFields`) while preserving them in the `.d.ts`. The `@ts-ignore` guards
/// against `noImplicitOverride` when the class extends another component.
/// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/input_transforms.ts#L14-L36
const NG_ACCEPT_INPUT_TYPE_PREFIX: &str = "  // @ts-ignore\n  declare static ngAcceptInputType_";

fn prepare_members(
    d: &DirectiveData,
    source_text: &str,
    converter: &crate::utils::Utf8ToUtf16,
) -> PreparedMembers {
    let mut prepared = PreparedMembers::default();
    let mut coercions: std::collections::HashSet<&str> = std::collections::HashSet::new();

    for field in &d.fields {
        match field {
            AngularField::Input(i) => {
                // Decorator-based inputs with a `transform` contribute a coercion member;
                // sliced here from the original (UTF-8) spans rather than the wire's UTF-16
                // ones. `.d.ts` extraction stamps an empty span on transforms it cannot
                // locate, which would splice a malformed `: ;` member.
                if !i.is_signal {
                    use std::fmt::Write;
                    match &i.transform {
                        Some(TransformData::Type { type_span, .. }) if !type_span.is_empty() => {
                            let type_str =
                                &source_text[type_span.start as usize..type_span.end as usize];
                            let _ = writeln!(
                                prepared.coercion_members,
                                "{NG_ACCEPT_INPUT_TYPE_PREFIX}{}: {type_str};",
                                i.name
                            );
                        }
                        Some(TransformData::Expression(span)) if !span.is_empty() => {
                            let expr_str = &source_text[span.start as usize..span.end as usize];
                            let _ = writeln!(
                                prepared.coercion_members,
                                "{NG_ACCEPT_INPUT_TYPE_PREFIX}{}: Parameters<typeof {expr_str}>[0];",
                                i.name
                            );
                        }
                        _ => {}
                    }
                }
                prepared
                    .inputs
                    .push(i.to_wire(source_text, converter, false));
            }
            AngularField::Output(o) => {
                prepared.outputs.push(o.to_wire(source_text, converter));
            }
            AngularField::Query(q) => {
                let wire = q.to_wire(source_text, converter);
                if q.is_view {
                    prepared.view_queries.push(wire);
                } else {
                    prepared.queries.push(wire);
                }
            }
            AngularField::InputCoercion(name) => {
                coercions.insert(name.as_str());
            }
        }
    }

    for input in &mut prepared.inputs {
        if coercions.contains(input.name.as_str()) {
            input.is_coerced = true;
        }
    }

    // Signal queries first, then `first` queries, then the rest (stable within groups).
    let sort_key = |q: &QueryMetadata| {
        if q.is_signal {
            0
        } else if q.first {
            1
        } else {
            2
        }
    };
    prepared.queries.sort_by_key(sort_key);
    prepared.view_queries.sort_by_key(sort_key);

    prepared
}

impl InputData {
    pub fn to_wire(
        &self,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
        is_coerced: bool,
    ) -> InputMetadata {
        InputMetadata {
            name: self.name.clone(),
            alias: self.alias.clone(),
            required: self.required,
            is_signal: self.is_signal,
            decorator_span: self
                .decorator_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
            property_span: self
                .property_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
            transform: self
                .transform
                .as_ref()
                .map(|t| t.to_wire(source_text, converter)),
            is_restricted: self.is_restricted,
            is_literal: self.is_literal,
            is_coerced,
        }
    }
}

impl OutputData {
    pub fn to_wire(
        &self,
        _source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> OutputMetadata {
        OutputMetadata {
            name: self.name.clone(),
            alias: self.alias.clone(),
            decorator_span: self
                .decorator_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
            property_span: self
                .property_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
            is_signal: self.is_signal,
        }
    }
}

impl QueryData {
    pub fn to_wire(
        &self,
        _source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> QueryMetadata {
        QueryMetadata {
            property_name: self.property_name.clone(),
            first: self.first,
            is_forward_ref: self.is_forward_ref,
            predicate_span: crate::types::metadata::SpanMetadata::new(
                self.predicate_span,
                converter,
            ),
            predicate_selectors: self.predicate.selectors(),
            descendants: self.descendants,
            emit_distinct_changes_only: self.emit_distinct_changes_only,
            read_span: self
                .read_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
            is_static: self.is_static,
            is_signal: self.is_signal,
            decorator_span: self
                .decorator_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
            is_view: self.is_view,
            property_span: self
                .property_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, converter)),
        }
    }
}

impl ClassData {
    /// Project an analysis into the wire shape using the provided `WireContext`.
    pub fn to_wire(&self, cx: &WireContext) -> Result<ClassMetadata, WireError> {
        // Weak decorators project regardless of which classification carries them.
        let injectable = self
            .injectable_data()
            .map(|i| i.to_wire(cx.source_text, cx.converter));
        let service = self
            .service_data()
            .map(|s| s.to_wire(cx.source_text, cx.converter));
        let mut component = None;
        let mut directive = None;
        let mut pipe = None;
        let mut ng_module = None;

        match &self.decorator {
            DecoratorData::Component(c) => {
                component = Some(self.component_wire(c, cx)?);
            }
            DecoratorData::Directive(d) => {
                directive = Some(self.directive_wire(d, cx)?);
            }
            DecoratorData::Pipe(p) => {
                let declaring_ng_module = p.declaring_ng_module.as_ref().and_then(|ref_id| {
                    cx.path_lookup
                        .map(|lookup| crate::types::metadata::DeclaringNgModule {
                            file_path: lookup(ref_id.file).to_string_lossy().into_owned(),
                            symbol_id: ref_id.symbol.index() as u32,
                        })
                });
                pipe = Some(PipeMetadata {
                    decorator_name: p.decorator_name.clone(),
                    name: self
                        .read_optional_string(&p.name, cx, "pipe.name")?
                        .or_else(|| self.class_name.clone())
                        .unwrap_or_default(),
                    pure: self.read_optional_field(p.pure.as_ref(), cx, "pipe.pure")?,
                    standalone: p.standalone,
                    args_span: p
                        .args_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    declaring_ng_module,
                });
            }
            DecoratorData::NgModule(m) => {
                let any_synthetic = |slot: &Option<crate::evaluator::Resolved<Vec<Reference>>>| {
                    slot.as_ref()
                        .is_some_and(|s| s.raw().any_reference(&mut |r| r.synthetic))
                };
                ng_module = Some(NgModuleMetadata {
                    decorator_name: m.decorator_name.clone(),
                    remote_scopes_may_require_cycle_protection: any_synthetic(&m.declarations)
                        || any_synthetic(&m.imports),
                    declarations: self.to_wire_refs(&m.declarations, cx),
                    public_declarations: self.public_declarations_wire(m, cx),
                    imports: self.to_wire_refs(&m.imports, cx),
                    injector_imports: self.to_wire_refs(&m.injector_imports, cx),
                    injector_import_raw_spans: m.injector_import_raws.as_ref().map(|raws| {
                        raws.iter()
                            .map(|(index, span)| {
                                crate::types::metadata::RawInjectorImportMetadata {
                                    index: *index,
                                    span: crate::types::metadata::SpanMetadata::new(
                                        *span,
                                        cx.converter,
                                    ),
                                }
                            })
                            .collect()
                    }),
                    exports: self.to_wire_refs(&m.exports, cx),
                    bootstrap: self.to_wire_refs(&m.bootstrap, cx),
                    providers_span: m
                        .providers_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    id_span: m
                        .id_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    schemas: m.schemas.clone(),

                    args_span: m
                        .args_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    declarations_span: m
                        .declarations_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    imports_span: m
                        .imports_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    exports_span: m
                        .exports_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    bootstrap_span: m
                        .bootstrap_span
                        .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
                    local_imports_element_spans: m.local_imports_element_spans.as_ref().map(
                        |spans| {
                            spans
                                .iter()
                                .map(|s| {
                                    crate::types::metadata::SpanMetadata::new(*s, cx.converter)
                                })
                                .collect()
                        },
                    ),
                    local_exports_element_spans: m.local_exports_element_spans.as_ref().map(
                        |spans| {
                            spans
                                .iter()
                                .map(|s| {
                                    crate::types::metadata::SpanMetadata::new(*s, cx.converter)
                                })
                                .collect()
                        },
                    ),
                    isolated_imports: m
                        .isolated_imports
                        .as_ref()
                        .map(|t| self.to_wire_isolated_tuple(t, cx)),
                    isolated_exports: m
                        .isolated_exports
                        .as_ref()
                        .map(|t| self.to_wire_isolated_tuple(t, cx)),
                });
            }
            // Already projected via injectable_data()/service_data() above.
            DecoratorData::Injectable(_) | DecoratorData::Service(_) => {}
        }

        // Member-level API surface: from the directive part; empty defaults for
        // non-directive classifications (the wire shape keeps these top-level).
        let members = self.directive_part();
        let prepared = members
            .map(|m| prepare_members(m, cx.source_text, cx.converter))
            .unwrap_or_default();
        let is_jit = members.is_some_and(|d| d.is_jit);
        // For JIT classes, decorators are preserved on source, so removal_spans is empty.
        let removal_spans: Vec<crate::types::metadata::SpanMetadata> = if is_jit {
            Vec::new()
        } else {
            self.decorator_removal_spans
                .iter()
                .map(|s| crate::types::metadata::SpanMetadata::new(*s, cx.converter))
                .collect()
        };
        // A JIT class keeps its decorators, so tsickle still adds `@nocollapse` itself.
        let nocollapse_insertions: Vec<crate::types::metadata::TextInsertionMetadata> = if is_jit {
            Vec::new()
        } else {
            self.nocollapse_insertions
                .iter()
                .map(|insertion| {
                    crate::types::metadata::TextInsertionMetadata::new(
                        insertion.position,
                        insertion.text.clone(),
                        cx.converter,
                    )
                })
                .collect()
        };
        let class_ref = self.class_name.as_ref().map(|name| {
            let dummy = std::path::PathBuf::from("");
            let current_file_path = cx
                .path_lookup
                .map(|lookup| lookup(self.reference_id.file))
                .unwrap_or(dummy);
            let mut alias_map = std::collections::HashMap::new();
            alias_map.insert(self.reference_id.file, name.clone());
            let self_ref = crate::types::analysis::Reference {
                file: self.reference_id.file,
                name: name.clone(),
                owning_reference: None,
                aliases: alias_map,
                is_default_export: false,
            };
            let mut r = cx.reference_strategy.emit(
                &self_ref,
                self.reference_id.file,
                &current_file_path,
                &current_file_path,
                cx.declaring_export_name(self_ref.file, &self_ref.name),
            );
            if !self.is_exported || self.has_non_exported_bounds {
                r.typecheck_import = None;
            }
            r
        });
        let metadata = ClassMetadata {
            symbol_id: self.reference_id.symbol.index() as u32,
            span: crate::types::metadata::SpanMetadata::new(self.span, cx.converter),
            decorated_span: crate::types::metadata::SpanMetadata::new(
                self.decorated_span,
                cx.converter,
            ),
            name_span: self
                .name_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            class_name: self.class_name.clone(),
            r#ref: class_ref,
            constructor_params: self.constructor_params.clone(),
            member_decorators: if self.member_decorators.is_empty() {
                None
            } else {
                Some(self.member_decorators.clone())
            },
            later_declaration_references: self
                .later_declaration_references
                .iter()
                .map(|span| crate::types::metadata::SpanMetadata::new(*span, cx.converter))
                .collect(),
            injectable,
            service,
            component,
            directive,
            pipe,
            ng_module,
            fields: members
                .map(|m| {
                    m.fields
                        .iter()
                        .map(|f| f.to_wire(cx.source_text, cx.converter))
                        .collect()
                })
                .unwrap_or_default(),
            flattened_fields: self.flattened_fields.clone(),
            inputs: prepared.inputs,
            outputs: prepared.outputs,
            queries: prepared.queries,
            view_queries: prepared.view_queries,
            removal_spans,
            nocollapse_insertions,
            coercion_members: prepared.coercion_members,
            host_bindings: members
                .map(|m| {
                    m.host_bindings
                        .iter()
                        .map(|b| {
                            let host_property_name = self.read_optional_field(
                                b.host_property_name.as_ref(),
                                cx,
                                "host_bindings.host_property_name",
                            )?;
                            Ok(b.to_wire(host_property_name, cx.source_text, cx.converter))
                        })
                        .collect::<Result<Vec<_>, WireError>>()
                })
                .transpose()?
                .unwrap_or_default(),
            host_listeners: members
                .map(|m| {
                    m.host_listeners
                        .iter()
                        .map(|l| {
                            let resolved_event_name = self.read_optional_field(
                                Some(&l.resolved_event_name),
                                cx,
                                "host_listeners.resolved_event_name",
                            )?;
                            Ok(l.to_wire(resolved_event_name, cx.source_text, cx.converter))
                        })
                        .collect::<Result<Vec<_>, WireError>>()
                })
                .transpose()?
                .unwrap_or_default(),
            type_parameters: self.type_parameters.clone().map(|params| {
                // Resolve relative specifiers for this class's own wire metadata:
                // - PrefixImportStrategy: Converts relative specifiers (e.g. `./models`) to absolute
                //   workspace prefix paths (e.g. `repo/components/models`).
                // - ApfImportStrategy: Passing declaring == consumer is an identity transform,
                //   preserving raw relative specifiers for local consumption.
                let current_file_path = cx
                    .path_lookup
                    .map(|lookup| lookup(self.reference_id.file))
                    .unwrap_or_default();
                params
                    .into_iter()
                    .map(|p| {
                        let mut wire_param = p.into_wire(cx.source_text, cx.converter);
                        wire_param.resolve_specifiers(
                            cx.reference_strategy,
                            &current_file_path,
                            &current_file_path,
                        );
                        wire_param
                    })
                    .collect()
            }),

            has_ng_template_context_guard: self.has_ng_template_context_guard,
            ng_template_guards: self.ng_template_guards.clone(),
            has_ng_field_directive: self.has_ng_field_directive,
            super_class: self.super_class.clone(),
            uses_inheritance: self.uses_inheritance,
            uses_on_changes: self.uses_on_changes,
            is_exported: self.is_exported,
            has_non_exported_bounds: self.has_non_exported_bounds,
        };
        Ok(metadata)
    }

    /// Read an optional `Resolved<T>` field under the mode's policy. Takes `Option<&_>` so
    /// boxed and unboxed slots can both pass one in.
    fn read_optional_field<T: crate::evaluator::FromResolved>(
        &self,
        resolved: Option<&Resolved<T>>,
        cx: &WireContext,
        field: &'static str,
    ) -> Result<Option<T>, WireError> {
        let Some(resolved) = resolved else {
            return Ok(None);
        };
        match cx.mode {
            WireMode::Syntax => Ok(resolved.get_optional()),
            WireMode::Semantic => resolved.get_checked().map_err(|_| WireError {
                class_name: self.class_name.clone(),
                field,
                cause: WireErrorCause::Incomplete,
            }),
        }
    }

    /// Resolve a `@angular/core` enum field to its member number: the partial evaluator
    /// first (ngtsc's full-compilation `resolveEnumValue`), then `resolve_locally` on the
    /// source text (ngtsc's local-compilation resolver).
    fn read_core_enum_field<T: crate::evaluator::FromResolved + Into<i32>>(
        &self,
        resolved: &Option<Resolved<T>>,
        span: Option<oxc_span::Span>,
        core_enum: &CoreEnum,
        cx: &WireContext,
        field: &'static str,
    ) -> Result<Option<i32>, WireError> {
        if let Some(value) = self.read_optional_field(resolved.as_ref(), cx, field)? {
            return Ok(Some(value.into()));
        }
        // Full compilation, and the evaluator answered with a member of an enum that is not
        // `@angular/core`'s: ngtsc reports a diagnostic and never reaches the textual
        // resolver. Having no diagnostics channel we leave the field unresolved for the
        // consumer's default rather than lend a foreign enum core's numbering. Local
        // compilation runs no evaluator upstream, so the textual match stands there.
        let foreign_enum_member = resolved
            .as_ref()
            .is_some_and(|r| crate::evaluator::is_enum_member_value(r.raw()));
        if cx.mode == WireMode::Semantic && foreign_enum_member {
            return Ok(None);
        }
        Ok(span
            .and_then(|s| cx.source_text.get(s.start as usize..s.end as usize))
            .and_then(|text| core_enum.resolve_locally(text)))
    }

    /// Read an optional `Resolved<String>` field under the mode's policy.
    fn read_optional_string(
        &self,
        resolved: &Option<Resolved<String>>,
        cx: &WireContext,
        field: &'static str,
    ) -> Result<Option<String>, WireError> {
        self.read_optional_field(resolved.as_ref(), cx, field)
    }

    fn to_wire_refs(
        &self,
        slot: &Option<Resolved<Vec<Reference>>>,
        cx: &WireContext,
    ) -> Option<Vec<ReferenceMetadata>> {
        let Some(slot) = slot else {
            return None;
        };
        if cx.mode == WireMode::Semantic {
            assert!(
                !slot.contains_incomplete(),
                "Expected semantic analysis to be complete prior to wire serialization"
            );
        }

        slot.get_optional()
            .map(|refs| self.emit_wire_refs(&refs, cx))
    }

    /// Project references into this class's file, the frame every NgModule/component
    /// reference is emitted in.
    fn emit_wire_refs(&self, refs: &[Reference], cx: &WireContext) -> Vec<ReferenceMetadata> {
        let file_id = self.reference_id.file;
        let current_file_path = cx
            .path_lookup
            .map(|lookup| lookup(file_id))
            .unwrap_or_default();
        refs.iter()
            .map(|r| {
                let target_path = cx
                    .path_lookup
                    .map(|lookup| lookup(r.file))
                    .unwrap_or_default();
                cx.reference_strategy.emit(
                    r,
                    file_id,
                    &current_file_path,
                    &target_path,
                    cx.declaring_export_name(r.file, &r.name),
                )
            })
            .collect()
    }

    /// ngtsc's `exportedDeclarations`: the declarations whose class is also in `exports`, kept
    /// in declaration order. ngtsc compares the resolved class nodes, so the match here is on
    /// the declaring file and name rather than on how either list spells the reference.
    fn public_declarations_wire(
        &self,
        m: &NgModuleData,
        cx: &WireContext,
    ) -> Option<Vec<ReferenceMetadata>> {
        let declarations = m.declarations.as_ref()?.get_optional()?;
        let exports = m
            .exports
            .as_ref()
            .map_or(Some(Vec::new()), |e| e.get_optional())?;
        let exported: std::collections::HashSet<(crate::query::FileId, &str)> =
            exports.iter().map(|r| (r.file, r.name.as_str())).collect();
        let public: Vec<Reference> = declarations
            .into_iter()
            .filter(|d| exported.contains(&(d.file, d.name.as_str())))
            .collect();
        Some(self.emit_wire_refs(&public, cx))
    }

    fn to_wire_single_ref(
        &self,
        r: &Reference,
        current_file_path: &std::path::Path,
        cx: &WireContext,
    ) -> ReferenceMetadata {
        let file_id = self.reference_id.file;
        let target_path = cx
            .path_lookup
            .map(|lookup| lookup(r.file))
            .unwrap_or_default();
        cx.reference_strategy.emit(
            r,
            file_id,
            current_file_path,
            &target_path,
            cx.declaring_export_name(r.file, &r.name),
        )
    }

    fn to_wire_isolated_tuple(
        &self,
        tuple: &IsolatedTypeTupleData,
        cx: &WireContext,
    ) -> crate::types::metadata::IsolatedTypeTupleMetadata {
        use crate::types::metadata::{
            IsolatedTypeElementKind, IsolatedTypeElementMetadata, IsolatedTypeTupleMetadata,
            SpanMetadata,
        };
        let file_id = self.reference_id.file;
        let current_file_path = cx
            .path_lookup
            .map(|lookup| lookup(file_id))
            .unwrap_or_default();
        let elements = tuple
            .elements
            .iter()
            .map(|el| match el {
                IsolatedTypeElementData::Typeof { span, reference } => {
                    IsolatedTypeElementMetadata {
                        kind: IsolatedTypeElementKind::Typeof,
                        span: span.map(|s| SpanMetadata::new(s, cx.converter)),
                        references: reference
                            .as_ref()
                            .map(|r| vec![self.to_wire_single_ref(r, &current_file_path, cx)]),
                    }
                }
                IsolatedTypeElementData::CallReturnType { callee_span } => {
                    IsolatedTypeElementMetadata {
                        kind: IsolatedTypeElementKind::CallReturnType,
                        span: Some(SpanMetadata::new(*callee_span, cx.converter)),
                        references: None,
                    }
                }
                IsolatedTypeElementData::ReferenceTuple { references } => {
                    IsolatedTypeElementMetadata {
                        kind: IsolatedTypeElementKind::ReferenceTuple,
                        span: None,
                        references: Some(
                            references
                                .iter()
                                .map(|r| self.to_wire_single_ref(r, &current_file_path, cx))
                                .collect(),
                        ),
                    }
                }
                IsolatedTypeElementData::Never { span } => IsolatedTypeElementMetadata {
                    kind: IsolatedTypeElementKind::Never,
                    span: Some(SpanMetadata::new(*span, cx.converter)),
                    references: None,
                },
            })
            .collect();
        IsolatedTypeTupleMetadata {
            is_array_literal: tuple.is_array_literal,
            elements,
        }
    }

    /// Project an evaluated [`HostDirectiveEntry`] list into this class's own file frame — the file
    /// the directive definition is emitted into, so it decides whether each entry is written as
    /// a local binding or through a generated import.
    fn to_wire_host_directives(
        &self,
        slot: &Option<Resolved<Vec<HostDirectiveEntry>>>,
        cx: &WireContext,
    ) -> Option<Vec<HostDirectiveMetadata>> {
        let slot = slot.as_ref()?;
        let entries = slot.get_optional()?;
        let file_id = self.reference_id.file;
        let current_file_path = cx.path_lookup.map(|lookup| lookup(file_id));
        Some(
            entries
                .into_iter()
                .map(|e| e.into_wire(file_id, current_file_path.as_deref(), cx.path_lookup))
                .collect(),
        )
    }

    fn directive_wire(
        &self,
        d: &DirectiveData,
        cx: &WireContext,
    ) -> Result<DirectiveMetadata, WireError> {
        let declaring_ng_module = d.declaring_ng_module.as_ref().and_then(|ref_id| {
            cx.path_lookup
                .map(|lookup| crate::types::metadata::DeclaringNgModule {
                    file_path: lookup(ref_id.file).to_string_lossy().into_owned(),
                    symbol_id: ref_id.symbol.index() as u32,
                })
        });
        Ok(DirectiveMetadata {
            decorator_name: d.decorator_name.clone(),
            selector: self.read_optional_string(&d.selector, cx, "directive.selector")?,
            standalone: d.standalone,
            signals: d.signals,
            is_structural: d.is_structural,
            export_as: self
                .read_optional_field(d.export_as.as_ref(), cx, "directive.exportAs")?
                .map(|names| names.0),
            host_properties: d
                .host_properties
                .iter()
                .cloned()
                .map(|p| p.into_wire(cx.source_text, cx.converter))
                .collect(),
            host_span: d
                .host_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            host_metadata: self
                .read_optional_field(d.host_expr.as_deref(), cx, "directive.host")?
                .map(|host| host_metadata_wire(host, cx.source_text)),
            host_directives: self.to_wire_host_directives(&d.host_directives, cx),
            providers_span: d
                .providers_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            args_span: d
                .args_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            declaring_ng_module,
            is_jit: d.is_jit,
        })
    }

    fn component_wire(
        &self,
        c: &ComponentData,
        cx: &WireContext,
    ) -> Result<ComponentMetadata, WireError> {
        let declaring_ng_module = c.directive.declaring_ng_module.as_ref().and_then(|ref_id| {
            cx.path_lookup
                .map(|lookup| crate::types::metadata::DeclaringNgModule {
                    file_path: lookup(ref_id.file).to_string_lossy().into_owned(),
                    symbol_id: ref_id.symbol.index() as u32,
                })
        });
        let template = self.read_optional_string(&c.template, cx, "component.template")?;
        let template_dynamic = c.template_dynamic || (c.template.is_some() && template.is_none());
        let encapsulation = self.read_core_enum_field(
            &c.encapsulation,
            c.encapsulation_span,
            &VIEW_ENCAPSULATION,
            cx,
            "component.encapsulation",
        )?;
        let change_detection = match cx.mode {
            WireMode::Syntax => c
                .change_detection_span
                .and_then(|span| cx.source_text.get(span.start as usize..span.end as usize))
                .map(|text| text.trim().to_string()),
            WireMode::Semantic => self
                .read_core_enum_field(
                    &c.change_detection,
                    c.change_detection_span,
                    &CHANGE_DETECTION_STRATEGY,
                    cx,
                    "component.changeDetection",
                )?
                // https://github.com/angular/angular/blob/96b8042/packages/compiler/src/render3/view/compiler.ts#L308
                .filter(|num| *num != CHANGE_DETECTION_ON_PUSH)
                .map(|num| num.to_string()),
        };
        let import_info_to_wire_ref = |i: &ImportInfo| -> ReferenceMetadata {
            let (consumer_import, typecheck_import) = if let Some(source) = &i.import_source {
                let imp = crate::types::metadata::ImportableRef {
                    specifier: source.clone(),
                    symbol: i
                        .imported_name
                        .clone()
                        .unwrap_or_else(|| i.local_name.clone()),
                };
                (Some(imp.clone()), Some(imp))
            } else {
                (None, None)
            };
            crate::types::metadata::ReferenceMetadata {
                consumer_import,
                typecheck_import,
                local_alias: Some(i.local_name.clone()),
            }
        };
        Ok(ComponentMetadata {
            decorator_name: c.directive.decorator_name.clone(),
            imports: self.to_wire_refs(&c.imports, cx).or_else(|| {
                (!c.parsed_imports.is_empty()).then(|| {
                    c.parsed_imports
                        .iter()
                        .map(import_info_to_wire_ref)
                        .collect()
                })
            }),
            selector: apply_default_selector(
                c.directive
                    .selector
                    .as_ref()
                    .map(|s| self.read_optional_field(Some(s), cx, "component.selector"))
                    .transpose()?,
                Some(DEFAULT_COMPONENT_SELECTOR),
            ),
            template,
            template_content_span: c
                .template_content_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            template_span: c
                .template_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            template_dynamic,
            template_url: c.template_url.as_ref().map(|t| t.to_wire(cx.converter)),
            styles: self
                .read_optional_field(c.styles.as_ref(), cx, "component.styles")?
                .map(|styles| styles.0),
            styles_from_urls: c.styles_from_urls.clone(),
            style_urls: c
                .style_urls
                .as_ref()
                .map(|s| s.iter().map(|u| u.to_wire(cx.converter)).collect()),
            encapsulation,
            standalone: c.directive.standalone,
            signals: c.directive.signals,
            export_as: self
                .read_optional_field(c.directive.export_as.as_ref(), cx, "component.exportAs")?
                .map(|names| names.0),
            schemas: c.schemas.clone(),
            raw_imports_span: c
                .raw_imports_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            imports_factory_span: c
                .imports_factory_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            foreign_imports: c.foreign_imports.as_ref().map(|list| {
                list.iter()
                    .map(|fi| crate::types::metadata::ForeignImportMetadata {
                        name: fi.name.clone(),
                        span: crate::types::metadata::SpanMetadata::new(fi.span, cx.converter),
                    })
                    .collect()
            }),
            deferred_imports: if let Some(ref decls) = c.resolved_deferred_declarations {
                Some(decls.iter().map(|d| d.ref_meta.clone()).collect())
            } else if !c.parsed_deferred_imports.is_empty() {
                Some(
                    c.parsed_deferred_imports
                        .iter()
                        .map(import_info_to_wire_ref)
                        .collect(),
                )
            } else {
                None
            },
            deferred_imports_by_block: if let Some(ref by_block) =
                c.resolved_deferred_declarations_by_block
            {
                Some(
                    by_block
                        .iter()
                        .map(|(k, v)| (k.clone(), v.iter().map(|d| d.ref_meta.clone()).collect()))
                        .collect(),
                )
            } else {
                c.parsed_deferred_imports_by_block.as_ref().map(|by_block| {
                    by_block
                        .iter()
                        .map(|(k, v)| (k.clone(), v.iter().map(import_info_to_wire_ref).collect()))
                        .collect()
                })
            },
            deferred_imports_span: c
                .deferred_imports_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            resolved_deferred_declarations: c.resolved_deferred_declarations.as_ref().map(
                |decls| {
                    decls
                        .iter()
                        .map(|d| DeclarationMetadata::to_wire(d, cx.path_lookup))
                        .collect()
                },
            ),
            resolved_deferred_declarations_by_block: c
                .resolved_deferred_declarations_by_block
                .as_ref()
                .map(|by_block| {
                    by_block
                        .iter()
                        .map(|(k, v)| {
                            (
                                k.clone(),
                                v.iter()
                                    .map(|d| DeclarationMetadata::to_wire(d, cx.path_lookup))
                                    .collect(),
                            )
                        })
                        .collect()
                }),
            resolved_declarations: c.resolved_declarations.as_ref().map(|decls| {
                decls
                    .iter()
                    .map(|d| DeclarationMetadata::to_wire(d, cx.path_lookup))
                    .collect()
            }),
            resolved_host_directives: c.resolved_host_directives.as_ref().map(|hds| {
                hds.iter()
                    .map(|hd| ResolvedHostDirectiveMetadata::to_wire(hd, cx.path_lookup))
                    .collect()
            }),
            local_compilation_extra_imports: c.local_compilation_extra_imports.clone(),
            host_properties: c
                .directive
                .host_properties
                .iter()
                .cloned()
                .map(|p| p.into_wire(cx.source_text, cx.converter))
                .collect(),
            host_span: c
                .directive
                .host_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            host_metadata: self
                .read_optional_field(c.directive.host_expr.as_deref(), cx, "component.host")?
                .map(|host| host_metadata_wire(host, cx.source_text)),
            host_directives: self.to_wire_host_directives(&c.directive.host_directives, cx),
            providers_span: c
                .directive
                .providers_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            view_providers_span: c
                .view_providers_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            change_detection,
            preserve_whitespaces: c.preserve_whitespaces,
            animations_span: c
                .animations_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            animation_trigger_names: c.animation_trigger_names.clone(),
            args_span: c
                .directive
                .args_span
                .map(|s| crate::types::metadata::SpanMetadata::new(s, cx.converter)),
            preserved_decorator_properties: c
                .directive
                .preserved_decorator_properties
                .as_ref()
                .map(|spans| {
                    spans
                        .iter()
                        .map(|s| crate::types::metadata::SpanMetadata::new(*s, cx.converter))
                        .collect()
                }),
            declaring_ng_module,
            is_jit: c.directive.is_jit,
        })
    }
}

// ==================================================================== registration

impl ClassData {
    /// Build the curated per-class registration record (the cross-file `ClassInfo` index
    /// entry). `None` for anonymous classes.
    ///
    /// A `selector` referencing another file is recorded as `None`; see
    /// [`crate::analyzer::resolver::with_resolved_selector`].
    pub fn to_registration(
        &self,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> Option<crate::analyzer::RegistrationInfo> {
        let name = self.class_name.clone()?;
        let name_span = self.name_span.expect("Class with name must have name_span");

        let (class_type, selector, pipe_name, is_standalone, export_as, host_directives) =
            match &self.decorator {
                DecoratorData::Component(c) => (
                    ClassType::Component,
                    c.effective_selector(),
                    None,
                    Some(c.directive.standalone),
                    c.directive.export_as_names(),
                    c.directive
                        .host_directives
                        .as_ref()
                        .and_then(Resolved::get_optional),
                ),
                DecoratorData::Directive(d) => (
                    ClassType::Directive,
                    d.effective_selector(),
                    None,
                    Some(d.standalone),
                    d.export_as_names(),
                    d.host_directives.as_ref().and_then(Resolved::get_optional),
                ),
                DecoratorData::Pipe(p) => (
                    ClassType::Pipe,
                    None,
                    p.name.as_ref().and_then(Resolved::get_optional),
                    p.standalone,
                    None,
                    None,
                ),
                DecoratorData::NgModule(_) => (ClassType::NgModule, None, None, None, None, None),
                DecoratorData::Injectable(_) => {
                    (ClassType::Injectable, None, None, None, None, None)
                }
                DecoratorData::Service(_) => (ClassType::Service, None, None, None, None, None),
            };

        let (exports, schemas) = match &self.decorator {
            DecoratorData::NgModule(m) => (
                m.exports
                    .as_ref()
                    .and_then(|ex| ex.get_optional())
                    .map(|refs| refs.iter().map(|s| s.name().to_string()).collect()),
                m.schemas.clone(),
            ),
            _ => (None, None),
        };

        let animation_trigger_names = match &self.decorator {
            DecoratorData::Component(c) => c.animation_trigger_names.clone(),
            _ => None,
        };

        // TODO(parity): Stage 1 only — `inputs`/`outputs` entries reached through another file
        // are added in Stage 2 (`complete_legacy_io`) and never reach this record.
        let members = self.directive_part();
        let is_structural = match &self.decorator {
            DecoratorData::Directive(d) => d.is_structural,
            _ => false,
        };

        // Both a standalone component's and an NgModule's `imports` feed the recursive
        // provider question in `may_export_providers`.
        let raw_imports = match &self.decorator {
            DecoratorData::Component(c) => Some(tuples(&c.parsed_imports)),
            DecoratorData::NgModule(m) => Some(tuples(&m.parsed_imports)),
            _ => None,
        };

        // ngtsc's `mayDeclareProviders`: whether the NgModule literal carries a non-empty
        // `providers`. `providers_span` is recorded only in that case.
        let may_declare_providers = match &self.decorator {
            DecoratorData::NgModule(m) => m.providers_span.is_some(),
            _ => false,
        };

        Some(crate::analyzer::RegistrationInfo {
            reference_id: self.reference_id,
            class_name: name,
            name_span: crate::types::metadata::SpanMetadata::new(name_span, converter),
            class_type,
            selector,
            pipe_name,
            is_standalone,
            export_as,
            host_directives,
            fields: Some(
                members
                    .map(|m| {
                        m.fields
                            .iter()
                            .map(|f| f.to_wire(source_text, converter))
                            .collect()
                    })
                    .unwrap_or_default(),
            ),
            exports,
            schemas,
            type_parameters: self.type_parameters.clone().map(|params| {
                params
                    .into_iter()
                    .map(|p| p.into_wire(source_text, converter))
                    .collect()
            }),

            has_ng_template_context_guard: self.has_ng_template_context_guard,
            ng_template_guards: self.ng_template_guards.clone(),
            animation_trigger_names,
            has_ng_field_directive: self.has_ng_field_directive,
            is_structural,
            raw_imports,
            may_declare_providers,
            super_class: self.super_class.clone(),
            ng_content_selectors: match &self.decorator {
                DecoratorData::Component(c) => c.ng_content_selectors.clone(),
                _ => None,
            },
            is_exported: self.is_exported,
            has_non_exported_bounds: self.has_non_exported_bounds,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn local_enum_resolution_matches_reference_semantics() {
        let resolve = |text: &str| VIEW_ENCAPSULATION.resolve_locally(text);
        // Exact member access, with surrounding whitespace trimmed.
        assert_eq!(resolve("ViewEncapsulation.None"), Some(2));
        assert_eq!(resolve("  ViewEncapsulation.Emulated\n"), Some(0));
        // Namespace access matches via the `.Enum.Member` suffix.
        assert_eq!(resolve("core.ViewEncapsulation.ShadowDom"), Some(3));
        assert_eq!(
            resolve("ns.deep.ViewEncapsulation.ExperimentalIsolatedShadowDom"),
            Some(4)
        );
        // `ShadowDom` must not shadow the longer `ExperimentalIsolatedShadowDom` (or match
        // as a bare suffix of it).
        assert_eq!(
            resolve("ViewEncapsulation.ExperimentalIsolatedShadowDom"),
            Some(4)
        );
        // An aliased import is invisible to the textual resolver (the reference local-mode
        // resolver behaves the same); the old substring hack would have matched this.
        assert_eq!(resolve("VE.None"), None);
        // A different receiver that merely contains the member name does not match.
        assert_eq!(resolve("MyEnum.None"), None);
        assert_eq!(resolve("2"), None);
    }
}
