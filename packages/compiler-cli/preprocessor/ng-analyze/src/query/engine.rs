use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, RwLock};

use crate::ResourceResolverFs;
use futures::future::{BoxFuture, FutureExt};
use oxc_resolver::ResolverGeneric;
use tracing::Instrument;

use crate::analyzer::DecoratorData;
use crate::compiler::async_compiler::spawn_shared;
use crate::compiler::decorators::component::{
    optimize_component, optimize_directive, populate_local_component_extra_imports,
};
use crate::compiler::decorators::ng_module::optimize_ng_module;

use crate::query::keys::{CachedResult, QueryKey, QueryValue};
use crate::query::{FileId, FileIdInterner, QueryContext};
use crate::resource_registry::ResourceRegistry;
use crate::utils::is_ts_source;
use crate::{ClassInfo, FileData, NgModuleComponentMap};

/// Cheap-to-clone handle to the [`QueryEngine`] that is captured into every query body. Sub-queries
/// are requested through this handle (`ctx.analyze_file_semantic(p).await`) instead of threading
/// `host`/`resource_registry`/`file_analysis` through every call.
pub type QueryCtx = Arc<QueryEngine>;

/// The file inside `@angular/core` that re-exports the runtime symbols generated code needs, and
/// that core's own compilation imports instead of `@angular/core` (`packages/core/src/r3_symbols.ts`).
const R3_SYMBOLS_FILE_NAME: &str = "r3_symbols.ts";

/// A pseudo [`FileId`] standing for the compilation root list. Queries that read the roots record
/// it as a dependency, so replacing the roots ([`QueryEngine::invalidate_roots`]) evicts exactly
/// those queries and everything derived from them through the reverse index. It is never
/// interned, so it never maps to a path.
pub(crate) const ROOTS_FILE_ID: FileId = FileId::MAX;

/// A pseudo [`FileId`] standing for the files a module specifier could have resolved to but did
/// not, because they did not exist (TypeScript's "failed lookup locations"). Queries in which a
/// specifier failed to resolve record it as a dependency, so creating or deleting a file
/// ([`QueryEngine::invalidate_module_resolution`]) re-runs exactly those. Never interned.
pub(crate) const UNRESOLVED_IMPORTS_FILE_ID: FileId = FileId::MAX - 1;

/// A pseudo [`FileId`] standing for which root, if any, is `r3_symbols.ts` (the fallback of
/// [`QueryEngine::r3_symbols_file`]). Queries that read it record it as a dependency, so roots
/// that add, remove or replace that file ([`QueryEngine::invalidate_r3_symbols_root`]) re-run
/// exactly those, while other root changes leave them cached. Never interned.
pub(crate) const R3_SYMBOLS_ROOT_FILE_ID: FileId = FileId::MAX - 2;

// Pseudo IDs must stay above `MAX_INTERNED_FILE_ID`, the largest ID `FileIdInterner` allocates, so
// they never collide with interned files.
const _: () = {
    use crate::query::file_id::MAX_INTERNED_FILE_ID;
    assert!(ROOTS_FILE_ID > MAX_INTERNED_FILE_ID);
    assert!(UNRESOLVED_IMPORTS_FILE_ID > MAX_INTERNED_FILE_ID);
    assert!(R3_SYMBOLS_ROOT_FILE_ID > MAX_INTERNED_FILE_ID);
};

/// How many times a query is re-run because a file it read changed kind while it ran (see
/// [`QueryEngine::kind_changed`]) before its last result is returned without being cached.
const MAX_KIND_CHANGE_RERUNS: usize = 3;

/// The ambient global value names a `.d.ts` file may declare (see
/// [`extract_ambient_global_names_in_dts`]).
pub(crate) type AmbientGlobalNames = Arc<HashSet<String>>;

/// [`QueryEngine::next_ambient_global_candidate`]'s answers from position 0, valid while
/// `generation` is unchanged.
#[derive(Default)]
pub(crate) struct FirstAmbientGlobalCandidates {
    generation: u64,
    candidates: HashMap<String, Option<(usize, FileId)>>,
}

impl FirstAmbientGlobalCandidates {
    fn clear(&mut self) {
        self.generation += 1;
        self.candidates.clear();
    }
}

/// The unified query engine.
///
/// Every "question" the analyzer answers is a [`QueryKey`]; [`QueryEngine::query`] returns a cached,
/// self-driving handle (the body is spawned onto the executor the moment the key is first
/// requested, so `join_all` over several queries fans out across pool threads). The engine owns the
/// ambient analysis state (`host`, `resource_registry`, `entrypoints`) so query bodies don't have
/// to thread it; the cross-file symbol table lives on the `AnalyzeFileSyntax` results.
pub struct QueryEngine {
    pub(crate) host: Arc<dyn crate::host::AnalysisHost>,
    pub(crate) resource_registry: Arc<ResourceRegistry>,
    pub(crate) entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
    pub(crate) tsconfig_dts_files: RwLock<Vec<PathBuf>>,
    pub(crate) interner: Arc<FileIdInterner>,
    pub(crate) resolution_cache: crate::query::resolution_cache::ResolutionCache,
    pub(crate) reverse_index: RwLock<HashMap<FileId, HashSet<QueryKey>>>,
    pub(crate) cache: crate::QueryCache<QueryKey, CachedResult>,
    /// The kind epoch at which a host resolution last changed each file's
    /// [`crate::host::IdKind`]. A completing query holds the read lock while it checks this and
    /// records its dependencies, and a kind change holds the write lock while it evicts, so a query
    /// that read a file under its previous kind is either re-run or evicted.
    kind_changes: RwLock<HashMap<FileId, u64>>,
    /// Counts kind changes; only advanced under the [`Self::kind_changes`] write lock.
    kind_epoch: AtomicU64,
    pub(crate) static_import_graph: RwLock<Option<Arc<StaticImportGraph>>>,
    /// Canonical [`FileId`]s of a prefix of `tsconfig_dts_files`, extended on demand and
    /// dropped when the roots change.
    pub(crate) tsconfig_dts_file_ids: RwLock<Vec<FileId>>,
    /// The ambient global value names each `.d.ts` scanned by an ambient global lookup declares.
    pub(crate) ambient_global_names: RwLock<HashMap<FileId, AmbientGlobalNames>>,
    /// Held while a lookup scans `.d.ts` files whose names aren't cached yet, so concurrent
    /// lookups wait for that scan once rather than at every file. Async, since the scan awaits host
    /// loads while holding it.
    ambient_global_scan: futures::lock::Mutex<()>,
    /// The first candidate of each name looked up from the start of the tsconfig's `files`.
    ambient_global_first_candidates: RwLock<FirstAmbientGlobalCandidates>,
    /// The names an invalidated `.d.ts` declared in each version a lookup may have read, until
    /// [`Self::ensure_singletons_fresh`] diffs them against its current names.
    pub(crate) stale_ambient_global_names: Mutex<HashMap<FileId, Vec<AmbientGlobalNames>>>,
    pub(crate) ambient_global_dependents: RwLock<HashMap<String, HashSet<FileId>>>,
    pub(crate) ambient_global_reverse_deps: RwLock<HashMap<FileId, HashSet<String>>>,
    pub(crate) last_component_mapping: Mutex<Option<Arc<NgModuleComponentMap>>>,
    pub(crate) last_scope_registry:
        Mutex<Option<Arc<crate::query::module_scope::NgModuleScopeRegistry>>>,
    /// Files whose cached queries were evicted since the last completed stream, or `None` before
    /// the first full stream completes.
    pub(crate) dirty_wire_files: Mutex<Option<HashSet<FileId>>>,
    /// The set of `FileId`s that were part of the program in the last completed stream.
    pub(crate) last_program_files: Mutex<HashSet<FileId>>,
    pub(crate) reference_strategy: Arc<dyn crate::analyzer::import_emit::ReferenceEmitStrategy>,
    /// Explicit `r3_symbols.ts`; when unset, a root file with that name is used.
    pub(crate) r3_symbols_file: Option<PathBuf>,
    /// Cached lookup of `r3_symbols.ts` in [`Self::entrypoints`], cleared when roots change.
    pub(crate) r3_symbols_root: RwLock<Option<Option<PathBuf>>>,
    /// Whether this compilation builds `@angular/core` itself, when configured; when unset, it is
    /// detected from `r3_symbols.ts` ([`Self::is_angular_core_compilation`]).
    pub(crate) angular_core_compilation: Option<bool>,
    pub generate_extra_imports_in_local_mode: bool,
    pub compile_non_exported_classes: bool,
    pub enable_hmr: bool,
    pub strict_standalone: bool,
    pub use_poisoned_data: bool,
    pub strict_injection_parameters: bool,
    pub implicit_standalone: bool,
    pub emit_declaration_only: bool,
    pub experimental_local_compilation: bool,
}

impl QueryEngine {
    pub fn new<Fs: ResourceResolverFs + Clone + 'static>(
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
            None,
            None,
            false,
            true,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
        )
    }

    #[allow(clippy::too_many_arguments)]
    pub fn new_with_options<Fs: ResourceResolverFs + Clone + 'static>(
        fs: Fs,
        resolver: Arc<ResolverGeneric<Fs>>,
        resource_registry: Arc<ResourceRegistry>,
        entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
        reference_strategy: Arc<dyn crate::analyzer::import_emit::ReferenceEmitStrategy>,
        r3_symbols_file: Option<PathBuf>,
        angular_core_compilation: Option<bool>,
        generate_extra_imports_in_local_mode: bool,
        compile_non_exported_classes: bool,
        enable_hmr: bool,
        strict_standalone: bool,
        use_poisoned_data: bool,
        strict_injection_parameters: bool,
        implicit_standalone: bool,
        emit_declaration_only: bool,
        experimental_local_compilation: bool,
    ) -> Arc<Self> {
        let host = Arc::new(
            crate::host::DefaultFsHost::new(fs, resolver)
                .with_shared_bare_resolutions(!reference_strategy.uses_owning_reference()),
        );
        Self::new_with_host(
            host,
            resource_registry,
            entrypoints,
            reference_strategy,
            r3_symbols_file,
            angular_core_compilation,
            generate_extra_imports_in_local_mode,
            compile_non_exported_classes,
            enable_hmr,
            strict_standalone,
            use_poisoned_data,
            strict_injection_parameters,
            implicit_standalone,
            emit_declaration_only,
            experimental_local_compilation,
        )
    }

    #[allow(clippy::too_many_arguments)]
    pub fn new_with_host(
        host: Arc<dyn crate::host::AnalysisHost>,
        resource_registry: Arc<ResourceRegistry>,
        entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
        reference_strategy: Arc<dyn crate::analyzer::import_emit::ReferenceEmitStrategy>,
        r3_symbols_file: Option<PathBuf>,
        angular_core_compilation: Option<bool>,
        generate_extra_imports_in_local_mode: bool,
        compile_non_exported_classes: bool,
        enable_hmr: bool,
        strict_standalone: bool,
        use_poisoned_data: bool,
        strict_injection_parameters: bool,
        implicit_standalone: bool,
        emit_declaration_only: bool,
        experimental_local_compilation: bool,
    ) -> Arc<Self> {
        Arc::new(Self {
            host,
            resource_registry,
            entrypoints,
            tsconfig_dts_files: RwLock::new(Vec::new()),
            interner: Arc::new(FileIdInterner::new()),
            resolution_cache: crate::query::resolution_cache::ResolutionCache::new(),
            reverse_index: RwLock::new(HashMap::new()),
            cache: crate::QueryCache::new(),
            kind_changes: RwLock::new(HashMap::new()),
            kind_epoch: AtomicU64::new(0),
            static_import_graph: RwLock::new(None),
            tsconfig_dts_file_ids: RwLock::new(Vec::new()),
            ambient_global_names: RwLock::new(HashMap::new()),
            ambient_global_scan: futures::lock::Mutex::new(()),
            ambient_global_first_candidates: RwLock::new(FirstAmbientGlobalCandidates::default()),
            stale_ambient_global_names: Mutex::new(HashMap::new()),
            ambient_global_dependents: RwLock::new(HashMap::new()),
            ambient_global_reverse_deps: RwLock::new(HashMap::new()),
            last_component_mapping: Mutex::new(None),
            last_scope_registry: Mutex::new(None),
            dirty_wire_files: Mutex::new(None),
            last_program_files: Mutex::new(HashSet::new()),
            reference_strategy,
            r3_symbols_file,
            r3_symbols_root: RwLock::new(None),
            angular_core_compilation,
            generate_extra_imports_in_local_mode,
            compile_non_exported_classes,
            enable_hmr,
            strict_standalone,
            use_poisoned_data,
            strict_injection_parameters,
            implicit_standalone,
            emit_declaration_only,
            experimental_local_compilation,
        })
    }

    pub fn new_default<Fs: ResourceResolverFs + Clone + 'static>(
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

    pub fn new_default_with_host(
        host: Arc<dyn crate::host::AnalysisHost>,
        resource_registry: Arc<ResourceRegistry>,
        entrypoints: Arc<std::sync::RwLock<Vec<PathBuf>>>,
    ) -> Arc<Self> {
        Self::new_with_host(
            host,
            resource_registry,
            entrypoints,
            Arc::new(crate::analyzer::import_emit::ApfImportStrategy::new()),
            None,
            None,
            false,
            true,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
        )
    }

    pub fn intern_path(&self, path: impl AsRef<Path>) -> FileId {
        let path = path.as_ref();
        if let Some(id) = self.interner.get_if_interned(path) {
            return id;
        }
        match self.host.resolve_backing_path(path) {
            Some(backing) => self.interner.intern_path(backing),
            None => self.interner.intern_path(path),
        }
    }

    pub fn intern_module(&self, id: &str, kind: crate::host::IdKind) -> FileId {
        if kind == crate::host::IdKind::Path {
            return self.intern_path(Path::new(id));
        }
        self.interner.intern_module(id, kind)
    }

    /// Intern a module a host resolution reported. The host's `id_kind` wins over the kind the
    /// module was interned with before, and whatever was computed under that kind is evicted
    /// ([`Self::kind_changed`]).
    pub fn intern_resolved(
        &self,
        id: &crate::host::ModuleId,
        id_kind: crate::host::IdKind,
    ) -> FileId {
        self.intern_resolved_tracked(id, id_kind).0
    }

    /// [`Self::intern_resolved`], also reporting whether the host's `id_kind` replaced the kind
    /// the module was interned with before.
    fn intern_resolved_tracked(
        &self,
        id: &crate::host::ModuleId,
        id_kind: crate::host::IdKind,
    ) -> (FileId, bool) {
        let backing = match id_kind {
            crate::host::IdKind::Path => self.host.resolve_backing_path(Path::new(id.as_str())),
            crate::host::IdKind::Virtual => None,
        };
        let (file_id, previous_kind) = match backing {
            Some(backing) => self.interner.intern_authoritative(
                crate::host::ModuleId::from_path(&backing).as_str(),
                crate::host::IdKind::Path,
            ),
            None => self.interner.intern_authoritative(id.as_str(), id_kind),
        };
        let changed = previous_kind.is_some();
        if changed {
            self.kind_changed(file_id);
        }
        (file_id, changed)
    }

    pub fn validation_context(
        &self,
        mode: crate::analyzer::WireMode,
    ) -> crate::analyzer::ValidationContext {
        crate::analyzer::ValidationContext {
            mode,
            strict_standalone: self.strict_standalone,
            strict_injection_parameters: self.strict_injection_parameters,
            emit_declaration_only: self.emit_declaration_only
                && mode == crate::analyzer::WireMode::Syntax,
            experimental_local_compilation: self.experimental_local_compilation
                && mode == crate::analyzer::WireMode::Syntax,
        }
    }

    pub fn lookup_path(&self, id: FileId) -> PathBuf {
        self.interner.lookup_path(id)
    }

    /// Path of `id`, or `None` if it isn't interned (e.g. after the engine was rebuilt).
    pub fn file_path(&self, id: FileId) -> Option<String> {
        self.interner
            .try_lookup_path(id)
            .map(crate::fs::path_to_string)
    }

    pub fn lookup_id(&self, id: FileId) -> crate::host::ModuleId {
        self.interner.lookup_id(id)
    }

    pub fn lookup_kind(&self, id: FileId) -> crate::host::IdKind {
        self.interner.lookup_kind(id)
    }

    pub fn lookup_module(&self, id: FileId) -> (crate::host::ModuleId, crate::host::IdKind) {
        self.interner.lookup_module(id)
    }

    /// Resolve `req` as imported from `importer` through [`Self::resolution_cache`], asking the
    /// host only when the lookup isn't memoized. Only completed lookups are memoized, so identical
    /// lookups that overlap each reach the host. A lookup the host answers after files were
    /// created or deleted ([`Self::invalidate_module_resolution`]) is returned without being
    /// memoized, and so is a resolution that changes its target's kind ([`Self::kind_changed`]).
    ///
    /// Query code resolves through [`QueryContext::resolve_request`], which records `importer`
    /// (and [`UNRESOLVED_IMPORTS_FILE_ID`] on failure) as dependencies of the calling query.
    pub(crate) async fn resolve_request_cached(
        &self,
        importer: FileId,
        req: crate::host::ResolveRequest,
    ) -> crate::query::resolution_cache::CachedResolution {
        debug_assert_eq!(
            self.lookup_id(importer),
            req.importer,
            "`importer` keys the resolution cache and must name the module the host is asked about"
        );
        let key = crate::query::resolution_cache::ResolutionLookupKey::from_request(&req);
        if let Some(cached) = self.resolution_cache.get(importer, &key) {
            return cached;
        }
        // Read before asking the host, so that an answer which arrives after a structure change is
        // recognized as superseded and not memoized.
        let generation = self.resolution_cache.generation();
        let mut kind_changed = false;
        let outcome = match self.host.resolve(req).await {
            Ok(Some(resolved)) => {
                let (target_id, changed) =
                    self.intern_resolved_tracked(&resolved.id, resolved.id_kind);
                kind_changed = changed;
                Ok(Some((target_id, resolved)))
            }
            Ok(None) => Ok(None),
            Err(err) => Err(err),
        };
        // A resolution that changed its target's kind is not memoized. `kind_changed` discards the
        // queries that read the target, and each re-run has to ask the host again, as it did
        // before resolutions were cached, rather than be served this answer. Until a later lookup
        // is memoized, `importer` is not indexed under the target.
        if !kind_changed {
            self.resolution_cache
                .insert(importer, key, outcome.clone(), generation);
        }
        outcome
    }

    pub fn r3_symbols_file(&self) -> Option<PathBuf> {
        if let Some(explicit) = &self.r3_symbols_file {
            return Some(explicit.clone());
        }
        if let Some(cached) = self.r3_symbols_root.read().unwrap().as_ref() {
            return cached.clone();
        }
        let found = self
            .entrypoints
            .read()
            .unwrap()
            .iter()
            .find(|path| {
                path.file_name()
                    .is_some_and(|name| name == R3_SYMBOLS_FILE_NAME)
            })
            .cloned();
        *self.r3_symbols_root.write().unwrap() = Some(found.clone());
        found
    }

    /// [`Self::r3_symbols_file`], recording on `ctx` when it falls back to the roots so that the
    /// calling query re-runs once they add, remove or replace `r3_symbols.ts`.
    pub(crate) fn r3_symbols_file_tracked(&self, ctx: &QueryContext) -> Option<PathBuf> {
        if self.r3_symbols_file.is_none() {
            ctx.record_file(R3_SYMBOLS_ROOT_FILE_ID);
        }
        self.r3_symbols_file()
    }

    /// Whether this compilation builds `@angular/core` itself (ngtsc's `isCore`): the configured
    /// [`Self::angular_core_compilation`] if any, otherwise whether `r3_symbols.ts` exports
    /// `ITS_JUST_ANGULAR = true` (ngtsc's `isAngularCorePackage`), in which case the calling query
    /// depends on that file and on the roots naming it.
    /// https://github.com/angular/angular/blob/4f6d294917/packages/compiler-cli/src/ngtsc/core/src/compiler.ts#L1320-L1321
    async fn is_angular_core_compilation(&self, ctx: &QueryContext) -> bool {
        if let Some(configured) = self.angular_core_compilation {
            return configured;
        }
        let Some(r3_symbols_file) = self.r3_symbols_file_tracked(ctx) else {
            return false;
        };
        let parsed = ctx.parse_file(self.intern_path(r3_symbols_file)).await;
        let guard = parsed.lock().unwrap();
        crate::analyzer::utils::exports_its_just_angular(guard.borrow_dependent().program)
    }

    fn get_interned_file_id(&self, path: &Path) -> Option<FileId> {
        self.interner.get_if_interned(path).or_else(|| {
            self.host
                .resolve_backing_path(path)
                .and_then(|backing| self.interner.get_if_interned(backing))
        })
    }

    /// Purge every cached query that depends on `path` (file invalidation). Dropping the cached
    /// `SharedQuery` clones also cancels any still-running tasks for those keys. The component
    /// mapping is a whole-program singleton, so it is always dropped. Returns the list of evicted keys.
    pub fn invalidate_file(&self, path: &Path) -> Vec<QueryKey> {
        let Some(file_id) = self.get_interned_file_id(path) else {
            return Vec::new();
        };
        self.invalidate_file_id(file_id)
    }

    /// Record that `file_id`'s wire analysis must be re-emitted on the next delta stream.
    fn mark_file_dirty(&self, file_id: FileId) {
        if file_id == ROOTS_FILE_ID
            || file_id == UNRESOLVED_IMPORTS_FILE_ID
            || file_id == R3_SYMBOLS_ROOT_FILE_ID
        {
            return;
        }
        if let Ok(mut guard) = self.dirty_wire_files.lock() {
            if let Some(ref mut set) = *guard {
                set.insert(file_id);
            }
        }
    }

    fn remove_cached_key(&self, key: &QueryKey) -> bool {
        if let Some(fid) = key.file_id() {
            self.mark_file_dirty(fid);
        }
        self.cache.remove(key).is_some()
    }

    /// Whether `AnalyzeFileWire` for `file_id` and `is_optimized` is currently in the cache.
    pub(crate) fn has_cached_wire(&self, file_id: FileId, is_optimized: bool) -> bool {
        self.cache
            .get(&QueryKey::AnalyzeFileWire {
                file_id,
                is_optimized,
            })
            .is_some()
    }

    /// Evict what was computed for `file_id` under its previous kind, after a host resolution
    /// changed it. Queries still running aren't in the reverse index yet; when they complete,
    /// [`Self::record_dependencies`] has them re-run instead.
    ///
    /// Importers with a cached resolution to `file_id` hold a [`crate::host::ResolvedModule`]
    /// reporting the previous kind, so those resolutions and the queries derived from them are
    /// evicted too.
    fn kind_changed(&self, file_id: FileId) {
        let mut kind_changes = self.kind_changes.write().unwrap();
        let epoch = self.kind_epoch.load(Ordering::SeqCst) + 1;
        kind_changes.insert(file_id, epoch);
        let importers = self.resolution_cache.remove_deleted_target(file_id);
        // Also drops the resolutions cached for `file_id` as an importer.
        self.invalidate_file_id(file_id);
        self.evict_importers_preserving_parse(importers);
        // Publish the epoch only after the eviction, so a query that starts at it can't read a
        // result computed under the previous kind.
        self.kind_epoch.store(epoch, Ordering::SeqCst);
    }

    /// The current kind epoch, noted by a query run when it starts.
    pub(crate) fn kind_epoch(&self) -> u64 {
        self.kind_epoch.load(Ordering::SeqCst)
    }

    /// Whether one of `deps` changed kind after kind epoch `started`.
    fn changed_kind_since(
        &self,
        kind_changes: &HashMap<FileId, u64>,
        started: u64,
        deps: &HashSet<FileId>,
    ) -> bool {
        self.kind_epoch() != started
            && deps
                .iter()
                .any(|dep| kind_changes.get(dep).is_some_and(|&changed| changed > started))
    }

    /// Record `key` in the reverse index under `deps`, the dependencies of a run of `key` that
    /// started at kind epoch `started`. Returns `false` without recording anything when one of
    /// them changed kind since: the run may have read it under its previous kind.
    fn record_dependencies(&self, key: QueryKey, deps: &HashSet<FileId>, started: u64) -> bool {
        let kind_changes = self.kind_changes.read().unwrap();
        if self.changed_kind_since(&kind_changes, started, deps) {
            return false;
        }
        if let Ok(mut r_guard) = self.reverse_index.write() {
            for &file_id in deps {
                r_guard.entry(file_id).or_default().insert(key);
            }
        }
        true
    }

    /// Cache `shared` under `key` (run inline from kind epoch `started` after recording `deps`)
    /// only if none of `deps` changed kind after `started`. Holding `kind_changes.read()` across
    /// the check and insertion prevents a concurrent `kind_changed` eviction from missing `key`.
    pub(crate) fn cache_if_kind_unchanged(
        &self,
        key: QueryKey,
        shared: crate::SharedQuery<CachedResult>,
        deps: &HashSet<FileId>,
        started: u64,
    ) {
        let kind_changes = self.kind_changes.read().unwrap();
        if !self.changed_kind_since(&kind_changes, started, deps) {
            self.cache.insert(key, shared);
        }
    }

    /// Purge every cached query that depends on `file_id` using the granular reverse invalidation index.
    pub fn invalidate_file_id(&self, file_id: FileId) -> Vec<QueryKey> {
        if file_id == ROOTS_FILE_ID {
            self.tsconfig_dts_file_ids.write().unwrap().clear();
            self.ambient_global_first_candidates
                .write()
                .unwrap()
                .clear();
        }
        if file_id != ROOTS_FILE_ID
            && file_id != UNRESOLVED_IMPORTS_FILE_ID
            && file_id != R3_SYMBOLS_ROOT_FILE_ID
        {
            self.resolution_cache.remove_importer(file_id);
        }
        self.mark_ambient_global_names_stale(file_id);
        self.clear_ambient_global_dependents_for_file(file_id);
        self.mark_file_dirty(file_id);

        let mut evicted_keys = if let Ok(mut r_index) = self.reverse_index.write() {
            r_index.remove(&file_id).unwrap_or_default()
        } else {
            HashSet::new()
        };

        if !self.is_dts_read_only_by_ambient_indexes(file_id, &evicted_keys) {
            if let Ok(mut graph_guard) = self.static_import_graph.write() {
                *graph_guard = None;
            }
            // TODO(parity): avoid evicting ComponentMapping on changes that do not affect @Component/@NgModule declarations.
            evicted_keys.insert(QueryKey::ComponentMapping);
            evicted_keys.insert(QueryKey::NgModuleScopeRegistry);
            evicted_keys.insert(QueryKey::LocalExtraImports);
        }

        evicted_keys
            .into_iter()
            .filter(|key| self.remove_cached_key(key))
            .collect()
    }

    /// Whether `file_id` is a `.d.ts` file that no cached query read except the ambient module
    /// index, given the queries `evicted_keys` that depended on it. The import graph and the
    /// whole-program singletons can't depend on such a file. Ambient global lookups that only
    /// scanned it for the names it declares don't depend on it either; if those names changed,
    /// [`Self::ensure_singletons_fresh`] evicts the lookups and the singletons that read them.
    fn is_dts_read_only_by_ambient_indexes(
        &self,
        file_id: FileId,
        evicted_keys: &HashSet<QueryKey>,
    ) -> bool {
        file_id != ROOTS_FILE_ID
            && file_id != UNRESOLVED_IMPORTS_FILE_ID
            && file_id != R3_SYMBOLS_ROOT_FILE_ID
            && evicted_keys
                .iter()
                .all(|key| *key == QueryKey::AmbientModuleFiles)
            && self
                .interner
                .try_lookup_path(file_id)
                .is_some_and(|path| crate::utils::is_dts(&path))
    }

    /// Evict only the syntactic/semantic/wire queries of `path` after an external template or
    /// stylesheet it references changed, preserving `ParseFile`, `ComponentMapping`,
    /// `NgModuleScopeRegistry`, and all other files' cached queries.
    pub fn invalidate_resource_owner(&self, path: &Path) -> Vec<QueryKey> {
        let Some(file_id) = self.get_interned_file_id(path) else {
            return Vec::new();
        };
        [
            QueryKey::AnalyzeFileSyntax(file_id),
            QueryKey::AnalyzeFileEvaluated(file_id),
            QueryKey::AnalyzeFileSemantic(file_id),
            QueryKey::AnalyzeFileWire {
                file_id,
                is_optimized: true,
            },
            QueryKey::AnalyzeFileWire {
                file_id,
                is_optimized: false,
            },
        ]
        .into_iter()
        .filter(|key| self.remove_cached_key(key))
        .collect()
    }

    /// Evict semantic, scope, and wire queries that depend on any of `file_ids` when a
    /// whole-program singleton (`ComponentMapping` or `NgModuleScopeRegistry`) changes its
    /// conclusion for `file_ids`, while keeping `ParseFile` and `AnalyzeFileSyntax` cached.
    pub(crate) fn evict_semantic_dependents(&self, file_ids: impl IntoIterator<Item = FileId>) {
        let mut keys_to_evict = HashSet::new();
        let r_guard = self.reverse_index.read().ok();
        for file_id in file_ids {
            keys_to_evict.insert(QueryKey::AnalyzeFileSemantic(file_id));
            keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                file_id,
                is_optimized: true,
            });
            keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                file_id,
                is_optimized: false,
            });
            if let Some(ref r_index) = r_guard {
                if let Some(deps) = r_index.get(&file_id) {
                    for &key in deps {
                        match key {
                            QueryKey::AnalyzeFileSemantic(dep_fid) => {
                                keys_to_evict.insert(key);
                                keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                                    file_id: dep_fid,
                                    is_optimized: true,
                                });
                                keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                                    file_id: dep_fid,
                                    is_optimized: false,
                                });
                            }
                            QueryKey::AnalyzeFileWire { .. }
                            | QueryKey::NgModuleExportsScope(_)
                            | QueryKey::NgModuleImportsScope(_) => {
                                keys_to_evict.insert(key);
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
        drop(r_guard);
        for key in keys_to_evict {
            self.remove_cached_key(&key);
        }
    }

    pub(crate) fn record_ambient_global_dependent(&self, name: &str, consumer_file: FileId) {
        if self
            .ambient_global_dependents
            .read()
            .ok()
            .is_some_and(|guard| {
                guard
                    .get(name)
                    .is_some_and(|files| files.contains(&consumer_file))
            })
        {
            return;
        }
        if let Ok(mut guard) = self.ambient_global_dependents.write() {
            guard
                .entry(name.to_string())
                .or_default()
                .insert(consumer_file);
        }
        if let Ok(mut rev_guard) = self.ambient_global_reverse_deps.write() {
            rev_guard
                .entry(consumer_file)
                .or_default()
                .insert(name.to_string());
        }
    }

    fn clear_ambient_global_dependents_for_file(&self, file_id: FileId) {
        let Some(names) = self
            .ambient_global_reverse_deps
            .write()
            .ok()
            .and_then(|mut rev| rev.remove(&file_id))
        else {
            return;
        };
        let Ok(mut guard) = self.ambient_global_dependents.write() else {
            return;
        };
        for name in names {
            let remove_entry = if let Some(files) = guard.get_mut(&name) {
                files.remove(&file_id);
                files.is_empty()
            } else {
                false
            };
            if remove_entry {
                guard.remove(&name);
            }
        }
    }

    /// Keep the names an invalidated `.d.ts` declared, so [`Self::ensure_singletons_fresh`] can
    /// evict the lookups of the names it adds or removes. A `.d.ts` no lookup scanned has none.
    fn mark_ambient_global_names_stale(&self, file_id: FileId) {
        let Some(names) = self.ambient_global_names.write().unwrap().remove(&file_id) else {
            return;
        };
        self.ambient_global_first_candidates
            .write()
            .unwrap()
            .clear();
        self.stale_ambient_global_names
            .lock()
            .unwrap()
            .entry(file_id)
            .or_default()
            .push(names);
    }

    /// The consumers of every ambient global name that an invalidated `.d.ts` started or stopped
    /// declaring since a lookup scanned it.
    async fn changed_ambient_global_consumers(&self) -> HashSet<FileId> {
        let stale = std::mem::take(&mut *self.stale_ambient_global_names.lock().unwrap());
        let mut changed = HashSet::new();
        if self.ambient_global_dependents.read().unwrap().is_empty() {
            return changed;
        }
        for (file_id, versions) in stale {
            // Load the current names before taking the dependents lock, which can't be held across
            // the host load.
            let current = self.ambient_global_names(file_id).await;
            let dependents = self.ambient_global_dependents.read().unwrap();
            for name in versions
                .iter()
                .flat_map(|previous| previous.symmetric_difference(&current))
            {
                if let Some(consumers) = dependents.get(name) {
                    changed.extend(consumers.iter().copied());
                }
            }
        }
        changed
    }

    /// Evict evaluated, semantic, scope, wire, and whole-program singleton queries that depend on
    /// any of `file_ids` when the `.d.ts` files declaring an ambient global referenced by
    /// `file_ids` change, while keeping `ParseFile` and `AnalyzeFileSyntax` cached.
    pub(crate) fn evict_evaluated_dependents(&self, file_ids: impl IntoIterator<Item = FileId>) {
        let mut keys_to_evict = HashSet::new();
        let r_guard = self.reverse_index.read().ok();
        for file_id in file_ids {
            keys_to_evict.insert(QueryKey::AnalyzeFileEvaluated(file_id));
            keys_to_evict.insert(QueryKey::AnalyzeFileSemantic(file_id));
            keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                file_id,
                is_optimized: true,
            });
            keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                file_id,
                is_optimized: false,
            });
            if let Some(ref r_index) = r_guard {
                if let Some(deps) = r_index.get(&file_id) {
                    for &key in deps {
                        match key {
                            QueryKey::AnalyzeFileEvaluated(dep_fid)
                            | QueryKey::AnalyzeFileSemantic(dep_fid) => {
                                keys_to_evict.insert(QueryKey::AnalyzeFileEvaluated(dep_fid));
                                keys_to_evict.insert(QueryKey::AnalyzeFileSemantic(dep_fid));
                                keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                                    file_id: dep_fid,
                                    is_optimized: true,
                                });
                                keys_to_evict.insert(QueryKey::AnalyzeFileWire {
                                    file_id: dep_fid,
                                    is_optimized: false,
                                });
                            }
                            // `ComponentMapping` evaluates NgModule `declarations` itself.
                            QueryKey::AnalyzeFileWire { .. }
                            | QueryKey::NgModuleExportsScope(_)
                            | QueryKey::NgModuleImportsScope(_)
                            | QueryKey::ComponentMapping
                            | QueryKey::NgModuleScopeRegistry
                            | QueryKey::LocalExtraImports => {
                                keys_to_evict.insert(key);
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
        drop(r_guard);
        for key in keys_to_evict {
            self.remove_cached_key(&key);
        }
    }

    /// Evict the files whose ambient global lookups may now find a different `.d.ts`, because a
    /// `.d.ts` they scanned started or stopped declaring a name they looked up. Runs before any
    /// per-file query reads the cache, rather than from within a lookup, which could run partway
    /// through another file's query or after a delta build snapshotted its dirty files.
    ///
    /// A value change within the same `.d.ts` (`declare const COMPILED: true` → `false`) leaves its
    /// names alone; the consumer depends on that `.d.ts` directly (it parsed it to evaluate the
    /// declaration), so the ordinary invalidation evicts it.
    async fn refresh_ambient_global_lookups(&self) {
        let changed = self.changed_ambient_global_consumers().await;
        if !changed.is_empty() {
            self.evict_evaluated_dependents(changed);
        }
    }

    /// The canonical [`FileId`] of the `.d.ts` at `position` in the tsconfig's `files`, or `None`
    /// past the end. Paths are canonicalized here, on first use, rather than when the tsconfig is
    /// read, so an ambient global lookup that stops early never canonicalizes the rest.
    pub(crate) fn tsconfig_dts_file_id(&self, position: usize) -> Option<FileId> {
        if let Some(&file_id) = self.tsconfig_dts_file_ids.read().unwrap().get(position) {
            return Some(file_id);
        }
        let dts_files = self.tsconfig_dts_files.read().unwrap();
        if position >= dts_files.len() {
            return None;
        }
        let mut file_ids = self.tsconfig_dts_file_ids.write().unwrap();
        while file_ids.len() <= position {
            let path = dts_files.get(file_ids.len())?;
            let path = self.host.canonicalize_path(path).unwrap_or_else(|| path.clone());
            file_ids.push(self.intern_path(&path));
        }
        Some(file_ids[position])
    }

    /// The first `.d.ts` at or after `position` in the tsconfig's `files` that may declare ambient
    /// global value `name`, and its position. Scans in `files` order and stops at the first match,
    /// so most lookups read only a prefix of the list. Lookups from the start, which nearly all are,
    /// are memoized until a scanned `.d.ts` is invalidated or the roots change.
    pub(crate) async fn next_ambient_global_candidate(
        &self,
        name: &str,
        position: usize,
    ) -> Option<(usize, FileId)> {
        if position != 0 {
            return self.scan_for_ambient_global_candidate(name, position).await;
        }
        let generation = {
            let first = self.ambient_global_first_candidates.read().unwrap();
            if let Some(&candidate) = first.candidates.get(name) {
                return candidate;
            }
            first.generation
        };
        let candidate = self.scan_for_ambient_global_candidate(name, 0).await;
        let mut first = self.ambient_global_first_candidates.write().unwrap();
        // Skip memoizing a scan that may have read names invalidated since it started.
        if first.generation == generation {
            first.candidates.insert(name.to_string(), candidate);
        }
        candidate
    }

    async fn scan_for_ambient_global_candidate(
        &self,
        name: &str,
        mut position: usize,
    ) -> Option<(usize, FileId)> {
        while let Some((file_id, names)) = self.scanned_ambient_global_names(position) {
            if names.contains(name) {
                return Some((position, file_id));
            }
            position += 1;
        }
        let _scan = self.ambient_global_scan.lock().await;
        while let Some(file_id) = self.tsconfig_dts_file_id(position) {
            if self.ambient_global_names(file_id).await.contains(name) {
                return Some((position, file_id));
            }
            position += 1;
        }
        None
    }

    /// The `.d.ts` at `position` in the tsconfig's `files` and the names it declares, if a lookup
    /// already scanned it.
    fn scanned_ambient_global_names(
        &self,
        position: usize,
    ) -> Option<(FileId, AmbientGlobalNames)> {
        let file_id = *self.tsconfig_dts_file_ids.read().unwrap().get(position)?;
        let names = self
            .ambient_global_names
            .read()
            .unwrap()
            .get(&file_id)?
            .clone();
        Some((file_id, names))
    }

    /// The ambient global value names `file_id` declares, or none if the host can't load it.
    /// Cached per engine until the file is invalidated, and across engines while its text is
    /// unchanged.
    pub(crate) async fn ambient_global_names(&self, file_id: FileId) -> AmbientGlobalNames {
        if let Some(names) = self.ambient_global_names.read().unwrap().get(&file_id) {
            return names.clone();
        }
        let path = self.lookup_path(file_id);
        let names = match self.load_dts_file(file_id).await {
            Some(loaded) => shared_dts_parse_cache::ambient_global_names(path, &loaded.code),
            None => AmbientGlobalNames::default(),
        };
        self.ambient_global_names
            .write()
            .unwrap()
            .entry(file_id)
            .or_insert(names)
            .clone()
    }

    /// Re-evaluate whole-program singletons if they were invalidated since a previous build so
    /// any diff-based evictions happen before per-file semantic/wire queries read the cache.
    pub async fn ensure_singletons_fresh(self: &Arc<Self>, is_optimized: bool) {
        self.refresh_ambient_global_lookups().await;
        if !is_optimized && !self.generate_extra_imports_in_local_mode {
            return;
        }
        let had_mapping = self
            .last_component_mapping
            .lock()
            .map(|g| g.is_some())
            .unwrap_or(false);
        if had_mapping && self.cache.get(&QueryKey::ComponentMapping).is_none() {
            let _ = QueryContext::new(self.clone()).component_mapping().await;
        }
        if is_optimized {
            let had_registry = self
                .last_scope_registry
                .lock()
                .map(|g| g.is_some())
                .unwrap_or(false);
            if had_registry && self.cache.get(&QueryKey::NgModuleScopeRegistry).is_none() {
                let _ = QueryContext::new(self.clone())
                    .ngmodule_scope_registry()
                    .await;
            }
        }
    }

    /// Purge every cached query that read the compilation root list, after the roots changed.
    pub fn invalidate_roots(&self) -> Vec<QueryKey> {
        *self.r3_symbols_root.write().unwrap() = None;
        self.invalidate_file_id(ROOTS_FILE_ID)
    }

    /// Purge every cached query that read which root is `r3_symbols.ts`, after the roots changed
    /// that.
    pub fn invalidate_r3_symbols_root(&self) -> Vec<QueryKey> {
        *self.r3_symbols_root.write().unwrap() = None;
        self.invalidate_file_id(R3_SYMBOLS_ROOT_FILE_ID)
    }

    /// Evict every cached query derived from `importers`' module resolutions while keeping each
    /// importer's own `ParseFile` cached (its source text did not change).
    fn evict_importers_preserving_parse(
        &self,
        importers: impl IntoIterator<Item = FileId>,
    ) -> Vec<QueryKey> {
        let importers: Vec<FileId> = importers.into_iter().collect();
        if importers.is_empty() {
            return Vec::new();
        }

        if let Ok(mut graph_guard) = self.static_import_graph.write() {
            *graph_guard = None;
        }

        let mut evicted_keys = HashSet::new();
        let mut r_guard = self.reverse_index.write().ok();
        for &imp_id in &importers {
            self.mark_file_dirty(imp_id);
            evicted_keys.insert(QueryKey::AnalyzeFileSyntax(imp_id));
            evicted_keys.insert(QueryKey::AnalyzeFileEvaluated(imp_id));
            evicted_keys.insert(QueryKey::AnalyzeFileSemantic(imp_id));
            evicted_keys.insert(QueryKey::AnalyzeFileWire {
                file_id: imp_id,
                is_optimized: true,
            });
            evicted_keys.insert(QueryKey::AnalyzeFileWire {
                file_id: imp_id,
                is_optimized: false,
            });
            evicted_keys.insert(QueryKey::ModuleExportMap(imp_id));

            let Some(ref mut r_index) = r_guard else {
                continue;
            };
            let Some(deps) = r_index.get_mut(&imp_id) else {
                continue;
            };
            let parse_key = QueryKey::ParseFile(imp_id);
            let had_parse = deps.contains(&parse_key);
            for &key in deps.iter() {
                if key != parse_key {
                    evicted_keys.insert(key);
                }
            }
            deps.clear();
            if had_parse {
                deps.insert(parse_key);
            }
        }
        drop(r_guard);

        evicted_keys.insert(QueryKey::ProgramFiles);
        evicted_keys.insert(QueryKey::ComponentMapping);
        evicted_keys.insert(QueryKey::NgModuleScopeRegistry);
        evicted_keys.insert(QueryKey::LocalExtraImports);

        evicted_keys
            .into_iter()
            .filter(|key| self.remove_cached_key(key))
            .collect()
    }

    /// Evict importers whose cached module resolutions pointed to `path` before `path` was deleted.
    pub fn invalidate_deleted_file(&self, path: &Path) -> Vec<QueryKey> {
        let Some(file_id) = self.get_interned_file_id(path) else {
            return Vec::new();
        };
        let importers = self.resolution_cache.remove_deleted_target(file_id);
        self.evict_importers_preserving_parse(importers)
    }

    /// Forget module resolution results after files were created or deleted: the resolver caches
    /// whether each path it probed exists, and a specifier that failed to resolve may resolve now.
    ///
    /// Must not run while a resolution is in progress.
    pub fn invalidate_module_resolution(&self) -> Vec<QueryKey> {
        self.host.clear_cache();
        let unresolved_importers = self.resolution_cache.clear_for_structure_change();
        let mut evicted: HashSet<QueryKey> = self
            .invalidate_file_id(UNRESOLVED_IMPORTS_FILE_ID)
            .into_iter()
            .collect();
        evicted.extend(self.evict_importers_preserving_parse(unresolved_importers));
        evicted.into_iter().collect()
    }

    /// Request a query. If not already cached, the body is spawned onto the executor and a shared
    /// handle is stored; concurrent and subsequent requests reuse the same in-flight/completed task.
    pub fn query(self: &Arc<Self>, key: QueryKey) -> crate::SharedQuery<CachedResult> {
        let me = self.clone();
        let mut hit = true;
        let query = self.cache.get_or_create(key, || {
            hit = false;
            spawn_shared(me.execute(key).boxed())
        });
        if hit {
            crate::perf::count_cache_hit(key.name());
        }
        query
    }

    /// Dispatch a query key to its computation. Each arm may request sub-queries via `self`.
    pub(crate) fn execute(self: Arc<Self>, key: QueryKey) -> BoxFuture<'static, Arc<CachedResult>> {
        self.execute_run(key, 0).map(|(res, _)| res).boxed()
    }

    /// Like [`Self::execute`], also returning the kind epoch the final run started at when its
    /// dependencies were recorded (`None` if [`MAX_KIND_CHANGE_RERUNS`] was exhausted).
    pub(crate) fn execute_tracked(
        self: Arc<Self>,
        key: QueryKey,
    ) -> BoxFuture<'static, (Arc<CachedResult>, Option<u64>)> {
        self.execute_run(key, 0)
    }

    /// One run of [`Self::execute`]. A run that read a file whose kind changed while it ran is
    /// discarded and `key` re-run (`rerun` counts those), so every caller gets a result computed
    /// under the file's current kind.
    fn execute_run(
        self: Arc<Self>,
        key: QueryKey,
        rerun: usize,
    ) -> BoxFuture<'static, (Arc<CachedResult>, Option<u64>)> {
        // `kind` indexes `QueryKey::KIND_NAMES`; `key` is only formatted in perf detail mode.
        let span = tracing::info_span!(
            target: crate::perf::QUERY_TARGET,
            "query",
            kind = key.kind_index() as u64,
            file = key.file_id(),
            key = ?key,
            done = tracing::field::Empty,
        );
        let done = span.clone();
        async move {
            let started = self.kind_epoch();
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
                QueryKey::AnalyzeFileWire {
                    file_id,
                    is_optimized,
                } => Arc::new(QueryValue::Wire(
                    self.analyze_file_wire_body(file_id, is_optimized, &child_ctx)
                        .await,
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
                QueryKey::ComponentMapping => {
                    let mapping = self.component_mapping_body(&child_ctx).await;
                    if let Ok(mut prev_guard) = self.last_component_mapping.lock() {
                        if let Some(prev) = prev_guard.as_ref() {
                            let changed = mapping.changed_files(prev);
                            if !changed.is_empty() {
                                self.evict_semantic_dependents(changed);
                            }
                        }
                        *prev_guard = Some(mapping.clone());
                    }
                    Arc::new(QueryValue::ComponentMap(mapping))
                }
                QueryKey::NgModuleScopeRegistry => {
                    let registry = self.ngmodule_scope_registry_body(&child_ctx).await;
                    if let Ok(mut prev_guard) = self.last_scope_registry.lock() {
                        if let Some(prev) = prev_guard.as_ref() {
                            let changed = registry.changed_module_files(prev);
                            if !changed.is_empty() {
                                self.evict_semantic_dependents(changed);
                            }
                        }
                        *prev_guard = Some(registry.clone());
                    }
                    Arc::new(QueryValue::ScopeRegistry(registry))
                }
                QueryKey::ProgramFiles => Arc::new(QueryValue::ProgramFiles(
                    self.program_files_body(&child_ctx).await,
                )),
                QueryKey::AmbientModuleFiles => Arc::new(QueryValue::AmbientModuleFiles(
                    self.ambient_module_files_body(&child_ctx).await,
                )),
                QueryKey::LocalExtraImports => Arc::new(QueryValue::LocalExtraImports(
                    self.local_extra_imports_body(&child_ctx).await,
                )),
            };
            let deps = child_ctx.dependencies();
            let cached_res = Arc::new(CachedResult {
                value: res,
                dependencies: deps.clone(),
            });
            let cacheable_epoch = if self.record_dependencies(key, &deps, started) {
                Some(started)
            } else if rerun < MAX_KIND_CHANGE_RERUNS {
                return self.execute_run(key, rerun + 1).await;
            } else {
                // The host keeps changing the kind of a file this query reads: hand out the last
                // run's result without caching it.
                self.remove_cached_key(&key);
                None
            };
            done.record("done", true);
            (cached_res, cacheable_epoch)
        }
        .instrument(span)
        .boxed()
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn block_on_query<F: std::future::Future>(fut: F) -> F::Output {
        futures::executor::block_on(fut)
    }

    #[cfg(target_arch = "wasm32")]
    fn block_on_query<F: std::future::Future>(fut: F) -> F::Output {
        let mut fut = Box::pin(fut);
        loop {
            if let Some(value) = (&mut fut).now_or_never() {
                return value;
            }
            crate::compiler::analyzer::step_local_pool();
        }
    }

    /// Synchronously drive `AnalyzeFileSemantic(path)` to completion.
    pub fn analyze_file_semantic_blocking(
        self: &Arc<Self>,
        path: impl AsRef<Path>,
    ) -> Arc<FileData> {
        let file_id = self.intern_path(path);
        let me = self.clone();
        Self::block_on_query(async move {
            me.ensure_singletons_fresh(true).await;
            QueryContext::new(me).analyze_file_semantic(file_id).await
        })
    }

    /// Synchronously drive `AnalyzeFileWire` to completion.
    pub fn analyze_file_wire_blocking(
        self: &Arc<Self>,
        path: impl AsRef<Path>,
        is_optimized: bool,
    ) -> Arc<crate::query::keys::WireFileResult> {
        let file_id = self.intern_path(path);
        let me = self.clone();
        Self::block_on_query(async move {
            me.ensure_singletons_fresh(is_optimized).await;
            QueryContext::new(me)
                .analyze_file_wire(file_id, is_optimized)
                .await
        })
    }

    /// Synchronously drive [`QueryContext::declaring_export_names`] to completion.
    pub fn declaring_export_names_blocking(
        self: &Arc<Self>,
        file_data: &FileData,
    ) -> crate::analyzer::import_emit::DeclaringExportNames {
        Self::block_on_query(QueryContext::new(self.clone()).declaring_export_names(file_data))
    }

    pub fn parse_file_by_id_blocking(
        self: &Arc<Self>,
        file_id: FileId,
    ) -> Arc<std::sync::Mutex<crate::ParsedFile>> {
        Self::block_on_query(QueryContext::new(self.clone()).parse_file(file_id))
    }

    /// Synchronously resolve and load a component resource through [`crate::host::AnalysisHost`].
    ///
    /// Requires a synchronous host ([`crate::host::AnalysisHost::is_synchronous`]).
    pub fn read_resource_blocking(
        self: &Arc<Self>,
        containing_file: &str,
        url: &str,
        kind: crate::host::ResourceKind,
    ) -> Option<crate::ResolvedResource> {
        assert!(
            self.host.is_synchronous(),
            "synchronous APIs require a synchronous host"
        );
        let containing = self
            .get_interned_file_id(Path::new(containing_file))
            .map(|id| self.lookup_id(id))
            .unwrap_or_else(|| crate::host::ModuleId::from(containing_file));
        let host = Arc::clone(&self.host);
        let url = url.to_owned();
        Self::block_on_query(async move {
            let (resolved_path, content) = crate::analyzer::resolve_and_load_resource(
                host.as_ref(),
                &containing,
                &url,
                kind,
            )
            .await?;
            Some(crate::ResolvedResource {
                resolved_path,
                content,
            })
        })
    }

    async fn parse_file_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext,
    ) -> Arc<Mutex<crate::ParsedFile>> {
        ctx.record_file(file_id);
        let (module_id, id_kind) = self.lookup_module(file_id);
        let file_path = self.lookup_path(file_id);
        // TODO(ngp-host-h5): echo `ResolvedModule::external` instead of passing `false`, and
        // reuse inline `ResolvedModule::code` in H6.
        // TODO(ngp-host-h6): do not reuse `code` from a resolution served by `ResolutionCache`.
        // The cache memoizes the whole `ResolvedModule` and survives edits to the target, so a
        // hit carries the text the target had when it was resolved, and keeps that text alive.
        // Clear `code` before memoizing, or take it only from an answer the host just gave.
        let (source_text, host_format, cache_key) = match self
            .host
            .load(&module_id, crate::host::LoadKind::Module, false)
            .await
        {
            // Declaration files are shared by every compilation a long-lived analyzer process
            // serves (a persistent build worker analyzes one target per request, and each
            // target's program pulls in the same framework `.d.ts` files), and parsing them is
            // the bulk of a request's analysis time. Reuse the parse across analyzers while the
            // file's text is unchanged.
            Ok(Some(loaded)) => {
                let is_dts_path =
                    id_kind == crate::host::IdKind::Path && crate::utils::is_dts(&file_path);
                let cache_key =
                    is_dts_path.then(|| shared_dts_parse_cache::SourceKey::of(&loaded.code));
                if let Some(key) = &cache_key {
                    if let Some(parsed) = shared_dts_parse_cache::get(&file_path, key) {
                        return parsed;
                    }
                }
                (loaded.code.to_string(), loaded.format, cache_key)
            }
            Ok(None) => {
                // Warn before falling back to an empty parse so unreadable files are not silently skipped.
                #[allow(clippy::print_stderr)]
                {
                    eprintln!(
                        "Warning: Failed to read '{}': module not found",
                        module_id
                    );
                }
                (String::new(), None, None)
            }
            Err(e) => {
                // Warn before falling back to an empty parse so unreadable files are not silently skipped.
                #[allow(clippy::print_stderr)]
                {
                    eprintln!("Warning: Failed to read '{}': {}", module_id, e);
                }
                (String::new(), None, None)
            }
        };
        let cache_entry = cache_key.map(|key| (file_path.clone(), key));

        // TODO(ngp-host-h6): fall back to `ResolvedModule::format` when `LoadedModule::format` is `None`.
        let source_type = match id_kind {
            crate::host::IdKind::Path => oxc_span::SourceType::from_path(&file_path)
                .ok()
                .or_else(|| host_format.map(crate::host::ModuleFormat::to_oxc_source_type))
                .unwrap_or_else(oxc_span::SourceType::ts),
            crate::host::IdKind::Virtual => host_format
                .map(crate::host::ModuleFormat::to_oxc_source_type)
                .unwrap_or_else(oxc_span::SourceType::ts),
        };

        let owner = crate::ParsedFileOwner {
            file_path,
            source_text,
            allocator: oxc_allocator::Allocator::default(),
        };

        let parsed = crate::ParsedFile::new(owner, move |owner| {
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

        let counter = if crate::utils::is_dts(&parsed.borrow_owner().file_path) {
            crate::perf::Counter::DtsFilesParsed
        } else {
            crate::perf::Counter::TsFilesParsed
        };
        crate::perf::count(counter, 1);
        let parsed = Arc::new(Mutex::new(parsed));
        if let Some((path, key)) = cache_entry {
            shared_dts_parse_cache::insert(path, key, parsed.clone());
        }
        parsed
    }

    /// Syntactic single-file analysis: the complete single-file extraction — every decorated class,
    /// the materialized symbol table, and the re-export table — plus resource registration.
    async fn analyze_file_syntax_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext,
    ) -> Arc<FileData> {
        let parsed = ctx.parse_file(file_id).await;
        let (module_id, id_kind) = self.lookup_module(file_id);
        let file_path = self.lookup_path(file_id);

        let is_dts_file = match id_kind {
            crate::host::IdKind::Path => crate::utils::is_dts(&file_path),
            crate::host::IdKind::Virtual => {
                let guard = parsed.lock().unwrap();
                guard
                    .borrow_dependent()
                    .program
                    .source_type
                    .is_typescript_definition()
            }
        };

        if is_dts_file {
            let (converter, result, errors) = {
                let guard = parsed.lock().unwrap();
                let source_text = &guard.borrow_owner().source_text;
                let dep = guard.borrow_dependent();
                let converter = Arc::new(crate::utils::Utf8ToUtf16::new(source_text));
                let result = crate::analyzer::analyze_dts(
                    dep.program,
                    source_text,
                    file_id,
                    &dep.module_record,
                    &dep.semantic,
                    &converter,
                );
                (converter, result, dep.errors.clone())
            };
            let (class_index, symbol_index) =
                class_index_from_registrations(&file_path, &result.registrations);
            return Arc::new(FileData {
                file_id,
                file_path,
                converter,
                imports_end: 0,
                classes: result.classes,
                import_declarations: result.import_declarations,
                import_equals_declarations: Vec::new(),
                type_only_exports: Vec::new(),
                resolved_dependencies: Vec::new(),
                dynamic_dependencies: Vec::new(),
                class_index: Arc::new(class_index),
                symbol_index: Arc::new(symbol_index),
                di_facts: Arc::new(crate::analyzer::di_facts::index_di_facts(result.di_facts)),
                signal_facts: Arc::new(crate::analyzer::signal_facts::index_signal_facts(
                    result.signal_facts,
                )),
                function_facts: Arc::new(result.function_facts),
                file_exports: Arc::new(result.exports),
                errors,
                diagnostics: Vec::new(),
                source_file_validator_diagnostics: Vec::new(),
                signal_debug_names: Vec::new(),
                is_core: false,
                top_level_value_bindings: None,
                namespace_alias_conflicts: Vec::new(),
            });
        }

        let is_core = self.is_angular_core_compilation(ctx).await;
        let (converter, mut analysis, errors) = {
            let guard = parsed.lock().unwrap();
            let source_text = &guard.borrow_owner().source_text;
            let dep = guard.borrow_dependent();
            let converter = Arc::new(crate::utils::Utf8ToUtf16::new(source_text));
            let analysis = crate::analyzer::analyze_parsed(
                &file_path,
                file_id,
                source_text,
                dep.program,
                &dep.module_record,
                &dep.semantic,
                &converter,
                is_core,
                self.compile_non_exported_classes,
                self.enable_hmr,
                self.implicit_standalone,
            );
            (converter, analysis, dep.errors.clone())
        };

        // Resolve component resources and static/dynamic module dependencies concurrently through
        // `AnalysisHost` so async hosts can batch all single-file lookups into one wave.
        let imported_specifiers: HashSet<&str> = analysis
            .import_declarations
            .iter()
            .map(|decl| decl.specifier.as_str())
            .collect();
        let reexport_specifiers: HashSet<&str> = analysis
            .file_exports
            .named
            .iter()
            .filter(|r| !r.binds_locally)
            .map(|r| r.source.as_str())
            .chain(
                analysis
                    .file_exports
                    .wildcards
                    .iter()
                    .map(|w| w.source.as_str()),
            )
            .collect();
        let static_requests: Vec<crate::host::ResolveRequest> = {
            let mut seen = HashSet::new();
            analysis
                .static_dependencies
                .iter()
                .filter(|spec| seen.insert(spec.as_str()))
                .map(|spec| {
                    let kind = if !imported_specifiers.contains(spec.as_str())
                        && reexport_specifiers.contains(spec.as_str())
                    {
                        crate::host::ImportKind::ReExport
                    } else {
                        crate::host::ImportKind::Static
                    };
                    crate::host::ResolveRequest::new(module_id.clone(), spec.clone(), kind)
                })
                .collect()
        };
        let dynamic_requests: Vec<crate::host::ResolveRequest> = {
            let mut seen = HashSet::new();
            analysis
                .dynamic_dependencies
                .iter()
                .filter(|spec| seen.insert(spec.as_str()))
                .map(|spec| {
                    crate::host::ResolveRequest::new(
                        module_id.clone(),
                        spec.clone(),
                        crate::host::ImportKind::Dynamic,
                    )
                })
                .collect()
        };
        drop(imported_specifiers);
        drop(reexport_specifiers);

        let resolve_ts_sources = |requests: Vec<crate::host::ResolveRequest>| {
            futures::future::join_all(requests.into_iter().map(|req| async move {
                let Ok(Some((target_id, resolved))) = ctx.resolve_request(file_id, req).await
                else {
                    return None;
                };
                if resolved.external {
                    return None;
                }
                let is_program_ts_source = match resolved.id_kind {
                    crate::host::IdKind::Path => is_ts_source(Path::new(resolved.id.as_str())),
                    crate::host::IdKind::Virtual => resolved
                        .format
                        .is_some_and(crate::host::ModuleFormat::is_ts_source),
                };
                is_program_ts_source.then(|| self.lookup_path(target_id))
            }))
        };

        let (_, static_resolved, dynamic_resolved) = futures::future::join3(
            crate::analyzer::load_syntax_resources(
                &mut analysis.classes,
                self.host.as_ref(),
                &module_id,
                file_id,
            ),
            resolve_ts_sources(static_requests),
            // TODO(ngp-host-h3/h5): split `import type` / `export type` and `TSImportType` out of
            // `dynamic_dependencies` so `ResolveRequest` carries `type_only: true` and
            // `ImportKind::TypeImport`.
            resolve_ts_sources(dynamic_requests),
        )
        .await;
        let resolved_dependencies: Vec<PathBuf> = static_resolved.into_iter().flatten().collect();
        let dynamic_dependencies: Vec<PathBuf> = dynamic_resolved.into_iter().flatten().collect();

        self.resource_registry
            .register_resources(&file_path, analysis.classes.iter());

        let (class_index, symbol_index) =
            class_index_from_registrations(&file_path, &analysis.registrations);

        Arc::new(FileData {
            file_id,
            file_path,
            converter,
            imports_end: analysis.imports_end,
            classes: analysis.classes,
            import_declarations: analysis.import_declarations,
            import_equals_declarations: analysis.import_equals_declarations,
            type_only_exports: analysis.type_only_exports,
            resolved_dependencies,
            dynamic_dependencies,
            class_index: Arc::new(class_index),
            symbol_index: Arc::new(symbol_index),
            di_facts: Arc::new(crate::analyzer::di_facts::index_di_facts(analysis.di_facts)),
            signal_facts: Arc::new(crate::analyzer::signal_facts::index_signal_facts(
                analysis.signal_facts,
            )),
            function_facts: Arc::new(analysis.function_facts),
            file_exports: Arc::new(analysis.file_exports),
            errors,
            diagnostics: analysis.diagnostics,
            source_file_validator_diagnostics: analysis.source_file_validator_diagnostics,
            signal_debug_names: analysis.signal_debug_names,
            is_core: analysis.is_core,
            top_level_value_bindings: analysis.top_level_value_bindings,
            namespace_alias_conflicts: analysis.namespace_alias_conflicts,
        })
    }

    /// The syntactic result with every consumer-facing decorator field completed by the
    /// partial evaluator, and the symbol table rebuilt to match. A file with nothing waiting on
    /// another file shares the syntactic result as is.
    async fn analyze_file_evaluated_body(
        self: &Arc<Self>,
        file_id: FileId,
        ctx: &QueryContext,
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
        ctx: &QueryContext,
    ) -> Arc<FileData> {
        let local_result = ctx.analyze_file_evaluated(file_id).await;
        self.optimized_stage2(local_result.file_path.clone(), (*local_result).clone(), ctx)
            .await
    }

    async fn analyze_file_wire_body(
        self: &Arc<Self>,
        file_id: FileId,
        is_optimized: bool,
        ctx: &QueryContext,
    ) -> Arc<crate::query::keys::WireFileResult> {
        let parse_res = ctx.parse_file(file_id).await;
        let source_text = parse_res.lock().unwrap().borrow_owner().source_text.clone();
        let path_lookup = |id| self.lookup_path(id);
        let (projected, chunk_info) = if is_optimized {
            let semantic_res = ctx.analyze_file_semantic(file_id).await;
            let chunk_info =
                crate::compiler::analyzer::extract_chunk_info(&semantic_res, self, ctx).await;
            let declaring_exports = ctx.declaring_export_names(&semantic_res).await;
            let r3_symbols_path = semantic_res
                .is_core
                .then(|| self.r3_symbols_file_tracked(ctx))
                .flatten();
            let cx = crate::analyzer::WireContext {
                mode: crate::analyzer::WireMode::Semantic,
                emit_declaration_only: false,
                experimental_local_compilation: false,
                source_text: &source_text,
                converter: &semantic_res.converter,
                reference_strategy: &*self.reference_strategy,
                path_lookup: Some(&path_lookup),
                declaring_exports: &declaring_exports,
                r3_symbols_path: r3_symbols_path.as_deref(),
            };
            (semantic_res.to_wire(&cx), chunk_info)
        } else {
            let syntax = ctx.analyze_file_syntax(file_id).await;
            let mut syntax_res = (*syntax).clone();
            // ngtsc's local compilation still evaluates imported constants for `selector`,
            // `exportAs`, `template`, `styles`, `templateUrl`, `styleUrl(s)`, and host
            // bindings/listeners; only scope resolution is off.
            for class in &mut syntax_res.classes {
                class.complete_selector(ctx).await;
                class.complete_styles(ctx).await;
                class.complete_local_compilation_constants(ctx).await;
                class.complete_resource_urls(ctx).await;
                class.complete_isolated_type_tuples(ctx).await;
            }
            if self.generate_extra_imports_in_local_mode {
                self.populate_local_compilation_extra_imports(&mut syntax_res, ctx)
                    .await;
            }
            syntax_res.validate(self.validation_context(crate::analyzer::WireMode::Syntax));
            let chunk_info = if self.generate_extra_imports_in_local_mode {
                crate::compiler::analyzer::extract_chunk_info(&syntax_res, self, ctx).await
            } else {
                crate::compiler::analyzer::FileChunkInfo::default()
            };
            let declaring_exports = ctx.declaring_export_names(&syntax_res).await;
            let r3_symbols_path = syntax_res
                .is_core
                .then(|| self.r3_symbols_file_tracked(ctx))
                .flatten();
            let cx = crate::analyzer::WireContext {
                mode: crate::analyzer::WireMode::Syntax,
                emit_declaration_only: self.emit_declaration_only,
                experimental_local_compilation: self.experimental_local_compilation,
                source_text: &source_text,
                converter: &syntax_res.converter,
                reference_strategy: &*self.reference_strategy,
                path_lookup: Some(&path_lookup),
                declaring_exports: &declaring_exports,
                r3_symbols_path: r3_symbols_path.as_deref(),
            };
            (syntax_res.to_wire(&cx), chunk_info)
        };
        Arc::new((projected.map_err(|err| err.to_string()), chunk_info))
    }

    /// Tsconfig root files plus every local TS source reachable through static and dynamic imports
    /// ([`FileData::program_dependencies`], the same edges the streaming coordinator follows), in
    /// deterministic BFS order. This is the TS `Program` ngtsc analyzes: its
    /// `LocalModuleScopeRegistry` learns NgModules from any program file, not only the roots.
    /// Every walked file is a recorded dependency, since editing one can change the closure, and so
    /// is the root list itself ([`ROOTS_FILE_ID`]).
    async fn program_files_body(self: &Arc<Self>, ctx: &QueryContext) -> Arc<Vec<FileId>> {
        ctx.record_file(ROOTS_FILE_ID);
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

    /// The contents of the tsconfig `.d.ts` `file_id`, loaded through the host, or `None` if the
    /// host can't load it.
    async fn load_dts_file(&self, file_id: FileId) -> Option<crate::host::LoadedModule> {
        self.host
            .load(&self.lookup_id(file_id), crate::host::LoadKind::Module, false)
            .await
            .ok()
            .flatten()
    }

    /// Index the tsconfig's `.d.ts` files by the ambient modules they may declare, from a textual
    /// scan of each file rather than a parse, so that resolving an import against ambient modules
    /// only parses the few files that can declare it. The `.d.ts` paths are canonicalized lazily
    /// ([`Self::tsconfig_dts_file_id`]) and the files loaded through the host in a single wave.
    /// Every scanned file is a recorded dependency, since an edit to any of them may add or remove
    /// a declaration, and so is the list itself.
    async fn ambient_module_files_body(
        self: &Arc<Self>,
        ctx: &QueryContext,
    ) -> Arc<crate::query::keys::AmbientModuleFiles> {
        ctx.record_file(ROOTS_FILE_ID);
        let dts_ids: Vec<FileId> = (0..)
            .map_while(|position| self.tsconfig_dts_file_id(position))
            .collect();
        for &file_id in &dts_ids {
            ctx.record_file(file_id);
        }
        let loads = dts_ids.iter().map(|&file_id| self.load_dts_file(file_id));
        let loaded_files = futures::future::join_all(loads).await;
        let mut index = crate::query::keys::AmbientModuleFiles::new();
        for (file_id, loaded) in dts_ids.into_iter().zip(loaded_files) {
            let Some(loaded) = loaded else {
                continue;
            };
            for specifier in ambient_module_names(&loaded.code) {
                let files = index.entry(specifier.to_string()).or_default();
                if files.last() != Some(&file_id) {
                    files.push(file_id);
                }
            }
        }
        Arc::new(index)
    }

    /// Build the component → owning-NgModule mapping across every file of the program (the
    /// `ComponentMapping` singleton).
    async fn component_mapping_body(
        self: &Arc<Self>,
        ctx: &QueryContext,
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
                    let mod_ctx = QueryContext::new(self.clone());
                    mod_ctx.record_file(result.file_id);
                    let mut completed = declarations_resolved.clone();
                    completed
                        .complete_with(
                            &mod_ctx,
                            crate::analyzer::resolvers::angular_foreign_resolvers(),
                        )
                        .await;
                    if let Some(references) = completed.get_optional() {
                        let mut resolve_futures = Vec::new();
                        for r in &references {
                            resolve_futures.push((
                                r,
                                crate::query::scope::resolve_reference_async(r, &mod_ctx),
                            ));
                        }
                        let (items, futures): (Vec<_>, Vec<_>) =
                            resolve_futures.into_iter().unzip();
                        let results = futures::future::join_all(futures).await;
                        let mod_deps = mod_ctx.dependencies();
                        ctx.extend_dependencies(mod_deps.iter().copied());

                        for (r, resolved_info) in items.into_iter().zip(results) {
                            if resolved_info.is_none() {
                                continue;
                            }
                            mapping.register_declaration(r.file, r.name(), class.reference_id);
                            mapping.record_file_dependencies(r.file, mod_deps.iter().copied());
                        }
                    } else {
                        ctx.extend_dependencies(mod_ctx.dependencies());
                    }
                }
            }
        }

        Arc::new(mapping)
    }

    async fn local_extra_imports_body(
        self: &Arc<Self>,
        ctx: &QueryContext,
    ) -> Arc<crate::query::keys::LocalExtraImportsData> {
        ctx.record_file(ROOTS_FILE_ID);
        let entrypoints: Vec<PathBuf> = self.entrypoints.read().unwrap().clone();
        let entrypoints_ids: HashSet<FileId> = entrypoints
            .iter()
            .map(|path| self.intern_path(path))
            .collect();
        let mut entrypoints_set: HashSet<PathBuf> = HashSet::with_capacity(entrypoints.len() * 2);
        for path in &entrypoints {
            entrypoints_set.insert(crate::fs::normalize_path(path).into_owned());
            if let Some(canon) = self.host.canonicalize_path(path) {
                entrypoints_set.insert(crate::fs::normalize_path(&canon).into_owned());
            }
        }

        let analyze_futures = entrypoints
            .iter()
            .map(|path| ctx.analyze_file_syntax(self.intern_path(path)));
        let entrypoint_syntax = futures::future::join_all(analyze_futures).await;

        let mut candidates: Vec<(FileId, String)> = Vec::new();
        for syntax in &entrypoint_syntax {
            let ep_id = syntax.file_id;
            for class in &syntax.classes {
                let Some(ng_module) = class.as_ng_module() else {
                    continue;
                };
                if let Some(imports) = &ng_module.imports {
                    for hole in crate::evaluator::value::collect_holes(imports.raw()) {
                        if let crate::evaluator::value::IncompleteDep::Reference(target) = &hole.dep
                        {
                            candidates.push((ep_id, target.specifier.clone()));
                        }
                    }
                }
                for import_info in &ng_module.parsed_imports {
                    if let Some(source) = &import_info.import_source {
                        candidates.push((ep_id, source.clone()));
                    }
                }
            }
        }

        // Deduplicate before resolving: only completed lookups are memoized, so identical
        // candidates resolved in the same wave would each reach the host.
        let mut seen_candidates = HashSet::new();
        candidates.retain(|candidate| seen_candidates.insert(candidate.clone()));
        let resolved_candidates =
            futures::future::join_all(candidates.into_iter().map(|(ep_id, specifier)| async move {
                let resolved = ctx
                    .resolve_from_id(ep_id, &specifier, crate::host::ImportKind::Static)
                    .await;
                (ep_id, specifier, resolved)
            }))
            .await;

        let mut global_extra_imports: Vec<(FileId, String)> = Vec::new();
        for (ep_id, specifier, resolved) in resolved_candidates {
            let is_local_entrypoint = resolved.is_some_and(|(target_id, module)| {
                if entrypoints_ids.contains(&target_id) {
                    return true;
                }
                if module.id_kind != crate::host::IdKind::Path {
                    return false;
                }
                let path = Path::new(module.id.as_str());
                entrypoints_set.contains(crate::fs::normalize_path(path).as_ref())
                    || self.host.canonicalize_path(path).is_some_and(|canon| {
                        entrypoints_set.contains(crate::fs::normalize_path(&canon).as_ref())
                    })
            });
            if is_local_entrypoint {
                continue;
            }
            global_extra_imports.push((ep_id, specifier));
        }

        Arc::new(crate::query::keys::LocalExtraImportsData {
            entrypoints_ids,
            global_extra_imports,
        })
    }

    /// Populate local-compilation side-effect imports for NgModule-declared classes in
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
        ctx: &QueryContext,
    ) {
        let mut has_component_candidate = false;
        let mut has_directive_or_pipe_candidate = false;
        // Do not gate candidates on `!standalone`: in ngtsc, `LocalModuleScopeRegistry` registers
        // every entry in `@NgModule.declarations` regardless of `standalone`, and
        // `CompoundComponentScopeReader` checks `LocalModuleScopeRegistry` before
        // `StandaloneComponentScopeReader`. Classes not declared in any entrypoint `@NgModule`
        // will miss in `component_mapping` below and remain untouched.
        for class in &local_result.classes {
            match &class.decorator {
                DecoratorData::Component(_) => {
                    has_component_candidate = true;
                }
                DecoratorData::Directive(_) | DecoratorData::Pipe(_) => {
                    has_directive_or_pipe_candidate = true;
                }
                _ => {}
            }
        }

        if !has_component_candidate && !has_directive_or_pipe_candidate {
            return;
        }

        let extra_imports_data = ctx.local_extra_imports().await;
        let entrypoints_ids = &extra_imports_data.entrypoints_ids;

        if has_directive_or_pipe_candidate {
            let mapping = ctx.component_mapping_for(local_result.file_id).await;
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
                    DecoratorData::Directive(d) => {
                        d.declaring_ng_module = Some(module_ref);
                    }
                    DecoratorData::Pipe(p) => {
                        p.declaring_ng_module = Some(module_ref);
                    }
                    _ => {}
                }
            }
        }

        if !has_component_candidate {
            return;
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
                &extra_imports_data.global_extra_imports,
                entrypoints_ids,
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
        ctx: &QueryContext,
    ) -> Arc<FileData> {
        let function_facts = local_result.function_facts.clone();
        for class in &mut local_result.classes {
            let reference_id = class.reference_id;
            let class_name = class.class_name.clone();
            class.resolve_semantic(ctx).await;

            if class.super_class.is_some() {
                if let Some(comp_info) = local_result.symbol_index.get(&reference_id) {
                    let flattened =
                        crate::analyzer::flatten_class_info(comp_info.clone(), ctx).await;
                    class.flattened_fields = flattened.fields;
                    class.public_methods = flattened.public_methods;
                }
                if matches!(
                    class.decorator,
                    crate::analyzer::DecoratorData::Component(_)
                ) {
                    let fallback_own;
                    let own_signals = match class_name
                        .as_deref()
                        .and_then(|name| local_result.signal_facts.get(name))
                    {
                        Some(facts) => &facts.own,
                        None => {
                            fallback_own = crate::analyzer::signal_facts::OwnSignalFacts {
                                signal_members: class.signal_members.clone(),
                                declared_members: HashSet::new(),
                            };
                            &fallback_own
                        }
                    };
                    class.signal_members = crate::analyzer::signal_facts::flatten_signal_members(
                        own_signals,
                        reference_id,
                        class.super_class.as_ref(),
                        ctx,
                    )
                    .await;
                }
            }

            let own_facts = class_name
                .as_deref()
                .and_then(|name| local_result.di_facts.get(name));
            class.di_issues = class.inherited_ctor_issues(own_facts, ctx).await;
            let provider_issues = class.undecorated_provider_issues(ctx).await;
            class.di_issues.extend(provider_issues);
            if let Some(directive) = class.directive_part_mut() {
                for site in &mut directive.input_transforms {
                    site.resolve_issue(&function_facts, &file_path, ctx).await;
                }
            }

            if let Some(ref mut params) = class.constructor_params {
                for (index, param) in params.iter_mut().enumerate() {
                    // Skip parameters already classified by the in-file pass; re-chasing is wrong:
                    // `import type {X}` has no runtime value even if X is a class, and the chase
                    // checks exports before root bindings (`export { Foo } from './iface'; class
                    // Foo {}` would resolve to the interface).
                    let di_is_type_only = class
                        .ctor_params_di
                        .get(index)
                        .is_some_and(|di| di.type_info.is_type_only());
                    if di_is_type_only || param.is_type_only || param.is_value_verified {
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
                            SymbolValueKind::TypeOnly => {
                                param.is_type_only = true;
                                if let Some(di) = class.ctor_params_di.get_mut(index) {
                                    di.type_info = crate::analyzer::TypeRefInfo::unavailable(
                                        crate::analyzer::UnavailableValue::NoValueDeclaration {
                                            decl: None,
                                        },
                                    );
                                }
                            }
                            SymbolValueKind::Value => {
                                param.is_type_only = false;
                                param.is_value_verified = true;
                            }
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
                let mapping = ctx.component_mapping_for(reference_id.file).await;
                (
                    directive.declaring_ng_module,
                    directive.duplicate_declaring_ng_modules,
                ) = mapping.declaring_ng_modules(reference_id.file, class_name.as_deref());
                directive.duplicate_declaration_context =
                    crate::query::module_scope::duplicate_declaration_context(
                        ctx,
                        reference_id.file,
                        class_name.as_deref().unwrap_or_default(),
                        &directive.duplicate_declaring_ng_modules,
                    )
                    .await;
                optimize_directive(
                    ctx,
                    &file_path,
                    reference_id,
                    class_name.as_deref(),
                    directive,
                )
                .await;
            } else if let DecoratorData::Pipe(pipe) = &mut class.decorator {
                let mapping = ctx.component_mapping_for(reference_id.file).await;
                (
                    pipe.declaring_ng_module,
                    pipe.duplicate_declaring_ng_modules,
                ) = mapping.declaring_ng_modules(reference_id.file, class_name.as_deref());
                pipe.duplicate_declaration_context =
                    crate::query::module_scope::duplicate_declaration_context(
                        ctx,
                        reference_id.file,
                        class_name.as_deref().unwrap_or_default(),
                        &pipe.duplicate_declaring_ng_modules,
                    )
                    .await;
            }
            // Semantic invariant: no `Incomplete` survives into the semantic FileData.
            class.demote_resolved();
        }

        local_result.validate(self.validation_context(crate::analyzer::WireMode::Semantic));

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
        self.has_path_with_deps(start, target).0
    }

    pub fn has_path_with_deps(&self, start: FileId, target: FileId) -> (bool, HashSet<FileId>) {
        let mut visited = HashSet::new();
        visited.insert(start);
        if start == target {
            return (true, visited);
        }
        let mut queue = std::collections::VecDeque::new();
        queue.push_back(start);

        while let Some(current) = queue.pop_front() {
            if let Some(deps) = self.edges.get(&current) {
                for &dep in deps {
                    if dep == target {
                        visited.insert(dep);
                        return (true, visited);
                    }
                    if visited.insert(dep) {
                        queue.push_back(dep);
                    }
                }
            }
        }
        (false, visited)
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
            public_methods: reg.public_methods.clone(),
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
async fn classify_declaration(
    decl: Option<crate::evaluator::cross_file::DeclaredSymbol>,
    consumer: &Path,
    ctx: &QueryContext,
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
async fn reached_through_type_only_hop(
    decl: &crate::evaluator::cross_file::DeclaredSymbol,
    consumer: &Path,
    ctx: &QueryContext,
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
async fn namespace_is_type_only(file: &Path, name: &str, ctx: &QueryContext) -> bool {
    let parsed = ctx.parse_file(ctx.engine.intern_path(file)).await;
    let guard = parsed.lock().unwrap();
    let dep = guard.borrow_dependent();
    crate::analyzer::utils::binds_type_only(&dep.module_record, name)
        || crate::analyzer::utils::exports_type_only(dep.program, name)
}

pub fn resolve_symbol_value_kind<'a>(
    name: String,
    file_path: PathBuf,
    ctx: &'a QueryContext,
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

        let Ok(decl) = crate::evaluator::cross_file::cross_file_resolve(
            ctx,
            &file_path,
            None,
            name.clone(),
            visited,
        )
        .await
        else {
            return SymbolValueKind::Unresolved;
        };
        if decl.is_none() {
            if let Some(kind) = classify_unresolvable_import(&file_path, &name, ctx).await {
                return kind;
            }
        }
        classify_declaration(decl, &file_path, ctx).await
    }
    .boxed()
}

/// Classifies `name` when `file_path` imports it from a specifier that is no file on disk, which
/// leaves the chase nothing to follow; `None` when `name` is not such an import.
///
/// A `declare module '<specifier>'` block in one of the tsconfig's `.d.ts` files is the module
/// then. Without one the module is missing and its symbols have no value — except under
/// `@angular/*`, which unit tests omitting the `@angular/core` `.d.ts` stubs still expect to be
/// values like `ElementRef`.
async fn classify_unresolvable_import(
    file_path: &Path,
    name: &str,
    ctx: &QueryContext,
) -> Option<SymbolValueKind> {
    let syntax = ctx
        .analyze_file_syntax(ctx.engine.intern_path(file_path))
        .await;
    let (specifier, binding) = syntax.import_declarations.iter().find_map(|decl| {
        let binding = decl
            .bindings
            .iter()
            .find(|binding| binding.local == name && !binding.is_type)?;
        Some((decl.specifier.as_str(), binding))
    })?;
    if ctx
        .resolve_from_path(file_path, specifier, crate::host::ImportKind::Static)
        .await
        .is_some()
    {
        return None;
    }
    let member = binding.imported.as_deref().unwrap_or(name);
    if let Some(kind) = resolve_ambient_module_member(specifier, member, ctx).await {
        return Some(kind);
    }
    (!specifier.starts_with("@angular/")).then_some(SymbolValueKind::TypeOnly)
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

async fn resolve_qualified_symbol_value_kind(
    ns_prefix: &str,
    member_name: &str,
    file_path: PathBuf,
    ctx: &QueryContext,
    visited: &mut HashSet<(PathBuf, String)>,
) -> SymbolValueKind {
    if !visited.insert((file_path.clone(), format!("{ns_prefix}.{member_name}"))) {
        return SymbolValueKind::Unresolved;
    }

    let file_id = ctx.engine.intern_path(&file_path);
    let syntax = ctx.analyze_file_syntax(file_id).await;
    let Some(specifier) = find_namespace_import_specifier(&syntax, ns_prefix) else {
        // `ns` is a named or default import: `ns.member` is a member of the namespace the module
        // exports under that name, or of the module itself when a default import binds an
        // `export =` module.
        for decl in &syntax.import_declarations {
            for binding in &decl.bindings {
                if binding.local != ns_prefix || binding.is_type {
                    continue;
                }
                let Some(imported_ns) = binding.imported.as_deref() else {
                    continue;
                };
                let member_path = if imported_ns == "default" {
                    member_name.to_string()
                } else {
                    format!("{imported_ns}.{member_name}")
                };
                if let Some(kind) =
                    resolve_namespace_module_member(&file_path, &decl.specifier, &member_path, ctx)
                        .await
                {
                    return kind;
                }
            }
        }
        return SymbolValueKind::Unresolved;
    };

    if let Some((inner_ns, _)) = member_name.split_once('.') {
        let Some((_, target_file)) = ctx
            .resolve_from_path(&file_path, specifier, crate::host::ImportKind::Static)
            .await
        else {
            return resolve_ambient_module_member(specifier, member_name, ctx)
                .await
                .unwrap_or(SymbolValueKind::Unresolved);
        };
        // `member_name` is `inner.X`: `inner` is a namespace `target_file` exports, and one it
        // binds with `import type * as` or exports with `export type` hands on no value.
        if namespace_is_type_only(&target_file, inner_ns, ctx).await {
            return SymbolValueKind::Unresolved;
        }
        let kind =
            resolve_symbol_value_kind(member_name.to_string(), target_file.clone(), ctx, visited)
                .await;
        if kind != SymbolValueKind::Unresolved {
            return kind;
        }
        return resolve_export_equals_namespace_member(&target_file, member_name, ctx)
            .await
            .unwrap_or(SymbolValueKind::Unresolved);
    }

    if let Ok(decl_sym) = crate::evaluator::cross_file::cross_file_resolve(
        ctx,
        &file_path,
        Some(specifier),
        member_name.to_string(),
        visited,
    )
    .await
    {
        let kind = classify_declaration(decl_sym, &file_path, ctx).await;
        if kind != SymbolValueKind::Unresolved {
            return kind;
        }
    }

    resolve_namespace_module_member(&file_path, specifier, member_name, ctx)
        .await
        .unwrap_or(SymbolValueKind::Unresolved)
}

/// Classifies `member_path` as `specifier`, imported from `file_path`, exports it through the
/// module shapes `cross_file_resolve` cannot chase, since it only tracks ES module exports: a
/// `.d.ts` on disk whose exports are the members of a `declare namespace foo { ... } export = foo;`,
/// or an ambient `declare module` standing in for a specifier that is no file at all.
async fn resolve_namespace_module_member(
    file_path: &Path,
    specifier: &str,
    member_path: &str,
    ctx: &QueryContext,
) -> Option<SymbolValueKind> {
    let resolved = ctx
        .resolve_from_path(file_path, specifier, crate::host::ImportKind::Static)
        .await;
    match resolved {
        Some((_, target_file)) => {
            resolve_export_equals_namespace_member(&target_file, member_path, ctx).await
        }
        None => resolve_ambient_module_member(specifier, member_path, ctx).await,
    }
}

/// Resolves a member inside a `declare namespace N { ... } export = N;` ambient `.d.ts` file.
async fn resolve_export_equals_namespace_member(
    target_file: &Path,
    member_path: &str,
    ctx: &QueryContext,
) -> Option<SymbolValueKind> {
    let file_id = ctx.engine.intern_path(target_file);
    let parsed = ctx.parse_file(file_id).await;
    let guard = parsed.lock().unwrap();
    let dep = guard.borrow_dependent();
    let stmts = &dep.program.body;
    let scoping = dep.semantic.scoping();
    let root_scope = scoping.root_scope_id();

    if let Some(target) = export_equals_target(stmts) {
        let path = format!("{target}.{member_path}");
        if let Some(kind) = resolve_namespace_path(stmts, root_scope, scoping, &path) {
            return Some(kind);
        }
    }
    // `inner.X` may also name a namespace the file declares beside the `export =` target.
    if !member_path.contains('.') {
        return None;
    }
    resolve_namespace_path(stmts, root_scope, scoping, member_path)
}

/// Classifies `member` as the `declare module '<specifier>'` blocks in the tsconfig's `.d.ts`
/// files export it, or `None` when none of them declares the module. TS merges same-named
/// blocks, so a value declared by any of them wins, then a type, then the bare fact that the
/// module exists with exports this reader cannot see (as with a bodiless `declare module 'x';`).
async fn resolve_ambient_module_member(
    specifier: &str,
    member: &str,
    ctx: &QueryContext,
) -> Option<SymbolValueKind> {
    // Only the files the index finds a `declare module '<specifier>'` in are parsed, so a
    // specifier no file declares (a typo, an uninstalled package) costs a map lookup.
    let index = ctx.ambient_module_files().await;
    let candidates = index.get(specifier)?;
    let mut kind = None;
    for &file_id in candidates {
        let parsed = ctx.parse_file(file_id).await;
        let guard = parsed.lock().unwrap();
        let dep = guard.borrow_dependent();
        for stmt in &dep.program.body {
            let oxc_ast::ast::Statement::TSExternalModuleDeclaration(decl) = stmt else {
                continue;
            };
            if decl.id.value.as_str() != specifier {
                continue;
            }
            match resolve_in_ambient_module(decl, dep, member) {
                Some(SymbolValueKind::Value) => return Some(SymbolValueKind::Value),
                Some(SymbolValueKind::TypeOnly) => kind = Some(SymbolValueKind::TypeOnly),
                _ => kind = kind.or(Some(SymbolValueKind::Unresolved)),
            }
        }
    }
    kind
}

/// The quoted names following each `module` keyword in `source`, which covers every
/// `declare module '<specifier>'` without parsing. Over-matching (say, inside a comment) only
/// adds a candidate file that the AST check then rejects.
fn ambient_module_names(source: &str) -> impl Iterator<Item = &str> {
    const KEYWORD: &str = "module";
    let is_ident = |c: char| c.is_alphanumeric() || c == '_' || c == '$';
    source.match_indices(KEYWORD).filter_map(move |(start, _)| {
        if source[..start].chars().next_back().is_some_and(is_ident) {
            return None;
        }
        let rest = source[start + KEYWORD.len()..].trim_start();
        let quote = rest.chars().next().filter(|c| matches!(c, '\'' | '"'))?;
        let body = &rest[1..];
        let name = &body[..body.find(quote)?];
        (!name.contains('\n')).then_some(name)
    })
}

/// Whether a `.d.ts` file is an external ES/CJS module (so its top-level declarations are
/// module-scoped rather than ambient globals), matching TypeScript's `isExternalModule` /
/// `isAnExternalModuleIndicatorNode`.
///
/// Do not rely on `module_record.has_module_syntax` alone:
/// - `import x = require('foo')` (`Statement::TSImportEqualsDeclaration` with an external module
///   reference) leaves `has_module_syntax == false` in `oxc_parser`, while TypeScript treats it as
///   an external module indicator.
/// - UMD `export as namespace Foo;` (`Statement::TSNamespaceExportDeclaration`) sets
///   `has_module_syntax == true` in `oxc_parser`, while TypeScript does not treat it alone as an
///   external module indicator.
pub(crate) fn is_external_module_dts(
    program: &oxc_ast::ast::Program<'_>,
    module_record: &oxc_syntax::module_record::ModuleRecord<'_>,
) -> bool {
    use oxc_ast::ast::Statement;

    if !module_record.import_metas.is_empty() {
        return true;
    }
    program.body.iter().any(|stmt| match stmt {
        Statement::ImportDeclaration(_)
        | Statement::ExportAllDeclaration(_)
        | Statement::ExportDefaultDeclaration(_)
        | Statement::ExportDeclaration(_)
        | Statement::ExportNamedDeclaration(_)
        | Statement::ExportFromDeclaration(_)
        | Statement::TSExportAssignment(_) => true,
        Statement::TSImportEqualsDeclaration(decl) => decl.module_reference.is_external(),
        _ => false,
    })
}

fn declaration_of_stmt<'s, 'a>(
    stmt: &'s oxc_ast::ast::Statement<'a>,
) -> Option<&'s oxc_ast::ast::Declaration<'a>> {
    match stmt {
        oxc_ast::ast::Statement::ExportDeclaration(export) => Some(&export.declaration),
        other => other.as_declaration(),
    }
}

fn collect_ambient_value_decls_in_stmts(
    stmts: &[oxc_ast::ast::Statement<'_>],
    names: &mut HashSet<String>,
) {
    use oxc_ast::ast::Declaration;

    let mut record = |name: &str| {
        if !names.contains(name) {
            names.insert(name.to_string());
        }
    };
    for stmt in stmts {
        let Some(decl) = declaration_of_stmt(stmt) else {
            continue;
        };
        match decl {
            Declaration::VariableDeclaration(var_decl) => {
                for declarator in &var_decl.declarations {
                    for ident in declarator.id.get_binding_identifiers() {
                        record(ident.name.as_str());
                    }
                }
            }
            Declaration::FunctionDeclaration(func) => {
                if let Some(id) = &func.id {
                    record(id.name.as_str());
                }
            }
            Declaration::ClassDeclaration(class) => {
                if let Some(id) = &class.id {
                    record(id.name.as_str());
                }
            }
            Declaration::TSEnumDeclaration(en) => {
                record(en.id.name.as_str());
            }
            Declaration::TSNamespaceDeclaration(ns) => {
                record(ns.id.name.as_str());
            }
            _ => {}
        }
    }
}

/// Extract candidate ambient global value declaration names in `program`.
///
/// Checks [`is_external_module_dts`] first before recording top-level script declarations, and
/// always indexes declarations inside `declare global { ... }` blocks (both at top level and
/// nested inside `declare module '...' { global { ... } }`). `driver::resolve_ambient_global`
/// parses only candidate files on demand and verifies `SymbolFlags::Value` via `oxc_semantic`.
fn extract_ambient_global_names_in_dts(
    program: &oxc_ast::ast::Program<'_>,
    module_record: &oxc_syntax::module_record::ModuleRecord<'_>,
) -> HashSet<String> {
    use oxc_ast::ast::Statement;

    let mut names = HashSet::new();

    if !is_external_module_dts(program, module_record) {
        collect_ambient_value_decls_in_stmts(&program.body, &mut names);
    }

    for stmt in &program.body {
        match stmt {
            Statement::TSGlobalDeclaration(global_decl) => {
                collect_ambient_value_decls_in_stmts(&global_decl.body.body, &mut names);
            }
            Statement::TSExternalModuleDeclaration(mod_decl) => {
                let Some(block) = &mod_decl.body else {
                    continue;
                };
                for inner in &block.body {
                    let Statement::TSGlobalDeclaration(global_decl) = inner else {
                        continue;
                    };
                    collect_ambient_value_decls_in_stmts(&global_decl.body.body, &mut names);
                }
            }
            _ => {}
        }
    }

    names
}

/// Classifies `member` as the ambient module `decl` exports it.
fn resolve_in_ambient_module(
    decl: &oxc_ast::ast::TSExternalModuleDeclaration<'_>,
    dep: &crate::ParsedFileDependent<'_>,
    member: &str,
) -> Option<SymbolValueKind> {
    let block = decl.body.as_ref()?;
    let scope = decl.scope_id.get()?;
    let stmts = &block.body;
    let path = match (export_equals_target(stmts), member) {
        (Some(target), "default") => target,
        (Some(target), member) => format!("{target}.{member}"),
        (None, "default") => default_export_name(stmts)?,
        (None, member) => member.to_string(),
    };
    let path = expand_import_equals(stmts, &path);
    let scoping = dep.semantic.scoping();
    resolve_namespace_path(stmts, scope, scoping, &path).or_else(|| {
        resolve_namespace_path(&dep.program.body, scoping.root_scope_id(), scoping, &path)
    })
}

/// Classifies the binding `path` names: `A.B.X` is `X` in the namespaces `A.B` that `stmts`
/// declare, a bare `X` a binding of `scope` itself. `None` when nothing binds it, or only
/// something without a value of its own, like an `import X = ...` alias.
fn resolve_namespace_path(
    stmts: &[oxc_ast::ast::Statement<'_>],
    scope: oxc_syntax::scope::ScopeId,
    scoping: &oxc_semantic::Scoping,
    path: &str,
) -> Option<SymbolValueKind> {
    use oxc_syntax::symbol::SymbolFlags;

    let (namespaces, leaf) = path.rsplit_once('.').unwrap_or(("", path));
    let mut scopes = Vec::new();
    let mut has_import_equals = false;
    if namespaces.is_empty() {
        scopes.push(scope);
        has_import_equals = contains_import_equals(stmts);
    } else {
        let namespaces: Vec<&str> = namespaces.split('.').collect();
        collect_namespace_scopes(stmts, &namespaces, &mut scopes, &mut has_import_equals);
    }
    // Same-named namespace declarations merge, so the leaf's flags are the union over all of them.
    let flags = scopes
        .into_iter()
        .filter_map(|scope_id| scoping.get_binding(scope_id, leaf.into()))
        .map(|symbol_id| scoping.symbol_flags(symbol_id))
        .reduce(|a, b| a | b)?;

    if flags.intersects(SymbolFlags::Value) && !flags.contains(SymbolFlags::ConstEnum) {
        return Some(SymbolValueKind::Value);
    }
    // A namespace that re-exports through `import X = ...` aliases may hand on values these flags do
    // not show, so its types are left unverified rather than declared type-only.
    if !has_import_equals
        && flags.intersects(
            SymbolFlags::Interface
                | SymbolFlags::TypeAlias
                | SymbolFlags::TypeParameter
                | SymbolFlags::ConstEnum,
        )
    {
        return Some(SymbolValueKind::TypeOnly);
    }
    None
}

/// The dotted name an `export = A.B;` in `stmts` assigns, if there is one.
fn export_equals_target(stmts: &[oxc_ast::ast::Statement<'_>]) -> Option<String> {
    stmts.iter().find_map(|stmt| match stmt {
        oxc_ast::ast::Statement::TSExportAssignment(assign) => {
            extract_dotted_identifier_path(&assign.expression)
        }
        _ => None,
    })
}

/// The name an `export default` in `stmts` publishes: a declaration's own, or a bare identifier.
fn default_export_name(stmts: &[oxc_ast::ast::Statement<'_>]) -> Option<String> {
    use oxc_ast::ast::ExportDefaultDeclarationKind;

    stmts.iter().find_map(|stmt| {
        let oxc_ast::ast::Statement::ExportDefaultDeclaration(export) = stmt else {
            return None;
        };
        let name = match &export.declaration {
            ExportDefaultDeclarationKind::ClassDeclaration(class) => &class.id.as_ref()?.name,
            ExportDefaultDeclarationKind::FunctionDeclaration(function) => {
                &function.id.as_ref()?.name
            }
            ExportDefaultDeclarationKind::TSInterfaceDeclaration(interface) => &interface.id.name,
            expression => match expression.as_expression()? {
                oxc_ast::ast::Expression::Identifier(ident) => &ident.name,
                _ => return None,
            },
        };
        Some(name.to_string())
    })
}

/// The `import X = ...` declaration `stmt` is, exported or not.
fn import_equals_declaration<'s, 'a>(
    stmt: &'s oxc_ast::ast::Statement<'a>,
) -> Option<&'s oxc_ast::ast::TSImportEqualsDeclaration<'a>> {
    match stmt {
        oxc_ast::ast::Statement::TSImportEqualsDeclaration(decl) => Some(decl.as_ref()),
        oxc_ast::ast::Statement::ExportDeclaration(export) => match &export.declaration {
            oxc_ast::ast::Declaration::TSImportEqualsDeclaration(decl) => Some(decl.as_ref()),
            _ => None,
        },
        _ => None,
    }
}

fn contains_import_equals(stmts: &[oxc_ast::ast::Statement<'_>]) -> bool {
    stmts
        .iter()
        .any(|stmt| import_equals_declaration(stmt).is_some())
}

/// The dotted name an `import name = A.B.C;` in `stmts` aliases, if there is one. `require()`
/// forms and type-only aliases are not followed.
fn import_equals_target(stmts: &[oxc_ast::ast::Statement<'_>], name: &str) -> Option<String> {
    let decl = stmts
        .iter()
        .filter_map(|stmt| import_equals_declaration(stmt))
        .find(|decl| decl.id.name.as_str() == name && !decl.import_kind.is_type())?;
    match &decl.module_reference {
        oxc_ast::ast::TSModuleReference::IdentifierReference(ident) => Some(ident.name.to_string()),
        oxc_ast::ast::TSModuleReference::QualifiedName(qualified) => {
            Some(crate::analyzer::utils::qualified_name_to_string(qualified))
        }
        oxc_ast::ast::TSModuleReference::ExternalModuleReference(_) => None,
    }
}

/// Rewrites the head of `path` through an `import Head = A.B.C;` alias in `stmts`, if there is one.
fn expand_import_equals(stmts: &[oxc_ast::ast::Statement<'_>], path: &str) -> String {
    let (head, rest) = path.split_once('.').unwrap_or((path, ""));
    let Some(target) = import_equals_target(stmts, head) else {
        return path.to_string();
    };
    if rest.is_empty() {
        return target;
    }
    format!("{target}.{rest}")
}

fn extract_dotted_identifier_path(expr: &oxc_ast::ast::Expression<'_>) -> Option<String> {
    match expr {
        oxc_ast::ast::Expression::Identifier(id) => Some(id.name.to_string()),
        oxc_ast::ast::Expression::StaticMemberExpression(member) => {
            let prefix = extract_dotted_identifier_path(&member.object)?;
            Some(format!("{prefix}.{}", member.property.name))
        }
        _ => None,
    }
}

fn collect_namespace_scopes<'a>(
    stmts: &'a [oxc_ast::ast::Statement<'a>],
    path: &[&str],
    out: &mut Vec<oxc_syntax::scope::ScopeId>,
    has_import_equals: &mut bool,
) {
    let Some((&first, rest)) = path.split_first() else {
        return;
    };
    for stmt in stmts {
        let decl = match stmt {
            oxc_ast::ast::Statement::TSNamespaceDeclaration(decl) => decl.as_ref(),
            oxc_ast::ast::Statement::ExportDeclaration(export) => {
                if let oxc_ast::ast::Declaration::TSNamespaceDeclaration(decl) = &export.declaration
                {
                    decl.as_ref()
                } else {
                    continue;
                }
            }
            _ => continue,
        };
        collect_from_namespace_decl(decl, first, rest, out, has_import_equals);
    }
}

fn collect_from_namespace_decl<'a>(
    decl: &'a oxc_ast::ast::TSNamespaceDeclaration<'a>,
    expected_name: &str,
    rest: &[&str],
    out: &mut Vec<oxc_syntax::scope::ScopeId>,
    has_import_equals: &mut bool,
) {
    if decl.id.name.as_str() != expected_name {
        return;
    }
    match (&decl.body, rest.split_first()) {
        (body, None) => {
            if let Some(scope_id) = decl.scope_id.get() {
                out.push(scope_id);
            }
            if let oxc_ast::ast::TSNamespaceDeclarationBody::TSModuleBlock(block) = body {
                *has_import_equals |= contains_import_equals(&block.body);
            }
        }
        (
            oxc_ast::ast::TSNamespaceDeclarationBody::TSNamespaceDeclaration(inner),
            Some((&next, tail)),
        ) => {
            collect_from_namespace_decl(inner, next, tail, out, has_import_equals);
        }
        (oxc_ast::ast::TSNamespaceDeclarationBody::TSModuleBlock(block), Some(_)) => {
            collect_namespace_scopes(&block.body, rest, out, has_import_equals);
        }
    }
}

/// Process-wide caches of parsed `.d.ts` files and of the ambient global names they declare,
/// shared by every [`QueryEngine`] in the process.
///
/// A long-lived analyzer process (e.g. the sidecar under a persistent build worker, which creates
/// a new engine per request) would otherwise re-parse the same framework and library declaration
/// files for every compilation.
mod shared_dts_parse_cache {
    use std::collections::hash_map::DefaultHasher;
    use std::collections::HashMap;
    use std::hash::{Hash, Hasher};
    use std::path::{Path, PathBuf};
    use std::sync::{Arc, Mutex, OnceLock, PoisonError};

    use super::AmbientGlobalNames;
    use crate::ParsedFile;

    /// Upper bound on the total source text of the files cached in each cache.
    const MAX_SOURCE_BYTES: usize = 192 * 1024 * 1024;

    static CACHE: OnceLock<Mutex<Cache<Arc<Mutex<ParsedFile>>>>> = OnceLock::new();
    static GLOBAL_NAMES: OnceLock<Mutex<Cache<AmbientGlobalNames>>> = OnceLock::new();

    fn cache() -> &'static Mutex<Cache<Arc<Mutex<ParsedFile>>>> {
        CACHE.get_or_init(|| Mutex::new(Cache::new(MAX_SOURCE_BYTES)))
    }

    fn global_names() -> &'static Mutex<Cache<AmbientGlobalNames>> {
        GLOBAL_NAMES.get_or_init(|| Mutex::new(Cache::new(MAX_SOURCE_BYTES)))
    }

    /// Identifies the text a file was parsed from, so a cached parse can be validated without
    /// locking it or keeping a second copy of the text.
    #[derive(Clone, Copy, PartialEq, Eq, Debug)]
    pub(super) struct SourceKey {
        len: usize,
        hash: u64,
    }

    impl SourceKey {
        pub(super) fn of(source_text: &str) -> Self {
            let mut hasher = DefaultHasher::new();
            source_text.hash(&mut hasher);
            Self {
                len: source_text.len(),
                hash: hasher.finish(),
            }
        }
    }

    /// The cached parse of `path` if it was parsed from text matching `key`.
    pub(super) fn get(path: &Path, key: &SourceKey) -> Option<Arc<Mutex<ParsedFile>>> {
        cache()
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .get(path, key)
    }

    /// Caches `parsed`, the parse of `path` from text matching `key`, replacing any earlier parse
    /// of the same path.
    pub(super) fn insert(path: PathBuf, key: SourceKey, parsed: Arc<Mutex<ParsedFile>>) {
        cache()
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .insert(path, key, parsed);
    }

    /// The ambient global value names the `.d.ts` at `path` with text `source` declares. Cached
    /// while its text is unchanged, and extracted from its cached full parse if it has one, or
    /// else from a parse that skips the semantic model and is not kept.
    pub(super) fn ambient_global_names(path: PathBuf, source: &str) -> AmbientGlobalNames {
        let key = SourceKey::of(source);
        if let Some(names) = global_names()
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .get(&path, &key)
        {
            return names;
        }
        let names = Arc::new(match get(&path, &key) {
            Some(parsed) => {
                let guard = parsed.lock().unwrap_or_else(PoisonError::into_inner);
                let dep = guard.borrow_dependent();
                super::extract_ambient_global_names_in_dts(dep.program, &dep.module_record)
            }
            None => {
                thread_local! {
                    static ALLOCATOR: std::cell::RefCell<oxc_allocator::Allocator> =
                        std::cell::RefCell::new(oxc_allocator::Allocator::default());
                }
                ALLOCATOR.with_borrow_mut(|allocator| {
                    let names = {
                        let ret = oxc_parser::Parser::new(
                            allocator,
                            source,
                            oxc_span::SourceType::d_ts(),
                        )
                        .parse();
                        super::extract_ambient_global_names_in_dts(&ret.program, &ret.module_record)
                    };
                    allocator.reset();
                    names
                })
            }
        });
        global_names()
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .insert(path, key, names.clone());
        names
    }

    struct Entry<V> {
        value: V,
        source: SourceKey,
        last_used: u64,
    }

    /// Values derived from files' text, keyed by path and evicted least recently used first once
    /// the text they were derived from exceeds a total size.
    pub(super) struct Cache<V> {
        entries: HashMap<PathBuf, Entry<V>>,
        total_source_bytes: usize,
        max_source_bytes: usize,
        clock: u64,
    }

    impl<V: Clone> Cache<V> {
        pub(super) fn new(max_source_bytes: usize) -> Self {
            Self {
                entries: HashMap::new(),
                total_source_bytes: 0,
                max_source_bytes,
                clock: 0,
            }
        }

        pub(super) fn get(&mut self, path: &Path, key: &SourceKey) -> Option<V> {
            self.clock += 1;
            let entry = self.entries.get_mut(path)?;
            if entry.source != *key {
                self.remove(path);
                return None;
            }
            entry.last_used = self.clock;
            Some(entry.value.clone())
        }

        pub(super) fn insert(&mut self, path: PathBuf, key: SourceKey, value: V) {
            let source_len = key.len;
            // A single file this large would evict most of the cache for one entry.
            if source_len > self.max_source_bytes / 4 {
                return;
            }
            self.clock += 1;
            self.remove(&path);
            while self.total_source_bytes + source_len > self.max_source_bytes {
                let Some(lru) = self
                    .entries
                    .iter()
                    .min_by_key(|(_, entry)| entry.last_used)
                    .map(|(path, _)| path.clone())
                else {
                    break;
                };
                self.remove(&lru);
            }
            self.total_source_bytes += source_len;
            self.entries.insert(
                path,
                Entry {
                    value,
                    source: key,
                    last_used: self.clock,
                },
            );
        }

        fn remove(&mut self, path: &Path) {
            if let Some(entry) = self.entries.remove(path) {
                self.total_source_bytes -= entry.source.len;
            }
        }

        #[cfg(test)]
        pub(super) fn contains(&self, path: &Path) -> bool {
            self.entries.contains_key(path)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::create_test_fs;
    use oxc_resolver::ResolveOptions;
    use std::path::Path;

    #[test]
    fn test_ambient_module_names() {
        let source = r#"
            declare module 'single' { export const a: number; }
            declare module "double";
            declare module'tight' {}
            declare
              module   'multi-line' {}
            declare namespace module {}
            export const modules = 'not-a-module';
            submodule 'not-a-module-either';
            module.exports = 'nor-this';
        "#;
        let names: Vec<&str> = ambient_module_names(source).collect();
        assert_eq!(names, vec!["single", "double", "tight", "multi-line"]);
    }

    #[test]
    fn test_ambient_module_lookup_parses_only_declaring_files() {
        let fs = create_test_fs(&[
            (
                "/project/ambient.d.ts",
                "declare module 'ambient-pkg' { export class Client {} }",
            ),
            (
                "/project/unrelated.d.ts",
                "export declare class Unrelated {}",
            ),
        ]);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions::default(),
        ));
        let engine = QueryEngine::new_default(
            fs,
            resolver,
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        *engine.tsconfig_dts_files.write().unwrap() = vec![
            PathBuf::from("/project/ambient.d.ts"),
            PathBuf::from("/project/unrelated.d.ts"),
        ];
        let ambient_id = engine.intern_path("/project/ambient.d.ts");
        let unrelated_id = engine.intern_path("/project/unrelated.d.ts");
        let is_parsed = |file_id| engine.cache.get(&QueryKey::ParseFile(file_id)).is_some();

        let ctx = QueryContext::new(engine.clone());
        let missing = futures::executor::block_on(resolve_ambient_module_member(
            "missing-pkg",
            "Client",
            &ctx,
        ));
        assert_eq!(missing, None);
        assert!(!is_parsed(ambient_id) && !is_parsed(unrelated_id));
        // Either file may yet gain a `declare module 'missing-pkg'`.
        let deps = ctx.dependencies();
        assert!(deps.contains(&ambient_id) && deps.contains(&unrelated_id));

        let ctx = QueryContext::new(engine.clone());
        let found = futures::executor::block_on(resolve_ambient_module_member(
            "ambient-pkg",
            "Client",
            &ctx,
        ));
        assert_eq!(found, Some(SymbolValueKind::Value));
        assert!(is_parsed(ambient_id) && !is_parsed(unrelated_id));
    }

    #[test]
    fn test_ambient_global_names_and_lookup_order() {
        use futures::executor::block_on;

        let fs = create_test_fs(&[
            (
                "/project/script.d.ts",
                "type Imported = import('./other').Foo;\n\
                 type Tpl<S extends string> = `a-${S extends \"b\" ? 'c' : `d`}`;\n\
                 declare var TOKEN: import('@angular/core').InjectionToken<string>;\n\
                 declare var COMPILED: boolean;\n\
                 declare const { DESTR_A, raw: DESTR_B }: { DESTR_A: string; raw: number };\n\
                 declare function* genFn(): Generator<number>;\n\
                 declare class GlobalSvc {}\n\
                 declare enum GlobalEnum { A }\n\
                 declare namespace GlobalNs { export const X: number; }\n\
                 declare interface TypeOnlyIface {}\n",
            ),
            (
                "/project/umd.d.ts",
                "declare namespace UmdNs { export const V: string; }\n\
                 declare const UMD_GLOBAL: 'umd';\n\
                 export as namespace UmdNs;\n",
            ),
            (
                "/project/cjs.d.ts",
                "import dep = require('dep');\n\
                 declare var CJS_LOCAL: boolean;\n\
                 declare global { var CJS_GLOBAL_AUG: boolean; }\n",
            ),
            (
                "/project/esm.d.ts",
                "export {};\n\
                 declare var ESM_LOCAL: boolean;\n\
                 declare module 'some-pkg' {\n\
                   global { const NESTED_GLOBAL_AUG: 'nested'; }\n\
                 }\n",
            ),
        ]);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions::default(),
        ));
        let engine = QueryEngine::new_default(
            fs,
            resolver,
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        *engine.tsconfig_dts_files.write().unwrap() = vec![
            PathBuf::from("/project/script.d.ts"),
            PathBuf::from("/project/umd.d.ts"),
            PathBuf::from("/project/cjs.d.ts"),
            PathBuf::from("/project/esm.d.ts"),
        ];
        let script_id = engine.intern_path("/project/script.d.ts");
        let umd_id = engine.intern_path("/project/umd.d.ts");
        let cjs_id = engine.intern_path("/project/cjs.d.ts");
        let esm_id = engine.intern_path("/project/esm.d.ts");

        let ctx = QueryContext::new(engine.clone());
        let consumer_id = engine.intern_path("/project/app.ts");

        // A lookup stops at the first file that may declare the name, and depends on the roots
        // rather than on the files it scanned.
        assert_eq!(
            block_on(ctx.next_ambient_global_candidate("COMPILED", consumer_id, 0)),
            Some((0, script_id))
        );
        assert!(!engine
            .ambient_global_names
            .read()
            .unwrap()
            .contains_key(&umd_id));
        assert_eq!(
            block_on(ctx.next_ambient_global_candidate("NESTED_GLOBAL_AUG", consumer_id, 0)),
            Some((3, esm_id))
        );
        assert_eq!(
            block_on(ctx.next_ambient_global_candidate("NESTED_GLOBAL_AUG", consumer_id, 4)),
            None
        );
        assert_eq!(
            block_on(ctx.next_ambient_global_candidate("UNDECLARED", consumer_id, 0)),
            None
        );
        assert!(ctx.dependencies().contains(&ROOTS_FILE_ID));
        assert!(ctx.dependencies().contains(&consumer_id));

        // Names are extracted with a parse that is not kept as a `ParseFile`.
        for id in [script_id, umd_id, cjs_id, esm_id] {
            assert!(engine.cache.get(&QueryKey::ParseFile(id)).is_none());
            assert!(!ctx.dependencies().contains(&id));
            assert!(engine
                .ambient_global_names
                .read()
                .unwrap()
                .contains_key(&id));
        }

        let names = |id| block_on(engine.ambient_global_names(id));
        for name in [
            "TOKEN",
            "COMPILED",
            "DESTR_A",
            "DESTR_B",
            "genFn",
            "GlobalSvc",
            "GlobalEnum",
            "GlobalNs",
        ] {
            assert!(names(script_id).contains(name), "missing {name}");
        }
        assert!(!names(script_id).contains("TypeOnlyIface"));
        assert!(!names(script_id).contains("Imported"));
        assert_eq!(
            *names(umd_id),
            HashSet::from(["UMD_GLOBAL".to_string(), "UmdNs".to_string()])
        );
        assert_eq!(
            *names(cjs_id),
            HashSet::from(["CJS_GLOBAL_AUG".to_string()])
        );
        assert_eq!(
            *names(esm_id),
            HashSet::from(["NESTED_GLOBAL_AUG".to_string()])
        );
    }

    fn ambient_global_test_engine(
        files: &[(String, String)],
        dts_paths: Vec<PathBuf>,
    ) -> (Arc<QueryEngine>, crate::fs::OverlayFileSystem) {
        let fs = create_test_fs(&[]);
        for (path, content) in files {
            fs.upsert_file(PathBuf::from(path), content.clone());
        }
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".d.ts".into()],
                ..ResolveOptions::default()
            },
        ));
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            "/project/app.ts",
        )]));
        let engine = QueryEngine::new_default(
            fs.clone(),
            resolver,
            Arc::new(ResourceRegistry::default()),
            entrypoints,
        );
        *engine.tsconfig_dts_files.write().unwrap() = dts_paths;
        (engine, fs)
    }

    fn app_selector(engine: &Arc<QueryEngine>, is_optimized: bool) -> Option<String> {
        let wire = engine.analyze_file_wire_blocking("/project/app.ts", is_optimized);
        let result = wire.0.as_ref().unwrap();
        assert!(result.diagnostics.is_empty(), "{:?}", result.diagnostics);
        result.classes[0]
            .component
            .as_ref()
            .unwrap()
            .selector
            .clone()
    }

    #[test]
    fn test_ambient_global_lookup_stops_early_and_tracks_names() {
        let mut files: Vec<(String, String)> = vec![
            (
                "/project/globals.d.ts".to_string(),
                "declare const COMPILED: true;\n".to_string(),
            ),
            (
                "/project/extra.d.ts".to_string(),
                "declare interface ExtraType { id: string; }\n".to_string(),
            ),
            (
                "/project/app.ts".to_string(),
                "import { Component } from '@angular/core';\n\
                 @Component({ selector: COMPILED ? 'app-prod' : 'app-dev', template: '' })\n\
                 export class AppComp {}\n"
                    .to_string(),
            ),
        ];
        let mut dts_paths = vec![
            PathBuf::from("/project/globals.d.ts"),
            PathBuf::from("/project/extra.d.ts"),
        ];
        for i in 0..20 {
            let path = format!("/project/unrelated_{i}.d.ts");
            files.push((path.clone(), format!("declare const UNRELATED_{i}: {i};\n")));
            dts_paths.push(PathBuf::from(path));
        }
        let (engine, fs) = ambient_global_test_engine(&files, dts_paths);
        let app_id = engine.intern_path("/project/app.ts");
        let globals_id = engine.intern_path("/project/globals.d.ts");
        let extra_id = engine.intern_path("/project/extra.d.ts");
        let unrelated_0_id = engine.intern_path("/project/unrelated_0.d.ts");
        let scanned = |id| {
            engine
                .ambient_global_names
                .read()
                .unwrap()
                .contains_key(&id)
        };

        assert_eq!(app_selector(&engine, true).as_deref(), Some("app-prod"));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("app-prod"));

        // 1. The lookup of `COMPILED` stopped at `globals.d.ts`, so it never read the files after
        // it, and editing one of them evicts nothing, not even the whole-program singletons.
        assert!(scanned(globals_id));
        assert!(!scanned(extra_id));
        assert!(!scanned(unrelated_0_id));
        futures::executor::block_on(QueryContext::new(engine.clone()).component_mapping());
        fs.upsert_file(
            PathBuf::from("/project/unrelated_0.d.ts"),
            "declare const UNRELATED_0: 999;\n".to_string(),
        );
        assert_eq!(
            engine.invalidate_file(Path::new("/project/unrelated_0.d.ts")),
            Vec::new()
        );
        assert!(engine.cache.get(&QueryKey::ComponentMapping).is_some());
        futures::executor::block_on(engine.ensure_singletons_fresh(true));
        assert!(engine.has_cached_wire(app_id, true));
        assert!(engine.has_cached_wire(app_id, false));

        // 2. `app.ts` reads `FUTURE_SEL`, which no `.d.ts` declares, so its lookup scans them all.
        fs.upsert_file(
            PathBuf::from("/project/app.ts"),
            "import { Component } from '@angular/core';\n\
             @Component({ selector: FUTURE_SEL, template: '' })\n\
             export class FutureComp {}\n"
                .to_string(),
        );
        engine.invalidate_file(Path::new("/project/app.ts"));
        let before = engine.analyze_file_wire_blocking("/project/app.ts", false);
        assert!(!before.0.as_ref().unwrap().diagnostics.is_empty());
        let _ = engine.analyze_file_wire_blocking("/project/app.ts", true);
        assert!(scanned(extra_id));
        assert!(scanned(unrelated_0_id));

        // Editing a scanned `.d.ts` without changing whether it declares `FUTURE_SEL` keeps it.
        fs.upsert_file(
            PathBuf::from("/project/unrelated_0.d.ts"),
            "declare const UNRELATED_0: 1000;\ndeclare const OTHER: 1;\n".to_string(),
        );
        assert_eq!(
            engine.invalidate_file(Path::new("/project/unrelated_0.d.ts")),
            Vec::new()
        );
        futures::executor::block_on(engine.ensure_singletons_fresh(false));
        assert!(engine.has_cached_wire(app_id, true));
        assert!(engine.has_cached_wire(app_id, false));

        // 3. Declaring `FUTURE_SEL` in `extra.d.ts`, which `app.ts` scanned but never parsed.
        fs.upsert_file(
            PathBuf::from("/project/extra.d.ts"),
            "declare const FUTURE_SEL: 'app-future';\n".to_string(),
        );
        engine.invalidate_file(Path::new("/project/extra.d.ts"));
        assert!(!scanned(extra_id));
        assert!(engine.has_cached_wire(app_id, true));
        assert!(engine.has_cached_wire(app_id, false));

        // A lookup from another file's analysis rescans `extra.d.ts` without evicting anything
        // partway through that analysis...
        assert_eq!(
            futures::executor::block_on(engine.next_ambient_global_candidate("FUTURE_SEL", 0)),
            Some((1, extra_id))
        );
        assert!(engine.has_cached_wire(app_id, true));
        assert!(engine.has_cached_wire(app_id, false));

        // ...`ensure_singletons_fresh` evicts `app.ts`, before any per-file query reads the
        // cache, in non-optimized mode too.
        futures::executor::block_on(engine.ensure_singletons_fresh(false));
        assert!(!engine.has_cached_wire(app_id, true));
        assert!(!engine.has_cached_wire(app_id, false));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("app-future"));
        assert_eq!(app_selector(&engine, true).as_deref(), Some("app-future"));
    }

    #[test]
    fn test_ambient_global_declared_in_dts_that_becomes_readable() {
        let files = vec![(
            "/project/app.ts".to_string(),
            "import { Component } from '@angular/core';\n\
             @Component({ selector: LATE_SEL, template: '' })\n\
             export class LateComp {}\n"
                .to_string(),
        )];
        let (engine, fs) =
            ambient_global_test_engine(&files, vec![PathBuf::from("/project/late.d.ts")]);
        let app_id = engine.intern_path("/project/app.ts");

        let before = engine.analyze_file_wire_blocking("/project/app.ts", false);
        assert!(!before.0.as_ref().unwrap().diagnostics.is_empty());

        fs.upsert_file(
            PathBuf::from("/project/late.d.ts"),
            "declare const LATE_SEL: 'app-late';\n".to_string(),
        );
        engine.invalidate_file(Path::new("/project/late.d.ts"));
        futures::executor::block_on(engine.ensure_singletons_fresh(false));
        assert!(!engine.has_cached_wire(app_id, false));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("app-late"));
    }

    #[test]
    fn test_ambient_global_declaration_change_refreshes_component_mapping() {
        let files = vec![
            (
                "/project/extra.d.ts".to_string(),
                "declare interface ExtraType {}\n".to_string(),
            ),
            (
                "/project/app.ts".to_string(),
                "import { NgModule } from '@angular/core';\n\
                 import { DeclaredComp } from './comp';\n\
                 @NgModule({ declarations: FUTURE_ENABLED ? [DeclaredComp] : [] })\n\
                 export class AppModule {}\n"
                    .to_string(),
            ),
            (
                "/project/comp.ts".to_string(),
                "import { Component } from '@angular/core';\n\
                 @Component({ selector: 'app-declared', template: '', standalone: false })\n\
                 export class DeclaredComp {}\n"
                    .to_string(),
            ),
        ];
        let (engine, fs) =
            ambient_global_test_engine(&files, vec![PathBuf::from("/project/extra.d.ts")]);
        let comp_id = engine.intern_path("/project/comp.ts");
        let declared = || {
            futures::executor::block_on(QueryContext::new(engine.clone()).component_mapping())
                .component_to_module
                .contains_key(&comp_id)
        };

        let _ = engine.analyze_file_wire_blocking("/project/app.ts", true);
        assert!(!declared());

        // `ComponentMapping` evaluated `FUTURE_ENABLED` itself, so declaring it evicts the mapping
        // along with the module's own analysis, although editing `extra.d.ts` alone does not.
        fs.upsert_file(
            PathBuf::from("/project/extra.d.ts"),
            "declare const FUTURE_ENABLED: true;\n".to_string(),
        );
        engine.invalidate_file(Path::new("/project/extra.d.ts"));
        assert!(engine.cache.get(&QueryKey::ComponentMapping).is_some());
        futures::executor::block_on(engine.ensure_singletons_fresh(true));
        assert!(declared());
    }

    #[test]
    fn test_ambient_global_value_change_evicts_through_dts_dependency() {
        let files = vec![
            (
                "/project/globals.d.ts".to_string(),
                "declare const COMPILED: true;\n".to_string(),
            ),
            (
                "/project/app.ts".to_string(),
                "import { Component } from '@angular/core';\n\
                 @Component({ selector: COMPILED ? 'app-prod' : 'app-dev', template: '' })\n\
                 export class AppComp {}\n"
                    .to_string(),
            ),
        ];
        let (engine, fs) =
            ambient_global_test_engine(&files, vec![PathBuf::from("/project/globals.d.ts")]);
        let app_id = engine.intern_path("/project/app.ts");
        let candidates =
            || futures::executor::block_on(engine.next_ambient_global_candidate("COMPILED", 0));

        assert_eq!(app_selector(&engine, true).as_deref(), Some("app-prod"));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("app-prod"));
        let candidates_before = candidates();

        fs.upsert_file(
            PathBuf::from("/project/globals.d.ts"),
            "declare const COMPILED: false;\n".to_string(),
        );
        engine.invalidate_file(Path::new("/project/globals.d.ts"));

        // The names `globals.d.ts` declares are unchanged, so the ambient diff has nothing to
        // evict; `app.ts` is evicted by its ordinary dependency on the `.d.ts` it evaluated
        // `COMPILED` in.
        assert!(!engine.has_cached_wire(app_id, true));
        assert!(!engine.has_cached_wire(app_id, false));
        assert_eq!(candidates(), candidates_before);
        assert_eq!(app_selector(&engine, true).as_deref(), Some("app-dev"));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("app-dev"));
    }

    fn selector_app(selector: &str) -> (String, String) {
        (
            "/project/app.ts".to_string(),
            format!(
                "import {{ Component }} from '@angular/core';\n\
                 @Component({{ selector: {selector}, template: '' }})\n\
                 export class AppComp {{}}\n"
            ),
        )
    }

    #[test]
    fn test_ambient_global_lookup_follows_tsconfig_file_order_changes() {
        let files = vec![
            (
                "/project/a.d.ts".to_string(),
                "declare const SEL: 'from-a';\n".to_string(),
            ),
            (
                "/project/b.d.ts".to_string(),
                "declare const SEL: 'from-b';\n".to_string(),
            ),
            selector_app("SEL"),
        ];
        let a = PathBuf::from("/project/a.d.ts");
        let b = PathBuf::from("/project/b.d.ts");

        // Reordering the files changes which declaration comes first.
        let (engine, _fs) = ambient_global_test_engine(&files, vec![a.clone(), b.clone()]);
        assert_eq!(app_selector(&engine, false).as_deref(), Some("from-a"));
        *engine.tsconfig_dts_files.write().unwrap() = vec![b.clone(), a.clone()];
        engine.invalidate_roots();
        assert_eq!(app_selector(&engine, false).as_deref(), Some("from-b"));

        // So does adding a file before the one a lookup stopped at.
        let (engine, _fs) = ambient_global_test_engine(&files, vec![b.clone()]);
        assert_eq!(app_selector(&engine, true).as_deref(), Some("from-b"));
        *engine.tsconfig_dts_files.write().unwrap() = vec![a, b];
        engine.invalidate_roots();
        futures::executor::block_on(engine.ensure_singletons_fresh(true));
        assert_eq!(app_selector(&engine, true).as_deref(), Some("from-a"));
    }

    #[test]
    fn test_ambient_global_lookup_continues_past_a_type_only_candidate() {
        let files = vec![
            (
                "/project/a.d.ts".to_string(),
                "declare namespace SEL { type T = string; }\n".to_string(),
            ),
            (
                "/project/m.d.ts".to_string(),
                "declare const MID: 1;\n".to_string(),
            ),
            (
                "/project/b.d.ts".to_string(),
                "declare const SEL: 'from-b';\n".to_string(),
            ),
            selector_app("SEL"),
        ];
        let (engine, fs) = ambient_global_test_engine(
            &files,
            vec![
                PathBuf::from("/project/a.d.ts"),
                PathBuf::from("/project/m.d.ts"),
                PathBuf::from("/project/b.d.ts"),
            ],
        );
        assert_eq!(app_selector(&engine, false).as_deref(), Some("from-b"));

        // A declaration between the type-only candidate and the match takes over.
        fs.upsert_file(
            PathBuf::from("/project/m.d.ts"),
            "declare const SEL: 'from-m';\n".to_string(),
        );
        engine.invalidate_file(Path::new("/project/m.d.ts"));
        futures::executor::block_on(engine.ensure_singletons_fresh(false));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("from-m"));
    }

    #[test]
    fn test_ambient_global_read_through_another_file() {
        let files = vec![
            (
                "/project/a.d.ts".to_string(),
                "declare const OTHER: 1;\n".to_string(),
            ),
            (
                "/project/b.d.ts".to_string(),
                "declare const SEL: 'from-b';\n".to_string(),
            ),
            (
                "/project/sel.ts".to_string(),
                "export const MY_SEL = SEL;\n".to_string(),
            ),
            (
                "/project/app.ts".to_string(),
                "import { Component } from '@angular/core';\n\
                 import { MY_SEL } from './sel';\n\
                 @Component({ selector: MY_SEL, template: '' })\n\
                 export class AppComp {}\n"
                    .to_string(),
            ),
        ];
        let (engine, fs) = ambient_global_test_engine(
            &files,
            vec![
                PathBuf::from("/project/a.d.ts"),
                PathBuf::from("/project/b.d.ts"),
            ],
        );
        assert_eq!(app_selector(&engine, true).as_deref(), Some("from-b"));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("from-b"));

        // `sel.ts` looked `SEL` up, and `app.ts` read it from there.
        fs.upsert_file(
            PathBuf::from("/project/a.d.ts"),
            "declare const SEL: 'from-a';\n".to_string(),
        );
        engine.invalidate_file(Path::new("/project/a.d.ts"));
        futures::executor::block_on(engine.ensure_singletons_fresh(true));
        assert_eq!(app_selector(&engine, true).as_deref(), Some("from-a"));
        assert_eq!(app_selector(&engine, false).as_deref(), Some("from-a"));
    }

    #[test]
    fn test_repeated_ambient_global_lookups_are_memoized() {
        use futures::executor::block_on;

        let mut files = Vec::new();
        let mut dts_paths = Vec::new();
        for i in 0..4 {
            let path = format!("/project/lib_{i}.d.ts");
            files.push((path.clone(), format!("declare const G{i}: {i};\n")));
            dts_paths.push(PathBuf::from(path));
        }
        let (engine, fs) = ambient_global_test_engine(&files, dts_paths);
        let lib_3_id = engine.intern_path("/project/lib_3.d.ts");
        assert_eq!(
            block_on(engine.next_ambient_global_candidate("Number", 0)),
            None
        );
        assert_eq!(
            block_on(engine.next_ambient_global_candidate("G3", 0)),
            Some((3, lib_3_id))
        );

        // Repeated lookups, including of a name no `.d.ts` declares, neither walk the files again
        // nor wait for a scan.
        let scan = block_on(engine.ambient_global_scan.lock());
        let (sender, receiver) = std::sync::mpsc::channel();
        let lookup_engine = engine.clone();
        std::thread::spawn(move || {
            let _ = sender.send((
                block_on(lookup_engine.next_ambient_global_candidate("Number", 0)),
                block_on(lookup_engine.next_ambient_global_candidate("G3", 0)),
            ));
        });
        let memoized = receiver.recv_timeout(std::time::Duration::from_secs(10));
        drop(scan);
        assert_eq!(memoized, Ok((None, Some((3, lib_3_id)))));

        // Invalidating a scanned `.d.ts` drops the memoized answers.
        fs.upsert_file(
            PathBuf::from("/project/lib_0.d.ts"),
            "declare const Number: 0;\n".to_string(),
        );
        engine.invalidate_file(Path::new("/project/lib_0.d.ts"));
        let lib_0_id = engine.intern_path("/project/lib_0.d.ts");
        assert_eq!(
            block_on(engine.next_ambient_global_candidate("Number", 0)),
            Some((0, lib_0_id))
        );
    }

    #[test]
    fn test_dts_read_by_a_query_still_evicts_singletons() {
        let files = vec![
            (
                "/project/lib.d.ts".to_string(),
                "export declare const LIB_SEL: 'from-lib';\n".to_string(),
            ),
            (
                "/project/app.ts".to_string(),
                "import { Component } from '@angular/core';\n\
                 import { LIB_SEL } from './lib';\n\
                 @Component({ selector: LIB_SEL, template: '' })\n\
                 export class AppComp {}\n"
                    .to_string(),
            ),
        ];
        let (engine, _fs) =
            ambient_global_test_engine(&files, vec![PathBuf::from("/project/lib.d.ts")]);
        assert_eq!(app_selector(&engine, true).as_deref(), Some("from-lib"));
        futures::executor::block_on(QueryContext::new(engine.clone()).component_mapping());

        let evicted = engine.invalidate_file(Path::new("/project/lib.d.ts"));
        assert!(evicted.contains(&QueryKey::ComponentMapping));
        assert!(engine.cache.get(&QueryKey::ComponentMapping).is_none());
    }

    #[test]
    fn test_invalidating_pseudo_files_nothing_read_does_not_panic() {
        // The pseudo file ids are never interned, so the `.d.ts` shortcut must not look up
        // their paths, even when no cached query depends on them.
        let files = vec![(
            "/project/lib.d.ts".to_string(),
            "export declare const LIB_SEL: 'from-lib';\n".to_string(),
        )];
        let (engine, _fs) =
            ambient_global_test_engine(&files, vec![PathBuf::from("/project/lib.d.ts")]);
        assert!(engine.invalidate_r3_symbols_root().is_empty());
        assert!(engine.invalidate_module_resolution().is_empty());
        assert!(engine.invalidate_roots().is_empty());
    }

    #[test]
    fn test_intern_path_canonicalizes_root_dirs_paths() {
        for merged_first in [false, true] {
            let fs = create_test_fs(&[(
                "/project/out-dir/pkg/index.d.ts",
                "export declare class Lib {}",
            )]);
            fs.set_root_dirs(vec![
                PathBuf::from("/project"),
                PathBuf::from("/project/out-dir"),
            ]);
            let resolver = Arc::new(ResolverGeneric::new_with_file_system(
                fs.clone(),
                ResolveOptions::default(),
            ));
            let engine = QueryEngine::new_default(
                fs,
                resolver,
                Arc::new(ResourceRegistry::default()),
                Arc::new(std::sync::RwLock::new(Vec::new())),
            );

            let merged = Path::new("/project/pkg/index.d.ts");
            let backing = Path::new("/project/out-dir/pkg/index.d.ts");
            let (merged_id, backing_id) = if merged_first {
                let merged_id = engine.intern_path(merged);
                (merged_id, engine.intern_path(backing))
            } else {
                let backing_id = engine.intern_path(backing);
                (engine.intern_path(merged), backing_id)
            };

            assert_eq!(merged_id, backing_id, "merged_first={merged_first}");
            assert_eq!(
                engine.lookup_path(merged_id),
                PathBuf::from("/project/out-dir/pkg/index.d.ts"),
                "merged_first={merged_first}"
            );
        }
    }

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
        let _ = engine.invalidate_roots();
        // `@angular/core` is not resolvable in this file system, so every file also depends on
        // the failed-resolution pseudo-file.
        let _ = engine.invalidate_module_resolution();
        // Nothing configures whether this compilation is `@angular/core`, so every file also
        // depends on the `r3_symbols.ts` root lookup that detects it.
        let _ = engine.invalidate_r3_symbols_root();

        let r_index = engine.reverse_index.read().unwrap();
        assert!(
            r_index.is_empty(),
            "Reverse index should be clean after fully invalidating all interned files, roots, \
             failed module resolutions and the `r3_symbols.ts` root lookup"
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

    fn selector_engine(files: &[(&str, &str)], entry: &str) -> Arc<QueryEngine> {
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
    async fn resolved_selector(ctx: &QueryContext, file: FileId, name: &str) -> Option<String> {
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

    fn yield_once<T: Send + 'static>(value: T) -> crate::host::HostFuture<T> {
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

    struct AsyncMemoryHost {
        resolutions: HashMap<(String, String), crate::host::ResolvedModule>,
        modules: HashMap<String, crate::host::LoadedModule>,
        resources: HashMap<(String, String), crate::host::ResolvedResourceId>,
        resource_contents: HashMap<String, String>,
    }

    impl crate::host::AnalysisHost for AsyncMemoryHost {
        fn resolve(
            &self,
            req: crate::host::ResolveRequest,
        ) -> crate::host::HostFuture<
            Result<Option<crate::host::ResolvedModule>, crate::host::HostError>,
        > {
            let hit = self
                .resolutions
                .get(&(req.importer.as_str().to_owned(), req.specifier))
                .cloned();
            yield_once(Ok(hit))
        }

        fn load(
            &self,
            id: &crate::host::ModuleId,
            kind: crate::host::LoadKind,
            _external: bool,
        ) -> crate::host::HostFuture<
            Result<Option<crate::host::LoadedModule>, crate::host::HostError>,
        > {
            let hit = match kind {
                crate::host::LoadKind::Module => self.modules.get(id.as_str()).cloned(),
                crate::host::LoadKind::Template | crate::host::LoadKind::Style => {
                    self.resource_contents.get(id.as_str()).map(|text| {
                        crate::host::LoadedModule {
                            code: Arc::from(text.as_str()),
                            format: None,
                        }
                    })
                }
            };
            yield_once(Ok(hit))
        }

        fn resolve_resource(
            &self,
            containing: &crate::host::ModuleId,
            url: &str,
            _kind: crate::host::ResourceKind,
        ) -> crate::host::HostFuture<
            Result<Option<crate::host::ResolvedResourceId>, crate::host::HostError>,
        > {
            let hit = self
                .resources
                .get(&(containing.as_str().to_owned(), url.to_owned()))
                .cloned();
            yield_once(Ok(hit))
        }
    }

    #[test]
    fn async_host_resolves_virtual_modules_and_resources_end_to_end() {
        use crate::host::{
            IdKind, LoadedModule, ModuleFormat, ModuleId, ResolvedModule, ResolvedResourceId,
        };

        let app_mod = ModuleId::new("\0virtual:app");
        let child_mod = ModuleId::new("\0virtual:child");
        let tpl_res = ModuleId::new("\0virtual:app.html");
        let css_res = ModuleId::new("\0virtual:app.css");

        let mut resolutions = HashMap::new();
        resolutions.insert(
            (app_mod.as_str().to_owned(), "virtual:child".to_owned()),
            ResolvedModule {
                id: child_mod.clone(),
                id_kind: IdKind::Virtual,
                format: Some(ModuleFormat::Ts),
                external: false,
                code: None,
            },
        );

        let mut modules = HashMap::new();
        modules.insert(
            app_mod.as_str().to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import { Component } from '@angular/core';\n\
                     import { ChildCmp } from 'virtual:child';\n\
                     @Component({\n\
                       selector: 'app-root',\n\
                       templateUrl: './app.html',\n\
                       styleUrl: './app.css',\n\
                       imports: [ChildCmp],\n\
                     })\n\
                     export class AppCmp {}\n",
                ),
                format: Some(ModuleFormat::Ts),
            },
        );
        modules.insert(
            child_mod.as_str().to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import { Component } from '@angular/core';\n\
                     @Component({ selector: 'child-cmp', template: '<span>hi</span>' })\n\
                     export class ChildCmp {}\n",
                ),
                format: Some(ModuleFormat::Ts),
            },
        );

        let mut resources = HashMap::new();
        resources.insert(
            (app_mod.as_str().to_owned(), "./app.html".to_owned()),
            ResolvedResourceId {
                id: tpl_res,
                id_kind: IdKind::Virtual,
                code: Some(Arc::from("<child-cmp></child-cmp>")),
            },
        );
        resources.insert(
            (app_mod.as_str().to_owned(), "./app.css".to_owned()),
            ResolvedResourceId {
                id: css_res.clone(),
                id_kind: IdKind::Virtual,
                code: None,
            },
        );

        let mut resource_contents = HashMap::new();
        resource_contents.insert(
            css_res.as_str().to_owned(),
            "\u{feff}.host { color: red; }".to_owned(),
        );

        let host = Arc::new(AsyncMemoryHost {
            resolutions,
            modules,
            resources,
            resource_contents,
        });
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            app_mod.as_str(),
        )]));
        let engine = QueryEngine::new_default_with_host(host, registry, entrypoints);

        let app_id = engine.intern_module(app_mod.as_str(), IdKind::Virtual);
        let ctx = QueryContext::new(engine.clone());
        let (program_files, semantic) = block_on_with_timeout(async move {
            futures::future::join(ctx.program_files(), ctx.analyze_file_semantic(app_id)).await
        });

        let child_id = engine.intern_module(child_mod.as_str(), IdKind::Virtual);
        assert_eq!(engine.lookup_kind(app_id), IdKind::Virtual);
        assert_eq!(engine.lookup_kind(child_id), IdKind::Virtual);
        assert_eq!(*program_files, vec![app_id, child_id]);

        let cmp = semantic.classes[0].as_component().expect("AppCmp");
        assert_eq!(
            cmp.template.as_ref().and_then(|template| template.get_optional()),
            Some("<child-cmp></child-cmp>".to_owned())
        );
        assert_eq!(cmp.styles_from_urls, Some(vec![".host { color: red; }".to_owned()]));
        let decls = cmp
            .resolved_declarations
            .as_ref()
            .expect("resolved declarations");
        assert_eq!(decls.len(), 1);
        assert_eq!(decls[0].selector.as_deref(), Some("child-cmp"));
    }

    #[test]
    fn async_host_excludes_external_modules_from_program_closure_while_reading_metadata() {
        use crate::host::{IdKind, LoadedModule, ModuleFormat, ModuleId, ResolvedModule};

        let app_mod = ModuleId::new("\0virtual:app");
        let ext_dts_mod = ModuleId::new("\0ext:@ext/pkg/index.d.ts");
        let ext_ts_mod = ModuleId::new("\0ext:helper.ts");

        let mut resolutions = HashMap::new();
        resolutions.insert(
            (app_mod.as_str().to_owned(), "@ext/pkg".to_owned()),
            ResolvedModule {
                id: ext_dts_mod.clone(),
                id_kind: IdKind::Virtual,
                format: Some(ModuleFormat::Dts),
                external: true,
                code: None,
            },
        );
        resolutions.insert(
            (app_mod.as_str().to_owned(), "./helper".to_owned()),
            ResolvedModule {
                id: ext_ts_mod.clone(),
                id_kind: IdKind::Virtual,
                format: Some(ModuleFormat::Ts),
                external: true,
                code: None,
            },
        );

        let mut modules = HashMap::new();
        modules.insert(
            app_mod.as_str().to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import { Component } from '@angular/core';\n\
                     import { ExtDir } from '@ext/pkg';\n\
                     import './helper';\n\
                     @Component({\n\
                       selector: 'app-root',\n\
                       template: '<div extDir></div>',\n\
                       imports: [ExtDir],\n\
                     })\n\
                     export class AppCmp {}\n",
                ),
                format: Some(ModuleFormat::Ts),
            },
        );
        modules.insert(
            ext_dts_mod.as_str().to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import * as i0 from '@angular/core';\n\
                     export declare class ExtDir {\n\
                       static ɵdir: i0.ɵɵDirectiveDeclaration<ExtDir, '[extDir]', never, {}, {}, never, never, true, never>;\n\
                     }\n",
                ),
                format: Some(ModuleFormat::Dts),
            },
        );
        modules.insert(
            ext_ts_mod.as_str().to_owned(),
            LoadedModule {
                code: Arc::from("export const HELPER = 1;\n"),
                format: Some(ModuleFormat::Ts),
            },
        );

        let host = Arc::new(AsyncMemoryHost {
            resolutions,
            modules,
            resources: HashMap::new(),
            resource_contents: HashMap::new(),
        });
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            app_mod.as_str(),
        )]));
        let engine = QueryEngine::new_default_with_host(host, registry, entrypoints);

        let app_id = engine.intern_module(app_mod.as_str(), IdKind::Virtual);
        let ctx = QueryContext::new(engine);
        let (program_files, semantic) = block_on_with_timeout(async move {
            futures::future::join(ctx.program_files(), ctx.analyze_file_semantic(app_id)).await
        });

        assert_eq!(*program_files, vec![app_id]);

        let cmp = semantic.classes[0].as_component().expect("AppCmp");
        let decls = cmp
            .resolved_declarations
            .as_ref()
            .expect("resolved declarations");
        assert_eq!(decls.len(), 1);
        assert_eq!(decls[0].selector.as_deref(), Some("[extDir]"));
    }

    #[test]
    fn kind_change_reruns_only_runs_that_read_the_file_before_it_changed() {
        use crate::host::{IdKind, ModuleId};

        let host = Arc::new(AsyncMemoryHost {
            resolutions: HashMap::new(),
            modules: HashMap::new(),
            resources: HashMap::new(),
            resource_contents: HashMap::new(),
        });
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(Vec::new()));
        let engine = QueryEngine::new_default_with_host(host, registry, entrypoints);
        let lib_mod = ModuleId::new("/kind_change_runs/lib.ts");
        let lib_id = engine.intern_module(lib_mod.as_str(), IdKind::Path);
        let other_id = engine.intern_module("/kind_change_runs/other.ts", IdKind::Path);
        let key = QueryKey::AnalyzeFileSyntax(other_id);

        // Reporting the kind `lib.ts` was interned with isn't a change.
        let started = engine.kind_epoch();
        assert_eq!(engine.intern_resolved(&lib_mod, IdKind::Path), lib_id);
        assert_eq!(engine.kind_epoch(), started);

        assert_eq!(engine.intern_resolved(&lib_mod, IdKind::Virtual), lib_id);
        assert_eq!(engine.lookup_kind(lib_id), IdKind::Virtual);
        // A run that started before the change and read `lib.ts` is discarded, but not one that
        // didn't read it or that started after the change.
        assert!(!engine.record_dependencies(key, &HashSet::from([lib_id]), started));
        assert!(engine.record_dependencies(key, &HashSet::from([other_id]), started));
        assert!(engine.record_dependencies(key, &HashSet::from([lib_id]), engine.kind_epoch()));
    }

    #[test]
    fn query_reruns_when_a_file_it_read_changes_kind_while_it_runs() {
        use crate::host::{IdKind, LoadedModule, ModuleFormat, ModuleId, ResolvedModule};

        let lib = "/kind_change_rerun/lib.ts";
        // `lib.ts` is interned as a path, as a bare-string root would be. Its syntax analysis
        // resolves its own import, for which the host reports `reported_kind`.
        let analyze = |reported_kind: IdKind| {
            let mut resolutions = HashMap::new();
            resolutions.insert(
                (lib.to_owned(), "./lib".to_owned()),
                ResolvedModule {
                    id: ModuleId::new(lib),
                    id_kind: reported_kind,
                    format: Some(ModuleFormat::Dts),
                    external: false,
                    code: None,
                },
            );
            let mut modules = HashMap::new();
            modules.insert(
                lib.to_owned(),
                LoadedModule {
                    code: Arc::from(
                        "import { Component } from '@angular/core';\n\
                         import './lib';\n\
                         @Component({ selector: 'lib-cmp', template: '' })\n\
                         export class LibCmp {}\n",
                    ),
                    format: Some(ModuleFormat::Dts),
                },
            );
            let host = Arc::new(AsyncMemoryHost {
                resolutions,
                modules,
                resources: HashMap::new(),
                resource_contents: HashMap::new(),
            });
            let registry = Arc::new(ResourceRegistry::default());
            let entrypoints = Arc::new(std::sync::RwLock::new(Vec::new()));
            let engine = QueryEngine::new_default_with_host(host, registry, entrypoints);
            let lib_id = engine.intern_module(lib, IdKind::Path);
            let ctx = QueryContext::new(engine.clone());
            let syntax =
                block_on_with_timeout(async move { ctx.analyze_file_syntax(lib_id).await });
            let selector = syntax
                .class_index
                .get("LibCmp")
                .and_then(|class| class.selector.clone());
            (engine.lookup_kind(lib_id), selector)
        };

        // Still a path, `lib.ts` is analyzed as the TypeScript module declaring `lib-cmp`.
        assert_eq!(
            analyze(IdKind::Path),
            (IdKind::Path, Some("lib-cmp".to_owned()))
        );
        // Reported as a virtual `.d.ts` partway through, the run that analyzed it as TypeScript is
        // discarded and the analysis re-runs on the `.d.ts`, which declares no component.
        assert_eq!(analyze(IdKind::Virtual), (IdKind::Virtual, None));
    }

    #[test]
    fn async_host_resolves_ambient_globals_from_tsconfig_dts_files() {
        use crate::host::{IdKind, LoadedModule, ModuleFormat, ModuleId};

        let app_mod = ModuleId::new("\0virtual:app");
        // The `.d.ts` caches are process-wide, so this test uses its own path.
        let globals = PathBuf::from("/async_host_ambient/globals.d.ts");

        let mut modules = HashMap::new();
        modules.insert(
            app_mod.as_str().to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import { Component } from '@angular/core';\n\
                     @Component({ selector: COMPILED ? 'app-prod' : 'app-dev', template: '' })\n\
                     export class AppCmp {}\n",
                ),
                format: Some(ModuleFormat::Ts),
            },
        );
        modules.insert(
            ModuleId::from_path(&globals).as_str().to_owned(),
            LoadedModule {
                code: Arc::from("declare const COMPILED: true;\n"),
                format: Some(ModuleFormat::Dts),
            },
        );

        let host = Arc::new(AsyncMemoryHost {
            resolutions: HashMap::new(),
            modules,
            resources: HashMap::new(),
            resource_contents: HashMap::new(),
        });
        let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(
            app_mod.as_str(),
        )]));
        let registry = Arc::new(ResourceRegistry::default());
        let engine = QueryEngine::new_default_with_host(host, registry, entrypoints);
        *engine.tsconfig_dts_files.write().unwrap() = vec![globals.clone()];

        let app_id = engine.intern_module(app_mod.as_str(), IdKind::Virtual);
        let globals_id = engine.intern_path(&globals);
        let ctx = QueryContext::new(engine.clone());
        let selector = block_on_with_timeout(async move {
            ctx.analyze_file_evaluated(app_id).await.class_index["AppCmp"]
                .selector
                .clone()
        });

        // Both the lookup's scan and the declaration's evaluation read `globals.d.ts` through the
        // host.
        assert_eq!(selector.as_deref(), Some("app-prod"));
        assert!(engine
            .ambient_global_names
            .read()
            .unwrap()
            .contains_key(&globals_id));
    }

    struct FlippingKindHost {
        id: String,
        resolve_calls: std::sync::atomic::AtomicUsize,
        load_calls: std::sync::atomic::AtomicUsize,
    }

    impl crate::host::AnalysisHost for FlippingKindHost {
        fn resolve(
            &self,
            req: crate::host::ResolveRequest,
        ) -> crate::host::HostFuture<
            Result<Option<crate::host::ResolvedModule>, crate::host::HostError>,
        > {
            use std::sync::atomic::Ordering;
            if req.specifier != "./lib" {
                return yield_once(Ok(None));
            }
            let call = self.resolve_calls.fetch_add(1, Ordering::SeqCst);
            let id_kind = if call % 2 == 0 {
                crate::host::IdKind::Virtual
            } else {
                crate::host::IdKind::Path
            };
            yield_once(Ok(Some(crate::host::ResolvedModule {
                id: crate::host::ModuleId::new(self.id.as_str()),
                id_kind,
                format: Some(crate::host::ModuleFormat::Ts),
                external: false,
                code: None,
            })))
        }

        fn load(
            &self,
            id: &crate::host::ModuleId,
            kind: crate::host::LoadKind,
            _external: bool,
        ) -> crate::host::HostFuture<
            Result<Option<crate::host::LoadedModule>, crate::host::HostError>,
        > {
            use std::sync::atomic::Ordering;
            let loaded = (kind == crate::host::LoadKind::Module && id.as_str() == self.id).then(
                || {
                    let load = self.load_calls.fetch_add(1, Ordering::SeqCst);
                    crate::host::LoadedModule {
                        code: Arc::from(format!(
                            "import {{ Component }} from '@angular/core';\n\
                             import './lib';\n\
                             @Component({{ selector: 'cmp-{load}', template: '' }})\n\
                             export class LibCmp {{}}\n"
                        )),
                        format: Some(crate::host::ModuleFormat::Ts),
                    }
                },
            );
            yield_once(Ok(loaded))
        }

        fn resolve_resource(
            &self,
            _containing: &crate::host::ModuleId,
            _url: &str,
            _kind: crate::host::ResourceKind,
        ) -> crate::host::HostFuture<
            Result<Option<crate::host::ResolvedResourceId>, crate::host::HostError>,
        > {
            yield_once(Ok(None))
        }
    }

    #[test]
    fn kind_change_stops_after_max_reruns_and_skips_cache() {
        use crate::host::IdKind;
        use std::sync::atomic::Ordering;

        let lib = "/kind_flip/lib.ts";
        let host = Arc::new(FlippingKindHost {
            id: lib.to_owned(),
            resolve_calls: std::sync::atomic::AtomicUsize::new(0),
            load_calls: std::sync::atomic::AtomicUsize::new(0),
        });
        let engine = QueryEngine::new_default_with_host(
            host.clone(),
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        let lib_id = engine.intern_module(lib, IdKind::Path);
        let ctx = QueryContext::new(engine.clone());
        let syntax = block_on_with_timeout(async move { ctx.analyze_file_syntax(lib_id).await });

        assert_eq!(
            host.resolve_calls.load(Ordering::SeqCst),
            1 + MAX_KIND_CHANGE_RERUNS
        );
        assert!(engine
            .cache
            .get(&QueryKey::AnalyzeFileSyntax(lib_id))
            .is_none());
        assert_eq!(
            syntax
                .class_index
                .get("LibCmp")
                .and_then(|class| class.selector.as_deref()),
            Some("cmp-3")
        );
    }

    #[test]
    fn wire_query_caches_after_kind_change_rerun_and_skips_cache_when_flipping() {
        use crate::host::{IdKind, LoadedModule, ModuleFormat, ModuleId, ResolvedModule};

        let lib = "/wire_kind_change/lib.ts";
        let source = Arc::from(
            "import { Component } from '@angular/core';\n\
             import './lib';\n\
             @Component({ selector: 'lib-cmp', template: '' })\n\
             export class LibCmp {}\n",
        );

        let mut resolutions = HashMap::new();
        resolutions.insert(
            (lib.to_owned(), "./lib".to_owned()),
            ResolvedModule {
                id: ModuleId::new(lib),
                id_kind: IdKind::Virtual,
                format: Some(ModuleFormat::Dts),
                external: false,
                code: None,
            },
        );
        let mut modules = HashMap::new();
        modules.insert(
            lib.to_owned(),
            LoadedModule {
                code: source,
                format: Some(ModuleFormat::Dts),
            },
        );
        let single_flip_engine = QueryEngine::new_default_with_host(
            Arc::new(AsyncMemoryHost {
                resolutions,
                modules,
                resources: HashMap::new(),
                resource_contents: HashMap::new(),
            }),
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        let lib_id = single_flip_engine.intern_module(lib, IdKind::Path);
        let ctx = QueryContext::new(single_flip_engine.clone());
        let wire = block_on_with_timeout(async move { ctx.analyze_file_wire(lib_id, false).await });
        assert!(wire.0.as_ref().unwrap().classes.is_empty());
        assert!(single_flip_engine.has_cached_wire(lib_id, false));

        let flipping_engine = QueryEngine::new_default_with_host(
            Arc::new(FlippingKindHost {
                id: lib.to_owned(),
                resolve_calls: std::sync::atomic::AtomicUsize::new(0),
                load_calls: std::sync::atomic::AtomicUsize::new(0),
            }),
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        let flipping_id = flipping_engine.intern_module(lib, IdKind::Path);
        let ctx = QueryContext::new(flipping_engine.clone());
        let _wire = block_on_with_timeout(async move { ctx.analyze_file_wire(flipping_id, false).await });
        assert!(!flipping_engine.has_cached_wire(flipping_id, false));
    }

    #[test]
    fn read_resource_blocking_reads_via_default_fs_host() {
        let fs = create_test_fs(&[
            ("/app/cmp.ts", "export class Cmp {}"),
            ("/app/cmp.css", "\u{feff}.host { color: blue; }"),
        ]);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions::default(),
        ));
        let engine = QueryEngine::new_default(
            fs,
            resolver,
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(vec![PathBuf::from("/app/cmp.ts")])),
        );
        let res = engine
            .read_resource_blocking("/app/cmp.ts", "./cmp.css", crate::host::ResourceKind::Style)
            .expect("resource result");
        assert_eq!(res.resolved_path, "/app/cmp.css");
        assert_eq!(res.content.as_deref(), Some(".host { color: blue; }"));
    }

    #[test]
    #[should_panic(expected = "synchronous APIs require a synchronous host")]
    fn read_resource_blocking_panics_on_async_host() {
        let host = Arc::new(AsyncMemoryHost {
            resolutions: HashMap::new(),
            modules: HashMap::new(),
            resources: HashMap::new(),
            resource_contents: HashMap::new(),
        });
        let engine = QueryEngine::new_default_with_host(
            host,
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        let _ =
            engine.read_resource_blocking("/app/cmp.ts", "./cmp.css", crate::host::ResourceKind::Style);
    }

    #[test]
    fn host_directive_dts_owning_reference_falls_back_to_parent_directive_file() {
        use crate::host::{IdKind, LoadedModule, ModuleFormat, ModuleId, ResolvedModule};

        let app = "/app/app.ts";
        let wrapper = "/node_modules/pkg-wrapper/index.d.ts";
        let pkg_a = "/node_modules/pkg-wrapper/node_modules/pkg-a/index.d.ts";
        let host_target = "/shared/pkg-a-src/host.d.ts";

        let mut resolutions = HashMap::new();
        resolutions.insert(
            (app.to_owned(), "pkg-wrapper".to_owned()),
            ResolvedModule {
                id: ModuleId::new(wrapper),
                id_kind: IdKind::Path,
                format: Some(ModuleFormat::Dts),
                external: false,
                code: None,
            },
        );
        // `pkg-a` is nested under `pkg-wrapper/node_modules`, so neither `/app/app.ts` nor the
        // symlinked `/shared/pkg-a-src/host.d.ts` can resolve `'pkg-a'`.
        resolutions.insert(
            (wrapper.to_owned(), "pkg-a".to_owned()),
            ResolvedModule {
                id: ModuleId::new(pkg_a),
                id_kind: IdKind::Path,
                format: Some(ModuleFormat::Dts),
                external: false,
                code: None,
            },
        );
        resolutions.insert(
            (pkg_a.to_owned(), "pkg-a".to_owned()),
            ResolvedModule {
                id: ModuleId::new(pkg_a),
                id_kind: IdKind::Path,
                format: Some(ModuleFormat::Dts),
                external: false,
                code: None,
            },
        );
        resolutions.insert(
            (pkg_a.to_owned(), "./host".to_owned()),
            ResolvedModule {
                id: ModuleId::new(host_target),
                id_kind: IdKind::Path,
                format: Some(ModuleFormat::Dts),
                external: false,
                code: None,
            },
        );

        let mut modules = HashMap::new();
        modules.insert(
            app.to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import { Component } from '@angular/core';\n\
                     import { WrapperModule } from 'pkg-wrapper';\n\
                     @Component({ selector: 'app-cmp', template: '<div parentDir></div>', imports: [WrapperModule] })\n\
                     export class AppCmp {}\n",
                ),
                format: Some(ModuleFormat::Ts),
            },
        );
        modules.insert(
            wrapper.to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import * as i0 from '@angular/core';\n\
                     import { ParentDir } from 'pkg-a';\n\
                     export declare class WrapperModule {\n\
                       static ɵmod: i0.ɵɵNgModuleDeclaration<WrapperModule, never, never, [typeof ParentDir]>;\n\
                     }\n",
                ),
                format: Some(ModuleFormat::Dts),
            },
        );
        modules.insert(
            pkg_a.to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import * as i0 from '@angular/core';\n\
                     import * as i1 from './host';\n\
                     export { HostDir } from './host';\n\
                     export declare class ParentDir {\n\
                       static ɵdir: i0.ɵɵDirectiveDeclaration<ParentDir, '[parentDir]', never, {}, {}, never, never, true, [{ directive: typeof i1.HostDir; inputs: {}; outputs: {} }]>;\n\
                     }\n",
                ),
                format: Some(ModuleFormat::Dts),
            },
        );
        modules.insert(
            host_target.to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import * as i0 from '@angular/core';\n\
                     export declare class HostDir {\n\
                       static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, '[hostDir]', never, {}, {}, never, never, true, never>;\n\
                     }\n",
                ),
                format: Some(ModuleFormat::Dts),
            },
        );

        let engine = QueryEngine::new_default_with_host(
            Arc::new(AsyncMemoryHost {
                resolutions,
                modules,
                resources: HashMap::new(),
                resource_contents: HashMap::new(),
            }),
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(vec![PathBuf::from(app)])),
        );
        let app_id = engine.intern_path(app);
        let ctx = QueryContext::new(engine);
        let wire = block_on_with_timeout(async move { ctx.analyze_file_wire(app_id, true).await });
        let analysis = wire.0.as_ref().expect("wire analysis");
        let decls = analysis.classes[0]
            .component
            .as_ref()
            .and_then(|c| c.resolved_declarations.as_ref())
            .expect("resolved declarations");
        let parent = decls
            .iter()
            .find(|d| d.name == "ParentDir")
            .expect("ParentDir declaration");
        let host_dirs = parent
            .resolved_host_directives
            .as_ref()
            .expect("resolved host directives");
        assert_eq!(host_dirs.len(), 1);
        assert_eq!(host_dirs[0].directive.r#ref.invalid_reason, None);
        assert_eq!(
            host_dirs[0]
                .directive
                .r#ref
                .typecheck_import
                .as_ref()
                .map(|r| (r.specifier.as_str(), r.symbol.as_str())),
            Some(("pkg-a", "HostDir"))
        );
    }

    #[test]
    fn async_host_caches_resolutions_across_queries_and_preserves_other_importers() {
        use crate::host::{
            AnalysisHost, HostError, HostFuture, IdKind, ImportKind, LoadKind, LoadedModule,
            ModuleFormat, ModuleId, ResolveRequest, ResolvedModule, ResolvedResourceId,
            ResourceKind,
        };

        struct CountingAsyncHost {
            resolutions: RwLock<HashMap<(String, String, ImportKind), ResolvedModule>>,
            modules: RwLock<HashMap<String, LoadedModule>>,
            resolve_calls: Mutex<Vec<(String, String, ImportKind)>>,
        }

        impl AnalysisHost for CountingAsyncHost {
            fn resolve(
                &self,
                req: ResolveRequest,
            ) -> HostFuture<Result<Option<ResolvedModule>, HostError>> {
                let key = (req.importer.as_str().to_owned(), req.specifier, req.kind);
                self.resolve_calls.lock().unwrap().push(key.clone());
                let hit = self.resolutions.read().unwrap().get(&key).cloned();
                yield_once(Ok(hit))
            }

            fn load(
                &self,
                id: &ModuleId,
                _kind: LoadKind,
                _external: bool,
            ) -> HostFuture<Result<Option<LoadedModule>, HostError>> {
                let hit = self.modules.read().unwrap().get(id.as_str()).cloned();
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

        let app_path = "/cache_test/app.ts";
        let barrel_path = "/cache_test/barrel.ts";
        let child_path = "/cache_test/child.ts";

        let mut resolutions = HashMap::new();
        resolutions.insert(
            (
                app_path.to_owned(),
                "./barrel".to_owned(),
                ImportKind::Static,
            ),
            ResolvedModule {
                id: ModuleId::new(barrel_path),
                id_kind: IdKind::Path,
                format: Some(ModuleFormat::Ts),
                external: false,
                code: None,
            },
        );
        resolutions.insert(
            (
                barrel_path.to_owned(),
                "./child".to_owned(),
                ImportKind::ReExport,
            ),
            ResolvedModule {
                id: ModuleId::new(child_path),
                id_kind: IdKind::Path,
                format: Some(ModuleFormat::Ts),
                external: false,
                code: None,
            },
        );

        let child_source = |sel: &str| LoadedModule {
            code: Arc::from(format!(
                "import {{ Directive }} from '@angular/core';\n\
                 @Directive({{ selector: '{sel}' }})\n\
                 export class ChildDir {{}}\n"
            )),
            format: Some(ModuleFormat::Ts),
        };

        let mut modules = HashMap::new();
        modules.insert(
            app_path.to_owned(),
            LoadedModule {
                code: Arc::from(
                    "import { Component } from '@angular/core';\n\
                     import { BarrelDir } from './barrel';\n\
                     @Component({\n\
                       selector: 'app-root',\n\
                       template: '<div childV1 childV2></div>',\n\
                       imports: [BarrelDir],\n\
                     })\n\
                     export class AppCmp {}\n",
                ),
                format: Some(ModuleFormat::Ts),
            },
        );
        modules.insert(
            barrel_path.to_owned(),
            LoadedModule {
                code: Arc::from("export { ChildDir as BarrelDir } from './child';\n"),
                format: Some(ModuleFormat::Ts),
            },
        );
        modules.insert(child_path.to_owned(), child_source("[childV1]"));

        let host = Arc::new(CountingAsyncHost {
            resolutions: RwLock::new(resolutions),
            modules: RwLock::new(modules),
            resolve_calls: Mutex::new(Vec::new()),
        });
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(RwLock::new(vec![PathBuf::from(app_path)]));
        let engine = QueryEngine::new_default_with_host(host.clone(), registry, entrypoints);

        let app_id = engine.intern_path(Path::new(app_path));
        let barrel_id = engine.intern_path(Path::new(barrel_path));
        let child_id = engine.intern_path(Path::new(child_path));

        let ctx = QueryContext::new(engine.clone());
        let (program_files, semantic, _) = block_on_with_timeout(async move {
            let pf = ctx.program_files().await;
            let sem = ctx.analyze_file_semantic(app_id).await;
            let exports = ctx.module_export_map(barrel_id).await;
            (pf, sem, exports)
        });
        let cmp = semantic.classes[0].as_component().expect("AppCmp");
        assert_eq!(
            cmp.resolved_declarations.as_ref().unwrap()[0]
                .selector
                .as_deref(),
            Some("[childV1]")
        );

        let count_for = |importer: &str, spec: &str, kind: ImportKind| -> usize {
            host.resolve_calls
                .lock()
                .unwrap()
                .iter()
                .filter(|(imp, sp, k)| imp == importer && sp == spec && *k == kind)
                .count()
        };
        assert_eq!(count_for(app_path, "./barrel", ImportKind::Static), 1);
        assert_eq!(count_for(barrel_path, "./child", ImportKind::ReExport), 1);
        // The syntactic scan asks for the barrel's pure re-export as a re-export too: it shares
        // the lookup above instead of repeating it as a plain import, and still follows it into
        // the program closure.
        assert_eq!(count_for(barrel_path, "./child", ImportKind::Static), 0);
        assert_eq!(*program_files, vec![app_id, barrel_id, child_id]);

        // Editing the target file (`child.ts`) must reuse cached resolutions for both `app.ts`
        // and `barrel.ts` without asking the host again.
        host.resolve_calls.lock().unwrap().clear();
        host.modules
            .write()
            .unwrap()
            .insert(child_path.to_owned(), child_source("[childV2]"));
        engine.invalidate_file_id(child_id);

        let engine_v2 = engine.clone();
        let semantic_v2 = block_on_with_timeout(async move {
            let ctx = QueryContext::new(engine_v2);
            ctx.analyze_file_semantic(app_id).await
        });
        let cmp_v2 = semantic_v2.classes[0].as_component().expect("AppCmp");
        assert_eq!(
            cmp_v2.resolved_declarations.as_ref().unwrap()[0]
                .selector
                .as_deref(),
            Some("[childV2]")
        );
        assert_eq!(count_for(app_path, "./barrel", ImportKind::Static), 0);
        assert_eq!(count_for(barrel_path, "./child", ImportKind::ReExport), 0);

        // Editing `app.ts` itself drops only `app.ts`'s cached resolutions while preserving
        // `barrel.ts`'s cached resolution to `./child`.
        engine.invalidate_file_id(app_id);
        let _ = block_on_with_timeout(async move {
            let ctx = QueryContext::new(engine);
            ctx.analyze_file_semantic(app_id).await
        });
        assert_eq!(count_for(app_path, "./barrel", ImportKind::Static), 1);
        assert_eq!(count_for(barrel_path, "./child", ImportKind::ReExport), 0);
    }

    /// A failed lookup served from the resolution cache must still mark the calling query as
    /// depending on the unresolved imports, or creating the file would not re-run it.
    #[test]
    fn memoized_unresolved_lookup_records_unresolved_imports_dependency() {
        use crate::host::{ImportKind, ResolveRequest};
        use crate::query::resolution_cache::ResolutionLookupKey;

        let importer = "/negative_cache/app.ts";
        let engine = QueryEngine::new_default_with_host(
            Arc::new(AsyncMemoryHost {
                resolutions: HashMap::new(),
                modules: HashMap::new(),
                resources: HashMap::new(),
                resource_contents: HashMap::new(),
            }),
            Arc::new(ResourceRegistry::default()),
            Arc::new(std::sync::RwLock::new(Vec::new())),
        );
        let importer_id = engine.intern_path(importer);
        let key = ResolutionLookupKey::from_request(&ResolveRequest::new(
            importer,
            "./missing",
            ImportKind::Static,
        ));

        for memoized in [false, true] {
            assert_eq!(
                engine.resolution_cache.get(importer_id, &key).is_some(),
                memoized
            );
            let ctx = QueryContext::new(engine.clone());
            let lookup_ctx = ctx.clone();
            let resolved = block_on_with_timeout(async move {
                lookup_ctx
                    .resolve_from_id(importer_id, "./missing", ImportKind::Static)
                    .await
            });
            assert!(resolved.is_none());
            assert_eq!(
                ctx.dependencies(),
                HashSet::from([importer_id, UNRESOLVED_IMPORTS_FILE_ID])
            );
        }
    }
}

#[cfg(test)]
mod shared_dts_parse_cache_tests {
    use super::shared_dts_parse_cache::{Cache, SourceKey};
    use super::*;
    use crate::test_utils::create_test_fs;
    use oxc_resolver::ResolveOptions;

    // The cache is process-wide and tests run in parallel, so every test uses its own paths.

    fn engine_over(files: &[(&str, &str)]) -> Arc<QueryEngine> {
        let fs = create_test_fs(files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions::default(),
        ));
        QueryEngine::new_default(
            fs,
            resolver,
            Arc::new(ResourceRegistry::default()),
            Arc::new(RwLock::new(Vec::new())),
        )
    }

    fn parse(engine: &Arc<QueryEngine>, path: &str) -> Arc<Mutex<crate::ParsedFile>> {
        let file_id = engine.intern_path(path);
        let ctx = QueryContext::new(engine.clone());
        futures::executor::block_on(engine.parse_file_body(file_id, &ctx))
    }

    fn source_text(parsed: &Arc<Mutex<crate::ParsedFile>>) -> String {
        parsed.lock().unwrap().borrow_owner().source_text.clone()
    }

    #[test]
    fn reuses_a_dts_parse_across_engines() {
        let path = "/shared_dts_hit/lib.d.ts";
        let files = [(path, "export declare class Lib {}")];
        let first = parse(&engine_over(&files), path);
        let second = parse(&engine_over(&files), path);
        assert!(Arc::ptr_eq(&first, &second));
    }

    #[test]
    fn reparses_a_dts_whose_text_changed() {
        let path = "/shared_dts_miss/lib.d.ts";
        let before = parse(&engine_over(&[(path, "export declare class A {}")]), path);
        let after = parse(&engine_over(&[(path, "export declare class B {}")]), path);
        assert!(!Arc::ptr_eq(&before, &after));
        assert_eq!(source_text(&after), "export declare class B {}");

        // The new parse replaced the stale one.
        let again = parse(&engine_over(&[(path, "export declare class B {}")]), path);
        assert!(Arc::ptr_eq(&after, &again));
    }

    #[test]
    fn never_shares_ts_sources() {
        let path = "/shared_dts_ts/lib.ts";
        let files = [(path, "export class Lib {}")];
        let first = parse(&engine_over(&files), path);
        let second = parse(&engine_over(&files), path);
        assert!(!Arc::ptr_eq(&first, &second));
    }

    #[test]
    fn never_caches_an_unreadable_dts() {
        let path = "/shared_dts_unreadable/missing.d.ts";
        let first = parse(&engine_over(&[]), path);
        let second = parse(&engine_over(&[]), path);
        assert!(!Arc::ptr_eq(&first, &second));
    }

    #[test]
    fn shares_a_parse_in_use_on_another_thread() {
        let path = "/shared_dts_in_use/lib.d.ts";
        let files = [(path, "export declare class Lib {}")];
        let first = parse(&engine_over(&files), path);
        let second = {
            let _guard = first.lock().unwrap();
            parse(&engine_over(&files), path)
        };
        assert!(Arc::ptr_eq(&first, &second));
    }

    #[test]
    fn reuses_ambient_global_names_across_engines() {
        let path = "/shared_dts_global_names/globals.d.ts";
        let names = |source: &str| {
            let engine = engine_over(&[(path, source)]);
            futures::executor::block_on(engine.ambient_global_names(engine.intern_path(path)))
        };
        let first = names("declare const SHARED_GLOBAL: true;");
        let second = names("declare const SHARED_GLOBAL: true;");
        assert!(Arc::ptr_eq(&first, &second));
        assert_eq!(*first, HashSet::from(["SHARED_GLOBAL".to_string()]));

        let changed = names("declare const OTHER_GLOBAL: true;");
        assert_eq!(*changed, HashSet::from(["OTHER_GLOBAL".to_string()]));
    }

    #[test]
    fn extracts_ambient_global_names_from_a_shared_parse() {
        let path = "/shared_dts_global_names_parsed/globals.d.ts";
        let files = [(path, "declare const PARSED_GLOBAL: true;")];
        parse(&engine_over(&files), path);
        let engine = engine_over(&files);
        let names =
            futures::executor::block_on(engine.ambient_global_names(engine.intern_path(path)));
        assert_eq!(*names, HashSet::from(["PARSED_GLOBAL".to_string()]));
    }

    #[test]
    fn evicts_the_least_recently_used_entries_beyond_its_capacity() {
        let path = "/shared_dts_eviction/lib.d.ts";
        let parsed = parse(&engine_over(&[(path, "export declare class Lib {}")]), path);
        let key = |name: &str| PathBuf::from(format!("/shared_dts_eviction/{name}.d.ts"));
        let source = SourceKey::of(&"x".repeat(25));

        let mut cache = Cache::new(100);
        for name in ["a", "b", "c", "d"] {
            cache.insert(key(name), source, parsed.clone());
        }
        // Full (100 of 100 bytes). Using `a` leaves `b` the least recently used.
        assert!(cache.get(&key("a"), &source).is_some());
        cache.insert(key("e"), source, parsed.clone());

        assert!(!cache.contains(&key("b")));
        for name in ["a", "c", "d", "e"] {
            assert!(cache.contains(&key(name)), "{name} should still be cached");
        }

        // A file larger than a quarter of the capacity is not cached at all.
        cache.insert(key("huge"), SourceKey::of(&"x".repeat(26)), parsed.clone());
        assert!(!cache.contains(&key("huge")));
        assert!(cache.contains(&key("a")));

        // A lookup with different text drops the stale entry.
        assert!(cache
            .get(&key("a"), &SourceKey::of(&"y".repeat(25)))
            .is_none());
        assert!(!cache.contains(&key("a")));
    }
}
