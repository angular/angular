#![cfg(target_arch = "wasm32")]

use crate::compiler::analyzer::{get_local_spawner, step_local_pool, try_step_local_pool};
use crate::{Analyzer, AnalyzerOptions, CompilationChunk, FileInvalidation, FileUpdate};
use futures::channel::{mpsc, oneshot};
use futures::prelude::*;
use std::collections::BTreeMap;
use std::sync::{Arc, Mutex};
use wasm_bindgen::prelude::*;

type MetadataReceiver = oneshot::Receiver<Result<Option<crate::AnalysisResult>, String>>;

#[wasm_bindgen]
pub struct WasmAnalyzer {
    analyzer: Arc<Analyzer>,
    next_id: u32,
    active_stream_id: Mutex<Option<u32>>,
    receivers: BTreeMap<u32, mpsc::UnboundedReceiver<Result<CompilationChunk, String>>>,
    metadata_receivers: BTreeMap<u32, MetadataReceiver>,
}

#[derive(serde::Serialize)]
#[serde(tag = "event")]
enum WasmStreamEvent<'a> {
    #[serde(rename = "analysisResult")]
    AnalysisResult { id: u32, data: &'a CompilationChunk },
    #[serde(rename = "analysisComplete")]
    AnalysisComplete { id: u32 },
    #[serde(rename = "analysisError")]
    AnalysisError { id: u32, error: &'a str },
    #[serde(rename = "metadataResult")]
    MetadataResult {
        id: u32,
        data: Option<&'a crate::AnalysisResult>,
        #[serde(skip_serializing_if = "Option::is_none")]
        error: Option<&'a str>,
    },
    #[serde(rename = "hostRequests")]
    HostRequests {
        id: u32,
        resolve: &'a [crate::host::WireResolveRequest],
        load: &'a [crate::host::WireLoadRequest],
    },
}

impl WasmAnalyzer {
    fn clear_active_stream_if_eq(&self, id: u32) {
        let mut active = self.active_stream_id.lock().unwrap();
        if *active == Some(id) {
            *active = None;
        }
    }

    fn try_poll_receiver(&mut self, id: u32) -> Option<String> {
        let Some(rx) = self.receivers.get_mut(&id) else {
            return None;
        };
        let Some(res_opt) = rx.next().now_or_never() else {
            return None;
        };
        let Some(res) = res_opt else {
            self.receivers.remove(&id);
            self.clear_active_stream_if_eq(id);
            return serde_json::to_string(&WasmStreamEvent::AnalysisComplete { id }).ok();
        };

        match res {
            Ok(chunk) => {
                serde_json::to_string(&WasmStreamEvent::AnalysisResult { id, data: &chunk }).ok()
            }
            Err(e) => {
                self.receivers.remove(&id);
                self.clear_active_stream_if_eq(id);
                serde_json::to_string(&WasmStreamEvent::AnalysisError { id, error: &e }).ok()
            }
        }
    }

    fn poll_next_metadata_event(&mut self) -> Option<String> {
        let (id, outcome) =
            self.metadata_receivers
                .iter_mut()
                .find_map(|(&id, rx)| match rx.try_recv() {
                    Ok(None) => None,
                    Ok(Some(res)) => Some((id, Some(res))),
                    Err(_) => Some((id, None)),
                })?;
        self.metadata_receivers.remove(&id);
        let failed = |error: &str| {
            serde_json::to_string(&WasmStreamEvent::MetadataResult {
                id,
                data: None,
                error: Some(error),
            })
        };
        let event = match outcome {
            Some(Ok(data)) => serde_json::to_string(&WasmStreamEvent::MetadataResult {
                id,
                data: data.as_ref(),
                error: None,
            })
            .or_else(|err| failed(&err.to_string())),
            Some(Err(err)) => failed(&err),
            None => failed("Metadata request cancelled"),
        };
        event.ok()
    }
}

#[wasm_bindgen]
impl WasmAnalyzer {
    /// Constructs an analyzer backed either by `BatchingHost` (`use_batching_host == Some(true)`)
    /// or by `DefaultFsHost` over an optional JavaScript filesystem bridge (`WasmHostFs`).
    #[wasm_bindgen(constructor)]
    pub fn new(
        options_json: &str,
        host_fs: Option<crate::physical_fs::JsHostFs>,
        use_batching_host: Option<bool>,
    ) -> Result<WasmAnalyzer, String> {
        let mut raw: serde_json::Value =
            serde_json::from_str(options_json).map_err(|e| e.to_string())?;
        let entry_refs: Option<Vec<crate::host::ModuleRef>> = match raw
            .as_object_mut()
            .and_then(|obj| obj.remove("entryPoints"))
        {
            Some(serde_json::Value::Null) | None => None,
            Some(val) => Some(serde_json::from_value(val).map_err(|e| e.to_string())?),
        };
        let options: AnalyzerOptions =
            serde_json::from_value(raw).map_err(|e| e.to_string())?;

        let analyzer = if use_batching_host == Some(true) {
            if host_fs.is_some() {
                return Err("host_fs cannot be combined with BatchingHost".to_string());
            }
            let (analyzer, _) =
                Analyzer::new_core_with_batching_host_and_entry_refs(options, entry_refs)?;
            analyzer
        } else {
            let physical: Arc<dyn crate::physical_fs::PhysicalFs> = match host_fs {
                Some(host) => Arc::new(crate::physical_fs::HostFs::new(host)),
                // `std::fs` compiles on wasm32 but fails at runtime, so without a host only virtual
                // files exist.
                None => Arc::new(crate::physical_fs::NoopFs),
            };
            Analyzer::new_core_with_physical_fs_and_entry_refs(options, entry_refs, physical)?
        };

        Ok(Self {
            analyzer: Arc::new(analyzer),
            next_id: 1,
            active_stream_id: Mutex::new(None),
            receivers: BTreeMap::new(),
            metadata_receivers: BTreeMap::new(),
        })
    }

    pub fn analyze(&mut self) -> Result<u32, String> {
        let rx = self.analyzer.analyze_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        *self.active_stream_id.lock().unwrap() = Some(id);
        self.receivers.insert(id, rx);
        Ok(id)
    }

    pub fn analyze_optimized(&mut self) -> Result<u32, String> {
        let rx = self.analyzer.analyze_optimized_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        *self.active_stream_id.lock().unwrap() = Some(id);
        self.receivers.insert(id, rx);
        Ok(id)
    }

    pub fn analyze_delta(&mut self) -> Result<u32, String> {
        let rx = self.analyzer.analyze_delta_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        *self.active_stream_id.lock().unwrap() = Some(id);
        self.receivers.insert(id, rx);
        Ok(id)
    }

    pub fn analyze_optimized_delta(&mut self) -> Result<u32, String> {
        let rx = self
            .analyzer
            .analyze_optimized_delta_core(get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        *self.active_stream_id.lock().unwrap() = Some(id);
        self.receivers.insert(id, rx);
        Ok(id)
    }

    pub fn request_metadata(&mut self, module_ref_json: &str) -> Result<u32, String> {
        let module_ref: crate::host::ModuleRef =
            serde_json::from_str(module_ref_json).map_err(|e| e.to_string())?;
        let rx = self
            .analyzer
            .request_metadata_core(module_ref, get_local_spawner())?;
        let id = self.next_id;
        self.next_id += 1;
        self.metadata_receivers.insert(id, rx);
        Ok(id)
    }

    /// Releases the stream or metadata request `id` when its consumer stops reading before it ends.
    ///
    /// On synchronous hosts, dropping the receiver closes the channel while allowing the engine to
    /// finish populating caches (matching N-API `AnalysisIterator`). On asynchronous hosts, closing
    /// the active stream (or the last in-flight metadata request) cancels parked queries and
    /// pending host batches so subsequent requests never block on an abandoned batch. Closing a
    /// stream that already ended, or an unknown id, does nothing.
    pub fn close_stream(&mut self, id: u32) {
        self.receivers.remove(&id);
        let removed_meta = self.metadata_receivers.remove(&id).is_some();
        let was_active_stream = {
            let mut active = self.active_stream_id.lock().unwrap();
            if *active == Some(id) {
                *active = None;
                true
            } else {
                false
            }
        };
        if self.analyzer.is_synchronous_host() {
            return;
        }
        if was_active_stream {
            self.analyzer.cancel_current_analysis();
        } else if removed_meta {
            try_step_local_pool();
            if self.active_stream_id.lock().unwrap().is_none() && self.metadata_receivers.is_empty()
            {
                self.analyzer.cancel_current_analysis();
            }
        }
    }

    pub fn update_file_content(&self, updates_json: &str) -> Result<String, String> {
        let updates: Vec<FileUpdate> =
            serde_json::from_str(updates_json).map_err(|e| e.to_string())?;
        *self.active_stream_id.lock().unwrap() = None;
        let res = self.analyzer.update_file_content_core(updates)?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn invalidate_files(&self, updates_json: &str) -> Result<String, String> {
        let updates: Vec<FileInvalidation> =
            serde_json::from_str(updates_json).map_err(|e| e.to_string())?;
        *self.active_stream_id.lock().unwrap() = None;
        let res = self.analyzer.invalidate_files_core(updates)?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn set_entry_points(&self, entry_points_json: &str) -> Result<String, String> {
        let entry_points: Vec<crate::host::ModuleRef> =
            serde_json::from_str(entry_points_json).map_err(|e| e.to_string())?;
        // Invalid entry points are rejected before the running stream is cancelled.
        let res = self.analyzer.set_entry_points_refs_core(entry_points)?;
        *self.active_stream_id.lock().unwrap() = None;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn clear_resolution_cache(&self) -> Result<String, String> {
        *self.active_stream_id.lock().unwrap() = None;
        let res = self.analyzer.clear_resolution_cache_core()?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn provide_host_results(&self, batch_id: u32, results_json: &str) -> Result<(), String> {
        let Some(batch_host) = self.analyzer.batching_host() else {
            return Err(
                "provideHostResults requires an analyzer configured with a host".to_string(),
            );
        };
        let results: crate::host::HostBatchResults =
            serde_json::from_str(results_json).map_err(|e| e.to_string())?;
        batch_host.provide_results(batch_id, results)
    }

    pub fn get_ts_file_for_template(&self, template_path: String) -> Option<String> {
        let res = self.analyzer.get_ts_file_for_template_core(template_path)?;
        serde_json::to_string(&res).ok()
    }

    pub fn get_file_content(&self, file_path: String) -> Result<String, String> {
        self.analyzer.get_file_content_core(file_path)
    }

    pub fn lookup_host_file_content(&self, file_path: String) -> Result<String, String> {
        let res = self.analyzer.lookup_host_file_content_core(file_path)?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn get_metadata_for_file(&self, file_path: String) -> Result<Option<String>, String> {
        let Some(res) = self.analyzer.get_metadata_for_file_checked(file_path)? else {
            return Ok(None);
        };
        serde_json::to_string(&res)
            .map(Some)
            .map_err(|e| e.to_string())
    }

    pub fn read_resource(
        &self,
        containing_file: String,
        url: String,
    ) -> Result<Option<String>, String> {
        let Some(res) = self.analyzer.read_resource_checked(containing_file, url)? else {
            return Ok(None);
        };
        serde_json::to_string(&res)
            .map(Some)
            .map_err(|e| e.to_string())
    }

    pub fn canonical_paths(&self, paths_json: &str) -> Result<String, String> {
        let paths: Vec<String> = serde_json::from_str(paths_json).map_err(|e| e.to_string())?;
        serde_json::to_string(&self.analyzer.canonical_paths_core(paths)).map_err(|e| e.to_string())
    }

    pub fn get_compiler_options(&self) -> String {
        self.analyzer.get_compiler_options()
    }

    pub fn pump(&mut self) -> Option<String> {
        step_local_pool();

        if let Some(event) = self.poll_next_metadata_event() {
            return Some(event);
        }

        let ids: Vec<u32> = self.receivers.keys().copied().collect();
        for id in ids {
            let Some(event) = self.try_poll_receiver(id) else {
                continue;
            };
            return Some(event);
        }

        let batch = self.analyzer.batching_host()?.take_pending_batch()?;
        serde_json::to_string(&WasmStreamEvent::HostRequests {
            id: batch.id,
            resolve: &batch.resolve,
            load: &batch.load,
        })
        .ok()
    }
}
