#![cfg(target_arch = "wasm32")]

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
    /// Constructs an analyzer with an optional JavaScript filesystem bridge (`WasmHostFs`).
    /// Without `host_fs`, only `virtualFiles` are visible.
    #[wasm_bindgen(constructor)]
    pub fn new(
        options_json: &str,
        host_fs: Option<crate::physical_fs::JsHostFs>,
    ) -> Result<WasmAnalyzer, String> {
        let options: AnalyzerOptions =
            serde_json::from_str(options_json).map_err(|e| e.to_string())?;

        let physical: Arc<dyn crate::physical_fs::PhysicalFs> = match host_fs {
            Some(host) => Arc::new(crate::physical_fs::HostFs::new(host)),
            // `std::fs` compiles on wasm32 but fails at runtime, so without a host only virtual
            // files exist.
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
