//! NgModule scope queries: the bodies behind [`QueryKey::NgModuleExportsScope`] and
//! [`QueryKey::NgModuleImportsScope`], plus the recursive expansion helpers they use. Relocated
//! from `compiler/decorators/ng_module.rs` onto the [`QueryEngine`]; sub-queries are requested
//! through the engine's cached accessors so the transitive module graph is resolved once and shared.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use futures::future::{BoxFuture, FutureExt};

use crate::analyzer::flatten_class_info;
use crate::evaluator::{FromResolved, ScopeReferences};
use crate::query::keys::ModuleExportMap;
use crate::query::{FileId, QueryContext, QueryEngine, ReferenceId};
use crate::types::analysis::{DeclarationData, OwningReference};
use crate::ClassType;

pub(crate) async fn resolve_reference_async(
    reference: &crate::types::analysis::Reference,
    ctx: &QueryContext,
) -> Option<crate::ClassInfo> {
    let evaluated_file = ctx.analyze_file_evaluated(reference.file).await;
    evaluated_file.class_index.get(&reference.name).cloned()
}

async fn scope_references(
    slot: &crate::evaluator::Resolved<Vec<crate::types::analysis::Reference>>,
    ctx: &QueryContext,
) -> Option<Vec<crate::types::analysis::Reference>> {
    let mut completed = slot.clone();
    completed
        .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
        .await;
    ScopeReferences::from_value(completed.raw(), completed.origin).map(|refs| refs.0)
}

impl QueryEngine {
    /// All declarations (components/directives/pipes) transitively exported by an NgModule.
    pub(crate) async fn exports_scope_body(
        self: &Arc<Self>,
        reference_id: ReferenceId,
        ctx: &QueryContext,
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
        ctx: &'a QueryContext,
        visited: &'a mut HashSet<ReferenceId>,
    ) -> BoxFuture<'a, Vec<DeclarationData>> {
        async move {
            let local_result = ctx.analyze_file_syntax(reference_id.file).await;

            let Some(ng_module) = find_ng_module(reference_id, &local_result) else {
                return Vec::new();
            };

            let mut resolved_declarations = Vec::new();

            if let Some(ref exports_resolved) = ng_module.exports {
                if let Some(references) = scope_references(exports_resolved, ctx).await {
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
                            let decl_ref = if info.is_standalone.unwrap_or(true) {
                                self.ngmodule_imported_declaration_ref(r, &info)
                            } else {
                                r.clone()
                            };
                            if let Some(resolved) =
                                DeclarationData::from_class_info(decl_ref, &info, &flattened, false)
                            {
                                resolved_declarations.push(resolved);
                            }
                        }
                    }
                }
            }

            deduplicate_ngmodule_scope(resolved_declarations)
        }
        .boxed()
    }

    /// The full compilation scope (imports + declarations) visible to templates inside an NgModule.
    pub(crate) async fn imports_scope_body(
        self: &Arc<Self>,
        reference_id: ReferenceId,
        ctx: &QueryContext,
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

        // Imported NgModules' exports are expanded before local declarations (matching ngtsc).
        if let Some(ref imports_resolved) = ng_module.imports {
            if let Some(references) = scope_references(imports_resolved, ctx).await {
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

        if let Some(ref decls_resolved) = ng_module.declarations {
            if let Some(references) = scope_references(decls_resolved, ctx).await {
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
            declarations: deduplicate_ngmodule_scope(resolved_declarations),
            is_complete,
        })
    }

    /// Which name the entry point rooted at `file_id` publishes each declaration under
    /// ([`QueryKey::ModuleExportMap`]).
    pub(crate) async fn module_export_map_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext,
    ) -> Arc<ModuleExportMap> {
        let mut walk = ExportWalk::default();
        let table = module_export_table(ctx, file_id, &mut walk).await;
        Arc::new(export_names_by_decl(&table))
    }

    /// Recursively and concurrently expands the imports graph of an NgModule.
    pub(crate) fn expand_ngmodule_scope_async<'a>(
        self: &'a Arc<Self>,
        references: &'a [crate::types::analysis::Reference],
        visited_modules: &'a mut HashSet<ReferenceId>,
        out_declarations: &'a mut Vec<DeclarationData>,
        ctx: &'a QueryContext,
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
                    let decl_ref = self.ngmodule_imported_declaration_ref(r, &info);
                    if let Some(resolved) =
                        DeclarationData::from_class_info(decl_ref, &info, &flattened, false)
                    {
                        out_declarations.push(resolved);
                    }
                }
            }
            all_resolved
        }
        .boxed()
    }

    /// Reference carried by a standalone directive/component/pipe imported into an `@NgModule`.
    fn ngmodule_imported_declaration_ref(
        &self,
        r: &crate::types::analysis::Reference,
        info: &crate::ClassInfo,
    ) -> crate::types::analysis::Reference {
        if crate::utils::is_dts(&self.lookup_path(info.reference_id.file)) {
            return r.clone();
        }
        let mut aliases = HashMap::with_capacity(1);
        aliases.insert(info.reference_id.file, info.class_name.clone());
        crate::types::analysis::Reference {
            file: info.reference_id.file,
            name: info.class_name.clone(),
            owning_reference: None,
            aliases,
            is_default_export: r.is_default_export,
        }
    }
}

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

/// Deduplicates scope declarations with JavaScript `Map::set` semantics: the first occurrence of a
/// `ReferenceId` determines its position in the scope, while later occurrences overwrite the entry
/// at that position (updating `reference` / `owning_reference` to the latest re-export or local
/// declaration, matching ngtsc's `LocalModuleScopeRegistry.getExportedScope` / `compilationDirectives`).
fn deduplicate_ngmodule_scope(declarations: Vec<DeclarationData>) -> Vec<DeclarationData> {
    let mut index_by_id: HashMap<DeclKey, usize> = HashMap::with_capacity(declarations.len());
    let mut result: Vec<DeclarationData> = Vec::with_capacity(declarations.len());
    for decl in declarations {
        let key = (decl.reference.file, decl.reference.name.clone());
        if let Some(&idx) = index_by_id.get(&key) {
            result[idx] = decl;
        } else {
            index_by_id.insert(key, result.len());
            result.push(decl);
        }
    }
    result
}

/// `(declaring file, declared name)` stand-in for upstream's declaration-node key.
type DeclKey = (FileId, String);

/// Insertion-ordered map from published value-export name to class declaration (`getExportsOfModule`).
/// Only classes are recorded (`export declare const/function/enum` are absent), so do not reuse it
/// as a general export oracle. Source order exists only so [`export_names_by_decl`] matches
/// upstream's alias tie-break; a plain map would do if exact output parity stops mattering.
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
fn module_export_table<'a>(
    ctx: &'a QueryContext,
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

        // Resolve every unique `(specifier, ImportKind)` referenced by this module's exports in a
        // single concurrent wave before walking submodules, avoiding sequential async host stalls
        // and duplicate lookups for multiple re-exports from the same file.
        let mut unique_sources: Vec<(&str, crate::host::ImportKind)> = Vec::new();
        let mut seen_sources: HashSet<(&str, crate::host::ImportKind)> = HashSet::new();
        for a in &syntax.file_exports.local_aliases {
            if a.is_type {
                continue;
            }
            if let Some(binding) = import_binding(&syntax, &a.local_name) {
                if !binding.is_type
                    && binding.imported.is_some()
                    && seen_sources.insert((binding.specifier, crate::host::ImportKind::Static))
                {
                    unique_sources.push((binding.specifier, crate::host::ImportKind::Static));
                }
            }
        }
        for r in &syntax.file_exports.named {
            if !r.is_type
                && r.local_name != "*"
                && seen_sources.insert((r.source.as_str(), crate::host::ImportKind::ReExport))
            {
                unique_sources.push((r.source.as_str(), crate::host::ImportKind::ReExport));
            }
        }
        for wildcard in &syntax.file_exports.wildcards {
            if !wildcard.is_type
                && seen_sources.insert((
                    wildcard.source.as_str(),
                    crate::host::ImportKind::ReExport,
                ))
            {
                unique_sources.push((wildcard.source.as_str(), crate::host::ImportKind::ReExport));
            }
        }
        let resolved_sources: HashMap<(&str, crate::host::ImportKind), Option<FileId>> =
            futures::future::join_all(unique_sources.into_iter().map(|(specifier, kind)| async move {
                let target = resolve_export_source(ctx, file_id, specifier, kind).await;
                ((specifier, kind), target)
            }))
            .await
            .into_iter()
            .collect();

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
                    resolved_sources
                        .get(&(binding.specifier, crate::host::ImportKind::Static))
                        .copied()
                        .flatten(),
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
            let Some(target) = resolved_sources
                .get(&(r.source.as_str(), crate::host::ImportKind::ReExport))
                .copied()
                .flatten()
            else {
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
            let Some(target) = resolved_sources
                .get(&(wildcard.source.as_str(), crate::host::ImportKind::ReExport))
                .copied()
                .flatten()
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

async fn resolve_export_source(
    ctx: &QueryContext,
    from: FileId,
    source: &str,
    kind: crate::host::ImportKind,
) -> Option<FileId> {
    ctx.resolve_from_id(from, source, kind)
        .await
        .map(|(id, _)| id)
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

/// Propagates a `.d.ts` NgModule's absolute specifier to the declarations it exports (matching
/// `DtsMetadataReader.getNgModuleMetadata`) when the active [`ReferenceEmitStrategy`] uses owning
/// references; without it, flattened scope entries in package-private files degrade to relative
/// imports into the package. Strategies that emit directly from the declaring file (such as
/// [`PrefixImportStrategy`]) ignore `owning_reference` and skip walking the package export map.
/// Source NgModules keep their own relative references (`LocalModuleScopeRegistry`): rerouting
/// them through a tsconfig `paths` barrel could import the consumer back and close a cycle.
pub(crate) async fn propagate_owning_reference_validated(
    ctx: &QueryContext,
    declarations: &[DeclarationData],
    owning_reference: &Option<OwningReference>,
    parent_file: FileId,
) -> Vec<DeclarationData> {
    if !ctx.engine.reference_strategy.uses_owning_reference() {
        return declarations.to_vec();
    }
    let Some(owning) = owning_reference.as_ref() else {
        return declarations.to_vec();
    };
    if !declarations
        .iter()
        .any(|d| d.reference.owning_reference.is_none())
    {
        return declarations.to_vec();
    }
    let parent_path = ctx.engine.lookup_path(parent_file);
    if !crate::utils::is_dts(&parent_path) {
        return declarations.to_vec();
    }

    // Resolve the package entry point so re-exported aliases use the published name.
    let package_entry = ctx
        .resolve_from_id(
            parent_file,
            owning.specifier(),
            crate::host::ImportKind::Static,
        )
        .await
        .map(|(id, _)| id)
        .unwrap_or(parent_file);

    // Enumerate the entry point's exports once (matching ngtsc's `moduleExportsCache`): per-declaration
    // searches would re-walk the package and miss alternative export names required for the alias tie-break.
    let exports = ctx.module_export_map(package_entry).await;

    let mut result = Vec::with_capacity(declarations.len());
    for d in declarations {
        let mut d = d.clone();
        if d.reference.owning_reference.is_none() {
            let decl = (d.reference.file, d.reference.name.clone());
            d.reference.owning_reference = exports.get(&decl).map(|export_name| {
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
    use crate::resource_registry::ResourceRegistry;
    use crate::test_utils::create_test_fs;
    use oxc_resolver::{ResolveOptions, ResolverGeneric};
    use std::path::PathBuf;

    fn engine_for(files: &[(&str, &str)], entry: &str) -> Arc<QueryEngine> {
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
    ) -> (Arc<QueryEngine>, Arc<ModuleExportMap>) {
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

    #[test]
    fn prefix_strategy_skips_owning_reference_propagation() {
        let files = &[
            (
                "/workspace/pkg/index.d.ts",
                "export * from './shared.module';\n\
                 export * from './b';\n",
            ),
            (
                "/workspace/pkg/shared.module.d.ts",
                "import * as i0 from '@angular/core';\n\
                 import * as i1 from './b';\n\
                 export declare class SharedModule {\n\
                   static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, [typeof i1.B], never, [typeof i1.B]>;\n\
                 }\n",
            ),
            (
                "/workspace/pkg/b.d.ts",
                "import * as i0 from '@angular/core';\n\
                 export declare class B {\n\
                   static ɵcmp: i0.ɵɵComponentDeclaration<B, 'b-cmp', never, {}, {}, never, never, false, never>;\n\
                 }\n",
            ),
        ];
        let fs = create_test_fs(files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            "/workspace/pkg/shared.module.d.ts",
        )]));
        let strategy = Arc::new(crate::analyzer::import_emit::PrefixImportStrategy::new(
            "my_ws",
            vec![PathBuf::from("/workspace")],
        ));
        let engine = QueryEngine::new(fs, resolver, registry, entrypoints, strategy);
        let ctx = QueryContext::new(engine.clone());
        let module_file = engine.intern_path("/workspace/pkg/shared.module.d.ts");

        let owners: Vec<(String, Option<String>)> = futures::executor::block_on(async {
            let syntax = ctx.analyze_file_syntax(module_file).await;
            let module = syntax
                .class_index
                .get("SharedModule")
                .expect("SharedModule is indexed");
            let scope = ctx.ngmodule_exports_scope(module.reference_id).await;
            let owning = Some(OwningReference::from_source_specifier(
                "my_ws/pkg/index",
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
        });

        assert_eq!(owners, vec![("B".to_string(), None)]);
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

    #[test]
    fn source_standalone_imported_into_ngmodule_uses_canonical_reference() {
        let engine = engine_for(
            &[
                (
                    "/module.ts",
                    "import { NgModule } from '@angular/core';\n\
                     import { StandaloneCmp } from './component';\n\
                     @NgModule({ imports: [StandaloneCmp] })\n\
                     export class Module {}\n",
                ),
                (
                    "/component.ts",
                    "import { Component } from '@angular/core';\n\
                     @Component({ selector: 'standalone-cmp', template: '' })\n\
                     export class StandaloneCmp {}\n",
                ),
            ],
            "/module.ts",
        );
        let ctx = QueryContext::new(engine.clone());
        let module_file = engine.intern_path("/module.ts");
        let component_file = engine.intern_path("/component.ts");
        futures::executor::block_on(async {
            let syntax = ctx.analyze_file_syntax(module_file).await;
            let module = syntax.class_index.get("Module").expect("Module is indexed");
            let scope = ctx.ngmodule_imports_scope(module.reference_id).await;
            assert_eq!(scope.declarations.len(), 1);
            let decl = &scope.declarations[0];
            assert!(!decl.reference.aliases.contains_key(&module_file));
            assert_eq!(
                decl.reference.aliases.get(&component_file),
                Some(&"StandaloneCmp".to_string())
            );
        });
    }

    #[test]
    fn module_export_table_batches_and_deduplicates_export_resolutions() {
        use crate::host::{
            AnalysisHost, HostError, HostFuture, IdKind, ImportKind, LoadKind, LoadedModule,
            ModuleFormat, ModuleId, ResolveRequest, ResolvedModule, ResolvedResourceId,
            ResourceKind,
        };
        use std::sync::atomic::{AtomicUsize, Ordering};
        use std::sync::Mutex;

        fn yield_once<T: Send + 'static>(value: T) -> HostFuture<T> {
            let mut yielded = false;
            let mut value = Some(value);
            Box::pin(std::future::poll_fn(move |cx| {
                if !yielded {
                    yielded = true;
                    cx.waker().wake_by_ref();
                    std::task::Poll::Pending
                } else {
                    std::task::Poll::Ready(value.take().expect("polled after completion"))
                }
            }))
        }

        struct CountingExportHost {
            modules: HashMap<String, &'static str>,
            resolutions: HashMap<(String, String), String>,
            calls: Mutex<Vec<(String, String, ImportKind)>>,
            in_flight: Arc<AtomicUsize>,
            max_in_flight: AtomicUsize,
        }

        impl AnalysisHost for CountingExportHost {
            fn resolve(
                &self,
                req: ResolveRequest,
            ) -> HostFuture<Result<Option<ResolvedModule>, HostError>> {
                let active = self.in_flight.fetch_add(1, Ordering::SeqCst) + 1;
                self.max_in_flight.fetch_max(active, Ordering::SeqCst);
                self.calls
                    .lock()
                    .unwrap()
                    .push((req.importer.as_str().to_owned(), req.specifier.clone(), req.kind));
                let hit = self
                    .resolutions
                    .get(&(req.importer.as_str().to_owned(), req.specifier))
                    .map(|target| ResolvedModule {
                        id: ModuleId::new(target.as_str()),
                        id_kind: IdKind::Path,
                        format: Some(ModuleFormat::Dts),
                        external: false,
                        code: None,
                    });
                let in_flight = Arc::clone(&self.in_flight);
                Box::pin(async move {
                    let res = yield_once(Ok(hit)).await;
                    in_flight.fetch_sub(1, Ordering::SeqCst);
                    res
                })
            }

            fn load(
                &self,
                id: &ModuleId,
                kind: LoadKind,
                _external: bool,
            ) -> HostFuture<Result<Option<LoadedModule>, HostError>> {
                let hit = (kind == LoadKind::Module)
                    .then(|| self.modules.get(id.as_str()).copied())
                    .flatten()
                    .map(|code| LoadedModule {
                        code: Arc::from(code),
                        format: Some(ModuleFormat::Dts),
                    });
                yield_once(Ok(hit))
            }

            fn resolve_resource(
                &self,
                _containing: &ModuleId,
                _url: &str,
                _kind: ResourceKind,
            ) -> HostFuture<Result<Option<ResolvedResourceId>, HostError>> {
                yield_once(Ok(None))
            }
        }

        let modules = HashMap::from([
            (
                "/pkg/entry.d.ts".to_owned(),
                "import { LocalA } from './local';\n\
                 export { LocalA };\n\
                 export { ReA, ReB } from './named';\n\
                 export { ReC } from './named';\n\
                 export * from './star';\n",
            ),
            (
                "/pkg/local.d.ts".to_owned(),
                "export declare class LocalA {}\n",
            ),
            (
                "/pkg/named.d.ts".to_owned(),
                "export declare class ReA {}\n\
                 export declare class ReB {}\n\
                 export declare class ReC {}\n",
            ),
            (
                "/pkg/star.d.ts".to_owned(),
                "export declare class StarD {}\n",
            ),
        ]);
        let resolutions = HashMap::from([
            (
                ("/pkg/entry.d.ts".to_owned(), "./local".to_owned()),
                "/pkg/local.d.ts".to_owned(),
            ),
            (
                ("/pkg/entry.d.ts".to_owned(), "./named".to_owned()),
                "/pkg/named.d.ts".to_owned(),
            ),
            (
                ("/pkg/entry.d.ts".to_owned(), "./star".to_owned()),
                "/pkg/star.d.ts".to_owned(),
            ),
        ]);
        let host = Arc::new(CountingExportHost {
            modules,
            resolutions,
            calls: Mutex::new(Vec::new()),
            in_flight: Arc::new(AtomicUsize::new(0)),
            max_in_flight: AtomicUsize::new(0),
        });
        let engine = QueryEngine::new_default_with_host(
            host.clone(),
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        let entry_id = engine.intern_path("/pkg/entry.d.ts");
        let local_id = engine.intern_path("/pkg/local.d.ts");
        let named_id = engine.intern_path("/pkg/named.d.ts");
        let star_id = engine.intern_path("/pkg/star.d.ts");

        let ctx = QueryContext::new(engine);
        let map = futures::executor::block_on(ctx.module_export_map(entry_id));

        assert_eq!(map.get(&(local_id, "LocalA".to_owned())).map(String::as_str), Some("LocalA"));
        assert_eq!(map.get(&(named_id, "ReA".to_owned())).map(String::as_str), Some("ReA"));
        assert_eq!(map.get(&(named_id, "ReB".to_owned())).map(String::as_str), Some("ReB"));
        assert_eq!(map.get(&(named_id, "ReC".to_owned())).map(String::as_str), Some("ReC"));
        assert_eq!(map.get(&(star_id, "StarD".to_owned())).map(String::as_str), Some("StarD"));

        // All three unique export sources resolve concurrently in one wave without repeating `./named`.
        assert_eq!(host.max_in_flight.load(Ordering::SeqCst), 3);
        let calls = host.calls.lock().unwrap();
        assert_eq!(calls.len(), 3);
        assert!(calls.contains(&(
            "/pkg/entry.d.ts".to_owned(),
            "./local".to_owned(),
            ImportKind::Static
        )));
        assert!(calls.contains(&(
            "/pkg/entry.d.ts".to_owned(),
            "./named".to_owned(),
            ImportKind::ReExport
        )));
        assert!(calls.contains(&(
            "/pkg/entry.d.ts".to_owned(),
            "./star".to_owned(),
            ImportKind::ReExport
        )));
    }
}
