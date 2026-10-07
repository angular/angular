//! NgModule scope queries: the bodies behind [`QueryKey::NgModuleExportsScope`] and
//! [`QueryKey::NgModuleImportsScope`], plus the recursive expansion helpers they use. Relocated
//! from `compiler/decorators/ng_module.rs` onto the [`QueryEngine`]; sub-queries are requested
//! through the engine's cached accessors so the transitive module graph is resolved once and shared.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use crate::ResourceResolverFs;
use futures::future::{BoxFuture, FutureExt};

use crate::analyzer::flatten_class_info;
use crate::query::keys::ModuleExportMap;
use crate::query::{FileId, QueryContext, QueryEngine, ReferenceId};
use crate::types::analysis::{DeclarationData, OwningReference};
use crate::ClassType;

pub(crate) async fn resolve_reference_async<Fs: ResourceResolverFs + Clone + 'static>(
    reference: &crate::types::analysis::Reference,
    ctx: &QueryContext<Fs>,
) -> Option<crate::ClassInfo> {
    let evaluated_file = ctx.analyze_file_evaluated(reference.file).await;
    evaluated_file.class_index.get(&reference.name).cloned()
}

impl<Fs: ResourceResolverFs + Clone + 'static> QueryEngine<Fs> {
    /// All declarations (components/directives/pipes) transitively exported by an NgModule.
    pub(crate) async fn exports_scope_body(
        self: &Arc<Self>,
        reference_id: ReferenceId,
        ctx: &QueryContext<Fs>,
    ) -> Arc<Vec<DeclarationData>> {
        let mut visited = HashSet::new();
        visited.insert(reference_id);
        Arc::new(
            self.exports_scope_internal(reference_id, ctx, &mut visited)
                .await,
        )
    }

    fn exports_scope_internal<'a>(
        self: &'a Arc<Self>,
        reference_id: ReferenceId,
        ctx: &'a QueryContext<Fs>,
        visited: &'a mut HashSet<ReferenceId>,
    ) -> BoxFuture<'a, Vec<DeclarationData>> {
        async move {
            // Await local analysis of the NgModule's file to populate its symbol table.
            let local_result = ctx.analyze_file_syntax(reference_id.file).await;

            let Some(ng_module) = find_ng_module(reference_id, &local_result) else {
                return Vec::new();
            };

            let mut resolved_declarations = Vec::new();

            if let Some(ref exports_resolved) = ng_module.exports {
                let mut completed = exports_resolved.clone();
                completed
                    .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
                    .await;
                if let Some(references) = completed.get_optional() {
                    let mut resolve_futures = Vec::new();
                    for r in &references {
                        resolve_futures.push((r, resolve_reference_async(r, ctx)));
                    }

                    let (items, futures): (Vec<_>, Vec<_>) = resolve_futures.into_iter().unzip();
                    let results = futures::future::join_all(futures).await;

                    for (r, resolved_info) in items.into_iter().zip(results) {
                        let Some(info) = resolved_info else {
                            continue;
                        };

                        if info.class_type == ClassType::NgModule {
                            if !visited.insert(info.reference_id) {
                                continue;
                            }

                            let sub_scope = self
                                .exports_scope_internal(info.reference_id, ctx, visited)
                                .await;
                            let mapped = propagate_owning_reference_validated(
                                ctx,
                                &sub_scope,
                                &r.owning_reference,
                                info.reference_id.file,
                            )
                            .await;
                            resolved_declarations.extend(mapped);
                        } else if info.class_type == ClassType::Component
                            || info.class_type == ClassType::Directive
                            || info.class_type == ClassType::Pipe
                        {
                            let flattened = flatten_class_info(info.clone(), ctx).await;
                            if let Some(resolved) = DeclarationData::from_class_info(
                                r.clone(),
                                &info,
                                &flattened,
                                false,
                            ) {
                                resolved_declarations.push(resolved);
                            }
                        }
                    }
                }
            }

            resolved_declarations
        }
        .boxed()
    }

    /// The full compilation scope (imports + declarations) visible to templates inside an NgModule.
    pub(crate) async fn imports_scope_body(
        self: &Arc<Self>,
        reference_id: ReferenceId,
        ctx: &QueryContext<Fs>,
    ) -> Arc<crate::query::keys::NgModuleImportsScopeData> {
        let fp = self.lookup_path(reference_id.file);

        let is_dts = crate::utils::is_dts(&fp);
        if is_dts {
            // A `.d.ts` NgModule has no separate imports scope; its exports scope is the whole scope.
            let exports = ctx.ngmodule_exports_scope(reference_id).await;
            return Arc::new(crate::query::keys::NgModuleImportsScopeData {
                declarations: (*exports).clone(),
                is_complete: true,
            });
        }

        let local_result = ctx.analyze_file_syntax(reference_id.file).await;

        let Some(ng_module) = find_ng_module(reference_id, &local_result) else {
            return Arc::new(crate::query::keys::NgModuleImportsScopeData {
                declarations: Vec::new(),
                is_complete: true,
            });
        };

        let mut resolved_declarations = Vec::new();
        let mut is_complete = true;

        let foreign = crate::analyzer::resolvers::angular_foreign_resolvers();

        // 1. Imports (recursively expands imported NgModules' exports first, matching ngtsc LocalModuleScopeRegistry).
        if let Some(ref imports_resolved) = ng_module.imports {
            let mut completed = imports_resolved.clone();
            completed.complete_with(ctx, foreign).await;
            if let Some(references) = completed.get_optional() {
                let mut visited_modules = HashSet::new();
                let all_resolved = self
                    .expand_ngmodule_scope_async(
                        &references,
                        &mut visited_modules,
                        &mut resolved_declarations,
                        ctx,
                    )
                    .await;
                if !all_resolved {
                    is_complete = false;
                }
            } else {
                is_complete = false;
            }
        }

        // 2. Local declarations of the module (added second, taking precedence over imports in ngtsc).
        if let Some(ref decls_resolved) = ng_module.declarations {
            let mut completed = decls_resolved.clone();
            completed.complete_with(ctx, foreign).await;
            if let Some(references) = completed.get_optional() {
                let mut resolve_futures = Vec::new();
                for r in &references {
                    resolve_futures.push((r, resolve_reference_async(r, ctx)));
                }

                let (items, futures): (Vec<_>, Vec<_>) = resolve_futures.into_iter().unzip();
                let results = futures::future::join_all(futures).await;

                for (r, resolved_info) in items.into_iter().zip(results) {
                    let Some(info) = resolved_info else {
                        is_complete = false;
                        continue;
                    };

                    let flattened = flatten_class_info(info.clone(), ctx).await;
                    if let Some(resolved) =
                        DeclarationData::from_class_info(r.clone(), &info, &flattened, false)
                    {
                        resolved_declarations.push(resolved);
                    }
                }
            } else {
                is_complete = false;
            }
        }

        Arc::new(crate::query::keys::NgModuleImportsScopeData {
            declarations: resolved_declarations,
            is_complete,
        })
    }

    /// Which name the entry point rooted at `file_id` publishes each declaration under.
    /// The body behind [`QueryKey::ModuleExportMap`].
    pub(crate) async fn module_export_map_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext<Fs>,
    ) -> Arc<ModuleExportMap> {
        let mut walk = ExportWalk::default();
        let table = module_export_table(ctx, file_id, &mut walk).await;
        Arc::new(export_names_by_decl(&table))
    }

    /// Recursively and concurrently expands the imports graph of an NgModule. Imported NgModules
    /// have their exports scopes queried (driven concurrently via `join_all`).
    pub(crate) fn expand_ngmodule_scope_async<'a>(
        self: &'a Arc<Self>,
        references: &'a [crate::types::analysis::Reference],
        visited_modules: &'a mut HashSet<ReferenceId>,
        out_declarations: &'a mut Vec<DeclarationData>,
        ctx: &'a QueryContext<Fs>,
    ) -> BoxFuture<'a, bool> {
        async move {
            let mut all_resolved = true;
            let mut resolve_futures = Vec::new();
            for r in references {
                resolve_futures.push((r, resolve_reference_async(r, ctx)));
            }

            let (items, futures): (Vec<_>, Vec<_>) = resolve_futures.into_iter().unzip();
            let results = futures::future::join_all(futures).await;

            for (r, resolved_info) in items.into_iter().zip(results) {
                let Some(info) = resolved_info else {
                    all_resolved = false;
                    continue;
                };

                if info.class_type == ClassType::NgModule {
                    if !visited_modules.insert(info.reference_id) {
                        continue;
                    }

                    let sub_scope = ctx.ngmodule_exports_scope(info.reference_id).await;
                    let mapped = propagate_owning_reference_validated(
                        ctx,
                        &sub_scope,
                        &r.owning_reference,
                        info.reference_id.file,
                    )
                    .await;
                    out_declarations.extend(mapped);
                } else if info.class_type == ClassType::Component
                    || info.class_type == ClassType::Directive
                    || info.class_type == ClassType::Pipe
                {
                    let flattened = flatten_class_info(info.clone(), ctx).await;
                    if let Some(resolved) =
                        DeclarationData::from_class_info(r.clone(), &info, &flattened, false)
                    {
                        out_declarations.push(resolved);
                    }
                }
            }
            all_resolved
        }
        .boxed()
    }
}

/// Find the NgModule data for `reference_id` in this file, confirming the class was registered
/// during local analysis.
fn find_ng_module(
    reference_id: ReferenceId,
    local_result: &crate::FileData,
) -> Option<&crate::analyzer::NgModuleData> {
    let class = local_result
        .classes
        .iter()
        .find(|cs| cs.reference_id == reference_id)?;

    class.as_ng_module()
}

/// Upstream keys its export map by declaration node; `(declaring file, declared name)` is the
/// closest stand-in oxc gives us, and `class_index` and `Reference` agree on it.
type DeclKey = (FileId, String);

/// Published name -> the declaration behind it. Mirrors `getExportsOfModule`. Value exports
/// only: a type-only export cannot back the value-position references this compiler emits.
/// Records only class declarations
/// (`export declare const/function/enum` never enter `local_aliases`), so it must not be reused
/// as a general export oracle.
///
/// Insertion-ordered solely to match upstream's emitted alias choice: exports enumerate in
/// source order and the tie-break in [`export_names_by_decl`] keeps the positionally last name.
/// Any published alias imports the same declaration, so a plain map can replace this if exact
/// output parity stops mattering. The name index keeps lookups O(1).
#[derive(Default)]
struct ExportTable {
    entries: Vec<(String, DeclKey)>,
    index: HashMap<String, usize>,
}

impl ExportTable {
    fn new() -> Self {
        Self::default()
    }

    fn get(&self, name: &str) -> Option<&DeclKey> {
        self.index.get(name).map(|&i| &self.entries[i].1)
    }

    /// Insert at the end, or replace in place when `name` is already published.
    fn insert(&mut self, name: String, decl: DeclKey) {
        match self.index.get(&name) {
            Some(&i) => self.entries[i].1 = decl,
            None => {
                self.index.insert(name.clone(), self.entries.len());
                self.entries.push((name, decl));
            }
        }
    }

    fn iter(&self) -> impl Iterator<Item = &(String, DeclKey)> {
        self.entries.iter()
    }
}

/// State shared by one entry point's export walk.
#[derive(Default)]
struct ExportWalk {
    memo: HashMap<FileId, Arc<ExportTable>>,
    on_stack: HashSet<FileId>,
    /// Bumped whenever a re-export cycle is cut. A table computed while a cycle was cut is
    /// missing that edge, so it must not be memoized for unrelated callers.
    cuts: u32,
}

/// Every name the module rooted at `file_id` publishes.
///
/// Re-exports are followed, not matched by name: `export {X} from './y'` proves nothing unless
/// `./y` publishes an `X`, and only `./y` knows which declaration that is.
fn module_export_table<'a, Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &'a QueryContext<Fs>,
    file_id: FileId,
    walk: &'a mut ExportWalk,
) -> BoxFuture<'a, Arc<ExportTable>> {
    Box::pin(async move {
        if let Some(cached) = walk.memo.get(&file_id) {
            return cached.clone();
        }
        // No visit budget: `on_stack` already terminates the walk, and a cap misreads a
        // wide-but-legal fan-out as unexported. Upstream's `enumerateExportsOfModule` has none.
        if !walk.on_stack.insert(file_id) {
            walk.cuts += 1;
            return Arc::new(ExportTable::new());
        }
        let cuts_before = walk.cuts;

        let syntax = ctx.analyze_file_syntax(file_id).await;
        let mut table = ExportTable::new();

        // `class_index` also holds non-exported `declare class`es, so it cannot prove export;
        // `local_aliases` is where exported declarations land.
        for a in &syntax.file_exports.local_aliases {
            if a.is_type {
                continue;
            }
            // `import {X} from './y'; export {X}` publishes `./y`'s declaration, not one of ours.
            if let Some(binding) = import_binding(&syntax, &a.local_name) {
                // `import type {X} ...; export {X}` publishes a type-only alias.
                if binding.is_type {
                    continue;
                }
                let (Some(imported), Some(target)) = (
                    binding.imported,
                    resolve_export_source(ctx, &syntax.file_path, binding.specifier),
                ) else {
                    continue;
                };
                let sub = module_export_table(ctx, target, &mut *walk).await;
                if let Some(decl) = sub.get(imported) {
                    table.insert(a.exported_name.clone(), decl.clone());
                }
                continue;
            }
            table.insert(a.exported_name.clone(), (file_id, a.local_name.clone()));
        }

        for r in &syntax.file_exports.named {
            // `export * as ns from './z'` publishes a namespace object, not a declaration.
            if r.is_type || r.local_name == "*" {
                continue;
            }
            let Some(target) = resolve_export_source(ctx, &syntax.file_path, &r.source) else {
                continue;
            };
            let sub = module_export_table(ctx, target, &mut *walk).await;
            if let Some(decl) = sub.get(&r.local_name) {
                table.insert(r.exported_name.clone(), decl.clone());
            }
        }

        // `export *` fills only the names the explicit exports left free, never `default`, and a
        // name two stars disagree on is ambiguous and so not exported at all. Encounter order is
        // kept: star-filled names enumerate after the explicit exports, as upstream's checker
        // reports them.
        let mut starred: Vec<(String, Option<DeclKey>)> = Vec::new();
        let mut starred_index: HashMap<String, usize> = HashMap::new();
        for wildcard in &syntax.file_exports.wildcards {
            if wildcard.is_type {
                continue;
            }
            let Some(target) = resolve_export_source(ctx, &syntax.file_path, &wildcard.source)
            else {
                continue;
            };
            let sub = module_export_table(ctx, target, &mut *walk).await;
            for (name, decl) in sub.iter() {
                if name == "default" {
                    continue;
                }
                match starred_index.get(name.as_str()) {
                    Some(&i) => {
                        let seen = &mut starred[i].1;
                        if seen.as_ref() != Some(decl) {
                            *seen = None;
                        }
                    }
                    None => {
                        starred_index.insert(name.clone(), starred.len());
                        starred.push((name.clone(), Some(decl.clone())));
                    }
                }
            }
        }
        for (name, decl) in starred {
            let Some(decl) = decl else {
                continue;
            };
            if table.get(&name).is_none() {
                table.insert(name, decl);
            }
        }

        walk.on_stack.remove(&file_id);
        let table = Arc::new(table);
        if walk.cuts == cuts_before {
            walk.memo.insert(file_id, table.clone());
        }
        table
    })
}

/// Where a local binding is imported from, if it is imported rather than declared here. A `None`
/// imported name is `import * as ns` — a namespace object, not a declaration.
struct ImportedBinding<'a> {
    specifier: &'a str,
    imported: Option<&'a str>,
    is_type: bool,
}

fn import_binding<'a>(syntax: &'a crate::FileData, local: &str) -> Option<ImportedBinding<'a>> {
    syntax.import_declarations.iter().find_map(|decl| {
        decl.bindings
            .iter()
            .find(|b| b.local == local)
            .map(|b| ImportedBinding {
                specifier: decl.specifier.as_str(),
                imported: b.imported.as_deref(),
                is_type: b.is_type,
            })
    })
}

fn resolve_export_source<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryContext<Fs>,
    from: &std::path::Path,
    source: &str,
) -> Option<FileId> {
    crate::evaluator::cross_file::resolve_specifier(ctx.engine.resolver.as_ref(), from, source)
        .map(|path| ctx.engine.intern_path(&path))
}

/// Invert the table into upstream's `exportMap`: declaration -> the name it is published under,
/// preferring an export whose name matches the declared name over a private bundler alias
/// (`ɵangular_packages_forms_forms_a`). Mirrors `enumerateExportsOfModule`.
fn export_names_by_decl(table: &ExportTable) -> ModuleExportMap {
    let mut by_decl = ModuleExportMap::new();
    for (name, decl) in table.iter() {
        if by_decl
            .get(decl)
            .is_some_and(|existing| existing == &decl.1)
        {
            continue;
        }
        by_decl.insert(decl.clone(), name.clone());
    }
    by_decl
}

/// Propagates a `.d.ts` NgModule's absolute specifier to the declarations it exports.
///
/// Optimize mode flattens scopes to direct declaration dependencies, and a declaration in a
/// package-private file has no absolute owning module of its own — without propagation its
/// import degrades to a relative path into the package, which Google3/Bazel-style layouts
/// reject.
///
/// Only an NgModule read from a declaration file hands its owning module down, as upstream's
/// `DtsMetadataReader.getNgModuleMetadata` evaluates the `ɵmod` type with the module reference's
/// `bestGuessOwningModule`. A source NgModule's scope is made of the references resolved in its
/// own file (`LocalModuleScopeRegistry`), so a declaration it imported relatively keeps no owning
/// module and is imported from its declaring file. Reaching the NgModule through a bare specifier
/// (a tsconfig `paths` barrel) must not reroute that import through the barrel, which may import
/// the consumer back and close a cycle.
pub(crate) async fn propagate_owning_reference_validated<
    Fs: ResourceResolverFs + Clone + 'static,
>(
    ctx: &QueryContext<Fs>,
    declarations: &[DeclarationData],
    owning_reference: &Option<OwningReference>,
    parent_file: FileId,
) -> Vec<DeclarationData> {
    let parent_path = ctx.engine.lookup_path(parent_file);
    if !crate::utils::is_dts(&parent_path) {
        return declarations.to_vec();
    }

    // Recorded owning modules are absolute by construction.
    let absolute_owning = owning_reference.as_ref();

    // The export name has to come from the package's *entry point*, not from the file that
    // happens to declare the symbol: a barrel may rename on the way out
    // (`export {InternalDir as PublicDir} from './deep'`), and an importer of the package can
    // only write the name the package publishes. Falling back to the declaring file preserves
    // the previous behaviour when the specifier can't be resolved.
    let package_entry = absolute_owning
        .and_then(|owning| {
            crate::evaluator::cross_file::resolve_specifier(
                ctx.engine.resolver.as_ref(),
                &parent_path,
                owning.specifier(),
            )
        })
        .map(|path| ctx.engine.intern_path(&path))
        .unwrap_or(parent_file);

    // Enumerate the entry point's exports once and answer every declaration from the result,
    // as upstream does with its per-specifier `moduleExportsCache`. Searching per declaration
    // would re-walk the package for each one, and could not see a declaration's other export
    // names — the tie-break needs all of them.
    let exports = match absolute_owning {
        Some(_) => ctx.module_export_map(package_entry).await,
        None => Arc::new(ModuleExportMap::new()),
    };

    let mut result = Vec::with_capacity(declarations.len());
    for d in declarations {
        let mut d = d.clone();
        // An owning module is only ever recorded for an absolute specifier.
        let current_is_absolute = d.reference.owning_reference.is_some();

        if !current_is_absolute {
            // `export_name` is how `owning` exposes the symbol, which is exactly what an
            // importer of that package must write. No entry means it is not published at all.
            let decl = (d.reference.file, d.reference.name.clone());
            let published = absolute_owning.zip(exports.get(&decl));
            d.reference.owning_reference = published.map(|(owning, export_name)| {
                OwningReference::from_source_specifier(owning.specifier(), export_name.clone())
            });
        }
        result.push(d);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fs::OverlayFileSystem;
    use crate::resource_registry::ResourceRegistry;
    use crate::test_utils::create_test_fs;
    use oxc_resolver::{ResolveOptions, ResolverGeneric};
    use std::path::PathBuf;

    fn engine_for(files: &[(&str, &str)], entry: &str) -> Arc<QueryEngine<OverlayFileSystem>> {
        let fs = create_test_fs(files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(entry)]));
        QueryEngine::new_default(fs, resolver, registry, entrypoints)
    }

    fn export_map_for(
        files: &[(&str, &str)],
        entry: &str,
    ) -> (Arc<QueryEngine<OverlayFileSystem>>, Arc<ModuleExportMap>) {
        let engine = engine_for(files, entry);
        let ctx = QueryContext::new(engine.clone());
        let entry_id = engine.intern_path(entry);
        let map = futures::executor::block_on(ctx.module_export_map(entry_id));
        (engine, map)
    }

    /// `import type {X} …; export {X}` publishes a type-only alias; only the value-imported
    /// binding may be stamped with the package specifier.
    #[test]
    fn dts_type_only_import_reexport_is_not_published() {
        let (engine, map) = export_map_for(
            &[
                (
                    "entry.d.ts",
                    "import type { TypeDirective } from './impl';\n\
                     import { ValueDirective } from './impl';\n\
                     export { TypeDirective, ValueDirective };\n",
                ),
                (
                    "impl.d.ts",
                    "export declare class TypeDirective {}\n\
                     export declare class ValueDirective {}\n",
                ),
            ],
            "entry.d.ts",
        );
        let impl_id = engine.intern_path("impl.d.ts");
        assert_eq!(
            map.get(&(impl_id, "ValueDirective".to_string())),
            Some(&"ValueDirective".to_string())
        );
        assert!(!map.contains_key(&(impl_id, "TypeDirective".to_string())));
    }

    /// Same shape in a `.ts` entry point, where the spec folds the export into an indirect
    /// export entry carrying the import's type-only flag.
    #[test]
    fn ts_type_only_import_reexport_is_not_published() {
        let (engine, map) = export_map_for(
            &[
                (
                    "entry.ts",
                    "import type { TypeThing } from './impl';\n\
                     import { ValueThing } from './impl';\n\
                     export { TypeThing, ValueThing };\n",
                ),
                (
                    "impl.ts",
                    "export class TypeThing {}\n\
                     export class ValueThing {}\n",
                ),
            ],
            "entry.ts",
        );
        let impl_id = engine.intern_path("impl.ts");
        assert_eq!(
            map.get(&(impl_id, "ValueThing".to_string())),
            Some(&"ValueThing".to_string())
        );
        assert!(!map.contains_key(&(impl_id, "TypeThing".to_string())));
    }

    /// Propagates `shared`, the specifier `SharedModule` was imported by, over the exports scope
    /// of the NgModule declared in `module_path`, and reports the owning module each exported
    /// declaration ends up with. The `shared` entry point publishes `B` in every case, so the
    /// export check never masks whether propagation happened.
    fn owners_after_propagation(
        files: &[(&str, &str)],
        module_path: &str,
    ) -> Vec<(String, Option<String>)> {
        let engine = engine_for(files, module_path);
        let ctx = QueryContext::new(engine.clone());
        let module_file = engine.intern_path(module_path);
        futures::executor::block_on(async {
            let syntax = ctx.analyze_file_syntax(module_file).await;
            let module = syntax
                .class_index
                .get("SharedModule")
                .expect("SharedModule is indexed");
            let scope = ctx.ngmodule_exports_scope(module.reference_id).await;
            let owning = Some(OwningReference::from_source_specifier(
                "shared",
                "SharedModule",
            ));
            propagate_owning_reference_validated(&ctx, &scope, &owning, module_file)
                .await
                .into_iter()
                .map(|d| {
                    let owner = d
                        .reference
                        .owning_reference
                        .map(|o| o.specifier().to_string());
                    (d.reference.name, owner)
                })
                .collect()
        })
    }

    /// A `.d.ts` NgModule hands its owning module to the declarations it exports, as
    /// `DtsMetadataReader.getNgModuleMetadata` does.
    #[test]
    fn dts_ngmodule_propagates_owning_module() {
        let owners = owners_after_propagation(
            &[
                (
                    "/node_modules/shared/index.d.ts",
                    "export * from './shared.module';\n\
                     export * from './b';\n",
                ),
                (
                    "/node_modules/shared/shared.module.d.ts",
                    "import * as i0 from '@angular/core';\n\
                     import * as i1 from './b';\n\
                     export declare class SharedModule {\n\
                       static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, [typeof i1.B], never, [typeof i1.B]>;\n\
                     }\n",
                ),
                (
                    "/node_modules/shared/b.d.ts",
                    "import * as i0 from '@angular/core';\n\
                     export declare class B {\n\
                       static ɵcmp: i0.ɵɵComponentDeclaration<B, 'b-cmp', never, {}, {}, never, never, false, never>;\n\
                     }\n",
                ),
            ],
            "/node_modules/shared/shared.module.d.ts",
        );
        assert_eq!(owners, vec![("B".to_string(), Some("shared".to_string()))]);
    }

    /// A source NgModule's scope keeps the references resolved in its own file
    /// (`LocalModuleScopeRegistry`). `B` was imported relatively, so it keeps no owning module
    /// and is imported from its declaring file rather than through the entry point
    /// `SharedModule` was reached by.
    #[test]
    fn source_ngmodule_does_not_propagate_owning_module() {
        let owners = owners_after_propagation(
            &[
                (
                    "/node_modules/shared/index.ts",
                    "export * from './shared.module';\n\
                     export * from './b';\n",
                ),
                (
                    "/node_modules/shared/shared.module.ts",
                    "import { NgModule } from '@angular/core';\n\
                     import { B } from './b';\n\
                     @NgModule({ declarations: [B], exports: [B] })\n\
                     export class SharedModule {}\n",
                ),
                (
                    "/node_modules/shared/b.ts",
                    "import { Component } from '@angular/core';\n\
                     @Component({ selector: 'b-cmp', template: '', standalone: false })\n\
                     export class B {}\n",
                ),
            ],
            "/node_modules/shared/shared.module.ts",
        );
        assert_eq!(owners, vec![("B".to_string(), None)]);
    }
}
