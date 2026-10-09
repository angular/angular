use oxc_ast::ast::*;

use crate::query::{FileId, ReferenceId};
use crate::types::analysis::{HostDirectiveEntry, OwningReference, Reference};
use crate::{ClassType, HostDirectiveBinding, InputMetadata, OutputMetadata};

use super::imports::{FileExportInfo, LocalExportAlias, ReexportInfo, WildcardExport};
use super::utils::{
    extract_property_key, extract_template_guards_and_field_directive, extract_type_parameters,
};
use oxc_ast_visit::utf8_to_utf16::Utf8ToUtf16;

use crate::analyzer::{
    AngularField, ClassData, ComponentData, DecoratorData, DirectiveData, InputData, NgModuleData,
    OutputData, PipeData, RegistrationInfo, TransformData,
};
use crate::evaluator::{evaluate_type, EvalInput, EvalMode, Resolved, ResolvedEnv, ResolvedValue};
use crate::types::metadata::SpanMetadata;
use oxc_semantic::Semantic;

pub struct DtsClassAnalysis {
    pub class: ClassData,
    pub registration: RegistrationInfo,
}

pub struct DtsAnalysisResult {
    pub classes: Vec<ClassData>,
    pub registrations: Vec<RegistrationInfo>,
    pub exports: FileExportInfo,
    /// The file's static `import` declarations. A `.d.ts` has no component decorators, so no
    /// reference is excused and every binding reports as eagerly referenced — which is right:
    /// nothing here is ever removed, the table exists so consumers can read the declarations
    /// (namespace aliases in particular) without re-parsing.
    pub import_declarations: Vec<crate::analyzer::ImportDeclarationInfo>,
}

/// Analyze a .d.ts file - extract classes and re-exports
pub fn analyze_dts(
    program: &Program<'_>,
    source_text: &str,
    file_id: FileId,
    module_record: &oxc_syntax::module_record::ModuleRecord<'_>,
    semantic: &Semantic<'_>,
    converter: &Utf8ToUtf16,
) -> DtsAnalysisResult {
    let mut classes = Vec::new();
    let mut registrations = Vec::new();
    let mut named_exports = Vec::new();
    let mut wildcards = Vec::new();
    let mut local_aliases = Vec::new();
    let mut fallback_symbol_id = 1000000;

    let import_map = crate::analyzer::imports::extract_import_map(module_record);
    let local_exported_names = crate::analyzer::utils::get_local_exported_names(module_record);
    let eval = EvalInput {
        semantic,
        file: file_id,
        import_map: &import_map,
        mode: EvalMode::Syntax,
        env: &ResolvedEnv::new(),
        foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
    };

    for stmt in &program.body {
        match stmt {
            Statement::ExportDeclaration(export) => {
                if let Declaration::ClassDeclaration(class) = &export.declaration {
                    // `class_index` holds every `declare class`, exported or not (arm below); the export
                    // itself must be recorded here.
                    if let Some(id) = &class.id {
                        local_aliases.push(LocalExportAlias {
                            exported_name: id.name.to_string(),
                            local_name: id.name.to_string(),
                            is_type: false,
                        });
                    }

                    let symbol_id = class
                        .id
                        .as_ref()
                        .and_then(|id| id.symbol_id.get())
                        .unwrap_or_else(|| {
                            fallback_symbol_id += 1;
                            oxc_semantic::SymbolId::from(fallback_symbol_id)
                        });
                    let reference_id = ReferenceId::new(file_id, symbol_id);

                    if let Some(analysis) = extract_class_metadata(
                        class,
                        source_text,
                        reference_id,
                        &eval,
                        &local_exported_names,
                        converter,
                    ) {
                        classes.push(analysis.class);
                        registrations.push(analysis.registration);
                    }
                }
            }
            Statement::ExportNamedDeclaration(export) => {
                let decl_is_type = export.export_kind.is_type();
                for spec in &export.specifiers {
                    local_aliases.push(LocalExportAlias {
                        exported_name: spec.exported.name().to_string(),
                        local_name: spec.local.name().to_string(),
                        is_type: decl_is_type || spec.export_kind.is_type(),
                    });
                }
            }
            Statement::ExportFromDeclaration(export) => {
                let decl_is_type = export.export_kind.is_type();
                for spec in &export.specifiers {
                    named_exports.push(ReexportInfo {
                        exported_name: spec.exported.name().to_string(),
                        local_name: spec.local.name().to_string(),
                        source: export.source.value.to_string(),
                        // `export … from` in a `.d.ts` forwards the symbol without
                        // binding it here.
                        binds_locally: false,
                        is_type: decl_is_type || spec.export_kind.is_type(),
                    });
                }
            }
            Statement::ExportAllDeclaration(decl) => {
                if let Some(exported) = &decl.exported {
                    // `export * as ns from './z'` publishes one binding, `ns`. Filing it as a
                    // wildcard would claim this file publishes everything in './z' under its own
                    // name.
                    named_exports.push(ReexportInfo {
                        exported_name: exported.name().to_string(),
                        local_name: "*".to_string(),
                        source: decl.source.value.to_string(),
                        binds_locally: false,
                        is_type: decl.export_kind.is_type(),
                    });
                } else {
                    wildcards.push(WildcardExport {
                        source: decl.source.value.to_string(),
                        is_type: decl.export_kind.is_type(),
                    });
                }
            }
            Statement::ExportDefaultDeclaration(export) => {
                let local_name = match &export.declaration {
                    ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                        let Some(id) = &class.id else {
                            // Nothing can name an anonymous default export.
                            continue;
                        };
                        let symbol_id = id.symbol_id.get().unwrap_or_else(|| {
                            fallback_symbol_id += 1;
                            oxc_semantic::SymbolId::from(fallback_symbol_id)
                        });
                        let reference_id = ReferenceId::new(file_id, symbol_id);
                        if let Some(analysis) = extract_class_metadata(
                            class,
                            source_text,
                            reference_id,
                            &eval,
                            &local_exported_names,
                            converter,
                        ) {
                            classes.push(analysis.class);
                            registrations.push(analysis.registration);
                        }
                        id.name.to_string()
                    }
                    // `declare class Foo; export default Foo` — the arm below registers `Foo`.
                    ExportDefaultDeclarationKind::Identifier(ident) => ident.name.to_string(),
                    _ => continue,
                };
                local_aliases.push(LocalExportAlias {
                    exported_name: "default".to_string(),
                    local_name,
                    is_type: false,
                });
            }
            // `export = Foo` publishes no named export, so nothing here may be imported by name.
            Statement::TSExportAssignment(_) => {}
            Statement::ClassDeclaration(class) => {
                let symbol_id = class
                    .id
                    .as_ref()
                    .and_then(|id| id.symbol_id.get())
                    .unwrap_or_else(|| {
                        fallback_symbol_id += 1;
                        oxc_semantic::SymbolId::from(fallback_symbol_id)
                    });
                let reference_id = ReferenceId::new(file_id, symbol_id);

                if let Some(analysis) = extract_class_metadata(
                    class,
                    source_text,
                    reference_id,
                    &eval,
                    &local_exported_names,
                    converter,
                ) {
                    classes.push(analysis.class);
                    registrations.push(analysis.registration);
                }
            }
            _ => {}
        }
    }

    DtsAnalysisResult {
        classes,
        registrations,
        exports: FileExportInfo {
            named: named_exports,
            wildcards,
            local_aliases,
        },
        import_declarations: crate::analyzer::imports::collect_import_declarations(
            program,
            semantic,
            source_text,
            &std::collections::HashSet::new(),
        ),
    }
}

/// The wire span of a `.d.ts` class's name, in UTF-16 code units of the declaration file like
/// every other wire span: the TypeScript layer indexes the file's JS string with it.
fn class_name_span(class: &Class, converter: &Utf8ToUtf16) -> SpanMetadata {
    let Some(id) = class.id.as_ref() else {
        return SpanMetadata::default();
    };
    SpanMetadata::new(id.span, converter)
}

fn extract_class_metadata(
    class: &Class,
    source_text: &str,
    reference_id: ReferenceId,
    eval: &EvalInput<'_, '_>,
    local_exported_names: &std::collections::HashSet<&str>,
    converter: &Utf8ToUtf16,
) -> Option<DtsClassAnalysis> {
    let class_name = class.id.as_ref()?.name.to_string();

    let super_class = class.heritage.as_ref().and_then(|heritage| {
        let evaluated = crate::evaluator::evaluate_expression(&heritage.expression, eval);
        crate::analyzer::imports::resolved_value_to_super_class(&evaluated)
    });
    let uses_inheritance = class.heritage.is_some();
    let raw_type_parameters = extract_type_parameters(
        &class.type_parameters,
        eval.semantic,
        Some(eval.import_map),
        Some(local_exported_names),
    );
    let type_parameters = raw_type_parameters.as_ref().map(|extracted| {
        extracted
            .params
            .iter()
            .cloned()
            .map(|p| p.into_wire(source_text, converter))
            .collect::<Vec<_>>()
    });

    let (has_ng_template_context_guard, ng_template_guards, has_ng_field_directive) =
        extract_template_guards_and_field_directive(class);

    let mut class_type = None;
    let mut selector = None;
    let mut pipe_name = None;
    let mut export_as = None;
    let mut inputs = Vec::new();
    let mut outputs = Vec::new();
    let mut ng_content_selectors = None;
    let mut is_standalone = None;
    let mut host_directives = None;
    let mut coerced_input_fields = Vec::new();
    let mut ng_module_metadata = None;

    let mut property_accessibilities = std::collections::HashMap::new();
    let mut declared_properties = std::collections::HashSet::new();

    for element in &class.body.body {
        match element {
            ClassElement::PropertyDefinition(prop) => {
                let Some(prop_name) = extract_property_key(&prop.key) else {
                    continue;
                };

                if !prop.r#static {
                    let prop_name = prop_name.into_owned();
                    property_accessibilities
                        .insert(prop_name.clone(), (prop.accessibility, prop.readonly));
                    declared_properties.insert(prop_name);
                    continue;
                }

                // Extract `ngAcceptInputType_` fields so the TCB generator can emit
                // `typeof Class.ngAcceptInputType_prop` without TS ReflectionHost queries.
                if let Some(input_name) = prop_name.strip_prefix("ngAcceptInputType_") {
                    coerced_input_fields.push(input_name.to_string());
                    continue;
                }

                match prop_name.as_ref() {
                    "ɵcmp" => {
                        class_type = Some(ClassType::Component);
                        selector = extract_string_from_type_argument(&prop.type_annotation, 1);
                        inputs = extract_inputs_from_type(&prop.type_annotation);
                        outputs = extract_outputs_from_type(&prop.type_annotation);
                        export_as = extract_export_as_from_type(&prop.type_annotation);
                        ng_content_selectors =
                            extract_ng_content_selectors_from_type(&prop.type_annotation);
                        is_standalone = extract_standalone_from_type(&prop.type_annotation, 7);
                        host_directives = extract_host_directives_from_type(
                            &prop.type_annotation,
                            eval.import_map,
                            reference_id.file,
                        );
                    }
                    "ɵdir" => {
                        class_type = Some(ClassType::Directive);
                        selector = extract_string_from_type_argument(&prop.type_annotation, 1);
                        export_as = extract_export_as_from_type(&prop.type_annotation);
                        inputs = extract_inputs_from_type(&prop.type_annotation);
                        outputs = extract_outputs_from_type(&prop.type_annotation);
                        is_standalone = extract_standalone_from_type(&prop.type_annotation, 7);
                        host_directives = extract_host_directives_from_type(
                            &prop.type_annotation,
                            eval.import_map,
                            reference_id.file,
                        );
                    }
                    "ɵpipe" => {
                        class_type = Some(ClassType::Pipe);
                        pipe_name = extract_string_from_type_argument(&prop.type_annotation, 1);
                        is_standalone = extract_standalone_from_type(&prop.type_annotation, 2);
                    }
                    "ɵmod" => {
                        let decls_type = get_type_argument(&prop.type_annotation, 1);
                        let imports_type = get_type_argument(&prop.type_annotation, 2);
                        let exports_type = get_type_argument(&prop.type_annotation, 3);
                        ng_module_metadata = Some((exports_type, imports_type, decls_type));
                    }
                    _ => {}
                }
            }
            ClassElement::AccessorProperty(acc) if !acc.r#static => {
                if let Some(prop_name) = extract_property_key(&acc.key) {
                    declared_properties.insert(prop_name.into_owned());
                }
            }
            ClassElement::MethodDefinition(method) if !method.r#static => {
                if let Some(prop_name) = extract_property_key(&method.key) {
                    let prop_name = prop_name.into_owned();
                    property_accessibilities
                        .insert(prop_name.clone(), (method.accessibility, false));
                    declared_properties.insert(prop_name);
                }
            }
            _ => {}
        }
    }

    for input in &mut inputs {
        if let Some((accessibility, readonly)) = property_accessibilities.get(&input.name) {
            input.is_restricted = *accessibility == Some(TSAccessibility::Private)
                || *accessibility == Some(TSAccessibility::Protected)
                || *readonly;
        }
    }

    if let Some((exports_type, imports_type, decls_type)) = ng_module_metadata {
        let declarations = decls_type.and_then(|t| {
            if matches!(t, oxc_ast::ast::TSType::TSNeverKeyword(_)) {
                None
            } else {
                Some(Resolved::from_syntax(
                    evaluate_type(t, eval),
                    reference_id.file,
                ))
            }
        });
        let imports = imports_type.and_then(|t| {
            if matches!(t, oxc_ast::ast::TSType::TSNeverKeyword(_)) {
                None
            } else {
                Some(Resolved::from_syntax(
                    evaluate_type(t, eval),
                    reference_id.file,
                ))
            }
        });
        let exports = exports_type.and_then(|t| {
            if matches!(t, oxc_ast::ast::TSType::TSNeverKeyword(_)) {
                None
            } else {
                Some(Resolved::from_syntax(
                    evaluate_type(t, eval),
                    reference_id.file,
                ))
            }
        });

        let decorator = DecoratorData::NgModule(NgModuleData {
            declarations,
            imports,
            // A `.d.ts` module's imports come from the `ɵɵNgModuleDeclaration` type parameter,
            // not from a source `imports` array.
            parsed_imports: Vec::new(),
            injector_imports: None,
            injector_import_raws: None,
            top_level_imports: None,
            exports,
            bootstrap: None,
            providers_span: None,
            id_span: None,
            module_id_span: None,
            schemas: None,
            args_span: None,
            declarations_span: None,
            imports_span: None,
            exports_span: None,
            bootstrap_span: None,
            local_imports_element_spans: None,
            local_exports_element_spans: None,
            isolated_imports: None,
            isolated_exports: None,

            injectable: None,
            service: None,
            decorator_name: None,
        });

        let class_data = ClassData {
            reference_id,
            ng_decorator_spans: Vec::new(),
            decorator_removal_spans: Vec::new(),
            nocollapse_insertions: Vec::new(),
            span: class.span,
            decorated_span: class.span,
            name_span: Some(class.id.as_ref().map(|id| id.span).unwrap_or_default()),
            class_name: Some(class_name.clone()),
            constructor_params: None,
            unexpected_param_decorators: Vec::new(),
            member_decorators: Vec::new(),
            later_declaration_references: Vec::new(),
            type_parameters: None,
            has_ng_template_context_guard: false,
            ng_template_guards: Vec::new(),
            has_ng_field_directive: false,
            uses_inheritance,
            uses_on_changes: false,
            is_exported: true,
            has_non_exported_bounds: false,
            decorator,
            super_class: super_class.clone(),
            flattened_fields: None,
        };

        let exports_strings = exports_type.map(|t| extract_typeof_array(t));

        let registration = RegistrationInfo {
            reference_id,
            class_name,
            name_span: class_name_span(class, converter),
            class_type: ClassType::NgModule,
            selector: None,
            pipe_name: None,
            is_standalone: None,
            export_as: None,
            host_directives: None,
            fields: None,
            exports: exports_strings,
            schemas: None,
            type_parameters: None,
            has_ng_template_context_guard: false,
            ng_template_guards: Vec::new(),
            animation_trigger_names: None,
            has_ng_field_directive: false,
            is_structural: false,
            raw_imports: None,
            // NgModules declared outside the current compilation are assumed to contain providers, as it
            // would be a non-breaking change for a library to introduce providers at any point
            // (mirroring ngtsc DtsMetadataReader).
            may_declare_providers: true,
            super_class: super_class.clone(),
            ng_content_selectors: None,
            is_exported: true,
            has_non_exported_bounds: false,
        };

        return Some(DtsClassAnalysis {
            class: class_data,
            registration,
        });
    }

    if let Some(class_type) = class_type {
        let mut fields = Vec::new();
        let mut fields_metadata = Vec::new();

        for input in &inputs {
            let mut transform = None;
            if coerced_input_fields.contains(&input.name) {
                transform = Some(TransformData::Type {
                    type_span: oxc_span::Span::default(),
                    value_span: oxc_span::Span::default(),
                });
            }
            let is_declared = declared_properties.contains(&input.name);
            fields.push(AngularField::Input(InputData {
                name: input.name.clone(),
                alias: input.alias.clone(),
                required: input.required,
                is_signal: input.is_signal,
                decorator_span: None,
                property_span: is_declared.then_some(oxc_span::Span::default()),
                transform,
                is_restricted: input.is_restricted,
                is_literal: input.is_literal,
            }));

            let wire_transform = if coerced_input_fields.contains(&input.name) {
                Some(crate::TransformMetadata {
                    kind: "type".to_string(),
                    span: SpanMetadata::default(),
                    type_span: None,
                })
            } else {
                None
            };
            fields_metadata.push(crate::AngularFieldMetadata {
                kind: "input".to_string(),
                input: Some(InputMetadata {
                    name: input.name.clone(),
                    alias: input.alias.clone(),
                    required: input.required,
                    is_signal: input.is_signal,
                    is_restricted: input.is_restricted,
                    is_literal: input.is_literal,
                    is_coerced: coerced_input_fields.contains(&input.name),
                    transform: wire_transform,
                    decorator_span: None,
                    property_span: is_declared.then(SpanMetadata::default),
                }),
                output: None,
                query: None,
                coercion: None,
            });
        }

        for output in &outputs {
            fields.push(AngularField::Output(OutputData {
                name: output.name.clone(),
                alias: output.alias.clone(),
                decorator_span: None,
                property_span: None,
                is_signal: false,
            }));
            fields_metadata.push(crate::AngularFieldMetadata {
                kind: "output".to_string(),
                input: None,
                output: Some(output.clone()),
                query: None,
                coercion: None,
            });
        }

        // The declaration file already lists the names; rejoin them into the string form the
        // decorator field takes, which splits back to exactly these names.
        let export_as_resolved = export_as.as_ref().map(|names| {
            Resolved::from_syntax(ResolvedValue::String(names.join(",")), reference_id.file)
        });
        let decorator = match class_type {
            ClassType::Component => DecoratorData::Component(ComponentData {
                directive: DirectiveData {
                    selector: selector.clone().map(|s| {
                        Resolved::from_syntax(ResolvedValue::String(s), reference_id.file)
                    }),
                    standalone: is_standalone.unwrap_or(true),
                    is_structural: false,
                    export_as: export_as_resolved.clone(),
                    fields,
                    host_directives: host_directives.clone().map(|dirs| {
                        Resolved::from_syntax(
                            host_directives_to_resolved_value(dirs),
                            reference_id.file,
                        )
                    }),
                    ..Default::default()
                },
                ng_content_selectors: ng_content_selectors.clone(),
                ..Default::default()
            }),
            ClassType::Directive => DecoratorData::Directive(DirectiveData {
                selector: selector
                    .clone()
                    .map(|s| Resolved::from_syntax(ResolvedValue::String(s), reference_id.file)),
                standalone: is_standalone.unwrap_or(true),
                is_structural: false,
                export_as: export_as_resolved.clone(),
                fields,
                host_directives: host_directives.clone().map(|dirs| {
                    Resolved::from_syntax(
                        host_directives_to_resolved_value(dirs),
                        reference_id.file,
                    )
                }),
                ..Default::default()
            }),
            ClassType::Pipe => DecoratorData::Pipe(PipeData {
                name: pipe_name
                    .clone()
                    .map(|n| Resolved::from_syntax(ResolvedValue::String(n), reference_id.file)),
                standalone: is_standalone,
                ..Default::default()
            }),
            _ => unreachable!(),
        };

        let has_non_exported_bounds = raw_type_parameters
            .as_ref()
            .is_some_and(|extracted| extracted.has_non_exported_bounds);

        let class_data = ClassData {
            reference_id,
            ng_decorator_spans: Vec::new(),
            decorator_removal_spans: Vec::new(),
            nocollapse_insertions: Vec::new(),
            span: class.span,
            decorated_span: class.span,
            name_span: Some(class.id.as_ref().map(|id| id.span).unwrap_or_default()),
            class_name: Some(class_name.clone()),
            constructor_params: None,
            unexpected_param_decorators: Vec::new(),
            member_decorators: Vec::new(),
            later_declaration_references: Vec::new(),
            type_parameters: raw_type_parameters.map(|extracted| extracted.params),
            has_ng_template_context_guard,
            ng_template_guards: ng_template_guards.clone(),
            has_ng_field_directive,
            uses_inheritance,
            uses_on_changes: false,
            is_exported: true,
            has_non_exported_bounds,
            decorator,
            super_class: super_class.clone(),
            flattened_fields: None,
        };

        let registration = RegistrationInfo {
            reference_id,
            class_name,
            name_span: class_name_span(class, converter),
            class_type,
            selector,
            pipe_name,
            is_standalone,
            export_as,
            host_directives,
            fields: if fields_metadata.is_empty() {
                None
            } else {
                Some(fields_metadata)
            },
            exports: None,
            schemas: None,
            type_parameters,
            has_ng_template_context_guard,
            ng_template_guards,
            animation_trigger_names: None,
            has_ng_field_directive: false,
            is_structural: false,
            raw_imports: None,
            // A `.d.ts` carries no decorator literal, so no `providers` to read.
            may_declare_providers: false,
            super_class,
            ng_content_selectors: if class_type == ClassType::Component {
                ng_content_selectors
            } else {
                None
            },
            is_exported: true,
            has_non_exported_bounds,
        };

        return Some(DtsClassAnalysis {
            class: class_data,
            registration,
        });
    }

    None
}

fn get_type_argument<'a>(
    type_ann: &'a Option<oxc_allocator::Box<TSTypeAnnotation<'a>>>,
    index: usize,
) -> Option<&'a TSType<'a>> {
    let type_ann = type_ann.as_ref()?;
    let TSType::TSTypeReference(type_ref) = &type_ann.type_annotation else {
        return None;
    };
    let Some(params) = &type_ref.type_arguments else {
        return None;
    };
    params.params.get(index)
}

/// Extract selector (position 1) from: i0.ɵɵDirectiveDeclaration<T, "[selector]", ...>
fn extract_string_from_type_argument(
    type_ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
    index: usize,
) -> Option<String> {
    let Some(TSType::TSLiteralType(lit)) = get_type_argument(type_ann, index) else {
        return None;
    };
    let TSLiteral::StringLiteral(s) = &lit.literal else {
        return None;
    };
    Some(s.value.to_string())
}

/// Extract ngContentSelectors from position 7 (index 6) of: i0.ɵɵComponentDeclaration<T, "[selector]", ..., NgContentSelectors, ...>
/// https://github.com/angular/angular/blob/b918bed/packages/core/src/render3/interfaces/public_definitions.ts#L49
fn extract_ng_content_selectors_from_type(
    type_ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
) -> Option<Vec<String>> {
    let Some(TSType::TSTupleType(tuple)) = get_type_argument(type_ann, 6) else {
        return None;
    };
    let mut selectors = Vec::new();
    for element in &tuple.element_types {
        let TSTupleElement::TSLiteralType(lit) = element else {
            continue;
        };
        let TSLiteral::StringLiteral(s) = &lit.literal else {
            continue;
        };
        selectors.push(s.value.to_string());
    }
    if !selectors.is_empty() {
        return Some(selectors);
    }
    None
}

/// Extract exportAs from position 3 (index 2) of: i0.ɵɵComponentDeclaration<T, "[selector]", ["exportAs"], ...>
fn extract_export_as_from_type(
    type_ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
) -> Option<Vec<String>> {
    let Some(TSType::TSTupleType(tuple)) = get_type_argument(type_ann, 2) else {
        return None;
    };
    let mut exports = Vec::new();
    for element in &tuple.element_types {
        let TSTupleElement::TSLiteralType(lit) = element else {
            continue;
        };
        let TSLiteral::StringLiteral(s) = &lit.literal else {
            continue;
        };
        exports.push(s.value.to_string());
    }
    if !exports.is_empty() {
        return Some(exports);
    }
    None
}

fn extract_inputs_from_type(
    type_ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
) -> Vec<InputMetadata> {
    if let Some(ts_type) = get_type_argument(type_ann, 3) {
        return extract_inputs_map(ts_type);
    }
    Vec::new()
}

fn extract_inputs_map(ts_type: &TSType) -> Vec<InputMetadata> {
    let mut inputs = Vec::new();

    // In .d.ts, an object literal type is represented as a TSTypeLiteral
    let TSType::TSTypeLiteral(literal) = ts_type else {
        return inputs;
    };

    for member in &literal.members {
        let TSSignature::TSPropertySignature(prop) = member else {
            continue;
        };
        let class_property_name = match extract_property_key(&prop.key) {
            Some(name) => name.into_owned(),
            None => continue,
        };

        let mut binding_property_name = class_property_name.clone();
        let mut required = false;
        let mut is_signal = false;

        // Value can be a string literal (alias) or object literal (alias, required, isSignal)
        if let Some(type_ann) = &prop.type_annotation {
            if let TSType::TSLiteralType(lit_type) = &type_ann.type_annotation {
                if let TSLiteral::StringLiteral(s) = &lit_type.literal {
                    binding_property_name = s.value.to_string();
                }
            } else if let TSType::TSTypeLiteral(obj_type) = &type_ann.type_annotation {
                // { alias: "aliasName", required: true, isSignal: true }
                for obj_member in &obj_type.members {
                    if let TSSignature::TSPropertySignature(inner_prop) = obj_member {
                        let inner_key =
                            match extract_property_key(&inner_prop.key).map(|n| n.into_owned()) {
                                Some(inner_key) => inner_key,
                                None => continue,
                            };

                        match inner_key.as_str() {
                            "alias" => {
                                if let Some(inner_ann) = &inner_prop.type_annotation {
                                    if let TSType::TSLiteralType(inner_lit_type) =
                                        &inner_ann.type_annotation
                                    {
                                        if let TSLiteral::StringLiteral(s) = &inner_lit_type.literal
                                        {
                                            binding_property_name = s.value.to_string();
                                        }
                                    }
                                }
                            }
                            "required" => {
                                if let Some(inner_ann) = &inner_prop.type_annotation {
                                    if let TSType::TSLiteralType(inner_lit_type) =
                                        &inner_ann.type_annotation
                                    {
                                        if let TSLiteral::BooleanLiteral(b) =
                                            &inner_lit_type.literal
                                        {
                                            required = b.value;
                                        }
                                    }
                                }
                            }
                            "isSignal" => {
                                if let Some(inner_ann) = &inner_prop.type_annotation {
                                    if let TSType::TSLiteralType(inner_lit_type) =
                                        &inner_ann.type_annotation
                                    {
                                        if let TSLiteral::BooleanLiteral(b) =
                                            &inner_lit_type.literal
                                        {
                                            is_signal = b.value;
                                        }
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
        }

        let alias = if binding_property_name != class_property_name {
            Some(binding_property_name)
        } else {
            None
        };

        inputs.push(InputMetadata {
            name: class_property_name,
            alias,
            required,
            is_signal,
            decorator_span: None,
            property_span: None,
            transform: None,
            is_restricted: false,
            is_literal: false,
            is_coerced: false,
        });
    }

    inputs
}

fn extract_outputs_from_type(
    type_ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
) -> Vec<OutputMetadata> {
    if let Some(ts_type) = get_type_argument(type_ann, 4) {
        return extract_outputs_map(ts_type);
    }
    Vec::new()
}

fn extract_outputs_map(ts_type: &TSType) -> Vec<OutputMetadata> {
    let mut outputs = Vec::new();

    if let TSType::TSTypeLiteral(literal) = ts_type {
        for member in &literal.members {
            if let TSSignature::TSPropertySignature(prop) = member {
                let class_property_name =
                    match extract_property_key(&prop.key).map(|n| n.into_owned()) {
                        Some(class_property_name) => class_property_name,
                        None => continue,
                    };

                let mut binding_property_name = class_property_name.clone();

                if let Some(type_ann) = &prop.type_annotation {
                    if let TSType::TSLiteralType(lit_type) = &type_ann.type_annotation {
                        if let TSLiteral::StringLiteral(s) = &lit_type.literal {
                            binding_property_name = s.value.to_string();
                        }
                    }
                }

                let alias = if binding_property_name != class_property_name {
                    Some(binding_property_name)
                } else {
                    None
                };

                outputs.push(OutputMetadata {
                    name: class_property_name,
                    alias,
                    decorator_span: None,
                    property_span: None,
                    is_signal: false,
                });
            }
        }
    }

    outputs
}

fn extract_typeof_array(ts_type: &TSType) -> Vec<String> {
    let mut names = Vec::new();

    if let TSType::TSTupleType(tuple) = ts_type {
        for element in &tuple.element_types {
            if let TSTupleElement::TSTypeQuery(query) = element {
                match &query.expr_name {
                    TSTypeQueryExprName::IdentifierReference(id) => {
                        names.push(id.name.to_string());
                    }
                    TSTypeQueryExprName::QualifiedName(qualified) => {
                        names.push(qualified.right.name.to_string());
                    }
                    _ => {}
                }
            }
        }
    }
    names
}

/// Extract isStandalone from generic arguments of ɵɵDirectiveDeclaration (7), ɵɵComponentDeclaration (7), or ɵɵPipeDeclaration (2)
fn extract_standalone_from_type(
    type_ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
    index: usize,
) -> Option<bool> {
    let Some(TSType::TSLiteralType(lit)) = get_type_argument(type_ann, index) else {
        return None;
    };
    let TSLiteral::BooleanLiteral(b) = &lit.literal else {
        return None;
    };
    Some(b.value)
}

fn tuple_element_as_ts_type<'a>(elem: &'a TSTupleElement<'a>) -> Option<&'a TSType<'a>> {
    match elem {
        TSTupleElement::TSNamedTupleMember(member) => {
            tuple_element_as_ts_type(&member.element_type)
        }
        _ => elem.as_ts_type(),
    }
}

fn extract_string_literal_from_type_annotation(
    ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
) -> Option<String> {
    let ann = ann.as_ref()?;
    let TSType::TSLiteralType(lit_type) = &ann.type_annotation else {
        return None;
    };
    let TSLiteral::StringLiteral(s) = &lit_type.literal else {
        return None;
    };
    Some(s.value.to_string())
}

fn extract_directive_name_and_specifier(
    ts_type: &TSType,
    import_map: &std::collections::HashMap<String, crate::analyzer::ImportedSymbol>,
) -> Option<(String, Option<String>, bool)> {
    let (name, leftmost_id, is_qualified) = match ts_type {
        TSType::TSTypeQuery(query) => match &query.expr_name {
            TSTypeQueryExprName::IdentifierReference(id) => {
                (id.name.as_str(), Some(id.name.as_str()), false)
            }
            TSTypeQueryExprName::QualifiedName(qualified) => (
                qualified.right.name.as_str(),
                super::utils::get_leftmost_identifier_in_qualified(qualified)
                    .map(|id| id.name.as_str()),
                true,
            ),
            _ => return None,
        },
        TSType::TSTypeReference(ty_ref) => match &ty_ref.type_name {
            TSTypeName::IdentifierReference(id) => {
                (id.name.as_str(), Some(id.name.as_str()), false)
            }
            TSTypeName::QualifiedName(qualified) => (
                qualified.right.name.as_str(),
                super::utils::get_leftmost_identifier_in_qualified(qualified)
                    .map(|id| id.name.as_str()),
                true,
            ),
            _ => return None,
        },
        _ => return None,
    };

    let specifier = leftmost_id
        .and_then(|id| import_map.get(id))
        .map(|sym| sym.source.clone());
    Some((name.to_string(), specifier, is_qualified))
}

fn extract_host_directive_bindings(ts_type: &TSType) -> Option<Vec<HostDirectiveBinding>> {
    let TSType::TSTypeLiteral(literal) = ts_type else {
        return None;
    };
    let mut bindings = Vec::new();

    for member in &literal.members {
        let TSSignature::TSPropertySignature(prop) = member else {
            continue;
        };
        let Some(public_name) = extract_property_key(&prop.key) else {
            continue;
        };
        let binding_name = extract_string_literal_from_type_annotation(&prop.type_annotation)
            .unwrap_or_else(|| public_name.to_string());

        bindings.push(HostDirectiveBinding {
            public_name: public_name.into_owned(),
            binding_name,
        });
    }

    (!bindings.is_empty()).then_some(bindings)
}

/// Extract hostDirectives from position 9 (index 8) of:
/// i0.ɵɵDirectiveDeclaration<T, "[selector]", ..., HostDirectives, ...>
/// i0.ɵɵComponentDeclaration<T, "[selector]", ..., HostDirectives, ...>
fn extract_host_directives_from_type(
    type_ann: &Option<oxc_allocator::Box<TSTypeAnnotation>>,
    import_map: &std::collections::HashMap<String, crate::analyzer::ImportedSymbol>,
    file_id: FileId,
) -> Option<Vec<HostDirectiveEntry>> {
    let ts_type = get_type_argument(type_ann, 8)?;
    let TSType::TSTupleType(tuple) = ts_type else {
        return None;
    };
    if tuple.element_types.is_empty() {
        return None;
    }

    let mut host_directives = Vec::new();

    for elem in &tuple.element_types {
        let Some(elem_type) = tuple_element_as_ts_type(elem) else {
            continue;
        };
        let TSType::TSTypeLiteral(literal) = elem_type else {
            continue;
        };

        let mut directive_info = None;
        let mut inputs = None;
        let mut outputs = None;

        for member in &literal.members {
            let TSSignature::TSPropertySignature(prop) = member else {
                continue;
            };
            let Some(prop_name) = extract_property_key(&prop.key) else {
                continue;
            };
            let Some(ann) = &prop.type_annotation else {
                continue;
            };

            match prop_name.as_ref() {
                "directive" => {
                    directive_info =
                        extract_directive_name_and_specifier(&ann.type_annotation, import_map);
                }
                "inputs" => {
                    inputs = extract_host_directive_bindings(&ann.type_annotation);
                }
                "outputs" => {
                    outputs = extract_host_directive_bindings(&ann.type_annotation);
                }
                _ => {}
            }
        }

        let Some((directive, module_specifier, is_qualified)) = directive_info else {
            continue;
        };

        let mut aliases = std::collections::HashMap::new();
        if !is_qualified {
            aliases.insert(file_id, directive.clone());
        }

        let directive_ref = Reference {
            file: file_id,
            name: directive.clone(),
            owning_reference: module_specifier
                .map(|specifier| OwningReference::from_source_specifier(specifier, directive)),
            aliases,
            is_default_export: false,
        };

        host_directives.push(HostDirectiveEntry {
            directive: directive_ref,
            inputs,
            outputs,
            is_forward_ref: false,
        });
    }

    (!host_directives.is_empty()).then_some(host_directives)
}

fn host_directives_to_resolved_value(directives: Vec<HostDirectiveEntry>) -> ResolvedValue {
    let items = directives
        .into_iter()
        .map(|entry| {
            let mut map = crate::evaluator::ValueMap::new();
            let directive_val = if let Some(owning) = entry.directive.owning_reference {
                let local_name = entry.directive.aliases.get(&entry.directive.file).cloned();
                let is_namespace_member = local_name.is_none();
                ResolvedValue::incomplete(
                    entry.directive.file,
                    oxc_span::Span::default(),
                    None,
                    crate::evaluator::IncompleteDep::Reference(
                        crate::evaluator::value::UnresolvedReference {
                            importer: entry.directive.file,
                            specifier: owning.specifier().to_string(),
                            symbol: crate::analyzer::ImportKind::Named(
                                owning.export_name().to_string(),
                            ),
                            local_name,
                            is_namespace_member,
                        },
                    ),
                )
            } else {
                let val_ref = crate::evaluator::ValueReference {
                    file: entry.directive.file,
                    name: entry.directive.name.clone(),
                    member: None,
                    reference_id: None,
                    span: oxc_span::Span::default(),
                    kind: crate::evaluator::DeclKind::Class,
                    owning_reference: None,
                    synthetic: entry.is_forward_ref,
                    aliases: entry.directive.aliases.into_iter().collect(),
                    is_default_export: entry.directive.is_default_export,
                };
                ResolvedValue::Reference(val_ref)
            };
            map.insert("directive".to_string(), directive_val);
            if let Some(inputs) = entry.inputs {
                let input_items = inputs
                    .into_iter()
                    .map(|b| {
                        let s = if b.public_name == b.binding_name {
                            b.public_name
                        } else {
                            format!("{}: {}", b.public_name, b.binding_name)
                        };
                        ResolvedValue::String(s)
                    })
                    .collect();
                map.insert("inputs".to_string(), ResolvedValue::Array(input_items));
            }
            if let Some(outputs) = entry.outputs {
                let output_items = outputs
                    .into_iter()
                    .map(|b| {
                        let s = if b.public_name == b.binding_name {
                            b.public_name
                        } else {
                            format!("{}: {}", b.public_name, b.binding_name)
                        };
                        ResolvedValue::String(s)
                    })
                    .collect();
                map.insert("outputs".to_string(), ResolvedValue::Array(output_items));
            }
            ResolvedValue::Map(map)
        })
        .collect();
    ResolvedValue::Array(items)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::evaluator::{ImportKind, IncompleteDep};
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    fn run_analyze_dts(source_text: &str) -> DtsAnalysisResult {
        let allocator = Allocator::default();
        let source_type = SourceType::d_ts();
        let ret = Parser::new(&allocator, source_text, source_type).parse();
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program)
            .semantic;
        let converter = Utf8ToUtf16::new(source_text);
        analyze_dts(
            &ret.program,
            source_text,
            0,
            &ret.module_record,
            &semantic,
            &converter,
        )
    }

    #[test]
    fn test_directive_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class NgIf {
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgIf, "[ngIf]", ["ngIf"], {}, {}, never, never, true, never>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let class = &result.classes[0];
        assert_eq!(class.class_name.as_deref(), Some("NgIf"));
        let DecoratorData::Directive(dir) = &class.decorator else {
            panic!("expected Directive")
        };
        assert_eq!(
            dir.selector.as_ref().unwrap().raw(),
            &ResolvedValue::String("[ngIf]".to_string())
        );
        assert_eq!(dir.export_as_names(), Some(vec!["ngIf".to_string()]));
        assert!(dir.standalone);
    }

    #[test]
    fn test_component_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-comp", never, {}, {}, never, never, true, never>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let class = &result.classes[0];
        assert_eq!(class.class_name.as_deref(), Some("MyComponent"));
        let DecoratorData::Component(comp) = &class.decorator else {
            panic!("expected Component")
        };
        assert_eq!(
            comp.directive.selector.as_ref().unwrap().raw(),
            &ResolvedValue::String("my-comp".to_string())
        );
        assert!(comp.directive.standalone);
    }

    #[test]
    fn test_component_with_ng_content_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class AppComponent {
    static ɵcmp: i0.ɵɵComponentDeclaration<AppComponent, "app-root", never, {}, {}, never, ["*"], true, never>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let class = &result.classes[0];
        assert_eq!(class.class_name.as_deref(), Some("AppComponent"));
        let DecoratorData::Component(comp) = &class.decorator else {
            panic!("expected Component")
        };
        assert_eq!(
            comp.directive.selector.as_ref().unwrap().raw(),
            &ResolvedValue::String("app-root".to_string())
        );
        assert_eq!(
            comp.ng_content_selectors.as_ref(),
            Some(&vec!["*".to_string()])
        );
    }

    #[test]
    fn test_reexports_extraction() {
        let source = r#"
export { NgIf, NgFor } from './directives';
export * from './pipes';
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 0);
        assert_eq!(result.exports.named.len(), 2);
        assert_eq!(result.exports.named[0].exported_name, "NgIf");
        assert_eq!(result.exports.named[0].source, "./directives");
        assert_eq!(result.exports.wildcards.len(), 1);
        assert_eq!(result.exports.wildcards[0].source, "./pipes");
    }

    #[test]
    fn test_ngmodule_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
declare class NgIf {
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgIf, "[ngIf]", never, {}, {}, never>;
}
export declare class CommonModule {
    static ɵmod: i0.ɵɵNgModuleDeclaration<CommonModule, [typeof NgIf], never, [typeof NgIf]>;
}
"#;
        let result = run_analyze_dts(source);
        // NgIf is also in classes (1 class + 1 module = 2 classes)
        assert_eq!(result.classes.len(), 2);

        let module_class = result
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some("CommonModule"))
            .unwrap();
        let DecoratorData::NgModule(module_meta) = &module_class.decorator else {
            panic!("expected NgModule")
        };

        let ResolvedValue::Array(exports) = module_meta.exports.as_ref().unwrap().raw() else {
            panic!()
        };
        assert_eq!(exports.len(), 1);
        let ResolvedValue::Reference(unref) = &exports[0] else {
            panic!()
        };
        assert_eq!(unref.name, "NgIf");
    }

    #[test]
    fn test_ngmodule_extraction_qualified() {
        let source = r#"
import * as i0 from "@angular/core";
import * as i1 from "./directives";
export declare class CommonModule {
    static ɵmod: i0.ɵɵNgModuleDeclaration<CommonModule, [typeof i1.NgIf], never, [typeof i1.NgIf]>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let module_class = &result.classes[0];
        let DecoratorData::NgModule(module_meta) = &module_class.decorator else {
            panic!("expected NgModule")
        };

        let ResolvedValue::Array(exports) = module_meta.exports.as_ref().unwrap().raw() else {
            panic!()
        };
        assert_eq!(exports.len(), 1);
        let ResolvedValue::Incomplete(hole) = &exports[0] else {
            panic!()
        };
        let IncompleteDep::Reference(unref) = &hole.dep else {
            panic!()
        };
        let ImportKind::Named(name) = &unref.symbol else {
            panic!()
        };
        assert_eq!(name, "NgIf");
    }

    #[test]
    fn test_complex_input_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class TestDir {
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {
        "simple": "simple";
        "aliased": "alias";
        "requiredInput": { "alias": "requiredAlias", "required": true };
        "signalInput": { "alias": "signalAlias", "isSignal": true };
        "complex": { "alias": "complexAlias", "required": true, "isSignal": true };
    }, {}, never, never, true, never>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let DecoratorData::Directive(dir) = &result.classes[0].decorator else {
            panic!()
        };

        let simple = dir
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Input(i) if i.name == "simple" => Some(i),
                _ => None,
            })
            .unwrap();
        assert_eq!(simple.alias, None);
        assert!(!simple.required);
        assert!(!simple.is_signal);

        let aliased = dir
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Input(i) if i.name == "aliased" => Some(i),
                _ => None,
            })
            .unwrap();
        assert_eq!(aliased.alias.as_deref(), Some("alias"));

        let required = dir
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Input(i) if i.name == "requiredInput" => Some(i),
                _ => None,
            })
            .unwrap();
        assert!(required.required);

        let signal = dir
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Input(i) if i.name == "signalInput" => Some(i),
                _ => None,
            })
            .unwrap();
        assert!(signal.is_signal);
    }

    #[test]
    fn test_output_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class TestDir {
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {}, {
        "simple": "simple";
        "aliased": "alias";
    }, never, never, true, never>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let DecoratorData::Directive(dir) = &result.classes[0].decorator else {
            panic!()
        };

        let simple = dir
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Output(o) if o.name == "simple" => Some(o),
                _ => None,
            })
            .unwrap();
        assert_eq!(simple.alias, None);

        let aliased = dir
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Output(o) if o.name == "aliased" => Some(o),
                _ => None,
            })
            .unwrap();
        assert_eq!(aliased.alias.as_deref(), Some("alias"));
    }

    #[test]
    fn test_pipe_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class MyPipe {
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", true>;
}
export declare class DefaultPipe {
    static ɵpipe: i0.ɵɵPipeDeclaration<DefaultPipe, "default", false>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 2);

        let pipe1 = &result.classes[0];
        assert_eq!(pipe1.class_name.as_deref(), Some("MyPipe"));
        let DecoratorData::Pipe(p1) = &pipe1.decorator else {
            panic!()
        };
        assert_eq!(
            p1.name.as_ref().and_then(Resolved::get_optional).as_deref(),
            Some("myPipe")
        );
        assert_eq!(p1.standalone, Some(true));

        let pipe2 = &result.classes[1];
        assert_eq!(pipe2.class_name.as_deref(), Some("DefaultPipe"));
        let DecoratorData::Pipe(p2) = &pipe2.decorator else {
            panic!()
        };
        assert_eq!(
            p2.name.as_ref().and_then(Resolved::get_optional).as_deref(),
            Some("default")
        );
        assert_eq!(p2.standalone, Some(false));
    }

    #[test]
    fn test_input_with_transform_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class TestDir {
    width: number;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, "[test]", never, {
        "width": "width";
    }, {}, never, never, true, never>;
    static ngAcceptInputType_width: string | number;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let DecoratorData::Directive(dir) = &result.classes[0].decorator else {
            panic!()
        };

        let width = dir
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Input(i) if i.name == "width" => Some(i),
                _ => None,
            })
            .unwrap();
        assert!(width.transform.is_some());
    }

    #[test]
    fn test_undeclared_mixin_input_property_span() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class MatButton {
    disableRipple: boolean;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatButton, "button[mat-button]", never, {
        "disabled": "disabled";
        "disableRipple": "disableRipple";
    }, {}, never, never, true, never>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.classes.len(), 1);
        let DecoratorData::Component(cmp) = &result.classes[0].decorator else {
            panic!()
        };

        let disabled = cmp
            .directive
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Input(i) if i.name == "disabled" => Some(i),
                _ => None,
            })
            .unwrap();
        assert!(disabled.property_span.is_none());

        let disable_ripple = cmp
            .directive
            .fields
            .iter()
            .find_map(|f| match f {
                AngularField::Input(i) if i.name == "disableRipple" => Some(i),
                _ => None,
            })
            .unwrap();
        assert!(disable_ripple.property_span.is_some());

        let reg = &result.registrations[0];
        let reg_fields = reg.fields.as_ref().unwrap();
        let reg_disabled = reg_fields
            .iter()
            .find_map(|f| f.input.as_ref().filter(|i| i.name == "disabled"))
            .unwrap();
        assert!(reg_disabled.property_span.is_none());

        let reg_disable_ripple = reg_fields
            .iter()
            .find_map(|f| f.input.as_ref().filter(|i| i.name == "disableRipple"))
            .unwrap();
        assert!(reg_disable_ripple.property_span.is_some());
    }

    #[test]
    fn test_dts_ngmodule_may_declare_providers() {
        let source = r#"
import * as i0 from "@angular/core";
export declare class MockModule {
    static ɵmod: i0.ɵɵNgModuleDeclaration<MockModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MockModule>;
}
"#;
        let result = run_analyze_dts(source);
        assert_eq!(result.registrations.len(), 1);
        assert!(result.registrations[0].may_declare_providers);
    }

    #[test]
    fn test_directive_with_host_directives_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
declare class DisableHostDirective {}
export declare class CmMatInput {
    static ɵdir: i0.ɵɵDirectiveDeclaration<CmMatInput, "input[matInput]", never, {}, {}, never, never, false, [{
        directive: typeof DisableHostDirective;
        inputs: {
            'cfcDisabled': 'disabled';
        };
        outputs: {
            'cfcDisabledChange': 'disabledChange';
        };
    }]>;
}
"#;
        let result = run_analyze_dts(source);
        let class = result
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some("CmMatInput"))
            .expect("CmMatInput class");
        let DecoratorData::Directive(dir) = &class.decorator else {
            panic!("expected Directive");
        };
        let host_dirs = dir
            .host_directives
            .as_ref()
            .and_then(Resolved::get_optional)
            .expect("host directives");
        assert_eq!(host_dirs.len(), 1);
        assert_eq!(host_dirs[0].directive.name, "DisableHostDirective");
        let inputs = host_dirs[0].inputs.as_ref().expect("inputs");
        assert_eq!(inputs.len(), 1);
        assert_eq!(inputs[0].public_name, "cfcDisabled");
        assert_eq!(inputs[0].binding_name, "disabled");
        let outputs = host_dirs[0].outputs.as_ref().expect("outputs");
        assert_eq!(outputs.len(), 1);
        assert_eq!(outputs[0].public_name, "cfcDisabledChange");
        assert_eq!(outputs[0].binding_name, "disabledChange");

        let reg = result
            .registrations
            .iter()
            .find(|r| r.class_name == "CmMatInput")
            .expect("CmMatInput registration");
        let reg_host_dirs = reg.host_directives.as_ref().expect("reg host directives");
        assert_eq!(reg_host_dirs.len(), 1);
        assert_eq!(reg_host_dirs[0].directive.name, "DisableHostDirective");
    }

    #[test]
    fn test_component_with_host_directives_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
declare class CustomTooltipDirective {}
export declare class CustomButton {
    static ɵcmp: i0.ɵɵComponentDeclaration<CustomButton, "custom-button", never, {}, {}, never, never, true, [{
        directive: typeof CustomTooltipDirective;
        inputs: {
            'tooltipText': 'tooltip';
        };
        outputs: {};
    }]>;
}
"#;
        let result = run_analyze_dts(source);
        let class = result
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some("CustomButton"))
            .expect("CustomButton class");
        let DecoratorData::Component(comp) = &class.decorator else {
            panic!("expected Component");
        };
        let host_dirs = comp
            .directive
            .host_directives
            .as_ref()
            .and_then(Resolved::get_optional)
            .expect("host directives");
        assert_eq!(host_dirs.len(), 1);
        assert_eq!(host_dirs[0].directive.name, "CustomTooltipDirective");
        let inputs = host_dirs[0].inputs.as_ref().expect("inputs");
        assert_eq!(inputs.len(), 1);
        assert_eq!(inputs[0].public_name, "tooltipText");
        assert_eq!(inputs[0].binding_name, "tooltip");
        assert!(host_dirs[0].outputs.is_none());

        let reg = result
            .registrations
            .iter()
            .find(|r| r.class_name == "CustomButton")
            .expect("CustomButton registration");
        let reg_host_dirs = reg.host_directives.as_ref().expect("reg host directives");
        assert_eq!(reg_host_dirs.len(), 1);
        assert_eq!(reg_host_dirs[0].directive.name, "CustomTooltipDirective");
    }

    #[test]
    fn test_directive_with_qualified_host_directives_extraction() {
        let source = r#"
import * as i0 from "@angular/core";
import * as i1 from "./host_dir";
export declare class CmMatInput {
    static ɵdir: i0.ɵɵDirectiveDeclaration<CmMatInput, "input[matInput]", never, {}, {}, never, never, false, [{
        directive: typeof i1.DisableHostDirective;
        inputs: {
            'cfcDisabled': 'disabled';
        };
        outputs: {
            'cfcDisabledChange': 'disabledChange';
        };
    }]>;
}
"#;
        let result = run_analyze_dts(source);
        let class = result
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some("CmMatInput"))
            .expect("CmMatInput class");
        let DecoratorData::Directive(dir) = &class.decorator else {
            panic!("expected Directive");
        };
        let host_dirs = dir
            .host_directives
            .as_ref()
            .and_then(Resolved::get_optional)
            .expect("host directives");
        assert_eq!(host_dirs.len(), 1);
        assert_eq!(host_dirs[0].directive.name, "DisableHostDirective");
        assert_eq!(
            host_dirs[0]
                .directive
                .owning_reference
                .as_ref()
                .map(|o| o.specifier()),
            Some("./host_dir")
        );
        assert!(!host_dirs[0].directive.is_in_scope_of(0));
        let inputs = host_dirs[0].inputs.as_ref().expect("inputs");
        assert_eq!(inputs.len(), 1);
        assert_eq!(inputs[0].public_name, "cfcDisabled");
        assert_eq!(inputs[0].binding_name, "disabled");
        let outputs = host_dirs[0].outputs.as_ref().expect("outputs");
        assert_eq!(outputs.len(), 1);
        assert_eq!(outputs[0].public_name, "cfcDisabledChange");
        assert_eq!(outputs[0].binding_name, "disabledChange");
    }
}
