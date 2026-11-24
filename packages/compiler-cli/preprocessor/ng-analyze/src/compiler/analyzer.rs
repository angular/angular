use crate::fs::OverlayFileSystem;
use crate::query::keys::QueryKey;
use crate::query::{FileId, QueryContext};
use crate::resource_registry::ResourceRegistry;
use crate::tsconfig_resolution;
use crate::utils::{create_resolver_with_fs, is_compilation_root, is_ts_file, is_ts_source};
use crate::{
    AnalysisResult, AnalyzerOptions, CompilationChunk, FileData, FileInvalidation, FileUpdate,
};
use futures::channel::{mpsc, oneshot};
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
use tracing::Instrument;

#[cfg(not(target_arch = "wasm32"))]
static GLOBAL_POOL: OnceLock<futures::executor::ThreadPool> = OnceLock::new();

#[cfg(not(target_arch = "wasm32"))]
pub fn get_global_pool() -> &'static futures::executor::ThreadPool {
    GLOBAL_POOL.get_or_init(|| {
        futures::executor::ThreadPool::builder()
            .pool_size(std::thread::available_parallelism().unwrap().get())
            .name_prefix("ng-analyze-worker-")
            .after_start(crate::perf::set_pool_thread_index)
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

#[cfg(target_arch = "wasm32")]
pub(crate) fn try_step_local_pool() {
    LOCAL_POOL.with(|pool| {
        if let Ok(mut pool) = pool.try_borrow_mut() {
            pool.run_until_stalled();
        }
    });
}

/// Cancellation flag for one analysis run. Clones share the flag, and each clone can be awaited:
/// it completes once the run is cancelled.
pub struct CancellationToken {
    state: Arc<CancellationState>,
    /// This clone's entry in [`CancellationWakers::by_key`], assigned the first time it is polled.
    /// Each awaiting task holds its own clone, so registering is a map insert rather than a scan
    /// of every other task's waker, and the entry is released when the clone is dropped.
    waker_key: Option<u64>,
}

struct CancellationState {
    cancelled: AtomicBool,
    wakers: Mutex<CancellationWakers>,
}

#[derive(Default)]
struct CancellationWakers {
    next_key: u64,
    by_key: HashMap<u64, Waker>,
}

impl Default for CancellationToken {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for CancellationToken {
    fn clone(&self) -> Self {
        Self {
            state: Arc::clone(&self.state),
            waker_key: None,
        }
    }
}

impl Drop for CancellationToken {
    fn drop(&mut self) {
        let Some(key) = self.waker_key else {
            return;
        };
        if let Ok(mut wakers) = self.state.wakers.lock() {
            wakers.by_key.remove(&key);
        }
    }
}

impl CancellationToken {
    pub fn new() -> Self {
        Self {
            state: Arc::new(CancellationState {
                cancelled: AtomicBool::new(false),
                wakers: Mutex::new(CancellationWakers::default()),
            }),
            waker_key: None,
        }
    }

    pub fn cancel(&self) {
        self.state.cancelled.store(true, Ordering::SeqCst);
        let wakers = std::mem::take(&mut self.state.wakers.lock().unwrap().by_key);
        for waker in wakers.into_values() {
            waker.wake();
        }
    }

    pub fn is_cancelled(&self) -> bool {
        self.state.cancelled.load(Ordering::SeqCst)
    }
}

impl std::future::Future for CancellationToken {
    type Output = ();

    fn poll(
        self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Self::Output> {
        let this = self.get_mut();
        if this.is_cancelled() {
            return std::task::Poll::Ready(());
        }
        let mut wakers = this.state.wakers.lock().unwrap();
        // `cancel` sets the flag before it drains the wakers, so checking again under the lock
        // means a waker registered here is either drained by `cancel` or never needed.
        if this.state.cancelled.load(Ordering::SeqCst) {
            return std::task::Poll::Ready(());
        }
        let key = match this.waker_key {
            Some(key) => key,
            None => {
                let key = wakers.next_key;
                wakers.next_key += 1;
                this.waker_key = Some(key);
                key
            }
        };
        wakers.by_key.insert(key, cx.waker().clone());
        std::task::Poll::Pending
    }
}

/// Coordinates in-flight [`Analyzer::request_metadata_core`] tasks with state mutations
/// (`update_file_content`, `invalidate_files`, `set_entry_points`, `clear_resolution_cache`).
///
/// Before a mutation cancels parked host queries and updates overlays/caches, any active metadata
/// attempt is aborted and its query future is dropped so it cannot hold pre-edit sub-queries open
/// or write a stale `AnalyzeFileWire` entry after invalidation. Once the mutation finishes, parked
/// metadata tasks wake and restart against the updated state.
struct MetadataMutationState {
    inner: Mutex<MetadataMutationInner>,
    #[cfg(not(target_arch = "wasm32"))]
    idle_cvar: std::sync::Condvar,
}

struct MetadataMutationInner {
    abort: CancellationToken,
    ready: CancellationToken,
    active_mutations: usize,
    in_flight_attempts: usize,
}

impl MetadataMutationState {
    fn new() -> Self {
        let ready = CancellationToken::new();
        ready.cancel();
        Self {
            inner: Mutex::new(MetadataMutationInner {
                abort: CancellationToken::new(),
                ready,
                active_mutations: 0,
                in_flight_attempts: 0,
            }),
            #[cfg(not(target_arch = "wasm32"))]
            idle_cvar: std::sync::Condvar::new(),
        }
    }

    fn has_active_mutation(&self) -> bool {
        self.inner.lock().unwrap().active_mutations > 0
    }
}

struct MetadataMutationGuard<'a> {
    state: &'a MetadataMutationState,
}

impl Drop for MetadataMutationGuard<'_> {
    fn drop(&mut self) {
        let ready_to_wake = {
            let mut inner = self.state.inner.lock().unwrap();
            inner.active_mutations -= 1;
            if inner.active_mutations == 0 {
                inner.abort = CancellationToken::new();
                Some(inner.ready.clone())
            } else {
                None
            }
        };
        if let Some(ready) = ready_to_wake {
            ready.cancel();
        }
    }
}

struct MetadataAttemptGuard {
    state: Arc<MetadataMutationState>,
}

impl Drop for MetadataAttemptGuard {
    fn drop(&mut self) {
        let mut inner = self.state.inner.lock().unwrap();
        inner.in_flight_attempts -= 1;
        #[cfg(not(target_arch = "wasm32"))]
        if inner.in_flight_attempts == 0 && inner.active_mutations > 0 {
            self.state.idle_cvar.notify_all();
        }
    }
}

enum MetadataAttemptOutcome {
    Done(Option<AnalysisResult>),
    Cancelled,
    Restart,
}

#[cfg(feature = "napi")]
use napi_derive::napi;

#[cfg_attr(feature = "napi", napi)]
pub struct Analyzer {
    resource_registry: Arc<ResourceRegistry>,
    fs: OverlayFileSystem,
    batching_host: Option<Arc<crate::host::BatchingHost>>,
    engine: Arc<crate::query::QueryEngine>,
    active_handles: Arc<RwLock<Vec<futures::future::RemoteHandle<()>>>>,
    metadata_mutations: Arc<MetadataMutationState>,

    /// The tsconfig, re-read after file updates for the `.d.ts` files it lists and, while
    /// `roots_from_tsconfig`, for its root files.
    tsconfig_path: Option<PathBuf>,
    /// Whether the roots still come from the tsconfig (no explicit `entry_points`, and
    /// `set_entry_points` not called).
    roots_from_tsconfig: AtomicBool,
    entrypoints: Arc<RwLock<Vec<PathBuf>>>,
    current_cancel_token: RwLock<Option<CancellationToken>>,
    merged_compiler_options: serde_json::Map<String, serde_json::Value>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
enum ResolvedEntryPoint {
    Path(PathBuf),
    Virtual(String),
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
    entry_points: Option<Vec<ResolvedEntryPoint>>,
    /// The tsconfig's file list (root files and `.d.ts` files), empty without a tsconfig. Its
    /// `.d.ts` files are used even when `entry_points` replace its roots.
    tsconfig_files: Vec<PathBuf>,
    r3_symbols_file: Option<PathBuf>,
    /// `angular_core_compilation` > `angularCompilerOptions._isAngularCoreCompilation` > `true`
    /// with an explicit `r3_symbols_file` > none (detected from `r3_symbols.ts` by the engine).
    angular_core_compilation: Option<bool>,
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
    emit_declaration_only: bool,
    experimental_local_compilation: bool,
    merged_compiler_options: serde_json::Map<String, serde_json::Value>,
}

impl EffectiveConfig {
    fn resolve(options: AnalyzerOptions, fs: &OverlayFileSystem) -> Result<Self, String> {
        Self::resolve_with_entry_refs(options, None, fs)
    }

    fn resolve_with_entry_refs(
        options: AnalyzerOptions,
        entry_refs: Option<Vec<crate::host::ModuleRef>>,
        fs: &OverlayFileSystem,
    ) -> Result<Self, String> {
        let tsconfig_path = options.tsconfig_path.map(PathBuf::from);
        let resolved = match &tsconfig_path {
            Some(path) => Some(
                tracing::info_span!("ResolveTsconfig")
                    .in_scope(|| tsconfig_resolution::load_and_resolve_tsconfig(path, fs))
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
            paths
                .into_iter()
                .map(PathBuf::from)
                .map(absolutize)
                .collect()
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
        let emit_declaration_only = tsconfig_flag(|r| r.emit_declaration_only, false);
        let experimental_local_compilation =
            tsconfig_flag(|r| r.experimental_local_compilation, false);
        let angular_core_compilation = options
            .angular_core_compilation
            .or_else(|| {
                resolved
                    .as_ref()
                    .and_then(|r| r.is_angular_core_compilation)
            })
            .or_else(|| options.r3_symbols_file.is_some().then_some(true));

        let (tsconfig_files, tsconfig_root_dirs, tsconfig_workspace_name, merged_compiler_options) =
            match resolved {
                Some(r) => (
                    r.files,
                    r.compiler_options.root_dirs,
                    r.workspace_name,
                    r.merged_compiler_options,
                ),
                None => (Vec::new(), None, None, serde_json::Map::new()),
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

        let entry_points = match entry_refs {
            Some(refs) => {
                let mut out = Vec::with_capacity(refs.len());
                for entry in refs {
                    match entry.into_parts() {
                        (id, crate::host::IdKind::Path) => {
                            let abs = absolutize(PathBuf::from(id))?;
                            out.push(ResolvedEntryPoint::Path(abs));
                        }
                        (id, crate::host::IdKind::Virtual) => {
                            out.push(ResolvedEntryPoint::Virtual(id));
                        }
                    }
                }
                Some(out)
            }
            None => match options.entry_points {
                Some(paths) => {
                    let mut out = Vec::with_capacity(paths.len());
                    for path in absolutize_all(paths)? {
                        out.push(ResolvedEntryPoint::Path(path));
                    }
                    Some(out)
                }
                None => None,
            },
        };

        Ok(Self {
            entry_points,
            tsconfig_files,
            r3_symbols_file: options
                .r3_symbols_file
                .map(|path| absolutize(PathBuf::from(path)))
                .transpose()?,
            angular_core_compilation,
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
            emit_declaration_only,
            experimental_local_compilation,
            tsconfig_path,
            merged_compiler_options,
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
        Self::new_core_with_physical_fs_and_entry_refs(options, None, physical)
    }

    /// Like [`Self::new_core_with_physical_fs`], accepting [`crate::host::ModuleRef`] entry points
    /// so [`crate::host::IdKind::Virtual`] roots bypass path validation while path roots still
    /// resolve against `tsconfig_path`.
    pub fn new_core_with_physical_fs_and_entry_refs(
        options: AnalyzerOptions,
        entry_refs: Option<Vec<crate::host::ModuleRef>>,
        physical: std::sync::Arc<dyn crate::physical_fs::PhysicalFs>,
    ) -> Result<Self, String> {
        let _span = tracing::info_span!("Initialize").entered();
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

        match entry_refs {
            Some(refs) => Self::new_core_with_fs_and_entry_refs(options, Some(refs), fs),
            None => Self::new_core_with_fs(options, fs),
        }
    }

    pub fn new_core_with_fs(
        options: AnalyzerOptions,
        fs: OverlayFileSystem,
    ) -> Result<Self, String> {
        let config = EffectiveConfig::resolve(options, &fs)?;
        let analyzer = tracing::info_span!("ConstructAnalyzer")
            .in_scope(|| Self::construct(config, fs, None));
        Ok(analyzer)
    }

    /// Construct an analyzer backed by [`crate::host::BatchingHost`] over
    /// [`crate::physical_fs::NoopFs`].
    ///
    /// Every resolution and content read goes through `BatchingHost` (plus any proactive
    /// `virtual_files` / `updateFileContent` overlay entries); no physical filesystem is consulted.
    pub fn new_core_with_batching_host(
        options: AnalyzerOptions,
    ) -> Result<(Self, Arc<crate::host::BatchingHost>), String> {
        Self::new_core_with_batching_host_and_entry_refs(options, None)
    }

    /// Like [`Self::new_core_with_batching_host`], accepting [`crate::host::ModuleRef`] entry
    /// points so [`crate::host::IdKind::Virtual`] roots bypass path validation.
    pub fn new_core_with_batching_host_and_entry_refs(
        options: AnalyzerOptions,
        entry_refs: Option<Vec<crate::host::ModuleRef>>,
    ) -> Result<(Self, Arc<crate::host::BatchingHost>), String> {
        let _span = tracing::info_span!("InitializeBatchingHost").entered();
        if options.tsconfig_path.is_some() {
            return Err("tsconfig_path cannot be combined with a custom host".to_string());
        }
        if options.allowed_sources.is_some() {
            return Err("allowed_sources cannot be combined with a custom host".to_string());
        }
        let batching_host = Arc::new(crate::host::BatchingHost::new());
        if let Some(ref virtual_files) = options.virtual_files {
            for (id, content) in virtual_files {
                let format = crate::host::ModuleFormat::from_path(Path::new(id));
                batching_host.upsert_overlay(
                    crate::host::ModuleId::from(id.as_str()),
                    Arc::from(content.as_str()),
                    format,
                );
            }
        }
        let fs = OverlayFileSystem::new_with_allowed_sources_and_fs(
            None,
            Arc::new(crate::physical_fs::NoopFs),
        );
        let config = EffectiveConfig::resolve_with_entry_refs(options, entry_refs, &fs)?;
        let analyzer = tracing::info_span!("ConstructAnalyzer")
            .in_scope(|| Self::construct(config, fs, Some(batching_host.clone())));
        Ok((analyzer, batching_host))
    }

    pub fn new_core_with_fs_and_entry_refs(
        options: AnalyzerOptions,
        entry_refs: Option<Vec<crate::host::ModuleRef>>,
        fs: OverlayFileSystem,
    ) -> Result<Self, String> {
        let config = EffectiveConfig::resolve_with_entry_refs(options, entry_refs, &fs)?;
        let analyzer = tracing::info_span!("ConstructAnalyzer")
            .in_scope(|| Self::construct(config, fs, None));
        Ok(analyzer)
    }

    /// Build the analyzer from fully merged settings. Order matters: the symlink mode and the
    /// `rootDirs` must be set on `fs` before entry points are canonicalized through it.
    fn construct(
        config: EffectiveConfig,
        fs: OverlayFileSystem,
        batching_host: Option<Arc<crate::host::BatchingHost>>,
    ) -> Self {
        fs.set_preserve_symlinks(config.preserve_symlinks);
        fs.set_root_dirs(config.merge_root_dirs);

        let roots_from_tsconfig = config.entry_points.is_none();
        let (entrypoints, virtual_entry_ids, dts_files) = match config.entry_points {
            Some(entry_points) => {
                let (roots, virtual_ids) = compilation_roots(entry_points, &fs);
                let dts = tsconfig_dts_files(config.tsconfig_files);
                (roots, virtual_ids, dts)
            }
            None => {
                let (roots, dts) = partition_tsconfig_files(config.tsconfig_files, &fs);
                (roots, Vec::new(), dts)
            }
        };
        let r3_symbols_file = config
            .r3_symbols_file
            .map(|path| canonical_root(&path, &fs));
        let entrypoints_lock = Arc::new(RwLock::new(entrypoints));

        let resource_registry = Arc::new(ResourceRegistry::default());

        use crate::analyzer::import_emit::{
            ApfImportStrategy, PrefixImportStrategy, ReferenceEmitStrategy,
        };
        let reference_strategy: Arc<dyn ReferenceEmitStrategy> = match config.workspace_name {
            Some(ws) if config.use_host_for_import_generation => {
                Arc::new(PrefixImportStrategy::new(ws, config.import_prefix_roots))
            }
            _ => Arc::new(ApfImportStrategy::new()),
        };

        let host: Arc<dyn crate::host::AnalysisHost> = match &batching_host {
            Some(batch_host) => batch_host.clone(),
            None => {
                let resolver = Arc::new(create_resolver_with_fs(
                    config.tsconfig_path.as_deref(),
                    fs.clone(),
                    config.preserve_symlinks,
                    config.node_modules_path_override,
                ));
                Arc::new(crate::host::DefaultFsHost::new(fs.clone(), resolver))
            }
        };

        let engine = crate::query::QueryEngine::new_with_host(
            host,
            resource_registry.clone(),
            entrypoints_lock.clone(),
            reference_strategy,
            r3_symbols_file,
            config.angular_core_compilation,
            config.generate_extra_imports_in_local_mode,
            config.compile_non_exported_classes,
            config.enable_hmr,
            config.strict_standalone,
            config.use_poisoned_data,
            config.strict_injection_parameters,
            config.implicit_standalone,
            config.emit_declaration_only,
            config.experimental_local_compilation,
        );
        *engine.tsconfig_dts_files.write().unwrap() = dts_files;
        for id in virtual_entry_ids {
            engine.intern_resolved(
                &crate::host::ModuleId::from(id.as_str()),
                crate::host::IdKind::Virtual,
            );
        }

        Analyzer {
            resource_registry,
            fs,
            batching_host,
            engine,
            active_handles: Arc::new(RwLock::new(Vec::new())),
            metadata_mutations: Arc::new(MetadataMutationState::new()),
            tsconfig_path: config.tsconfig_path,
            roots_from_tsconfig: AtomicBool::new(roots_from_tsconfig),
            entrypoints: entrypoints_lock,
            current_cancel_token: RwLock::new(None),
            merged_compiler_options: config.merged_compiler_options,
        }
    }

    pub fn batching_host(&self) -> Option<&Arc<crate::host::BatchingHost>> {
        self.batching_host.as_ref()
    }

    pub fn merged_compiler_options(&self) -> &serde_json::Map<String, serde_json::Value> {
        &self.merged_compiler_options
    }

    /// Path of an interned file, for perf reports.
    pub fn file_path(&self, id: crate::query::FileId) -> Option<String> {
        self.engine.file_path(id)
    }

    pub fn analyze_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.start_analysis(spawner, false, false)
    }

    pub fn analyze_optimized_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.start_analysis(spawner, true, false)
    }

    pub fn analyze_delta_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.start_analysis(spawner, false, true)
    }

    pub fn analyze_optimized_delta_core<S: Spawner>(
        &self,
        spawner: S,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.start_analysis(spawner, true, true)
    }

    fn start_analysis<S: Spawner>(
        &self,
        spawner: S,
        is_optimized: bool,
        is_delta: bool,
    ) -> Result<futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>, String>
    {
        self.cancel_current_analysis();

        let (final_sender, receiver) = futures::channel::mpsc::unbounded();
        let cancel_token = CancellationToken::new();
        *self.current_cancel_token.write().unwrap() = Some(cancel_token.clone());

        self.run_coordinator_helper(
            self.entrypoints.read().unwrap().clone(),
            spawner,
            is_optimized,
            is_delta,
            cancel_token,
            Some(final_sender),
        );

        Ok(receiver)
    }

    /// Cancel the in-flight stream, if any, and return once its coordinator has stopped.
    ///
    /// The coordinator must be gone before this returns: it puts back the dirty files it took
    /// ([`DirtyFilesSnapshot`]) when it stops, and the next stream reads them as soon as it starts.
    /// On native targets the coordinator runs on the pool, so this waits for it to see the token
    /// (under a synchronous host that also lets the queries it awaits finish, see
    /// `run_coordinator`). On WASM there is no thread to wait on, so its handle is dropped and
    /// the local pool is stepped to run the drop.
    pub fn cancel_current_analysis(&self) {
        let token = self.current_cancel_token.write().unwrap().take();
        if let Some(token) = token {
            token.cancel();
        }

        let handles = {
            let mut handles_write = self.active_handles.write().unwrap();
            std::mem::take(&mut *handles_write)
        };

        #[cfg(not(target_arch = "wasm32"))]
        if !handles.is_empty() {
            let mut pool = FuturesUnordered::new();
            for h in handles {
                pool.push(h);
            }
            futures::executor::block_on(async { while pool.next().await.is_some() {} });
        }

        #[cfg(target_arch = "wasm32")]
        {
            drop(handles);
            try_step_local_pool();
        }

        if !self.is_synchronous_host() {
            // Queries parked on a host answer would otherwise stay in the cache, with their host
            // requests still queued, and be joined by the next stream. Drop both.
            self.engine.cancel_in_flight_queries();
            #[cfg(target_arch = "wasm32")]
            try_step_local_pool();
        }
    }

    /// Abort any in-flight [`Self::request_metadata_core`] attempts, wait for their query futures
    /// to drop, and keep restarted attempts parked until the returned guard drops.
    fn pause_metadata_requests(&self) -> MetadataMutationGuard<'_> {
        let abort_to_cancel = {
            let mut inner = self.metadata_mutations.inner.lock().unwrap();
            inner.active_mutations += 1;
            if inner.active_mutations == 1 {
                inner.ready = CancellationToken::new();
                let next_abort = CancellationToken::new();
                Some(std::mem::replace(&mut inner.abort, next_abort))
            } else {
                None
            }
        };
        if let Some(abort) = abort_to_cancel {
            abort.cancel();
        }
        #[cfg(target_arch = "wasm32")]
        try_step_local_pool();
        #[cfg(not(target_arch = "wasm32"))]
        {
            let mut inner = self.metadata_mutations.inner.lock().unwrap();
            while inner.in_flight_attempts > 0 {
                inner = self.metadata_mutations.idle_cvar.wait(inner).unwrap();
            }
        }
        MetadataMutationGuard {
            state: &self.metadata_mutations,
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
            let evicted = self.engine.invalidate_resource_owner(&ts_path);
            self.push_evicted_paths(evicted, invalidated_paths);
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

    /// Append the wire path or virtual module ID of every file whose cached query was evicted.
    fn push_evicted_paths(&self, evicted: Vec<QueryKey>, invalidated_paths: &mut Vec<String>) {
        let mut evicted: Vec<String> = evicted
            .into_iter()
            .filter_map(|key| key.file_id())
            .map(|file_id| match self.engine.lookup_module(file_id) {
                (id, crate::host::IdKind::Virtual) => id.as_str().to_owned(),
                (_, crate::host::IdKind::Path) => {
                    crate::fs::path_to_string(self.engine.lookup_path(file_id))
                }
            })
            .collect();
        evicted.sort_unstable();
        evicted.dedup();
        invalidated_paths.extend(evicted);
    }

    /// Whether the configured [`crate::host::AnalysisHost`] answers every request synchronously.
    pub fn is_synchronous_host(&self) -> bool {
        self.engine.is_synchronous_host()
    }

    /// Fail with [`crate::host::SYNC_HOST_REQUIRED_MSG`] unless the host is synchronous.
    ///
    /// Fallible entry points call this before reaching a `*_blocking` engine API, which panics on
    /// an asynchronous host instead of returning an error.
    pub fn ensure_synchronous_host(&self) -> Result<(), String> {
        if self.is_synchronous_host() {
            Ok(())
        } else {
            Err(crate::host::SYNC_HOST_REQUIRED_MSG.to_string())
        }
    }

    /// Read `file_path` from the analyzer's filesystem.
    ///
    /// This never calls the host, and it remains gated on a synchronous host: under an
    /// asynchronous host, module text comes from [`crate::host::AnalysisHost::load`] and the
    /// filesystem is not authoritative, so synchronous callers fail fast while async WASM callers
    /// go through [`Self::lookup_host_file_content_core`] + `AnalyzerHost.load`.
    ///
    /// TODO: add a pump-driven equivalent of [`Self::read_resource_checked`] that goes through the
    /// host so asynchronous hosts can serve `<link rel="stylesheet">` template resources.
    pub fn get_file_content_core(&self, file_path: String) -> Result<String, String> {
        self.ensure_synchronous_host()?;
        let path = PathBuf::from(&file_path);
        self.fs.read_to_string(&path).map_err(|e| e.to_string())
    }

    /// Look up cached module text or fallback load metadata (`id`, `external`) for host-backed
    /// `WasmAnalyzer.getFileContent`.
    ///
    /// Probes proactive/inline [`crate::host::BatchingHost`] state first so unanalyzed overlay
    /// updates win immediately, then falls back to any completed [`QueryKey::ParseFile`] entry in
    /// the query cache. When neither cache holds the module's text, returns `code: None` alongside
    /// the canonical [`crate::host::ModuleId`] and authoritative `external` flag so JS can request
    /// it from `AnalyzerHost.load`.
    pub fn lookup_host_file_content_core(
        &self,
        file_path: String,
    ) -> Result<crate::host::HostFileContentLookup, String> {
        let Some(batch_host) = &self.batching_host else {
            return Err(
                "lookupHostFileContent requires an analyzer configured with a host".to_string(),
            );
        };

        let raw_id = crate::host::ModuleId::from(file_path.as_str());
        let interned = self.engine.get_interned_file_id(Path::new(&file_path));
        let (canonical_id, external) = match interned {
            Some(fid) => (self.engine.lookup_id(fid), self.engine.lookup_external(fid)),
            None => (raw_id.clone(), false),
        };

        let mut cached = batch_host.cached_module_code(&canonical_id);
        if cached.is_none() && canonical_id != raw_id {
            cached = batch_host.cached_module_code(&raw_id);
        }
        if cached.is_none() && interned.is_none() {
            let norm = crate::fs::path_to_string(
                crate::fs::normalize_path_structural(Path::new(&file_path)).into_owned(),
            );
            let norm_id = crate::host::ModuleId::from(norm.as_str());
            if norm_id != raw_id {
                cached = batch_host.cached_module_code(&norm_id);
            }
        }
        let code = match (cached, interned) {
            (Some(code), _) => Some(code.to_string()),
            (None, Some(fid)) => self.engine.cached_parsed_source(fid),
            (None, None) => None,
        };

        Ok(crate::host::HostFileContentLookup {
            code,
            id: canonical_id,
            external,
        })
    }

    /// Fallible form of [`Self::get_metadata_for_file`]: an asynchronous host is reported as an
    /// `Err` instead of a panic.
    pub fn get_metadata_for_file_checked(
        &self,
        file_path: String,
    ) -> Result<Option<AnalysisResult>, String> {
        self.ensure_synchronous_host()?;
        let module_ref = crate::ModuleRef::Path(file_path);
        let Some(file_id) = resolve_metadata_target(&self.engine, &self.fs, &module_ref) else {
            return Ok(None);
        };
        Ok(self.engine.get_metadata_for_file_id_blocking(file_id))
    }

    /// Resolve `url` the way a component's `templateUrl`/`styleUrls` are resolved from
    /// `containing_file` and read it. Backs the stylesheets the TypeScript layer discovers only
    /// after parsing a template (`<link rel="stylesheet">`), which ngtsc also resolves from the
    /// component file rather than from the template.
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L876-L883
    ///
    /// An asynchronous host is reported as an `Err` instead of a panic.
    pub fn read_resource_checked(
        &self,
        containing_file: String,
        url: String,
    ) -> Result<Option<crate::ResolvedResource>, String> {
        self.ensure_synchronous_host()?;
        Ok(self.engine.read_resource_blocking(
            &containing_file,
            &url,
            crate::host::ResourceKind::Style,
        ))
    }

    /// Panicking form of [`Self::read_resource_checked`], for callers with no error channel.
    pub fn read_resource_core(
        &self,
        containing_file: String,
        url: String,
    ) -> Option<crate::ResolvedResource> {
        self.read_resource_checked(containing_file, url)
            .unwrap_or_else(|msg| panic!("{msg}"))
    }

    pub fn canonical_paths_core(&self, paths: Vec<String>) -> Vec<String> {
        paths
            .into_iter()
            .map(|path| {
                if self.engine.get_virtual_if_interned(&path).is_some()
                    || !self.engine.is_synchronous_host()
                {
                    return path;
                }
                crate::fs::path_to_string(self.canonical_host_path(PathBuf::from(path)))
            })
            .collect()
    }

    fn canonical_host_path(&self, path: PathBuf) -> PathBuf {
        if let Ok(canonical) = self.fs.canonicalize(&path) {
            return canonical;
        }
        let (Some(dir), Some(name)) = (path.parent(), path.file_name()) else {
            return path;
        };
        match self.fs.canonicalize(dir) {
            Ok(dir) => dir.join(name),
            Err(_) => path,
        }
    }

    fn resolve_update_kind(
        &self,
        id: &str,
        explicit: Option<crate::host::IdKind>,
    ) -> crate::host::IdKind {
        explicit.unwrap_or_else(|| {
            if self.engine.get_virtual_if_interned(id).is_some() {
                crate::host::IdKind::Virtual
            } else {
                crate::host::IdKind::Path
            }
        })
    }

    /// Apply content updates and return every path or virtual module ID whose cached results are
    /// now stale.
    pub fn update_file_content_core(
        &self,
        updates: Vec<FileUpdate>,
    ) -> Result<Vec<String>, String> {
        let _mutation = self.pause_metadata_requests();
        self.cancel_current_analysis();
        let mut paths_to_invalidate = Vec::new();
        let mut structural_paths = Vec::new();
        let mut files_created = false;
        let mut config_changed = false;

        for update in updates {
            let kind = self.resolve_update_kind(&update.file_path, update.id_kind);
            if kind == crate::host::IdKind::Virtual {
                let path = PathBuf::from(&update.file_path);
                let module_id = crate::host::ModuleId::from(update.file_path.as_str());
                let prev_virtual_fid = self.engine.get_virtual_if_interned(&update.file_path);
                let existed = if let Some(batch_host) = &self.batching_host {
                    batch_host.has_overlay(&module_id)
                        || prev_virtual_fid
                            .is_some_and(|fid| self.engine.cached_parsed_source(fid).is_some())
                } else {
                    prev_virtual_fid.is_some()
                        && (!self.engine.is_synchronous_host() || self.fs.metadata(&path).is_ok())
                };
                files_created |= !existed;
                let file_id = self
                    .engine
                    .intern_resolved(&module_id, crate::host::IdKind::Virtual);
                if let Some(batch_host) = &self.batching_host {
                    batch_host.upsert_overlay(module_id, Arc::from(update.content.as_str()), None);
                } else if self.engine.is_synchronous_host() {
                    self.fs.upsert_file(path.clone(), update.content.clone());
                }
                paths_to_invalidate.push(update.file_path.clone());
                self.handle_template_change(&path, &mut paths_to_invalidate);
                let evicted = self.engine.invalidate_file_id(file_id);
                self.push_evicted_paths(evicted, &mut paths_to_invalidate);
                continue;
            }

            let raw_path = PathBuf::from(&update.file_path);
            if let Some(batch_host) = &self.batching_host {
                let norm_path = crate::fs::normalize_path_structural(&raw_path).into_owned();
                let norm_str = crate::fs::path_to_string(norm_path.clone());
                let interned_fid = self.engine.get_interned_file_id(&norm_path);
                let module_id = match interned_fid {
                    Some(fid) => self.engine.lookup_id(fid),
                    None => crate::host::ModuleId::from(norm_str.as_str()),
                };
                let existed = batch_host.has_overlay(&module_id)
                    || interned_fid
                        .is_some_and(|fid| self.engine.cached_parsed_source(fid).is_some());
                if !existed {
                    files_created = true;
                    structural_paths.push(crate::fs::normalize_path(&norm_path).into_owned());
                }
                batch_host.upsert_overlay(
                    module_id.clone(),
                    Arc::from(update.content.as_str()),
                    crate::host::ModuleFormat::from_path(&norm_path),
                );
                paths_to_invalidate.push(module_id.as_str().to_owned());
                self.invalidate_changed_path(&norm_path, &mut paths_to_invalidate);
                continue;
            }

            let path = self.fs.canonicalize(&raw_path).unwrap_or(raw_path);
            if self.fs.metadata(&path).is_err() {
                files_created = true;
                structural_paths.push(crate::fs::normalize_path(&path).into_owned());
            }
            config_changed |= path
                .extension()
                .is_some_and(|ext| ext.eq_ignore_ascii_case("json"));
            self.fs.upsert_file(path.clone(), update.content.clone());

            paths_to_invalidate.push(path.to_string_lossy().into_owned());
            self.invalidate_changed_path(&path, &mut paths_to_invalidate);
        }

        self.finalize_file_updates(
            paths_to_invalidate,
            files_created,
            config_changed,
            &structural_paths,
        )
    }

    /// Drop the virtual overlay of each changed or deleted file and return every stale TS path or
    /// virtual module ID.
    pub fn invalidate_files_core(
        &self,
        updates: Vec<FileInvalidation>,
    ) -> Result<Vec<String>, String> {
        let _mutation = self.pause_metadata_requests();
        self.cancel_current_analysis();
        let mut ts_paths_to_invalidate = Vec::new();
        let mut structural_paths = Vec::new();
        let mut files_created_or_deleted = false;
        let mut config_changed = false;

        for update in updates {
            let is_structural = matches!(
                update.update_type,
                crate::FileUpdateType::Created | crate::FileUpdateType::Deleted
            );
            files_created_or_deleted |= is_structural;
            let kind = self.resolve_update_kind(&update.file_path, update.id_kind);
            if kind == crate::host::IdKind::Virtual {
                let path = PathBuf::from(&update.file_path);
                if let Some(batch_host) = &self.batching_host {
                    batch_host.remove_overlay(&crate::host::ModuleId::from(
                        update.file_path.as_str(),
                    ));
                } else {
                    self.fs.remove_virtual_file(&path);
                }
                self.resource_registry.unregister_ts_file(&path);
                ts_paths_to_invalidate.push(update.file_path.clone());
                let should_intern = update.id_kind == Some(crate::host::IdKind::Virtual)
                    && (!matches!(update.update_type, crate::FileUpdateType::Deleted)
                        || self.engine.has_exact_interned(&update.file_path));
                let file_id = if should_intern {
                    Some(self.engine.intern_resolved(
                        &crate::host::ModuleId::from(update.file_path.as_str()),
                        crate::host::IdKind::Virtual,
                    ))
                } else {
                    self.engine.get_virtual_if_interned(&update.file_path)
                };
                if let Some(file_id) = file_id {
                    if matches!(update.update_type, crate::FileUpdateType::Deleted) {
                        let evicted = self.engine.invalidate_deleted_file_id(file_id);
                        self.push_evicted_paths(evicted, &mut ts_paths_to_invalidate);
                    }
                    let evicted = self.engine.invalidate_file_id(file_id);
                    self.push_evicted_paths(evicted, &mut ts_paths_to_invalidate);
                }
                self.handle_template_change(&path, &mut ts_paths_to_invalidate);
                continue;
            }

            let raw_path = PathBuf::from(&update.file_path);
            if is_structural {
                structural_paths.push(crate::fs::normalize_path(&raw_path).into_owned());
            }
            let path = if let Some(batch_host) = &self.batching_host {
                let norm_path = crate::fs::normalize_path_structural(&raw_path).into_owned();
                let norm_str = crate::fs::path_to_string(norm_path.clone());
                let norm_id = crate::host::ModuleId::from(norm_str.as_str());
                batch_host.remove_overlay(&norm_id);
                if let Some(fid) = self.engine.get_interned_file_id(&norm_path) {
                    let canonical_id = self.engine.lookup_id(fid);
                    if canonical_id != norm_id {
                        batch_host.remove_overlay(&canonical_id);
                    }
                }
                norm_path
            } else {
                let canonical = self.fs.canonicalize(&raw_path).unwrap_or(raw_path);
                self.fs.remove_virtual_file(&canonical);
                config_changed |= canonical
                    .extension()
                    .is_some_and(|ext| ext.eq_ignore_ascii_case("json"));
                canonical
            };
            if is_structural {
                let norm_canonical = crate::fs::normalize_path(&path).into_owned();
                if structural_paths.last() != Some(&norm_canonical) {
                    structural_paths.push(norm_canonical);
                }
            }

            if is_ts_file(&path) {
                self.resource_registry.unregister_ts_file(&path);
                ts_paths_to_invalidate.push(path.to_string_lossy().into_owned());
            }
            if matches!(update.update_type, crate::FileUpdateType::Deleted) {
                let evicted = self.engine.invalidate_deleted_file(&path);
                self.push_evicted_paths(evicted, &mut ts_paths_to_invalidate);
            }
            self.invalidate_changed_path(&path, &mut ts_paths_to_invalidate);
        }

        self.finalize_file_updates(
            ts_paths_to_invalidate,
            files_created_or_deleted,
            config_changed,
            &structural_paths,
        )
    }

    fn finalize_file_updates(
        &self,
        mut invalidated_paths: Vec<String>,
        structure_changed: bool,
        config_changed: bool,
        structural_paths: &[PathBuf],
    ) -> Result<Vec<String>, String> {
        if structure_changed {
            self.fs.clear_allowed_cache();
        }
        if structure_changed || config_changed {
            self.re_resolve_entrypoints(&mut invalidated_paths);
        }
        if structure_changed {
            let evicted = self.engine.refresh_tsconfig_dts_file_ids(structural_paths);
            self.push_evicted_paths(evicted, &mut invalidated_paths);
        }
        if config_changed {
            let evicted = self.engine.clear_resolution_cache();
            self.push_evicted_paths(evicted, &mut invalidated_paths);
        } else if structure_changed {
            let evicted = self.engine.invalidate_module_resolution();
            self.push_evicted_paths(evicted, &mut invalidated_paths);
        }
        Ok(dedup_preserving_order(invalidated_paths))
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
        let refs = entry_points
            .into_iter()
            .map(crate::host::ModuleRef::Path)
            .collect();
        self.set_entry_points_refs_core(refs)
    }

    /// [`Self::set_entry_points_core`] accepting [`crate::host::ModuleRef`] entries.
    ///
    /// [`crate::host::IdKind::Path`] entries must be absolute paths and are filtered to compilation
    /// roots; [`crate::host::IdKind::Virtual`] entries are interned verbatim without path checks.
    pub fn set_entry_points_refs_core(
        &self,
        entry_points: Vec<crate::host::ModuleRef>,
    ) -> Result<Vec<String>, String> {
        let mut validated = Vec::with_capacity(entry_points.len());
        for entry in entry_points {
            let (id, kind) = entry.into_parts();
            if kind == crate::host::IdKind::Path && !crate::fs::is_absolute_path(Path::new(&id)) {
                return Err(format!("Entry points must be absolute paths, got '{id}'"));
            }
            validated.push((id, kind));
        }

        let _mutation = self.pause_metadata_requests();
        self.cancel_current_analysis();
        self.roots_from_tsconfig.store(false, Ordering::SeqCst);
        let mut invalidated_paths = Vec::new();
        let mut roots = Vec::new();
        for (id, kind) in validated {
            match kind {
                crate::host::IdKind::Path => {
                    let path = PathBuf::from(id);
                    if is_compilation_root(&path) {
                        roots.push(canonical_root(&path, &self.fs));
                    }
                }
                crate::host::IdKind::Virtual => {
                    self.engine.intern_resolved(
                        &crate::host::ModuleId::from(id.as_str()),
                        crate::host::IdKind::Virtual,
                    );
                    roots.push(PathBuf::from(id));
                }
            }
        }
        self.replace_program_files(Some(roots), None, &mut invalidated_paths);
        Ok(dedup_preserving_order(invalidated_paths))
    }

    /// Flush every cached module resolution and return every module ID whose cached analysis was
    /// evicted.
    pub fn clear_resolution_cache_core(&self) -> Result<Vec<String>, String> {
        let _mutation = self.pause_metadata_requests();
        self.cancel_current_analysis();
        self.fs.clear_allowed_cache();
        let mut invalidated_paths = Vec::new();
        let evicted = self.engine.clear_resolution_cache();
        self.push_evicted_paths(evicted, &mut invalidated_paths);
        let dts_evicted = self.engine.invalidate_materialized_tsconfig_dts_files();
        self.push_evicted_paths(dts_evicted, &mut invalidated_paths);
        Ok(dedup_preserving_order(invalidated_paths))
    }

    /// Install the given compilation roots and the tsconfig's `.d.ts` files (`None` keeps the
    /// current list), evicting every query that read the previous lists when either differs, and
    /// every query that read which root is `r3_symbols.ts` when that changes too.
    fn replace_program_files(
        &self,
        roots: Option<Vec<PathBuf>>,
        dts_files: Option<Vec<PathBuf>>,
        invalidated_paths: &mut Vec<String>,
    ) {
        let r3_symbols_file = self.engine.r3_symbols_file();
        let roots_changed = roots.is_some_and(|roots| replace_if_changed(&self.entrypoints, roots));
        let dts_files_changed = dts_files.is_some_and(|dts_files| {
            replace_if_changed(&self.engine.tsconfig_dts_files, dts_files)
        });
        if !roots_changed && !dts_files_changed {
            return;
        }
        let mut evicted = self.engine.invalidate_roots();
        if self.engine.r3_symbols_file() != r3_symbols_file {
            evicted.extend(self.engine.invalidate_r3_symbols_root());
        }
        self.push_evicted_paths(evicted, invalidated_paths);
    }

    /// Spawn a wire-metadata query for `module_ref` onto `spawner` and return a oneshot receiver
    /// for its outcome.
    ///
    /// If files, entry points, or resolutions are mutated while the lookup is in flight, the
    /// running attempt is dropped before caches are evicted and restarted once the mutation
    /// finishes.
    pub fn request_metadata_core<S: Spawner>(
        &self,
        module_ref: crate::host::ModuleRef,
        spawner: S,
    ) -> Result<oneshot::Receiver<Result<Option<AnalysisResult>, String>>, String> {
        let (tx, rx) = oneshot::channel();
        if !self.metadata_mutations.has_active_mutation()
            && resolve_metadata_target(&self.engine, &self.fs, &module_ref).is_none()
        {
            let _ = tx.send(Ok(None));
            return Ok(rx);
        }
        let engine = Arc::clone(&self.engine);
        let fs = self.fs.clone();
        let mutations = Arc::clone(&self.metadata_mutations);
        let task = run_metadata_request(engine, fs, mutations, module_ref, tx);
        spawner.spawn(task).map_err(|e| e.to_string())?;
        Ok(rx)
    }
}

fn resolve_metadata_target(
    engine: &crate::query::QueryEngine,
    fs: &OverlayFileSystem,
    module_ref: &crate::host::ModuleRef,
) -> Option<FileId> {
    let (id, id_kind) = match module_ref {
        crate::host::ModuleRef::Path(id) => (id.as_str(), crate::host::IdKind::Path),
        crate::host::ModuleRef::Explicit { id, id_kind } => (id.as_str(), *id_kind),
    };
    if id_kind == crate::host::IdKind::Path {
        if let Some(file_id) = engine.get_virtual_if_interned(id) {
            return Some(file_id);
        }
        let path = Path::new(id);
        // Non-TS files (templates, stylesheets, JSON) and missing files return `None`, like
        // ngtsc's `TraitCompiler.recordFor`, rather than failing (the language service asks about
        // every open document, and a panic over N-API aborts the host) or degrading to an empty
        // `AnalysisResult` indistinguishable from a classless file.
        if !is_ts_file(path) {
            return None;
        }
        if engine.is_synchronous_host() && !fs.metadata(path).is_ok_and(|m| m.is_file()) {
            return None;
        }
        return Some(engine.intern_module(id, crate::host::IdKind::Path));
    }
    Some(engine.intern_resolved(
        &crate::host::ModuleId::from(id),
        crate::host::IdKind::Virtual,
    ))
}

async fn run_metadata_request(
    engine: Arc<crate::query::QueryEngine>,
    fs: OverlayFileSystem,
    mutations: Arc<MetadataMutationState>,
    module_ref: crate::host::ModuleRef,
    mut tx: oneshot::Sender<Result<Option<AnalysisResult>, String>>,
) {
    loop {
        let attempt = {
            let mut inner = mutations.inner.lock().unwrap();
            if inner.active_mutations == 0 {
                inner.in_flight_attempts += 1;
                let guard = MetadataAttemptGuard {
                    state: Arc::clone(&mutations),
                };
                Ok((guard, inner.abort.clone()))
            } else {
                Err(inner.ready.clone())
            }
        };

        let (attempt_guard, abort) = match attempt {
            Ok(pair) => pair,
            Err(ready) => {
                let cancel = tx.cancellation();
                futures::pin_mut!(ready, cancel);
                match futures::future::select(ready, cancel).await {
                    futures::future::Either::Left(_) => continue,
                    futures::future::Either::Right(_) => return,
                }
            }
        };

        let Some(file_id) = resolve_metadata_target(&engine, &fs, &module_ref) else {
            drop(attempt_guard);
            let _ = tx.send(Ok(None));
            return;
        };

        let outcome = {
            let fut = engine.get_metadata_for_file_id(file_id);
            let cancel = tx.cancellation();
            futures::pin_mut!(fut, cancel, abort);
            let stop = futures::future::select(cancel, abort);
            match futures::future::select(stop, fut).await {
                futures::future::Either::Left((futures::future::Either::Left(_), _)) => {
                    MetadataAttemptOutcome::Cancelled
                }
                futures::future::Either::Left((futures::future::Either::Right(_), _)) => {
                    MetadataAttemptOutcome::Restart
                }
                futures::future::Either::Right((res, _)) => MetadataAttemptOutcome::Done(res),
            }
        };
        drop(attempt_guard);

        match outcome {
            MetadataAttemptOutcome::Done(res) => {
                let _ = tx.send(Ok(res));
                return;
            }
            MetadataAttemptOutcome::Cancelled => return,
            MetadataAttemptOutcome::Restart => continue,
        }
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
/// transitive `.d.ts` files, so they never cost a canonicalize call here: the engine canonicalizes
/// them lazily, as the ambient module index and ambient global lookups first read them
/// (`QueryEngine::tsconfig_dts_file_id`). Other files are filtered out.
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

/// The compilation roots among `entries`, canonicalizing [`ResolvedEntryPoint::Path`] entries
/// through `fs` and passing [`ResolvedEntryPoint::Virtual`] IDs through verbatim.
fn compilation_roots(
    entries: Vec<ResolvedEntryPoint>,
    fs: &OverlayFileSystem,
) -> (Vec<PathBuf>, Vec<String>) {
    let mut roots = Vec::new();
    let mut virtual_ids = Vec::new();
    for entry in entries {
        match entry {
            ResolvedEntryPoint::Path(path) => {
                if is_compilation_root(&path) {
                    roots.push(canonical_root(&path, fs));
                }
            }
            ResolvedEntryPoint::Virtual(id) => {
                roots.push(PathBuf::from(&id));
                virtual_ids.push(id);
            }
        }
    }
    (roots, virtual_ids)
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

    /// Flush every cached module resolution and return every module ID whose cached analysis was
    /// evicted.
    #[cfg(feature = "napi")]
    #[napi]
    pub fn clear_resolution_cache(&self) -> napi::Result<Vec<String>> {
        self.clear_resolution_cache_core()
            .map_err(napi::Error::from_reason)
    }

    #[cfg(not(feature = "napi"))]
    pub fn clear_resolution_cache(&self) -> Result<Vec<String>, String> {
        self.clear_resolution_cache_core()
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

    /// Panicking form of [`Self::get_metadata_for_file_checked`], for Rust callers with no error
    /// channel. N-API is served by `get_metadata_for_file_napi` instead.
    pub fn get_metadata_for_file(&self, file_path: String) -> Option<AnalysisResult> {
        self.get_metadata_for_file_checked(file_path)
            .unwrap_or_else(|msg| panic!("{msg}"))
    }

    /// N-API `getMetadataForFile`: an asynchronous host is thrown as a JS error, since a panic
    /// over N-API aborts the host process.
    #[cfg(feature = "napi")]
    #[napi(js_name = "getMetadataForFile")]
    pub fn get_metadata_for_file_napi(
        &self,
        file_path: String,
    ) -> napi::Result<Option<AnalysisResult>> {
        self.get_metadata_for_file_checked(file_path)
            .map_err(napi::Error::from_reason)
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

    /// Panicking form of [`Self::read_resource_checked`], for Rust callers with no error channel.
    /// N-API is served by `read_resource_napi` instead.
    pub fn read_resource(
        &self,
        containing_file: String,
        url: String,
    ) -> Option<crate::ResolvedResource> {
        self.read_resource_core(containing_file, url)
    }

    /// N-API `readResource`: an asynchronous host is thrown as a JS error, since a panic over
    /// N-API aborts the host process.
    #[cfg(feature = "napi")]
    #[napi(js_name = "readResource")]
    pub fn read_resource_napi(
        &self,
        containing_file: String,
        url: String,
    ) -> napi::Result<Option<crate::ResolvedResource>> {
        self.read_resource_checked(containing_file, url)
            .map_err(napi::Error::from_reason)
    }

    #[cfg_attr(feature = "napi", napi)]
    pub fn canonical_paths(&self, paths: Vec<String>) -> Vec<String> {
        self.canonical_paths_core(paths)
    }

    #[cfg_attr(feature = "napi", napi)]
    pub fn get_compiler_options(&self) -> String {
        serde_json::to_string(&self.merged_compiler_options).unwrap_or_else(|_| "{}".to_string())
    }

    fn run_coordinator_helper<S: Spawner>(
        &self,
        paths: Vec<PathBuf>,
        spawner: S,
        is_optimized: bool,
        is_delta: bool,
        cancel_token: CancellationToken,
        sender: Option<
            futures::channel::mpsc::UnboundedSender<Result<crate::CompilationChunk, String>>,
        >,
    ) {
        let engine = self.engine.clone();

        let engine_clone = engine.clone();

        // Dependency discovery always uses `AnalyzeFileSyntax`; `processor` below uses the cached
        // `AnalyzeFileWire` query for either local or optimized mode.
        let local_analyzer = move |file_path: PathBuf| {
            let engine = engine_clone.clone();
            async move {
                let file_id = engine.intern_entry_or_dep(&file_path);
                QueryContext::new(engine.clone())
                    .analyze_file_syntax(file_id)
                    .await
            }
            .boxed()
        };

        let engine_clone = engine.clone();
        let cancel_token_clone = cancel_token.clone();

        let processor = move |_file_path: PathBuf, local_res: Arc<FileData>| {
            let engine = engine_clone.clone();
            let cancel_token = cancel_token_clone.clone();

            async move {
                if cancel_token.is_cancelled() {
                    return (Err("Cancelled".to_string()), FileChunkInfo::default());
                }

                // TODO(diagnostics): surface `_local_res.errors` as a WireError on the
                // AnalysisResult for consumers that don't run TypeScript.
                let wire = QueryContext::new(engine)
                    .analyze_file_wire(local_res.file_id, is_optimized)
                    .await;
                (*wire).clone()
            }
            .boxed()
        };

        let (event_sender, event_receiver) = mpsc::channel::<CoordinatorEvent>(100);

        // Group into `@NgModule`-sized chunks only when needed: optimized mode (remote scoping,
        // NgModule scope emit) and local mode with `generateExtraImportsInLocalMode` (template
        // cycle detection across an NgModule's declarations).
        let group_chunks_by_ng_module =
            is_optimized || self.engine.generate_extra_imports_in_local_mode;
        let span = if is_optimized {
            tracing::info_span!(target: crate::perf::ASYNC_TARGET, "AnalyzeOptimized")
        } else {
            tracing::info_span!(target: crate::perf::ASYNC_TARGET, "Analyze")
        };

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
                is_optimized,
                is_delta,
            )
            .instrument(span);

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
                is_optimized,
                is_delta,
            )
            .instrument(span);
            let handle = spawner.spawn_local_with_handle(fut).unwrap();
            self.active_handles.write().unwrap().push(handle);
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

async fn run_coordinator<S, LA, FutLA, P, FutP>(
    engine: Arc<crate::QueryEngine>,
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
    is_optimized: bool,
    is_delta: bool,
) where
    S: Spawner,
    LA: Fn(PathBuf) -> FutLA + Send + Sync + 'static + Clone,
    FutLA: std::future::Future<Output = Arc<FileData>> + Send + 'static,
    P: Fn(PathBuf, Arc<FileData>) -> FutP + Send + Sync + 'static + Clone,
    FutP: std::future::Future<Output = (Result<crate::AnalysisResult, String>, FileChunkInfo)>
        + Send
        + 'static,
{
    let mut seen = HashSet::new();
    let mut visited_file_ids = HashSet::new();
    let mut pending_tasks = FuturesUnordered::new();
    let mut uf = UnionFind::new();

    if cancel_token.is_cancelled() {
        return;
    }

    // Whether work in flight is abandoned as soon as the run is cancelled.
    //
    // Under an asynchronous host a query can be parked on a host answer that will never arrive,
    // so waiting for it would hang `cancel_current_analysis`; the parked queries are dropped from
    // the cache afterwards (`cancel_in_flight_queries`).
    //
    // Under a synchronous host the queries keep running on the pool once their awaiter is gone,
    // and nothing drops them from the cache. `cancel_current_analysis` blocks on this run so that
    // none is still reading a file when the caller changes it: a query that finishes after its
    // file was invalidated is not in the reverse index yet, so it would stay cached with the
    // old content. There the work is awaited, and cancellation is only checked between awaits.
    let abandon_on_cancel = !engine.is_synchronous_host();

    {
        let singletons_fut = engine
            .ensure_singletons_fresh(is_optimized)
            .instrument(tracing::info_span!(
                target: crate::perf::ASYNC_TARGET,
                "EnsureSingletonsFresh"
            ));
        if abandon_on_cancel {
            futures::pin_mut!(singletons_fut);
            if matches!(
                futures::future::select(singletons_fut, cancel_token.clone()).await,
                futures::future::Either::Right(_)
            ) {
                return;
            }
        } else {
            singletons_fut.await;
        }
    }

    if cancel_token.is_cancelled() {
        return;
    }

    let prev_program_files = Arc::new(engine.last_program_files.lock().unwrap().clone());
    let dirty_snapshot = DirtyFilesSnapshot::take(&engine);
    let delta_dirty_files = if is_delta {
        dirty_snapshot.files().cloned()
    } else {
        None
    };

    // Spawns the per-file task: Stage-1 analysis (resolving static/dynamic dependencies),
    // dep fan-out over `event_sender`, and Stage-2 processing, checking cancellation at each await.
    // The closure owns its captures (`move` closure holding owned, `Send` values) so the
    // coordinator future stays `Send` without requiring the spawner to be `Sync`.
    let task_cancel_token = cancel_token.clone();
    let task_engine = engine.clone();
    let task_delta_dirty = delta_dirty_files.clone();
    let task_prev_program = prev_program_files.clone();
    let spawn_file_task = move |path: PathBuf| {
        let event_sender = event_sender.clone();
        let local_analyzer = local_analyzer.clone();
        let processor = processor.clone();
        let cancel_token = task_cancel_token.clone();
        let cancel_wait = task_cancel_token.clone();
        let engine = task_engine.clone();
        let delta_dirty = task_delta_dirty.clone();
        let prev_program = task_prev_program.clone();
        spawner
            .spawn_with_handle(async move {
                let work = async move {
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
                    let file_id = local_res.file_id;
                    let is_dirty = match &delta_dirty {
                        Some(dirty) => {
                            dirty.contains(&file_id)
                                || !prev_program.contains(&file_id)
                                || !engine.has_cached_wire(file_id, is_optimized)
                        }
                        None => true,
                    };
                    if !is_dirty
                        && (!group_chunks_by_ng_module
                            || !local_res.may_have_non_standalone_class())
                    {
                        return;
                    }
                    let (result, chunk_info) = processor(path, local_res).await;
                    let _ = event_sender
                        .clone()
                        .send(CoordinatorEvent::FileCompleted {
                            file_id,
                            result,
                            chunk_info,
                            is_dirty,
                        })
                        .await;
                };
                futures::pin_mut!(work);
                if abandon_on_cancel {
                    let _ = futures::future::select(work, cancel_wait).await;
                } else {
                    work.await;
                }
            })
            .unwrap()
    };

    let mut valid_entrypoints = Vec::new();
    for entry in entrypoints {
        let virtual_fid = entry
            .to_str()
            .and_then(|s| engine.get_virtual_if_interned(s));
        if let Some(file_id) = virtual_fid {
            if !engine.lookup_external(file_id) && visited_file_ids.insert(file_id) {
                valid_entrypoints.push(entry);
            }
            continue;
        }
        if !is_compilation_root(&entry) {
            continue;
        }
        // Dedupe on the case-folded path, but keep the caller's spelling.
        if seen.insert(crate::fs::normalize_path(&entry).into_owned()) {
            // Intern `FileId`s synchronously in entrypoint order before spawning async workers so
            // `FileId` ordering is deterministic and reflects `tsconfig` root order.
            let file_id = engine.intern_path(&entry);
            if !engine.lookup_external(file_id) && visited_file_ids.insert(file_id) {
                valid_entrypoints.push(entry);
            }
        }
    }

    for entry in valid_entrypoints {
        if cancel_token.is_cancelled() {
            break;
        }
        pending_tasks.push(spawn_file_task(entry));
    }

    let mut event_receiver = event_receiver.fuse();
    let mut cancel_fut = cancel_token.clone().fuse();
    loop {
        if cancel_token.is_cancelled() {
            while pending_tasks.next().await.is_some() {}
            return;
        }

        if pending_tasks.is_empty() {
            while let Ok(event) = event_receiver.get_mut().try_recv() {
                handle_coordinator_event(
                    event,
                    &engine,
                    &cancel_token,
                    &mut seen,
                    &mut visited_file_ids,
                    &mut pending_tasks,
                    &spawn_file_task,
                    &mut uf,
                    &final_sender,
                    group_chunks_by_ng_module,
                );
            }
            if pending_tasks.is_empty() {
                break;
            }
        }

        futures::select! {
            _ = cancel_fut => {
                while pending_tasks.next().await.is_some() {}
                return;
            }
            _ = pending_tasks.select_next_some() => {}
            event = event_receiver.select_next_some() => {
                handle_coordinator_event(
                    event,
                    &engine,
                    &cancel_token,
                    &mut seen,
                    &mut visited_file_ids,
                    &mut pending_tasks,
                    &spawn_file_task,
                    &mut uf,
                    &final_sender,
                    group_chunks_by_ng_module,
                );
            }
        }
    }

    let mut remaining_states: Vec<_> = uf.states.drain().collect();
    remaining_states.sort_by_key(|(root, _)| *root);
    for (_, state) in remaining_states {
        if !state.has_dirty {
            continue;
        }
        if let Some(snd) = &final_sender {
            let mut files: Vec<crate::AnalysisResult> = state.completed.into_values().collect();
            files.sort_by_key(|f| f.file_id);
            if !files.is_empty() {
                let static_edges = compute_intra_chunk_static_edges(&engine, &files);
                let _ = snd.unbounded_send(Ok(crate::CompilationChunk {
                    files,
                    static_edges,
                    removed_files: None,
                }));
            }
        }
    }

    if delta_dirty_files.is_some() {
        if let Some(snd) = &final_sender {
            let mut removed: Vec<String> = prev_program_files
                .difference(&visited_file_ids)
                .map(|&fid| match engine.lookup_module(fid) {
                    (id, crate::host::IdKind::Virtual) => id.as_str().to_owned(),
                    (_, crate::host::IdKind::Path) => {
                        crate::fs::path_to_string(engine.lookup_path(fid))
                    }
                })
                .collect();
            removed.sort_unstable();
            if !removed.is_empty() {
                let _ = snd.unbounded_send(Ok(crate::CompilationChunk {
                    files: Vec::new(),
                    static_edges: None,
                    removed_files: Some(removed),
                }));
            }
        }
    }

    *engine.last_program_files.lock().unwrap() = visited_file_ids;
    dirty_snapshot.consume();
}

/// The files marked dirty since the last completed stream, taken from the engine for one
/// coordinator run.
///
/// Taking the snapshot leaves an empty live set behind, so files marked while the run is in
/// progress are kept for the next one. A run that completes has streamed every file in the
/// snapshot and consumes it. A run that does not complete (every update cancels the in-flight
/// stream) puts the snapshot back when dropped, so the next delta pass still re-streams those
/// files, and still knows a baseline exists against which to report `removed_files`.
struct DirtyFilesSnapshot {
    engine: Arc<crate::QueryEngine>,
    files: Option<Arc<HashSet<FileId>>>,
    consumed: bool,
}

impl DirtyFilesSnapshot {
    fn take(engine: &Arc<crate::QueryEngine>) -> Self {
        let files = engine
            .dirty_wire_files
            .lock()
            .ok()
            .and_then(|mut guard| guard.as_mut().map(|set| Arc::new(std::mem::take(set))));
        Self {
            engine: engine.clone(),
            files,
            consumed: false,
        }
    }

    /// The files to re-stream, or `None` before the first full stream completed.
    fn files(&self) -> Option<&Arc<HashSet<FileId>>> {
        self.files.as_ref()
    }

    /// Marks the run complete: the snapshot is spent, and from now on dirty files are tracked.
    fn consume(mut self) {
        self.consumed = true;
        if let Ok(mut guard) = self.engine.dirty_wire_files.lock() {
            if guard.is_none() {
                *guard = Some(HashSet::new());
            }
        }
    }
}

impl Drop for DirtyFilesSnapshot {
    fn drop(&mut self) {
        if self.consumed {
            return;
        }
        let Some(files) = self.files.take() else {
            return;
        };
        if let Ok(mut guard) = self.engine.dirty_wire_files.lock() {
            match guard.as_mut() {
                Some(live) => live.extend(files.iter().copied()),
                None => *guard = Some(Arc::unwrap_or_clone(files)),
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
        is_dirty: bool,
    },
}

#[allow(clippy::too_many_arguments)]
fn handle_coordinator_event(
    event: CoordinatorEvent,
    engine: &Arc<crate::QueryEngine>,
    cancel_token: &CancellationToken,
    seen: &mut HashSet<PathBuf>,
    visited_file_ids: &mut HashSet<FileId>,
    pending_tasks: &mut FuturesUnordered<futures::future::RemoteHandle<()>>,
    spawn_file_task: &impl Fn(PathBuf) -> futures::future::RemoteHandle<()>,
    uf: &mut UnionFind,
    final_sender: &Option<
        futures::channel::mpsc::UnboundedSender<Result<crate::CompilationChunk, String>>,
    >,
    group_chunks_by_ng_module: bool,
) {
    match event {
        CoordinatorEvent::DepsDiscovered { deps } => {
            for dep in deps {
                if cancel_token.is_cancelled() {
                    break;
                }
                if let Some(file_id) = dep
                    .to_str()
                    .and_then(|s| engine.get_virtual_if_interned(s))
                {
                    if !engine.lookup_external(file_id) && visited_file_ids.insert(file_id) {
                        pending_tasks.push(spawn_file_task(dep));
                    }
                    continue;
                }
                if is_ts_file(&dep) && seen.insert(crate::fs::normalize_path(&dep).into_owned()) {
                    let file_id = engine.intern_path(&dep);
                    if !engine.lookup_external(file_id) && visited_file_ids.insert(file_id) {
                        pending_tasks.push(spawn_file_task(dep));
                    }
                }
            }
        }
        CoordinatorEvent::FileCompleted {
            file_id,
            result,
            chunk_info,
            is_dirty,
        } => {
            handle_completed_file(
                engine,
                file_id,
                result,
                chunk_info,
                is_dirty,
                uf,
                final_sender,
                group_chunks_by_ng_module,
            );
        }
    }
}

struct ChunkState {
    members: HashSet<FileId>,
    expected: HashSet<FileId>,
    completed: HashMap<FileId, crate::AnalysisResult>,
    has_dirty: bool,
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
            has_dirty: false,
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
            has_dirty: false,
        });

        let state1 = self.states.entry(root1).or_insert_with(|| ChunkState {
            members: [root1].into_iter().collect(),
            expected: [root1].into_iter().collect(),
            completed: HashMap::new(),
            has_dirty: false,
        });

        state1.members.extend(state2.members);
        state1.expected.extend(state2.expected);
        state1.completed.extend(state2.completed);
        state1.has_dirty |= state2.has_dirty;
    }
}

fn compute_intra_chunk_static_edges(
    engine: &Arc<crate::QueryEngine>,
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
pub(crate) async fn extract_chunk_info(
    file_data: &FileData,
    engine: &crate::QueryEngine,
    ctx: &QueryContext,
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
                    ctx.record_component_mapping_deps(&mapping, r.file);
                    if mapping
                        .get_duplicate_declarations(r.file, r.name())
                        .is_some()
                    {
                        continue;
                    }
                    if engine.lookup_external(r.file) {
                        continue;
                    }
                    let is_source = match engine.lookup_kind(r.file) {
                        crate::host::IdKind::Path => is_ts_source(&engine.lookup_path(r.file)),
                        crate::host::IdKind::Virtual => {
                            let parsed = ctx.parse_file(r.file).await;
                            let guard = parsed.lock().unwrap();
                            let st = guard.borrow_dependent().program.source_type;
                            st.is_typescript() && !st.is_typescript_definition()
                        }
                    };
                    if is_source {
                        declared_file_ids.push(r.file);
                    }
                }
            }
            crate::analyzer::DecoratorData::Component(c)
                if !c.directive.standalone || c.directive.declaring_ng_module.is_some() =>
            {
                has_non_standalone = true;
            }
            crate::analyzer::DecoratorData::Directive(d)
                if !d.standalone || d.declaring_ng_module.is_some() =>
            {
                has_non_standalone = true;
            }
            crate::analyzer::DecoratorData::Pipe(p)
                if !p.standalone.unwrap_or(true) || p.declaring_ng_module.is_some() =>
            {
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
async fn resolved_ng_module_declarations(
    declarations: &crate::evaluator::Resolved<Vec<crate::types::analysis::Reference>>,
    ctx: &QueryContext,
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

fn handle_completed_file(
    engine: &Arc<crate::QueryEngine>,
    file_id: FileId,
    result: Result<crate::AnalysisResult, String>,
    chunk_info: FileChunkInfo,
    is_dirty: bool,
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
        if is_dirty {
            if let Some(snd) = final_sender {
                let _ = snd.unbounded_send(Ok(crate::CompilationChunk {
                    files: vec![res],
                    static_edges: None,
                    removed_files: None,
                }));
            }
        }
        return;
    }

    uf.ensure_exists(file_id);
    let root = uf.find(file_id);
    if let Some(state) = uf.states.get_mut(&root) {
        state.completed.insert(file_id, res);
        state.has_dirty |= is_dirty;
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
                    let owner_id = engine.intern_entry_or_dep(Path::new(owner_path));
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
        if !state.has_dirty {
            return;
        }
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
                removed_files: None,
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
    let declaring = if let Some(comp) = &class.component {
        if comp.standalone && comp.declaring_ng_module.is_none() {
            return ClassOwner::Other;
        }
        &comp.declaring_ng_module
    } else if let Some(dir) = &class.directive {
        if dir.standalone && dir.declaring_ng_module.is_none() {
            return ClassOwner::Other;
        }
        &dir.declaring_ng_module
    } else if let Some(pipe) = &class.pipe {
        if pipe.standalone.unwrap_or(true) && pipe.declaring_ng_module.is_none() {
            return ClassOwner::Other;
        }
        &pipe.declaring_ng_module
    } else {
        return ClassOwner::Other;
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
        engine: &Arc<crate::QueryEngine>,
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
            let kind_lookup = |id| engine.lookup_kind(id);
            let r3_symbols_path = engine.r3_symbols_file();
            let cx = crate::analyzer::WireContext {
                mode: crate::analyzer::WireMode::Semantic,
                emit_declaration_only: false,
                experimental_local_compilation: false,
                source_text: &source_text,
                converter: &semantic.converter,
                reference_strategy: &*engine.reference_strategy,
                path_lookup: Some(&path_lookup),
                kind_lookup: Some(&kind_lookup),
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
                true,
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
            "_isAngularCoreCompilation": true,
            "_angularCoreVersion": "18.2.0"
        }
    }"#;

    fn resolve(options: AnalyzerOptions) -> EffectiveConfig {
        let physical: Arc<dyn crate::physical_fs::PhysicalFs> =
            Arc::new(crate::physical_fs::default_physical_fs());
        let fs = OverlayFileSystem::new_with_allowed_sources_and_fs(None, physical);
        fs.upsert_file(
            PathBuf::from("/project/tsconfig.json"),
            TSCONFIG.to_string(),
        );
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

    fn path_entries(items: &[&str]) -> Vec<ResolvedEntryPoint> {
        items
            .iter()
            .map(|p| ResolvedEntryPoint::Path(PathBuf::from(p)))
            .collect()
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
        assert_eq!(config.angular_core_compilation, Some(true));
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
            angular_core_compilation: Some(false),
            default_host: Some(crate::DefaultHostConfig {
                root_dirs: Some(vec!["./gen".to_string()]),
                preserve_symlinks: Some(false),
                node_modules_path_override: Some("/nm".to_string()),
            }),
            ..Default::default()
        });
        assert!(!config.preserve_symlinks);
        assert_eq!(config.merge_root_dirs, paths(&["/project/gen"]));
        assert_eq!(
            config.import_prefix_roots,
            paths(&["/project/prefix", "/abs"])
        );
        assert_eq!(config.workspace_name.as_deref(), Some("explicit"));
        assert!(!config.strict_standalone);
        assert!(!config.strict_injection_parameters);
        assert!(config.compile_non_exported_classes);
        assert!(!config.generate_extra_imports_in_local_mode);
        assert!(!config.enable_hmr);
        assert!(!config.use_poisoned_data);
        assert!(config.implicit_standalone);
        assert_eq!(config.angular_core_compilation, Some(false));
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
        assert_eq!(
            alias_only.node_modules_path_override.as_deref(),
            Some("/legacy_nm")
        );
        // The deprecated `root_dirs` alias only feeds the import prefix roots, never the merging
        // directories.
        assert_eq!(
            alias_only.merge_root_dirs,
            paths(&["/project/a", "/project/b"])
        );

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
        assert_eq!(config.angular_core_compilation, None);
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
        assert_eq!(config.entry_points, Some(path_entries(&["/app/main.ts"])));
        assert!(config.tsconfig_files.is_empty());
        assert_eq!(
            config.r3_symbols_file,
            Some(PathBuf::from("/core/r3_symbols.ts"))
        );
        // Naming the `r3_symbols.ts` file only makes sense when compiling `@angular/core`.
        assert_eq!(config.angular_core_compilation, Some(true));
        assert!(config.strict_standalone);
        assert!(!config.implicit_standalone);
        assert_eq!(config.import_prefix_roots, paths(&["/app"]));
    }

    #[test]
    fn explicit_angular_core_compilation_wins_over_r3_symbols_file() {
        let config = resolve_without_tsconfig(AnalyzerOptions {
            r3_symbols_file: Some("/core/r3_symbols.ts".to_string()),
            angular_core_compilation: Some(false),
            ..Default::default()
        })
        .unwrap();
        assert_eq!(config.angular_core_compilation, Some(false));
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
            let err = resolve_without_tsconfig(options)
                .err()
                .expect("relative path rejected");
            assert!(err.contains("must be an absolute path"), "{err}");
        }
    }

    #[test]
    fn explicit_entry_points_replace_tsconfig_roots() {
        let config = resolve(AnalyzerOptions {
            entry_points: Some(vec!["main.ts".to_string()]),
            ..Default::default()
        });
        assert_eq!(
            config.entry_points,
            Some(path_entries(&["/project/main.ts"]))
        );
        assert_eq!(
            config.tsconfig_path,
            Some(PathBuf::from("/project/tsconfig.json"))
        );
    }

    #[test]
    fn entry_refs_validate_paths_and_preserve_virtual_ids() {
        let physical: Arc<dyn crate::physical_fs::PhysicalFs> =
            Arc::new(crate::physical_fs::default_physical_fs());
        let fs = OverlayFileSystem::new_with_allowed_sources_and_fs(None, physical);

        let rel_ref = crate::host::ModuleRef::Path("src/my_comp.ts".to_string());
        let err = EffectiveConfig::resolve_with_entry_refs(
            AnalyzerOptions::default(),
            Some(vec![rel_ref]),
            &fs,
        )
        .err()
        .expect("relative path entry ref without tsconfig rejected");
        assert!(
            err.contains("must be an absolute path when no tsconfig is given"),
            "{err}"
        );

        let config = EffectiveConfig::resolve_with_entry_refs(
            AnalyzerOptions::default(),
            Some(vec![
                crate::host::ModuleRef::Explicit {
                    id: "\0virtual:app".to_string(),
                    id_kind: crate::host::IdKind::Virtual,
                },
                crate::host::ModuleRef::Path("/app/main.ts".to_string()),
            ]),
            &fs,
        )
        .unwrap();
        assert_eq!(
            config.entry_points,
            Some(vec![
                ResolvedEntryPoint::Virtual("\0virtual:app".to_string()),
                ResolvedEntryPoint::Path(PathBuf::from("/app/main.ts")),
            ])
        );
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
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts"]}"#,
            ),
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
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        analyzer
            .engine
            .analyze_file_semantic_blocking("/project/c1.component.ts");

        let stale = analyzer
            .set_entry_points_core(vec!["/project/c1.component.ts".to_string()])
            .unwrap();
        assert!(stale.is_empty(), "unexpected stale paths: {stale:?}");
    }

    #[test]
    fn set_entry_points_rejects_relative_paths() {
        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        let err = analyzer
            .set_entry_points_core(vec!["c1.component.ts".to_string()])
            .unwrap_err();
        assert!(err.contains("c1.component.ts"), "{err}");
    }

    /// A virtual ID shaped like a path, as bundlers hand out (`/@id/...`).
    const VIRTUAL_ID: &str = "/@id/virtual-entry";

    /// An ID interned as a path before its kind was known becomes virtual once it is set as an
    /// explicit virtual entry point, and is then analyzed under that kind.
    #[test]
    fn virtual_entry_point_promotes_a_path_interned_id() {
        use crate::host::IdKind;

        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        let engine = &analyzer.engine;
        let file_id = engine.intern_path(VIRTUAL_ID);
        assert_eq!(engine.lookup_kind(file_id), IdKind::Path);

        analyzer
            .set_entry_points_refs_core(vec![crate::host::ModuleRef::Explicit {
                id: VIRTUAL_ID.to_string(),
                id_kind: IdKind::Virtual,
            }])
            .unwrap();
        assert_eq!(engine.lookup_kind(file_id), IdKind::Virtual);
        assert_eq!(engine.get_virtual_if_interned(VIRTUAL_ID), Some(file_id));

        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: VIRTUAL_ID.to_string(),
                content: COMPONENT.to_string(),
                id_kind: Some(IdKind::Virtual),
            }])
            .unwrap();
        let meta = engine
            .get_metadata_for_file_id_blocking(file_id)
            .expect("metadata for the promoted virtual entry point");
        assert_eq!(meta.file_path, VIRTUAL_ID);
        assert_eq!(meta.id_kind, Some(IdKind::Virtual));
        assert_eq!(meta.classes[0].class_name.as_deref(), Some("C1"));
    }

    /// An invalidation naming a path-interned ID as virtual promotes it as well, rather than
    /// missing the entry because it is not virtual yet.
    #[test]
    fn virtual_invalidation_promotes_a_path_interned_id() {
        use crate::host::IdKind;

        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        let engine = &analyzer.engine;
        let file_id = engine.intern_path(VIRTUAL_ID);
        assert_eq!(engine.lookup_kind(file_id), IdKind::Path);

        let stale = analyzer
            .invalidate_files_core(vec![FileInvalidation {
                file_path: VIRTUAL_ID.to_string(),
                update_type: crate::FileUpdateType::Changed,
                id_kind: Some(IdKind::Virtual),
            }])
            .unwrap();
        assert_eq!(engine.lookup_kind(file_id), IdKind::Virtual);
        assert_eq!(engine.get_virtual_if_interned(VIRTUAL_ID), Some(file_id));
        assert!(stale.contains(&VIRTUAL_ID.to_string()), "{stale:?}");

        // A `Created` invalidation on an unseen virtual ID interns it as `IdKind::Virtual` up front
        // so subsequent bare-string calls (`canonical_paths_core`, `get_metadata_for_file`) treat it
        // as virtual, while `Deleted` on an unseen virtual ID avoids allocating a dead `FileId`.
        let created_virtual = "/@id/created\\virtual.ts";
        analyzer
            .invalidate_files_core(vec![
                FileInvalidation {
                    file_path: "/@id/never-seen".to_string(),
                    update_type: crate::FileUpdateType::Deleted,
                    id_kind: Some(IdKind::Virtual),
                },
                FileInvalidation {
                    file_path: created_virtual.to_string(),
                    update_type: crate::FileUpdateType::Created,
                    id_kind: Some(IdKind::Virtual),
                },
            ])
            .unwrap();
        assert!(!engine.has_exact_interned("/@id/never-seen"));
        assert!(engine.get_virtual_if_interned(created_virtual).is_some());
        assert_eq!(
            analyzer.canonical_paths_core(vec![created_virtual.to_string()]),
            vec![created_virtual.to_string()]
        );
    }

    /// Entry points replace only the roots: the `.d.ts` files searched for ambient modules still
    /// come from the tsconfig, and keep following it after the roots stop doing so.
    #[test]
    fn set_entry_points_keeps_tsconfig_declaration_files() {
        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts", "a.d.ts"]}"#,
            ),
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
        assert_eq!(
            *analyzer.entrypoints.read().unwrap(),
            paths(&["/project/m.module.ts"])
        );
        assert_eq!(dts_files(&analyzer), paths(&["/project/a.d.ts"]));

        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/tsconfig.json".to_string(),
                content: r#"{"files": ["c1.component.ts", "b.d.ts"]}"#.to_string(),
                id_kind: None,
            }])
            .unwrap();
        assert_eq!(
            *analyzer.entrypoints.read().unwrap(),
            paths(&["/project/m.module.ts"])
        );
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
        analyzer
            .engine
            .analyze_file_semantic_blocking("/project/c1.component.ts");

        let stale = analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/m.module.ts".to_string(),
                content: MODULE.to_string(),
                id_kind: None,
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
                id_kind: None,
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
                id_kind: None,
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
                id_kind: None,
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
                id_kind: None,
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
            Some(PathBuf::from("/core/r3_symbols.ts")),
        );
    }

    const R3_SYMBOLS: &str = "export const ITS_JUST_ANGULAR = true;";

    /// Whether `path` is analyzed as part of `@angular/core` itself.
    fn is_core(analyzer: &Analyzer, path: &str) -> bool {
        let engine = analyzer.engine.clone();
        let file_id = engine.intern_path(path);
        let syntax =
            futures::executor::block_on(QueryContext::new(engine).analyze_file_syntax(file_id));
        syntax.is_core
    }

    /// Without `_isAngularCoreCompilation`, a root `r3_symbols.ts` exporting `ITS_JUST_ANGULAR`
    /// makes the compilation `@angular/core`, so roots that add or remove it re-analyze the files
    /// analyzed before, while unrelated root changes leave them cached.
    #[test]
    fn root_change_redetects_angular_core_compilation() {
        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/c2.component.ts", COMPONENT),
            ("/project/r3_symbols.ts", R3_SYMBOLS),
        ]);
        assert!(!is_core(&analyzer, "/project/c1.component.ts"));

        let unrelated_stale = analyzer
            .set_entry_points_core(vec![
                "/project/c1.component.ts".to_string(),
                "/project/c2.component.ts".to_string(),
            ])
            .unwrap();
        assert!(
            !unrelated_stale.contains(&"/project/c1.component.ts".to_string()),
            "unrelated root change should not invalidate c1.component.ts: {unrelated_stale:?}"
        );

        let stale = analyzer
            .set_entry_points_core(vec![
                "/project/c1.component.ts".to_string(),
                "/project/c2.component.ts".to_string(),
                "/project/r3_symbols.ts".to_string(),
            ])
            .unwrap();
        assert!(
            stale.contains(&"/project/c1.component.ts".to_string()),
            "stale paths: {stale:?}"
        );
        assert!(is_core(&analyzer, "/project/c1.component.ts"));

        analyzer
            .set_entry_points_core(vec!["/project/c1.component.ts".to_string()])
            .unwrap();
        assert!(!is_core(&analyzer, "/project/c1.component.ts"));
    }

    /// Detecting `@angular/core` reads `r3_symbols.ts`, so editing its `ITS_JUST_ANGULAR` marker
    /// re-analyzes the files analyzed before.
    #[test]
    fn r3_symbols_edit_redetects_angular_core_compilation() {
        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts", "r3_symbols.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/r3_symbols.ts", R3_SYMBOLS),
        ]);
        assert!(is_core(&analyzer, "/project/c1.component.ts"));

        let stale = analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/r3_symbols.ts".to_string(),
                content: "export const ITS_JUST_ANGULAR = false;".to_string(),
                id_kind: None,
            }])
            .unwrap();
        assert!(
            stale.contains(&"/project/c1.component.ts".to_string()),
            "stale paths: {stale:?}"
        );
        assert!(!is_core(&analyzer, "/project/c1.component.ts"));
    }

    #[test]
    fn leaf_edit_does_not_evict_unrelated_component_semantic_or_wire_cache() {
        let c2 = r#"
            import {Component} from '@angular/core';
            @Component({selector: 'c2', templateUrl: './c2.component.html'})
            export class C2 {}
        "#;
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/m.module.ts", MODULE),
            ("/project/c2.component.ts", c2),
            ("/project/c2.component.html", "<p>v1</p>"),
        ]);

        let c1_wire_before = analyzer
            .engine
            .analyze_file_wire_blocking("/project/c1.component.ts", true);
        let c2_wire_before = analyzer
            .engine
            .analyze_file_wire_blocking("/project/c2.component.ts", true);
        let c2_id = analyzer.engine.intern_path("/project/c2.component.ts");

        // Editing c2's external template should invalidate c2's wire/semantic cache while keeping
        // c2's ParseFile and c1's WireFileResult Arc intact.
        let stale = analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/c2.component.html".to_string(),
                content: "<p>v2</p>".to_string(),
                id_kind: None,
            }])
            .unwrap();
        assert!(
            !stale.contains(&"/project/c1.component.ts".to_string()),
            "unrelated c1 must not be invalidated by c2 template edit: {stale:?}"
        );
        assert!(
            analyzer
                .engine
                .cache
                .get(&QueryKey::ParseFile(c2_id))
                .is_some(),
            "c2 ParseFile AST must survive an external template edit"
        );

        let c1_wire_after = analyzer
            .engine
            .analyze_file_wire_blocking("/project/c1.component.ts", true);
        let c2_wire_after = analyzer
            .engine
            .analyze_file_wire_blocking("/project/c2.component.ts", true);
        assert!(
            Arc::ptr_eq(&c1_wire_before, &c1_wire_after),
            "c1 WireFileResult Arc must be reused without recomputation"
        );
        assert!(
            !Arc::ptr_eq(&c2_wire_before, &c2_wire_after),
            "c2 WireFileResult must be recomputed after template edit"
        );
    }

    #[test]
    fn delta_stream_emits_only_dirty_chunks_and_removed_files() {
        let c2 = r#"
            import {Component} from '@angular/core';
            @Component({selector: 'c2', templateUrl: './c2.component.html'})
            export class C2 {}
        "#;
        let c3 = r#"
            import {Component} from '@angular/core';
            @Component({selector: 'c3', template: '<p>c3</p>'})
            export class C3 {}
        "#;
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/m.module.ts", MODULE),
            ("/project/c2.component.ts", c2),
            ("/project/c2.component.html", "<p>v1</p>"),
            ("/project/c3.component.ts", c3),
        ]);

        let collect_chunks =
            |rx: futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>| {
                futures::executor::block_on(rx.collect::<Vec<_>>())
                    .into_iter()
                    .map(|c| c.expect("chunk"))
                    .collect::<Vec<_>>()
            };

        let initial_chunks = collect_chunks(
            analyzer
                .analyze_optimized_core(get_global_pool().clone())
                .unwrap(),
        );
        let initial_files: HashSet<String> = initial_chunks
            .iter()
            .flat_map(|c| c.files.iter().map(|f| f.file_path.clone()))
            .collect();
        assert_eq!(initial_files.len(), 4);

        // Edit only c2's external template: delta stream should only emit c2's chunk, not the
        // NgModule chunk (m.module + c1) or c3.
        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/c2.component.html".to_string(),
                content: "<p>v2</p>".to_string(),
                id_kind: None,
            }])
            .unwrap();
        let delta_chunks = collect_chunks(
            analyzer
                .analyze_optimized_delta_core(get_global_pool().clone())
                .unwrap(),
        );
        let delta_files: Vec<String> = delta_chunks
            .iter()
            .flat_map(|c| c.files.iter().map(|f| f.file_path.clone()))
            .collect();
        assert_eq!(delta_files, vec!["/project/c2.component.ts".to_string()]);
    }

    #[test]
    fn delta_restreams_components_when_an_entrypoint_starts_contributing_extra_imports() {
        const CMP: &str = r#"
            import {Component} from '@angular/core';
            @Component({selector: 'cmp', template: '', standalone: false})
            export class Cmp {}
        "#;
        const MOD: &str = r#"
            import {NgModule} from '@angular/core';
            import {Cmp} from './cmp';
            @NgModule({declarations: [Cmp]})
            export class Mod {}
        "#;
        const OTHER_WITHOUT_IMPORTS: &str = r#"
            import {NgModule} from '@angular/core';
            import {ExtModule} from './ext/external';
            @NgModule({imports: [         ]})
            export class OtherMod {}
        "#;
        const OTHER_WITH_IMPORTS: &str = r#"
            import {NgModule} from '@angular/core';
            import {ExtModule} from './ext/external';
            @NgModule({imports: [ExtModule]})
            export class OtherMod {}
        "#;
        const EXTERNAL: &str = r#"
            import {NgModule} from '@angular/core';
            @NgModule({})
            export class ExtModule {}
        "#;
        let analyzer = Analyzer::new(AnalyzerOptions {
            tsconfig_path: Some("/project/tsconfig.json".to_string()),
            optimize: Some(false),
            virtual_files: Some(
                [
                    (
                        "/project/tsconfig.json",
                        r#"{
                            "angularCompilerOptions": {"generateExtraImportsInLocalMode": true},
                            "files": ["cmp.ts", "mod.ts", "other.ts"]
                        }"#,
                    ),
                    ("/project/cmp.ts", CMP),
                    ("/project/mod.ts", MOD),
                    ("/project/other.ts", OTHER_WITHOUT_IMPORTS),
                    ("/project/ext/external.ts", EXTERNAL),
                ]
                .iter()
                .map(|(path, content)| (path.to_string(), content.to_string()))
                .collect(),
            ),
            ..Default::default()
        })
        .unwrap();

        let collect_chunks =
            |rx: futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>| {
                futures::executor::block_on(rx.collect::<Vec<_>>())
                    .into_iter()
                    .map(|c| c.expect("chunk"))
                    .collect::<Vec<_>>()
            };
        let extra_imports_of_cmp = |chunks: &[CompilationChunk]| {
            chunks
                .iter()
                .flat_map(|c| c.files.iter())
                .find(|f| f.file_path == "/project/cmp.ts")
                .map(|f| {
                    f.classes
                        .iter()
                        .find_map(|c| c.component.as_ref())
                        .expect("Cmp is a component")
                        .local_compilation_extra_imports
                        .clone()
                        .unwrap_or_default()
                })
        };

        let initial = collect_chunks(analyzer.analyze_core(get_global_pool().clone()).unwrap());
        assert_eq!(extra_imports_of_cmp(&initial), Some(vec![]));

        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/other.ts".to_string(),
                content: OTHER_WITH_IMPORTS.to_string(),
                id_kind: None,
            }])
            .unwrap();
        let delta = collect_chunks(
            analyzer
                .analyze_delta_core(get_global_pool().clone())
                .unwrap(),
        );

        assert_eq!(
            extra_imports_of_cmp(&delta),
            Some(vec!["./ext/external".to_string()]),
            "cmp.ts must be re-streamed with the extra import other.ts now contributes"
        );
    }

    #[test]
    fn local_extra_imports_delta_tracks_in_unit_submodule_exports() {
        let ext_kit = "import * as i0 from '@angular/core';\n\
            export declare class ExtKitModule {\n\
              static ɵmod: i0.ɵɵNgModuleDeclaration<ExtKitModule, never, never, never>;\n\
            }\n";
        let sub_module = |exports: &str| {
            format!(
                "import {{NgModule}} from '@angular/core';\n\
                 import {{ExtKitModule}} from './ext/kit';\n\
                 import {{SubA, SubB}} from './sub_comps';\n\
                 @NgModule({{imports: [ExtKitModule], declarations: [SubA, SubB], exports: [{exports}]}})\n\
                 export class SubModule {{}}\n"
            )
        };

        let analyzer = Analyzer::new(AnalyzerOptions {
            tsconfig_path: Some("/project/tsconfig.json".to_string()),
            optimize: Some(false),
            virtual_files: Some(
                [
                    (
                        "/project/tsconfig.json",
                        r#"{
                            "angularCompilerOptions": {"generateExtraImportsInLocalMode": true},
                            "files": ["app_module.ts", "main_comp.ts", "sub_comps.ts", "sub_module.ts"]
                        }"#
                        .to_string(),
                    ),
                    ("/project/ext/kit.d.ts", ext_kit.to_string()),
                    (
                        "/project/app_module.ts",
                        "import {NgModule} from '@angular/core';\n\
                         import {ExtKitModule} from './ext/kit';\n\
                         import {MainComp} from './main_comp';\n\
                         import {SubModule} from './sub_module';\n\
                         @NgModule({imports: [ExtKitModule, SubModule], declarations: [MainComp]})\n\
                         export class AppModule {}\n"
                            .to_string(),
                    ),
                    (
                        "/project/main_comp.ts",
                        "import {Component} from '@angular/core';\n\
                         @Component({selector: 'main-comp', template: '<sub-a></sub-a><sub-b></sub-b>', standalone: false})\n\
                         export class MainComp {}\n"
                            .to_string(),
                    ),
                    (
                        "/project/sub_comps.ts",
                        "import {Component} from '@angular/core';\n\
                         @Component({selector: 'sub-a', template: '', standalone: false})\n\
                         export class SubA {}\n\
                         @Component({selector: 'sub-b', template: '', standalone: false})\n\
                         export class SubB {}\n"
                            .to_string(),
                    ),
                    ("/project/sub_module.ts", sub_module("SubA, ExtKitModule")),
                ]
                .into_iter()
                .map(|(path, content)| (path.to_string(), content))
                .collect(),
            ),
            ..Default::default()
        })
        .unwrap();

        let collect =
            |rx: futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>| {
                futures::executor::block_on(rx.collect::<Vec<_>>())
                    .into_iter()
                    .map(|chunk| chunk.expect("chunk"))
                    .collect::<Vec<_>>()
            };
        let decl_names_of_main = |chunks: &[CompilationChunk]| -> Option<Vec<String>> {
            chunks
                .iter()
                .flat_map(|chunk| chunk.files.iter())
                .find(|file| file.file_path == "/project/main_comp.ts")
                .map(|file| {
                    file.classes[0]
                        .component
                        .as_ref()
                        .expect("MainComp is a component")
                        .resolved_declarations
                        .as_deref()
                        .unwrap_or(&[])
                        .iter()
                        .map(|decl| decl.name.clone())
                        .collect()
                })
        };

        let initial = collect(analyzer.analyze_core(get_global_pool().clone()).unwrap());
        assert_eq!(decl_names_of_main(&initial), Some(vec!["SubA".to_string()]));

        // Editing an unread external `.d.ts` must not re-stream any file in local mode.
        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/ext/kit.d.ts".to_string(),
                content: format!("{ext_kit}export declare const UNUSED: number;\n"),
                id_kind: None,
            }])
            .unwrap();
        let after_dts_edit = collect(
            analyzer
                .analyze_delta_core(get_global_pool().clone())
                .unwrap(),
        );
        let re_streamed: Vec<&str> = after_dts_edit
            .iter()
            .flat_map(|chunk| chunk.files.iter())
            .map(|file| file.file_path.as_str())
            .collect();
        assert!(
            re_streamed.is_empty(),
            "editing an unread external .d.ts must not re-stream any file: {re_streamed:?}"
        );

        // Editing in-unit `SubModule` exports must re-stream `MainComp` with `SubB` included.
        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/sub_module.ts".to_string(),
                content: sub_module("SubA, SubB, ExtKitModule"),
                id_kind: None,
            }])
            .unwrap();
        let after_sub_edit = collect(
            analyzer
                .analyze_delta_core(get_global_pool().clone())
                .unwrap(),
        );
        assert_eq!(
            decl_names_of_main(&after_sub_edit),
            Some(vec!["SubA".to_string(), "SubB".to_string()])
        );
    }

    const C3_IN_M2: [(&str, &str); 2] = [
        (
            "/project/c3.component.ts",
            r#"
            import {Component} from '@angular/core';
            @Component({selector: 'c3', template: '', standalone: false})
            export class C3 {}
        "#,
        ),
        (
            "/project/m2.module.ts",
            r#"
            import {NgModule} from '@angular/core';
            import {C3} from './c3.component';
            @NgModule({declarations: [C3]})
            export class M2Module {}
        "#,
        ),
    ];

    /// The file declaring the first component of a wire result's NgModule, if any.
    fn declaring_module(wire: &crate::query::keys::WireFileResult) -> Option<String> {
        wire.0.as_ref().ok()?.classes.iter().find_map(|class| {
            Some(
                class
                    .component
                    .as_ref()?
                    .declaring_ng_module
                    .as_ref()?
                    .file_path
                    .clone(),
            )
        })
    }

    /// A `.ts` edit evicts the whole-program `ComponentMapping` and `NgModuleScopeRegistry`,
    /// which the next read rebuilds. The rebuild is diffed against the previous result and must
    /// evict nothing when it reaches the same conclusions: NgModule-declared components keep
    /// their semantic and wire results although the index they are looked up in was rebuilt.
    /// This is the path a plain source edit takes, unlike an external template edit, which
    /// never touches the singletons.
    #[test]
    fn unrelated_ts_edit_keeps_ngmodule_declared_component_wire_cached() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/m.module.ts", MODULE),
            C3_IN_M2[0],
            C3_IN_M2[1],
            ("/project/util.ts", "export const answer = 42;"),
        ]);
        let engine = &analyzer.engine;
        let c1_before = engine.analyze_file_wire_blocking("/project/c1.component.ts", true);
        let c3_before = engine.analyze_file_wire_blocking("/project/c3.component.ts", true);
        assert_eq!(
            declaring_module(&c1_before).as_deref(),
            Some("/project/m.module.ts")
        );
        assert_eq!(
            declaring_module(&c3_before).as_deref(),
            Some("/project/m2.module.ts")
        );
        let mapping_before = engine
            .last_component_mapping
            .lock()
            .unwrap()
            .clone()
            .expect("the component mapping was built");

        let stale = analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/util.ts".to_string(),
                content: "export const answer = 43;".to_string(),
                id_kind: None,
            }])
            .unwrap();
        assert_eq!(stale, vec!["/project/util.ts".to_string()]);

        let c1_after = engine.analyze_file_wire_blocking("/project/c1.component.ts", true);
        let c3_after = engine.analyze_file_wire_blocking("/project/c3.component.ts", true);
        let mapping_after = engine
            .last_component_mapping
            .lock()
            .unwrap()
            .clone()
            .expect("the component mapping was rebuilt");
        assert!(
            !Arc::ptr_eq(&mapping_before, &mapping_after),
            "a .ts edit rebuilds the component mapping"
        );
        assert!(
            Arc::ptr_eq(&c1_before, &c1_after) && Arc::ptr_eq(&c3_before, &c3_after),
            "rebuilding the mapping to the same conclusions must not evict the components it indexes"
        );
    }

    /// Declaring a component that no NgModule declared before changes the mapping's conclusion
    /// about a file that never read the edited module, so the reverse index alone would leave
    /// the component's cached results stale. The rebuilt mapping is diffed against the previous
    /// one and the component is evicted, so its next wire result names the new owner.
    #[test]
    fn declaring_an_orphan_component_recomputes_its_wire() {
        let analyzer = analyzer(&[
            ("/project/tsconfig.json", "{}"),
            ("/project/c1.component.ts", COMPONENT),
            (
                "/project/m.module.ts",
                r#"
                import {NgModule} from '@angular/core';
                @NgModule({declarations: []})
                export class MModule {}
            "#,
            ),
        ]);
        let engine = &analyzer.engine;
        let before = engine.analyze_file_wire_blocking("/project/c1.component.ts", true);
        assert_eq!(declaring_module(&before), None);

        // The reverse index does not know c1 for m.module.ts: c1 is only invalidated by the
        // mapping diff, which runs when the mapping is next rebuilt, not at update time.
        let stale = analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/m.module.ts".to_string(),
                content: MODULE.to_string(),
                id_kind: None,
            }])
            .unwrap();
        assert!(!stale.contains(&"/project/c1.component.ts".to_string()));

        let after = engine.analyze_file_wire_blocking("/project/c1.component.ts", true);
        assert!(
            !Arc::ptr_eq(&before, &after),
            "c1's wire result must be recomputed once an NgModule declares it"
        );
        assert_eq!(
            declaring_module(&after).as_deref(),
            Some("/project/m.module.ts")
        );
    }

    /// A delta run that is cancelled after taking the dirty files must give them back: the next
    /// delta pass has to re-stream them, and has to know a baseline exists so it can report the
    /// files that left the program. The run is cancelled from inside its own processor, so the
    /// cancellation deterministically happens after the snapshot was taken.
    #[test]
    fn cancelled_delta_run_keeps_dirty_files_and_removed_files_for_the_next_pass() {
        let c2 = r#"
            import {Component} from '@angular/core';
            @Component({selector: 'c2', templateUrl: './c2.component.html'})
            export class C2 {}
        "#;
        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts", "c2.component.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
            ("/project/c2.component.ts", c2),
            ("/project/c2.component.html", "<p>v1</p>"),
        ]);
        let engine = analyzer.engine.clone();
        let collect_chunks = |rx: mpsc::UnboundedReceiver<Result<CompilationChunk, String>>| {
            futures::executor::block_on(rx.collect::<Vec<_>>())
                .into_iter()
                .map(|c| c.expect("chunk"))
                .collect::<Vec<_>>()
        };
        let streamed = |chunks: &[CompilationChunk]| -> Vec<String> {
            chunks
                .iter()
                .flat_map(|c| c.files.iter().map(|f| f.file_path.clone()))
                .collect()
        };

        // Baseline: a completed full stream.
        let initial = collect_chunks(
            analyzer
                .analyze_optimized_core(get_global_pool().clone())
                .unwrap(),
        );
        assert_eq!(streamed(&initial).len(), 2);
        let c1 = engine.intern_path("/project/c1.component.ts");
        let c2_id = engine.intern_path("/project/c2.component.ts");

        // c2's template changes, and c1 leaves the program.
        analyzer
            .update_file_content_core(vec![FileUpdate {
                file_path: "/project/c2.component.html".to_string(),
                content: "<p>v2</p>".to_string(),
                id_kind: None,
            }])
            .unwrap();
        analyzer
            .set_entry_points_core(vec!["/project/c2.component.ts".to_string()])
            .unwrap();
        let dirty_before = engine
            .dirty_wire_files
            .lock()
            .unwrap()
            .clone()
            .expect("baseline");
        assert!(dirty_before.contains(&c2_id));

        // A delta run that cancels itself as soon as it processes a file.
        let token = CancellationToken::new();
        let (final_sender, final_receiver) = mpsc::unbounded();
        let (event_sender, event_receiver) = mpsc::channel::<CoordinatorEvent>(100);
        let local_engine = engine.clone();
        let local_analyzer = move |path: PathBuf| {
            let engine = local_engine.clone();
            async move {
                let file_id = engine.intern_path(path);
                QueryContext::new(engine).analyze_file_syntax(file_id).await
            }
            .boxed()
        };
        let processor_engine = engine.clone();
        let processor_token = token.clone();
        let processor = move |_path: PathBuf, local: Arc<FileData>| {
            let engine = processor_engine.clone();
            let token = processor_token.clone();
            async move {
                token.cancel();
                let wire = QueryContext::new(engine)
                    .analyze_file_wire(local.file_id, true)
                    .await;
                (*wire).clone()
            }
            .boxed()
        };
        futures::executor::block_on(run_coordinator(
            engine.clone(),
            engine.entrypoints.read().unwrap().clone(),
            get_global_pool().clone(),
            event_receiver,
            event_sender,
            local_analyzer,
            processor,
            token.clone(),
            Some(final_sender),
            true,
            true,
            true,
        ));
        assert!(token.is_cancelled());
        drop(final_receiver);

        let dirty_after = engine.dirty_wire_files.lock().unwrap().clone();
        assert_eq!(
            dirty_after.as_ref(),
            Some(&dirty_before),
            "a cancelled run must give the dirty files back"
        );
        assert!(
            engine.last_program_files.lock().unwrap().contains(&c1),
            "a cancelled run must not replace the baseline program"
        );

        // The next delta pass streams the dirty file and reports the file that left the program.
        let delta = collect_chunks(
            analyzer
                .analyze_optimized_delta_core(get_global_pool().clone())
                .unwrap(),
        );
        assert_eq!(
            streamed(&delta),
            vec!["/project/c2.component.ts".to_string()]
        );
        let removed: Vec<String> = delta
            .iter()
            .filter_map(|c| c.removed_files.clone())
            .flatten()
            .collect();
        assert_eq!(removed, vec!["/project/c1.component.ts".to_string()]);
        assert_eq!(
            *engine.dirty_wire_files.lock().unwrap(),
            Some(HashSet::new())
        );
    }

    /// Under a synchronous host a cancelled run must not finish while a file's analysis is still
    /// in flight. `cancel_current_analysis` blocks on the run so that the caller can change files
    /// afterwards: an analysis still running then would complete with the old content after its
    /// file was invalidated, and stay cached. The file's analysis is held open here, so a run
    /// that abandoned it on cancellation would finish while it is still pending.
    #[test]
    fn cancelled_run_under_synchronous_host_waits_for_in_flight_analysis() {
        let analyzer = analyzer(&[
            (
                "/project/tsconfig.json",
                r#"{"files": ["c1.component.ts"]}"#,
            ),
            ("/project/c1.component.ts", COMPONENT),
        ]);
        let engine = analyzer.engine.clone();
        assert!(engine.is_synchronous_host());

        let token = CancellationToken::new();
        let (event_sender, event_receiver) = mpsc::channel::<CoordinatorEvent>(100);
        let (release_sender, release_receiver) = oneshot::channel::<()>();
        let release = release_receiver.shared();
        let started = Arc::new(AtomicBool::new(false));
        let finished = Arc::new(AtomicBool::new(false));

        let local_engine = engine.clone();
        let local_started = started.clone();
        let local_finished = finished.clone();
        let local_analyzer = move |path: PathBuf| {
            let engine = local_engine.clone();
            let release = release.clone();
            let started = local_started.clone();
            let finished = local_finished.clone();
            async move {
                started.store(true, Ordering::SeqCst);
                let _ = release.await;
                let file_id = engine.intern_path(path);
                let syntax = QueryContext::new(engine).analyze_file_syntax(file_id).await;
                finished.store(true, Ordering::SeqCst);
                syntax
            }
            .boxed()
        };
        let processor_engine = engine.clone();
        let processor = move |_path: PathBuf, local: Arc<FileData>| {
            let engine = processor_engine.clone();
            async move {
                let wire = QueryContext::new(engine)
                    .analyze_file_wire(local.file_id, true)
                    .await;
                (*wire).clone()
            }
            .boxed()
        };
        let mut run = get_global_pool()
            .spawn_with_handle(run_coordinator(
                engine.clone(),
                engine.entrypoints.read().unwrap().clone(),
                get_global_pool().clone(),
                event_receiver,
                event_sender,
                local_analyzer,
                processor,
                token.clone(),
                None,
                true,
                true,
                false,
            ))
            .unwrap();

        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
        while !started.load(Ordering::SeqCst) {
            assert!(
                std::time::Instant::now() < deadline,
                "timed out waiting for the file's analysis to start"
            );
            std::thread::sleep(std::time::Duration::from_micros(200));
        }

        // Cancel while the analysis is held open, and give a run that abandons it time to finish.
        token.cancel();
        std::thread::sleep(std::time::Duration::from_millis(100));
        assert!(
            (&mut run).now_or_never().is_none(),
            "a cancelled run must not finish while a file's analysis is in flight"
        );
        assert!(!finished.load(Ordering::SeqCst));

        release_sender.send(()).unwrap();
        futures::executor::block_on(run);
        assert!(
            finished.load(Ordering::SeqCst),
            "the run must wait for the analysis it started"
        );
    }

    #[test]
    fn test_checked_synchronous_apis_reject_async_host() {
        use crate::host::{
            AnalysisHost, HostError, HostFuture, LoadKind, LoadedModule, ModuleId, ResolveRequest,
            ResolvedModule, ResolvedResourceId, ResourceKind, SYNC_HOST_REQUIRED_MSG,
        };

        struct AsyncStubHost;

        impl AnalysisHost for AsyncStubHost {
            fn resolve(
                &self,
                _req: ResolveRequest,
            ) -> HostFuture<Result<Option<ResolvedModule>, HostError>> {
                futures::future::pending().boxed()
            }

            fn load(
                &self,
                _id: &ModuleId,
                _kind: LoadKind,
                _external: bool,
            ) -> HostFuture<Result<Option<LoadedModule>, HostError>> {
                futures::future::pending().boxed()
            }

            fn resolve_resource(
                &self,
                _containing: &ModuleId,
                _url: &str,
                _kind: ResourceKind,
            ) -> HostFuture<Result<Option<ResolvedResourceId>, HostError>> {
                futures::future::pending().boxed()
            }
        }

        let mut analyzer = Analyzer::new_core(AnalyzerOptions::default()).unwrap();
        let entrypoints = Arc::new(RwLock::new(Vec::new()));
        analyzer.engine = crate::query::QueryEngine::new_default_with_host(
            Arc::new(AsyncStubHost),
            analyzer.resource_registry.clone(),
            entrypoints,
        );

        assert!(!analyzer.is_synchronous_host());
        assert_eq!(
            analyzer.ensure_synchronous_host().unwrap_err(),
            SYNC_HOST_REQUIRED_MSG
        );
        assert_eq!(
            analyzer
                .get_file_content_core("/project/app.ts".to_string())
                .unwrap_err(),
            SYNC_HOST_REQUIRED_MSG
        );
        assert_eq!(
            analyzer
                .get_metadata_for_file_checked("/project/app.ts".to_string())
                .unwrap_err(),
            SYNC_HOST_REQUIRED_MSG
        );
        assert_eq!(
            analyzer
                .read_resource_checked("/project/app.ts".to_string(), "./app.css".to_string())
                .unwrap_err(),
            SYNC_HOST_REQUIRED_MSG
        );
    }
}
