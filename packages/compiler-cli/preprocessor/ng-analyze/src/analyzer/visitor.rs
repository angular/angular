use std::collections::HashSet;
use std::path::Path;

use crate::ResourceResolverFs;
use oxc_allocator::Allocator;
use oxc_ast::ast::{Class, ClassElement};
use oxc_ast_visit::utf8_to_utf16::Utf8ToUtf16;
use oxc_parser::Parser;
use oxc_resolver::ResolverGeneric;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use oxc_syntax::module_record::{ExportExportName, ExportImportName, ModuleRecord};

use crate::{query::ReferenceId, ConstructorParamMetadata, TemplateGuardMetadata};

use super::class_data::{
    AngularField, ClassData, ComponentData, DecoratorData, DirectiveData, HostBindingData,
    HostListenerData, InjectableData, NgModuleData, PipeData, ServiceData, TypeParameterData,
};
use super::imports::{
    FileExportInfo, ImportDeclarationInfo, ImportedSymbol, LocalExportAlias, ReexportInfo,
    WildcardExport,
};
use super::{
    component, directive, get_constructor_params, host_binding, injectable, input_output, pipe,
    queries, service,
    utils::{
        extract_property_key, extract_template_guards_and_field_directive, extract_type_parameters,
        get_local_exported_names, get_type_only_exports,
    },
};

/// Visitor that collects Angular decorated classes (non-optimized mode)
pub struct ClassVisitor<'a, Fs: ResourceResolverFs> {
    source_text: &'a str,
    converter: &'a Utf8ToUtf16,
    file_path: &'a Path,
    file_id: crate::query::FileId,
    fs: &'a Fs,
    resolver: &'a ResolverGeneric<Fs>,
    import_map: &'a std::collections::HashMap<String, ImportedSymbol>,
    angular_imports: &'a crate::analyzer::imports::AngularImports,
    semantic: &'a Semantic<'a>,
    local_exported_names: &'a HashSet<&'a str>,
    compile_non_exported_classes: bool,
    results: Vec<ClassData>,
    registrations: Vec<RegistrationInfo>,
    fallback_symbol_id: usize,
    diagnostics: Vec<crate::NgDiagnostic>,
}

impl<'a, Fs: ResourceResolverFs> ClassVisitor<'a, Fs> {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        source_text: &'a str,
        converter: &'a Utf8ToUtf16,
        semantic: &'a Semantic<'a>,
        file_path: &'a Path,
        file_id: crate::query::FileId,
        fs: &'a Fs,
        resolver: &'a ResolverGeneric<Fs>,
        import_map: &'a std::collections::HashMap<String, ImportedSymbol>,
        angular_imports: &'a crate::analyzer::imports::AngularImports,
        local_exported_names: &'a HashSet<&'a str>,
        compile_non_exported_classes: bool,
    ) -> Self {
        Self {
            source_text,
            converter,
            semantic,
            file_path,
            file_id,
            fs,
            resolver,
            import_map,
            angular_imports,
            local_exported_names,
            compile_non_exported_classes,
            results: Vec::new(),
            registrations: Vec::new(),
            fallback_symbol_id: 1000000,
            diagnostics: Vec::new(),
        }
    }

    fn into_results(mut self, file_exports: FileExportInfo) -> ClassVisitorOutput {
        apply_ngmodule_schemas_local(&mut self.results, Some(&mut self.registrations));
        resolve_local_imports(&mut self.results, self.source_text, self.converter);
        ClassVisitorOutput {
            classes: self.results,
            registrations: self.registrations,
            file_exports,
            diagnostics: self.diagnostics,
        }
    }

    fn process_classes(&mut self) {
        for (_, &node_id) in self.semantic.classes().iter_enumerated() {
            let node = self.semantic.nodes().get_node(node_id);
            let oxc_ast::AstKind::Class(class) = node.kind() else {
                continue;
            };
            self.process_class(class, node_id);
        }
    }

    fn process_class(&mut self, class: &Class<'a>, node_id: oxc_semantic::NodeId) {
        // The evaluator input lives for the whole class: parsers evaluate `selector` through
        // it (safe for any class — selector is never relocated for a Semantic re-run), and
        // the scope-array slots below use it under the genuine-symbol gate.
        let env = crate::evaluator::ResolvedEnv::new();
        let eval = crate::evaluator::EvalInput {
            semantic: self.semantic,
            file: self.file_id,
            import_map: self.import_map,
            mode: crate::evaluator::EvalMode::Syntax,
            env: &env,
            foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
        };

        let Some(parsed) = process_class_common(
            class,
            node_id,
            self.converter,
            self.file_path,
            self.fs,
            self.resolver,
            self.import_map,
            self.angular_imports,
            self.semantic,
            self.local_exported_names,
            &eval,
        ) else {
            return;
        };

        let has_export_keyword = matches!(
            self.semantic.nodes().parent_kind(node_id),
            oxc_ast::AstKind::ExportDeclaration(_) | oxc_ast::AstKind::ExportDefaultDeclaration(_)
        );

        let has_real_symbol = class
            .id
            .as_ref()
            .and_then(|id| id.symbol_id.get())
            .is_some();
        let symbol_id = class
            .id
            .as_ref()
            .and_then(|id| id.symbol_id.get())
            .unwrap_or_else(|| {
                self.fallback_symbol_id += 1;
                oxc_semantic::SymbolId::from(self.fallback_symbol_id)
            });

        let reference_id = ReferenceId::new(self.file_id, symbol_id);
        let class_data = classify(reference_id, parsed, has_real_symbol);

        // TODO(parity): ngtsc's `isStaticallyExported` also counts export lists
        // (`export {Foo}`, `export {Foo as Bar}`, `export default Foo`).
        if !self.compile_non_exported_classes
            && !has_export_keyword
            && !is_standalone_declaration(&class_data.decorator)
        {
            return;
        }

        if let Some(registration) = class_data.to_registration(self.source_text, self.converter) {
            self.registrations.push(registration);
        }
        self.results.push(class_data);
    }
}

fn is_standalone_declaration(decorator: &DecoratorData) -> bool {
    match decorator {
        DecoratorData::Component(c) => c.directive.standalone,
        DecoratorData::Directive(d) => d.standalone,
        DecoratorData::Pipe(p) => p.standalone.unwrap_or(true),
        _ => false,
    }
}

/// Classify a parsed class by primary-decorator priority and assemble its [`ClassData`].
/// Weak decorators (@Injectable/@Service, ngtsc `HandlerPrecedence.WEAK`) nest inside the
/// primary classification's data rather than being dropped.
// TODO(parity): ngtsc errors on colliding *primary* Angular decorators; we keep the
// highest-priority classification (Component > Directive > Pipe > NgModule) and drop the
// rest. (Classification also unifies the registration order, which historically was
// last-write-wins — the opposite priority — while ClassInfo used Component-first.)
fn find_matching_field_mut<'a>(
    fields: &'a mut [AngularField],
    target: &AngularField,
) -> Option<&'a mut AngularField> {
    match target {
        AngularField::Input(input) => fields
            .iter_mut()
            .find(|f| matches!(f, AngularField::Input(i) if i.name == input.name)),
        AngularField::Output(output) => fields
            .iter_mut()
            .find(|f| matches!(f, AngularField::Output(o) if o.name == output.name)),
        AngularField::Query(query) => fields.iter_mut().find(
            |f| matches!(f, AngularField::Query(q) if q.property_name == query.property_name),
        ),
        AngularField::InputCoercion(_) => None,
    }
}

fn populate_directive_members(
    d: &mut DirectiveData,
    members: ParsedMembers,
    injectable: Option<InjectableData>,
    service: Option<ServiceData>,
) {
    for member_field in members.fields {
        if let Some(existing) = find_matching_field_mut(&mut d.fields, &member_field) {
            *existing = member_field;
        } else {
            d.fields.push(member_field);
        }
    }
    d.bind_metadata_fields_to_members(&members.members);
    d.io_issues.extend(members.io_issues);
    if !members.pending_options.is_empty() || d.evaluated_io.is_some() {
        let pending = d.evaluated_io.get_or_insert_with(Default::default);
        pending.member_options = members.pending_options;
        pending.members = members.members;
    }
    d.host_bindings = members.host_bindings;
    d.host_listeners = members.host_listeners;
    d.injectable = injectable;
    d.service = service;
}

fn classify(reference_id: ReferenceId, parsed: ParsedClass, has_real_symbol: bool) -> ClassData {
    let ParsedClass {
        common,
        members,
        injectable,
        service,
        component,
        directive,
        pipe,
        ng_module,
    } = parsed;

    let decorator = if let Some(mut comp_data) = component {
        populate_directive_members(&mut comp_data.directive, members, injectable, service);
        if !has_real_symbol {
            comp_data.imports = None;
        }
        DecoratorData::Component(comp_data)
    } else if let Some(mut dir_data) = directive {
        populate_directive_members(&mut dir_data, members, injectable, service);
        DecoratorData::Directive(dir_data)
    } else if let Some(mut pipe) = pipe {
        pipe.injectable = injectable;
        pipe.service = service;
        DecoratorData::Pipe(pipe)
    } else if let Some(mut module) = ng_module {
        module.injectable = injectable;
        module.service = service;
        if !has_real_symbol {
            module.declarations = None;
            module.imports = None;
            module.exports = None;
            module.bootstrap = None;
        }
        DecoratorData::NgModule(module)
    } else if let Some(injectable) = injectable {
        // Both decorators here are weak; a @Service alongside an @Injectable-only class is
        // dropped (the combination has no meaning).
        DecoratorData::Injectable(injectable)
    } else if let Some(service) = service {
        DecoratorData::Service(service)
    } else {
        unreachable!("process_class_common returns None when no Angular decorator matched")
    };

    ClassData {
        reference_id,
        ng_decorator_spans: common.ng_decorator_spans,
        decorator_removal_spans: common.decorator_removal_spans,
        nocollapse_insertions: common.nocollapse_insertions,
        span: common.span,
        decorated_span: common.decorated_span,
        name_span: common.name_span,
        class_name: common.class_name,
        constructor_params: common.constructor_params,
        unexpected_param_decorators: common.unexpected_param_decorators,
        member_decorators: common.member_decorators,
        later_declaration_references: common.later_declaration_references,
        type_parameters: common.type_parameters,
        has_ng_template_context_guard: common.has_ng_template_context_guard,
        ng_template_guards: common.ng_template_guards,
        has_ng_field_directive: common.has_ng_field_directive,
        uses_inheritance: common.uses_inheritance,
        uses_on_changes: common.uses_on_changes,
        is_exported: common.is_exported,
        has_non_exported_bounds: common.has_non_exported_bounds,
        decorator,
        super_class: common.super_class,
        flattened_fields: None,
    }
}

pub struct RegistrationInfo {
    pub reference_id: ReferenceId,
    pub class_name: String,
    /// Span of the class name in UTF-16 code units of the declaring file (a wire span, for
    /// `.ts` and `.d.ts` alike); not an oxc byte span.
    pub name_span: crate::types::metadata::SpanMetadata,
    pub class_type: crate::ClassType,
    pub selector: Option<String>,
    pub pipe_name: Option<String>,
    pub is_standalone: Option<bool>,
    pub export_as: Option<Vec<String>>,
    pub host_directives: Option<Vec<crate::types::analysis::HostDirectiveEntry>>,
    pub fields: Option<Vec<crate::AngularFieldMetadata>>,
    pub exports: Option<Vec<String>>,
    pub schemas: Option<Vec<String>>,
    pub type_parameters: Option<Vec<crate::TypeParameterMetadata>>,

    pub has_ng_template_context_guard: bool,
    pub ng_template_guards: Vec<crate::TemplateGuardMetadata>,
    pub animation_trigger_names: Option<crate::LegacyAnimationTriggerNames>,
    pub has_ng_field_directive: bool,
    pub is_structural: bool,
    pub raw_imports: Option<Vec<crate::DeclarationTuple>>,
    pub may_declare_providers: bool,
    pub super_class: Option<crate::DeclarationTuple>,
    pub ng_content_selectors: Option<Vec<String>>,
    pub is_exported: bool,
    pub has_non_exported_bounds: bool,
}

#[allow(clippy::too_many_arguments)]
fn try_parse_component<'a, Fs: ResourceResolverFs>(
    decorator: &oxc_ast::ast::Decorator<'a>,
    semantic: &Semantic<'a>,
    import_map: &std::collections::HashMap<String, ImportedSymbol>,
    file_path: &Path,
    fs: &Fs,
    resolver: &ResolverGeneric<Fs>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    eval: &crate::evaluator::EvalInput<'a, '_>,
) -> Option<ComponentData> {
    component::parse_decorator(
        decorator,
        file_path,
        fs,
        resolver,
        semantic,
        import_map,
        angular_imports,
        eval,
    )
}

/// Class-body facts shared by every classification (everything except `symbol_id`, which
/// `process_class` assigns).
struct ParsedCommon {
    ng_decorator_spans: Vec<oxc_span::Span>,
    decorator_removal_spans: Vec<oxc_span::Span>,
    nocollapse_insertions: Vec<super::closure_nocollapse::NoCollapseInsertion>,
    span: oxc_span::Span,
    decorated_span: oxc_span::Span,
    name_span: Option<oxc_span::Span>,
    class_name: Option<String>,
    constructor_params: Option<Vec<ConstructorParamMetadata>>,
    unexpected_param_decorators: Vec<crate::analyzer::UnexpectedParamDecorator>,
    member_decorators: Vec<crate::DecoratedMemberMetadata>,
    later_declaration_references: Vec<oxc_span::Span>,
    type_parameters: Option<Vec<TypeParameterData>>,
    has_ng_template_context_guard: bool,
    ng_template_guards: Vec<TemplateGuardMetadata>,
    has_ng_field_directive: bool,
    uses_inheritance: bool,
    uses_on_changes: bool,
    is_exported: bool,
    has_non_exported_bounds: bool,
    super_class: Option<crate::DeclarationTuple>,
}

/// Member-level extraction results (directive API surface; dropped for non-directive
/// classifications, matching the internal data model).
struct ParsedMembers {
    fields: Vec<AngularField>,
    /// The class members an `inputs`/`outputs` entry may bind to.
    members: Vec<crate::analyzer::evaluated_io::ClassMemberFacts>,
    /// `@Input`/`@Output` arguments still waiting on constants from other files.
    pending_options: Vec<crate::analyzer::evaluated_io::MemberIoOptions>,
    io_issues: Vec<crate::analyzer::class_data::ValueIssue>,
    host_bindings: Vec<HostBindingData>,
    host_listeners: Vec<HostListenerData>,
}

/// Everything `process_class_common` extracts, before classification.
struct ParsedClass {
    common: ParsedCommon,
    members: ParsedMembers,
    injectable: Option<InjectableData>,
    service: Option<ServiceData>,
    component: Option<ComponentData>,
    directive: Option<DirectiveData>,
    pipe: Option<PipeData>,
    ng_module: Option<NgModuleData>,
}

#[allow(clippy::too_many_arguments)]
fn process_class_common<'a, Fs: ResourceResolverFs>(
    class: &Class<'a>,
    class_node_id: oxc_semantic::NodeId,
    converter: &Utf8ToUtf16,
    file_path: &Path,
    fs: &Fs,
    resolver: &ResolverGeneric<Fs>,
    import_map: &std::collections::HashMap<String, ImportedSymbol>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    semantic: &Semantic<'a>,
    local_exported_names: &HashSet<&'a str>,
    eval: &crate::evaluator::EvalInput<'a, '_>,
) -> Option<ParsedClass> {
    let class_name = class.id.as_ref().map(|id| id.name.to_string());
    let name_span = class.id.as_ref().map(|id| id.span);
    let constructor_params_result =
        get_constructor_params(class, semantic, converter, import_map, angular_imports);
    let (constructor_params, unexpected_param_decorators) = match constructor_params_result {
        Some(result) => (Some(result.params), result.unexpected_decorators),
        None => (None, Vec::new()),
    };
    let mut later_declaration_references = Vec::new();
    let mut member_removal_spans = Vec::new();
    let member_decorators = super::get_member_decorators(
        class,
        converter,
        semantic,
        angular_imports,
        semantic.source_text(),
        &mut later_declaration_references,
        &mut member_removal_spans,
    );

    let mut injectable: Option<InjectableData> = None;
    let mut service: Option<ServiceData> = None;
    let mut component: Option<ComponentData> = None;
    let mut directive: Option<DirectiveData> = None;
    let mut pipe_facts: Option<PipeData> = None;
    let mut ng_module: Option<NgModuleData> = None;
    let mut ng_decorator_spans: Vec<oxc_span::Span> = Vec::new();

    for decorator in &class.decorators {
        if let Some(facts) = injectable::parse_decorator(decorator, semantic, angular_imports) {
            injectable = Some(facts);
            ng_decorator_spans.push(decorator.span);
        }
        if let Some(facts) = service::parse_decorator(decorator, semantic, angular_imports) {
            service = Some(facts);
            ng_decorator_spans.push(decorator.span);
        }
        if let Some(parsed) = try_parse_component(
            decorator,
            semantic,
            import_map,
            file_path,
            fs,
            resolver,
            angular_imports,
            eval,
        ) {
            component = Some(parsed);
            ng_decorator_spans.push(decorator.span);
        }
        if let Some(parsed) = directive::parse_decorator(decorator, semantic, angular_imports, eval)
        {
            directive = Some(parsed);
            ng_decorator_spans.push(decorator.span);
        }
        if let Some(facts) = pipe::parse_decorator(decorator, semantic, angular_imports, eval) {
            pipe_facts = Some(facts);
            ng_decorator_spans.push(decorator.span);
        }
        if let Some(facts) = super::ngmodule::parse_decorator(
            decorator,
            converter,
            semantic,
            import_map,
            eval,
            angular_imports,
        ) {
            ng_module = Some(facts);
            ng_decorator_spans.push(decorator.span);
        }
    }

    if ng_decorator_spans.is_empty() {
        return None;
    }

    // Class decorators lead the removal list, followed by the member decorators.
    let mut decorator_removal_spans = Vec::new();
    for decorator in &class.decorators {
        if ng_decorator_spans.contains(&decorator.span) {
            super::later_declaration_references(
                decorator,
                semantic,
                class.span.end,
                &mut later_declaration_references,
            );
            decorator_removal_spans.push(super::utils::decorator_removal_span(
                decorator,
                semantic.source_text(),
            ));
        }
    }
    decorator_removal_spans.extend(member_removal_spans);
    let nocollapse_insertions = super::closure_nocollapse::collect_nocollapse_insertions(
        class,
        &ng_decorator_spans,
        semantic,
    );

    let member_io = input_output::extract_inputs_outputs(class, angular_imports, semantic, eval);
    let mut fields = member_io.fields;
    fields.extend(queries::extract_queries(
        class,
        angular_imports,
        semantic,
        eval,
    ));
    let (host_bindings, host_listeners) =
        host_binding::extract_host_bindings_listeners(class, eval, angular_imports);

    let extracted_type_parameters = extract_type_parameters(
        &class.type_parameters,
        semantic,
        Some(import_map),
        Some(local_exported_names),
    );
    let has_non_exported_bounds = extracted_type_parameters
        .as_ref()
        .is_some_and(|tp| tp.has_non_exported_bounds);
    let type_parameters = extracted_type_parameters.map(|tp| tp.params);

    let (has_ng_template_context_guard, ng_template_guards, has_ng_field_directive) =
        extract_template_guards_and_field_directive(class);

    let super_class = class.heritage.as_ref().and_then(|heritage| {
        let evaluated = crate::evaluator::evaluate_expression(&heritage.expression, eval);
        super::imports::resolved_value_to_super_class(&evaluated)
    });
    let uses_inheritance = class.heritage.is_some();
    let uses_on_changes = class.body.body.iter().any(|member| {
        if let ClassElement::MethodDefinition(method) = member {
            if let Some(key_name) = extract_property_key(&method.key) {
                return key_name == "ngOnChanges";
            }
        }
        false
    });
    let is_structural = constructor_params.as_ref().is_some_and(|params| {
        params
            .iter()
            .any(|p| p.type_name.as_deref() == Some("TemplateRef"))
    });

    // The structural stamp applies to the standalone @Directive only — the directive facts
    // embedded in a component keep `false` (the component wire shape has no such field).
    if let Some(ref mut data) = directive {
        data.is_structural = is_structural;
    }

    let is_exported = class_name
        .as_ref()
        .is_some_and(|name| local_exported_names.contains(name.as_str()));

    let decorated_span = oxc_span::Span::new(
        declaration_statement_start(class, class_node_id, semantic),
        class.span.end,
    );

    Some(ParsedClass {
        common: ParsedCommon {
            ng_decorator_spans,
            decorator_removal_spans,
            nocollapse_insertions,
            span: class.span,
            decorated_span,
            name_span,
            class_name,
            constructor_params,
            unexpected_param_decorators,
            member_decorators,
            later_declaration_references,
            type_parameters,
            has_ng_template_context_guard,
            ng_template_guards,
            has_ng_field_directive,
            uses_inheritance,
            uses_on_changes,
            is_exported,
            has_non_exported_bounds,
            super_class,
        },
        members: ParsedMembers {
            fields,
            members: member_io.members,
            pending_options: member_io.pending_options,
            io_issues: member_io.issues,
            host_bindings,
            host_listeners,
        },
        injectable,
        service,
        component,
        directive,
        pipe: pipe_facts,
        ng_module,
    })
}

/// Where the statement declaring `class` begins: the earliest of its first decorator (Angular or
/// not), its `class` keyword, and an enclosing `export` / `export default` keyword.
fn declaration_statement_start(
    class: &Class<'_>,
    class_node_id: oxc_semantic::NodeId,
    semantic: &Semantic<'_>,
) -> u32 {
    let class_start = class
        .decorators
        .first()
        .map_or(class.span.start, |d| d.span.start.min(class.span.start));
    let parent = semantic.nodes().parent_node(class_node_id);
    match parent.kind() {
        oxc_ast::AstKind::ExportNamedDeclaration(decl) => decl.span.start.min(class_start),
        oxc_ast::AstKind::ExportDefaultDeclaration(decl) => decl.span.start.min(class_start),
        _ => class_start,
    }
}

/// Everything derivable from a single file: the decorated classes (each component carrying its own
/// parsed imports) plus the curated facts (registrations, re-exports). This is the complete
/// single-file pass ([`analyze_file`]); the semantic query layers cross-file resolution on top of it.
pub struct ParsedFileAnalysis {
    pub classes: Vec<ClassData>,
    pub registrations: Vec<RegistrationInfo>,
    pub file_exports: FileExportInfo,
    pub imports_end: u32,
    /// The file's static `import` declarations, in source order. Drives import removal for
    /// `@defer` and namespace-alias discovery — both need the exact declaration text, so both
    /// would otherwise have to re-parse the source downstream.
    pub import_declarations: Vec<ImportDeclarationInfo>,
    pub type_only_exports: Vec<String>,
    pub static_dependencies: Vec<String>,
    /// The specifiers of the file's dynamic imports, `import()` calls and literal import types
    /// ([`super::imports::extract_dynamic_imports`]). Kept apart from
    /// [`Self::static_dependencies`]: both bring a file into the program, but only a static import
    /// is an edge for cycle detection.
    pub dynamic_dependencies: Vec<String>,
    pub diagnostics: Vec<crate::NgDiagnostic>,
    /// Where ngtsc's `signalMetadataTransform` would add a `debugName` to a signal-creating
    /// call ([`super::signal_debug_name`]). Byte offsets.
    pub signal_debug_names: Vec<super::signal_debug_name::SignalDebugNameInsertion>,
}

/// Raw output of [`ClassVisitor`] before the file-level fields (`imports_end`, …) are attached.
struct ClassVisitorOutput {
    classes: Vec<ClassData>,
    registrations: Vec<RegistrationInfo>,
    file_exports: FileExportInfo,
    diagnostics: Vec<crate::NgDiagnostic>,
}

pub fn analyze_parsed<Fs: ResourceResolverFs>(
    path: &Path,
    file_id: crate::query::FileId,
    source_text: &str,
    program: &oxc_ast::ast::Program<'_>,
    module_record: &oxc_syntax::module_record::ModuleRecord<'_>,
    semantic: &Semantic<'_>,
    fs: &Fs,
    resolver: &ResolverGeneric<Fs>,
    converter: &Utf8ToUtf16,
    compile_non_exported_classes: bool,
) -> ParsedFileAnalysis {
    let import_map = super::imports::extract_import_map(module_record);
    let is_core = super::imports::detect_is_core(path, fs);
    let angular_imports = super::imports::extract_angular_imports(module_record, semantic, is_core);
    let local_exported_names = get_local_exported_names(module_record);

    let mut visitor = ClassVisitor::new(
        source_text,
        converter,
        semantic,
        path,
        file_id,
        fs,
        resolver,
        &import_map,
        &angular_imports,
        &local_exported_names,
        compile_non_exported_classes,
    );
    visitor.process_classes();

    let mut imports_end = super::imports::find_imports_end(program, source_text);
    if let Some(mut conv) = converter.converter() {
        conv.convert_offset(&mut imports_end);
    }

    let file_exports = extract_file_exports(module_record);
    let output = visitor.into_results(file_exports);

    let import_declarations = super::imports::collect_import_declarations(
        program,
        semantic,
        source_text,
        &dependency_array_references(&output.classes),
    );
    let type_only_exports = get_type_only_exports(module_record, semantic);
    let static_dependencies = super::imports::extract_imports(module_record);
    let dynamic_dependencies = super::imports::extract_dynamic_imports(semantic);
    let signal_debug_names =
        super::signal_debug_name::collect_signal_debug_names(program, semantic, source_text);

    ParsedFileAnalysis {
        classes: output.classes,
        registrations: output.registrations,
        file_exports: output.file_exports,
        imports_end,
        import_declarations,
        type_only_exports,
        static_dependencies,
        dynamic_dependencies,
        diagnostics: output.diagnostics,
        signal_debug_names,
    }
}

/// Every identifier occurrence a `@Component.imports` array in this file resolved to. The
/// decorator is stripped wholesale from the output, so those uses do not reach it and must not
/// count as eager references to an imported symbol.
fn dependency_array_references(
    classes: &[ClassData],
) -> HashSet<oxc_syntax::reference::ReferenceId> {
    classes
        .iter()
        .filter_map(|class| match &class.decorator {
            DecoratorData::Component(component) => {
                let by_block_refs = component
                    .parsed_deferred_imports_by_block
                    .iter()
                    .flat_map(|map| map.values().flatten());
                Some(
                    component
                        .parsed_imports
                        .iter()
                        .chain(component.parsed_deferred_imports.iter())
                        .chain(by_block_refs)
                        .filter(|import| import.in_decorator)
                        .map(|import| import.reference_id),
                )
            }
            _ => None,
        })
        .flatten()
        .collect()
}

// TODO(dead-code): the crate-level `deny(dead_code)` is telling the truth here — the only
// caller left is `test_reexports_extraction_optimized`; production drives the syntax pass
// through the query engine. Port that test onto the live path and delete this.
#[allow(dead_code)]
pub fn analyze_file<Fs: ResourceResolverFs>(
    path: &Path,
    source_text: &str,
    fs: &Fs,
    resolver: &ResolverGeneric<Fs>,
) -> ParsedFileAnalysis {
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(path)
        .unwrap_or_default()
        .with_typescript(true);
    let ret = Parser::new(&allocator, source_text, source_type).parse();
    let program = &ret.program;

    let semantic_ret = SemanticBuilder::new()
        .with_build_nodes(true)
        .with_class_table(true)
        .build(program);
    let semantic = semantic_ret.semantic;

    let converter = Utf8ToUtf16::new(source_text);
    analyze_parsed(
        path,
        crate::query::FileIdInterner::new().intern_path(path),
        source_text,
        program,
        &ret.module_record,
        &semantic,
        fs,
        resolver,
        &converter,
        true,
    )
}

/// Extract a file's re-export table (`export { x } from …`, `export * from …`) from its module
/// record.
fn extract_file_exports(module_record: &ModuleRecord<'_>) -> FileExportInfo {
    let mut named = Vec::new();
    let mut wildcards = Vec::new();
    let mut local_aliases = Vec::new();

    for entry in &module_record.indirect_export_entries {
        let Some(ref source) = entry.module_request else {
            continue;
        };
        let source_str = source.name.to_string();

        let exported_name = match &entry.export_name {
            ExportExportName::Name(ns) => ns.name.to_string(),
            ExportExportName::Default(_) => "default".to_string(),
            ExportExportName::Null => continue,
        };

        let local_name = match &entry.import_name {
            ExportImportName::Name(ns) => ns.name.to_string(),
            ExportImportName::All => "*".to_string(),
            _ => continue,
        };

        let binds_locally = module_record
            .import_entries
            .iter()
            .any(|import| import.local_name.name.as_str() == exported_name);

        named.push(ReexportInfo {
            exported_name,
            local_name,
            source: source_str,
            binds_locally,
            is_type: entry.is_type,
        });
    }

    for entry in &module_record.local_export_entries {
        let Some(local_name) = entry.local_name.name() else {
            continue;
        };
        let exported_name = match &entry.export_name {
            ExportExportName::Name(ns) => ns.name.to_string(),
            ExportExportName::Default(_) => "default".to_string(),
            ExportExportName::Null => continue,
        };
        local_aliases.push(LocalExportAlias {
            exported_name,
            local_name: local_name.to_string(),
            is_type: entry.is_type,
        });
    }

    for entry in &module_record.star_export_entries {
        let Some(ref source) = entry.module_request else {
            continue;
        };
        wildcards.push(WildcardExport {
            source: source.name.to_string(),
            is_type: entry.is_type,
        });
    }

    FileExportInfo {
        named,
        wildcards,
        local_aliases,
    }
}

/// Applies NgModule schemas to the components it declares within the same file.
/// TODO: Feature parity: Support trans-file schema scoping. Currently, schemas are only applied to components in the same file as the NgModule.
/// Resolving this requires a global context or a third analysis pass.
fn apply_ngmodule_schemas_local(
    classes: &mut [ClassData],
    mut registrations: Option<&mut [RegistrationInfo]>,
) {
    let mut module_schemas: Vec<(String, Vec<String>)> = Vec::new();

    for class in classes.iter() {
        let Some(module) = class.as_ng_module() else {
            continue;
        };
        let Some(decls) = module.declarations.as_ref().and_then(|d| d.get_optional()) else {
            continue;
        };
        let Some(ref schemas) = module.schemas else {
            continue;
        };
        for decl in decls {
            module_schemas.push((decl.name().to_string(), schemas.clone()));
        }
    }

    if module_schemas.is_empty() {
        return;
    }

    for class in classes.iter_mut() {
        let Some(name) = class.class_name.clone() else {
            continue;
        };
        let Some(component) = class.as_component_mut() else {
            continue;
        };
        for (decl_name, schemas) in &module_schemas {
            if &name != decl_name {
                continue;
            }
            let mut combined = component.schemas.clone().unwrap_or_default();
            for schema in schemas {
                if !combined.contains(schema) {
                    combined.push(schema.clone());
                }
            }
            component.schemas = Some(combined);
        }
    }

    let Some(regs) = registrations.as_mut() else {
        return;
    };
    for reg in regs.iter_mut() {
        if reg.class_type != crate::ClassType::Component {
            continue;
        }
        for (decl_name, schemas) in &module_schemas {
            if &reg.class_name != decl_name {
                continue;
            }
            let mut combined = reg.schemas.clone().unwrap_or_default();
            for schema in schemas {
                if !combined.contains(schema) {
                    combined.push(schema.clone());
                }
            }
            reg.schemas = Some(combined);
        }
    }
}

pub fn resolve_local_imports(
    classes: &mut [ClassData],
    source_text: &str,
    converter: &Utf8ToUtf16,
) {
    // 1. Create a lookup map for classes in the same file
    let mut local_registry = std::collections::HashMap::new();
    for class in classes.iter() {
        if let Some(ref name) = class.class_name {
            local_registry.insert(name.clone(), class.clone());
        }
    }

    // 2. Resolve imports for each component, reading the class's own parsed imports
    for class in classes.iter_mut() {
        let DecoratorData::Component(component) = &mut class.decorator else {
            continue;
        };
        let imports = component.parsed_imports.clone();
        let def_imports = component.parsed_deferred_imports.clone();
        if imports.is_empty() && def_imports.is_empty() {
            continue;
        }

        let mut resolved_declarations = component.resolved_declarations.clone().unwrap_or_default();
        let mut resolved_eager_count = 0;

        for imp in &imports {
            if imp.import_source.is_some() {
                continue;
            }
            let Some(local_class) = local_registry.get(&imp.local_name) else {
                continue;
            };

            if let Some(decl) = crate::types::analysis::DeclarationData::from_class_data(
                imp.local_name.clone(),
                local_class,
                imp.is_forward_ref,
                source_text,
                converter,
            ) {
                resolved_declarations.push(decl);
                resolved_eager_count += 1;
            }
        }

        if !imports.is_empty() && resolved_eager_count > 0 {
            let has_ngmodule = resolved_declarations
                .iter()
                .any(|decl| decl.declaration_type == crate::types::analysis::ClassType::NgModule);
            if resolved_eager_count == imports.len() && !has_ngmodule {
                component.raw_imports_span = None;
            }
        }

        if !def_imports.is_empty() {
            let mut resolved_def = Vec::new();
            let mut resolved_def_by_block: std::collections::HashMap<
                String,
                Vec<crate::types::analysis::DeclarationData>,
            > = std::collections::HashMap::new();

            let mut name_to_blocks: std::collections::HashMap<String, Vec<String>> =
                std::collections::HashMap::new();
            if let Some(ref by_block) = component.parsed_deferred_imports_by_block {
                for (block_name, block_imps) in by_block {
                    for imp in block_imps {
                        name_to_blocks
                            .entry(imp.local_name.clone())
                            .or_default()
                            .push(block_name.clone());
                    }
                }
            }

            for imp in &def_imports {
                if imp.import_source.is_some() {
                    continue;
                }
                let Some(local_class) = local_registry.get(&imp.local_name) else {
                    continue;
                };

                if let Some(mut decl) = crate::types::analysis::DeclarationData::from_class_data(
                    imp.local_name.clone(),
                    local_class,
                    imp.is_forward_ref,
                    source_text,
                    converter,
                ) {
                    decl.is_explicitly_deferred = true;
                    if let Some(blocks) = name_to_blocks.get(&imp.local_name) {
                        decl.deferred_blocks = Some(blocks.clone());
                        for b in blocks {
                            resolved_def_by_block
                                .entry(b.clone())
                                .or_default()
                                .push(decl.clone());
                        }
                    }
                    resolved_def.push(decl.clone());
                    resolved_declarations.push(decl);
                }
            }

            if !resolved_def.is_empty() {
                component.resolved_deferred_declarations = Some(resolved_def);
                if !resolved_def_by_block.is_empty() {
                    component.resolved_deferred_declarations_by_block = Some(resolved_def_by_block);
                }
            }
        }

        if !resolved_declarations.is_empty() {
            component.resolved_declarations = Some(resolved_declarations);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::{create_test_fs, find_class, run_analyzer};
    use oxc_allocator::Allocator;
    use oxc_ast::ast::Statement;
    use oxc_parser::Parser;
    use oxc_span::SourceType;
    use std::collections::HashMap;

    fn get_exported_names(source: &str) -> std::collections::HashSet<String> {
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        get_local_exported_names(&ret.module_record)
            .into_iter()
            .map(|s| s.to_string())
            .collect()
    }

    #[test]
    fn test_named_export_alias() {
        let source = "class A {}; export { A as B };";
        let names = get_exported_names(source);
        assert!(names.is_empty());
    }

    #[test]
    fn test_named_export_class() {
        let source = "export class MyComp {}";
        let names = get_exported_names(source);
        assert!(names.contains("MyComp"));
    }

    #[test]
    fn test_default_export_class() {
        let source = "export default class AppComponent {}";
        let names = get_exported_names(source);
        assert!(names.is_empty());
    }
    use oxc_semantic::SemanticBuilder;

    fn has_non_exported_generic_bounds<'a>(
        type_parameters: &Option<oxc_allocator::Box<oxc_ast::ast::TSTypeParameterDeclaration<'a>>>,
        semantic: &Semantic<'a>,
        local_exported_names: &HashSet<&'a str>,
        import_map: &HashMap<String, ImportedSymbol>,
    ) -> bool {
        extract_type_parameters(
            type_parameters,
            semantic,
            Some(import_map),
            Some(local_exported_names),
        )
        .is_some_and(|extracted| extracted.has_non_exported_bounds)
    }

    #[test]
    fn test_has_non_exported_generic_bounds_local_not_exported() {
        let source = "
            interface Local {}
            class Test<T extends Local> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(result, "Expected true for non-exported generic bound");
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_local_exported() {
        let source = "
            interface Local {}
            export { Local };
            class Test<T extends Local> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(!result, "Expected false for exported generic bound");
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_imported() {
        let source = "
            import { Imported } from './somewhere';
            class Test<T extends Imported> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(!result, "Expected false for imported generic bound");
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_nested_arguments() {
        let source = "
            export interface Outer<T> {}
            interface Local {}
            class Test<T extends Outer<Local>> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(
                        result,
                        "Expected true for nested non-exported generic bound"
                    );
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_array_type() {
        let source = "
            interface Local {}
            class Test<T extends Local[]> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(result, "Expected true for non-exported array generic bound");
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_union_type() {
        let source = "
            interface Local {}
            class Test<T extends string | Local> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(result, "Expected true for non-exported union generic bound");
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_default_value() {
        let source = "
            interface Local {}
            class Test<T = Local> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(
                        result,
                        "Expected true for non-exported default generic parameter"
                    );
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_type_literal() {
        let source = "
            interface Local {}
            class Test<T extends { key: Local }> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(
                        result,
                        "Expected true for unexported type inside Type Literal constraint"
                    );
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_used_declaration_true() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'local-dir',
    template: '',
    standalone: true,
})
class LocalDir {} // NOT exported

@Component({
    selector: 'app-comp',
    template: '<local-dir></local-dir>',
    standalone: true,
    imports: [LocalDir],
})
export class AppComp {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);
        let local_dir = find_class(&results, "LocalDir").expect("LocalDir should exist");
        assert!(
            !local_dir.is_exported,
            "Expected LocalDir is_exported to be false"
        );
        let app_comp = find_class(&results, "AppComp").expect("AppComp should exist");
        assert!(
            app_comp.is_exported,
            "Expected AppComp is_exported to be true"
        );
    }

    #[test]
    fn test_has_non_exported_used_declaration_false() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'local-dir',
    template: '',
    standalone: true,
})
export class LocalDir {} // IS exported

@Component({
    selector: 'app-comp',
    template: '<local-dir></local-dir>',
    standalone: true,
    imports: [LocalDir],
})
export class AppComp {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);
        let local_dir = find_class(&results, "LocalDir").expect("LocalDir should exist");
        assert!(
            local_dir.is_exported,
            "Expected LocalDir is_exported to be true"
        );
        let class = find_class(&results, "AppComp").expect("AppComp should exist");
        assert!(class.is_exported, "Expected AppComp is_exported to be true");
    }

    #[test]
    fn test_default_export_is_not_exported() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-comp',
    template: '',
    standalone: true,
})
export default class AppComp {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComp").expect("AppComp should exist");
        assert!(
            !class.is_exported,
            "Expected is_exported to be false for default export"
        );
    }

    #[test]
    fn test_aliased_export_is_not_exported() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-comp',
    template: '',
    standalone: true,
})
class AppComp {}

export { AppComp as AliasedComp };
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComp").expect("AppComp should exist");
        assert!(
            !class.is_exported,
            "Expected is_exported to be false for aliased export"
        );
    }

    #[test]
    fn test_has_non_exported_generic_bounds_type_query() {
        let source = "
            const localVal = { foo: 'bar' };
            class Test<T extends typeof localVal> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(result, "Expected true for unexported typeof query");
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_has_non_exported_generic_bounds_self_reference() {
        let source = "
            class Test<T, U extends T> {}
        ";
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let local_exported_names = get_local_exported_names(&ret.module_record);
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);

        let mut found = false;
        for stmt in &ret.program.body {
            if let Statement::ClassDeclaration(class_decl) = stmt {
                if class_decl.id.as_ref().is_some_and(|id| id.name == "Test") {
                    let result = has_non_exported_generic_bounds(
                        &class_decl.type_parameters,
                        &semantic,
                        &local_exported_names,
                        &import_map,
                    );
                    assert!(
                        !result,
                        "Expected false for self-referencing generic bounds"
                    );
                    found = true;
                    break;
                }
            }
        }
        assert!(found, "Class Test not found");
    }

    #[test]
    fn test_directive_is_not_exported() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Directive } from '@angular/core';

@Directive({
    selector: '[local-dir]',
    standalone: true,
})
class LocalDir {} // NOT exported
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);
        let class = find_class(&results, "LocalDir").expect("LocalDir should exist");
        assert!(
            !class.is_exported,
            "Expected is_exported to be false for non-exported directive"
        );
    }

    #[test]
    fn test_pipe_is_not_exported() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Pipe } from '@angular/core';

@Pipe({
    name: 'local-pipe',
    standalone: true,
})
class LocalPipe {} // NOT exported
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);
        let class = find_class(&results, "LocalPipe").expect("LocalPipe should exist");
        assert!(
            !class.is_exported,
            "Expected is_exported to be false for non-exported pipe"
        );
    }

    #[test]
    fn test_reexports_extraction_optimized() {
        let source = r#"
export { foo } from 'bar';
export { default as baz } from 'qux';
export * as ns from 'star-source';
export * from 'wildcard-source';
"#;
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        let resolver = crate::utils::create_resolver_with_fs(
            std::path::Path::new("/test/tsconfig.json"),
            fs.clone(),
            false,
            None,
        );
        let path = std::path::PathBuf::from("/test/file.ts");

        let result = analyze_file(&path, source, &fs, &resolver);

        let file_exports = result.file_exports;

        // Verify named re-exports
        assert_eq!(file_exports.named.len(), 3);

        let foo_exp = file_exports
            .named
            .iter()
            .find(|e| e.exported_name == "foo")
            .unwrap();
        assert_eq!(foo_exp.local_name, "foo");
        assert_eq!(foo_exp.source, "bar");

        let baz_exp = file_exports
            .named
            .iter()
            .find(|e| e.exported_name == "baz")
            .unwrap();
        assert_eq!(baz_exp.local_name, "default");
        assert_eq!(baz_exp.source, "qux");

        let ns_exp = file_exports
            .named
            .iter()
            .find(|e| e.exported_name == "ns")
            .unwrap();
        assert_eq!(ns_exp.local_name, "*");
        assert_eq!(ns_exp.source, "star-source");

        // Verify wildcard re-exports
        assert_eq!(file_exports.wildcards.len(), 1);
        assert_eq!(file_exports.wildcards[0].source, "wildcard-source");
    }

    #[test]
    fn test_aliased_angular_decorators() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import {
    Service as AngularService,
    Injectable as AngularInjectable,
    Directive as AngularDirective,
    Pipe as AngularPipe,
    NgModule as AngularNgModule,
    Component as AngularComponent,
} from '@angular/core';

@AngularService()
export class MyService {}

@AngularInjectable()
export class MyInjectable {}

@AngularDirective({ selector: '[my-dir]', standalone: true })
export class MyDirective {}

@AngularPipe({ name: 'my-pipe', standalone: true })
export class MyPipe {}

@AngularNgModule({})
export class MyNgModule {}

@AngularComponent({ selector: 'my-comp', template: '<div></div>', standalone: true })
export class MyComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);

        let service = find_class(&results, "MyService").expect("MyService should exist");
        assert_eq!(
            service.service.as_ref().unwrap().decorator_name.as_deref(),
            Some("AngularService")
        );

        let injectable = find_class(&results, "MyInjectable").expect("MyInjectable should exist");
        assert_eq!(
            injectable
                .injectable
                .as_ref()
                .unwrap()
                .decorator_name
                .as_deref(),
            Some("AngularInjectable")
        );

        let directive = find_class(&results, "MyDirective").expect("MyDirective should exist");
        assert_eq!(
            directive
                .directive
                .as_ref()
                .unwrap()
                .decorator_name
                .as_deref(),
            Some("AngularDirective")
        );

        let pipe = find_class(&results, "MyPipe").expect("MyPipe should exist");
        assert_eq!(
            pipe.pipe.as_ref().unwrap().decorator_name.as_deref(),
            Some("AngularPipe")
        );

        let ng_module = find_class(&results, "MyNgModule").expect("MyNgModule should exist");
        assert_eq!(
            ng_module
                .ng_module
                .as_ref()
                .unwrap()
                .decorator_name
                .as_deref(),
            Some("AngularNgModule")
        );

        let component = find_class(&results, "MyComponent").expect("MyComponent should exist");
        assert_eq!(
            component
                .component
                .as_ref()
                .unwrap()
                .decorator_name
                .as_deref(),
            Some("AngularComponent")
        );
    }

    #[test]
    fn test_aliased_decorator_collision_does_not_misclassify() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Directive as Component } from '@angular/core';

@Component({ selector: '[my-dir]', standalone: true })
export class MyDirective {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);

        let directive_class =
            find_class(&results, "MyDirective").expect("MyDirective should exist");
        assert!(
            directive_class.directive.is_some(),
            "Should be classified as a directive"
        );
        assert!(
            directive_class.component.is_none(),
            "Should NOT be classified as a component"
        );
        assert_eq!(
            directive_class
                .directive
                .as_ref()
                .unwrap()
                .decorator_name
                .as_deref(),
            Some("Component")
        );
    }

    #[test]
    fn test_namespaced_decorators() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';

@core.Injectable
export class MyInjectable {}

@core.Service
export class MyService {}

@core.Component({ selector: 'my-comp', template: '<div></div>', standalone: true })
export class MyComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);

        let injectable = find_class(&results, "MyInjectable").expect("MyInjectable should exist");
        assert_eq!(
            injectable
                .injectable
                .as_ref()
                .unwrap()
                .decorator_name
                .as_deref(),
            Some("core.Injectable")
        );

        let service = find_class(&results, "MyService").expect("MyService should exist");
        assert_eq!(
            service.service.as_ref().unwrap().decorator_name.as_deref(),
            Some("core.Service")
        );

        let component = find_class(&results, "MyComponent").expect("MyComponent should exist");
        assert_eq!(
            component
                .component
                .as_ref()
                .unwrap()
                .decorator_name
                .as_deref(),
            Some("core.Component")
        );
    }

    #[test]
    fn test_foreign_decorator_with_angular_name_ignored() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from 'not-angular';

@Component({ selector: 'fake-comp' })
export class FakeComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);
        assert!(find_class(&results, "FakeComponent").is_none());
    }

    #[test]
    fn test_aliased_member_and_host_decorators() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import {
    Component as NgComp,
    Input as NgInput,
    Output as NgOutput,
    HostBinding as NgHostBinding,
    HostListener as NgHostListener,
    Inject as NgInject,
} from '@angular/core';

@NgComp({
    selector: 'my-comp',
    template: '<div></div>',
    standalone: true,
    inputs: ['declaredInput'],
})
export class MyComponent {
    @NgInput() boundInput: string = '';
    @NgOutput() boundOutput: any;
    @NgHostBinding('class.active') isActive = true;
    @NgHostListener('click', ['$event']) onClick(e: any) {}

    constructor(@NgInject('TOKEN') public myToken: string) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);

        let component = find_class(&results, "MyComponent").expect("MyComponent should exist");

        let input_names: Vec<&str> = component.inputs.iter().map(|i| i.name.as_str()).collect();
        assert!(
            input_names.contains(&"boundInput"),
            "Missing boundInput: {:?}",
            input_names
        );
        assert!(
            input_names.contains(&"declaredInput"),
            "Missing declaredInput: {:?}",
            input_names
        );

        let output_names: Vec<&str> = component.outputs.iter().map(|o| o.name.as_str()).collect();
        assert!(
            output_names.contains(&"boundOutput"),
            "Missing boundOutput: {:?}",
            output_names
        );

        assert_eq!(component.host_bindings.len(), 1);
        assert_eq!(
            component.host_bindings[0].member_name.text.as_deref(),
            Some("isActive")
        );

        assert_eq!(component.host_listeners.len(), 1);
        assert_eq!(
            component.host_listeners[0]
                .event_name
                .as_ref()
                .unwrap()
                .text
                .as_deref(),
            Some("click")
        );

        let params = component.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 1);
        assert!(
            params[0].is_type_only,
            "Expected is_type_only to be true for @NgInject"
        );
        assert_eq!(params[0].decorators[0].name, "NgInject");

        let member_dec_names: Vec<(&str, &str)> = component
            .member_decorators
            .as_ref()
            .unwrap()
            .iter()
            .flat_map(|m| {
                m.decorators
                    .iter()
                    .map(move |d| (m.property_name.as_str(), d.name.as_str()))
            })
            .collect();
        assert!(member_dec_names.contains(&("boundInput", "NgInput")));
        assert!(member_dec_names.contains(&("boundOutput", "NgOutput")));
        assert!(member_dec_names.contains(&("isActive", "NgHostBinding")));
        assert!(member_dec_names.contains(&("onClick", "NgHostListener")));
    }

    #[test]
    fn test_namespaced_member_and_host_decorators() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';

@core.Component({
    selector: 'my-comp',
    template: '<div></div>',
    standalone: true,
})
export class MyComponent {
    @core.Input() boundInput: string = '';
    @core.Output() boundOutput: any;
    @core.HostBinding('class.active') isActive = true;
    @core.HostListener('click', ['$event']) onClick(e: any) {}

    constructor(@core.Inject('TOKEN') public myToken: string) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);

        let component = find_class(&results, "MyComponent").expect("MyComponent should exist");

        assert!(component.inputs.iter().any(|i| i.name == "boundInput"));
        assert!(component.outputs.iter().any(|o| o.name == "boundOutput"));
        assert_eq!(component.host_bindings.len(), 1);
        assert_eq!(component.host_listeners.len(), 1);

        let params = component.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 1);
        assert!(params[0].is_type_only);
        assert_eq!(params[0].decorators[0].name, "core.Inject");

        let member_dec_names: Vec<(&str, &str)> = component
            .member_decorators
            .as_ref()
            .unwrap()
            .iter()
            .flat_map(|m| {
                m.decorators
                    .iter()
                    .map(move |d| (m.property_name.as_str(), d.name.as_str()))
            })
            .collect();
        assert!(member_dec_names.contains(&("boundInput", "core.Input")));
        assert!(member_dec_names.contains(&("boundOutput", "core.Output")));
        assert!(member_dec_names.contains(&("isActive", "core.HostBinding")));
        assert!(member_dec_names.contains(&("onClick", "core.HostListener")));
    }

    #[test]
    fn test_foreign_member_decorators_ignored() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';
import { Input, Output, HostBinding, HostListener, Inject } from 'not-angular';

@Component({
    selector: 'my-comp',
    template: '<div></div>',
    standalone: true,
})
export class MyComponent {
    @Input() fakeInput: string = '';
    @Output() fakeOutput: any;
    @HostBinding('class.active') fakeActive = true;
    @HostListener('click') fakeClick() {}

    constructor(@Inject('TOKEN') public myToken: string) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);

        let component = find_class(&results, "MyComponent").expect("MyComponent should exist");

        assert!(!component.inputs.iter().any(|i| i.name == "fakeInput"));
        assert!(!component.outputs.iter().any(|o| o.name == "fakeOutput"));
        assert_eq!(component.host_bindings.len(), 0);
        assert_eq!(component.host_listeners.len(), 0);

        let params = component.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 1);
        assert!(!params[0].is_type_only);
    }

    /// ngtsc classifies a decorator purely by where it was imported from
    /// (`decorator.import.from === '@angular/core'`) and never by bare identifier text, so a
    /// locally declared function that merely shares a name with an Angular decorator must not be
    /// picked up. Guards against being more permissive than ngtsc.
    #[test]
    fn test_locally_declared_decorator_with_angular_name_ignored() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
function Component(cfg: any): any { return () => {}; }
function Input(): any { return () => {}; }

@Component({ selector: 'fake-comp', template: '' })
export class FakeComponent {
    @Input() foo: string = '';
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert!(
            find_class(&results, "FakeComponent").is_none(),
            "a locally declared @Component must not be treated as Angular's"
        );
    }

    /// ngtsc derives the `type:` of a constructor parameter in `ɵsetClassMetadata` from the
    /// parameter's type value reference alone; `@Attribute` supplies a DI token but does not
    /// suppress the type the way `@Inject` does in this analyzer.
    #[test]
    fn test_attribute_decorator_preserves_parameter_type() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Directive, Attribute, ElementRef } from '@angular/core';

@Directive({ selector: '[d]', standalone: true })
export class D {
    constructor(@Attribute('attr') public el: ElementRef) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let d = find_class(&results, "D").expect("D should exist");
        let params = d.constructor_params.as_ref().unwrap();
        assert_eq!(params[0].type_name.as_deref(), Some("ElementRef"));
        assert!(
            !params[0].is_type_only,
            "@Attribute must not mark the parameter type-only"
        );
    }

    /// A namespaced decorator used without parentheses (`@core.HostBinding`) binds to the property
    /// name, the same as the unqualified `@HostBinding` form.
    #[test]
    fn test_namespaced_host_binding_without_parens() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';

@core.Directive({ selector: '[d]', standalone: true })
export class D {
    @core.HostBinding role = 'button';
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let d = find_class(&results, "D").expect("D should exist");
        assert_eq!(d.host_bindings.len(), 1);
        assert_eq!(d.host_bindings[0].member_name.text.as_deref(), Some("role"));
        assert!(d.host_bindings[0].arguments.is_empty());
    }

    /// A decorator wrapped in parentheses is not a `DecoratorIdentifier` for ngtsc
    /// (`isDecoratorIdentifier` accepts only an identifier or a single-level `a.b`), so it is
    /// ignored outright. It must never be mistaken for the no-argument `@HostBinding` form, which
    /// would silently drop the argument and bind to the property name instead.
    #[test]
    fn test_parenthesized_host_binding_is_ignored() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Directive, HostBinding } from '@angular/core';

@Directive({ selector: '[d]', standalone: true })
export class D {
    @(HostBinding('class.active')) isActive = true;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let d = find_class(&results, "D").expect("D should exist");
        assert!(
            d.host_bindings.is_empty(),
            "expected the wrapped decorator to be ignored, got {:?}",
            d.host_bindings
        );
    }

    /// ngtsc's `getDep` only accepts a bare identifier or `new Ident(...)` for the DI qualifiers in
    /// `@Injectable({deps})`; a namespaced `core.Optional` fails its `ts.isIdentifier` check and is
    /// therefore treated as an ordinary token rather than an `optional` flag.
    #[test]
    fn test_namespaced_qualifier_in_deps_is_a_token_not_a_flag() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';

export class Dep {}

@core.Injectable({ useFactory: () => null, deps: [[core.Optional, Dep]] })
export class MyService {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let svc = find_class(&results, "MyService").expect("MyService should exist");
        let deps = svc.injectable.as_ref().unwrap().deps.as_ref().unwrap();
        assert_eq!(deps.len(), 1);
        assert!(
            !deps[0].optional,
            "namespaced core.Optional is a token for ngtsc, not an optional qualifier"
        );
    }

    /// The unqualified `new Optional()` form, by contrast, *is* recognised, including through an
    /// aliased import.
    #[test]
    fn test_aliased_qualifier_in_deps_is_recognized() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Injectable, Optional as NgOptional } from '@angular/core';

export class Dep {}

@Injectable({ useFactory: () => null, deps: [[new NgOptional(), Dep]] })
export class MyService {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let svc = find_class(&results, "MyService").expect("MyService should exist");
        let deps = svc.injectable.as_ref().unwrap().deps.as_ref().unwrap();
        assert_eq!(deps.len(), 1);
        assert!(
            deps[0].optional,
            "aliased new NgOptional() must be honoured"
        );
    }

    /// ngtsc's `isAngularDecorator(decorator, isCore)` for `ɵsetClassMetadata` is name-agnostic:
    /// anything imported from `@angular/core` is emitted with its arguments, even decorators this
    /// analyzer has no dedicated symbol for.
    #[test]
    fn test_unknown_core_decorator_still_counts_as_angular() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, SomeFutureDecorator } from '@angular/core';
import { Whatever } from 'not-angular';

@Component({ selector: 'my-comp', template: '', standalone: true })
export class MyComponent {
    @SomeFutureDecorator('x') a: string = '';
    @Whatever('y') b: string = '';
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let c = find_class(&results, "MyComponent").expect("MyComponent should exist");
        let members = c.member_decorators.as_ref().unwrap();
        let by_name = |prop: &str| {
            members
                .iter()
                .find(|m| m.property_name == prop)
                .unwrap_or_else(|| panic!("missing member {prop}"))
        };
        assert!(
            by_name("a").decorators[0].is_angular,
            "a decorator imported from @angular/core is Angular's regardless of its name"
        );
        assert!(
            !by_name("b").decorators[0].is_angular,
            "a decorator from another package is not"
        );
    }

    #[test]
    fn test_decorator_args_reference_later_declarations() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, ContentChild, Directive, Inject, Injectable, forwardRef } from '@angular/core';

@Directive()
export class Earlier {}

@Component({ template: '<ng-content/>' })
export class MemberRefsLater {
    @ContentChild(Later) set later(value: Later) {}
}

@Directive({ providers: [Later] })
export class ClassRefsLater {}

@Component({ template: '', providers: [forwardRef(() => Later)] })
export class ForwardRef {}

@Directive({ providers: [Earlier, hoisted] })
export class RefsEarlierAndVar {
    @ContentChild(Earlier) earlier!: Earlier;
}

@Injectable()
export class CtorParamRefsLater {
    constructor(@Inject(Later) later: Later) {}
}

@Directive()
export class Later {}

@Directive()
export class GenericRefsLater {
    @ContentChild(GenericLater<string>) generic!: GenericLater<string>;
}

@Directive()
export class GenericLater<T> {}

@Directive({ providers: [{ provide: Earlier, useValue: window.LATER_WINDOW_PROP }] })
export class RefsLaterWindowProp {}

declare global {
    interface Window {
        EARLIER_WINDOW_PROP: string;
    }
}

@Directive({ providers: [{ provide: Earlier, useValue: window.EARLIER_WINDOW_PROP }] })
export class RefsEarlierWindowProp {}

declare global {
    interface Window {
        LATER_WINDOW_PROP: string;
    }
}

var hoisted = 1;
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = |name: &str| {
            find_class(&results, name).unwrap_or_else(|| panic!("missing class {name}"))
        };
        let count = |name: &str| class(name).later_declaration_references.len();
        assert_eq!(
            count("MemberRefsLater"),
            1,
            "member decorator references a later class"
        );
        assert_eq!(
            count("ClassRefsLater"),
            1,
            "class decorator references a later class"
        );
        assert_eq!(count("ForwardRef"), 0, "forwardRef defers the reference");
        assert_eq!(
            count("RefsEarlierAndVar"),
            0,
            "earlier classes and hoisted vars are initialized"
        );
        assert_eq!(
            count("CtorParamRefsLater"),
            0,
            "ctor param decorators are wrapped in an arrow function"
        );
        assert_eq!(
            count("RefsLaterWindowProp"),
            1,
            "static member expression references a property declared after the class"
        );
        assert_eq!(
            count("RefsEarlierWindowProp"),
            0,
            "static member expression references a property declared before the class"
        );

        // When type arguments are stripped the args are pre-rendered, so the guard is inserted here.
        let generic = class("GenericRefsLater");
        assert_eq!(generic.later_declaration_references.len(), 1);
        assert_eq!(
            generic.member_decorators.as_ref().unwrap()[0].decorators[0]
                .args_string
                .as_deref(),
            Some("// @ts-ignore\nGenericLater")
        );
    }

    fn diagnostics(results: &[crate::AnalysisResult]) -> Vec<(u32, String)> {
        results
            .iter()
            .flat_map(|file| file.diagnostics.iter())
            .map(|diag| (diag.code, diag.message_text.clone()))
            .collect()
    }

    #[test]
    fn test_unexpected_core_param_decorator_is_reported() {
        let source = r#"
import { Component, Injectable } from '@angular/core';

export class Dep {}

@Component({ selector: 'my-comp', template: '', standalone: true })
export class MyComponent {
    constructor(@Injectable() dep: Dep) {}
}
"#;
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            ("/test/app.ts", source),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(
            diagnostics(&results),
            vec![(
                1005,
                "Unexpected decorator Injectable on parameter.".to_string()
            )]
        );
        let span = results[0].diagnostics[0]
            .span
            .as_ref()
            .expect("the diagnostic must point at the decorator");
        assert_eq!(
            &source[span.start as usize..span.end as usize],
            "@Injectable()"
        );
    }

    #[test]
    fn test_unexpected_core_param_decorator_reports_its_exported_name() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, Injectable as Inj } from '@angular/core';
import * as core from '@angular/core';

export class Dep {}

@Component({ selector: 'aliased', template: '', standalone: true })
export class AliasedComponent {
    constructor(@Inj() dep: Dep) {}
}

@Component({ selector: 'namespaced', template: '', standalone: true })
export class NamespacedComponent {
    constructor(@core.Injectable() dep: Dep) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(
            diagnostics(&results),
            vec![
                (
                    1005,
                    "Unexpected decorator Injectable on parameter.".to_string()
                ),
                (
                    1005,
                    "Unexpected decorator Injectable on parameter.".to_string()
                )
            ]
        );
    }

    #[test]
    fn test_foreign_param_decorator_is_accepted() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/logged.ts",
                "export function Logged() { return (_t: object, _k: unknown, _i: number) => {}; }",
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';
import { Logged } from './logged';

export class Dep {}

@Component({ selector: 'my-comp', template: '', standalone: true })
export class MyComponent {
    constructor(@Logged() dep: Dep) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(diagnostics(&results), Vec::new());
    }

    #[test]
    fn test_parenthesized_param_decorator_is_ignored() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, Injectable } from '@angular/core';

export class Dep {}

@Component({ selector: 'my-comp', template: '', standalone: true })
export class MyComponent {
    constructor(@(Injectable()) dep: Dep) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(diagnostics(&results), Vec::new());
    }

    #[test]
    fn test_di_param_decorators_are_accepted() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import {
    Attribute,
    Component,
    Host,
    Inject,
    Optional,
    Self,
    SkipSelf as NgSkipSelf,
} from '@angular/core';

export class Dep {}
export const TOKEN = 'token';

@Component({ selector: 'my-comp', template: '', standalone: true })
export class MyComponent {
    constructor(
        @Inject(TOKEN) a: Dep,
        @Optional() b: Dep,
        @Self() c: Dep,
        @NgSkipSelf() d: Dep,
        @Host() e: Dep,
        @Attribute('name') f: string,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(diagnostics(&results), Vec::new());
    }

    #[test]
    fn test_param_decorator_on_undecorated_class_is_ignored() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, Injectable } from '@angular/core';

export class Dep {}

export class PlainClass {
    constructor(@Injectable() dep: Dep) {}
}

@Component({ selector: 'my-comp', template: '', standalone: true })
export class MyComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(diagnostics(&results), Vec::new());
    }

    #[test]
    fn test_unexpected_param_decorator_on_injectable_is_reported() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Injectable, Pipe } from '@angular/core';

export class Dep {}

@Injectable({ providedIn: 'root' })
export class MyService {
    constructor(@Pipe({ name: 'p' }) dep: Dep) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(
            diagnostics(&results),
            vec![(1005, "Unexpected decorator Pipe on parameter.".to_string())]
        );
    }

    #[test]
    fn test_unexpected_param_decorator_on_service_is_not_reported() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Injectable, Service } from '@angular/core';

export class Dep {}

@Service()
export class MyService {
    constructor(@Injectable() dep: Dep) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(diagnostics(&results), Vec::new());
    }

    #[test]
    fn test_core_reports_any_unrecognized_param_decorator() {
        let fs = create_test_fs(&[
            (
                "/test/package.json",
                r#"{"name": "@angular/core", "version": "0.0.0"}"#,
            ),
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/di.ts",
                r#"
export function Component(_meta: unknown): any {}
export function Optional(): any {}
export function Logged(): any {}
"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, Logged, Optional } from './di';

export class Dep {}

@Component({ selector: 'my-comp', template: '', standalone: true })
export class MyComponent {
    constructor(@Optional() a: Dep, @Logged() b: Dep) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(
            diagnostics(&results),
            vec![(
                1005,
                "Unexpected decorator Logged on parameter.".to_string()
            )]
        );
    }

    #[test]
    fn test_namespaced_initializer_apis() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';
import * as rxjsInterop from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

export class ItemCmp {}

@core.Component({ selector: 'my-comp', template: '', standalone: true })
export class Cmp {
    name = core.input<string>();
    reqName = core.input.required<string>();
    val = core.model<string>();
    reqVal = core.model.required<string>();
    changed = core.output<string>();
    obs = rxjsInterop.outputFromObservable(of(1));
    vc = core.viewChild(ItemCmp);
    vcReq = core.viewChild.required(ItemCmp);
    vcs = core.viewChildren(ItemCmp);
    cc = core.contentChild(ItemCmp);
    ccReq = core.contentChild.required(ItemCmp);
    ccs = core.contentChildren(ItemCmp);
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let c = find_class(&results, "Cmp").expect("Cmp should exist");
        assert!(
            c.component.is_some(),
            "@core.Component must classify the class"
        );

        let inputs: Vec<(&str, bool, bool)> = c
            .inputs
            .iter()
            .map(|i| (i.name.as_str(), i.required, i.is_signal))
            .collect();
        assert_eq!(
            inputs,
            vec![
                ("name", false, true),
                ("reqName", true, true),
                ("val", false, true),
                ("reqVal", true, true),
            ]
        );

        let outputs: Vec<(&str, Option<&str>)> = c
            .outputs
            .iter()
            .map(|o| (o.name.as_str(), o.alias.as_deref()))
            .collect();
        assert_eq!(
            outputs,
            vec![
                ("val", Some("valChange")),
                ("reqVal", Some("reqValChange")),
                ("changed", None),
                ("obs", None),
            ]
        );

        let view_queries: Vec<(&str, bool, bool)> = c
            .view_queries
            .iter()
            .map(|q| (q.property_name.as_str(), q.first, q.is_signal))
            .collect();
        assert_eq!(
            view_queries,
            vec![
                ("vc", true, true),
                ("vcReq", true, true),
                ("vcs", false, true)
            ]
        );

        let content_queries: Vec<(&str, bool, bool)> = c
            .queries
            .iter()
            .map(|q| (q.property_name.as_str(), q.first, q.is_signal))
            .collect();
        assert_eq!(
            content_queries,
            vec![
                ("cc", true, true),
                ("ccReq", true, true),
                ("ccs", false, true)
            ]
        );
    }

    #[test]
    fn test_namespace_only_exposes_its_own_modules_initializer_apis() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';
import * as rxjsInterop from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@core.Component({ selector: 'my-comp', template: '', standalone: true })
export class Cmp {
    fromWrongModule = core.outputFromObservable(of(1));
    alsoWrongModule = rxjsInterop.input<string>();
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let c = find_class(&results, "Cmp").expect("Cmp should exist");
        assert!(
            c.outputs.is_empty(),
            "outputFromObservable is not an @angular/core export, got {:?}",
            c.outputs
        );
        assert!(
            c.inputs.is_empty(),
            "input is not an @angular/core/rxjs-interop export, got {:?}",
            c.inputs
        );
    }

    #[test]
    fn test_malformed_initializer_callees_are_not_initializer_apis() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';
import { Component, input, viewChild } from '@angular/core';

export class ItemCmp {}

@Component({ selector: 'my-comp', template: '', standalone: true })
export class Cmp {
    chained = input.required.required<string>();
    chainedNamespaced = core.input.required.required<string>();
    unknownProperty = input.notAnApi<string>();
    computed = core['input']<string>();
    parenthesized = (input)<string>();
    parenthesizedQuery = (core.viewChild)(ItemCmp);
    namespaceRequired = core.required<string>();
    queryChained = viewChild.required.required(ItemCmp);
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let c = find_class(&results, "Cmp").expect("Cmp should exist");
        assert!(
            c.inputs.is_empty(),
            "none of these callees is an initializer API for ngtsc, got {:?}",
            c.inputs
        );
        assert!(
            c.view_queries.is_empty(),
            "none of these callees is a query for ngtsc, got {:?}",
            c.view_queries
        );
    }

    #[test]
    fn test_initializer_apis_through_casts_and_parentheses() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.ts"]}"#,
            ),
            (
                "/test/app.ts",
                r#"
import * as core from '@angular/core';

export class ItemCmp {}

@core.Component({ selector: 'my-comp', template: '', standalone: true })
export class Cmp {
    castInput = core.input<string>() as core.InputSignal<string>;
    castQuery = core.viewChild(ItemCmp) as core.Signal<ItemCmp | undefined>;
    parenthesizedQuery = (core.contentChild(ItemCmp));
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let c = find_class(&results, "Cmp").expect("Cmp should exist");
        let inputs: Vec<&str> = c.inputs.iter().map(|i| i.name.as_str()).collect();
        assert_eq!(inputs, vec!["castInput"]);
        let view_queries: Vec<&str> = c
            .view_queries
            .iter()
            .map(|q| q.property_name.as_str())
            .collect();
        assert_eq!(view_queries, vec!["castQuery"]);
        let content_queries: Vec<&str> =
            c.queries.iter().map(|q| q.property_name.as_str()).collect();
        assert_eq!(content_queries, vec!["parenthesizedQuery"]);
    }
}
