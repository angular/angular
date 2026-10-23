use crate::fs::OverlayFileSystem;
use crate::query::keys::QueryKey;
use crate::query::{FileId, QueryContext};
use crate::resource_loader::ResourceResolverFs;
use crate::resource_registry::ResourceRegistry;
use crate::tsconfig_resolution;
use crate::utils::{create_resolver_with_fs, is_compilation_root, is_ts_file, is_ts_source};
use crate::{
    AnalysisResult, AnalyzerOptions, CompilationChunk, FileData, FileInvalidation, FileUpdate,
};
use futures::channel::mpsc;
use futures::prelude::*;
use futures::stream::FuturesUnordered;
use futures::task::{Spawn, SpawnExt};
use futures::StreamExt;
use oxc_resolver::FileSystem;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};

#[cfg(not(target_arch = "wasm32"))]
use std::sync::OnceLock;
use std::sync::{Arc, Mutex, RwLock};
use std::task::Waker;

#[cfg(not(target_arch = "wasm32"))]
static GLOBAL_POOL: OnceLock<futures::executor::ThreadPool> = OnceLock::new();

#[cfg(not(target_arch = "wasm32"))]
pub fn get_global_pool() -> &'static futures::executor::ThreadPool {
    GLOBAL_POOL.get_or_init(|| {
        futures::executor::ThreadPool::builder()
            .pool_size(std::thread::available_parallelism().unwrap().get())
            .create()
            .expect("Failed to create Global ThreadPool")
    })
}

#[cfg(target_arch = "wasm32")]
use std::cell::RefCell;

#[cfg(target_arch = "wasm32")]
thread_local! {
    static LOCAL_POOL: RefCell<futures::executor::LocalPool> = RefCell::new(futures::executor::LocalPool::new());
    // Cache the spawner so `get_local_spawner` never re-borrows `LOCAL_POOL` while
    // `run_until_stalled` holds `borrow_mut` (when self-driving queries spawn sub-queries).
    static LOCAL_SPAWNER: futures::executor::LocalSpawner =
        LOCAL_POOL.with(|pool| pool.borrow().spawner());
}

#[cfg(target_arch = "wasm32")]
pub fn get_local_spawner() -> futures::executor::LocalSpawner {
    LOCAL_SPAWNER.with(|spawner| spawner.clone())
}

#[cfg(target_arch = "wasm32")]
pub(crate) fn step_local_pool() {
    LOCAL_POOL.with(|pool| {
        pool.borrow_mut().run_until_stalled();
    });
}

#[derive(Clone)]
pub struct CancellationToken {
    cancelled: Arc<AtomicBool>,
    waker: Arc<Mutex<Option<Waker>>>,
}

impl Default for CancellationToken {
    fn default() -> Self {
        Self::new()
    }
}

impl CancellationToken {
    pub fn new() -> Self {
        Self {
            cancelled: Arc::new(AtomicBool::new(false)),
            waker: Arc::new(Mutex::new(None)),
        }
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::SeqCst);
        if let Some(waker) = self.waker.lock().unwrap().take() {
            waker.wake();
        }
    }

    pub fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::SeqCst)
    }
}

impl std::future::Future for CancellationToken {
    type Output = ();

    fn poll(
        self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Self::Output> {
        if self.is_cancelled() {
            std::task::Poll::Ready(())
        } else {
            let mut waker = self.waker.lock().unwrap();
            *waker = Some(cx.waker().clone());
            std::task::Poll::Pending
        }
    }
}

#[cfg(feature = "napi")]
use napi_derive::napi;

#[cfg_attr(feature = "napi", napi)]
pub struct Analyzer {
    resource_registry: Arc<ResourceRegistry>,
    fs: OverlayFileSystem,
    engine: Arc<crate::query::QueryEngine<OverlayFileSystem>>,
    #[cfg(not(target_arch = "wasm32"))]
    active_handles: Arc<RwLock<Vec<futures::future::RemoteHandle<()>>>>,

    /// The tsconfig, re-read after file updates for the `.d.ts` files it lists and, while
    /// `roots_from_tsconfig`, for its root files.
    tsconfig_path: Option<PathBuf>,
    /// Whether the roots still come from the tsconfig (no explicit `entry_points`, and
    /// `set_entry_points` not called).
    roots_from_tsconfig: AtomicBool,
    entrypoints: Arc<RwLock<Vec<PathBuf>>>,
    current_cancel_token: RwLock<Option<CancellationToken>>,
}

/// Every setting an [`Analyzer`] is built from, after merging explicit [`AnalyzerOptions`] over
/// the values read from the tsconfig (or their defaults without one). An explicitly set option
/// always takes precedence.
struct EffectiveConfig {
    /// The tsconfig, if any. After construction it is re-read for its file list, and the module
    /// resolver reads its `paths`/`baseUrl` mappings.
    tsconfig_path: Option<PathBuf>,
    /// Explicit `entry_points`, which replace the tsconfig's root files. Not yet canonicalized
    /// (that needs the configured `fs`).
    entry_points: Option<Vec<PathBuf>>,
    /// The tsconfig's file list (root files and `.d.ts` files), empty without a tsconfig. Its
    /// `.d.ts` files are used even when `entry_points` replace its roots.
    tsconfig_files: Vec<PathBuf>,
    r3_symbols_file: Option<PathBuf>,
    /// `default_host.preserve_symlinks` > `compilerOptions.preserveSymlinks` > `false`.
    preserve_symlinks: bool,
    /// `default_host.root_dirs` > `compilerOptions.rootDirs` > `[tsconfig dir]` > none.
    merge_root_dirs: Vec<PathBuf>,
    /// `default_host.node_modules_path_override` > `node_modules_path_override`.
    node_modules_path_override: Option<String>,
    /// `workspace_name` > `angularCompilerOptions.workspaceName` (or `bazelOptions`).
    workspace_name: Option<String>,
    /// `import_prefix_roots` > `root_dirs` (deprecated alias) > `merge_root_dirs`.
    import_prefix_roots: Vec<PathBuf>,
    use_host_for_import_generation: bool,
    generate_extra_imports_in_local_mode: bool,
    compile_non_exported_classes: bool,
    enable_hmr: bool,
    strict_standalone: bool,
    use_poisoned_data: bool,
    strict_injection_parameters: bool,
    implicit_standalone: bool,
}

impl EffectiveConfig {
    fn resolve(options: AnalyzerOptions, fs: &OverlayFileSystem) -> Result<Self, String> {
        let tsconfig_path = options.tsconfig_path.map(PathBuf::from);
        let resolved = match &tsconfig_path {
            Some(path) => Some(
                tsconfig_resolution::load_and_resolve_tsconfig(path, fs)
                    .map_err(|e| e.to_string())?,
            ),
            None => None,
        };

        // Relative paths resolve against the tsconfig directory; without a tsconfig there is no
        // base to resolve them against.
        let base_dir = tsconfig_path
            .as_deref()
            .map(|path| path.parent().unwrap_or(Path::new(".")).to_path_buf());
        let absolutize = |path: PathBuf| -> Result<PathBuf, String> {
            match &base_dir {
                _ if crate::fs::is_absolute_path(&path) => Ok(path),
                Some(base_dir) => Ok(base_dir.join(path)),
                None => Err(format!(
                    "'{}' must be an absolute path when no tsconfig is given",
                    path.display()
                )),
            }
        };
        let absolutize_all = |paths: Vec<String>| -> Result<Vec<PathBuf>, String> {
            paths.into_iter().map(PathBuf::from).map(absolutize).collect()
        };

        // A tsconfig-provided flag, or its default without a tsconfig.
        let tsconfig_flag = |pick: fn(&tsconfig_resolution::ResolvedTsConfig) -> bool, default| {
            resolved.as_ref().map_or(default, pick)
        };
        let default_host = options.default_host.unwrap_or_default();
        let preserve_symlinks = default_host
            .preserve_symlinks
            .unwrap_or_else(|| tsconfig_flag(|r| r.preserve_symlinks, false));
        let use_host_for_import_generation = options
            .use_host_for_import_generation
            .unwrap_or_else(|| tsconfig_flag(|r| r.use_host_for_import_generation, false));
        let generate_extra_imports_in_local_mode = options
            .generate_extra_imports_in_local_mode
            .unwrap_or_else(|| tsconfig_flag(|r| r.generate_extra_imports_in_local_mode, false));
        let compile_non_exported_classes = options
            .compile_non_exported_classes
            .unwrap_or_else(|| tsconfig_flag(|r| r.compile_non_exported_classes, true));
        let enable_hmr = options
            .enable_hmr
            .unwrap_or_else(|| tsconfig_flag(|r| r.enable_hmr, false));
        let strict_standalone = options
            .strict_standalone
            .unwrap_or_else(|| tsconfig_flag(|r| r.strict_standalone, false));
        let use_poisoned_data = options
            .use_poisoned_data
            .unwrap_or_else(|| tsconfig_flag(|r| r.compile_poisoned_components, false));
        let strict_injection_parameters = options
            .strict_injection_parameters
            .unwrap_or_else(|| tsconfig_flag(|r| r.strict_injection_parameters, false));
        let implicit_standalone = options
            .implicit_standalone
            .unwrap_or_else(|| tsconfig_flag(|r| r.implicit_standalone, true));

        let (tsconfig_files, tsconfig_root_dirs, tsconfig_workspace_name) = match resolved {
            Some(r) => (r.files, r.compiler_options.root_dirs, r.workspace_name),
            None => (Vec::new(), None, None),
        };

        let mut merge_root_dirs = match default_host.root_dirs {
            Some(dirs) => absolutize_all(dirs)?,
            None => tsconfig_root_dirs
                .unwrap_or_default()
                .into_iter()
                .map(absolutize)
                .collect::<Result<_, _>>()?,
        };
        if merge_root_dirs.is_empty() {
            merge_root_dirs.extend(base_dir.clone());
        }

        let import_prefix_roots = match options.import_prefix_roots.or(options.root_dirs) {
            Some(dirs) => absolutize_all(dirs)?,
            None => merge_root_dirs.clone(),
        };

        let entry_points = options.entry_points.map(absolutize_all).transpose()?;

        Ok(Self {
            entry_points,
            tsconfig_files,
            r3_symbols_file: options
                .r3_symbols_file
                .map(|path| absolutize(PathBuf::from(path)))
                .transpose()?,
            preserve_symlinks,
            merge_root_dirs,
            node_modules_path_override: default_host
                .node_modules_path_override
                .or(options.node_modules_path_override),
            workspace_name: options.workspace_name.or(tsconfig_workspace_name),
            import_prefix_roots,
            use_host_for_import_generation,
            generate_extra_imports_in_local_mode,
            compile_non_exported_classes,
            enable_hmr,
            strict_standalone,
            use_poisoned_data,
            strict_injection_parameters,
            implicit_standalone,
            tsconfig_path,
        })
    }
}

impl Analyzer {
    pub fn new_core(options: AnalyzerOptions) -> Result<Self, String> {
        let physical = std::sync::Arc::new(crate::physical_fs::default_physical_fs());
        Self::new_core_with_physical_fs(options, physical)
    }

    /// Like [`Self::new_core`], but with an explicit physical filesystem (used by the WASM build to
    /// supply a JS-backed filesystem).
    pub fn new_core_with_physical_fs(
        options: AnalyzerOptions,
        physical: std::sync::Arc<dyn crate::physical_fs::PhysicalFs>,
    ) -> Result<Self, String> {
        let allowed = options
            .allowed_sources
            .clone()
            .map(|files| files.into_iter().map(PathBuf::from).collect());
        let fs = OverlayFileSystem::new_with_allowed_sources_and_fs(allowed, physical);
        if let Some(ref virtual_files) = options.virtual_files {
            for (path_str, content) in virtual_files {
                let path = PathBuf::from(path_str);
                fs.upsert_file(path, content.clone());
            }
        }

        Self::new_core_with_fs(options, fs)
    }

    pub fn new_core_with_fs(
        options: AnalyzerOptions,
        fs: OverlayFileSystem,
    ) -> Result<Self, String> {
        let config = EffectiveConfig::resolve(options, &fs)?;
        Ok(Self::construct(config, fs))
    }

    /// Build the analyzer from fully merged settings. Order matters: the symlink mode and the
    /// `rootDirs` must be set on `fs` before entry points are canonicalized through it.
    fn construct(config: EffectiveConfig, fs: OverlayFileSystem) -> Self {
        fs.set_preserve_symlinks(config.preserve_symlinks);
        fs.set_root_dirs(config.merge_root_dirs);

        let roots_from_tsconfig = config.entry_points.is_none();
        let (entrypoints, dts_files) = match config.entry_points {
            Some(entry_points) => (
                compilation_roots(entry_points, &fs),
                tsconfig_dts_files(config.tsconfig_files),
            ),
            None => partition_tsconfig_files(config.tsconfig_files, &fs),
        };
        let r3_symbols_file = config
            .r3_symbols_file
            .map(|path| fs.canonicalize(&path).unwrap_or(path));
        let entrypoints_lock = Arc::new(RwLock::new(entrypoints));

        let resource_registry = Arc::new(ResourceRegistry::default());

        let resolver = Arc::new(create_resolver_with_fs(
            config.tsconfig_path.as_deref(),
            fs.clone(),
            config.preserve_symlinks,
            config.node_modules_path_override,
        ));

        use crate::analyzer::import_emit::{
            ApfImportStrategy, PrefixImportStrategy, ReferenceEmitStrategy,
        };
        let reference_strategy: Arc<dyn ReferenceEmitStrategy> = match config.workspace_name {
            Some(ws) if config.use_host_for_import_generation => {
                Arc::new(PrefixImportStrategy::new(ws, config.import_prefix_roots))
            }
            _ => Arc::new(ApfImportStrategy::new()),
        };

        let engine = crate::query::QueryEngine::new_with_options(
            fs.clone(),
            resolver,
            resource_registry.clone(),
            entrypoints_lock.clone(),
            reference_strategy,
            r3_symbols_file,
            config.generate_extra_imports_in_local_mode,
            config.compile_non_exported_classes,
            config.enable_hmr,
            config.strict_standalone,
            config.use_poisoned_data,
            config.strict_injection_parameters,
            config.implicit_standalone,
        );
        *engine.tsconfig_dts_files.write().unwrap() = dts_files;

        Analyzer {
            resource_registry,
            fs,
            engine,
            #[cfg(not(target_arch = "wasm32"))]
            active_handles: Arc::new(RwLock::new(Vec::new())),
            tsconfig_path: config.tsconfig_path,
            roots_from_tsconfig: AtomicBool::new(roots_from_tsconfig),
            entrypoints: entrypoints_lock,
            current_cancel_token: RwLock::new(None),
        }
    }

    pub fn analyze_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.cancel_current_analysis();

        let (final_sender, receiver) = futures::channel::mpsc::unbounded();
        let cancel_token = CancellationToken::new();
        *self.current_cancel_token.write().unwrap() = Some(cancel_token.clone());

        self.run_coordinator_helper(
            self.entrypoints.read().unwrap().clone(),
            spawner,
            false,
            cancel_token,
            Some(final_sender),
        );

        Ok(receiver)
    }

    pub fn analyze_optimized_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.cancel_current_analysis();

        let (final_sender, receiver) = futures::channel::mpsc::unbounded();
        let cancel_token = CancellationToken::new();
        *self.current_cancel_token.write().unwrap() = Some(cancel_token.clone());

        self.run_coordinator_helper(
            self.entrypoints.read().unwrap().clone(),
            spawner,
            true,
            cancel_token,
            Some(final_sender),
        );

        Ok(receiver)
    }

    pub fn analyze_delta_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.cancel_current_analysis();

        let (final_sender, receiver) = futures::channel::mpsc::unbounded();
        let cancel_token = CancellationToken::new();
        *self.current_cancel_token.write().unwrap() = Some(cancel_token.clone());

        let paths: Vec<PathBuf> = self.entrypoints.read().unwrap().clone();

        self.run_coordinator_helper(paths, spawner, false, cancel_token, Some(final_sender));

        Ok(receiver)
    }

    pub fn analyze_optimized_delta_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.cancel_current_analysis();

        let (final_sender, receiver) = futures::channel::mpsc::unbounded();
        let cancel_token = CancellationToken::new();
        *self.current_cancel_token.write().unwrap() = Some(cancel_token.clone());

        let paths: Vec<PathBuf> = self.entrypoints.read().unwrap().clone();

        self.run_coordinator_helper(paths, spawner, true, cancel_token, Some(final_sender));

        Ok(receiver)
    }

    pub fn cancel_current_analysis(&self) {
        let mut token_write = self.current_cancel_token.write().unwrap();
        if let Some(token) = token_write.take() {
            token.cancel();
        }

        #[cfg(not(target_arch = "wasm32"))]
        {
            let mut handles_write = self.active_handles.write().unwrap();
            let handles = std::mem::take(&mut *handles_write);
            drop(handles_write);

            if !handles.is_empty() {
                use futures::stream::FuturesUnordered;
                use futures::StreamExt;
                let mut pool = FuturesUnordered::new();
                for h in handles {
                    pool.push(h);
                }
                futures::executor::block_on(async { while pool.next().await.is_some() {} });
            }
        }
    }

    pub fn get_ts_file_for_template_core(
        &self,
        template_path: String,
    ) -> Option<Vec<crate::TemplateUsage>> {
        let path = PathBuf::from(&template_path);
        self.resource_registry
            .get_components_for_template(&path)
            .map(|v| {
                v.into_iter()
                    .map(|(ts_path, symbol_id)| crate::TemplateUsage {
                        ts_file_path: ts_path.to_string_lossy().into_owned(),
                        symbol_id: symbol_id.index() as u32,
                    })
                    .collect()
            })
    }

    /// Invalidate query-cache entries for every component TS file that references `path`.
    fn handle_template_change(&self, path: &Path, invalidated_paths: &mut Vec<String>) {
        let Some(affected) = self.resource_registry.get_components_for_template(path) else {
            return;
        };

        for (ts_path, _class_name) in affected {
            invalidated_paths.push(ts_path.to_string_lossy().into_owned());
            self.evict_file(&ts_path, invalidated_paths);
        }
    }

    /// Evict all cached queries derived from `path`.
    ///
    /// Unconditionally evicts `path` regardless of extension (including `.d.ts`, `.mts`, `.tsx`,
    /// `.js`): dependents fall out through the reverse index, and evicting an unread path is a
    /// no-op (gating on `.ts` once hid `.d.ts` edits until restart). Components using `path` as an
    /// external template or stylesheet are evicted separately, since they read it through the
    /// resource registry rather than as a query dependency.
    fn invalidate_changed_path(&self, path: &Path, invalidated_paths: &mut Vec<String>) {
        self.handle_template_change(path, invalidated_paths);
        self.evict_file(path, invalidated_paths);
    }

    /// Evict cached queries depending on `path` and append each evicted file's wire path.
    fn evict_file(&self, path: &Path, invalidated_paths: &mut Vec<String>) {
        let evicted = self.engine.invalidate_file(path);
        self.push_evicted_paths(evicted, invalidated_paths);
    }

    /// Append the wire path of every file whose cached query was evicted.
    fn push_evicted_paths(&self, evicted: Vec<QueryKey>, invalidated_paths: &mut Vec<String>) {
        let mut evicted: Vec<String> = evicted
            .into_iter()
            .filter_map(|key| key.file_id())
            .map(|file_id| crate::fs::path_to_string(self.engine.lookup_path(file_id)))
            .collect();
        evicted.sort_unstable();
        evicted.dedup();
        invalidated_paths.extend(evicted);
    }

    pub fn get_file_content_core(&self, file_path: String) -> Result<String, String> {
        let path = PathBuf::from(&file_path);
        self.fs.read_to_string(&path).map_err(|e| e.to_string())
    }

    /// Resolve `url` the way a component's `templateUrl`/`styleUrls` are resolved from
    /// `containing_file` and read it. Backs the stylesheets the TypeScript layer discovers only
    /// after parsing a template (`<link rel="stylesheet">`), which ngtsc also resolves from the
    /// component file rather than from the template.
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L876-L883
    pub fn read_resource_core(
        &self,
        containing_file: String,
        url: String,
    ) -> Option<crate::ResolvedResource> {
        let resource_resolver =
            crate::ResourceResolver::new(&self.fs, self.engine.resolver.as_ref());
        let resource = resource_resolver
            .load_resource(Path::new(&containing_file), &url)
            .ok()?;
        Some(crate::ResolvedResource {
            resolved_path: crate::fs::path_to_string(resource.resolved_path),
            content: resource.content,
        })
    }

    /// Apply content updates and return every path whose cached results are now stale.
    pub fn update_file_content_core(
        &self,
        updates: Vec<FileUpdate>,
    ) -> Result<Vec<String>, String> {
        self.cancel_current_analysis();
        let mut paths_to_invalidate = Vec::new();

        for update in updates {
            let raw_path = PathBuf::from(&update.file_path);
            let path = self.fs.canonicalize(&raw_path).unwrap_or(raw_path);
            self.fs.upsert_file(path.clone(), update.content.clone());

            paths_to_invalidate.push(path.to_string_lossy().into_owned());
            self.invalidate_changed_path(&path, &mut paths_to_invalidate);
        }

        self.re_resolve_entrypoints(&mut paths_to_invalidate);
        Ok(dedup_preserving_order(paths_to_invalidate))
    }

    /// Drop the virtual overlay of each changed or deleted file and return every stale TS path.
    pub fn invalidate_files_core(
        &self,
        updates: Vec<FileInvalidation>,
    ) -> Result<Vec<String>, String> {
        self.cancel_current_analysis();
        let mut ts_paths_to_invalidate = Vec::new();

        for update in updates {
            let raw_path = PathBuf::from(&update.file_path);
            let path = self.fs.canonicalize(&raw_path).unwrap_or(raw_path);
            self.fs.remove_virtual_file(&path);

            if is_ts_file(&path) {
                self.resource_registry.unregister_ts_file(&path);
                ts_paths_to_invalidate.push(path.to_string_lossy().into_owned());
            }
            self.invalidate_changed_path(&path, &mut ts_paths_to_invalidate);
        }

        self.re_resolve_entrypoints(&mut ts_paths_to_invalidate);
        Ok(dedup_preserving_order(ts_paths_to_invalidate))
    }

    /// Re-read the tsconfig's file list, which changes when files matching its `include` globs are
    /// added or removed. Its `.d.ts` files are always applied; its root files only while the roots
    /// come from the tsconfig.
    fn re_resolve_entrypoints(&self, invalidated_paths: &mut Vec<String>) {
        let Some(tsconfig_path) = &self.tsconfig_path else {
            return;
        };
        let Ok(resolved_config) =
            tsconfig_resolution::load_and_resolve_tsconfig(tsconfig_path, &self.fs)
        else {
            return;
        };
        let files = resolved_config.files;
        let (roots, dts_files) = if self.roots_from_tsconfig.load(Ordering::SeqCst) {
            let (roots, dts_files) = partition_tsconfig_files(files, &self.fs);
            (Some(roots), dts_files)
        } else {
            (None, tsconfig_dts_files(files))
        };
        self.replace_program_files(roots, Some(dts_files), invalidated_paths);
    }

    /// Replace the compilation roots and return every path whose cached analysis is now stale.
    ///
    /// Paths must be absolute. Non-TS sources and declaration files are not compilation roots and
    /// are dropped; the `.d.ts` files searched for ambient modules still come from the tsconfig.
    /// Setting the same roots again evicts nothing. From then on the roots are no longer re-read
    /// from the tsconfig.
    pub fn set_entry_points_core(&self, entry_points: Vec<String>) -> Result<Vec<String>, String> {
        let paths: Vec<PathBuf> = entry_points.into_iter().map(PathBuf::from).collect();
        if let Some(relative) = paths.iter().find(|p| !crate::fs::is_absolute_path(p)) {
            return Err(format!(
                "Entry points must be absolute paths, got '{}'",
                relative.display()
            ));
        }

        self.cancel_current_analysis();
        self.roots_from_tsconfig.store(false, Ordering::SeqCst);
        let mut invalidated_paths = Vec::new();
        let roots = compilation_roots(paths, &self.fs);
        self.replace_program_files(Some(roots), None, &mut invalidated_paths);
        Ok(dedup_preserving_order(invalidated_paths))
    }

    /// Install the given compilation roots and the tsconfig's `.d.ts` files (`None` keeps the
    /// current list), evicting every query that read the previous lists when either differs.
    fn replace_program_files(
        &self,
        roots: Option<Vec<PathBuf>>,
        dts_files: Option<Vec<PathBuf>>,
        invalidated_paths: &mut Vec<String>,
    ) {
        let roots_changed = roots.is_some_and(|roots| replace_if_changed(&self.entrypoints, roots));
        let dts_files_changed = dts_files.is_some_and(|dts_files| {
            replace_if_changed(&self.engine.tsconfig_dts_files, dts_files)
        });
        if !roots_changed && !dts_files_changed {
            return;
        }
        let evicted = self.engine.invalidate_roots();
        self.push_evicted_paths(evicted, invalidated_paths);
    }
}

/// Store `value` in `lock` and report whether it differed from the previous value.
fn replace_if_changed<T: PartialEq>(lock: &RwLock<T>, value: T) -> bool {
    let mut current = lock.write().unwrap();
    if *current == value {
        return false;
    }
    *current = value;
    true
}

/// Split the tsconfig's file list into the compilation roots, canonicalized through `fs`, and the
/// `.d.ts` files it also lists, only normalized structurally. Bazel targets can list thousands of
/// transitive `.d.ts` files, so they never cost a canonicalize call here: the ambient module index
/// canonicalizes them lazily, once an import actually needs it (`QueryKey::AmbientModuleFiles`).
/// Other files are filtered out.
fn partition_tsconfig_files(
    files: Vec<PathBuf>,
    fs: &OverlayFileSystem,
) -> (Vec<PathBuf>, Vec<PathBuf>) {
    let mut roots = Vec::new();
    let mut dts_files = Vec::new();
    for path in files {
        if is_compilation_root(&path) {
            roots.push(canonical_root(&path, fs));
        } else if crate::utils::is_dts(&path) {
            dts_files.push(crate::fs::normalize_path_structural(&path).into_owned());
        }
    }
    (roots, dts_files)
}

/// The compilation roots among `files`, canonicalized through `fs`, for roots that replace the
/// tsconfig's.
fn compilation_roots(files: Vec<PathBuf>, fs: &OverlayFileSystem) -> Vec<PathBuf> {
    files
        .into_iter()
        .filter(|path| is_compilation_root(path))
        .map(|path| canonical_root(&path, fs))
        .collect()
}

/// The `.d.ts` files among the tsconfig's `files`, when its roots are replaced. See
/// [`partition_tsconfig_files`].
fn tsconfig_dts_files(files: Vec<PathBuf>) -> Vec<PathBuf> {
    files
        .into_iter()
        .filter(|path| crate::utils::is_dts(path))
        .map(|path| crate::fs::normalize_path_structural(&path).into_owned())
        .collect()
}

fn canonical_root(path: &Path, fs: &OverlayFileSystem) -> PathBuf {
    fs.canonicalize(path)
        .unwrap_or_else(|_| crate::fs::normalize_path_structural(path).into_owned())
}

#[cfg_attr(feature = "napi", napi)]
impl Analyzer {
    #[cfg(feature = "napi")]
    #[napi(constructor)]
    pub fn new(options: AnalyzerOptions) -> napi::Result<Self> {
        Self::new_core(options).map_err(napi::Error::from_reason)
    }

    #[cfg(not(feature = "napi"))]
    pub fn new(options: AnalyzerOptions) -> Result<Self, String> {
        Self::new_core(options)
    }

    #[cfg_attr(feature = "napi", napi)]
    pub fn get_ts_file_for_template(
        &self,
        template_path: String,
    ) -> Option<Vec<crate::TemplateUsage>> {
        self.get_ts_file_for_template_core(template_path)
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn update_file_content(&self, updates: Vec<FileUpdate>) -> napi::Result<Vec<String>> {
        self.update_file_content_core(updates)
            .map_err(napi::Error::from_reason)
    }

    #[cfg(not(feature = "napi"))]
    pub fn update_file_content(&self, updates: Vec<FileUpdate>) -> Result<Vec<String>, String> {
        self.update_file_content_core(updates)
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn invalidate_files(&self, updates: Vec<FileInvalidation>) -> napi::Result<Vec<String>> {
        self.invalidate_files_core(updates)
            .map_err(napi::Error::from_reason)
    }

    #[cfg(not(feature = "napi"))]
    pub fn invalidate_files(&self, updates: Vec<FileInvalidation>) -> Result<Vec<String>, String> {
        self.invalidate_files_core(updates)
    }

    /// Replace the compilation roots and return every path whose cached analysis is now stale.
    /// Paths must be absolute. From then on the roots are no longer re-read from the tsconfig.
    #[cfg(feature = "napi")]
    #[napi]
    pub fn set_entry_points(&self, entry_points: Vec<String>) -> napi::Result<Vec<String>> {
        self.set_entry_points_core(entry_points)
            .map_err(napi::Error::from_reason)
    }

    #[cfg(not(feature = "napi"))]
    pub fn set_entry_points(&self, entry_points: Vec<String>) -> Result<Vec<String>, String> {
        self.set_entry_points_core(entry_points)
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze(&self) -> napi::Result<crate::AnalysisIterator> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self
            .analyze_core(spawner)
            .map_err(napi::Error::from_reason)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze(&self) -> Result<crate::AnalysisIterator, String> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self.analyze_core(spawner)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze_optimized(&self) -> napi::Result<crate::AnalysisIterator> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self
            .analyze_optimized_core(spawner)
            .map_err(napi::Error::from_reason)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze_optimized(&self) -> Result<crate::AnalysisIterator, String> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self.analyze_optimized_core(spawner)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze_delta(&self) -> napi::Result<crate::AnalysisIterator> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self
            .analyze_delta_core(spawner)
            .map_err(napi::Error::from_reason)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze_delta(&self) -> Result<crate::AnalysisIterator, String> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self.analyze_delta_core(spawner)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze_optimized_delta(&self) -> napi::Result<crate::AnalysisIterator> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self
            .analyze_optimized_delta_core(spawner)
            .map_err(napi::Error::from_reason)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze_optimized_delta(&self) -> Result<crate::AnalysisIterator, String> {
        #[cfg(not(target_arch = "wasm32"))]
        let spawner = get_global_pool().clone();
        #[cfg(target_arch = "wasm32")]
        let spawner = get_local_spawner();

        let rx = self.analyze_optimized_delta_core(spawner)?;
        Ok(crate::AnalysisIterator::new(rx))
    }

    #[cfg_attr(feature = "napi", napi)]
    pub fn get_metadata_for_file(&self, file_path: String) -> Option<AnalysisResult> {
        let path = PathBuf::from(&file_path);
        // Non-TS files (templates, stylesheets, JSON) and missing files return `None`, like ngtsc's
        // `TraitCompiler.recordFor`, rather than failing (the language service asks about every
        // open document, and a panic over N-API aborts the host) or degrading to an empty
        // `AnalysisResult` indistinguishable from a classless file.
        if !is_ts_file(&path) || !self.fs.metadata(&path).is_ok_and(|m| m.is_file()) {
            return None;
        }

        // Synchronously drive `AnalyzeFileSemantic` to completion. Wire projection happens at
        // the engine boundary; an `Err` is an internal bug (semantic results are demoted hole-free)
        // or user error, returning `None` to prevent an FFI panic across N-API.
        let file_data = self.engine.analyze_file_semantic_blocking(path);
        let parse_res = self.engine.parse_file_by_id_blocking(file_data.file_id);
        let source_text = parse_res.lock().unwrap().borrow_owner().source_text.clone();
        let path_lookup = |id| self.engine.lookup_path(id);
        let declaring_exports = self.engine.declaring_export_names_blocking(&file_data);
        let r3_symbols_path = self.engine.r3_symbols_file();
        let cx = crate::analyzer::WireContext {
            mode: crate::analyzer::WireMode::Semantic,
            source_text: &source_text,
            converter: &file_data.converter,
            reference_strategy: &*self.engine.reference_strategy,
            path_lookup: Some(&path_lookup),
            declaring_exports: &declaring_exports,
            r3_symbols_path: r3_symbols_path.as_deref(),
        };
        match file_data.to_wire(&cx) {
            Ok(result) => Some(result),
            Err(err) => {
                // TODO(diagnostics): surface WireError via a diagnostics channel instead of
                // logging to stderr and returning None.
                #[allow(clippy::print_stderr)]
                {
                    eprintln!("ERROR: {err}; skipping metadata for this file");
                }
                None
            }
        }
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn get_file_content(&self, file_path: String) -> napi::Result<String> {
        self.get_file_content_core(file_path)
            .map_err(napi::Error::from_reason)
    }

    #[cfg(not(feature = "napi"))]
    pub fn get_file_content(&self, file_path: String) -> Result<String, String> {
        self.get_file_content_core(file_path)
    }

    #[cfg_attr(feature = "napi", napi)]
    pub fn read_resource(
        &self,
        containing_file: String,
        url: String,
    ) -> Option<crate::ResolvedResource> {
        self.read_resource_core(containing_file, url)
    }

    fn run_coordinator_helper<S: Spawner>(
        &self,
        paths: Vec<PathBuf>,
        spawner: S,
        is_optimized: bool,
        cancel_token: CancellationToken,
        sender: Option<
            futures::channel::mpsc::UnboundedSender<Result<crate::CompilationChunk, String>>,
        >,
    ) {
        let engine = self.engine.clone();

        let engine_clone = engine.clone();

        // Dependency discovery always uses `AnalyzeFileSyntax`; `processor` below selects between
        // projecting the syntax result (local mode) and running `AnalyzeFileSemantic` (optimized).
        let local_analyzer = move |file_path: PathBuf| {
            let engine = engine_clone.clone();
            async move {
                let file_id = engine.intern_path(file_path);
                let res = QueryContext::new(engine.clone())
                    .analyze_file_syntax(file_id)
                    .await;
                (*res).clone()
            }
            .boxed()
        };

        let engine_clone = engine.clone();
        let cancel_token_clone = cancel_token.clone();
        let r3_symbols_path: Option<Arc<Path>> = self.engine.r3_symbols_file().map(Arc::from);

        let processor = move |file_path: PathBuf, _local_res: FileData| {
            let engine = engine_clone.clone();
            let cancel_token = cancel_token_clone.clone();
            let r3_symbols_path = r3_symbols_path.clone();

            async move {
                if cancel_token.is_cancelled() {
                    return (Err("Cancelled".to_string()), FileChunkInfo::default());
                }

                if !crate::utils::is_dts(&file_path) && !_local_res.errors.is_empty() {
                    return (
                        Err(format!(
                            "Syntax errors in {}: \n{}",
                            file_path.display(),
                            _local_res.errors.join("\n")
                        )),
                        FileChunkInfo::default(),
                    );
                }

                // TODO(diagnostics): surface WireError on AnalysisResult instead of dropping
                // the file from the stream.
                let ctx = QueryContext::new(engine.clone());
                let parse_res = ctx.parse_file(_local_res.file_id).await;
                let source_text = parse_res.lock().unwrap().borrow_owner().source_text.clone();
                let path_lookup = |id| engine.lookup_path(id);
                let (projected, chunk_info) = if is_optimized {
                    let semantic_res = ctx.analyze_file_semantic(_local_res.file_id).await;
                    let chunk_info = extract_chunk_info(&semantic_res, &engine, &ctx).await;
                    let declaring_exports = ctx.declaring_export_names(&semantic_res).await;
                    let cx = crate::analyzer::WireContext {
                        mode: crate::analyzer::WireMode::Semantic,
                        source_text: &source_text,
                        converter: &semantic_res.converter,
                        reference_strategy: &*engine.reference_strategy,
                        path_lookup: Some(&path_lookup),
                        declaring_exports: &declaring_exports,
                        r3_symbols_path: r3_symbols_path.as_deref(),
                    };
                    (semantic_res.to_wire(&cx), chunk_info)
                } else {
                    let mut syntax_res = _local_res;
                    // ngtsc's local compilation still evaluates imported `selector`, `styles`,
                    // `templateUrl` and `styleUrl(s)` constants; only scope resolution is off.
                    // TODO(parity): unresolvable imports should report NG11001, not NG1010.
                    for class in &mut syntax_res.classes {
                        class.complete_selector(&ctx).await;
                        class.complete_styles(&ctx).await;
                        class.complete_resource_urls(&ctx).await;
                        class.complete_isolated_type_tuples(&ctx).await;
                    }
                    // Must run before `validate()`, `extract_chunk_info` and `to_wire()`: it sets
                    // the extra imports and `declaring_ng_module` they read.
                    if engine.generate_extra_imports_in_local_mode {
                        engine
                            .populate_local_compilation_extra_imports(&mut syntax_res, &ctx)
                            .await;
                    }
                    syntax_res
                        .validate(engine.validation_context(crate::analyzer::WireMode::Syntax));
                    // Local mode normally streams 1-file chunks, but under `generateExtraImportsInLocalMode`
                    // it groups by NgModule because template cycle detection across sibling declarations
                    // requires the whole module in one chunk.
                    let chunk_info = if engine.generate_extra_imports_in_local_mode {
                        extract_chunk_info(&syntax_res, &engine, &ctx).await
                    } else {
                        FileChunkInfo::default()
                    };
                    let declaring_exports = ctx.declaring_export_names(&syntax_res).await;
                    let cx = crate::analyzer::WireContext {
                        mode: crate::analyzer::WireMode::Syntax,
                        source_text: &source_text,
                        converter: &syntax_res.converter,
                        reference_strategy: &*engine.reference_strategy,
                        path_lookup: Some(&path_lookup),
                        declaring_exports: &declaring_exports,
                        r3_symbols_path: r3_symbols_path.as_deref(),
                    };
                    (syntax_res.to_wire(&cx), chunk_info)
                };
                (projected.map_err(|err| err.to_string()), chunk_info)
            }
            .boxed()
        };

        let (event_sender, event_receiver) = mpsc::channel::<CoordinatorEvent>(100);

        // Group into `@NgModule`-sized chunks only when needed: optimized mode (remote scoping,
        // NgModule scope emit) and local mode with `generateExtraImportsInLocalMode` (template
        // cycle detection across an NgModule's declarations).
        let group_chunks_by_ng_module =
            is_optimized || self.engine.generate_extra_imports_in_local_mode;

        #[cfg(not(target_arch = "wasm32"))]
        {
            let fut = run_coordinator(
                engine.clone(),
                paths,
                spawner.clone(),
                event_receiver,
                event_sender,
                local_analyzer,
                processor,
                cancel_token,
                sender,
                group_chunks_by_ng_module,
            );

            let handle = spawner.spawn_with_handle(fut).unwrap();
            self.active_handles.write().unwrap().push(handle);
        }

        #[cfg(target_arch = "wasm32")]
        {
            use futures::task::LocalSpawnExt;
            let fut = run_coordinator(
                engine.clone(),
                paths,
                spawner.clone(),
                event_receiver,
                event_sender,
                local_analyzer,
                processor,
                cancel_token,
                sender,
                group_chunks_by_ng_module,
            );
            spawner.spawn_local(fut).unwrap();
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
pub trait Spawner: Spawn + Clone + Send + 'static {}
#[cfg(not(target_arch = "wasm32"))]
impl<T: Spawn + Clone + Send + 'static> Spawner for T {}

#[cfg(target_arch = "wasm32")]
pub trait Spawner: Spawn + futures::task::LocalSpawn + Clone + 'static {}
#[cfg(target_arch = "wasm32")]
impl<T: Spawn + futures::task::LocalSpawn + Clone + 'static> Spawner for T {}

async fn run_coordinator<S, LA, FutLA, P, FutP, Fs>(
    engine: Arc<crate::QueryEngine<Fs>>,
    entrypoints: Vec<PathBuf>,
    spawner: S,
    event_receiver: mpsc::Receiver<CoordinatorEvent>,
    event_sender: mpsc::Sender<CoordinatorEvent>,
    local_analyzer: LA,
    processor: P,
    cancel_token: CancellationToken,
    final_sender: Option<
        futures::channel::mpsc::UnboundedSender<Result<crate::CompilationChunk, String>>,
    >,
    group_chunks_by_ng_module: bool,
) where
    Fs: FileSystem + Clone + 'static + ResourceResolverFs,
    S: Spawner,
    LA: Fn(PathBuf) -> FutLA + Send + Sync + 'static + Clone,
    FutLA: std::future::Future<Output = FileData> + Send + 'static,
    P: Fn(PathBuf, FileData) -> FutP + Send + Sync + 'static + Clone,
    FutP: std::future::Future<Output = (Result<crate::AnalysisResult, String>, FileChunkInfo)>
        + Send
        + 'static,
{
    let mut seen = HashSet::new();
    let mut pending_tasks = FuturesUnordered::new();
    let mut uf = UnionFind::new();

    if cancel_token.is_cancelled() {
        return;
    }

    // Spawns the per-file task: Stage-1 analysis (resolving static/dynamic dependencies),
    // dep fan-out over `event_sender`, and Stage-2 processing, checking cancellation at each await.
    // The closure owns its captures (`move` closure holding owned, `Send` values) so the
    // coordinator future stays `Send` without requiring the spawner to be `Sync`.
    let task_cancel_token = cancel_token.clone();
    let task_engine = engine.clone();
    let spawn_file_task = move |path: PathBuf| {
        let event_sender = event_sender.clone();
        let local_analyzer = local_analyzer.clone();
        let processor = processor.clone();
        let cancel_token = task_cancel_token.clone();
        let engine = task_engine.clone();
        spawner
            .spawn_with_handle(async move {
                if cancel_token.is_cancelled() {
                    return;
                }
                let local_res = local_analyzer(path.clone()).await;

                if cancel_token.is_cancelled() {
                    return;
                }
                let _ = event_sender
                    .clone()
                    .send(CoordinatorEvent::DepsDiscovered {
                        deps: local_res.program_dependencies().cloned().collect(),
                    })
                    .await;

                if cancel_token.is_cancelled() {
                    return;
                }
                let file_id = engine.intern_path(&path);
                let (result, chunk_info) = processor(path, local_res).await;
                let _ = event_sender
                    .clone()
                    .send(CoordinatorEvent::FileCompleted {
                        file_id,
                        result,
                        chunk_info,
                    })
                    .await;
            })
            .unwrap()
    };

    let mut valid_entrypoints = Vec::new();
    for entry in entrypoints {
        if !is_compilation_root(&entry) {
            continue;
        }
        // Dedupe on the case-folded path, but keep the caller's spelling.
        if seen.insert(crate::fs::normalize_path(&entry).into_owned()) {
            // Intern `FileId`s synchronously in entrypoint order before spawning async workers so
            // `FileId` ordering is deterministic and reflects `tsconfig` root order.
            engine.intern_path(&entry);
            valid_entrypoints.push(entry);
        }
    }

    for entry in valid_entrypoints {
        if cancel_token.is_cancelled() {
            break;
        }
        pending_tasks.push(spawn_file_task(entry));
    }

    let mut event_receiver = event_receiver.fuse();
    loop {
        if cancel_token.is_cancelled() {
            while pending_tasks.next().await.is_some() {}
            return;
        }

        if pending_tasks.is_empty() {
            let mut spawned_any = false;
            while let Ok(event) = event_receiver.get_mut().try_recv() {
                match event {
                    CoordinatorEvent::DepsDiscovered { deps } => {
                        for dep in deps {
                            if cancel_token.is_cancelled() {
                                break;
                            }
                            if !is_ts_file(&dep) {
                                continue;
                            }
                            if !seen.insert(crate::fs::normalize_path(&dep).into_owned()) {
                                continue;
                            }
                            engine.intern_path(&dep);
                            pending_tasks.push(spawn_file_task(dep));
                            spawned_any = true;
                        }
                    }
                    CoordinatorEvent::FileCompleted {
                        file_id,
                        result,
                        chunk_info,
                    } => {
                        handle_completed_file(
                            &engine,
                            file_id,
                            result,
                            chunk_info,
                            &mut uf,
                            &final_sender,
                            group_chunks_by_ng_module,
                        );
                    }
                }
            }
            if !spawned_any && pending_tasks.is_empty() {
                break;
            }
        }

        futures::select! {
            _ = pending_tasks.select_next_some() => {}
            event = event_receiver.select_next_some() => {
                match event {
                    CoordinatorEvent::DepsDiscovered { deps } => {
                        for dep in deps {
                            if cancel_token.is_cancelled() {
                                break;
                            }
                            if !seen.insert(crate::fs::normalize_path(&dep).into_owned()) {
                                continue;
                            }
                            engine.intern_path(&dep);
                            pending_tasks.push(spawn_file_task(dep));
                        }
                    }
                    CoordinatorEvent::FileCompleted {
                        file_id,
                        result,
                        chunk_info,
                    } => {
                        handle_completed_file(&engine, file_id, result, chunk_info, &mut uf, &final_sender, group_chunks_by_ng_module);
                    }
                }
            }
        }
    }

    let mut remaining_states: Vec<_> = uf.states.drain().collect();
    remaining_states.sort_by_key(|(root, _)| *root);
    for (_, state) in remaining_states {
        if let Some(snd) = &final_sender {
            let mut files: Vec<crate::AnalysisResult> = state.completed.into_values().collect();
            files.sort_by_key(|f| f.file_id);
            if !files.is_empty() {
                let static_edges = compute_intra_chunk_static_edges(&engine, &files);
                let _ = snd.unbounded_send(Ok(crate::CompilationChunk {
                    files,
                    static_edges,
                }));
            }
        }
    }
}

pub enum CoordinatorEvent {
    DepsDiscovered {
        deps: Vec<PathBuf>,
    },
    FileCompleted {
        file_id: FileId,
        result: Result<crate::AnalysisResult, String>,
        chunk_info: FileChunkInfo,
    },
}

struct ChunkState {
    members: HashSet<FileId>,
    expected: HashSet<FileId>,
    completed: HashMap<FileId, crate::AnalysisResult>,
}

struct UnionFind {
    parents: HashMap<FileId, FileId>,
    states: HashMap<FileId, ChunkState>,
}

impl UnionFind {
    fn new() -> Self {
        Self {
            parents: HashMap::new(),
            states: HashMap::new(),
        }
    }

    fn find(&mut self, file_id: FileId) -> FileId {
        let mut root = file_id;
        while let Some(&parent) = self.parents.get(&root) {
            root = parent;
        }
        let mut curr = file_id;
        while curr != root {
            let parent = *self.parents.get(&curr).unwrap();
            self.parents.insert(curr, root);
            curr = parent;
        }
        root
    }

    fn ensure_exists(&mut self, file_id: FileId) {
        let root = self.find(file_id);
        self.states.entry(root).or_insert_with(|| ChunkState {
            members: [file_id].into_iter().collect(),
            expected: [file_id].into_iter().collect(),
            completed: HashMap::new(),
        });
    }

    fn union(&mut self, id1: FileId, id2: FileId) {
        let root1 = self.find(id1);
        let root2 = self.find(id2);
        if root1 == root2 {
            return;
        }

        self.parents.insert(root2, root1);

        let state2 = self.states.remove(&root2).unwrap_or_else(|| ChunkState {
            members: [root2].into_iter().collect(),
            expected: [root2].into_iter().collect(),
            completed: HashMap::new(),
        });

        let state1 = self.states.entry(root1).or_insert_with(|| ChunkState {
            members: [root1].into_iter().collect(),
            expected: [root1].into_iter().collect(),
            completed: HashMap::new(),
        });

        state1.members.extend(state2.members);
        state1.expected.extend(state2.expected);
        state1.completed.extend(state2.completed);
    }
}

fn compute_intra_chunk_static_edges<Fs: FileSystem + Clone + 'static + ResourceResolverFs>(
    engine: &Arc<crate::QueryEngine<Fs>>,
    chunk_files: &[crate::AnalysisResult],
) -> Option<HashMap<String, Vec<FileId>>> {
    if chunk_files.len() <= 1 {
        return None;
    }

    let chunk_file_ids: HashSet<FileId> = chunk_files.iter().map(|f| f.file_id).collect();
    let mut static_edges: HashMap<String, Vec<FileId>> = HashMap::new();

    let guard = engine.static_import_graph.read().ok()?;
    let graph = guard.as_ref()?;

    for &from_id in &chunk_file_ids {
        let mut visited = HashSet::new();
        visited.insert(from_id);
        let mut queue = std::collections::VecDeque::new();
        queue.push_back(from_id);
        let mut targets = HashSet::new();

        while let Some(curr) = queue.pop_front() {
            let Some(deps) = graph.edges.get(&curr) else {
                continue;
            };
            for &dep in deps {
                if chunk_file_ids.contains(&dep) && dep != from_id {
                    targets.insert(dep);
                }
                if visited.insert(dep) {
                    queue.push_back(dep);
                }
            }
        }

        if !targets.is_empty() {
            let mut sorted: Vec<FileId> = targets.into_iter().collect();
            sorted.sort_unstable();
            static_edges.insert(from_id.to_string(), sorted);
        }
    }

    if static_edges.is_empty() {
        None
    } else {
        Some(static_edges)
    }
}

#[derive(Clone, Debug, Default)]
pub struct FileChunkInfo {
    pub has_non_standalone: bool,
    pub declared_file_ids: Vec<FileId>,
}

/// Summarize what a completed file contributes to chunk grouping: whether it holds anything that
/// needs an `@NgModule` scope at all, and which files the `@NgModule`s it declares pull in.
async fn extract_chunk_info<Fs: FileSystem + Clone + 'static + ResourceResolverFs>(
    file_data: &FileData,
    engine: &crate::QueryEngine<Fs>,
    ctx: &QueryContext<Fs>,
) -> FileChunkInfo {
    let mut has_non_standalone = false;
    let mut declared_file_ids = Vec::new();

    for class in &file_data.classes {
        match &class.decorator {
            crate::analyzer::DecoratorData::NgModule(m) if !m.is_jit => {
                has_non_standalone = true;
                let Some(declarations) = &m.declarations else {
                    continue;
                };
                let Some(refs) = resolved_ng_module_declarations(declarations, ctx).await else {
                    continue;
                };
                // A class declared by more than one NgModule belongs to none of them (NG6007): it
                // has no scope to wait for, so it is streamed on its own like any ownerless class.
                // Grouping it with its modules would make the partition depend on whether it
                // completed before or after them.
                let mapping = ctx.component_mapping().await;
                for r in refs {
                    if mapping
                        .get_duplicate_declarations(r.file, r.name())
                        .is_some()
                    {
                        continue;
                    }
                    let target_path = engine.lookup_path(r.file);
                    if is_ts_source(&target_path) {
                        declared_file_ids.push(r.file);
                    }
                }
            }
            crate::analyzer::DecoratorData::Component(c) if !c.directive.standalone => {
                has_non_standalone = true;
            }
            crate::analyzer::DecoratorData::Directive(d) if !d.standalone => {
                has_non_standalone = true;
            }
            crate::analyzer::DecoratorData::Pipe(p) if !p.standalone.unwrap_or(true) => {
                has_non_standalone = true;
            }
            _ => {}
        }
    }

    FileChunkInfo {
        has_non_standalone,
        declared_file_ids,
    }
}

/// Resolve an `@NgModule`'s `declarations` references.
///
/// Semantic results are already hole-free; syntactic results (used when
/// `generateExtraImportsInLocalMode` groups chunks) still contain `Incomplete` holes for imported
/// declarations that must be completed to find their declaring files.
async fn resolved_ng_module_declarations<Fs: ResourceResolverFs + Clone + 'static>(
    declarations: &crate::evaluator::Resolved<Vec<crate::types::analysis::Reference>>,
    ctx: &QueryContext<Fs>,
) -> Option<Vec<crate::types::analysis::Reference>> {
    if !declarations.contains_incomplete() {
        return declarations.get_optional();
    }
    let mut completed = declarations.clone();
    completed
        .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
        .await;
    completed.get_optional()
}

fn handle_completed_file<Fs: FileSystem + Clone + 'static + ResourceResolverFs>(
    engine: &Arc<crate::QueryEngine<Fs>>,
    file_id: FileId,
    result: Result<crate::AnalysisResult, String>,
    chunk_info: FileChunkInfo,
    uf: &mut UnionFind,
    final_sender: &Option<
        futures::channel::mpsc::UnboundedSender<Result<crate::CompilationChunk, String>>,
    >,
    group_by_ng_module: bool,
) {
    let res = match result {
        Ok(res) => res,
        Err(e) => {
            if let Some(snd) = final_sender {
                let _ = snd.unbounded_send(Err(e));
            }
            return;
        }
    };

    if !group_by_ng_module || !chunk_info.has_non_standalone {
        if let Some(snd) = final_sender {
            let _ = snd.unbounded_send(Ok(crate::CompilationChunk {
                files: vec![res],
                static_edges: None,
            }));
        }
        return;
    }

    uf.ensure_exists(file_id);
    let root = uf.find(file_id);
    if let Some(state) = uf.states.get_mut(&root) {
        state.completed.insert(file_id, res);
    }

    for &decl_file_id in &chunk_info.declared_file_ids {
        uf.union(file_id, decl_file_id);
    }

    let root = uf.find(file_id);
    let is_complete = if let Some(state) = uf.states.get(&root) {
        let expected_all_completed = state
            .expected
            .iter()
            .all(|f| state.completed.contains_key(f));

        if expected_all_completed {
            // Complete the chunk only once every non-standalone class's declaring NgModule
            // file is also present (fixes the streaming race where a component completes
            // before its module). An ownerless non-standalone class (declared by no NgModule)
            // is emitted, not errored — ngtsc compiles a component with a null scope:
            // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L1355-L1360
            let mut chunk_valid = true;
            'outer: for file_res in state.completed.values() {
                for class in &file_res.classes {
                    let ClassOwner::HasNgModule(ref owner_path) = get_class_owner(class) else {
                        continue;
                    };
                    let owner_id = engine.intern_path(Path::new(owner_path));
                    if !state.completed.contains_key(&owner_id) {
                        chunk_valid = false;
                        break 'outer;
                    }
                }
            }
            chunk_valid
        } else {
            false
        }
    } else {
        false
    };

    if is_complete {
        let Some(mut state) = uf.states.remove(&root) else {
            return;
        };
        let mut sorted_members: Vec<FileId> = state.members.into_iter().collect();
        sorted_members.sort();
        let files: Vec<_> = sorted_members
            .iter()
            .filter_map(|f| state.completed.remove(f))
            .collect();
        let static_edges = compute_intra_chunk_static_edges(engine, &files);
        if let Some(snd) = final_sender {
            let _ = snd.unbounded_send(Ok(crate::CompilationChunk {
                files,
                static_edges,
            }));
        }
    }
}

fn dedup_preserving_order(mut paths: Vec<String>) -> Vec<String> {
    let mut seen = HashSet::new();
    paths.retain(|path| seen.insert(path.clone()));
    paths
}

#[derive(Debug)]
enum ClassOwner {
    Other,
    HasNgModule(String),
    NoNgModule,
}

fn get_class_owner(class: &crate::ClassMetadata) -> ClassOwner {
    let is_non_standalone = if let Some(comp) = &class.component {
        !comp.standalone
    } else if let Some(dir) = &class.directive {
        !dir.standalone
    } else if let Some(pipe) = &class.pipe {
        !pipe.standalone.unwrap_or(true)
    } else {
        false
    };

    if !is_non_standalone {
        return ClassOwner::Other;
    }

    let declaring = if let Some(comp) = &class.component {
        &comp.declaring_ng_module
    } else if let Some(dir) = &class.directive {
        &dir.declaring_ng_module
    } else if let Some(pipe) = &class.pipe {
        &pipe.declaring_ng_module
    } else {
        unreachable!()
    };

    let Some(r) = declaring else {
        return ClassOwner::NoNgModule;
    };

    ClassOwner::HasNgModule(r.file_path.clone())
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod chunk_order_tests {
    use super::*;

    fn optimized_result(
        engine: &Arc<crate::QueryEngine<OverlayFileSystem>>,
        path: &str,
    ) -> (AnalysisResult, FileChunkInfo) {
        futures::executor::block_on(async {
            let ctx = QueryContext::new(engine.clone());
            let file_id = engine.intern_path(path);
            let parsed = ctx.parse_file(file_id).await;
            let source_text = parsed.lock().unwrap().borrow_owner().source_text.clone();
            let semantic = ctx.analyze_file_semantic(file_id).await;
            let chunk_info = extract_chunk_info(&semantic, engine, &ctx).await;
            let declaring_exports = ctx.declaring_export_names(&semantic).await;
            let path_lookup = |id| engine.lookup_path(id);
            let r3_symbols_path = engine.r3_symbols_file();
            let cx = crate::analyzer::WireContext {
                mode: crate::analyzer::WireMode::Semantic,
                source_text: &source_text,
                converter: &semantic.converter,
                reference_strategy: &*engine.reference_strategy,
                path_lookup: Some(&path_lookup),
                declaring_exports: &declaring_exports,
                r3_symbols_path: r3_symbols_path.as_deref(),
            };
            (semantic.to_wire(&cx).expect("wire projection"), chunk_info)
        })
    }

    /// Feed `order` into `handle_completed_file` and return the resulting chunk partition (with
    /// file paths within each chunk and the outer chunk list both sorted).
    fn chunks_for_completion_order(analyzer: &Analyzer, order: &[&str]) -> Vec<Vec<String>> {
        let engine = analyzer.engine.clone();
        let (sender, receiver) = futures::channel::mpsc::unbounded();
        let final_sender = Some(sender);
        let mut uf = UnionFind::new();
        for path in order {
            let (result, chunk_info) = optimized_result(&engine, path);
            handle_completed_file(
                &engine,
                engine.intern_path(path),
                Ok(result),
                chunk_info,
                &mut uf,
                &final_sender,
                true,
            );
        }
        drop(final_sender);

        let streamed = futures::executor::block_on(receiver.collect::<Vec<_>>())
            .into_iter()
            .map(|chunk| chunk.expect("chunk").files);
        let pending = uf
            .states
            .into_values()
            .map(|state| state.completed.into_values().collect::<Vec<_>>())
            .filter(|files| !files.is_empty());
        let mut chunks: Vec<Vec<String>> = streamed
            .chain(pending)
            .map(|files| {
                let mut paths: Vec<String> = files.into_iter().map(|file| file.file_path).collect();
                paths.sort();
                paths
            })
            .collect();
        chunks.sort();
        chunks
    }

    /// Chunk partitioning for an NgModule reached only through imports must not depend on file
    /// completion order.
    #[test]
    fn test_chunks_independent_of_completion_order() {
        let analyzer = Analyzer::new(AnalyzerOptions {
            tsconfig_path: Some("/project/tsconfig.json".to_string()),
            optimize: Some(true),
            virtual_files: Some(super::super::tests::cli_shaped_ngmodule_project()),
            ..Default::default()
        })
        .unwrap();

        let expected = vec![
            vec![
                "/project/c1.component.ts".to_string(),
                "/project/c2.component.ts".to_string(),
                "/project/d.directive.ts".to_string(),
                "/project/m.module.ts".to_string(),
            ],
            vec!["/project/main.ts".to_string()],
        ];
        for order in [
            [
                "/project/main.ts",
                "/project/m.module.ts",
                "/project/c1.component.ts",
                "/project/c2.component.ts",
                "/project/d.directive.ts",
            ],
            [
                "/project/c1.component.ts",
                "/project/c2.component.ts",
                "/project/d.directive.ts",
                "/project/m.module.ts",
                "/project/main.ts",
            ],
            [
                "/project/d.directive.ts",
                "/project/main.ts",
                "/project/c2.component.ts",
                "/project/m.module.ts",
                "/project/c1.component.ts",
            ],
        ] {
            assert_eq!(
                chunks_for_completion_order(&analyzer, &order),
                expected,
                "completion order {order:?}"
            );
        }
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod effective_config_tests {
    use super::*;

    const TSCONFIG: &str = r#"{
        "compilerOptions": {"rootDirs": ["./a", "./b"], "preserveSymlinks": true},
        "angularCompilerOptions": {
            "workspaceName": "ws",
            "strictStandalone": true,
            "strictInjectionParameters": true,
            "compileNonExportedClasses": false,
            "generateExtraImportsInLocalMode": true,
            "_enableHmr": true,
            "_compilePoisonedComponents": true,
            "_angularCoreVersion": "18.2.0"
        }
    }"#;

    fn resolve(options: AnalyzerOptions) -> EffectiveConfig {
        let physical: Arc<dyn crate::physical_fs::PhysicalFs> =
            Arc::new(crate::physical_fs::default_physical_fs());
        let fs = OverlayFileSystem::new_with_allowed_sources_and_fs(None, physical);
        fs.upsert_file(PathBuf::from("/project/tsconfig.json"), TSCONFIG.to_string());
        fs.upsert_file(PathBuf::from("/project/main.ts"), "export {};".to_string());
        EffectiveConfig::resolve(
            AnalyzerOptions {
                tsconfig_path: Some("/project/tsconfig.json".to_string()),
                ..options
            },
            &fs,
        )
        .unwrap()
    }

    fn paths(items: &[&str]) -> Vec<PathBuf> {
        items.iter().map(PathBuf::from).collect()
    }

    #[test]
    fn falls_back_to_tsconfig_values() {
        let config = resolve(AnalyzerOptions::default());
        assert!(config.preserve_symlinks);
        assert_eq!(config.merge_root_dirs, paths(&["/project/a", "/project/b"]));
        assert_eq!(config.import_prefix_roots, config.merge_root_dirs);
        assert_eq!(config.workspace_name.as_deref(), Some("ws"));
        assert!(config.strict_standalone);
        assert!(config.strict_injection_parameters);
        assert!(!config.compile_non_exported_classes);
        assert!(config.generate_extra_imports_in_local_mode);
        assert!(config.enable_hmr);
        assert!(config.use_poisoned_data);
        assert!(!config.implicit_standalone);
        assert_eq!(config.node_modules_path_override, None);
    }

    #[test]
    fn explicit_options_win_over_tsconfig() {
        let config = resolve(AnalyzerOptions {
            workspace_name: Some("explicit".to_string()),
            import_prefix_roots: Some(vec!["./prefix".to_string(), "/abs".to_string()]),
            strict_standalone: Some(false),
            strict_injection_parameters: Some(false),
            compile_non_exported_classes: Some(true),
            generate_extra_imports_in_local_mode: Some(false),
            enable_hmr: Some(false),
            use_poisoned_data: Some(false),
            implicit_standalone: Some(true),
            default_host: Some(crate::DefaultHostConfig {
                root_dirs: Some(vec!["./gen".to_string()]),
                preserve_symlinks: Some(false),
                node_modules_path_override: Some("/nm".to_string()),
            }),
            ..Default::default()
        });
        assert!(!config.preserve_symlinks);
        assert_eq!(config.merge_root_dirs, paths(&["/project/gen"]));
        assert_eq!(config.import_prefix_roots, paths(&["/project/prefix", "/abs"]));
        assert_eq!(config.workspace_name.as_deref(), Some("explicit"));
        assert!(!config.strict_standalone);
        assert!(!config.strict_injection_parameters);
        assert!(config.compile_non_exported_classes);
        assert!(!config.generate_extra_imports_in_local_mode);
        assert!(!config.enable_hmr);
        assert!(!config.use_poisoned_data);
        assert!(config.implicit_standalone);
        assert_eq!(config.node_modules_path_override.as_deref(), Some("/nm"));
    }

    #[test]
    fn deprecated_aliases_apply_only_when_new_fields_are_unset() {
        let alias_only = resolve(AnalyzerOptions {
            root_dirs: Some(vec!["./legacy".to_string()]),
            node_modules_path_override: Some("/legacy_nm".to_string()),
            ..Default::default()
        });
        assert_eq!(alias_only.import_prefix_roots, paths(&["/project/legacy"]));
        assert_eq!(alias_only.node_modules_path_override.as_deref(), Some("/legacy_nm"));
        // The deprecated `root_dirs` alias only feeds the import prefix roots, never the merging
        // directories.
        assert_eq!(alias_only.merge_root_dirs, paths(&["/project/a", "/project/b"]));

        let both = resolve(AnalyzerOptions {
            root_dirs: Some(vec!["./legacy".to_string()]),
            import_prefix_roots: Some(vec!["./new".to_string()]),
            node_modules_path_override: Some("/legacy_nm".to_string()),
            default_host: Some(crate::DefaultHostConfig {
                node_modules_path_override: Some("/new_nm".to_string()),
                ..Default::default()
            }),
            ..Default::default()
        });
        assert_eq!(both.import_prefix_roots, paths(&["/project/new"]));
        assert_eq!(both.node_modules_path_override.as_deref(), Some("/new_nm"));
    }

    #[test]
    fn root_dirs_default_to_tsconfig_directory() {
        let physical: Arc<dyn crate::physical_fs::PhysicalFs> =
            Arc::new(crate::physical_fs::default_physical_fs());
        let fs = OverlayFileSystem::new_with_allowed_sources_and_fs(None, physical);
        fs.upsert_file(PathBuf::from("/bare/tsconfig.json"), "{}".to_string());
        let config = EffectiveConfig::resolve(
            AnalyzerOptions {
                tsconfig_path: Some("/bare/tsconfig.json".to_string()),
                ..Default::default()
            },
            &fs,
        )
        .unwrap();
        assert_eq!(config.merge_root_dirs, paths(&["/bare"]));
        assert_eq!(config.import_prefix_roots, paths(&["/bare"]));
        assert!(!config.preserve_symlinks);
        assert!(config.compile_non_exported_classes);
    }

    fn resolve_without_tsconfig(options: AnalyzerOptions) -> Result<EffectiveConfig, String> {
        let physical: Arc<dyn crate::physical_fs::PhysicalFs> =
            Arc::new(crate::physical_fs::default_physical_fs());
        let fs = OverlayFileSystem::new_with_allowed_sources_and_fs(None, physical);
        EffectiveConfig::resolve(options, &fs)
    }

    #[test]
    fn without_tsconfig_uses_defaults() {
        let config = resolve_without_tsconfig(AnalyzerOptions::default()).unwrap();
        assert_eq!(config.tsconfig_path, None);
        assert_eq!(config.entry_points, None);
        assert!(config.tsconfig_files.is_empty());
        assert!(config.merge_root_dirs.is_empty());
        assert!(config.import_prefix_roots.is_empty());
        assert!(!config.preserve_symlinks);
        assert!(config.compile_non_exported_classes);
        assert!(!config.strict_standalone);
        assert!(config.implicit_standalone);
        assert_eq!(config.r3_symbols_file, None);
    }

    #[test]
    fn without_tsconfig_uses_explicit_options() {
        let config = resolve_without_tsconfig(AnalyzerOptions {
            entry_points: Some(vec!["/app/main.ts".to_string()]),
            r3_symbols_file: Some("/core/r3_symbols.ts".to_string()),
            strict_standalone: Some(true),
            implicit_standalone: Some(false),
            import_prefix_roots: Some(vec!["/app".to_string()]),
            ..Default::default()
        })
        .unwrap();
        assert_eq!(config.entry_points, Some(paths(&["/app/main.ts"])));
        assert!(config.tsconfig_files.is_empty());
        assert_eq!(config.r3_symbols_file, Some(PathBuf::from("/core/r3_symbols.ts")));
        assert!(config.strict_standalone);
        assert!(!config.implicit_standalone);
        assert_eq!(config.import_prefix_roots, paths(&["/app"]));
    }

    #[test]
    fn without_tsconfig_rejects_relative_paths() {
        for options in [
            AnalyzerOptions {
                entry_points: Some(vec!["main.ts".to_string()]),
                ..Default::default()
            },
            AnalyzerOptions {
                import_prefix_roots: Some(vec!["src".to_string()]),
                ..Default::default()
            },
            AnalyzerOptions {
                r3_symbols_file: Some("r3_symbols.ts".to_string()),
                ..Default::default()
            },
            AnalyzerOptions {
                default_host: Some(crate::DefaultHostConfig {
                    root_dirs: Some(vec!["gen".to_string()]),
                    ..Default::default()
                }),
                ..Default::default()
            },
        ] {
            let err = resolve_without_tsconfig(options).err().expect("relative path rejected");
            assert!(err.contains("must be an absolute path"), "{err}");
        }
    }

    #[test]
    fn explicit_entry_points_replace_tsconfig_roots() {
        let config = resolve(AnalyzerOptions {
            entry_points: Some(vec!["main.ts".to_string()]),
            ..Default::default()
        });
        assert_eq!(config.entry_points, Some(paths(&["/project/main.ts"])));
        assert_eq!(config.tsconfig_path, Some(PathBuf::from("/project/tsconfig.json")));
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod entry_point_tests {
    use super::*;

    const MODULE: &str = r#"
        import {NgModule} from '@angular/core';
        import {C1} from './c1.component';
        @NgModule({declarations: [C1]})
        export class MModule {}
    "#;
    const COMPONENT: &str = r#"
        import {Component} from '@angular/core';
        @Component({selector: 'c1', template: '', standalone: false})
        export class C1 {}
    "#;

    fn analyzer(files: &[(&str, &str)]) -> Analyzer {
        Analyzer::new(AnalyzerOptions {
            tsconfig_path: Some("/project/tsconfig.json".to_string()),
            optimize: Some(true),
            virtual_files: Some(
                files
                    .iter()
                    .map(|(path, content)| (path.to_string(), content.to_string()))
                    .collect(),
            ),
            ..Default::default()
        })
        .unwrap()
    }

    /// Whether `C1` currently resolves to a declaring NgModule.
    fn c1_has_module(analyzer: &Analyzer) -> bool {
        let engine = analyzer.engine.clone();
        let c1 = engine.intern_path("/project/c1.component.ts");
        let mapping =
            futures::executor::block_on(QueryContext::new(engine.clone()).component_mapping());
        mapping.get(c1, "C1").is_some()
    }

    #[test]
    fn set_entry_points_evicts_program_queries() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", r#"{"files": ["c1.component.ts"]}"#),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/m.module.ts", MODULE),
        ]);
        // The module is not reachable from the only root, so it declares nothing.
        assert!(!c1_has_module(&analyzer));

        let stale = analyzer
            .set_entry_points_core(vec![
                "/project/c1.component.ts".to_string(),
                "/project/m.module.ts".to_string(),
            ])
            .unwrap();
        assert!(c1_has_module(&analyzer), "stale paths: {stale:?}");
    }

    #[test]
    fn set_entry_points_with_unchanged_roots_evicts_nothing() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", r#"{"files": ["c1.component.ts"]}"#),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        analyzer.engine.analyze_file_semantic_blocking("/project/c1.component.ts");

        let stale = analyzer
            .set_entry_points_core(vec!["/project/c1.component.ts".to_string()])
            .unwrap();
        assert!(stale.is_empty(), "unexpected stale paths: {stale:?}");
    }

    #[test]
    fn set_entry_points_rejects_relative_paths() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", r#"{"files": ["c1.component.ts"]}"#),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        let err = analyzer.set_entry_points_core(vec!["c1.component.ts".to_string()]).unwrap_err();
        assert!(err.contains("c1.component.ts"), "{err}");
    }

    /// Entry points replace only the roots: the `.d.ts` files searched for ambient modules still
    /// come from the tsconfig, and keep following it after the roots stop doing so.
    #[test]
    fn set_entry_points_keeps_tsconfig_declaration_files() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", r#"{"files": ["c1.component.ts", "a.d.ts"]}"#),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/m.module.ts", MODULE),
            ("/project/a.d.ts", "declare module 'a' {}"),
            ("/project/b.d.ts", "declare module 'b' {}"),
        ]);
        let dts_files =
            |analyzer: &Analyzer| analyzer.engine.tsconfig_dts_files.read().unwrap().clone();
        assert_eq!(dts_files(&analyzer), paths(&["/project/a.d.ts"]));

        analyzer
            .set_entry_points_core(vec![
                "/project/m.module.ts".to_string(),
                "/project/b.d.ts".to_string(),
            ])
            .unwrap();
        assert_eq!(*analyzer.entrypoints.read().unwrap(), paths(&["/project/m.module.ts"]));
        assert_eq!(dts_files(&analyzer), paths(&["/project/a.d.ts"]));

        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/tsconfig.json".to_string(),
                content: r#"{"files": ["c1.component.ts", "b.d.ts"]}"#.to_string(),
            }])
            .unwrap();
        assert_eq!(*analyzer.entrypoints.read().unwrap(), paths(&["/project/m.module.ts"]));
        assert_eq!(dts_files(&analyzer), paths(&["/project/b.d.ts"]));
    }

    fn paths(items: &[&str]) -> Vec<PathBuf> {
        items.iter().map(PathBuf::from).collect()
    }

    /// Files whose cached analysis read the old roots are reported stale by the update that
    /// changed the roots, even though they were not edited themselves.
    #[test]
    fn update_reports_paths_invalidated_by_root_change() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        // A non-standalone component's semantic analysis reads the program-wide NgModule mapping.
        analyzer.engine.analyze_file_semantic_blocking("/project/c1.component.ts");

        let stale = analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/m.module.ts".to_string(),
                content: MODULE.to_string(),
            }])
            .unwrap();
        assert!(
            stale.contains(&"/project/c1.component.ts".to_string()),
            "stale paths: {stale:?}"
        );
    }

    /// Deleting a file matched by the tsconfig's `include` drops it from the roots.
    #[test]
    fn deleted_included_file_leaves_roots() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/m.module.ts", MODULE),
        ]);
        assert!(c1_has_module(&analyzer));

        analyzer
            .invalidate_files_core(vec![FileInvalidation {
                file_path: "/project/m.module.ts".to_string(),
                update_type: crate::types::FileUpdateType::Deleted,
            }])
            .unwrap();
        assert!(!c1_has_module(&analyzer));
        assert_eq!(
            *analyzer.entrypoints.read().unwrap(),
            vec![PathBuf::from("/project/c1.component.ts")]
        );
    }

    /// A file added under the tsconfig's `include` globs becomes a root, and program-level queries
    /// computed before it existed must not be served stale.
    #[test]
    fn new_included_file_reaches_program_queries() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        assert!(!c1_has_module(&analyzer));

        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/m.module.ts".to_string(),
                content: MODULE.to_string(),
            }])
            .unwrap();
        assert!(c1_has_module(&analyzer));
    }

    /// An analyzer built from options alone, with no tsconfig at all.
    #[test]
    fn analyzes_without_tsconfig() {
        let analyzer = Analyzer::new(AnalyzerOptions {
            optimize: Some(true),
            entry_points: Some(vec!["/project/c1.component.ts".to_string()]),
            virtual_files: Some(
                [
                    ("/project/c1.component.ts", COMPONENT),
                    ("/project/m.module.ts", MODULE),
                ]
                .into_iter()
                .map(|(path, content)| (path.to_string(), content.to_string()))
                .collect(),
            ),
            ..Default::default()
        })
        .unwrap();
        assert!(!c1_has_module(&analyzer));

        analyzer
            .set_entry_points_core(vec![
                "/project/c1.component.ts".to_string(),
                "/project/m.module.ts".to_string(),
            ])
            .unwrap();
        assert!(c1_has_module(&analyzer));
    }

    /// Explicit roots are never overwritten by the tsconfig's root files on file updates.
    #[test]
    fn explicit_entry_points_survive_updates() {
        let analyzer = Analyzer::new(AnalyzerOptions {
            tsconfig_path: Some("/project/tsconfig.json".to_string()),
            optimize: Some(true),
            entry_points: Some(vec!["/project/c1.component.ts".to_string()]),
            virtual_files: Some(
                [
                    ("/project/tsconfig.json", "{}"),
                    ("/project/c1.component.ts", COMPONENT),
                ]
                .into_iter()
                .map(|(path, content)| (path.to_string(), content.to_string()))
                .collect(),
            ),
            ..Default::default()
        })
        .unwrap();

        // The tsconfig's `include` would make the new module a root; the explicit roots win.
        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/m.module.ts".to_string(),
                content: MODULE.to_string(),
            }])
            .unwrap();
        assert!(!c1_has_module(&analyzer));
        assert_eq!(
            *analyzer.entrypoints.read().unwrap(),
            vec![PathBuf::from("/project/c1.component.ts")]
        );
    }

    /// After `set_entry_points`, tsconfig-derived roots are no longer re-read on file updates.
    #[test]
    fn set_entry_points_stops_tsconfig_rereads() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        analyzer
            .set_entry_points_core(vec!["/project/c1.component.ts".to_string()])
            .unwrap();

        // The tsconfig's `include` would make the new module a root; the set roots win.
        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/m.module.ts".to_string(),
                content: MODULE.to_string(),
            }])
            .unwrap();
        assert!(!c1_has_module(&analyzer));
        assert_eq!(
            *analyzer.entrypoints.read().unwrap(),
            vec![PathBuf::from("/project/c1.component.ts")]
        );
    }

    /// An explicit `r3_symbols_file` takes precedence over a root named `r3_symbols.ts`, which
    /// remains the fallback.
    #[test]
    fn explicit_r3_symbols_file_overrides_root_scan() {
        let files = [
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts", "r3_symbols.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/r3_symbols.ts", "export {};"),
            ("/core/r3_symbols.ts", "export {};"),
        ];
        let fallback = analyzer(&files);
        assert_eq!(
            fallback.engine.r3_symbols_file(),
            Some(PathBuf::from("/project/r3_symbols.ts"))
        );

        let explicit = Analyzer::new(AnalyzerOptions {
            tsconfig_path: Some("/project/tsconfig.json".to_string()),
            r3_symbols_file: Some("/core/r3_symbols.ts".to_string()),
            virtual_files: Some(
                files
                    .iter()
                    .map(|(path, content)| (path.to_string(), content.to_string()))
                    .collect(),
            ),
            ..Default::default()
        })
        .unwrap();
        assert_eq!(
            explicit.engine.r3_symbols_file(),
            Some(PathBuf::from("/core/r3_symbols.ts"))
        );
    }
}
