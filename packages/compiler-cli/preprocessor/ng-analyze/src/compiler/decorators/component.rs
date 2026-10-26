use crate::analyzer::{
    flatten_class_info, resolve_declaration_async, ComponentData, DirectiveData,
};
use crate::query::{QueryCtx, ReferenceId};
use crate::types::analysis::{DeclarationData, OwningReference};
use crate::ResourceResolverFs;
use crate::{types::analysis::ResolvedHostDirective, ClassType, DeclarationTuple};
use std::path::Path;

/// Project a resolved declaration into `consumer`'s file frame.
///
/// Scope entries are shared across consumers, so `ref_meta` and generic type parameter specifiers
/// must be recomputed per consumer. `reference.aliases` records only files that bind the symbol,
/// so a consumer with an entry names it directly and one without emits an import.
///
/// Never invent an identifier: a name that isn't a real binding emits a dangling reference (the
/// bug in the old generated-alias scheme once the emitter moved to namespace imports).
async fn contextualize_declaration<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    decl: &DeclarationData,
    consumer: crate::query::FileId,
    file_path: &Path,
) -> DeclarationData {
    let mut contextual = decl.clone();
    let mut ref_meta = project_reference(ctx, &decl.reference, consumer, file_path).await;
    if decl.reference.file == consumer && (!decl.is_exported || decl.has_non_exported_bounds) {
        ref_meta.typecheck_import = None;
    }
    contextual.ref_meta = ref_meta;

    // Rebase relative specifiers in generic type parameter bounds from the declaring file to the
    // consumer file (or to workspace-prefixed paths under `PrefixImportStrategy`).
    if let Some(type_parameters) = &mut contextual.type_parameters {
        let declaring_path = ctx.engine.lookup_path(decl.reference.file);
        for param in type_parameters {
            param.resolve_specifiers(
                ctx.engine.reference_strategy.as_ref(),
                &declaring_path,
                file_path,
            );
        }
    }

    contextual
}

/// Project one reference into `consumer`'s frame.
async fn project_reference<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    reference: &crate::types::analysis::Reference,
    consumer: crate::query::FileId,
    consumer_path: &Path,
) -> crate::types::metadata::ReferenceMetadata {
    let target_path = ctx.engine.lookup_path(reference.file);
    let declaring_export_name = ctx.declaring_export_name(reference).await;
    ctx.engine.reference_strategy.emit(
        reference,
        consumer,
        consumer_path,
        &target_path,
        declaring_export_name.as_deref(),
    )
}

/// Resolve `class_info`'s `hostDirectives` recursively into `consumer_file`'s frame (mirroring
/// ngtsc's `HostDirectivesResolver.resolve`).
///
/// Host directives attach to the hosting declaration rather than the consumer's template scope
/// (`createMatcherFromScope` registers only direct scope dependencies). `ancestors` tracks the
/// active host chain to break cycles.
async fn resolve_host_directives_for_class<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    class_info: &crate::ClassInfo,
    parent_owning: Option<&OwningReference>,
    consumer_file: crate::query::FileId,
    consumer_path: &Path,
    ancestors: &mut Vec<ReferenceId>,
) -> Option<Vec<ResolvedHostDirective>> {
    let host_dirs = class_info.host_directives.as_ref()?;
    let declaring_file_path = ctx.engine.lookup_path(class_info.reference_id.file);

    ancestors.push(class_info.reference_id);
    let mut resolved = Vec::with_capacity(host_dirs.len());
    for hd in host_dirs {
        let Some(entry) = resolve_host_directive(
            ctx,
            hd,
            &declaring_file_path,
            parent_owning,
            consumer_file,
            consumer_path,
            ancestors,
        )
        .await
        else {
            continue;
        };
        resolved.push(entry);
    }
    ancestors.pop();

    Some(resolved)
}

/// The class a `hostDirectives` entry names, looked up in its declaring file.
struct HostDirectiveClass {
    decl: crate::evaluator::cross_file::DeclaredSymbol,
    decl_file_id: crate::query::FileId,
    symbol_name: String,
    class_info: Option<crate::ClassInfo>,
}

/// Chase a `hostDirectives` entry written in `declaring_file_path` to its declaration. `None`
/// when the symbol itself cannot be resolved (e.g. a package without typings).
async fn resolve_host_directive_class<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    hd: &crate::types::analysis::HostDirectiveEntry,
    declaring_file_path: &Path,
) -> Option<HostDirectiveClass> {
    let declaring_file_id = ctx.engine.intern_path(declaring_file_path);
    let specifier = hd.directive.specifier_for(
        declaring_file_id,
        Some(declaring_file_path),
        Some(&|id| ctx.engine.lookup_path(id)),
    );
    let export_name = hd.directive.export_name().to_string();

    let mut visited = std::collections::HashSet::new();
    let Ok(Some(decl)) = crate::evaluator::cross_file::cross_file_resolve(
        ctx,
        declaring_file_path,
        specifier.as_deref(),
        export_name,
        &mut visited,
    )
    .await
    else {
        return None;
    };

    let decl_file_id = ctx.engine.intern_path(&decl.file_path);
    let evaluated = ctx.analyze_file_evaluated(decl_file_id).await;
    let parsed = ctx.parse_file(decl_file_id).await;
    let symbol_name = {
        let guard = parsed.lock().unwrap();
        guard
            .borrow_dependent()
            .semantic
            .scoping()
            .symbol_name(decl.symbol_id)
            .to_string()
    };
    let class_info = evaluated.class_index.get(&symbol_name).cloned();

    Some(HostDirectiveClass {
        decl,
        decl_file_id,
        symbol_name,
        class_info,
    })
}

/// Resolve one `hostDirectives` entry written in `declaring_file_path`, including the host
/// directives it declares in turn.
async fn resolve_host_directive<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    hd: &crate::types::analysis::HostDirectiveEntry,
    declaring_file_path: &Path,
    parent_owning: Option<&OwningReference>,
    consumer_file: crate::query::FileId,
    consumer_path: &Path,
    ancestors: &mut Vec<ReferenceId>,
) -> Option<ResolvedHostDirective> {
    let HostDirectiveClass {
        decl,
        decl_file_id,
        symbol_name,
        class_info,
    } = resolve_host_directive_class(ctx, hd, declaring_file_path).await?;
    let hd_class_info = class_info?;
    if ancestors.contains(&hd_class_info.reference_id) {
        return None;
    }

    let mut reference = crate::types::analysis::Reference {
        file: decl_file_id,
        name: symbol_name,
        owning_reference: decl.owning_reference.clone(),
        aliases: decl.aliases.into_iter().collect(),
        is_default_export: decl.exported_as_default,
    };

    let mut invalid_reason = None;
    if reference.owning_reference.is_none() && crate::utils::is_dts(declaring_file_path) {
        if let Some(owning) = parent_owning {
            let package_entry_path = crate::evaluator::cross_file::resolve_specifier(
                ctx.engine.resolver.as_ref(),
                consumer_path,
                owning.specifier(),
            )
            .or_else(|| {
                crate::evaluator::cross_file::resolve_specifier(
                    ctx.engine.resolver.as_ref(),
                    declaring_file_path,
                    owning.specifier(),
                )
            });
            if let Some(entry_path) = package_entry_path {
                let package_entry = ctx.engine.intern_path(&entry_path);
                let exports = ctx.module_export_map(package_entry).await;
                let decl_key = (decl_file_id, reference.name.clone());
                if let Some(export_name) = exports.get(&decl_key) {
                    reference.owning_reference = Some(OwningReference::from_source_specifier(
                        owning.specifier(),
                        export_name.clone(),
                    ));
                } else {
                    invalid_reason = Some(format!(
                        "The symbol is not exported from {} (module '{}').",
                        entry_path.display(),
                        owning.specifier()
                    ));
                }
            }
        }
    }

    let next_owning = reference.owning_reference.as_ref().or(parent_owning);
    let flattened = flatten_class_info(hd_class_info.clone(), ctx).await;
    let decl_data =
        DeclarationData::from_class_info(reference.clone(), &hd_class_info, &flattened, false)?;
    let mut directive =
        contextualize_declaration(ctx, &decl_data, consumer_file, consumer_path).await;
    if let Some(reason) = invalid_reason {
        if ctx.engine.reference_strategy.uses_owning_reference() {
            directive.ref_meta.consumer_import = None;
            directive.ref_meta.typecheck_import = None;
            directive.ref_meta.invalid_reason = Some(reason);
        }
    }
    directive.resolved_host_directives = Box::pin(resolve_host_directives_for_class(
        ctx,
        &flattened,
        next_owning,
        consumer_file,
        consumer_path,
        ancestors,
    ))
    .await;

    Some(ResolvedHostDirective {
        directive,
        inputs: hd.inputs.clone(),
        outputs: hd.outputs.clone(),
    })
}

struct HostBinding {
    class_property_name: String,
    public_name: String,
    required: bool,
}

fn host_bindings(info: &crate::ClassInfo, kind: &str) -> Vec<HostBinding> {
    info.fields
        .iter()
        .flatten()
        .filter(|field| field.kind == kind)
        .filter_map(|field| match kind {
            "input" => field.input.as_ref().map(|input| HostBinding {
                class_property_name: input.name.clone(),
                public_name: input.alias.clone().unwrap_or_else(|| input.name.clone()),
                required: input.required,
            }),
            _ => field.output.as_ref().map(|output| HostBinding {
                class_property_name: output.name.clone(),
                public_name: output.alias.clone().unwrap_or_else(|| output.name.clone()),
                required: false,
            }),
        })
        .collect()
}

fn validate_host_directive_mappings(
    kind: &str,
    mappings: Option<&[crate::types::metadata::HostDirectiveBinding]>,
    existing: &[HostBinding],
    class_name: &str,
    push: &mut dyn FnMut(u32, String),
) {
    let required: Vec<&HostBinding> = existing.iter().filter(|b| b.required).collect();
    let mut exposed_required = std::collections::HashSet::new();

    for mapping in mappings.into_iter().flatten() {
        let public_name = &mapping.public_name;
        let remapped = &mapping.binding_name;
        let bindings: Vec<&HostBinding> = existing
            .iter()
            .filter(|b| &b.public_name == public_name)
            .collect();
        if bindings.is_empty() {
            push(
                2017, // HOST_DIRECTIVE_UNDEFINED_BINDING
                format!(
                    "Directive {class_name} does not have an {kind} with a public name of {public_name}."
                ),
            );
        } else {
            for binding in bindings {
                if required
                    .iter()
                    .any(|r| r.class_property_name == binding.class_property_name)
                {
                    exposed_required.insert(binding.class_property_name.clone());
                }
            }
        }

        if remapped != public_name {
            for _ in existing.iter().filter(|b| &b.public_name == remapped) {
                push(
                    2018, // HOST_DIRECTIVE_CONFLICTING_ALIAS
                    format!(
                        "Cannot alias {kind} {public_name} of host directive {class_name} to {remapped}, \
                         because it already has a different {kind} with the same public name."
                    ),
                );
            }
        }
    }

    if !required.is_empty() && required.len() != exposed_required.len() {
        let missing: Vec<String> = required
            .iter()
            .filter(|r| !exposed_required.contains(&r.class_property_name))
            .map(|r| format!("'{}'", r.public_name))
            .collect();
        push(
            2019, // HOST_DIRECTIVE_MISSING_REQUIRED_BINDING
            format!(
                "Required {kind}{} {} from host directive {class_name} must be exposed.",
                if missing.len() == 1 { "" } else { "s" },
                missing.join(", ")
            ),
        );
    }
}

// TODO(parity): ngtsc poisons the class when any of these fire, suppressing its emit.
async fn validate_own_host_directives<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    file_path: &Path,
    reference_id: ReferenceId,
    directive: &DirectiveData,
) -> Vec<crate::NgDiagnostic> {
    let mut diagnostics = Vec::new();
    let (Some(entries), Some(container)) = (
        directive
            .host_directives
            .as_ref()
            .and_then(crate::evaluator::Resolved::get_optional),
        directive.host_directives_span,
    ) else {
        return diagnostics;
    };
    if entries.is_empty() {
        return diagnostics;
    }

    let syntax = ctx.analyze_file_syntax(reference_id.file).await;
    let file_path_text = file_path.to_string_lossy().into_owned();

    for entry in &entries {
        let span = entry
            .origin_identifiers
            .iter()
            .find(|id| id.start >= container.start && id.end <= container.end)
            .copied()
            .unwrap_or(container);
        let span = crate::types::metadata::SpanMetadata::new(span, &syntax.converter);
        let mut push = |code: u32, message: String| {
            diagnostics.push(crate::NgDiagnostic::error(
                code,
                file_path_text.clone(),
                span,
                message,
            ));
        };

        let Some(resolved) = resolve_host_directive_class(ctx, entry, file_path).await else {
            continue;
        };
        let Some(class_info) = resolved.class_info else {
            push(
                2013, // HOST_DIRECTIVE_INVALID
                format!(
                    "{} must be a standalone directive to be used as a host directive",
                    resolved.symbol_name
                ),
            );
            continue;
        };
        if !matches!(
            class_info.class_type,
            ClassType::Directive | ClassType::Component
        ) {
            push(
                2013, // HOST_DIRECTIVE_INVALID
                format!(
                    "{} must be a standalone directive to be used as a host directive",
                    class_info.class_name
                ),
            );
            continue;
        }

        let host_meta = flatten_class_info(class_info, ctx).await;
        let class_name = host_meta.class_name.clone();
        let is_dts = crate::utils::is_dts(&ctx.engine.lookup_path(resolved.decl_file_id));
        if !crate::query::module_scope::is_standalone_class(&host_meta, is_dts) {
            push(
                2014, // HOST_DIRECTIVE_NOT_STANDALONE
                format!("Host directive {class_name} must be standalone"),
            );
        }
        if host_meta.class_type == ClassType::Component {
            push(
                2015, // HOST_DIRECTIVE_COMPONENT
                format!("Host directive {class_name} cannot be a component"),
            );
        }

        validate_host_directive_mappings(
            "input",
            entry.inputs.as_deref(),
            &host_bindings(&host_meta, "input"),
            &class_name,
            &mut push,
        );
        validate_host_directive_mappings(
            "output",
            entry.outputs.as_deref(),
            &host_bindings(&host_meta, "output"),
            &class_name,
            &mut push,
        );
    }

    diagnostics
}

/// Resolve the `hostDirectives` a class declares on itself, in its own file's frame — what
/// ngtsc's `TypeCheckScopeRegistry` puts in `directivesOnHost` ahead of the class itself when
/// type-checking its host bindings. Shared by components and directives.
async fn resolve_own_host_directives<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    file_path: &Path,
    reference_id: ReferenceId,
    class_name: Option<&str>,
) -> Option<Vec<ResolvedHostDirective>> {
    let evaluated = ctx.analyze_file_evaluated(reference_id.file).await;
    let class_info = evaluated.class_index.get(class_name?)?;
    let flattened = flatten_class_info(class_info.clone(), ctx).await;
    resolve_host_directives_for_class(
        ctx,
        &flattened,
        None,
        reference_id.file,
        file_path,
        &mut Vec::new(),
    )
    .await
}

/// Stage 2 for a directive: resolve its own `hostDirectives` for the host binding type-check
/// block, and validate them. The directive's template scope does not exist, so this is all it
/// needs cross-file.
pub async fn optimize_directive<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    file_path: &Path,
    reference_id: ReferenceId,
    class_name: Option<&str>,
    directive: &mut DirectiveData,
) {
    directive.resolved_host_directives =
        resolve_own_host_directives(ctx, file_path, reference_id, class_name).await;
    directive.host_directive_diagnostics =
        validate_own_host_directives(ctx, file_path, reference_id, directive).await;
}

/// Resolve the `hostDirectives` of a scope entry, looking its class up in its declaring file.
async fn resolve_host_directives_for_declaration<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    decl: &DeclarationData,
    consumer_file: crate::query::FileId,
    consumer_path: &Path,
) -> Option<Vec<ResolvedHostDirective>> {
    let evaluated = ctx.analyze_file_evaluated(decl.reference.file).await;
    let class_info = evaluated.class_index.get(&decl.reference.name)?;
    let flattened = flatten_class_info(class_info.clone(), ctx).await;
    resolve_host_directives_for_class(
        ctx,
        &flattened,
        decl.reference.owning_reference.as_ref(),
        consumer_file,
        consumer_path,
        &mut Vec::new(),
    )
    .await
}

/// A declaration reference extracted from an evaluated `imports` or `deferredImports` value.
#[derive(Clone, Debug)]
pub struct EvaluatedDeclaration {
    pub reference: crate::types::analysis::Reference,
    /// True when the reference came through a foreign-function resolver (`forwardRef`).
    pub synthetic: bool,
    /// Identifier nodes traversed while resolving this reference (`ValueReference.identifiers`).
    pub identifiers: Vec<(crate::query::FileId, oxc_span::Span)>,
}

fn collect_declaration_tuples(
    value: &crate::evaluator::ResolvedValue,
    out: &mut Vec<EvaluatedDeclaration>,
) -> Result<(), crate::evaluator::DynamicReason> {
    match value {
        crate::evaluator::ResolvedValue::Named { value: inner, .. } => {
            collect_declaration_tuples(inner, out)
        }
        crate::evaluator::ResolvedValue::Array(items) => {
            for item in items {
                collect_declaration_tuples(item, out)?;
            }
            Ok(())
        }
        crate::evaluator::ResolvedValue::Reference(reference) => {
            out.push(EvaluatedDeclaration {
                reference: crate::types::analysis::Reference::from_value_reference(reference),
                synthetic: reference.synthetic,
                identifiers: reference.identifiers.clone(),
            });
            Ok(())
        }
        crate::evaluator::ResolvedValue::Dynamic(dynamic) => Err(dynamic.reason.clone()),
        _ => Err(crate::evaluator::DynamicReason::InvalidExpressionType),
    }
}

/// Mirror of `UnusedStandaloneImportsRule.isPotentialSharedReference` and `diagnosticNode`
/// selection in `@angular/compiler-cli`:
///
/// - If `identifiers` has an entry inside `raw_imports_span` (`getIdentityInExpression`), it was
///   written directly in `@Component.imports` (or via a single-directive alias variable) and is not
///   shared (`(false, Some(span))`).
/// - Otherwise, if the declaration comes from another file (`reference_file != component_file`)
///   and its first identifier in `component_file` (`getIdentityIn(sourceFile)`) sits inside a
///   non-exported `VariableDeclaration`, it is a file-local array and is not shared
///   (`(false, Some(span))`).
/// - All other references (same-file declarations in a variable, exported variable arrays, or
///   imported shared arrays) are treated as potentially shared (`(true, None)`).
async fn resolve_import_usage<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    component_file: crate::query::FileId,
    reference_file: crate::query::FileId,
    raw_imports_span: Option<oxc_span::Span>,
    identifiers: &[(crate::query::FileId, oxc_span::Span)],
) -> (bool, Option<oxc_span::Span>) {
    if let Some(container) = raw_imports_span {
        if let Some(&(_, span)) = identifiers.iter().find(|&&(id_file, id_span)| {
            id_file == component_file
                && id_span.start >= container.start
                && id_span.end <= container.end
        }) {
            return (false, Some(span));
        }
    }

    if reference_file == component_file {
        return (true, None);
    }

    let Some(&(_, id_span)) = identifiers
        .iter()
        .find(|&&(id_file, _)| id_file == component_file)
    else {
        return (true, None);
    };

    let parsed = ctx.parse_file(component_file).await;
    let in_non_exported_var = {
        let guard = parsed.lock().unwrap();
        let nodes = guard.borrow_dependent().semantic.nodes();
        let enclosing_var_decl = nodes
            .iter()
            .filter(|node| {
                matches!(
                    node.kind(),
                    oxc_ast::AstKind::VariableDeclaration(decl)
                        if decl.span.start <= id_span.start && id_span.end <= decl.span.end
                )
            })
            .last();
        enclosing_var_decl.is_some_and(|var_decl| {
            !matches!(
                nodes.parent_kind(var_decl.id()),
                oxc_ast::AstKind::ExportDeclaration(_)
                    | oxc_ast::AstKind::ExportNamedDeclaration(_)
            )
        })
    };

    if in_non_exported_var {
        (false, Some(id_span))
    } else {
        (true, None)
    }
}

/// The reference for a resolved entry of the legacy identifier-rooted `imports` list.
fn legacy_import_reference(
    tuple: &DeclarationTuple,
    class_info: &crate::ClassInfo,
    consumer_file: crate::query::FileId,
) -> crate::types::analysis::Reference {
    let owning_reference = tuple.import_source.as_ref().and_then(|source| {
        OwningReference::is_absolute_specifier(source).then(|| {
            OwningReference::from_source_specifier(source.clone(), tuple.export_name().to_owned())
        })
    });
    let mut aliases = std::collections::HashMap::new();
    aliases.insert(class_info.reference_id.file, class_info.class_name.clone());
    aliases.insert(consumer_file, tuple.local_name.clone());
    crate::types::analysis::Reference {
        file: class_info.reference_id.file,
        name: class_info.class_name.clone(),
        owning_reference,
        aliases,
        is_default_export: false,
    }
}

/// Project `@NgModule` scope declarations into `reference_id`'s frame, computing
/// `ref_in_declaring_module`, `is_forward_ref`, `cycle_prone`, and `resolved_host_directives`.
/// Shared by `optimize_component` and `populate_local_component_extra_imports`.
#[allow(clippy::too_many_arguments)]
async fn contextualize_ngmodule_scope_declarations<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    file_path: &Path,
    reference_id: ReferenceId,
    declarations: &[DeclarationData],
    syntax_file: &crate::types::analysis::FileData,
    comp_span_start: u32,
    module_span_start: Option<u32>,
    module_ref: ReferenceId,
) -> Vec<DeclarationData> {
    let mut resolved_declarations = Vec::new();
    let module_path = ctx.engine.lookup_path(module_ref.file);
    for decl in declarations.iter() {
        let mut contextual_decl =
            contextualize_declaration(ctx, decl, reference_id.file, file_path).await;
        // Remote scoping emits this declaration from the NgModule's file, which needs its
        // own projection: the component's frame says nothing about what that file binds.
        contextual_decl.ref_in_declaring_module =
            Some(project_reference(ctx, &decl.reference, module_ref.file, &module_path).await);

        // Match ngtsc's `isExpressionForwardReference(expr, context, contextSource)`:
        // `ngtsc` only wraps a reference in `WrappedNodeExpr(id)` when `LocalIdentifierStrategy`
        // finds an identifier for `ref` in `contextSource` (`local_alias.is_some()`). Re-exported
        // declarations from imported NgModules have no local identifier in `contextSource` and
        // emit as `ExternalExpr` (`i1.Dir`), which is never treated as a forward reference.
        // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L286-L297
        // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/imports/src/emitter.ts#L281-L290
        let is_forward_ref = if decl.is_forward_ref {
            true
        } else if decl.reference.file == reference_id.file {
            syntax_file
                .classes
                .iter()
                .find(|c| c.class_name.as_deref() == Some(&decl.reference.name))
                .is_some_and(|target_class| target_class.span.start > comp_span_start)
        } else if contextual_decl.ref_meta.local_alias.is_some() {
            module_span_start.is_some_and(|m_start| m_start > comp_span_start)
        } else {
            false
        };
        contextual_decl.is_forward_ref = is_forward_ref;

        let cycle_prone = if decl.reference.file == reference_id.file {
            false
        } else {
            ctx.has_path(decl.reference.file, reference_id.file).await
        };
        if cycle_prone {
            contextual_decl.cycle_prone = Some(true);
        }
        contextual_decl.resolved_host_directives =
            resolve_host_directives_for_declaration(ctx, decl, reference_id.file, file_path).await;

        resolved_declarations.push(contextual_decl);
    }
    resolved_declarations
}

/// Resolve cross-file component scope (`resolved_declarations`, `resolved_deferred_declarations`,
/// and `resolved_host_directives`) for a component in optimized mode.
///
/// `component.imports` is completed in place so no `Incomplete` survives into the semantic result.
/// Invalidation needs no explicit bookkeeping: every awaited sub-query records the files it touched
/// on the `QueryContext`, and they flow into this semantic query's reverse-index entry.
pub async fn optimize_component<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    file_path: &Path,
    reference_id: ReferenceId,
    class_name: Option<&str>,
    component: &mut ComponentData,
) {
    let syntax_file = ctx.analyze_file_syntax(reference_id.file).await;
    let comp_class = syntax_file
        .classes
        .iter()
        .find(|c| c.reference_id == reference_id);
    let comp_span_start = comp_class.map(|c| c.span.start).unwrap_or(0);

    if !component.directive.standalone {
        if component.imports_factory_span.is_some()
            || component.deferred_imports_span.is_some()
            || component.foreign_imports_span.is_some()
        {
            component.is_poisoned = true;
        }

        let mapping = ctx.component_mapping().await;

        // An anonymous component (no class name) can't be keyed into the module mapping; it is
        // treated the same as "not found". So is a component declared by more than one NgModule:
        // ngtsc's `getScopeForComponent` gives it no scope, and validation reports NG6007.
        let (module_entry, duplicates) =
            mapping.declaring_ng_modules(reference_id.file, class_name);
        component.directive.duplicate_declaration_context =
            crate::query::module_scope::duplicate_declaration_context(
                ctx,
                reference_id.file,
                class_name.unwrap_or_default(),
                &duplicates,
            )
            .await;
        component.directive.duplicate_declaring_ng_modules = duplicates;

        let Some(module_ref) = module_entry else {
            component.resolved_declarations = Some(Vec::new());
            component.raw_imports_span = None;
            return;
        };

        let module_meta = ctx.analyze_file_syntax(module_ref.file).await;
        component.directive.declaring_ng_module = Some(module_ref);

        if ctx.ngmodule_scope_registry().await.is_poisoned(module_ref) {
            component.is_poisoned = true;
        }
        if component.is_poisoned && !ctx.engine.use_poisoned_data {
            component.resolved_declarations = Some(Vec::new());
            component.raw_imports_span = None;
            return;
        }

        let schemas_to_apply = module_meta
            .symbol_index
            .get(&module_ref)
            .and_then(|info| info.schemas.clone());

        if let Some(schemas) = schemas_to_apply {
            let mut combined = component.schemas.clone().unwrap_or_default();
            for schema in schemas {
                if !combined.contains(&schema) {
                    combined.push(schema);
                }
            }
            component.schemas = Some(combined);
        }

        let scope = ctx.ngmodule_imports_scope(module_ref).await;
        if !scope.is_complete {
            component.resolved_declarations = None;
            component.raw_imports_span = None;
            return;
        }

        let module_span_start = if module_ref.file == reference_id.file {
            module_meta
                .classes
                .iter()
                .find(|c| c.reference_id == module_ref)
                .map(|c| c.span.start)
        } else {
            None
        };

        let resolved_declarations = contextualize_ngmodule_scope_declarations(
            ctx,
            file_path,
            reference_id,
            &scope.declarations,
            &syntax_file,
            comp_span_start,
            module_span_start,
            module_ref,
        )
        .await;
        component.resolved_declarations = Some(resolved_declarations);
        component.raw_imports_span = None;
    } else {
        if syntax_file
            .classes
            .iter()
            .any(|c| c.as_ng_module().is_some())
        {
            let mapping = ctx.component_mapping().await;
            let (module_entry, _) = mapping.declaring_ng_modules(reference_id.file, class_name);
            if let Some(module_ref) = module_entry {
                if ctx.ngmodule_scope_registry().await.is_poisoned(module_ref) {
                    component.is_poisoned = true;
                }
            }
        }
        if component.imports.is_some() || !component.parsed_imports.is_empty() {
            // Prefer Stage-1 partial evaluation (`component.imports`), which handles imported constant
            // arrays/tuples, spreads, and `ModuleWithProviders` calls. Fall back to identifier-rooted
            // `parsed_imports` if evaluation hits a dynamic entry (e.g. unwrapping `X.forRoot()` syntactically).
            enum Entry {
                Evaluated(
                    crate::types::analysis::Reference,
                    Vec<(crate::query::FileId, oxc_span::Span)>,
                ),
                Parsed(DeclarationTuple),
            }

            let mut entries: Option<Vec<(Entry, bool)>> = None;
            if let Some(imports_eval) = &mut component.imports {
                imports_eval
                    .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
                    .await;
                let validation = crate::query::module_scope::validate_standalone_imports(
                    ctx,
                    reference_id.file,
                    imports_eval.raw(),
                    component.imports_factory_span,
                    component.imports_span_tree.as_ref(),
                )
                .await;
                component.import_diagnostics = validation.diagnostics;
                if validation.is_poisoned {
                    component.is_poisoned = true;
                }
                if component.is_poisoned && !ctx.engine.use_poisoned_data {
                    component.resolved_declarations = Some(Vec::new());
                    component.raw_imports_span = None;
                    return;
                }
                let mut evaluated = Vec::new();
                if collect_declaration_tuples(imports_eval.raw(), &mut evaluated).is_ok() {
                    entries = Some(
                        evaluated
                            .into_iter()
                            .map(|decl| {
                                (
                                    Entry::Evaluated(decl.reference, decl.identifiers),
                                    decl.synthetic,
                                )
                            })
                            .collect(),
                    );
                }
            }
            if component.is_poisoned && !ctx.engine.use_poisoned_data {
                component.resolved_declarations = Some(Vec::new());
                component.raw_imports_span = None;
                return;
            }
            let used_evaluated_entries = entries.is_some();
            let entries = entries.unwrap_or_else(|| {
                component
                    .parsed_imports
                    .iter()
                    .map(|i| (Entry::Parsed(i.to_declaration_tuple()), i.is_forward_ref))
                    .collect()
            });

            let mut resolved_declarations = Vec::new();
            let mut resolved_import_entries = Vec::new();
            let raw_imports_span = component.imports_factory_span;
            // The legacy path with nothing to resolve (slot evaluation failed and no
            // identifier-rooted imports survived extraction) must keep the runtime fallback.
            let mut all_resolved = used_evaluated_entries || !entries.is_empty();

            let resolve_futures = entries.iter().map(|(entry, _)| {
                let ctx = ctx.clone();
                async move {
                    match entry {
                        Entry::Evaluated(r, _) => {
                            crate::query::resolve_reference_async(r, &ctx).await
                        }
                        Entry::Parsed(tuple) => {
                            resolve_declaration_async(tuple, file_path, &ctx).await
                        }
                    }
                }
            });
            let results = futures::future::join_all(resolve_futures).await;

            for ((entry, is_forward_ref), resolved_info) in entries.iter().zip(results) {
                let Some(class_info) = resolved_info else {
                    all_resolved = false;
                    continue;
                };

                let flattened = flatten_class_info(class_info.clone(), ctx).await;

                let reference = match entry {
                    Entry::Evaluated(r, _) => r.clone(),
                    Entry::Parsed(tuple) => {
                        legacy_import_reference(tuple, &class_info, reference_id.file)
                    }
                };

                let (is_potential_shared, usage_span) = match entry {
                    Entry::Evaluated(_, identifiers) => {
                        resolve_import_usage(
                            ctx,
                            reference_id.file,
                            reference.file,
                            raw_imports_span,
                            identifiers,
                        )
                        .await
                    }
                    Entry::Parsed(_) => (true, None),
                };

                let same_file = reference.file == reference_id.file;

                let decl_class = syntax_file
                    .classes
                    .iter()
                    .find(|c| c.class_name.as_deref() == Some(&reference.name));
                let decl_span_start = decl_class.map(|c| c.span.start).unwrap_or(0);
                let is_fw = *is_forward_ref || (same_file && decl_span_start > comp_span_start);

                if class_info.class_type == ClassType::NgModule {
                    if let Some(decl) = DeclarationData::from_class_info(
                        reference.clone(),
                        &class_info,
                        &flattened,
                        is_fw,
                    ) {
                        resolved_import_entries.push(crate::analyzer::ComponentImportEntryData {
                            name: decl.reference.name.clone(),
                            file: decl.reference.file,
                            declaration_type: decl.declaration_type,
                            pipe_name: decl.pipe_name.clone(),
                            is_standalone: decl.is_standalone,
                            is_potential_shared,
                            usage_span,
                        });
                        let contextual_decl =
                            contextualize_declaration(ctx, &decl, reference_id.file, file_path)
                                .await;
                        resolved_declarations.push(contextual_decl);
                    }
                    let scope = ctx.ngmodule_exports_scope(class_info.reference_id).await;
                    let propagated_scope = crate::query::propagate_owning_reference_validated(
                        ctx,
                        &scope,
                        &reference.owning_reference,
                        class_info.reference_id.file,
                    )
                    .await;
                    for sub_decl in propagated_scope {
                        let mut contextual_sub_decl =
                            contextualize_declaration(ctx, &sub_decl, reference_id.file, file_path)
                                .await;
                        contextual_sub_decl.resolved_host_directives =
                            resolve_host_directives_for_declaration(
                                ctx,
                                &sub_decl,
                                reference_id.file,
                                file_path,
                            )
                            .await;
                        resolved_declarations.push(contextual_sub_decl);
                    }
                } else if let Some(decl) =
                    DeclarationData::from_class_info(reference, &class_info, &flattened, is_fw)
                {
                    resolved_import_entries.push(crate::analyzer::ComponentImportEntryData {
                        name: decl.reference.name.clone(),
                        file: decl.reference.file,
                        declaration_type: decl.declaration_type,
                        pipe_name: decl.pipe_name.clone(),
                        is_standalone: decl.is_standalone,
                        is_potential_shared,
                        usage_span,
                    });
                    let mut contextual_decl =
                        contextualize_declaration(ctx, &decl, reference_id.file, file_path).await;
                    contextual_decl.resolved_host_directives = resolve_host_directives_for_class(
                        ctx,
                        &flattened,
                        decl.reference.owning_reference.as_ref(),
                        reference_id.file,
                        file_path,
                        &mut Vec::new(),
                    )
                    .await;
                    resolved_declarations.push(contextual_decl);
                } else {
                    all_resolved = false;
                }
            }

            component.resolved_declarations = Some(resolved_declarations);

            // When any import could not be resolved statically, keep `raw_imports_span` so the
            // emitter falls back to the raw source expression (runtime resolution). This is a
            // supported path (the norm in local mode), not an error, so it is deliberately silent.
            if all_resolved {
                component.raw_imports_span = None;
                component.resolved_import_entries = Some(resolved_import_entries);
            } else {
                component.resolved_import_entries = None;
            }
        }
    }

    if component.directive.standalone
        && (component.deferred_imports.is_some() || !component.parsed_deferred_imports.is_empty())
    {
        // Key by symbol identity (`Reference` file + name, or `DeclarationTuple` local binding +
        // import source) rather than bare class name, matching ngtsc's `Reference.node` keying.
        #[derive(Clone, Debug, PartialEq, Eq, Hash)]
        enum DefEntry {
            Evaluated(crate::types::analysis::Reference),
            Parsed(DeclarationTuple),
        }

        let mut def_entries_by_block: Option<
            std::collections::HashMap<String, Vec<(DefEntry, bool)>>,
        > = None;
        let mut def_entries_flat: Option<Vec<(DefEntry, bool)>> = None;

        if let Some(def_eval) = &mut component.deferred_imports {
            def_eval
                .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
                .await;
            match def_eval.raw() {
                crate::evaluator::ResolvedValue::Map(map) => {
                    let mut by_block = std::collections::HashMap::new();
                    let mut flat = Vec::new();
                    for (block_name, block_val) in map.iter() {
                        let mut block_evaluated = Vec::new();
                        if collect_declaration_tuples(block_val, &mut block_evaluated).is_ok() {
                            let block_tuples: Vec<(DefEntry, bool)> = block_evaluated
                                .into_iter()
                                .map(|decl| (DefEntry::Evaluated(decl.reference), decl.synthetic))
                                .collect();
                            for entry in &block_tuples {
                                if !flat.iter().any(|(existing, _)| match (existing, &entry.0) {
                                    (DefEntry::Evaluated(r1), DefEntry::Evaluated(r2)) => r1 == r2,
                                    _ => false,
                                }) {
                                    flat.push(entry.clone());
                                }
                            }
                            by_block.insert(block_name.clone(), block_tuples);
                        }
                    }
                    def_entries_by_block = Some(by_block);
                    def_entries_flat = Some(flat);
                }
                _ => {
                    let mut evaluated = Vec::new();
                    if collect_declaration_tuples(def_eval.raw(), &mut evaluated).is_ok() {
                        def_entries_flat = Some(
                            evaluated
                                .into_iter()
                                .map(|decl| (DefEntry::Evaluated(decl.reference), decl.synthetic))
                                .collect(),
                        );
                    }
                }
            }
        }

        if def_entries_flat.is_none() {
            if let Some(ref by_block) = component.parsed_deferred_imports_by_block {
                let mut block_map = std::collections::HashMap::new();
                let mut flat = Vec::new();
                for (block_name, block_imps) in by_block {
                    let block_tuples: Vec<(DefEntry, bool)> = block_imps
                        .iter()
                        .map(|i| (DefEntry::Parsed(i.to_declaration_tuple()), i.is_forward_ref))
                        .collect();
                    for entry in &block_tuples {
                        if !flat.iter().any(|(existing, _)| match (existing, &entry.0) {
                            (DefEntry::Parsed(t1), DefEntry::Parsed(t2)) => t1 == t2,
                            _ => false,
                        }) {
                            flat.push(entry.clone());
                        }
                    }
                    block_map.insert(block_name.clone(), block_tuples);
                }
                def_entries_by_block = Some(block_map);
                def_entries_flat = Some(flat);
            } else {
                def_entries_flat = Some(
                    component
                        .parsed_deferred_imports
                        .iter()
                        .map(|i| (DefEntry::Parsed(i.to_declaration_tuple()), i.is_forward_ref))
                        .collect(),
                );
            }
        }

        let def_entries = def_entries_flat.unwrap_or_default();
        if !def_entries.is_empty() {
            let resolve_futures = def_entries.iter().map(|(entry, _)| {
                let ctx = ctx.clone();
                async move {
                    match entry {
                        DefEntry::Evaluated(r) => {
                            crate::query::resolve_reference_async(r, &ctx).await
                        }
                        DefEntry::Parsed(tuple) => {
                            resolve_declaration_async(tuple, file_path, &ctx).await
                        }
                    }
                }
            });
            let results = futures::future::join_all(resolve_futures).await;

            let mut resolved_def_decls = Vec::new();
            let mut resolved_by_key = std::collections::HashMap::new();

            for ((entry, is_forward_ref), resolved_info) in def_entries.iter().zip(results) {
                let Some(class_info) = resolved_info else {
                    continue;
                };
                let flattened = flatten_class_info(class_info.clone(), ctx).await;
                let reference = match entry {
                    DefEntry::Evaluated(r) => r.clone(),
                    DefEntry::Parsed(tuple) => {
                        legacy_import_reference(tuple, &class_info, reference_id.file)
                    }
                };

                let same_file = reference.file == reference_id.file;
                let decl_class = syntax_file
                    .classes
                    .iter()
                    .find(|c| c.class_name.as_deref() == Some(&reference.name));
                let decl_span_start = decl_class.map(|c| c.span.start).unwrap_or(0);
                let is_fw = *is_forward_ref || (same_file && decl_span_start > comp_span_start);

                if let Some(mut decl) = DeclarationData::from_class_info(
                    reference.clone(),
                    &class_info,
                    &flattened,
                    is_fw,
                ) {
                    decl.is_explicitly_deferred = true;
                    let mut contextual_decl =
                        contextualize_declaration(ctx, &decl, reference_id.file, file_path).await;
                    contextual_decl.resolved_host_directives = resolve_host_directives_for_class(
                        ctx,
                        &flattened,
                        decl.reference.owning_reference.as_ref(),
                        reference_id.file,
                        file_path,
                        &mut Vec::new(),
                    )
                    .await;
                    resolved_by_key.insert(entry.clone(), contextual_decl.clone());
                    resolved_def_decls.push(contextual_decl);
                }
            }

            if let Some(by_block) = def_entries_by_block {
                let mut resolved_by_block = std::collections::HashMap::new();
                for (block_name, block_entries) in by_block {
                    let mut block_decls = Vec::new();
                    for (entry, _) in block_entries {
                        if let Some(decl) = resolved_by_key.get(&entry) {
                            let mut block_decl = decl.clone();
                            let mut blocks = block_decl.deferred_blocks.unwrap_or_default();
                            if !blocks.contains(&block_name) {
                                blocks.push(block_name.clone());
                            }
                            block_decl.deferred_blocks = Some(blocks);
                            block_decls.push(block_decl);
                        }
                    }
                    resolved_by_block.insert(block_name, block_decls);
                }

                for decl in &mut resolved_def_decls {
                    let mut blocks = Vec::new();
                    for (block_name, block_decls) in &resolved_by_block {
                        if block_decls.iter().any(|d| d.reference == decl.reference) {
                            blocks.push(block_name.clone());
                        }
                    }
                    if !blocks.is_empty() {
                        decl.deferred_blocks = Some(blocks);
                    }
                }
                component.resolved_deferred_declarations_by_block = Some(resolved_by_block);
            }

            component.resolved_deferred_declarations = Some(resolved_def_decls.clone());

            // A deferred entry is folded into the eager scope unless that exact symbol is
            // already there. A same-named class from another file is a different dependency.
            let mut all_decls = component.resolved_declarations.clone().unwrap_or_default();
            for def_decl in resolved_def_decls {
                if !all_decls
                    .iter()
                    .any(|existing| existing.reference == def_decl.reference)
                {
                    all_decls.push(def_decl);
                }
            }
            component.resolved_declarations = Some(all_decls);
        }
    }

    // The component's own host directives go on its host element, ahead of the component itself
    // (ngtsc's `directivesOnHost`). Like any host directive they stay out of its template scope.
    component.resolved_host_directives =
        resolve_own_host_directives(ctx, file_path, reference_id, class_name).await;
    component.directive.host_directive_diagnostics =
        validate_own_host_directives(ctx, file_path, reference_id, &component.directive).await;

    if let Some(ref mut decls) = component.resolved_declarations {
        DeclarationData::deduplicate(decls);
    }
}

/// Rebase a module specifier written in `importer_dir` so it resolves identically from
/// `consumer_dir`.
fn rebase_relative_specifier(
    specifier: &str,
    importer_dir: &Path,
    consumer_dir: &Path,
) -> Option<String> {
    if !specifier.starts_with("./") && !specifier.starts_with("../") {
        return Some(specifier.to_string());
    }

    let target_abs =
        crate::fs::normalize_path_structural(&importer_dir.join(specifier)).into_owned();
    let consumer_dir = crate::fs::normalize_path_structural(consumer_dir);
    let relative = pathdiff::diff_paths(&target_abs, consumer_dir.as_ref())?;
    let relative = relative.to_string_lossy().replace('\\', "/");
    if relative.starts_with('.') {
        Some(relative)
    } else {
        Some(format!("./{relative}"))
    }
}

/// Populates side-effect imports for a non-standalone component in local compilation mode,
/// mirroring ngtsc's `LocalCompilationExtraImportsTracker`.
///
/// Local mode omits static `ɵcmp` dependency lists, stripping module-graph edges needed by
/// JsTrimmer/Closure for topological sorting. Bare `import '<spec>';` statements restore them.
pub async fn populate_local_component_extra_imports<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    file_path: &Path,
    reference_id: ReferenceId,
    class_name: Option<&str>,
    component: &mut ComponentData,
    global_extra_imports: &[(crate::query::FileId, String)],
    entrypoints_ids: &std::collections::HashSet<crate::query::FileId>,
) {
    if component.directive.standalone {
        return;
    }

    let mapping = ctx.component_mapping().await;
    // Skip anonymous components and modules outside the compilation unit (ngtsc's
    // `LocalModuleScopeRegistry` never sees those).
    let Some(module_ref) = class_name
        .and_then(|name| mapping.get(reference_id.file, name))
        .filter(|module_ref| entrypoints_ids.contains(&module_ref.file))
    else {
        return;
    };

    // Record the owning module so the streaming coordinator groups the whole `@NgModule` into one
    // chunk and the emitter can detect template-induced cycles before emitting side-effect imports.
    component.directive.declaring_ng_module = Some(module_ref);

    // Same-file `@NgModule` imports already pull in dependencies, so no extra edge is needed.
    if module_ref.file == reference_id.file {
        return;
    }

    let Some(consumer_dir) = file_path.parent() else {
        return;
    };

    let mut extra_imports: Vec<String> = Vec::new();
    for (importer, specifier) in global_extra_imports {
        let importer_path = ctx.engine.lookup_path(*importer);
        let Some(importer_dir) = importer_path.parent() else {
            continue;
        };
        let Some(projected) = rebase_relative_specifier(specifier, importer_dir, consumer_dir)
        else {
            continue;
        };
        if !extra_imports.contains(&projected) {
            extra_imports.push(projected);
        }
    }
    component.local_compilation_extra_imports = Some(extra_imports);

    let scope = ctx.ngmodule_imports_scope(module_ref).await;

    // Resolve pipe shadowing across the full unit (including same-file pipes) before filtering out
    // same-file declarations (would self-import) and out-of-unit ones (ngtsc's
    // `LocalModuleScopeRegistry` sees only this unit; the global set above covers them, and
    // importing a transitive `.d.ts` directly would violate strict deps).
    let mut winning_pipes = std::collections::HashMap::new();
    for d in &scope.declarations {
        if entrypoints_ids.contains(&d.reference.file) && d.declaration_type == ClassType::Pipe {
            if let Some(ref name) = d.pipe_name {
                winning_pipes.insert(name.as_str(), (d.reference.file, d.reference.name.as_str()));
            }
        }
    }

    let local_decls: Vec<_> = scope
        .declarations
        .iter()
        .filter(|d| {
            if d.reference.file == reference_id.file || !entrypoints_ids.contains(&d.reference.file)
            {
                return false;
            }
            if d.declaration_type == ClassType::Pipe {
                if let Some(ref name) = d.pipe_name {
                    return winning_pipes.get(name.as_str())
                        == Some(&(d.reference.file, d.reference.name.as_str()));
                }
            }
            true
        })
        .cloned()
        .collect();

    if local_decls.is_empty() {
        return;
    }

    let syntax_file = ctx.analyze_file_syntax(reference_id.file).await;
    let comp_span_start = syntax_file
        .classes
        .iter()
        .find(|c| c.reference_id == reference_id)
        .map(|c| c.span.start)
        .unwrap_or(0);

    let mut resolved_declarations = contextualize_ngmodule_scope_declarations(
        ctx,
        file_path,
        reference_id,
        &local_decls,
        &syntax_file,
        comp_span_start,
        None,
        module_ref,
    )
    .await;
    DeclarationData::deduplicate(&mut resolved_declarations);
    component.resolved_declarations = Some(resolved_declarations);
}
