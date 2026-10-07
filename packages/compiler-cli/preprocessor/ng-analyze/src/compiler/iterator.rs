use crate::CompilationChunk;
use futures::channel::mpsc::UnboundedReceiver;
use futures::lock::Mutex;
use futures::StreamExt;
use std::sync::Arc;

#[cfg(feature = "napi")]
use napi_derive::napi;

/// Standalone iterator produced by `Analyzer::analyze()` for streaming results.
#[cfg_attr(feature = "napi", napi)]
#[derive(Clone)]
pub struct AnalysisIterator {
    receiver: Arc<Mutex<UnboundedReceiver<Result<CompilationChunk, String>>>>,
}

impl AnalysisIterator {
    pub fn new(receiver: UnboundedReceiver<Result<CompilationChunk, String>>) -> Self {
        Self {
            receiver: Arc::new(Mutex::new(receiver)),
        }
    }
}

#[cfg_attr(feature = "napi", napi)]
impl AnalysisIterator {
    #[cfg(feature = "napi")]
    #[napi]
    #[allow(clippy::should_implement_trait)]
    pub async fn next(&self) -> Result<Option<CompilationChunk>, napi::Error> {
        let mut guard = self.receiver.lock().await;
        match guard.next().await {
            Some(Ok(chunk)) => Ok(Some(chunk)),
            Some(Err(e)) => Err(napi::Error::from_reason(e)),
            None => Ok(None),
        }
    }

    #[cfg(not(feature = "napi"))]
    #[allow(clippy::should_implement_trait)]
    pub async fn next(&self) -> Result<Option<CompilationChunk>, String> {
        let mut guard = self.receiver.lock().await;
        match guard.next().await {
            Some(Ok(chunk)) => Ok(Some(chunk)),
            Some(Err(e)) => Err(e),
            None => Ok(None),
        }
    }
}
