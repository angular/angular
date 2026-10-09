//! Self-driving query handle infrastructure shared by the query engine and its cache.

use futures::future::{BoxFuture, FutureExt, RemoteHandle, Shared};
use std::sync::Arc;

/// A cached, self-driving query handle.
///
/// Unlike a bare `Shared<BoxFuture>` (which only progresses while actively awaited), `SharedQuery`
/// wraps a `RemoteHandle` to a task spawned immediately upon query creation (see [`spawn_shared`]).
/// The task runs on the global `ThreadPool` (native) or thread-local `LocalPool` (WASM) so
/// `join_all` across queries fans out across pool threads rather than running cooperatively on the
/// caller.
pub type SharedQuery<T> = Shared<RemoteHandle<Arc<T>>>;

/// Submit `fut` to the ambient executor and return a shared handle to its result.
///
/// The handle stored in the query cache keeps the spawned task alive; dropping all clones (on cache
/// eviction via `QueryEngine::invalidate_file`) cancels it. Query tasks are intentionally omitted
/// from `Analyzer::active_handles` — they are anchored by their cache entries, and any task that
/// outlives a cancelled run only populates the cache.
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
