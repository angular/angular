#![cfg(target_arch = "wasm32")]

use crate::compiler::analyzer::{get_local_spawner, step_local_pool};
use crate::{Analyzer, AnalyzerOptions, CompilationChunk, FileInvalidation, FileUpdate};
use futures::channel::{mpsc, oneshot};
use futures::prelude::*;
use std::collections::BTreeMap;
use std::sync::Arc;
use wasm_bindgen::prelude::*;

type MetadataReceiver = oneshot::Receiver<Result<Option<crate::AnalysisResult>, String>>;

#[wasm_bindgen]
pub struct WasmAnalyzer {
    analyzer: Arc<Analyzer>,
    next_id: u32,
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
            return serde_json::to_string(&WasmStreamEvent::AnalysisComplete { id }).ok();
        };

        match res {
            Ok(chunk) => {
                serde_json::to_string(&WasmStreamEvent::AnalysisResult { id, data: &chunk }).ok()
            }
            Err(e) => {
                self.receivers.remove(&id);
                serde_json::to_string(&WasmStreamEvent::AnalysisError { id, error: &e }).ok()
            }
        }
    }

    fn try_poll_metadata_receiver(&mut self, id: u32) -> Option<String> {
        let rx = self.metadata_receivers.get_mut(&id)?;
        match rx.try_recv() {
            Ok(None) => None,
            Ok(Some(Ok(data))) => {
                self.metadata_receivers.remove(&id);
                serde_json::to_string(&WasmStreamEvent::MetadataResult {
                    id,
                    data: data.as_ref(),
                    error: None,
                })
                .ok()
            }
            Ok(Some(Err(err))) => {
                self.metadata_receivers.remove(&id);
                serde_json::to_string(&WasmStreamEvent::MetadataResult {
                    id,
                    data: None,
                    error: Some(&err),
                })
                .ok()
            }
            Err(_) => {
                self.metadata_receivers.remove(&id);
                serde_json::to_string(&WasmStreamEvent::MetadataResult {
                    id,
                    data: None,
                    error: Some("Metadata request cancelled"),
                })
                .ok()
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
            metadata_receivers: BTreeMap::new(),
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
    /// Dropping the receiver closes the channel. The engine's sends to a closed channel
    /// are ignored, so the analysis is no longer observed but is not cancelled. The NAPI
    /// `AnalysisIterator` behaves the same way when it is dropped. Closing a stream that
    /// already ended, or an unknown id, does nothing.
    pub fn close_stream(&mut self, id: u32) {
        self.receivers.remove(&id);
        self.metadata_receivers.remove(&id);
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

    pub fn set_entry_points(&self, entry_points_json: &str) -> Result<String, String> {
        let entry_points: Vec<String> =
            serde_json::from_str(entry_points_json).map_err(|e| e.to_string())?;
        let res = self.analyzer.set_entry_points_core(entry_points)?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn clear_resolution_cache(&self) -> Result<String, String> {
        let res = self.analyzer.clear_resolution_cache_core()?;
        serde_json::to_string(&res).map_err(|e| e.to_string())
    }

    pub fn is_synchronous_host(&self) -> bool {
        self.analyzer.is_synchronous_host()
    }

    pub fn get_ts_file_for_template(&self, template_path: String) -> Option<String> {
        let res = self.analyzer.get_ts_file_for_template_core(template_path)?;
        serde_json::to_string(&res).ok()
    }

    pub fn get_file_content(&self, file_path: String) -> Result<String, String> {
        self.analyzer.get_file_content_core(file_path)
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

        let meta_ids: Vec<u32> = self.metadata_receivers.keys().copied().collect();
        for id in meta_ids {
            if let Some(event) = self.try_poll_metadata_receiver(id) {
                return Some(event);
            }
        }

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
