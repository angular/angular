use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, RwLock};

use crate::ResourceResolverFs;
use futures::future::{BoxFuture, FutureExt};
use oxc_resolver::ResolverGeneric;

use crate::analyzer::DecoratorData;
use crate::compiler::async_compiler::spawn_shared;
use crate::compiler::decorators::component::{
    optimize_component, populate_local_component_extra_imports,
};
use crate::compiler::decorators::ng_module::optimize_ng_module;

use crate::query::keys::{CachedResult, QueryKey, QueryValue};
use crate::query::{FileId, FileIdInterner, QueryContext};
use crate::resource_registry::ResourceRegistry;
use crate::utils::is_ts_source;
use crate::{ClassInfo, FileData, NgModuleComponentMap};

/// Cheap-to-clone handle to the [`QueryEngine`] that is captured into every query body. Sub-queries
/// are requested through this handle (`ctx.analyze_file_semantic(p).await`) instead of threading
/// `fs`/`resolver`/`resource_registry`/`file_analysis` through every call.
pub type QueryCtx<Fs> = Arc<QueryEngine<Fs>>;

/// The unified query engine.
///
/// Every "question" the analyzer answers is a [`QueryKey`]; [`QueryEngine::query`] returns a cached,
/// self-driving handle (the body is spawned onto the executor the moment the key is first
/// requested, so `join_all` over several queries fans out across pool threads). The engine owns the
/// ambient analysis state (`fs`, `resolver`, `resource_registry`, `entrypoints`) so query bodies
/// don't have to thread it; the cross-file symbol table lives on the `AnalyzeFileSyntax` results.
///
/// `Fs` is kept generic so a future virtual-filesystem-only WASM backend can be plugged in; the
/// concrete `Analyzer` instantiates `QueryEngine<OverlayFileSystem>` today.
pub struct QueryEngine<Fs: ResourceResolverFs + Clone + 'static> {
    pub(crate) fs: Fs,
    pub(crate) resolver: Arc<ResolverGeneric<Fs>>,
    pub(crate) resource_registry: Arc<ResourceRegistry>,
    pub(crate) entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
    pub(crate) interner: Arc<FileIdInterner>,
    pub(crate) reverse_index: RwLock<HashMap<FileId, HashSet<QueryKey>>>,
    pub(crate) cache: crate::QueryCache<QueryKey, CachedResult>,
    pub(crate) static_import_graph: RwLock<Option<Arc<StaticImportGraph>>>,
    pub(crate) reference_strategy: Arc<dyn crate::analyzer::import_emit::ReferenceEmitStrategy>,
    pub generate_extra_imports_in_local_mode: bool,
    pub compile_non_exported_classes: bool,
}

impl<Fs: ResourceResolverFs + Clone + 'static> QueryEngine<Fs> {
    pub fn new(
        fs: Fs,
        resolver: Arc<ResolverGeneric<Fs>>,
        resource_registry: Arc<ResourceRegistry>,
        entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
        reference_strategy: Arc<dyn crate::analyzer::import_emit::ReferenceEmitStrategy>,
    ) -> Arc<Self> {
        Self::new_with_options(
            fs,
            resolver,
            resource_registry,
            entrypoints,
            reference_strategy,
            false,
            true,
        )
    }

    pub fn new_with_options(
        fs: Fs,
        resolver: Arc<ResolverGeneric<Fs>>,
        resource_registry: Arc<ResourceRegistry>,
        entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
        reference_strategy: Arc<dyn crate::analyzer::import_emit::ReferenceEmitStrategy>,
        generate_extra_imports_in_local_mode: bool,
        compile_non_exported_classes: bool,
    ) -> Arc<Self> {
        Arc::new(Self {
            fs,
            resolver,
            resource_registry,
            entrypoints,
            interner: Arc::new(FileIdInterner::new()),
            reverse_index: RwLock::new(HashMap::new()),
            cache: crate::QueryCache::new(),
            static_import_graph: RwLock::new(None),
            reference_strategy,
            generate_extra_imports_in_local_mode,
            compile_non_exported_classes,
        })
    }

    pub fn new_default(
        fs: Fs,
        resolver: Arc<ResolverGeneric<Fs>>,
        resource_registry: Arc<ResourceRegistry>,
        entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
    ) -> Arc<Self> {
        Self::new(
            fs,
            resolver,
            resource_registry,
            entrypoints,
            Arc::new(crate::analyzer::import_emit::ApfImportStrategy::new()),
        )
    }

    pub fn intern_path(&self, path: impl AsRef<Path>) -> FileId {
        self.interner.intern_path(path)
    }

    pub fn lookup_path(&self, id: FileId) -> PathBuf {
        self.interner.lookup_path(id)
    }

    /// Purge every cached query that depends on `path` (file invalidation). Dropping the cached
    /// `SharedQuery` clones also cancels any still-running tasks for those keys. The component
    /// mapping is a whole-program singleton, so it is always dropped. Returns the list of evicted keys.
    pub fn invalidate_file(&self, path: &Path) -> Vec<QueryKey> {
        let Some(file_id) = self.interner.get_if_interned(path) else {
            return Vec::new();
        };
        self.invalidate_file_id(file_id)
    }

    /// Purge every cached query that depends on `file_id` using the granular reverse invalidation index.
    pub fn invalidate_file_id(&self, file_id: FileId) -> Vec<QueryKey> {
        if let Ok(mut graph_guard) = self.static_import_graph.write() {
            *graph_guard = None;
        }

        let mut evicted_keys = if let Ok(mut r_index) = self.reverse_index.write() {
            r_index.remove(&file_id).unwrap_or_default()
        } else {
            HashSet::new()
        };

        // TODO(parity): avoid evicting ComponentMapping on changes that do not affect @Component/@NgModule declarations.
        evicted_keys.insert(QueryKey::ComponentMapping);
        // `ProgramFiles` also reads the unrecorded tsconfig root list, so evict it on any change.
        evicted_keys.insert(QueryKey::ProgramFiles);

        let evicted_vec: Vec<QueryKey> = evicted_keys.into_iter().collect();

        let mut actually_evicted = Vec::new();
        for key in evicted_vec {
            if self.cache.remove(&key).is_some() {
                actually_evicted.push(key);
            }
        }

        actually_evicted
    }

    /// Request a query. If not already cached, the body is spawned onto the executor and a shared
    /// handle is stored; concurrent and subsequent requests reuse the same in-flight/completed task.
    pub fn query(self: &Arc<Self>, key: QueryKey) -> crate::SharedQuery<CachedResult> {
        let me = self.clone();
        self.cache
            .get_or_create(key, move || spawn_shared(me.execute(key).boxed()))
    }

    /// Dispatch a query key to its computation. Each arm may request sub-queries via `self`.
    fn execute(self: Arc<Self>, key: QueryKey) -> BoxFuture<'static, Arc<CachedResult>> {
        async move {
            let child_ctx = QueryContext::new(self.clone());
            let res = match key {
                QueryKey::AnalyzeFileSemantic(file_id) => Arc::new(QueryValue::Semantic(
                    self.analyze_file_semantic_body(file_id, &child_ctx).await,
                )),
                QueryKey::AnalyzeFileSyntax(file_id) => Arc::new(QueryValue::Syntax(
                    self.analyze_file_syntax_body(file_id, &child_ctx).await,
                )),
                QueryKey::AnalyzeFileEvaluated(file_id) => Arc::new(QueryValue::Evaluated(
                    self.analyze_file_evaluated_body(file_id, &child_ctx).await,
                )),
                QueryKey::ParseFile(file_id) => Arc::new(QueryValue::ParsedFile(
                    self.parse_file_body(file_id, &child_ctx).await,
                )),
                QueryKey::NgModuleExportsScope(reference_id) => Arc::new(QueryValue::Scope(
                    self.exports_scope_body(reference_id, &child_ctx).await,
                )),
                QueryKey::NgModuleImportsScope(reference_id) => Arc::new(QueryValue::ImportsScope(
                    self.imports_scope_body(reference_id, &child_ctx).await,
                )),
                QueryKey::ModuleExportMap(file_id) => Arc::new(QueryValue::ExportMap(
                    self.module_export_map_body(file_id, &child_ctx).await,
                )),
                QueryKey::ComponentMapping => Arc::new(QueryValue::ComponentMap(
                    self.component_mapping_body(&child_ctx).await,
                )),
                QueryKey::ProgramFiles => Arc::new(QueryValue::ProgramFiles(
                    self.program_files_body(&child_ctx).await,
                )),
            };
            let deps = child_ctx.dependencies();
            let cached_res = Arc::new(CachedResult {
                value: res,
                dependencies: deps.clone(),
            });
            if let Ok(mut r_guard) = self.reverse_index.write() {
                for &file_id in &deps {
                    r_guard.entry(file_id).or_default().insert(key);
                }
            }
            cached_res
        }
        .boxed()
    }

    /// Synchronously drive `AnalyzeFileSemantic(path)` to completion.
    #[cfg(not(target_arch = "wasm32"))]
    pub fn analyze_file_semantic_blocking(
        self: &Arc<Self>,
        path: impl AsRef<Path>,
    ) -> Arc<FileData> {
        let file_id = self.intern_path(path);
        futures::executor::block_on(QueryContext::new(self.clone()).analyze_file_semantic(file_id))
    }

    #[cfg(target_arch = "wasm32")]
    pub fn analyze_file_semantic_blocking(
        self: &Arc<Self>,
        path: impl AsRef<Path>,
    ) -> Arc<FileData> {
        let file_id = self.intern_path(path);
        let shared = self.query(QueryKey::AnalyzeFileSemantic(file_id));
        loop {
            if let Some(value) = shared.clone().now_or_never() {
                return match &*value.value {
                    QueryValue::Semantic(r) => r.clone(),
                    _ => unreachable!("AnalyzeFileSemantic must yield Semantic"),
                };
            }
            crate::compiler::analyzer::step_local_pool();
        }
    }

    /// Synchronously drive [`QueryContext::declaring_export_names`] to completion.
    #[cfg(not(target_arch = "wasm32"))]
    pub fn declaring_export_names_blocking(
        self: &Arc<Self>,
        file_data: &FileData,
    ) -> crate::analyzer::import_emit::DeclaringExportNames {
        futures::executor::block_on(
            QueryContext::new(self.clone()).declaring_export_names(file_data),
        )
    }

    #[cfg(target_arch = "wasm32")]
    pub fn declaring_export_names_blocking(
        self: &Arc<Self>,
        file_data: &FileData,
    ) -> crate::analyzer::import_emit::DeclaringExportNames {
        let ctx = QueryContext::new(self.clone());
        let mut fut = Box::pin(ctx.declaring_export_names(file_data));
        loop {
            if let Some(value) = (&mut fut).now_or_never() {
                return value;
            }
            crate::compiler::analyzer::step_local_pool();
        }
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn parse_file_by_id_blocking(
        self: &Arc<Self>,
        file_id: FileId,
    ) -> Arc<std::sync::Mutex<crate::ParsedFile>> {
        futures::executor::block_on(QueryContext::new(self.clone()).parse_file(file_id))
    }

    #[cfg(target_arch = "wasm32")]
    pub fn parse_file_by_id_blocking(
        self: &Arc<Self>,
        file_id: FileId,
    ) -> Arc<std::sync::Mutex<crate::ParsedFile>> {
        let shared = self.query(QueryKey::ParseFile(file_id));
        loop {
            if let Some(value) = shared.clone().now_or_never() {
                return match &*value.value {
                    QueryValue::ParsedFile(r) => r.clone(),
                    _ => unreachable!("ParseFile must yield ParsedFile"),
                };
            }
            crate::compiler::analyzer::step_local_pool();
        }
    }

    pub fn parse_file_blocking(
        self: &Arc<Self>,
        path: impl AsRef<Path>,
    ) -> Arc<std::sync::Mutex<crate::ParsedFile>> {
        let file_id = self.intern_path(path);
        self.parse_file_by_id_blocking(file_id)
    }

    async fn parse_file_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext<Fs>,
    ) -> Arc<Mutex<crate::ParsedFile>> {
        ctx.record_file(file_id);
        let file_path = self.lookup_path(file_id);
        let source_text = match self.fs.read_to_string(&file_path) {
            Ok(s) => s,
            Err(e) => {
                // Warn before falling back to an empty parse so unreadable files are not silently skipped.
                #[allow(clippy::print_stderr)]
                {
                    eprintln!("Warning: Failed to read '{}': {}", file_path.display(), e);
                }
                String::new()
            }
        };

        let owner = crate::ParsedFileOwner {
            file_path,
            source_text,
            allocator: oxc_allocator::Allocator::default(),
        };

        let parsed = crate::ParsedFile::new(owner, |owner| {
            let source_type = oxc_span::SourceType::from_path(&owner.file_path)
                .unwrap_or_else(|_| oxc_span::SourceType::ts());
            let ret =
                oxc_parser::Parser::new(&owner.allocator, &owner.source_text, source_type).parse();
            let program = owner.allocator.alloc(ret.program);
            let semantic_ret = oxc_semantic::SemanticBuilder::new()
                .with_build_nodes(true)
                .with_class_table(true)
                .build(program);

            // Only treat unrecoverable parse errors as fatal. When `ret.panicked` is false, the
            // parser has recovered and produced a complete AST that we can analyze.
            // We can rely on TS to perform the final verification downstream.
            let errors = if ret.panicked {
                ret.diagnostics.into_iter().map(|e| e.to_string()).collect()
            } else {
                Vec::new()
            };
            crate::ParsedFileDependent {
                program,
                module_record: ret.module_record,
                semantic: semantic_ret.semantic,
                errors,
            }
        });

        Arc::new(Mutex::new(parsed))
    }

    /// Syntactic single-file analysis: the complete single-file extraction — every decorated class,
    /// the materialized symbol table, and the re-export table — plus resource registration.
    async fn analyze_file_syntax_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext<Fs>,
    ) -> Arc<FileData> {
        let parsed = ctx.parse_file(file_id).await;

        let guard = parsed.lock().unwrap();

        let owner = guard.borrow_owner();
        let file_path = owner.file_path.clone();
        let source_text = &owner.source_text;

        let dep = guard.borrow_dependent();
        let converter = Arc::new(crate::utils::Utf8ToUtf16::new(source_text));

        if crate::utils::is_dts(&file_path) {
            let result = crate::analyzer::analyze_dts(
                dep.program,
                source_text,
                file_id,
                &dep.module_record,
                &dep.semantic,
                &converter,
            );
            let (class_index, symbol_index) =
                class_index_from_registrations(&file_path, &result.registrations);
            return Arc::new(FileData {
                file_id,
                file_path,
                converter,
                imports_end: 0,
                classes: result.classes,
                import_declarations: result.import_declarations,
                type_only_exports: Vec::new(),
                resolved_dependencies: Vec::new(),
                dynamic_dependencies: Vec::new(),
                class_index: Arc::new(class_index),
                symbol_index: Arc::new(symbol_index),
                file_exports: Arc::new(result.exports),
                errors: dep.errors.clone(),
                diagnostics: Vec::new(),
                signal_debug_names: Vec::new(),
            });
        }

        let analysis = crate::analyzer::analyze_parsed(
            &file_path,
            file_id,
            source_text,
            dep.program,
            &dep.module_record,
            &dep.semantic,
            &self.fs,
            self.resolver.as_ref(),
            &converter,
            self.compile_non_exported_classes,
        );

        self.resource_registry
            .register_resources(&file_path, analysis.classes.iter());

        let (class_index, symbol_index) =
            class_index_from_registrations(&file_path, &analysis.registrations);

        // Resolve the file's static and dynamic dependencies to on-disk TS sources. Single-file
        // work (no other file is read); shared by the program closure (`ProgramFiles`), the
        // streaming coordinator's traversal, and the static import graph.
        let file_dir = file_path.parent().unwrap_or(Path::new("."));
        let resolve_ts_sources = |specifiers: &[String]| {
            let mut resolved_sources = Vec::new();
            for specifier in specifiers {
                let Ok(resolution) = self.resolver.resolve(file_dir, specifier) else {
                    continue;
                };
                let resolved = resolution.into_path_buf();
                let canonical = self.fs.canonicalize(&resolved).unwrap_or(resolved);
                if is_ts_source(&canonical) {
                    resolved_sources.push(canonical);
                }
            }
            resolved_sources
        };
        let resolved_dependencies = resolve_ts_sources(&analysis.static_dependencies);
        let dynamic_dependencies = resolve_ts_sources(&analysis.dynamic_dependencies);

        Arc::new(FileData {
            file_id,
            file_path,
            converter,
            imports_end: analysis.imports_end,
            classes: analysis.classes,
            import_declarations: analysis.import_declarations,
            type_only_exports: analysis.type_only_exports,
            resolved_dependencies,
            dynamic_dependencies,
            class_index: Arc::new(class_index),
            symbol_index: Arc::new(symbol_index),
            file_exports: Arc::new(analysis.file_exports),
            errors: dep.errors.clone(),
            diagnostics: analysis.diagnostics,
            signal_debug_names: analysis.signal_debug_names,
        })
    }

    /// The syntactic result with every consumer-facing decorator field completed by the
    /// partial evaluator, and the symbol table rebuilt to match. A file with nothing waiting on
    /// another file shares the syntactic result as is.
    async fn analyze_file_evaluated_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext<Fs>,
    ) -> Arc<FileData> {
        let syntax = ctx.analyze_file_syntax(file_id).await;
        if !syntax
            .classes
            .iter()
            .any(crate::analyzer::ClassData::has_incomplete_declaration_metadata)
        {
            return syntax;
        }

        let mut evaluated = (*syntax).clone();
        for class in &mut evaluated.classes {
            class.complete_declaration_metadata(ctx).await;
        }

        let parsed = ctx.parse_file(file_id).await;
        let registrations: Vec<_> = {
            let guard = parsed.lock().unwrap();
            let source_text = &guard.borrow_owner().source_text;
            evaluated
                .classes
                .iter()
                .filter_map(|class| class.to_registration(source_text, &evaluated.converter))
                .collect()
        };
        let (class_index, symbol_index) =
            class_index_from_registrations(&evaluated.file_path, &registrations);
        evaluated.class_index = Arc::new(class_index);
        evaluated.symbol_index = Arc::new(symbol_index);
        Arc::new(evaluated)
    }

    /// Semantic single-file analysis: the cross-file **resolved** output. Builds on the syntactic
    /// result and runs Stage-2 component optimization (chasing each component's imports across
    /// files) to produce the fully-resolved internal [`FileData`]. The wire `AnalysisResult`
    /// the TS side consumes is projected from this at the engine boundary
    /// ([`FileData::to_wire`]). This is the optimized pipeline's per-file query.
    async fn analyze_file_semantic_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext<Fs>,
    ) -> Arc<FileData> {
        let local_result = ctx.analyze_file_evaluated(file_id).await;
        self.optimized_stage2(local_result.file_path.clone(), (*local_result).clone(), ctx)
            .await
    }

    /// Tsconfig root files plus every local TS source reachable through static and dynamic imports
    /// ([`FileData::program_dependencies`], the same edges the streaming coordinator follows), in
    /// deterministic BFS order. This is the TS `Program` ngtsc analyzes: its
    /// `LocalModuleScopeRegistry` learns NgModules from any program file, not only the roots.
    /// Every walked file is a recorded dependency, since editing one can change the closure.
    // TODO(#588): read the root list through a recorded query input instead of relying on the
    // unconditional eviction in `invalidate_file_id`.
    async fn program_files_body(self: &Arc<Self>, ctx: &QueryContext<Fs>) -> Arc<Vec<FileId>> {
        let roots: Vec<PathBuf> = self.entrypoints.read().unwrap().clone();

        let mut seen: HashSet<FileId> = HashSet::new();
        let mut frontier: Vec<FileId> = roots
            .iter()
            .map(|path| self.intern_path(path))
            .filter(|&file_id| seen.insert(file_id))
            .collect();
        let mut program_files: Vec<FileId> = Vec::new();

        while !frontier.is_empty() {
            let syntax = futures::future::join_all(
                frontier
                    .iter()
                    .map(|&file_id| ctx.analyze_file_syntax(file_id)),
            )
            .await;
            program_files.append(&mut frontier);
            frontier = syntax
                .iter()
                .flat_map(|file| file.program_dependencies())
                .map(|dep| self.intern_path(dep))
                .filter(|&file_id| seen.insert(file_id))
                .collect();
        }

        Arc::new(program_files)
    }

    /// Build the component → owning-NgModule mapping across every file of the program (the
    /// `ComponentMapping` singleton).
    async fn component_mapping_body(
        self: &Arc<Self>,
        ctx: &QueryContext<Fs>,
    ) -> Arc<NgModuleComponentMap> {
        let program_files = ctx.program_files().await;
        let analyze_futures = program_files
            .iter()
            .map(|&file_id| ctx.analyze_file_syntax(file_id));
        let all_results = futures::future::join_all(analyze_futures).await;

        let mut mapping = NgModuleComponentMap::default();
        for result in &all_results {
            for class in &result.classes {
                let Some(module) = class.as_ng_module() else {
                    continue;
                };
                if class.class_name.is_none() {
                    continue;
                }
                if let Some(ref declarations_resolved) = module.declarations {
                    let mut completed = declarations_resolved.clone();
                    completed
                        .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
                        .await;
                    if let Some(references) = completed.get_optional() {
                        let mut resolve_futures = Vec::new();
                        for r in &references {
                            resolve_futures
                                .push((r, crate::query::scope::resolve_reference_async(r, ctx)));
                        }
                        let (items, futures): (Vec<_>, Vec<_>) =
                            resolve_futures.into_iter().unzip();
                        let results = futures::future::join_all(futures).await;

                        for (r, resolved_info) in items.into_iter().zip(results) {
                            if resolved_info.is_none() {
                                continue;
                            }
                            mapping.register_declaration(r.file, r.name(), class.reference_id);
                        }
                    }
                }
            }
        }

        Arc::new(mapping)
    }

    /// Populate local-compilation side-effect imports for non-standalone declarations in
    /// `local_result` (mirroring ngtsc's `LocalCompilationExtraImportsTracker`).
    ///
    /// Global extra imports are entrypoint `@NgModule.imports` entries that resolve outside the
    /// compilation unit: ngtsc's `DynamicValue` entries, here `IncompleteDep::Reference` holes plus
    /// the `parsed_imports` fallback. Entries resolving into the unit are skipped (the NgModule
    /// scope covers them). Scoped to the root list, not `ProgramFiles`, because ngtsc cannot see
    /// into other units while this compiler follows imports into their sources.
    pub async fn populate_local_compilation_extra_imports(
        self: &Arc<Self>,
        local_result: &mut FileData,
        ctx: &QueryContext<Fs>,
    ) {
        let mut has_component_candidate = false;
        let mut has_directive_or_pipe_candidate = false;
        for class in &local_result.classes {
            match &class.decorator {
                DecoratorData::Component(c) if !c.directive.standalone => {
                    has_component_candidate = true;
                }
                DecoratorData::Directive(d) if !d.standalone => {
                    has_directive_or_pipe_candidate = true;
                }
                DecoratorData::Pipe(p) if !p.standalone.unwrap_or(true) => {
                    has_directive_or_pipe_candidate = true;
                }
                _ => {}
            }
        }

        if !has_component_candidate && !has_directive_or_pipe_candidate {
            return;
        }

        let entrypoints: Vec<PathBuf> = self.entrypoints.read().unwrap().clone();
        let entrypoints_ids: HashSet<FileId> = entrypoints
            .iter()
            .map(|path| self.intern_path(path))
            .collect();

        if has_directive_or_pipe_candidate {
            let mapping = ctx.component_mapping().await;
            for class in &mut local_result.classes {
                let Some(class_name) = &class.class_name else {
                    continue;
                };
                let Some(module_ref) = mapping
                    .get(class.reference_id.file, class_name)
                    .filter(|module_ref| entrypoints_ids.contains(&module_ref.file))
                else {
                    continue;
                };
                match &mut class.decorator {
                    DecoratorData::Directive(d) if !d.standalone => {
                        d.declaring_ng_module = Some(module_ref);
                    }
                    DecoratorData::Pipe(p) if !p.standalone.unwrap_or(true) => {
                        p.declaring_ng_module = Some(module_ref);
                    }
                    _ => {}
                }
            }
        }

        if !has_component_candidate {
            return;
        }

        let entrypoints_set: HashSet<PathBuf> = entrypoints
            .iter()
            .map(|path| crate::fs::normalize_path(path).into_owned())
            .collect();

        let analyze_futures = entrypoints
            .iter()
            .map(|path| ctx.analyze_file_syntax(self.intern_path(path)));
        let entrypoint_syntax = futures::future::join_all(analyze_futures).await;

        let mut global_extra_imports: Vec<(FileId, String)> = Vec::new();
        let mut seen_global: HashSet<(FileId, String)> = HashSet::new();
        for syntax in &entrypoint_syntax {
            let ep_id = syntax.file_id;
            let ep_dir = syntax
                .file_path
                .parent()
                .unwrap_or(Path::new("."))
                .to_path_buf();

            for class in &syntax.classes {
                let Some(ng_module) = class.as_ng_module() else {
                    continue;
                };

                let mut specifiers: Vec<String> = Vec::new();
                if let Some(imports) = &ng_module.imports {
                    for hole in crate::evaluator::value::collect_holes(imports.raw()) {
                        if let crate::evaluator::value::IncompleteDep::Reference(target) = &hole.dep
                        {
                            specifiers.push(target.specifier.clone());
                        }
                    }
                }
                for import_info in &ng_module.parsed_imports {
                    if let Some(source) = &import_info.import_source {
                        specifiers.push(source.clone());
                    }
                }

                for specifier in specifiers {
                    let is_local_entrypoint = self
                        .resolver
                        .resolve(&ep_dir, &specifier)
                        .ok()
                        .map(|resolution| resolution.into_path_buf())
                        .map(|path| self.fs.canonicalize(&path).unwrap_or(path))
                        .is_some_and(|path| {
                            entrypoints_set.contains(crate::fs::normalize_path(&path).as_ref())
                        });
                    if is_local_entrypoint {
                        continue;
                    }
                    if seen_global.insert((ep_id, specifier.clone())) {
                        global_extra_imports.push((ep_id, specifier));
                    }
                }
            }
        }

        let file_path = local_result.file_path.clone();
        for class in &mut local_result.classes {
            let reference_id = class.reference_id;
            let class_name = class.class_name.clone();
            let Some(component) = class.as_component_mut() else {
                continue;
            };
            populate_local_component_extra_imports(
                ctx,
                &file_path,
                reference_id,
                class_name.as_deref(),
                component,
                &global_extra_imports,
                &entrypoints_ids,
            )
            .await;
        }
    }

    /// Full optimized analysis of a file → the resolved internal [`FileData`].
    pub async fn analyze_optimized(self: &Arc<Self>, file_path: PathBuf) -> Arc<FileData> {
        let file_id = self.intern_path(file_path);
        QueryContext::new(self.clone())
            .analyze_file_semantic(file_id)
            .await
    }

    /// Stage 2: resolve cross-file class metadata and decorator scopes in place.
    async fn optimized_stage2(
        self: &Arc<Self>,
        file_path: PathBuf,
        mut local_result: FileData,
        ctx: &QueryContext<Fs>,
    ) -> Arc<FileData> {
        for class in &mut local_result.classes {
            let reference_id = class.reference_id;
            let class_name = class.class_name.clone();
            class.resolve_semantic(ctx).await;

            if class.super_class.is_some() {
                if let Some(comp_info) = local_result.symbol_index.get(&reference_id) {
                    let flattened =
                        crate::analyzer::flatten_class_info(comp_info.clone(), ctx).await;
                    class.flattened_fields = flattened.fields;
                }
            }

            if let Some(ref mut params) = class.constructor_params {
                for param in params {
                    // Skip parameters already classified by the in-file pass; re-chasing is wrong:
                    // `import type {X}` has no runtime value even if X is a class, and the chase
                    // checks exports before root bindings (`export { Foo } from './iface'; class
                    // Foo {}` would resolve to the interface).
                    if param.is_type_only || param.is_value_verified {
                        continue;
                    }
                    if let Some(ref type_name) = param.type_name {
                        let mut visited = HashSet::new();
                        match resolve_symbol_value_kind(
                            type_name.clone(),
                            file_path.clone(),
                            ctx,
                            &mut visited,
                        )
                        .await
                        {
                            SymbolValueKind::TypeOnly => param.is_type_only = true,
                            SymbolValueKind::Value => param.is_value_verified = true,
                            // Emit optimistically with `@ts-ignore`.
                            SymbolValueKind::Unresolved => {}
                        }
                    }
                }
            }

            if let DecoratorData::Component(component) = &mut class.decorator {
                optimize_component(
                    ctx,
                    &file_path,
                    reference_id,
                    class_name.as_deref(),
                    component,
                )
                .await;
            } else if let DecoratorData::NgModule(ng_module) = &mut class.decorator {
                optimize_ng_module(
                    ctx,
                    &file_path,
                    reference_id,
                    class_name.as_deref(),
                    ng_module,
                )
                .await;
            } else if let DecoratorData::Directive(directive) = &mut class.decorator {
                let mapping = ctx.component_mapping().await;
                (
                    directive.declaring_ng_module,
                    directive.duplicate_declaring_ng_modules,
                ) = mapping.declaring_ng_modules(reference_id.file, class_name.as_deref());
            } else if let DecoratorData::Pipe(pipe) = &mut class.decorator {
                let mapping = ctx.component_mapping().await;
                (
                    pipe.declaring_ng_module,
                    pipe.duplicate_declaring_ng_modules,
                ) = mapping.declaring_ng_modules(reference_id.file, class_name.as_deref());
            }
            // Semantic invariant: no `Incomplete` survives into the semantic FileData.
            class.demote_resolved();
        }

        local_result.validate();

        Arc::new(local_result)
    }

    pub async fn get_or_build_import_graph(self: &Arc<Self>) -> Arc<StaticImportGraph> {
        {
            if let Ok(guard) = self.static_import_graph.read() {
                if let Some(graph) = &*guard {
                    return graph.clone();
                }
            }
        }

        let mut edges = HashMap::new();
        let mut queue = std::collections::VecDeque::new();
        let mut visited = HashSet::new();

        for ep in &*self.entrypoints.read().unwrap() {
            let ep_id = self.intern_path(ep);
            queue.push_back(ep_id);
            visited.insert(ep_id);
        }

        while let Some(current) = queue.pop_front() {
            let key = QueryKey::AnalyzeFileSyntax(current);
            let cached = self.query(key).await;
            let file_data = match &*cached.value {
                QueryValue::Syntax(r) => r,
                _ => unreachable!(),
            };

            let mut deps = HashSet::new();
            for dep_path in &file_data.resolved_dependencies {
                let dep_id = self.intern_path(dep_path);
                deps.insert(dep_id);
                if visited.insert(dep_id) {
                    queue.push_back(dep_id);
                }
            }
            // Dynamic imports are not edges of `StaticImportGraph`, but their reachable subtrees
            // are still queued so static cycles within those subtrees are discovered.
            for dep_path in &file_data.dynamic_dependencies {
                let dep_id = self.intern_path(dep_path);
                if visited.insert(dep_id) {
                    queue.push_back(dep_id);
                }
            }
            edges.insert(current, deps);
        }

        let graph = Arc::new(StaticImportGraph { edges });
        if let Ok(mut guard) = self.static_import_graph.write() {
            *guard = Some(graph.clone());
        }
        graph
    }
}

pub struct StaticImportGraph {
    pub edges: HashMap<FileId, HashSet<FileId>>,
}

impl StaticImportGraph {
    pub fn has_path(&self, start: FileId, target: FileId) -> bool {
        if start == target {
            return true;
        }
        let mut visited = HashSet::new();
        visited.insert(start);
        let mut queue = std::collections::VecDeque::new();
        queue.push_back(start);

        while let Some(current) = queue.pop_front() {
            if let Some(deps) = self.edges.get(&current) {
                for &dep in deps {
                    if dep == target {
                        return true;
                    }
                    if visited.insert(dep) {
                        queue.push_back(dep);
                    }
                }
            }
        }
        false
    }
}

/// Materialize a file's `name → ClassInfo` and `ReferenceId → ClassInfo` tables from single-file
/// registration records.
fn class_index_from_registrations(
    file_path: &Path,
    registrations: &[crate::analyzer::RegistrationInfo],
) -> (
    HashMap<String, ClassInfo>,
    HashMap<crate::query::ReferenceId, ClassInfo>,
) {
    let mut class_index = HashMap::new();
    let mut symbol_index = HashMap::new();
    for reg in registrations {
        let info = ClassInfo {
            reference_id: reg.reference_id,
            file_path: file_path.to_path_buf(),
            class_name: reg.class_name.clone(),
            name_span: reg.name_span,
            class_type: reg.class_type,
            selector: reg.selector.clone(),
            pipe_name: reg.pipe_name.clone(),
            is_standalone: reg.is_standalone,
            is_structural: reg.is_structural,
            export_as: reg.export_as.clone(),
            host_directives: reg.host_directives.clone(),
            fields: reg.fields.clone(),
            exports: reg.exports.clone(),
            ng_content_selectors: reg.ng_content_selectors.clone(),
            type_parameters: reg.type_parameters.clone(),

            has_ng_template_context_guard: reg.has_ng_template_context_guard,
            ng_template_guards: reg.ng_template_guards.clone(),
            schemas: reg.schemas.clone(),
            animation_trigger_names: reg.animation_trigger_names.clone(),
            has_ng_field_directive: reg.has_ng_field_directive,
            raw_imports: reg.raw_imports.clone(),
            may_declare_providers: reg.may_declare_providers,
            super_class: reg.super_class.clone(),
            is_exported: reg.is_exported,
            has_non_exported_bounds: reg.has_non_exported_bounds,
        };
        class_index.insert(reg.class_name.clone(), info.clone());
        symbol_index.insert(reg.reference_id, info);
    }
    (class_index, symbol_index)
}

/// Result of cross-file value verification for a symbol referenced in type position.
///
/// [`SymbolValueKind::Unresolved`] mirrors ngtsc's `valueUnverified`: `ɵsetClassMetadata` emits
/// the reference optimistically in value position guarded by `@ts-ignore`.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SymbolValueKind {
    /// No runtime value (interface, type alias, `import type`).
    TypeOnly,
    /// Verified runtime value declaration.
    Value,
    /// Unresolvable from source (ambient global, namespace member, or external specifier).
    Unresolved,
}

/// Classify `decl` for `consumer`, downgrading value declarations reached through a type-only
/// intermediate re-export/import hop to [`SymbolValueKind::Unresolved`]. `Unresolved` (not
/// `TypeOnly`) keeps the reference in metadata and the factory with only the `@ts-ignore` guard,
/// matching the chase's handling of `export type { X } from`.
async fn classify_declaration<Fs: ResourceResolverFs + Clone + 'static>(
    decl: Option<crate::evaluator::cross_file::DeclaredSymbol>,
    consumer: &Path,
    ctx: &QueryContext<Fs>,
) -> SymbolValueKind {
    let Some(decl) = decl else {
        return SymbolValueKind::Unresolved;
    };
    if decl.is_type_only() {
        return SymbolValueKind::TypeOnly;
    }
    if reached_through_type_only_hop(&decl, consumer, ctx).await {
        return SymbolValueKind::Unresolved;
    }
    SymbolValueKind::Value
}

/// Whether any intermediate file on the chain to `decl` (excluding `consumer`) binds or exports
/// the symbol only in type position. Imports are judged by the bound name (`decl.aliases`) and
/// exports by the exported name (`decl.export_hops`), since a hop may rename
/// (`export type { X as Y }` records `Y` in `export_hops` and `X` in `aliases`).
async fn reached_through_type_only_hop<Fs: ResourceResolverFs + Clone + 'static>(
    decl: &crate::evaluator::cross_file::DeclaredSymbol,
    consumer: &Path,
    ctx: &QueryContext<Fs>,
) -> bool {
    let consumer_id = ctx.engine.intern_path(consumer);
    for (file_id, local_name) in &decl.aliases {
        if *file_id == consumer_id {
            continue;
        }
        let parsed = ctx.parse_file(*file_id).await;
        let guard = parsed.lock().unwrap();
        let dep = guard.borrow_dependent();
        if crate::analyzer::utils::binds_type_only(&dep.module_record, local_name) {
            return true;
        }
    }
    for (file_id, exported_name) in &decl.export_hops {
        if *file_id == consumer_id {
            continue;
        }
        let parsed = ctx.parse_file(*file_id).await;
        let guard = parsed.lock().unwrap();
        if crate::analyzer::utils::exports_type_only(
            guard.borrow_dependent().program,
            exported_name,
        ) {
            return true;
        }
    }
    false
}

/// Whether `file` binds or exports `name` only in type position (used for re-exported namespaces).
async fn namespace_is_type_only<Fs: ResourceResolverFs + Clone + 'static>(
    file: &Path,
    name: &str,
    ctx: &QueryContext<Fs>,
) -> bool {
    let parsed = ctx.parse_file(ctx.engine.intern_path(file)).await;
    let guard = parsed.lock().unwrap();
    let dep = guard.borrow_dependent();
    crate::analyzer::utils::binds_type_only(&dep.module_record, name)
        || crate::analyzer::utils::exports_type_only(dep.program, name)
}

pub fn resolve_symbol_value_kind<'a, Fs: ResourceResolverFs + Clone + 'static>(
    name: String,
    file_path: PathBuf,
    ctx: &'a QueryContext<Fs>,
    visited: &'a mut HashSet<(PathBuf, String)>,
) -> BoxFuture<'a, SymbolValueKind> {
    async move {
        if let Some((ns_prefix, member_name)) = name.split_once('.') {
            return resolve_qualified_symbol_value_kind(
                ns_prefix,
                member_name,
                file_path,
                ctx,
                visited,
            )
            .await;
        }

        let Ok(decl) =
            crate::evaluator::cross_file::cross_file_resolve(ctx, &file_path, None, name, visited)
                .await
        else {
            return SymbolValueKind::Unresolved;
        };
        classify_declaration(decl, &file_path, ctx).await
    }
    .boxed()
}

fn find_namespace_import_specifier<'a>(syntax: &'a FileData, ns_prefix: &str) -> Option<&'a str> {
    for decl in &syntax.import_declarations {
        for binding in &decl.bindings {
            if binding.local == ns_prefix && binding.imported.is_none() {
                return Some(&decl.specifier);
            }
        }
    }
    None
}

async fn resolve_qualified_symbol_value_kind<Fs: ResourceResolverFs + Clone + 'static>(
    ns_prefix: &str,
    member_name: &str,
    file_path: PathBuf,
    ctx: &QueryContext<Fs>,
    visited: &mut HashSet<(PathBuf, String)>,
) -> SymbolValueKind {
    if !visited.insert((file_path.clone(), format!("{ns_prefix}.{member_name}"))) {
        return SymbolValueKind::Unresolved;
    }

    let file_id = ctx.engine.intern_path(&file_path);
    let syntax = ctx.analyze_file_syntax(file_id).await;
    let Some(specifier) = find_namespace_import_specifier(&syntax, ns_prefix) else {
        return SymbolValueKind::Unresolved;
    };

    if let Some((inner_ns, _)) = member_name.split_once('.') {
        let Some(target_file) = crate::evaluator::cross_file::resolve_specifier(
            ctx.engine.resolver.as_ref(),
            &file_path,
            specifier,
        ) else {
            return SymbolValueKind::Unresolved;
        };
        // `member_name` is `inner.X`: `inner` is a namespace `target_file` exports, and one it
        // binds with `import type * as` or exports with `export type` hands on no value.
        if namespace_is_type_only(&target_file, inner_ns, ctx).await {
            return SymbolValueKind::Unresolved;
        }
        return resolve_symbol_value_kind(member_name.to_string(), target_file, ctx, visited).await;
    }

    let Ok(decl_sym) = crate::evaluator::cross_file::cross_file_resolve(
        ctx,
        &file_path,
        Some(specifier),
        member_name.to_string(),
        visited,
    )
    .await
    else {
        return SymbolValueKind::Unresolved;
    };
    classify_declaration(decl_sym, &file_path, ctx).await
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::create_test_fs;
    use oxc_resolver::ResolveOptions;
    use std::path::Path;

    #[test]
    fn test_query_context_chaining_inheritance() {
        let files = vec![
            (
                "app.component.ts",
                r#"
                import { Component } from '@angular/core';
                import { ChildComponent } from './child.component';
                @Component({
                    selector: 'app',
                    standalone: true,
                    imports: [ChildComponent],
                    template: ''
                })
                export class AppComponent {}
                "#,
            ),
            (
                "child.component.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'child',
                    standalone: true,
                    template: ''
                })
                export class ChildComponent {}
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            "app.component.ts",
        )]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        let parent_ctx = QueryContext::new(engine.clone());
        let app_id = engine.intern_path("app.component.ts");
        let res = futures::executor::block_on(parent_ctx.analyze_file_semantic(app_id));

        assert_eq!(res.classes.len(), 1);
        let deps = parent_ctx.dependencies();

        let child_id = engine.intern_path("child.component.ts");
        assert!(
            deps.contains(&app_id),
            "Parent context should inherit AppComponent dependency"
        );
        assert!(
            deps.contains(&child_id),
            "Parent context should inherit ChildComponent dependency across query boundary"
        );
    }

    #[test]
    fn test_query_context_chaining_adversarial_stress() {
        let files = vec![
            (
                "root.component.ts",
                r#"
                import { Component } from '@angular/core';
                import { LeafComponent } from './middle.component';
                @Component({
                    selector: 'root',
                    standalone: true,
                    imports: [LeafComponent],
                    template: ''
                })
                export class RootComponent {}
                "#,
            ),
            (
                "middle.component.ts",
                r#"
                import { Component } from '@angular/core';
                export { LeafComponent } from './leaf.component';
                @Component({
                    selector: 'middle',
                    standalone: true,
                    template: ''
                })
                export class MiddleComponent {}
                "#,
            ),
            (
                "leaf.component.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'leaf',
                    standalone: true,
                    template: ''
                })
                export class LeafComponent {}
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            "root.component.ts",
        )]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        let root_id = engine.intern_path("root.component.ts");
        let middle_id = engine.intern_path("middle.component.ts");
        let leaf_id = engine.intern_path("leaf.component.ts");

        // 1. Initial run (cold cache) -> verify deep 3-level transitive chaining
        let ctx1 = QueryContext::new(engine.clone());
        let _res1 = futures::executor::block_on(ctx1.analyze_file_semantic(root_id));

        let deps1 = ctx1.dependencies();

        assert!(deps1.contains(&root_id), "Root should be in context");
        assert!(
            deps1.contains(&middle_id),
            "Middle should be chained into Root context"
        );
        assert!(
            deps1.contains(&leaf_id),
            "Leaf should be transitively chained into Root context"
        );

        // 2. Second run (hot cache hit) -> verify stateless replay from self.query_deps
        let ctx2 = QueryContext::new(engine.clone());
        let _res2 = futures::executor::block_on(ctx2.analyze_file_semantic(root_id));

        let deps2 = ctx2.dependencies();
        assert_eq!(
            deps1, deps2,
            "Cache hit must replay exactly the same transitive dependency set"
        );
    }

    #[test]
    fn test_reverse_invalidation_index_exact_eviction() {
        let files = vec![
            (
                "parent.component.ts",
                r#"
                import { Component } from '@angular/core';
                import { SharedChildComponent } from './shared_child.component';
                @Component({
                    selector: 'parent',
                    standalone: true,
                    imports: [SharedChildComponent],
                    template: ''
                })
                export class ParentComponent {}
                "#,
            ),
            (
                "other_parent.component.ts",
                r#"
                import { Component } from '@angular/core';
                import { SharedChildComponent } from './shared_child.component';
                @Component({
                    selector: 'other-parent',
                    standalone: true,
                    imports: [SharedChildComponent],
                    template: ''
                })
                export class OtherParentComponent {}
                "#,
            ),
            (
                "independent.component.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'independent',
                    standalone: true,
                    template: ''
                })
                export class IndependentComponent {}
                "#,
            ),
            (
                "shared_child.component.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'shared-child',
                    standalone: true,
                    template: ''
                })
                export class SharedChildComponent {}
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![
            PathBuf::from("parent.component.ts"),
            PathBuf::from("other_parent.component.ts"),
            PathBuf::from("independent.component.ts"),
        ]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        // 1. Prime the cache by running semantic analysis on all four components
        let _ = engine.analyze_file_semantic_blocking(Path::new("parent.component.ts"));
        let _ = engine.analyze_file_semantic_blocking(Path::new("other_parent.component.ts"));
        let _ = engine.analyze_file_semantic_blocking(Path::new("independent.component.ts"));
        let _ = engine.analyze_file_semantic_blocking(Path::new("shared_child.component.ts"));

        let parent_id = engine.intern_path("parent.component.ts");
        let other_parent_id = engine.intern_path("other_parent.component.ts");
        let independent_id = engine.intern_path("independent.component.ts");
        let shared_child_id = engine.intern_path("shared_child.component.ts");

        // Verify reverse index is populated correctly
        {
            let r_index = engine.reverse_index.read().unwrap();
            let shared_child_deps = r_index.get(&shared_child_id).unwrap();
            assert!(shared_child_deps.contains(&QueryKey::AnalyzeFileSemantic(parent_id)));
            assert!(shared_child_deps.contains(&QueryKey::AnalyzeFileSemantic(other_parent_id)));
            assert!(!shared_child_deps.contains(&QueryKey::AnalyzeFileSemantic(independent_id)));
        }

        // 2. Invalidate the shared child file
        let evicted = engine.invalidate_file(Path::new("shared_child.component.ts"));
        let evicted_set: HashSet<QueryKey> = evicted.into_iter().collect();

        // Must evict queries for shared_child, parent, and other_parent
        assert!(evicted_set.contains(&QueryKey::AnalyzeFileSemantic(shared_child_id)));
        assert!(evicted_set.contains(&QueryKey::AnalyzeFileSemantic(parent_id)));
        assert!(evicted_set.contains(&QueryKey::AnalyzeFileSemantic(other_parent_id)));

        // Must NOT evict independent component queries
        assert!(!evicted_set.contains(&QueryKey::AnalyzeFileSemantic(independent_id)));

        // Verify independent query is still in cache
        assert!(engine
            .cache
            .get(&QueryKey::AnalyzeFileSemantic(independent_id))
            .is_some());
        // Verify parent queries are removed from cache
        assert!(engine
            .cache
            .get(&QueryKey::AnalyzeFileSemantic(parent_id))
            .is_none());
    }

    #[test]
    fn test_reverse_invalidation_index_multithreaded_concurrent_stress() {
        let mut files = Vec::new();
        let num_files = 20;
        for i in 0..num_files {
            let filename = format!("comp_{}.ts", i);
            let content = if i > 0 {
                format!(
                    r#"
                    import {{ Component }} from '@angular/core';
                    import {{ Comp{} }} from './comp_{}';
                    @Component({{
                        selector: 'comp-{}',
                        standalone: true,
                        imports: [Comp{}],
                        template: ''
                    }})
                    export class Comp{} {{}}
                    "#,
                    i - 1,
                    i - 1,
                    i,
                    i - 1,
                    i
                )
            } else {
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'comp-0',
                    standalone: true,
                    template: ''
                })
                export class Comp0 {}
                "#
                .to_string()
            };
            files.push((filename, content));
        }

        let ref_files: Vec<(&str, &str)> = files
            .iter()
            .map(|(name, content)| (name.as_str(), content.as_str()))
            .collect();
        let fs = create_test_fs(&ref_files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(
            files
                .iter()
                .map(|(name, _)| PathBuf::from(name))
                .collect::<Vec<_>>(),
        ));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        let threads = 16;
        let iterations_per_thread = 100;

        std::thread::scope(|s| {
            for t in 0..threads {
                let engine = Arc::clone(&engine);
                s.spawn(move || {
                    for i in 0..iterations_per_thread {
                        let file_idx = (t + i) % num_files;
                        let path_str = format!("comp_{}.ts", file_idx);
                        let path = Path::new(&path_str);

                        if i % 2 == 0 {
                            let _ = engine.analyze_file_semantic_blocking(path);
                        } else if i % 3 == 0 {
                            let _ = futures::executor::block_on(
                                QueryContext::new(engine.clone()).component_mapping(),
                            );
                        } else {
                            let _ = engine.invalidate_file(path);
                        }
                    }
                });
            }
        });

        // Verify final state consistency without any deadlocks or poisoned locks
        for i in 0..num_files {
            let path_str = format!("comp_{}.ts", i);
            let _ = engine.invalidate_file(Path::new(&path_str));
        }

        let r_index = engine.reverse_index.read().unwrap();
        assert!(
            r_index.is_empty(),
            "Reverse index should be clean after fully invalidating all interned files"
        );
    }

    #[test]
    fn test_parent_query_eviction_on_child_modification() {
        let files = vec![
            (
                "parent.component.ts",
                r#"
                import { Component } from '@angular/core';
                import { ChildComponent } from './child.component';
                @Component({
                    selector: 'parent',
                    standalone: true,
                    imports: [ChildComponent],
                    template: ''
                })
                export class ParentComponent {}
                "#,
            ),
            (
                "child.component.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'child',
                    standalone: true,
                    template: ''
                })
                export class ChildComponent {}
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![
            PathBuf::from("parent.component.ts"),
            PathBuf::from("child.component.ts"),
        ]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        // 1. Prime the cache by running semantic analysis on parent
        let _ = engine.analyze_file_semantic_blocking(Path::new("parent.component.ts"));

        let parent_id = engine.intern_path("parent.component.ts");
        let child_id = engine.intern_path("child.component.ts");

        // Verify both parent and child queries are cached
        assert!(
            engine
                .cache
                .get(&QueryKey::AnalyzeFileSemantic(parent_id))
                .is_some(),
            "Parent semantic query must be cached"
        );
        assert!(
            engine
                .cache
                .get(&QueryKey::AnalyzeFileSyntax(child_id))
                .is_some(),
            "Child syntax query must be cached via Stage 2 optimization"
        );

        // Verify reverse index maps child_id -> parent semantic query
        {
            let r_index = engine.reverse_index.read().unwrap();
            let child_deps = r_index
                .get(&child_id)
                .expect("Child ID must exist in reverse index");
            assert!(
                child_deps.contains(&QueryKey::AnalyzeFileSemantic(parent_id)),
                "Reverse index must record parent dependency on child"
            );
        }

        // 2. Invalidate child file
        let evicted = engine.invalidate_file(Path::new("child.component.ts"));
        let evicted_set: HashSet<QueryKey> = evicted.into_iter().collect();

        // Assert parent query is objectively evicted
        assert!(
            evicted_set.contains(&QueryKey::AnalyzeFileSemantic(parent_id)),
            "Evicted list must contain parent semantic query"
        );
        assert!(
            engine
                .cache
                .get(&QueryKey::AnalyzeFileSemantic(parent_id))
                .is_none(),
            "Parent semantic query must be purged from cache"
        );
        assert!(
            engine
                .cache
                .get(&QueryKey::AnalyzeFileSyntax(child_id))
                .is_none(),
            "Child syntax query must be purged from cache"
        );
    }

    #[test]
    fn test_single_file_query_eviction_isolation() {
        let files = vec![
            (
                "isolated_a.component.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'isolated-a',
                    standalone: true,
                    template: ''
                })
                export class IsolatedAComponent {}
                "#,
            ),
            (
                "isolated_b.component.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'isolated-b',
                    standalone: true,
                    template: ''
                })
                export class IsolatedBComponent {}
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![
            PathBuf::from("isolated_a.component.ts"),
            PathBuf::from("isolated_b.component.ts"),
        ]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        // 1. Prime cache for both isolated components
        let _ = engine.analyze_file_semantic_blocking(Path::new("isolated_a.component.ts"));
        let _ = engine.analyze_file_semantic_blocking(Path::new("isolated_b.component.ts"));

        let id_a = engine.intern_path("isolated_a.component.ts");
        let id_b = engine.intern_path("isolated_b.component.ts");

        assert!(engine
            .cache
            .get(&QueryKey::AnalyzeFileSemantic(id_a))
            .is_some());
        assert!(engine
            .cache
            .get(&QueryKey::AnalyzeFileSemantic(id_b))
            .is_some());

        // Verify reverse index isolation
        {
            let r_index = engine.reverse_index.read().unwrap();
            let deps_a = r_index.get(&id_a).unwrap();
            assert!(
                !deps_a.contains(&QueryKey::AnalyzeFileSemantic(id_b)),
                "A must not trigger eviction of B"
            );
        }

        // 2. Invalidate File A
        let evicted = engine.invalidate_file(Path::new("isolated_a.component.ts"));
        let evicted_set: HashSet<QueryKey> = evicted.into_iter().collect();

        // Assert A is evicted but B remains untouched
        assert!(
            evicted_set.contains(&QueryKey::AnalyzeFileSemantic(id_a)),
            "Query A must be evicted"
        );
        assert!(
            !evicted_set.contains(&QueryKey::AnalyzeFileSemantic(id_b)),
            "Query B must NOT be evicted"
        );

        assert!(
            engine
                .cache
                .get(&QueryKey::AnalyzeFileSemantic(id_a))
                .is_none(),
            "Cache must purge A"
        );
        assert!(
            engine
                .cache
                .get(&QueryKey::AnalyzeFileSemantic(id_b))
                .is_some(),
            "Cache must preserve B"
        );
    }

    #[test]
    fn test_dependency_canonicalization_across_root_dirs() {
        let files = vec![
            (
                "/app/src/entry.ts",
                r#"
                import './dep';
                "#,
            ),
            (
                "/app/gen/dep.ts",
                r#"
                export const x = 1;
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        fs.set_preserve_symlinks(true);
        fs.set_root_dirs(vec![PathBuf::from("/app/src"), PathBuf::from("/app/gen")]);

        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                symlinks: false, // preserve_symlinks = true
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                modules: vec!["node_modules".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            "/app/src/entry.ts",
        )]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        // Run analyze_file_semantic query for the entrypoint
        let file_data = engine.analyze_file_semantic_blocking(Path::new("/app/src/entry.ts"));

        // The resolved dependencies should contain the canonical path in `/app/gen/dep.ts`
        // and NOT the virtual `/app/src/dep.ts`.
        let deps = &file_data.resolved_dependencies;
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0], PathBuf::from("/app/gen/dep.ts"));
    }

    #[test]
    fn test_source_type_dts() {
        let path = Path::new("foo.d.ts");
        let st = oxc_span::SourceType::from_path(path).unwrap();
        assert!(st.is_typescript_definition(), "st should be dts");
    }

    #[test]
    fn test_setter_optional_parameter_and_ts_ignore_not_fatal() {
        let files = vec![
            (
                "/app/src/tree_editor.ts",
                r#"
                import { Component } from '@angular/core';
                @Component({
                    selector: 'foo',
                    template: ''
                })
                export class SomeComponent<T> {
                    // @ts-ignore
                    override set value(val?: T) {}
                    set unannotatedOptional(val?: string) {}
                    // @ts-expect-error
                    set withInitializer(val = 123) {}
                }
                "#,
            ),
            (
                "/app/src/broken.ts",
                r#"
                export class {
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![
            PathBuf::from("/app/src/tree_editor.ts"),
            PathBuf::from("/app/src/broken.ts"),
        ]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        let tree_editor_data =
            engine.analyze_file_semantic_blocking(Path::new("/app/src/tree_editor.ts"));
        assert!(
            tree_editor_data.errors.is_empty(),
            "Setter optional parameters and @ts-ignore/@ts-expect-error lines must not produce fatal parse errors: {:?}",
            tree_editor_data.errors
        );
        assert_eq!(tree_editor_data.classes.len(), 1);

        let broken_data = engine.analyze_file_semantic_blocking(Path::new("/app/src/broken.ts"));
        assert!(
            !broken_data.errors.is_empty(),
            "Genuine syntax errors must still be reported in errors"
        );
    }

    #[test]
    fn test_host_binding_imported_constant_resolved_in_stage_2() {
        let files = vec![
            (
                "/app/src/constants.ts",
                r#"
                export const ACTIVE_CLASS = 'is-active';
                export const NOT_A_STRING = 42;
                "#,
            ),
            (
                "/app/src/cmp.ts",
                r#"
                import { Component, HostBinding } from '@angular/core';
                import { ACTIVE_CLASS, NOT_A_STRING } from './constants';
                @Component({ selector: 'my-cmp', template: '' })
                export class MyCmp {
                    @HostBinding(`class.${ACTIVE_CLASS}`) active = true;
                    @HostBinding('class.ready')
                    set isReady(v: boolean) {}
                    get isReady(): boolean { return true; }
                    @HostBinding(NOT_A_STRING) wrong = true;
                }
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            "/app/src/cmp.ts",
        )]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        let data = engine.analyze_file_semantic_blocking(Path::new("/app/src/cmp.ts"));
        let crate::analyzer::DecoratorData::Component(c) = &data.classes[0].decorator else {
            panic!("expected a component");
        };
        let names: Vec<Option<String>> = c
            .directive
            .host_bindings
            .iter()
            .map(|b| b.host_property_name.as_ref().and_then(|n| n.get_optional()))
            .collect();
        assert_eq!(
            names,
            vec![
                Some("class.is-active".to_string()),
                Some("class.ready".to_string()),
                None,
            ]
        );

        let host_binding_errors: Vec<_> = data
            .diagnostics
            .iter()
            .filter(|d| d.message_text.contains("@HostBinding"))
            .collect();
        assert_eq!(host_binding_errors.len(), 1, "{host_binding_errors:?}");
        assert_eq!(host_binding_errors[0].code, 1010);
    }

    #[test]
    fn test_host_listener_imported_event_name_resolved_in_stage_2() {
        let files = vec![
            (
                "/app/src/events.ts",
                r#"
                export const CUSTOM_CLICK_EVENT = 'customClick';
                export const TARGET = 'window';
                export const NOT_A_STRING = 42;
                "#,
            ),
            (
                "/app/src/dir.ts",
                r#"
                import { Directive, HostListener } from '@angular/core';
                import { CUSTOM_CLICK_EVENT, TARGET, NOT_A_STRING } from './events';
                @Directive({ selector: '[myDir]' })
                export class MyDir {
                    @HostListener(CUSTOM_CLICK_EVENT, ['$event'])
                    handleClick(e: Event) {}
                    @HostListener(`${TARGET}:resize`)
                    onResize() {}
                    @HostListener(NOT_A_STRING)
                    wrong() {}
                }
                "#,
            ),
        ];

        let fs = create_test_fs(&files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            "/app/src/dir.ts",
        )]));
        let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);

        let data = engine.analyze_file_semantic_blocking(Path::new("/app/src/dir.ts"));
        let crate::analyzer::DecoratorData::Directive(d) = &data.classes[0].decorator else {
            panic!("expected a directive");
        };
        let names: Vec<Option<String>> = d
            .host_listeners
            .iter()
            .map(|l| l.resolved_event_name.get_optional())
            .collect();
        assert_eq!(
            names,
            vec![
                Some("customClick".to_string()),
                Some("window:resize".to_string()),
                None,
            ]
        );

        let host_listener_errors: Vec<_> = data
            .diagnostics
            .iter()
            .filter(|d| d.message_text.contains("@HostListener"))
            .collect();
        assert_eq!(host_listener_errors.len(), 1, "{host_listener_errors:?}");
        assert_eq!(host_listener_errors[0].code, 1010);
        assert_eq!(
            host_listener_errors[0].message_text,
            "@HostListener's event name argument must be a string"
        );
    }

    fn selector_engine(
        files: &[(&str, &str)],
        entry: &str,
    ) -> Arc<QueryEngine<crate::fs::OverlayFileSystem>> {
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

    /// Runs `fut` with a deadline so a query cycle fails the test instead of hanging.
    fn block_on_with_timeout<T: Send + 'static>(
        fut: impl std::future::Future<Output = T> + Send + 'static,
    ) -> T {
        let (tx, rx) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let _ = tx.send(futures::executor::block_on(fut));
        });
        rx.recv_timeout(std::time::Duration::from_secs(30))
            .expect("query deadlocked or timed out")
    }

    /// The selector a cross-file consumer sees for `name`, declared in `file`.
    async fn resolved_selector(
        ctx: &QueryContext<crate::fs::OverlayFileSystem>,
        file: FileId,
        name: &str,
    ) -> Option<String> {
        let evaluated = ctx.analyze_file_evaluated(file).await;
        evaluated.class_index[name].selector.clone()
    }

    /// Imported selectors are `None` in the syntax index but evaluated for cross-file consumers.
    /// An empty one falls back to `ng-component`.
    #[test]
    fn cross_file_consumers_see_imported_selectors() {
        let engine = selector_engine(
            &[
                (
                    "/app/constants.ts",
                    "const PREFIX = 'app';\n\
                     export const DIALOG = 'my-dialog';\n\
                     export const TOOLTIP = `[${PREFIX}Tooltip]`;\n\
                     export const EMPTY = '';\n",
                ),
                (
                    "/app/decls.ts",
                    "import { Component, Directive } from '@angular/core';\n\
                     import { DIALOG, TOOLTIP, EMPTY } from './constants';\n\
                     @Component({ selector: DIALOG, template: '' })\n\
                     export class Dialog {}\n\
                     @Directive({ selector: TOOLTIP })\n\
                     export class Tooltip {}\n\
                     @Component({ selector: EMPTY, template: '' })\n\
                     export class Empty {}\n\
                     @Component({ selector: 'local-one', template: '' })\n\
                     export class Local {}\n",
                ),
            ],
            "/app/decls.ts",
        );
        let file_id = engine.intern_path("/app/decls.ts");
        let ctx = QueryContext::new(engine.clone());
        let (syntax, selectors) = block_on_with_timeout(async move {
            let syntax = ctx.analyze_file_syntax(file_id).await;
            let mut selectors = Vec::new();
            for name in ["Dialog", "Tooltip", "Empty", "Local"] {
                selectors.push(resolved_selector(&ctx, file_id, name).await);
            }
            (syntax, selectors)
        });

        assert_eq!(
            selectors,
            vec![
                Some("my-dialog".to_string()),
                Some("[appTooltip]".to_string()),
                Some("ng-component".to_string()),
                Some("local-one".to_string()),
            ]
        );

        // The syntax query stays single-file.
        assert_eq!(syntax.class_index["Dialog"].selector, None);
    }

    /// Files importing each other's selector constants don't deadlock.
    #[test]
    fn cross_file_selectors_terminate_when_mutually_imported() {
        let engine = selector_engine(
            &[
                (
                    "/app/a.ts",
                    "import { Component } from '@angular/core';\n\
                     import { B_SELECTOR } from './b';\n\
                     export const A_SELECTOR = 'a-cmp';\n\
                     @Component({ selector: B_SELECTOR + '-host', template: '' })\n\
                     export class A {}\n",
                ),
                (
                    "/app/b.ts",
                    "import { Component } from '@angular/core';\n\
                     import { A_SELECTOR } from './a';\n\
                     export const B_SELECTOR = 'b-cmp';\n\
                     @Component({ selector: A_SELECTOR + '-host', template: '' })\n\
                     export class B {}\n",
                ),
            ],
            "/app/a.ts",
        );
        let a = engine.intern_path("/app/a.ts");
        let b = engine.intern_path("/app/b.ts");
        let ctx = QueryContext::new(engine.clone());
        let (a_selector, b_selector) = block_on_with_timeout(async move {
            futures::future::join(
                resolved_selector(&ctx, a, "A"),
                resolved_selector(&ctx, b, "B"),
            )
            .await
        });
        assert_eq!(a_selector.as_deref(), Some("b-cmp-host"));
        assert_eq!(b_selector.as_deref(), Some("a-cmp-host"));
    }

    /// A standalone component's scope matches an imported component by its evaluated selector.
    #[test]
    fn standalone_scope_uses_imported_selector() {
        let engine = selector_engine(
            &[
                ("/app/constants.ts", "export const DIALOG = 'my-dialog';\n"),
                (
                    "/app/dialog.ts",
                    "import { Component } from '@angular/core';\n\
                     import { DIALOG } from './constants';\n\
                     @Component({ selector: DIALOG, template: '' })\n\
                     export class Dialog {}\n",
                ),
                (
                    "/app/app.ts",
                    "import { Component } from '@angular/core';\n\
                     import { Dialog } from './dialog';\n\
                     @Component({ selector: 'app', template: '<my-dialog />', imports: [Dialog] })\n\
                     export class App {}\n",
                ),
            ],
            "/app/app.ts",
        );
        let data = engine.analyze_file_semantic_blocking(Path::new("/app/app.ts"));
        let component = data.classes[0].as_component().expect("a component");
        let selectors: Vec<Option<&str>> = component
            .resolved_declarations
            .as_ref()
            .expect("resolved declarations")
            .iter()
            .map(|d| d.selector.as_deref())
            .collect();
        assert_eq!(selectors, vec![Some("my-dialog")]);
    }
}
