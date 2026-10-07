use crate::analyzer::{flatten_class_info, resolve_declaration_async, ComponentData};
use crate::query::{QueryCtx, ReferenceId};
use crate::types::analysis::{DeclarationData, OwningReference};
use crate::ResourceResolverFs;
use crate::{types::analysis::ResolvedHostDirective, ClassType, DeclarationTuple};
use std::path::Path;

/// Re-project one resolved declaration into the frame of the file it is being emitted into:
/// *how do I write this symbol here?*
///
/// A scope entry is shared across every component that pulls it in, so its stored projection
/// belongs to the declaring file and has to be recomputed per consumer. Everything comes off
/// `reference.aliases` — a file appears there exactly when it binds the symbol — so a consumer
/// with an entry can name it directly, and one without gets an import instead.
///
/// This must never invent an identifier. A name that isn't a real binding emits a dangling
/// reference, which is what the old generated-alias scheme did once the emitter moved to
/// namespace imports.
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

    // Project generic type parameter constraints and defaults from the declaring file
    // into the consumer file's frame:
    // - ApfImportStrategy: Rebases declaring-relative specifiers (e.g. `./models`) to
    //   consumer-relative paths (e.g. `../components/models`).
    // - PrefixImportStrategy: Converts declaring-relative specifiers into workspace-prefixed paths.
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

/// Resolve `class_info`'s `hostDirectives` to their declarations, projected into the consumer's
/// frame and recursing through each host directive's own `hostDirectives`. Mirrors ngtsc's
/// `HostDirectivesResolver.resolve`.
///
/// The result belongs to the hosting declaration and is never added to the consumer's template
/// scope: ngtsc's `createMatcherFromScope` registers each scope dependency under its own selector
/// only, and `componentDependenciesToDeclarations` emits only `MatchSource.Selector` matches, so a
/// host directive is neither selectable in the consumer's template nor one of its `dependencies`
/// unless the consumer imports or declares it directly.
///
/// Returns `None` when the class declares no `hostDirectives`. An entry that cannot be resolved is
/// skipped. `ancestors` is the host chain being walked, so a cyclic chain (which ngtsc rejects
/// separately) terminates instead of recursing forever.
async fn resolve_host_directives_for_class<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    class_info: &crate::ClassInfo,
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

/// Resolve one `hostDirectives` entry written in `declaring_file_path`, including the host
/// directives it declares in turn.
async fn resolve_host_directive<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    hd: &crate::types::analysis::HostDirectiveEntry,
    declaring_file_path: &Path,
    consumer_file: crate::query::FileId,
    consumer_path: &Path,
    ancestors: &mut Vec<ReferenceId>,
) -> Option<ResolvedHostDirective> {
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

    let hd_class_info = evaluated.class_index.get(&symbol_name)?.clone();
    if ancestors.contains(&hd_class_info.reference_id) {
        return None;
    }

    let reference = crate::types::analysis::Reference {
        file: decl_file_id,
        name: symbol_name,
        owning_reference: decl.owning_reference.clone(),
        aliases: decl.aliases.into_iter().collect(),
        is_default_export: decl.exported_as_default,
    };

    let flattened = flatten_class_info(hd_class_info.clone(), ctx).await;
    let decl_data = DeclarationData::from_class_info(reference, &hd_class_info, &flattened, false)?;
    let mut directive =
        contextualize_declaration(ctx, &decl_data, consumer_file, consumer_path).await;
    directive.resolved_host_directives = Box::pin(resolve_host_directives_for_class(
        ctx,
        &hd_class_info,
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

/// Resolve the `hostDirectives` of a scope entry, looking its class up in its declaring file.
async fn resolve_host_directives_for_declaration<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    decl: &DeclarationData,
    consumer_file: crate::query::FileId,
    consumer_path: &Path,
) -> Option<Vec<ResolvedHostDirective>> {
    let evaluated = ctx.analyze_file_evaluated(decl.reference.file).await;
    let class_info = evaluated.class_index.get(&decl.reference.name)?;
    resolve_host_directives_for_class(
        ctx,
        class_info,
        consumer_file,
        consumer_path,
        &mut Vec::new(),
    )
    .await
}

/// Stage-2 cross-file resolution for one component, mutating its internal data in place.
/// `component.parsed_imports` is the legacy identifier-rooted fallback list;
/// `component.imports` is the Stage-1 partial evaluation, preferred when it completes
/// (it additionally covers imported constant arrays, spreads, and `ModuleWithProviders`
/// calls) and written back completed so the semantic wire invariant holds.
///
/// Dependency tracking for invalidation needs no explicit bookkeeping here: every sub-query
/// awaited during resolution records the files it touched on the `QueryContext`, and those
/// records flow into the consuming semantic query's reverse-index entry automatically.
/// A declaration extracted from an evaluated value, in the currency of the existing Stage-2
/// resolution pipeline.
#[derive(Clone, Debug)]
pub struct EvaluatedDeclaration {
    pub reference: crate::types::analysis::Reference,
    /// True when the reference came through a foreign-function resolver (`forwardRef`).
    pub synthetic: bool,
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
            });
            Ok(())
        }
        crate::evaluator::ResolvedValue::Synthetic(
            crate::evaluator::value::SyntheticValue::ModuleWithProviders { ng_module, .. },
        ) => {
            out.push(EvaluatedDeclaration {
                reference: crate::types::analysis::Reference::from_value_reference(ng_module),
                synthetic: ng_module.synthetic,
            });
            Ok(())
        }
        // The structural ModuleWithProviders shape: a map with an `ngModule` reference.
        crate::evaluator::ResolvedValue::Map(map) => {
            let Some(ng_module) = map.get("ngModule") else {
                return Err(crate::evaluator::DynamicReason::InvalidExpressionType);
            };
            collect_declaration_tuples(ng_module, out)
        }
        crate::evaluator::ResolvedValue::Dynamic(dynamic) => Err(dynamic.reason.clone()),
        _ => Err(crate::evaluator::DynamicReason::InvalidExpressionType),
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

/// Project a set of `@NgModule` scope declarations into `reference_id`'s frame.
///
/// Shared by the optimized pipeline (`optimize_component`, which passes the whole scope) and the
/// local-compilation extra-imports pass (`populate_local_component_extra_imports`, which passes a
/// filtered subset). Keeping one implementation means the `cycle_prone`, `is_forward_ref` and
/// `ref_in_declaring_module` projections cannot drift between the two modes — local mode reads
/// `cycle_prone` to decide whether to emit side-effect imports at all.
#[allow(clippy::too_many_arguments)]
async fn contextualize_ngmodule_scope_declarations<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    file_path: &Path,
    reference_id: ReferenceId,
    declarations: &[DeclarationData],
    syntax_file: &crate::types::analysis::FileData,
    comp_span_start: u32,
    module_ref: ReferenceId,
    module_span_start: u32,
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

        // An owning module is only ever recorded for an absolute specifier.
        let is_external = decl.reference.owning_reference.is_some();

        let is_forward_ref = if decl.is_forward_ref {
            true
        } else if decl.reference.file == reference_id.file {
            let decl_class = syntax_file
                .classes
                .iter()
                .find(|c| c.class_name.as_deref() == Some(&decl.reference.name));
            if let Some(target_class) = decl_class {
                target_class.span.start > comp_span_start
            } else {
                false
            }
        } else if is_external {
            false
        } else {
            module_ref.file == reference_id.file && module_span_start > comp_span_start
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
        let mapping = ctx.component_mapping().await;

        // An anonymous component (no class name) can't be keyed into the module mapping; it is
        // treated the same as "not found". So is a component declared by more than one NgModule:
        // ngtsc's `getScopeForComponent` gives it no scope, and validation reports NG6007.
        let (module_entry, duplicates) =
            mapping.declaring_ng_modules(reference_id.file, class_name);
        component.directive.duplicate_declaring_ng_modules = duplicates;

        let Some(module_ref) = module_entry else {
            component.resolved_declarations = Some(Vec::new());
            component.raw_imports_span = None;
            return;
        };

        let module_meta = ctx.analyze_file_syntax(module_ref.file).await;
        component.directive.declaring_ng_module = Some(module_ref);

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

        let module_class = module_meta
            .classes
            .iter()
            .find(|c| c.reference_id == module_ref);
        let module_span_start = module_class.map(|c| c.span.start).unwrap_or(0);

        let scope = ctx.ngmodule_imports_scope(module_ref).await;
        if !scope.is_complete {
            component.resolved_declarations = None;
            component.raw_imports_span = None;
            return;
        }

        let resolved_declarations = contextualize_ngmodule_scope_declarations(
            ctx,
            file_path,
            reference_id,
            &scope.declarations,
            &syntax_file,
            comp_span_start,
            module_ref,
            module_span_start,
        )
        .await;
        component.resolved_declarations = Some(resolved_declarations);
        component.raw_imports_span = None;
    } else if component.imports.is_some() || !component.parsed_imports.is_empty() {
        // Standalone component whose `imports: [...]` weren't all resolved file-locally in
        // Stage 1. Prefer the partial evaluation: it additionally covers imported constant
        // arrays/tuples, spreads, and `ModuleWithProviders` calls. If the evaluation hits a
        // genuinely dynamic entry, fall back to the legacy identifier-rooted list (which keeps
        // today's behavior, e.g. unwrapping `X.forRoot()` to `X` by syntax alone).
        enum Entry {
            Evaluated(crate::types::analysis::Reference),
            Parsed(DeclarationTuple),
        }

        let mut entries: Option<Vec<(Entry, bool)>> = None;
        if let Some(imports_eval) = &mut component.imports {
            imports_eval
                .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
                .await;
            let mut evaluated = Vec::new();
            if collect_declaration_tuples(imports_eval.raw(), &mut evaluated).is_ok() {
                entries = Some(
                    evaluated
                        .into_iter()
                        .map(|decl| (Entry::Evaluated(decl.reference), decl.synthetic))
                        .collect(),
                );
            }
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
        // The legacy path with nothing to resolve (slot evaluation failed and no
        // identifier-rooted imports survived extraction) must keep the runtime fallback.
        let mut all_resolved = used_evaluated_entries || !entries.is_empty();

        let resolve_futures = entries.iter().map(|(entry, _)| {
            let ctx = ctx.clone();
            async move {
                match entry {
                    Entry::Evaluated(r) => crate::query::resolve_reference_async(r, &ctx).await,
                    Entry::Parsed(tuple) => resolve_declaration_async(tuple, file_path, &ctx).await,
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
                Entry::Evaluated(r) => r.clone(),
                Entry::Parsed(tuple) => {
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

            if class_info.class_type == ClassType::NgModule {
                if let Some(decl) = DeclarationData::from_class_info(
                    reference.clone(),
                    &class_info,
                    &flattened,
                    is_fw,
                ) {
                    let contextual_decl =
                        contextualize_declaration(ctx, &decl, reference_id.file, file_path).await;
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
                let mut contextual_decl =
                    contextualize_declaration(ctx, &decl, reference_id.file, file_path).await;
                contextual_decl.resolved_host_directives = resolve_host_directives_for_class(
                    ctx,
                    &class_info,
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

        if all_resolved {
            component.raw_imports_span = None;
        } else {
            // Leave the original raw imports in place so the TS side falls back to runtime
            // resolution for the imports that couldn't be resolved statically. This is a
            // supported path (and the norm in local compilation mode), not an error, so it
            // is deliberately silent.
        }
    }

    if component.directive.standalone
        && (component.deferred_imports.is_some() || !component.parsed_deferred_imports.is_empty())
    {
        // Equality and hashing follow the symbol's identity, never its bare name: an evaluated
        // `Reference` compares by declaring file and declared name, and a parsed tuple by local
        // binding and import source. Two distinct classes that share a name (`Widget` from
        // `./a` and `Widget as WidgetB` from `./b`) are therefore kept apart, as ngtsc keeps
        // them apart by class declaration (`Reference.node`) in both
        // `StandaloneComponentScopeReader.getScopeForComponent` and
        // `ComponentDecoratorHandler.resolveComponentDependencies`.
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
                        &class_info,
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
    if let Some(comp_info) = class_name.and_then(|name| syntax_file.class_index.get(name)) {
        component.resolved_host_directives = resolve_host_directives_for_class(
            ctx,
            comp_info,
            reference_id.file,
            file_path,
            &mut Vec::new(),
        )
        .await;
    }

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

/// Populate the side-effect imports a non-standalone component must carry in local compilation
/// mode, mirroring ngtsc's `LocalCompilationExtraImportsTracker`.
///
/// Local mode cannot resolve `@NgModule` scopes, so the emitted `ɵcmp` has no static dependency
/// list. That is fine for the runtime (declarations are resolved at runtime), but it strips the
/// module-graph edges that JsTrimmer/Closure need to topologically sort the `.closure.js` files
/// built from the *optimized* pipeline. Emitting the same edges as bare `import '<spec>';`
/// statements restores them without changing any runtime semantics.
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
    // An anonymous component can't be keyed into the module mapping; treat it as "not found". So
    // is a module outside the unit: ngtsc's `LocalModuleScopeRegistry` never sees it.
    let Some(module_ref) = class_name
        .and_then(|name| mapping.get(reference_id.file, name))
        .filter(|module_ref| entrypoints_ids.contains(&module_ref.file))
    else {
        return;
    };

    // Record the owning module as `optimize_component` does. Local mode has no NgModule scope to
    // emit, but the streaming coordinator groups a compilation unit into chunks by exactly this
    // link (`get_class_owner`), and the emitter needs the whole `@NgModule` in one chunk to see
    // the template-induced cycles that decide whether the side-effect imports below may be
    // emitted at all.
    component.directive.declaring_ng_module = Some(module_ref);

    // A component declared by an `@NgModule` in its own file is never marked by ngtsc: the
    // module's own imports already pull in everything, so there is no missing edge to restore.
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

    // Restrict to declarations that are (a) in another file — a same-file declaration would
    // produce a self-import — and (b) part of this compilation unit. ngtsc's
    // `LocalModuleScopeRegistry` only ever sees the current unit, so anything outside it is
    // handled by the global set above; importing it directly would also be a strict-deps
    // violation against a transitive `.d.ts`.
    // Resolve pipe shadowing across the full compilation unit (including same-file pipes) before
    // dropping same-file declarations so a local pipe in the component's own file still shadows an
    // imported pipe from another file.
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

    let module_meta = ctx.analyze_file_syntax(module_ref.file).await;
    let module_span_start = module_meta
        .classes
        .iter()
        .find(|c| c.reference_id == module_ref)
        .map(|c| c.span.start)
        .unwrap_or(0);

    let mut resolved_declarations = contextualize_ngmodule_scope_declarations(
        ctx,
        file_path,
        reference_id,
        &local_decls,
        &syntax_file,
        comp_span_start,
        module_ref,
        module_span_start,
    )
    .await;
    DeclarationData::deduplicate(&mut resolved_declarations);
    component.resolved_declarations = Some(resolved_declarations);
}
