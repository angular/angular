use super::{
    AnalysisHost, HostError, HostFuture, IdKind, ImportKind, LoadKind, LoadedModule, ModuleFormat,
    ModuleId, ResolveRequest, ResolvedModule, ResolvedResourceId, ResourceKind,
};
use futures::channel::oneshot;
use futures::future::{FutureExt, Shared, WeakShared};
use std::collections::{BTreeMap, HashMap};
use std::fmt;
use std::sync::{Arc, Mutex, RwLock};

/// Outbound wire representation of a [`ResolveRequest`] inside a `hostRequests` pump event.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WireResolveRequest {
    pub importer: ModuleId,
    pub specifier: String,
    pub kind: ImportKind,
    pub type_only: bool,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub attributes: BTreeMap<String, String>,
}

impl From<&ResolveRequest> for WireResolveRequest {
    fn from(req: &ResolveRequest) -> Self {
        Self {
            importer: req.importer.clone(),
            specifier: req.specifier.clone(),
            kind: req.kind,
            type_only: req.type_only,
            attributes: req.attributes.iter().cloned().collect(),
        }
    }
}

/// Outbound wire representation of an [`AnalysisHost::load`] lookup inside a `hostRequests` event.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WireLoadRequest {
    pub id: ModuleId,
    pub kind: LoadKind,
    pub external: bool,
}

/// A single wave of deduplicated host requests drained by `WasmAnalyzer::pump`.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HostRequestBatch {
    pub id: u32,
    pub resolve: Vec<WireResolveRequest>,
    pub load: Vec<WireLoadRequest>,
}

/// Per-slot non-null wire outcome supplied to [`BatchingHost::provide_results`].
///
/// `Error` is ordered before `Ok` so `{ "error": "..." }` deserializes as a slot failure while
/// objects carrying required `id`/`idKind` or `code` fields deserialize as `Ok`.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(untagged)]
pub enum WireSlotOutcome<T> {
    Error { error: String },
    Ok(T),
}

/// Inbound wire representation of a resolved module from `AnalyzerHost.resolve`.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WireResolveResult {
    pub id: ModuleId,
    pub id_kind: IdKind,
    #[serde(default)]
    pub format: Option<ModuleFormat>,
    #[serde(default)]
    pub external: bool,
    #[serde(default)]
    pub code: Option<String>,
}

/// Inbound wire representation of loaded file contents from `AnalyzerHost.load`.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WireLoadResult {
    pub code: String,
    #[serde(default)]
    pub format: Option<ModuleFormat>,
}

/// Index-aligned batch results supplied by JS via `provideHostResults`.
#[derive(Clone, Debug, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HostBatchResults {
    #[serde(default)]
    pub resolve: Vec<Option<WireSlotOutcome<WireResolveResult>>>,
    #[serde(default)]
    pub load: Vec<Option<WireSlotOutcome<WireLoadResult>>>,
}

/// Cached source lookup and fallback `AnalyzerHost.load` metadata for host-backed `getFileContent`.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HostFileContentLookup {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
    pub id: ModuleId,
    pub external: bool,
}

type ResolveOutcome = Result<Option<ResolvedModule>, HostError>;
type LoadOutcome = Result<Option<LoadedModule>, HostError>;
type SharedResolveRx = Shared<oneshot::Receiver<ResolveOutcome>>;
type SharedLoadRx = Shared<oneshot::Receiver<LoadOutcome>>;
type WeakResolveRx = WeakShared<oneshot::Receiver<ResolveOutcome>>;
type WeakLoadRx = WeakShared<oneshot::Receiver<LoadOutcome>>;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct LoadLookupKey {
    id: ModuleId,
    kind: LoadKind,
    external: bool,
}

#[derive(Clone, Debug)]
struct OverlayEntry {
    code: Arc<str>,
    /// Explicit format supplied via `FileUpdate.format` (`None` when unset).
    format: Option<ModuleFormat>,
}

#[derive(Clone, Copy, Debug, Default)]
struct ResolvedMeta {
    id_kind: Option<IdKind>,
    format: Option<ModuleFormat>,
    external: bool,
}

#[derive(Default)]
struct CachedModules {
    overlay: HashMap<ModuleId, OverlayEntry>,
    inline_code: HashMap<ModuleId, LoadedModule>,
    resolved_meta: HashMap<ModuleId, ResolvedMeta>,
}

struct PendingResolveSlot {
    id: u64,
    key: ResolveRequest,
    tx: oneshot::Sender<ResolveOutcome>,
}

struct PendingLoadSlot {
    id: u64,
    key: LoadLookupKey,
    tx: oneshot::Sender<LoadOutcome>,
}

struct InFlightBatch {
    resolve: Vec<PendingResolveSlot>,
    load: Vec<PendingLoadSlot>,
}

struct BatchingState {
    next_batch_id: u32,
    next_slot_id: u64,
    queued_resolve: Vec<PendingResolveSlot>,
    queued_load: Vec<PendingLoadSlot>,
    in_flight_resolve: HashMap<ResolveRequest, (u64, WeakResolveRx)>,
    in_flight_load: HashMap<LoadLookupKey, (u64, WeakLoadRx)>,
    active_batches: HashMap<u32, InFlightBatch>,
}

impl Default for BatchingState {
    fn default() -> Self {
        Self {
            next_batch_id: 1,
            next_slot_id: 1,
            queued_resolve: Vec::new(),
            queued_load: Vec::new(),
            in_flight_resolve: HashMap::new(),
            in_flight_load: HashMap::new(),
            active_batches: HashMap::new(),
        }
    }
}

struct BatchingHostInner {
    cache: RwLock<CachedModules>,
    state: Mutex<BatchingState>,
}

impl BatchingHostInner {
    fn enqueue_or_join_resolve(&self, req: &ResolveRequest) -> SharedResolveRx {
        let mut state = self.state.lock().unwrap();
        if let Some(existing) = state
            .in_flight_resolve
            .get(req)
            .and_then(|(_, weak)| weak.upgrade())
        {
            return existing;
        }
        let slot_id = state.next_slot_id;
        state.next_slot_id += 1;
        let (tx, rx) = oneshot::channel();
        let shared = rx.shared();
        if let Some(weak) = shared.downgrade() {
            state.in_flight_resolve.insert(req.clone(), (slot_id, weak));
        }
        state.queued_resolve.push(PendingResolveSlot {
            id: slot_id,
            key: req.clone(),
            tx,
        });
        shared
    }

    fn enqueue_or_join_load(&self, key: &LoadLookupKey) -> SharedLoadRx {
        let mut state = self.state.lock().unwrap();
        if let Some(existing) = state
            .in_flight_load
            .get(key)
            .and_then(|(_, weak)| weak.upgrade())
        {
            return existing;
        }
        let slot_id = state.next_slot_id;
        state.next_slot_id += 1;
        let (tx, rx) = oneshot::channel();
        let shared = rx.shared();
        if let Some(weak) = shared.downgrade() {
            state.in_flight_load.insert(key.clone(), (slot_id, weak));
        }
        state.queued_load.push(PendingLoadSlot {
            id: slot_id,
            key: key.clone(),
            tx,
        });
        shared
    }

    fn cached_raw_code(&self, id: &ModuleId) -> Option<Arc<str>> {
        let cache = self.cache.read().unwrap();
        cache
            .overlay
            .get(id)
            .map(|entry| Arc::clone(&entry.code))
            .or_else(|| {
                cache
                    .inline_code
                    .get(id)
                    .map(|entry| Arc::clone(&entry.code))
            })
    }

    fn lookup_cached_load(&self, id: &ModuleId, kind: LoadKind) -> Option<LoadOutcome> {
        let cache = self.cache.read().unwrap();
        let meta = cache.resolved_meta.get(id).copied().unwrap_or_default();
        if let Some(overlay) = cache.overlay.get(id) {
            let code = Arc::clone(&overlay.code);
            return match kind {
                LoadKind::Template | LoadKind::Style => Some(Ok(Some(strip_resource_bom(code)))),
                LoadKind::Module => {
                    let effective = overlay.format.or(meta.format).or_else(|| {
                        if meta.id_kind == Some(IdKind::Virtual) {
                            Some(ModuleFormat::Ts)
                        } else {
                            ModuleFormat::from_path(std::path::Path::new(id.as_str()))
                        }
                    });
                    Some(match effective {
                        Some(fmt) => Ok(Some(LoadedModule {
                            code,
                            format: Some(fmt),
                        })),
                        None => Err(missing_module_format_error(id)),
                    })
                }
            };
        }
        let inline = cache.inline_code.get(id)?;
        let code = Arc::clone(&inline.code);
        match kind {
            LoadKind::Template | LoadKind::Style => Some(Ok(Some(strip_resource_bom(code)))),
            LoadKind::Module => {
                let effective = inline.format.or(meta.format).or_else(|| {
                    (meta.id_kind != Some(IdKind::Virtual))
                        .then(|| ModuleFormat::from_path(std::path::Path::new(id.as_str())))
                        .flatten()
                });
                Some(match effective {
                    Some(fmt) => Ok(Some(LoadedModule {
                        code,
                        format: Some(fmt),
                    })),
                    None => Err(missing_module_format_error(id)),
                })
            }
        }
    }

    fn effective_load_external(&self, id: &ModuleId, kind: LoadKind, external: bool) -> bool {
        if external || matches!(kind, LoadKind::Module) {
            return external;
        }
        self.cache
            .read()
            .unwrap()
            .resolved_meta
            .get(id)
            .is_some_and(|meta| meta.external)
    }
}

fn strip_resource_bom(code: Arc<str>) -> LoadedModule {
    let stripped = match code.strip_prefix('\u{feff}') {
        Some(rest) => Arc::from(rest),
        None => code,
    };
    LoadedModule {
        code: stripped,
        format: None,
    }
}

fn missing_module_format_error(id: &ModuleId) -> HostError {
    HostError::new(format!(
        "Module load for '{id}' requires 'format' when not supplied by resolve or a standard path \
         extension"
    ))
}

/// Asynchronous [`AnalysisHost`] that batches concurrent `resolve` and `load` requests across
/// pump waves for external bundler adapters.
#[derive(Clone)]
pub struct BatchingHost {
    inner: Arc<BatchingHostInner>,
}

impl Default for BatchingHost {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Debug for BatchingHost {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("BatchingHost").finish_non_exhaustive()
    }
}

impl BatchingHost {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(BatchingHostInner {
                cache: RwLock::new(CachedModules::default()),
                state: Mutex::new(BatchingState::default()),
            }),
        }
    }

    /// Record the authoritative [`IdKind`] of `id` when interned directly before any `resolve`.
    pub fn record_id_kind(&self, id: &ModuleId, id_kind: IdKind) {
        // The engine calls this for every resolution it interns, which `provide_results` has
        // usually recorded already, so check under the read lock before taking the write lock.
        let already_recorded = self
            .inner
            .cache
            .read()
            .unwrap()
            .resolved_meta
            .get(id)
            .is_some_and(|meta| meta.id_kind == Some(id_kind));
        if already_recorded {
            return;
        }
        let mut cache = self.inner.cache.write().unwrap();
        cache.resolved_meta.entry(id.clone()).or_default().id_kind = Some(id_kind);
    }

    /// Seed or update proactive file contents (from `virtualFiles` or `updateFileContent`).
    pub fn upsert_overlay(&self, id: ModuleId, code: Arc<str>, format: Option<ModuleFormat>) {
        let mut cache = self.inner.cache.write().unwrap();
        cache.inline_code.remove(&id);
        let effective_format = format.or_else(|| cache.overlay.get(&id).and_then(|m| m.format));
        if let Some(fmt) = format {
            cache.resolved_meta.entry(id.clone()).or_default().format = Some(fmt);
        }
        cache.overlay.insert(
            id,
            OverlayEntry {
                code,
                format: effective_format,
            },
        );
    }

    /// Drop proactive or inline-resolved file contents for `id` on file invalidation.
    pub fn remove_overlay(&self, id: &ModuleId) {
        let mut cache = self.inner.cache.write().unwrap();
        cache.inline_code.remove(id);
        cache.overlay.remove(id);
    }

    /// Whether `id` currently has proactive content in the overlay.
    pub fn has_overlay(&self, id: &ModuleId) -> bool {
        self.inner.cache.read().unwrap().overlay.contains_key(id)
    }

    /// Cached module source text from the proactive overlay or inline resolve cache, if present.
    pub fn cached_module_code(&self, id: &ModuleId) -> Option<Arc<str>> {
        self.inner.cached_raw_code(id)
    }

    /// Drain all requests queued in the current wave into a numbered [`HostRequestBatch`], or
    /// return `None` if no live requests are pending.
    pub fn take_pending_batch(&self) -> Option<HostRequestBatch> {
        let mut state = self.inner.state.lock().unwrap();
        let raw_resolve = std::mem::take(&mut state.queued_resolve);
        let raw_load = std::mem::take(&mut state.queued_load);

        let mut live_resolve = Vec::with_capacity(raw_resolve.len());
        for slot in raw_resolve {
            if slot.tx.is_canceled() {
                if state
                    .in_flight_resolve
                    .get(&slot.key)
                    .is_some_and(|(id, _)| *id == slot.id)
                {
                    state.in_flight_resolve.remove(&slot.key);
                }
            } else {
                live_resolve.push(slot);
            }
        }

        let mut live_load = Vec::with_capacity(raw_load.len());
        for slot in raw_load {
            if slot.tx.is_canceled() {
                if state
                    .in_flight_load
                    .get(&slot.key)
                    .is_some_and(|(id, _)| *id == slot.id)
                {
                    state.in_flight_load.remove(&slot.key);
                }
            } else {
                live_load.push(slot);
            }
        }

        if live_resolve.is_empty() && live_load.is_empty() {
            return None;
        }

        let id = state.next_batch_id;
        state.next_batch_id += 1;

        let wire_resolve = live_resolve
            .iter()
            .map(|slot| WireResolveRequest::from(&slot.key))
            .collect();
        let wire_load = live_load
            .iter()
            .map(|slot| WireLoadRequest {
                id: slot.key.id.clone(),
                kind: slot.key.kind,
                external: slot.key.external,
            })
            .collect();

        state.active_batches.insert(
            id,
            InFlightBatch {
                resolve: live_resolve,
                load: live_load,
            },
        );

        Some(HostRequestBatch {
            id,
            resolve: wire_resolve,
            load: wire_load,
        })
    }

    /// Fulfil an active request batch with results from the host adapter.
    ///
    /// Results arriving for an unknown or cancelled `batch_id` are ignored (`Ok(())`).
    pub fn provide_results(&self, batch_id: u32, results: HostBatchResults) -> Result<(), String> {
        let in_flight = {
            let mut state = self.inner.state.lock().unwrap();
            let Some(expected) = state.active_batches.get(&batch_id) else {
                return Ok(());
            };
            if results.resolve.len() != expected.resolve.len() {
                return Err(format!(
                    "host batch {batch_id} expected {} resolve results, got {}",
                    expected.resolve.len(),
                    results.resolve.len()
                ));
            }
            if results.load.len() != expected.load.len() {
                return Err(format!(
                    "host batch {batch_id} expected {} load results, got {}",
                    expected.load.len(),
                    results.load.len()
                ));
            }
            let batch = state.active_batches.remove(&batch_id).unwrap();
            for slot in &batch.resolve {
                if state
                    .in_flight_resolve
                    .get(&slot.key)
                    .is_some_and(|(id, _)| *id == slot.id)
                {
                    state.in_flight_resolve.remove(&slot.key);
                }
            }
            for slot in &batch.load {
                if state
                    .in_flight_load
                    .get(&slot.key)
                    .is_some_and(|(id, _)| *id == slot.id)
                {
                    state.in_flight_load.remove(&slot.key);
                }
            }
            batch
        };

        for (slot, item) in in_flight.resolve.into_iter().zip(results.resolve) {
            let outcome = match item {
                None => Ok(None),
                Some(WireSlotOutcome::Error { error }) => Err(HostError::new(error)),
                Some(WireSlotOutcome::Ok(res)) => {
                    {
                        let mut cache = self.inner.cache.write().unwrap();
                        let prev_format =
                            cache.resolved_meta.get(&res.id).and_then(|meta| meta.format);
                        cache.resolved_meta.insert(
                            res.id.clone(),
                            ResolvedMeta {
                                id_kind: Some(res.id_kind),
                                format: res.format.or(prev_format),
                                external: res.external,
                            },
                        );
                        if !cache.overlay.contains_key(&res.id) {
                            if let Some(text) = res.code {
                                cache.inline_code.insert(
                                    res.id.clone(),
                                    LoadedModule {
                                        code: Arc::from(text),
                                        format: res.format,
                                    },
                                );
                            }
                        }
                    }
                    Ok(Some(ResolvedModule {
                        id: res.id,
                        id_kind: res.id_kind,
                        format: res.format,
                        external: res.external,
                    }))
                }
            };
            let _ = slot.tx.send(outcome);
        }

        for (slot, item) in in_flight.load.into_iter().zip(results.load) {
            let kind = slot.key.kind;
            let outcome = match item {
                None => Ok(None),
                Some(WireSlotOutcome::Error { error }) => Err(HostError::new(error)),
                Some(WireSlotOutcome::Ok(res)) => match kind {
                    LoadKind::Template | LoadKind::Style => {
                        Ok(Some(strip_resource_bom(Arc::from(res.code))))
                    }
                    LoadKind::Module => {
                        let effective = {
                            let mut cache = self.inner.cache.write().unwrap();
                            let prev = cache
                                .resolved_meta
                                .get(&slot.key.id)
                                .copied()
                                .unwrap_or_default();
                            let effective = res.format.or(prev.format).or_else(|| {
                                (prev.id_kind != Some(IdKind::Virtual))
                                    .then(|| {
                                        ModuleFormat::from_path(std::path::Path::new(
                                            slot.key.id.as_str(),
                                        ))
                                    })
                                    .flatten()
                            });
                            if let Some(fmt) = effective {
                                cache.resolved_meta.insert(
                                    slot.key.id.clone(),
                                    ResolvedMeta {
                                        id_kind: prev.id_kind,
                                        format: Some(fmt),
                                        external: slot.key.external || prev.external,
                                    },
                                );
                            }
                            effective
                        };
                        match effective {
                            Some(format) => Ok(Some(LoadedModule {
                                code: Arc::from(res.code),
                                format: Some(format),
                            })),
                            None => Err(missing_module_format_error(&slot.key.id)),
                        }
                    }
                },
            };
            let _ = slot.tx.send(outcome);
        }

        Ok(())
    }
}

impl AnalysisHost for BatchingHost {
    fn resolve(&self, req: ResolveRequest) -> HostFuture<ResolveOutcome> {
        let inner = Arc::clone(&self.inner);
        async move {
            loop {
                let rx = inner.enqueue_or_join_resolve(&req);
                match rx.await {
                    Ok(outcome) => return outcome,
                    Err(_) => continue,
                }
            }
        }
        .boxed()
    }

    fn load(&self, id: &ModuleId, kind: LoadKind, external: bool) -> HostFuture<LoadOutcome> {
        if let Some(cached) = self.inner.lookup_cached_load(id, kind) {
            return futures::future::ready(cached).boxed();
        }
        let effective_external = self.inner.effective_load_external(id, kind, external);
        let inner = Arc::clone(&self.inner);
        let key = LoadLookupKey {
            id: id.clone(),
            kind,
            external: effective_external,
        };
        async move {
            loop {
                if let Some(cached) = inner.lookup_cached_load(&key.id, key.kind) {
                    return cached;
                }
                let rx = inner.enqueue_or_join_load(&key);
                match rx.await {
                    Ok(outcome) => return outcome,
                    Err(_) => continue,
                }
            }
        }
        .boxed()
    }

    fn resolve_resource(
        &self,
        containing: &ModuleId,
        url: &str,
        _kind: ResourceKind,
    ) -> HostFuture<Result<Option<ResolvedResourceId>, HostError>> {
        if url.is_empty() {
            return futures::future::ready(Ok(None)).boxed();
        }
        let host = self.clone();
        let containing = containing.clone();
        let url = url.to_owned();
        async move {
            let is_explicit =
                url.starts_with("./") || url.starts_with("../") || url.starts_with('/');
            let first_spec = if is_explicit {
                url.clone()
            } else {
                format!("./{url}")
            };
            let first_req = ResolveRequest::new(containing.clone(), first_spec, ImportKind::Static);
            if let Some(resolved) = host.resolve(first_req).await? {
                let code = host.inner.cached_raw_code(&resolved.id);
                return Ok(Some(ResolvedResourceId {
                    id: resolved.id,
                    id_kind: resolved.id_kind,
                    code,
                }));
            }
            if !is_explicit {
                let fallback_req = ResolveRequest::new(containing, url, ImportKind::Static);
                if let Some(resolved) = host.resolve(fallback_req).await? {
                    let code = host.inner.cached_raw_code(&resolved.id);
                    return Ok(Some(ResolvedResourceId {
                        id: resolved.id,
                        id_kind: resolved.id_kind,
                        code,
                    }));
                }
            }
            Ok(None)
        }
        .boxed()
    }

    fn is_synchronous(&self) -> bool {
        false
    }

    fn record_id_kind(&self, id: &ModuleId, id_kind: IdKind) {
        BatchingHost::record_id_kind(self, id, id_kind);
    }

    fn clear_cache(&self) {
        self.inner.cache.write().unwrap().inline_code.clear();
    }

    fn cancel_pending(&self) {
        let mut state = self.inner.state.lock().unwrap();
        state.queued_resolve.clear();
        state.queued_load.clear();
        state.in_flight_resolve.clear();
        state.in_flight_load.clear();
        state.active_batches.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use futures::executor::LocalPool;
    use futures::task::LocalSpawnExt;
    use std::cell::RefCell;
    use std::rc::Rc;

    /// Poll `fut` once without consuming it, returning its output if it is ready.
    fn poll_once<T>(fut: &mut HostFuture<T>) -> Option<T> {
        let waker = futures::task::noop_waker();
        let mut cx = std::task::Context::from_waker(&waker);
        match fut.as_mut().poll(&mut cx) {
            std::task::Poll::Ready(value) => Some(value),
            std::task::Poll::Pending => None,
        }
    }

    #[test]
    fn test_batching_host_dedupes_in_flight_requests_within_and_across_waves() {
        let host = BatchingHost::new();
        assert!(!host.is_synchronous());

        let mut pool = LocalPool::new();
        let spawner = pool.spawner();

        let r1 = Rc::new(RefCell::new(None));
        let r2 = Rc::new(RefCell::new(None));
        let l1 = Rc::new(RefCell::new(None));
        let l2 = Rc::new(RefCell::new(None));

        let req = ResolveRequest::new("/app/main.ts", "./dep", ImportKind::Static);
        let dep_id = ModuleId::from("/app/dep.ts");

        {
            let h = host.clone();
            let req = req.clone();
            let out = Rc::clone(&r1);
            spawner
                .spawn_local(async move {
                    *out.borrow_mut() = Some(h.resolve(req).await);
                })
                .unwrap();
        }
        {
            let h = host.clone();
            let req = req.clone();
            let out = Rc::clone(&r2);
            spawner
                .spawn_local(async move {
                    *out.borrow_mut() = Some(h.resolve(req).await);
                })
                .unwrap();
        }
        {
            let h = host.clone();
            let id = dep_id.clone();
            let out = Rc::clone(&l1);
            spawner
                .spawn_local(async move {
                    *out.borrow_mut() = Some(h.load(&id, LoadKind::Module, false).await);
                })
                .unwrap();
        }
        {
            let h = host.clone();
            let id = dep_id.clone();
            let out = Rc::clone(&l2);
            spawner
                .spawn_local(async move {
                    *out.borrow_mut() = Some(h.load(&id, LoadKind::Module, false).await);
                })
                .unwrap();
        }

        pool.run_until_stalled();

        let batch = host.take_pending_batch().expect("expected batch 1");
        assert_eq!(batch.id, 1);
        assert_eq!(batch.resolve.len(), 1);
        assert_eq!(batch.load.len(), 1);
        assert!(host.take_pending_batch().is_none());

        // A third caller joining while batch 1 is still active shares batch 1's slot instead of
        // emitting a duplicate request in batch 2.
        let r3 = Rc::new(RefCell::new(None));
        {
            let h = host.clone();
            let req = req.clone();
            let out = Rc::clone(&r3);
            spawner
                .spawn_local(async move {
                    *out.borrow_mut() = Some(h.resolve(req).await);
                })
                .unwrap();
        }
        pool.run_until_stalled();
        assert!(host.take_pending_batch().is_none());

        host.provide_results(
            batch.id,
            HostBatchResults {
                resolve: vec![Some(WireSlotOutcome::Ok(WireResolveResult {
                    id: dep_id.clone(),
                    id_kind: IdKind::Path,
                    format: Some(ModuleFormat::Ts),
                    external: false,
                    code: None,
                }))],
                load: vec![Some(WireSlotOutcome::Ok(WireLoadResult {
                    code: "export const X = 1;".to_string(),
                    format: Some(ModuleFormat::Ts),
                }))],
            },
        )
        .unwrap();

        pool.run_until_stalled();

        for slot in [&r1, &r2, &r3] {
            let settled = slot.borrow();
            let resolved = settled
                .as_ref()
                .expect("settled")
                .as_ref()
                .expect("ok")
                .as_ref()
                .expect("some");
            assert_eq!(resolved.id, dep_id);
        }
        for slot in [&l1, &l2] {
            let settled = slot.borrow();
            let loaded = settled
                .as_ref()
                .expect("settled")
                .as_ref()
                .expect("ok")
                .as_ref()
                .expect("some");
            assert_eq!(loaded.code.as_ref(), "export const X = 1;");
        }
    }

    #[test]
    fn test_batching_host_error_slots_cancellation_and_late_results() {
        let host = BatchingHost::new();
        let mut pool = LocalPool::new();
        let spawner = pool.spawner();

        let err_out = Rc::new(RefCell::new(None));
        {
            let h = host.clone();
            let out = Rc::clone(&err_out);
            spawner
                .spawn_local(async move {
                    let req = ResolveRequest::new("/app/a.ts", "./broken", ImportKind::Static);
                    *out.borrow_mut() = Some(h.resolve(req).await);
                })
                .unwrap();
        }

        pool.run_until_stalled();
        let batch1 = host.take_pending_batch().expect("batch 1");
        let results: HostBatchResults =
            serde_json::from_str(r#"{"resolve":[{"error":"plugin failed"}],"load":[]}"#).unwrap();
        host.provide_results(batch1.id, results).unwrap();
        pool.run_until_stalled();

        assert_eq!(
            *err_out.borrow(),
            Some(Err(HostError::new("plugin failed")))
        );

        // Start a second wave, cancel mid-wave, and verify late results for the cancelled batch ID
        // are ignored while subsequent batches advance monotonically.
        let (cancel_tx, cancel_rx) = oneshot::channel::<()>();
        {
            let h = host.clone();
            spawner
                .spawn_local(async move {
                    let fut = h.load(&ModuleId::from("/app/slow.ts"), LoadKind::Module, false);
                    futures::pin_mut!(fut);
                    let _ = futures::future::select(fut, cancel_rx).await;
                })
                .unwrap();
        }
        pool.run_until_stalled();
        let batch2 = host.take_pending_batch().expect("batch 2");
        assert_eq!(batch2.id, 2);

        let _ = cancel_tx.send(());
        pool.run_until_stalled();
        host.cancel_pending();

        // Late results for batch 2 (even with wrong length) are ignored because batch 2 is gone.
        host.provide_results(batch2.id, HostBatchResults::default())
            .expect("late batch results must be ignored");

        let fresh_out = Rc::new(RefCell::new(None));
        {
            let h = host.clone();
            let out = Rc::clone(&fresh_out);
            spawner
                .spawn_local(async move {
                    let id = ModuleId::from("/app/next.ts");
                    *out.borrow_mut() = Some(h.load(&id, LoadKind::Module, true).await);
                })
                .unwrap();
        }
        pool.run_until_stalled();
        let batch3 = host.take_pending_batch().expect("batch 3");
        assert_eq!(batch3.id, 3);
        assert!(batch3.load[0].external);
    }

    #[test]
    fn test_batching_host_inline_resolve_code_and_overlay_skip_load_round_trip() {
        let host = BatchingHost::new();
        let overlay_id = ModuleId::from("/app/overlay.ts");
        host.upsert_overlay(
            overlay_id.clone(),
            Arc::from("export const OVERLAY = true;"),
            Some(ModuleFormat::Ts),
        );

        // Overlay loads complete immediately on first poll without queuing a load batch.
        let immediate = host
            .load(&overlay_id, LoadKind::Module, false)
            .now_or_never()
            .expect("overlay load must resolve immediately")
            .unwrap()
            .unwrap();
        assert_eq!(immediate.code.as_ref(), "export const OVERLAY = true;");
        assert!(host.take_pending_batch().is_none());

        // Inline `code` on a `ResolveResult` also satisfies the subsequent `load` without a batch.
        let mut pool = LocalPool::new();
        let spawner = pool.spawner();
        let inline_id = ModuleId::from("/app/inline.ts");
        let loaded_out = Rc::new(RefCell::new(None));
        {
            let h = host.clone();
            let out = Rc::clone(&loaded_out);
            spawner
                .spawn_local(async move {
                    let req = ResolveRequest::new(
                        "/app/overlay.ts",
                        "./inline",
                        ImportKind::Static,
                    );
                    let resolved = h.resolve(req).await.unwrap().unwrap();
                    let loaded = h.load(&resolved.id, LoadKind::Module, false).await;
                    *out.borrow_mut() = Some(loaded);
                })
                .unwrap();
        }
        pool.run_until_stalled();
        let batch = host.take_pending_batch().expect("resolve batch");
        assert_eq!(batch.resolve.len(), 1);
        assert!(batch.load.is_empty());

        host.provide_results(
            batch.id,
            HostBatchResults {
                resolve: vec![Some(WireSlotOutcome::Ok(WireResolveResult {
                    id: inline_id.clone(),
                    id_kind: IdKind::Path,
                    format: Some(ModuleFormat::Ts),
                    external: false,
                    code: Some("export const INLINE = 42;".to_string()),
                }))],
                load: Vec::new(),
            },
        )
        .unwrap();
        pool.run_until_stalled();

        // No second `load` batch was queued!
        assert!(host.take_pending_batch().is_none());
        let loaded = loaded_out
            .borrow()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .clone();
        assert_eq!(loaded.code.as_ref(), "export const INLINE = 42;");

        // Invalidating `inline_id` clears the inline cache so a live load queues a host batch.
        host.remove_overlay(&inline_id);
        {
            let h = host.clone();
            let id = inline_id.clone();
            spawner
                .spawn_local(async move {
                    let _ = h.load(&id, LoadKind::Module, false).await;
                })
                .unwrap();
        }
        pool.run_until_stalled();
        assert!(host.take_pending_batch().is_some());
    }

    #[test]
    fn test_batching_host_skips_dropped_requests_before_batch_drain() {
        let host = BatchingHost::new();

        // `.now_or_never()` polls once (queuing a slot) and immediately drops the future.
        assert!(host
            .resolve(ResolveRequest::new(
                "/app/a.ts",
                "./dropped",
                ImportKind::Static,
            ))
            .now_or_never()
            .is_none());
        assert!(host
            .load(&ModuleId::from("/app/dropped.ts"), LoadKind::Module, false)
            .now_or_never()
            .is_none());

        // Dropped futures must not emit dead wire requests.
        assert!(host.take_pending_batch().is_none());
    }

    #[test]
    fn test_batching_host_overlay_wins_over_inline_code_and_retains_resolved_meta() {
        let host = BatchingHost::new();
        let mut pool = LocalPool::new();
        let spawner = pool.spawner();

        // 1. Proactive overlay beats stale inline `code` returned by `resolve`.
        let tpl_id = ModuleId::from("/app/cmp.html");
        host.upsert_overlay(tpl_id.clone(), Arc::from("<p>edited</p>"), None);

        let res_out = Rc::new(RefCell::new(None));
        {
            let h = host.clone();
            let out = Rc::clone(&res_out);
            spawner
                .spawn_local(async move {
                    let resolved = h
                        .resolve_resource(
                            &ModuleId::from("/app/cmp.ts"),
                            "./cmp.html",
                            ResourceKind::Template,
                        )
                        .await;
                    *out.borrow_mut() = Some(resolved);
                })
                .unwrap();
        }
        pool.run_until_stalled();
        let batch1 = host.take_pending_batch().expect("batch 1");
        host.provide_results(
            batch1.id,
            HostBatchResults {
                resolve: vec![Some(WireSlotOutcome::Ok(WireResolveResult {
                    id: tpl_id,
                    id_kind: IdKind::Path,
                    format: None,
                    external: false,
                    code: Some("<p>stale on disk</p>".to_string()),
                }))],
                load: Vec::new(),
            },
        )
        .unwrap();
        pool.run_until_stalled();
        let resolved_tpl = res_out
            .borrow()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .clone();
        assert_eq!(resolved_tpl.code.as_deref(), Some("<p>edited</p>"));

        // 2. `resolve` format carries forward to `load` when `WireLoadResult.format` is `None`,
        //    and a subsequent `upsert_overlay(..., None)` preserves that format; external resource
        //    resolutions also propagate `external: true` to follow-up resource loads.
        let virt_dts_id = ModuleId::from("\0virtual:types");
        let ext_css_id = ModuleId::from("/node_modules/pkg/theme.css");
        let dts_loaded = Rc::new(RefCell::new(None));
        let css_loaded = Rc::new(RefCell::new(None));
        {
            let h = host.clone();
            let out = Rc::clone(&dts_loaded);
            let virt_id = virt_dts_id.clone();
            spawner
                .spawn_local(async move {
                    let resolved = h
                        .resolve(ResolveRequest::new(
                            "/app/cmp.ts",
                            "virtual:types",
                            ImportKind::Static,
                        ))
                        .await
                        .unwrap()
                        .unwrap();
                    assert_eq!(resolved.id, virt_id);
                    let loaded = h.load(&resolved.id, LoadKind::Module, false).await;
                    *out.borrow_mut() = Some(loaded);
                })
                .unwrap();
        }
        {
            let h = host.clone();
            let out = Rc::clone(&css_loaded);
            spawner
                .spawn_local(async move {
                    let resolved = h
                        .resolve_resource(
                            &ModuleId::from("/app/cmp.ts"),
                            "./theme.css",
                            ResourceKind::Style,
                        )
                        .await
                        .unwrap()
                        .unwrap();
                    let loaded = h.load(&resolved.id, LoadKind::Style, false).await;
                    *out.borrow_mut() = Some(loaded);
                })
                .unwrap();
        }
        pool.run_until_stalled();
        let batch2 = host.take_pending_batch().expect("batch 2");
        assert_eq!(batch2.resolve.len(), 2);
        host.provide_results(
            batch2.id,
            HostBatchResults {
                resolve: vec![
                    Some(WireSlotOutcome::Ok(WireResolveResult {
                        id: virt_dts_id.clone(),
                        id_kind: IdKind::Virtual,
                        format: Some(ModuleFormat::Dts),
                        external: false,
                        code: None,
                    })),
                    Some(WireSlotOutcome::Ok(WireResolveResult {
                        id: ext_css_id,
                        id_kind: IdKind::Path,
                        format: None,
                        external: true,
                        code: None,
                    })),
                ],
                load: Vec::new(),
            },
        )
        .unwrap();
        pool.run_until_stalled();

        let batch3 = host.take_pending_batch().expect("batch 3");
        assert_eq!(batch3.load.len(), 2);
        let style_req = batch3
            .load
            .iter()
            .find(|r| r.kind == LoadKind::Style)
            .expect("style load request");
        assert!(
            style_req.external,
            "resource load should echo external: true from resolve_resource"
        );
        host.provide_results(
            batch3.id,
            HostBatchResults {
                resolve: Vec::new(),
                load: vec![
                    Some(WireSlotOutcome::Ok(WireLoadResult {
                        code: "export declare class VirtType {}".to_string(),
                        format: None,
                    })),
                    Some(WireSlotOutcome::Ok(WireLoadResult {
                        code: "\u{feff}.theme { color: blue; }".to_string(),
                        format: None,
                    })),
                ],
            },
        )
        .unwrap();
        pool.run_until_stalled();

        let dts = dts_loaded
            .borrow()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .clone();
        assert_eq!(dts.format, Some(ModuleFormat::Dts));

        let css = css_loaded
            .borrow()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .as_ref()
            .unwrap()
            .clone();
        assert_eq!(css.code.as_ref(), ".theme { color: blue; }");

        // Clearing the host cache (e.g. on file create/delete or `clear_resolution_cache`) drops
        // `inline_code` while keeping `resolved_meta`, so updating the virtual `.d.ts` overlay
        // with `format: None` still preserves `ModuleFormat::Dts`.
        host.clear_cache();
        host.upsert_overlay(
            virt_dts_id.clone(),
            Arc::from("export declare class VirtType2 {}"),
            None,
        );
        let updated_dts = host
            .load(&virt_dts_id, LoadKind::Module, false)
            .now_or_never()
            .unwrap()
            .unwrap()
            .unwrap();
        assert_eq!(updated_dts.format, Some(ModuleFormat::Dts));
    }

    #[test]
    fn module_load_without_authoritative_format_fails_while_path_fallback_succeeds() {
        let host = BatchingHost::new();

        // 1. Virtual module resolved with `format: None` and loaded with `format: None` -> error.
        let virt_id = ModuleId::from("\0virtual:no-format");
        let mut r_fut = host.resolve(ResolveRequest::new(
            ModuleId::from("/app/main.ts"),
            "virtual:no-format",
            ImportKind::Static,
        ));
        assert!(poll_once(&mut r_fut).is_none());
        let b1 = host.take_pending_batch().unwrap();
        host.provide_results(
            b1.id,
            HostBatchResults {
                resolve: vec![Some(WireSlotOutcome::Ok(WireResolveResult {
                    id: virt_id.clone(),
                    id_kind: IdKind::Virtual,
                    format: None,
                    external: false,
                    code: None,
                }))],
                load: vec![],
            },
        )
        .unwrap();
        let resolved_virt = poll_once(&mut r_fut).unwrap().unwrap().unwrap();
        assert_eq!(resolved_virt.format, None);

        let mut l_virt = host.load(&virt_id, LoadKind::Module, false);
        assert!(poll_once(&mut l_virt).is_none());
        let b2 = host.take_pending_batch().unwrap();
        host.provide_results(
            b2.id,
            HostBatchResults {
                resolve: vec![],
                load: vec![Some(WireSlotOutcome::Ok(WireLoadResult {
                    code: "export const X: number = 1;".into(),
                    format: None,
                }))],
            },
        )
        .unwrap();
        let virt_err = poll_once(&mut l_virt).unwrap().unwrap_err();
        assert!(
            virt_err.message.contains("requires 'format'"),
            "unexpected error: {virt_err}"
        );
        assert_eq!(host.cached_module_code(&virt_id), None);

        // 2. Custom-extension `IdKind::Path` module loaded with `format: None` -> error.
        let custom_path_id = ModuleId::from("/app/page.ng");
        let mut l_custom = host.load(&custom_path_id, LoadKind::Module, false);
        assert!(poll_once(&mut l_custom).is_none());
        let b3 = host.take_pending_batch().unwrap();
        host.provide_results(
            b3.id,
            HostBatchResults {
                resolve: vec![],
                load: vec![Some(WireSlotOutcome::Ok(WireLoadResult {
                    code: "export class PageCmp {}".into(),
                    format: None,
                }))],
            },
        )
        .unwrap();
        let custom_err = poll_once(&mut l_custom).unwrap().unwrap_err();
        assert!(custom_err.message.contains("requires 'format'"));

        // 3. Standard-extension `IdKind::Path` module loaded with `format: None` -> falls back to
        //    `ModuleFormat::from_path`.
        let std_path_id = ModuleId::from("/app/util.mts");
        let mut l_std = host.load(&std_path_id, LoadKind::Module, false);
        assert!(poll_once(&mut l_std).is_none());
        let b4 = host.take_pending_batch().unwrap();
        host.provide_results(
            b4.id,
            HostBatchResults {
                resolve: vec![],
                load: vec![Some(WireSlotOutcome::Ok(WireLoadResult {
                    code: "export const U = 1;".into(),
                    format: None,
                }))],
            },
        )
        .unwrap();
        let loaded_std = poll_once(&mut l_std).unwrap().unwrap().unwrap();
        assert_eq!(loaded_std.format, Some(ModuleFormat::Ts));

        // 4. `LoadResult.format` overrides `ResolveResult.format`.
        let override_id = ModuleId::from("/app/override.js");
        let mut r_override = host.resolve(ResolveRequest::new(
            ModuleId::from("/app/main.ts"),
            "./override.js",
            ImportKind::Static,
        ));
        assert!(poll_once(&mut r_override).is_none());
        let b5 = host.take_pending_batch().unwrap();
        host.provide_results(
            b5.id,
            HostBatchResults {
                resolve: vec![Some(WireSlotOutcome::Ok(WireResolveResult {
                    id: override_id.clone(),
                    id_kind: IdKind::Path,
                    format: Some(ModuleFormat::Js),
                    external: false,
                    code: None,
                }))],
                load: vec![],
            },
        )
        .unwrap();
        let _ = poll_once(&mut r_override).unwrap().unwrap().unwrap();

        let mut l_override = host.load(&override_id, LoadKind::Module, false);
        assert!(poll_once(&mut l_override).is_none());
        let b6 = host.take_pending_batch().unwrap();
        host.provide_results(
            b6.id,
            HostBatchResults {
                resolve: vec![],
                load: vec![Some(WireSlotOutcome::Ok(WireLoadResult {
                    code: "export const el = <div />;".into(),
                    format: Some(ModuleFormat::Jsx),
                }))],
            },
        )
        .unwrap();
        let loaded_override = poll_once(&mut l_override).unwrap().unwrap().unwrap();
        assert_eq!(loaded_override.format, Some(ModuleFormat::Jsx));

        // 5. Proactive virtual overlay with `format: None` defaults to `ModuleFormat::Ts`.
        let overlay_virt = ModuleId::from("\0virtual:proactive");
        host.record_id_kind(&overlay_virt, IdKind::Virtual);
        host.upsert_overlay(overlay_virt.clone(), Arc::from("export const P = 1;"), None);
        let loaded_proactive = host
            .load(&overlay_virt, LoadKind::Module, false)
            .now_or_never()
            .unwrap()
            .unwrap()
            .unwrap();
        assert_eq!(loaded_proactive.format, Some(ModuleFormat::Ts));
    }
}
