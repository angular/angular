use crate::analyzer::{resolve_declaration_async, NgModuleData};
use crate::evaluator::value::SyntheticValue;
use crate::evaluator::{Resolved, ResolvedValue};
use crate::query::{QueryCtx, ReferenceId};
use crate::ResourceResolverFs;
use crate::{ClassInfo, ClassType};
use futures::future::{BoxFuture, FutureExt};
use std::collections::HashSet;
use std::path::Path;

pub async fn optimize_ng_module<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryCtx<Fs>,
    _file_path: &Path,
    _reference_id: ReferenceId,
    _class_name: Option<&str>,
    ng_module: &mut NgModuleData,
) {
    let foreign = crate::analyzer::resolvers::angular_foreign_resolvers();
    if let Some(declarations_resolved) = &mut ng_module.declarations {
        declarations_resolved.complete_with(ctx, foreign).await;
    }
    if let Some(bootstrap_resolved) = &mut ng_module.bootstrap {
        bootstrap_resolved.complete_with(ctx, foreign).await;
    }

    if ng_module.imports.is_none() && ng_module.exports.is_none() {
        ng_module.injector_imports = None;
        ng_module.injector_import_raws = None;
        return;
    }

    let mut filtered_items = Vec::new();
    let mut raw_items: Vec<(u32, oxc_span::Span)> = Vec::new();
    // Next position in `ɵinj.imports` (kept refs + verbatim entries, interleaved).
    let mut final_len: u32 = 0;
    let mut calculating = HashSet::new();

    // Whole-`imports` evaluation drives the NgModule scope; per-element evaluations drive `ɵinj.imports`.
    if let Some(imports_resolved) = &mut ng_module.imports {
        imports_resolved.complete_with(ctx, foreign).await;
    }
    if let Some(top_level_imports) = &mut ng_module.top_level_imports {
        futures::future::join_all(
            top_level_imports
                .iter_mut()
                .map(|entry| entry.resolved.complete_with(ctx, foreign)),
        )
        .await;
    }

    if let Some(top_level_imports) = ng_module.top_level_imports.as_deref() {
        raw_items.reserve(top_level_imports.len());
        for entry in top_level_imports {
            let item = entry.resolved.raw();
            // Keep a top-level `imports` element verbatim in `ɵinj.imports` when it contains a
            // `ModuleWithProviders` (filtering individual references would drop its providers) or
            // when all of its references survive filtering. Re-printing from source preserves
            // shapes a resolved reference cannot express (aliases, ternaries, spreads).
            // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L808-L815
            // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L863-L866
            if is_module_with_providers(item) {
                raw_items.push((final_len, entry.span));
                final_len += 1;
                continue;
            }
            // ngtsc appends surviving references per top-level element without deduplicating:
            // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L808-L876
            // Each non-MWP value lowers to one wire reference (or fails to lower and nulls
            // `injector_imports` wholesale), so appended count equals positions consumed.
            let before = filtered_items.len();
            let all_kept =
                collect_kept_imports(item, ctx, &mut calculating, &mut filtered_items).await;
            if all_kept {
                filtered_items.truncate(before);
                raw_items.push((final_len, entry.span));
                final_len += 1;
                continue;
            }
            final_len += (filtered_items.len() - before) as u32;
        }
    } else if let Some(imports_resolved) = &ng_module.imports {
        // Defensive fallback for an `NgModuleData` without recorded syntax (unreachable today: the
        // syntax query returns early for `.d.ts`). Degrades to reference filtering rather than
        // emitting no imports.
        if let ResolvedValue::Array(items) = imports_resolved.raw() {
            for item in items {
                let _ =
                    collect_kept_imports(item, ctx, &mut calculating, &mut filtered_items).await;
            }
        }
    }

    if let Some(exports_resolved) = &mut ng_module.exports {
        exports_resolved.complete_with(ctx, foreign).await;
        if let ResolvedValue::Array(items) = exports_resolved.raw() {
            // Verbatim entries interleave only with imports; export-derived entries follow them.
            for item in items {
                // Exported NgModules are appended without deduplicating against imports:
                // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L878-L888
                collect_exported_ng_modules(item, ctx, &mut filtered_items).await;
            }
        }
    }

    ng_module.injector_import_raws = if raw_items.is_empty() {
        None
    } else {
        Some(raw_items)
    };

    let origin = ng_module
        .imports
        .as_ref()
        .or(ng_module.exports.as_ref())
        .unwrap()
        .origin;

    let mut injector_imports = Resolved::from_syntax(ResolvedValue::Array(Vec::new()), origin);
    injector_imports.set_value(ResolvedValue::Array(filtered_items));

    ng_module.injector_imports = Some(injector_imports);
}

/// Whether `item` is flagged as `hasModuleWithProviders` by ngtsc's `resolveTypeList`: either the
/// recognizer's synthetic form (foreign `x.forRoot()` calls) or the `{ngModule: ...}` map form.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1257-L1267
fn is_module_with_providers(item: &ResolvedValue) -> bool {
    match item.unwrap_named() {
        ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders { .. }) => true,
        ResolvedValue::Map(map) => map.contains_key("ngModule"),
        ResolvedValue::Array(items) => items.iter().any(is_module_with_providers),
        _ => false,
    }
}

/// Flattens nested arrays and appends surviving references of a top-level `imports` element in
/// source order, returning `true` iff every leaf in `item` is a reference that survived (ngtsc's
/// condition for re-printing the element verbatim instead of emitting flattened references).
/// Non-reference leaves are kept in `out` but return `false` since they cannot be emitted verbatim.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1269-L1288
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L863-L875
fn collect_kept_imports<'a, Fs: ResourceResolverFs + Clone + 'static>(
    item: &'a ResolvedValue,
    ctx: &'a QueryCtx<Fs>,
    calculating: &'a mut HashSet<ReferenceId>,
    out: &'a mut Vec<ResolvedValue>,
) -> BoxFuture<'a, bool> {
    async move {
        if let ResolvedValue::Array(items) = item {
            let mut all_kept = true;
            for sub in items {
                // Do not short-circuit: surviving references in remaining entries must still be collected.
                all_kept &= collect_kept_imports(sub, ctx, calculating, out).await;
            }
            return all_kept;
        }
        if !should_keep_import(item, ctx, calculating).await {
            return false;
        }
        out.push(item.clone());
        matches!(item, ResolvedValue::Reference(_))
    }
    .boxed()
}

/// Appends the exported NgModules of an `exports` element: unwraps `ModuleWithProviders` entries
/// to their `ngModule` reference before recursing into nested arrays, matching `resolveTypeList`.
/// Unlike `imports` there is no verbatim `ModuleWithProviders` path: ngtsc emits only references
/// for exports, so an exported `X.forRoot()` contributes `X` and drops its `providers`.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1257-L1288
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L878-L888
fn collect_exported_ng_modules<'a, Fs: ResourceResolverFs + Clone + 'static>(
    item: &'a ResolvedValue,
    ctx: &'a QueryCtx<Fs>,
    out: &'a mut Vec<ResolvedValue>,
) -> BoxFuture<'a, ()> {
    async move {
        let unwrapped = unwrap_module_with_providers(item);
        let item = unwrapped.as_ref().unwrap_or(item);

        if let ResolvedValue::Array(items) = item {
            for sub in items {
                collect_exported_ng_modules(sub, ctx, out).await;
            }
            return;
        }
        if is_exported_ng_module(item, ctx).await {
            out.push(item.clone());
        }
    }
    .boxed()
}

/// Extracts the `ngModule` from a `ModuleWithProviders` value (either synthetic `X.forRoot()` or
/// object-literal `{ngModule: ...}` form), as `resolveTypeList` does. Divergence: a non-class
/// `ngModule` is a fatal NG1010 in ngtsc (handler.ts#L1287-L1307); we contribute nothing.
/// `collect_references` (`evaluator/resolved.rs`) unwraps the same two shapes; keep them in step.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1257-L1267
fn unwrap_module_with_providers(item: &ResolvedValue) -> Option<ResolvedValue> {
    match item.unwrap_named() {
        ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders { ng_module, .. }) => {
            Some(ResolvedValue::Reference(ng_module.clone()))
        }
        ResolvedValue::Map(map) => map.get("ngModule").cloned(),
        _ => None,
    }
}

/// Whether a single resolved import entry is kept in `ɵinj.imports`.
async fn should_keep_import<Fs: ResourceResolverFs + Clone + 'static>(
    item: &ResolvedValue,
    ctx: &QueryCtx<Fs>,
    calculating: &mut HashSet<ReferenceId>,
) -> bool {
    let ResolvedValue::Reference(r) = item else {
        return true;
    };
    let Some(reference_id) = r.reference_id else {
        return true;
    };
    let syntax_file = ctx.analyze_file_syntax(reference_id.file).await;
    let Some(class_info) = syntax_file.symbol_index.get(&reference_id) else {
        return true;
    };
    // Directives and pipes cannot carry providers; components are kept only if they may export
    // providers; NgModules and other references are kept unconditionally.
    // https://github.com/angular/angular/blob/96b8042/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L826-L861
    match class_info.class_type {
        ClassType::Directive | ClassType::Pipe => false,
        ClassType::Component => may_export_providers(class_info, ctx, calculating).await,
        _ => true,
    }
}

async fn is_exported_ng_module<Fs: ResourceResolverFs + Clone + 'static>(
    item: &ResolvedValue,
    ctx: &QueryCtx<Fs>,
) -> bool {
    let ResolvedValue::Reference(r) = item else {
        return false;
    };
    let Some(reference_id) = r.reference_id else {
        return false;
    };
    let syntax_file = ctx.analyze_file_syntax(reference_id.file).await;
    let Some(class_info) = syntax_file.symbol_index.get(&reference_id) else {
        return false;
    };
    class_info.class_type == ClassType::NgModule
}

fn may_export_providers<'a, Fs: ResourceResolverFs + Clone + 'static>(
    class_info: &'a ClassInfo,
    ctx: &'a QueryCtx<Fs>,
    calculating: &'a mut HashSet<ReferenceId>,
) -> BoxFuture<'a, bool> {
    async move {
        if calculating.contains(&class_info.reference_id) {
            return false;
        }
        calculating.insert(class_info.reference_id);

        let res = match class_info.class_type {
            ClassType::Directive | ClassType::Pipe => false,
            ClassType::NgModule => {
                class_info.may_declare_providers
                    || imports_may_export_providers(class_info, ctx, calculating).await
            }
            ClassType::Component if class_info.is_standalone == Some(true) => {
                // `.d.ts` components have no recorded `imports`, so upstream assumes yes (`assumedToExportProviders`).
                let fp = ctx.engine.lookup_path(class_info.reference_id.file);
                crate::utils::is_dts(&fp)
                    || imports_may_export_providers(class_info, ctx, calculating).await
            }
            _ => false,
        };

        calculating.remove(&class_info.reference_id);
        res
    }
    .boxed()
}

/// Whether any entry in `class_info.raw_imports` may export providers.
fn imports_may_export_providers<'a, Fs: ResourceResolverFs + Clone + 'static>(
    class_info: &'a ClassInfo,
    ctx: &'a QueryCtx<Fs>,
    calculating: &'a mut HashSet<ReferenceId>,
) -> BoxFuture<'a, bool> {
    async move {
        let Some(raw_imports) = &class_info.raw_imports else {
            return false;
        };
        let fp = ctx.engine.lookup_path(class_info.reference_id.file);
        for decl in raw_imports {
            let Some(imported) = resolve_declaration_async(decl, &fp, ctx).await else {
                continue;
            };
            if may_export_providers(&imported, ctx, calculating).await {
                return true;
            }
        }
        false
    }
    .boxed()
}
