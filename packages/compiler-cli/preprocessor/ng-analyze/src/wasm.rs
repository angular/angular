#![cfg(target_arch = "wasm32")]

// WebAssembly (WASI/emnapi) does not support standard OS-level thread-parking/unparking primitives,
// which causes standard executors like `futures::executor::block_on` to panic when driving futures.
//
// To prevent this, we conditionally compile a custom zero-dependency cooperative spin-yield executor
// (`wasm_block_on`) for `wasm32` targets, and fallback to standard optimized `futures::executor::block_on`
// for native NAPI platforms to allow native OS thread-parking optimizations.
#[allow(unsafe_code)]
pub fn wasm_block_on<F: std::future::Future>(mut future: F) -> F::Output {
    use std::pin::Pin;
    use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};

    // Create a no-op waker
    fn dummy_clone(_: *const ()) -> RawWaker {
        RawWaker::new(std::ptr::null(), &VTABLE)
    }
    fn dummy_wake(_: *const ()) {}
    fn dummy_wake_by_ref(_: *const ()) {}
    fn dummy_drop(_: *const ()) {}

    static VTABLE: RawWakerVTable =
        RawWakerVTable::new(dummy_clone, dummy_wake, dummy_wake_by_ref, dummy_drop);

    // SAFETY: The static VTABLE consists only of valid, safe, zero-argument no-op functions
    // that do not dereference the null pointer, satisfying all RawWakerVTable contract invariants.
    let waker = unsafe { Waker::from_raw(RawWaker::new(std::ptr::null(), &VTABLE)) };
    let mut context = Context::from_waker(&waker);
    // SAFETY: The future is pinned on the stack of this synchronous function and is guaranteed
    // not to be moved before it is dropped at the end of this function call, satisfying all Pin invariants.
    let mut future = unsafe { Pin::new_unchecked(&mut future) };

    loop {
        match future.as_mut().poll(&mut context) {
            Poll::Ready(val) => return val,
            Poll::Pending => {
                std::thread::yield_now();
            }
        }
    }
}

use crate::compiler::analyzer::{get_local_spawner, step_local_pool};
use crate::{Analyzer, AnalyzerOptions, CompilationChunk, FileInvalidation, FileUpdate};
use futures::channel::mpsc;
use futures::prelude::*;
use std::collections::BTreeMap;
use std::sync::Arc;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmAnalyzer {
    analyzer: Arc<Analyzer>,
    next_id: u32,
    receivers: BTreeMap<u32, mpsc::UnboundedReceiver<Result<CompilationChunk, String>>>,
}

impl WasmAnalyzer {
    fn try_poll_receiver(&mut self, id: u32) -> Option<String> {
        let Some(rx) = self.receivers.get_mut(&id) else {
            return None;
        };
        let Some(res_opt) = rx.next().now_or_never() else {
            return None;
        };
        let Some(res) = res_opt else {
            self.receivers.remove(&id);
            let Ok(json) = serde_json::to_string(&serde_json::json!({
                "event": "analysisComplete",
                "id": id
            })) else {
                return None;
            };
            return Some(json);
        };

        match res {
            Ok(chunk) => {
                let Ok(json) = serde_json::to_string(&serde_json::json!({
                    "event": "analysisResult",
                    "id": id,
                    "data": chunk
                })) else {
                    return None;
                };
                Some(json)
            }
            Err(e) => {
                self.receivers.remove(&id);
                let Ok(json) = serde_json::to_string(&serde_json::json!({
                    "event": "analysisError",
                    "id": id,
                    "error": e
                })) else {
                    return None;
                };
                Some(json)
            }
        }
    }
}

#[wasm_bindgen]
impl WasmAnalyzer {
    /// Constructs an analyzer.
    ///
    /// `host_fs` is an optional JavaScript filesystem bridge (see `WasmHostFs` in
    /// `src/wasm_host_fs.ts`). This target has no OS beneath it, so without a host the
    /// engine can only see files supplied through `virtualFiles` — which is the
    /// historical behaviour and remains available by omitting the argument.
    #[wasm_bindgen(constructor)]
    pub fn new(
        options_json: &str,
        host_fs: Option<crate::physical_fs::JsHostFs>,
    ) -> Result<WasmAnalyzer, String> {
        let options: AnalyzerOptions =
            serde_json::from_str(options_json).map_err(|e| e.to_string())?;

        // The host belongs to this analyzer's filesystem, so two WasmAnalyzers in one
        // process can read from different sources without interfering.
        let physical: Arc<dyn crate::physical_fs::PhysicalFs> = match host_fs {
            Some(host) => Arc::new(crate::physical_fs::HostFs::new(host)),
            // No host: virtual files only. `std::fs` exists on this target but fails
            // at runtime for every call, so nothing on disk is reachable.
            None => Arc::new(crate::physical_fs::NoopFs),
        };

        let analyzer = Analyzer::new_core_with_physical_fs(options, physical)?;
        Ok(Self {
            analyzer: Arc::new(analyzer),
            next_id: 1,
            receivers: BTreeMap::new(),
        })
    }

    pub fn analyze(&mut self) -> Result<u32, String> {
        let rx = self.analyzer.analyze_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        self.receivers.insert(id, rx);
        Ok(id)
    }

    pub fn analyze_optimized(&mut self) -> Result<u32, String> {
        let rx = self.analyzer.analyze_optimized_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        self.receivers.insert(id, rx);
        Ok(id)
    }

    pub fn analyze_delta(&mut self) -> Result<u32, String> {
        let rx = self.analyzer.analyze_delta_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        self.receivers.insert(id, rx);
        Ok(id)
    }

    pub fn analyze_optimized_delta(&mut self) -> Result<u32, String> {
        let rx = self
            .analyzer
            .analyze_optimized_delta_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        self.receivers.insert(id, rx);
        Ok(id)
    }

    /// Releases the stream `id` when its consumer stops reading before it ends.
    ///
    /// Dropping the receiver closes the channel. The engine's sends to a closed channel
    /// are ignored, so the analysis is no longer observed but is not cancelled. The NAPI
    /// `AnalysisIterator` behaves the same way when it is dropped. Closing a stream that
    /// already ended, or an unknown id, does nothing.
    pub fn close_stream(&mut self, id: u32) {
        self.receivers.remove(&id);
    }

    pub fn update_file_content(&self, updates_json: &str) -> Result<String, String> {
        let updates: Vec<FileUpdate> =
            serde_json::from_str(updates_json).map_err(|e| e.to_string())?;
        let res = self.analyzer.update_file_content_core(updates)?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn invalidate_files(&self, updates_json: &str) -> Result<String, String> {
        let updates: Vec<FileInvalidation> =
            serde_json::from_str(updates_json).map_err(|e| e.to_string())?;
        let res = self.analyzer.invalidate_files_core(updates)?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn get_ts_file_for_template(&self, template_path: String) -> Option<String> {
        let res = self.analyzer.get_ts_file_for_template_core(template_path)?;
        serde_json::to_string(&res).ok()
    }

    pub fn get_file_content(&self, file_path: String) -> Result<String, String> {
        self.analyzer.get_file_content_core(file_path)
    }

    pub fn get_metadata_for_file(&self, file_path: String) -> Option<String> {
        let res = self.analyzer.get_metadata_for_file(file_path)?;
        serde_json::to_string(&res).ok()
    }

    pub fn pump(&mut self) -> Option<String> {
        step_local_pool();

        let ids: Vec<u32> = self.receivers.keys().copied().collect();
        for id in ids {
            let Some(event) = self.try_poll_receiver(id) else {
                continue;
            };
            return Some(event);
        }
        None
    }
}
