#![allow(clippy::too_many_arguments)]
// See the matching comment in `lib.rs`. stdout is this binary's JSON-RPC channel, so writes to
// it are part of the protocol and must be deliberate; everything else stays silent.
#![deny(clippy::print_stdout, clippy::print_stderr, clippy::dbg_macro)]
#![cfg_attr(test, allow(clippy::print_stdout, clippy::print_stderr))]

use futures::StreamExt;
use ng_analyze::{Analyzer, AnalyzerOptions, CompilationChunk, FileInvalidation, FileUpdate};
use serde::{Deserialize, Serialize};
use std::io::{self, BufRead, Write};

#[derive(Deserialize)]
struct RpcRequest {
    id: u64,
    method: String,
    params: serde_json::Value,
}

#[derive(Serialize)]
struct RpcResponse {
    id: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    result: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Deserialize)]
struct FilePathParam {
    #[serde(rename = "filePath")]
    file_path: String,
}

#[derive(Deserialize)]
struct TemplatePathParam {
    #[serde(rename = "templatePath")]
    template_path: String,
}

#[cfg(target_arch = "wasm32")]
fn main() {}

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    let stdin = io::stdin();
    let mut analyzer: Option<Analyzer> = None;

    for line in stdin.lock().lines() {
        let Ok(line) = line else {
            // stdout is the JSON-RPC channel, so transport-level failures have to go to
            // stderr instead.
            #[allow(clippy::print_stderr)]
            {
                eprintln!("Error reading stdin");
            }
            break;
        };

        if line.trim().is_empty() {
            continue;
        }

        let Ok(req) = serde_json::from_str::<RpcRequest>(&line) else {
            // The request did not deserialize, so no `id` can be trusted for a reply and
            // there is no well-formed RPC response to write.
            // TODO: the client's pending promise is left unresolved by this path.
            #[allow(clippy::print_stderr)]
            {
                eprintln!("Failed to parse RPC request");
            }
            continue;
        };

        let response = handle_rpc_request(req, &mut analyzer);
        // stdout IS the JSON-RPC response channel for the sidecar; this is the protocol,
        // not logging. `send_notification` below writes the async half of the same channel.
        #[allow(clippy::print_stdout)]
        {
            println!("{}", serde_json::to_string(&response).unwrap());
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn spawn_analysis_stream(
    mut rx: futures::channel::mpsc::UnboundedReceiver<Result<CompilationChunk, String>>,
) {
    std::thread::spawn(move || {
        while let Some(res) = futures::executor::block_on(rx.next()) {
            match res {
                Ok(result) => send_notification("analysisResult", result),
                Err(e) => {
                    send_notification("analysisError", e);
                    return;
                }
            }
        }
        send_notification("analysisComplete", serde_json::Value::Null);
    });
}

#[cfg(not(target_arch = "wasm32"))]
fn handle_rpc_request(req: RpcRequest, analyzer: &mut Option<Analyzer>) -> RpcResponse {
    if req.method == "initialize" {
        let Ok(options) = serde_json::from_value::<AnalyzerOptions>(req.params) else {
            return RpcResponse {
                id: req.id,
                result: None,
                error: Some("Invalid initialize params".to_string()),
            };
        };
        return match Analyzer::new_core(options) {
            Ok(a) => {
                *analyzer = Some(a);
                RpcResponse {
                    id: req.id,
                    result: Some(serde_json::Value::Null),
                    error: None,
                }
            }
            Err(e) => RpcResponse {
                id: req.id,
                result: None,
                error: Some(format!("Failed to initialize analyzer: {}", e)),
            },
        };
    }

    let Some(ref a) = *analyzer else {
        return RpcResponse {
            id: req.id,
            result: None,
            error: Some("Analyzer not initialized".to_string()),
        };
    };

    match req.method.as_str() {
        "analyze" => {
            match a.analyze_core(ng_analyze::compiler::analyzer::get_global_pool().clone()) {
                Ok(rx) => {
                    spawn_analysis_stream(rx);
                    RpcResponse {
                        id: req.id,
                        result: Some(serde_json::Value::Null),
                        error: None,
                    }
                }
                Err(e) => RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some(e),
                },
            }
        }
        "analyze_optimized" | "analyzeOptimized" => {
            match a
                .analyze_optimized_core(ng_analyze::compiler::analyzer::get_global_pool().clone())
            {
                Ok(rx) => {
                    spawn_analysis_stream(rx);
                    RpcResponse {
                        id: req.id,
                        result: Some(serde_json::Value::Null),
                        error: None,
                    }
                }
                Err(e) => RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some(e),
                },
            }
        }
        "analyze_delta" | "analyzeDelta" => {
            match a.analyze_delta_core(ng_analyze::compiler::analyzer::get_global_pool().clone()) {
                Ok(rx) => {
                    spawn_analysis_stream(rx);
                    RpcResponse {
                        id: req.id,
                        result: Some(serde_json::Value::Null),
                        error: None,
                    }
                }
                Err(e) => RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some(e),
                },
            }
        }
        "analyze_optimized_delta" | "analyzeOptimizedDelta" => {
            match a.analyze_optimized_delta_core(
                ng_analyze::compiler::analyzer::get_global_pool().clone(),
            ) {
                Ok(rx) => {
                    spawn_analysis_stream(rx);
                    RpcResponse {
                        id: req.id,
                        result: Some(serde_json::Value::Null),
                        error: None,
                    }
                }
                Err(e) => RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some(e),
                },
            }
        }
        "getMetadataForFile" => {
            let Ok(param) = serde_json::from_value::<FilePathParam>(req.params) else {
                return RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some("Invalid getMetadataForFile params".to_string()),
                };
            };
            let meta = a.get_metadata_for_file(param.file_path);
            RpcResponse {
                id: req.id,
                result: Some(serde_json::to_value(&meta).unwrap()),
                error: None,
            }
        }
        "updateFileContent" => {
            let Ok(updates) = serde_json::from_value::<Vec<FileUpdate>>(req.params) else {
                return RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some("Invalid updateFileContent params".to_string()),
                };
            };
            match a.update_file_content_core(updates) {
                Ok(res) => RpcResponse {
                    id: req.id,
                    result: Some(serde_json::to_value(&res).unwrap()),
                    error: None,
                },
                Err(e) => RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some(e),
                },
            }
        }
        "invalidateFiles" => {
            let Ok(updates) = serde_json::from_value::<Vec<FileInvalidation>>(req.params) else {
                return RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some("Invalid invalidateFiles params".to_string()),
                };
            };
            match a.invalidate_files_core(updates) {
                Ok(res) => RpcResponse {
                    id: req.id,
                    result: Some(serde_json::to_value(&res).unwrap()),
                    error: None,
                },
                Err(e) => RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some(e),
                },
            }
        }
        "getTsFileForTemplate" => {
            let Ok(param) = serde_json::from_value::<TemplatePathParam>(req.params) else {
                return RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some("Invalid getTsFileForTemplate params".to_string()),
                };
            };
            let res = a.get_ts_file_for_template_core(param.template_path);
            RpcResponse {
                id: req.id,
                result: Some(serde_json::to_value(&res).unwrap()),
                error: None,
            }
        }
        "getFileContent" => {
            let Ok(param) = serde_json::from_value::<FilePathParam>(req.params) else {
                return RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some("Invalid getFileContent params".to_string()),
                };
            };
            match a.get_file_content_core(param.file_path) {
                Ok(res) => RpcResponse {
                    id: req.id,
                    result: Some(serde_json::to_value(&res).unwrap()),
                    error: None,
                },
                Err(e) => RpcResponse {
                    id: req.id,
                    result: None,
                    error: Some(e),
                },
            }
        }

        _ => RpcResponse {
            id: req.id,
            result: None,
            error: Some(format!("Unknown method: {}", req.method)),
        },
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn send_notification<T: Serialize>(method: &str, params: T) {
    let msg = serde_json::json!({
        "method": method,
        "params": params
    });
    let stdout = std::io::stdout();
    let mut handle = stdout.lock();
    serde_json::to_writer(&mut handle, &msg).unwrap();
    handle.write_all(b"\n").unwrap();
    handle.flush().unwrap();
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_rpc_initialize_and_analyze() {
        let mut virtual_files = HashMap::new();
        virtual_files.insert(
            "/project/tsconfig.json".to_string(),
            r#"{"files": ["app.ts"]}"#.to_string(),
        );
        virtual_files.insert(
            "/project/app.ts".to_string(),
            "export class AppComponent {}".to_string(),
        );

        let mut analyzer = None;
        let init_req = RpcRequest {
            id: 1,
            method: "initialize".to_string(),
            params: serde_json::json!({
                "tsconfigPath": "/project/tsconfig.json",
                "virtualFiles": virtual_files
            }),
        };

        let res = handle_rpc_request(init_req, &mut analyzer);
        assert!(res.error.is_none(), "Expected success, got {:?}", res.error);
        assert!(analyzer.is_some());

        let analyze_req = RpcRequest {
            id: 2,
            method: "analyze_optimized".to_string(),
            params: serde_json::Value::Null,
        };
        let res2 = handle_rpc_request(analyze_req, &mut analyzer);
        assert!(res2.error.is_none());

        let analyze_req2 = RpcRequest {
            id: 3,
            method: "analyzeOptimized".to_string(),
            params: serde_json::Value::Null,
        };
        let res3 = handle_rpc_request(analyze_req2, &mut analyzer);
        assert!(res3.error.is_none());

        let delta_req = RpcRequest {
            id: 4,
            method: "analyze_delta".to_string(),
            params: serde_json::Value::Null,
        };
        let res4 = handle_rpc_request(delta_req, &mut analyzer);
        assert!(res4.error.is_none());

        let delta_req2 = RpcRequest {
            id: 5,
            method: "analyzeOptimizedDelta".to_string(),
            params: serde_json::Value::Null,
        };
        let res5 = handle_rpc_request(delta_req2, &mut analyzer);
        assert!(res5.error.is_none());
    }
}
