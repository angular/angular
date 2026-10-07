//! Self-driving query handle infrastructure shared by the query engine and its cache.

use futures::future::{BoxFuture, FutureExt, RemoteHandle, Shared};
use std::sync::Arc;

/// A cached, self-driving query handle.
///
/// Unlike a bare `Shared<BoxFuture>` (which only makes progress while some task is actively
/// awaiting it), a `SharedQuery` wraps a `RemoteHandle` to a task that was *submitted to the
/// spawner the moment the query was created* (see [`spawn_shared`]). The future therefore drives
/// itself on the thread pool (native) or local pool (WASM); awaiting the handle only parks the
/// caller until the already-running task completes. This is what makes `join_all` over several
/// queries fan out across pool threads instead of running cooperatively on the awaiting task.
pub type SharedQuery<T> = Shared<RemoteHandle<Arc<T>>>;

/// Submit `fut` to the ambient executor and return a cached, clonable handle to its result.
///
/// Native uses the global `ThreadPool`; WASM uses the thread-local `LocalPool` driven by the event
/// pump. Both `spawn_with_handle` / `spawn_local_with_handle` return a `RemoteHandle`, which we
/// `.shared()` so every cache clone observes the same single execution. The handle stored in the
/// cache keeps the task alive; dropping all clones (i.e. cache eviction) cancels it.
///
/// Note: these spawned query tasks are *not* tracked in `Analyzer::active_handles`, so
/// `wait_for_analysis` does not await them. That is intentional — a query is anchored solely by its
/// cache entry, run-cancellation cancels them via `QueryEngine::invalidate_file` (which drops the
/// handles), and any task that outlives a cancelled run only leaves a harmless cached result.
#[cfg(not(target_arch = "wasm32"))]
pub(crate) fn spawn_shared<T: Send + Sync + 'static>(
    fut: BoxFuture<'static, Arc<T>>,
) -> SharedQuery<T> {
    use futures::task::SpawnExt;
    crate::compiler::analyzer::get_global_pool()
        .spawn_with_handle(fut)
        .expect("global thread pool spawn failed")
        .shared()
}

#[cfg(target_arch = "wasm32")]
pub(crate) fn spawn_shared<T: 'static>(fut: BoxFuture<'static, Arc<T>>) -> SharedQuery<T> {
    use futures::task::LocalSpawnExt;
    crate::compiler::analyzer::get_local_spawner()
        .spawn_local_with_handle(fut)
        .expect("local pool spawn failed")
        .shared()
}
