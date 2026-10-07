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
    // Next position in the final ɵinj.imports list (kept refs + verbatim entries,
    // interleaved); a filtered element advances it by the number of references it contributes.
    let mut final_len: u32 = 0;
    let mut calculating = HashSet::new();

    // The whole-`imports` evaluation drives the NgModule scope; the per-element evaluations
    // drive `ɵinj.imports`. ngtsc keeps the same two views for the same reason.
    if let Some(imports_resolved) = &mut ng_module.imports {
        imports_resolved.complete_with(ctx, foreign).await;
    }
    if let Some(top_level_imports) = &mut ng_module.top_level_imports {
        // Elements are independent, so their cross-file hole resolution is driven concurrently
        // rather than one await at a time.
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
            // ngtsc keeps a top-level `imports` element verbatim in `ɵinj.imports` when it
            // contains a `ModuleWithProviders` — it cannot filter individual references out of
            // such an expression without dropping the providers — or when none of its
            // references get filtered out:
            // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L808-L815
            // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L863-L866
            // Re-printing the element from source is what preserves shapes a resolved
            // reference cannot express: an identifier aliasing an array or a
            // `ModuleWithProviders` result, a ternary, a spread argument, or a non-array
            // `imports` value.
            if is_module_with_providers(item) {
                raw_items.push((final_len, entry.span));
                final_len += 1;
                continue;
            }
            // ngtsc never deduplicates: each top-level `imports` element is processed
            // independently and its surviving references are appended without checking
            // what is already in the list.
            // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L808-L876
            // Every value appended here either lowers to exactly one wire reference — so the
            // number of appended values is the number of positions consumed — or fails to
            // lower at all, which nulls `injector_imports` wholesale and makes the emitter
            // skip splicing rather than trust these indices. The values that would lower to
            // *several* references are the `ModuleWithProviders` maps, and those never reach
            // here: they take the verbatim branch above.
            //
            // The walk both collects the survivors and reports whether everything survived, so
            // the verdict costs no second pass over the element.
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
        // No source expressions to re-print: the module came from a `.d.ts`, where `imports` is
        // read off the `ɵɵNgModuleDeclaration` type parameter. Those entries are always plain
        // module references — a type parameter cannot carry a `ModuleWithProviders` call — so
        // there is nothing to keep verbatim and `raw_items` stays empty.
        //
        // Belt-and-braces: the syntax query short-circuits `.d.ts` files before this stage, so
        // no current caller reaches here. It is kept so that a `NgModuleData` without recorded
        // syntax degrades to reference filtering instead of silently emitting no imports.
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
            // `final_len` stays put here: verbatim entries interleave only with imports, and
            // export-derived entries always follow them.
            for item in items {
                // As with imports, ngtsc appends each exported NgModule without deduplicating
                // against entries already added — a module that is both imported and exported
                // legitimately appears twice.
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

    let mut injector_imports = Resolved::from_syntax(
        ResolvedValue::Array(Vec::new()), // Dummy initialization
        origin,
    );
    injector_imports.set_value(ResolvedValue::Array(filtered_items));

    ng_module.injector_imports = Some(injector_imports);
}

/// A value that ngtsc's `resolveTypeList` flags as `hasModuleWithProviders`: either the
/// recognizer's synthetic form (foreign `x.forRoot()`-style calls) or the structural form a
/// same-file provider function evaluates to (`{ngModule: SomeModule, ...}`).
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1257-L1267
fn is_module_with_providers(item: &ResolvedValue) -> bool {
    match item.unwrap_named() {
        ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders { .. }) => true,
        ResolvedValue::Map(map) => map.contains_key("ngModule"),
        ResolvedValue::Array(items) => items.iter().any(is_module_with_providers),
        _ => false,
    }
}

/// Appends the references of a top-level `imports` element that survive filtering, in source
/// order. ngtsc's `resolveTypeList` flattens nested arrays into a single `resolvedReferences`
/// list before filtering, and — once any reference has been filtered out — emits that flat list
/// of survivors rather than the user's expression, so nested arrays never reach the output:
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1268-L1288
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L863-L875
/// On the span-driven path, elements carrying a `ModuleWithProviders` never reach this function —
/// that caller re-prints them verbatim — which is what lets it count appended values to advance
/// `final_len`: the multi-reference values are exactly the ones routed away from here. The `.d.ts`
/// fallback has no spans to re-print with, so it calls this on the whole array and keeps whatever
/// survives; it does not advance `final_len` and so does not rely on the invariant.
/// Returns whether every value in `item` is a reference that survived — ngtsc's condition for
/// re-printing the element from source instead of using what was collected here
/// ("All references within this top-level import should be emitted"). A non-reference value
/// (a map, a primitive, a `DynamicValue`) is kept but reports `false`, because such an element
/// cannot be emitted verbatim.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L863-L866
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
                // Deliberately not short-circuiting: the survivors of the remaining entries
                // still have to be collected even once the verdict is settled.
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

/// Appends the exported NgModules of an `exports` element, mirroring the two things ngtsc's
/// `resolveTypeList` does before `resolve()` walks the flat `analysis.exports` list: unwrap
/// `ModuleWithProviders` entries to their `ngModule` reference, then recurse into nested arrays.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1256-L1288
///
/// The unwrapping is what makes `exports: [SomeModule.forRoot()]` contribute `SomeModule` to the
/// injector imports. Unlike the `imports` field there is no `hasModuleWithProviders` bail-out
/// here: `resolve()` only ever emits references for exports, never the user's expression
/// (handler.ts#L878-L888), so the unwrapped reference is emitted like any other exported module.
/// Note that the `providers` an exported `forRoot()` carries are dropped by ngtsc either way —
/// only the module itself, and therefore that module's own `providers`, reaches the injector.
///
/// Unwrapping happens before the array check, matching ngtsc's statement order, so an `ngModule`
/// that is itself an array is flattened rather than dropped. `exports` has been completed by the
/// caller, so no value here is `Named`-wrapped (`Named` only ever wraps `Incomplete`/`Dynamic`,
/// and `substitute` strips it once the inner value resolves).
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

/// The `ngModule` an entry carries, for the two `ModuleWithProviders` shapes `resolveTypeList`
/// unwraps: the recognizer's synthetic form (a foreign `X.forRoot()` whose return type names the
/// module) and the object-literal form a locally declared provider function evaluates to.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1256-L1267
///
/// `None` for anything else. Like ngtsc this keys the map form off the presence of the `ngModule`
/// property alone; an `ngModule` that is not a class reference then fails ngtsc's reference check
/// further down `resolveTypeList` with a fatal `NG1010` that aborts the NgModule's analysis
/// (handler.ts#L1289-L1306), whereas we simply contribute nothing. The `imports` side needs a
/// stricter test and uses [`is_module_with_providers`] instead — see the note there.
///
/// A third unwrapping of these same two shapes lives in `collect_references`
/// (`evaluator/resolved.rs`), which lowers the value list to wire references; keep them in step.
fn unwrap_module_with_providers(item: &ResolvedValue) -> Option<ResolvedValue> {
    match item.unwrap_named() {
        ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders { ng_module, .. }) => {
            Some(ResolvedValue::Reference(ng_module.clone()))
        }
        ResolvedValue::Map(map) => map.get("ngModule").cloned(),
        _ => None,
    }
}

/// Whether a top-level `imports` element consists purely of references that all survive
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
    // ngtsc's filtering loop, in order: a directive is dropped because it cannot carry
    // providers, a pipe likewise, a component is dropped unless it may export providers, and
    // everything else — an NgModule above all — is kept unconditionally. Note that the
    // provider question is asked *only* of components; an NgModule stays whether or not it
    // declares any.
    // https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L826-L861
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
            // An NgModule exports providers when it declares them, or when one of its own
            // imports does — not merely by being an NgModule.
            ClassType::NgModule => {
                class_info.may_declare_providers
                    || imports_may_export_providers(class_info, ctx, calculating).await
            }
            ClassType::Component if class_info.is_standalone == Some(true) => {
                // A component read from a `.d.ts` has no recorded `imports`, so the question
                // cannot be answered there and upstream assumes yes
                // (`assumedToExportProviders`).
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

/// Whether any entry of `class_info`'s own `imports` may export providers — the recursive half
/// of `mayExportProviders`, shared by the standalone-component and NgModule cases.
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
