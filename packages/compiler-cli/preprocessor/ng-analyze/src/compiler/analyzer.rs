use crate::fs::OverlayFileSystem;
use crate::query::{FileId, QueryContext};
use crate::resource_loader::ResourceResolverFs;
use crate::resource_registry::ResourceRegistry;
use crate::tsconfig_resolution;
use crate::utils::{create_resolver_with_fs, is_ts_file, is_ts_source};
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

    tsconfig_path: PathBuf,
    entrypoints: Arc<RwLock<Vec<PathBuf>>>,
    current_cancel_token: RwLock<Option<CancellationToken>>,
    eager_cancel_token: RwLock<Option<CancellationToken>>,
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
        let tsconfig_path = options.tsconfig_path;
        let node_modules_path_override = options.node_modules_path_override;

        let path = PathBuf::from(&tsconfig_path);
        let resolved_config = tsconfig_resolution::load_and_resolve_tsconfig(&path, &fs)
            .map_err(|e| e.to_string())?;

        fs.set_preserve_symlinks(resolved_config.preserve_symlinks);

        let base_dir = path.parent().unwrap_or(Path::new("."));
        let mut abs_dirs = Vec::new();
        if let Some(dirs) = resolved_config.compiler_options.root_dirs {
            abs_dirs = dirs
                .into_iter()
                .map(|d| if d.is_absolute() { d } else { base_dir.join(d) })
                .collect();
        }
        if abs_dirs.is_empty() {
            abs_dirs.push(base_dir.to_path_buf());
        }
        fs.set_root_dirs(abs_dirs.clone());
        let entrypoints: Vec<PathBuf> = resolved_config
            .files
            .into_iter()
            .map(|p| fs.canonicalize(&p).unwrap_or(p))
            .filter(|p| is_ts_file(p))
            .collect();

        let entrypoints_lock = Arc::new(RwLock::new(entrypoints));

        let eager_cancel_token = CancellationToken::new();

        let resource_registry = Arc::new(ResourceRegistry::default());

        let resolver = Arc::new(create_resolver_with_fs(
            &path,
            fs.clone(),
            resolved_config.preserve_symlinks,
            node_modules_path_override.clone(),
        ));

        let workspace_name = options.workspace_name.or(resolved_config.workspace_name);
        let root_dirs = match options.root_dirs {
            Some(custom_roots) => custom_roots
                .into_iter()
                .map(|d| {
                    let p = PathBuf::from(d);
                    if p.is_absolute() {
                        p
                    } else {
                        base_dir.join(p)
                    }
                })
                .collect(),
            None => abs_dirs.clone(),
        };

        let reference_strategy: Arc<dyn crate::analyzer::import_emit::ReferenceEmitStrategy> =
            match workspace_name {
                Some(ws) => Arc::new(crate::analyzer::import_emit::PrefixImportStrategy::new(
                    ws, root_dirs,
                )),
                None => Arc::new(crate::analyzer::import_emit::ApfImportStrategy::new()),
            };

        let engine = crate::query::QueryEngine::new_with_options(
            fs.clone(),
            resolver.clone(),
            resource_registry.clone(),
            entrypoints_lock.clone(),
            reference_strategy,
            resolved_config.generate_extra_imports_in_local_mode,
            resolved_config.compile_non_exported_classes,
        );

        let analyzer = Analyzer {
            resource_registry,
            fs,
            engine,
            #[cfg(not(target_arch = "wasm32"))]
            active_handles: Arc::new(RwLock::new(Vec::new())),
            tsconfig_path: path,
            entrypoints: entrypoints_lock,
            current_cancel_token: RwLock::new(None),
            eager_cancel_token: RwLock::new(Some(eager_cancel_token.clone())),
        };

        Ok(analyzer)
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
        let mut eager_token_write = self.eager_cancel_token.write().unwrap();
        if let Some(token) = eager_token_write.take() {
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

    #[cfg(not(target_arch = "wasm32"))]
    pub fn wait_for_analysis(&self) {
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
        let mut evicted: Vec<String> = self
            .engine
            .invalidate_file(path)
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

        self.re_resolve_entrypoints();
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

        self.re_resolve_entrypoints();
        Ok(dedup_preserving_order(ts_paths_to_invalidate))
    }

    fn re_resolve_entrypoints(&self) {
        if let Ok(resolved_config) =
            tsconfig_resolution::load_and_resolve_tsconfig(&self.tsconfig_path, &self.fs)
        {
            let entrypoints: Vec<PathBuf> = resolved_config
                .files
                .into_iter()
                .map(|p| self.fs.canonicalize(&p).unwrap_or(p))
                .filter(|p| is_ts_file(p))
                .collect();
            *self.entrypoints.write().unwrap() = entrypoints;
        }
    }
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
        let cx = crate::analyzer::WireContext {
            mode: crate::analyzer::WireMode::Semantic,
            source_text: &source_text,
            converter: &file_data.converter,
            reference_strategy: &*self.engine.reference_strategy,
            path_lookup: Some(&path_lookup),
            declaring_exports: &declaring_exports,
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

        let processor = move |file_path: PathBuf, _local_res: FileData| {
            let engine = engine_clone.clone();
            let cancel_token = cancel_token_clone.clone();

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
                    };
                    (semantic_res.to_wire(&cx), chunk_info)
                } else {
                    let mut syntax_res = _local_res;
                    // ngtsc's local compilation still resolves imported `selector`/`styles` constants.
                    // TODO(parity): unresolvable imports should report NG11001, not NG1010.
                    for class in &mut syntax_res.classes {
                        class.complete_selector(&ctx).await;
                        class.complete_styles(&ctx).await;
                    }
                    // Must run before `validate()`, `extract_chunk_info` and `to_wire()`: it sets
                    // the extra imports and `declaring_ng_module` they read.
                    if engine.generate_extra_imports_in_local_mode {
                        engine
                            .populate_local_compilation_extra_imports(&mut syntax_res, &ctx)
                            .await;
                    }
                    syntax_res.validate();
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
                        path: path.clone(),
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

    for entry in entrypoints {
        if cancel_token.is_cancelled() {
            break;
        }
        if !is_ts_file(&entry) {
            continue;
        }
        // Dedupe on the case-folded path, but keep the caller's spelling.
        if seen.insert(crate::fs::normalize_path(&entry).into_owned()) {
            pending_tasks.push(spawn_file_task(entry));
        }
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
                    CoordinatorEvent::DepsDiscovered { deps, .. } => {
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
                    CoordinatorEvent::DepsDiscovered { deps, .. } => {
                        for dep in deps {
                            if cancel_token.is_cancelled() {
                                break;
                            }
                            if !seen.insert(crate::fs::normalize_path(&dep).into_owned()) {
                                continue;
                            }
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

    let remaining_states: Vec<_> = uf.states.drain().map(|(_, state)| state).collect();
    for state in remaining_states {
        if let Some(snd) = &final_sender {
            let files: Vec<crate::AnalysisResult> = state.completed.into_values().collect();
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
        path: PathBuf,
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
            crate::analyzer::DecoratorData::NgModule(m) => {
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
        let files: Vec<_> = state
            .members
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
            let cx = crate::analyzer::WireContext {
                mode: crate::analyzer::WireMode::Semantic,
                source_text: &source_text,
                converter: &semantic.converter,
                reference_strategy: &*engine.reference_strategy,
                path_lookup: Some(&path_lookup),
                declaring_exports: &declaring_exports,
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
            tsconfig_path: "/project/tsconfig.json".to_string(),
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
