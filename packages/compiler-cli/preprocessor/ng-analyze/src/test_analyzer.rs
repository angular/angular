#[cfg(feature = "napi")]
use napi_derive::napi;

use crate::compiler::{AnalysisIterator, Analyzer};
use crate::types::{AnalysisResult, AnalyzerOptions, FileInvalidation, FileUpdate};
use std::collections::HashMap;

/// Options for creating a test analyzer
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Default, Clone, Debug)]
pub struct TestAnalyzerOptions {
    /// Virtual files to use for analysis
    pub virtual_files: HashMap<String, String>,
    /// Whether to use optimized two-pass mode
    pub optimize: Option<bool>,
    /// Path to tsconfig.json (must be a virtual file path)
    pub tsconfig_path: String,
    /// Path to real node_modules for resolving @angular packages
    pub node_modules_path_override: Option<String>,
    /// Workspace name used by `PrefixImportStrategy` (e.g. "google3")
    pub workspace_name: Option<String>,
    /// Root directories for `PrefixImportStrategy`
    pub root_dirs: Option<Vec<String>>,
}

/// Test analyzer that uses virtual filesystem for in-memory testing
#[cfg_attr(feature = "napi", napi)]
pub struct TestAnalyzer {
    analyzer: Analyzer,
}

#[cfg_attr(feature = "napi", napi)]
impl TestAnalyzer {
    #[cfg(feature = "napi")]
    #[napi(constructor)]
    pub fn new(options: TestAnalyzerOptions) -> napi::Result<Self> {
        let analyzer = Analyzer::new(AnalyzerOptions {
            tsconfig_path: options.tsconfig_path,
            optimize: options.optimize,
            virtual_files: Some(options.virtual_files),
            node_modules_path_override: options.node_modules_path_override,
            allowed_sources: None,
            workspace_name: options.workspace_name,
            root_dirs: options.root_dirs,
        })?;

        Ok(TestAnalyzer { analyzer })
    }

    #[cfg(not(feature = "napi"))]
    pub fn new(options: TestAnalyzerOptions) -> Result<Self, String> {
        let analyzer = Analyzer::new(AnalyzerOptions {
            tsconfig_path: options.tsconfig_path,
            optimize: options.optimize,
            virtual_files: Some(options.virtual_files),
            node_modules_path_override: options.node_modules_path_override,
            allowed_sources: None,
            workspace_name: options.workspace_name,
            root_dirs: options.root_dirs,
        })?;

        Ok(TestAnalyzer { analyzer })
    }

    #[cfg_attr(feature = "napi", napi)]
    pub fn get_metadata_for_file(&self, file_path: String) -> Option<AnalysisResult> {
        self.analyzer.get_metadata_for_file(file_path)
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn get_file_content(&self, file_path: String) -> napi::Result<String> {
        self.analyzer.get_file_content(file_path)
    }

    #[cfg(not(feature = "napi"))]
    pub fn get_file_content(&self, file_path: String) -> Result<String, String> {
        self.analyzer.get_file_content(file_path)
    }

    #[cfg_attr(feature = "napi", napi)]
    pub fn get_ts_file_for_template(
        &self,
        template_path: String,
    ) -> Option<Vec<crate::TemplateUsage>> {
        self.analyzer.get_ts_file_for_template(template_path)
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn update_file_content(&self, updates: Vec<FileUpdate>) -> napi::Result<Vec<String>> {
        self.analyzer.update_file_content(updates)
    }

    #[cfg(not(feature = "napi"))]
    pub fn update_file_content(&self, updates: Vec<FileUpdate>) -> Result<Vec<String>, String> {
        self.analyzer.update_file_content(updates)
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn invalidate_files(&self, updates: Vec<FileInvalidation>) -> napi::Result<Vec<String>> {
        self.analyzer.invalidate_files(updates)
    }

    #[cfg(not(feature = "napi"))]
    pub fn invalidate_files(&self, updates: Vec<FileInvalidation>) -> Result<Vec<String>, String> {
        self.analyzer.invalidate_files(updates)
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze(&self) -> napi::Result<AnalysisIterator> {
        self.analyzer.analyze()
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze(&self) -> Result<AnalysisIterator, String> {
        self.analyzer.analyze()
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze_optimized(&self) -> napi::Result<AnalysisIterator> {
        self.analyzer.analyze_optimized()
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze_optimized(&self) -> Result<AnalysisIterator, String> {
        self.analyzer.analyze_optimized()
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze_delta(&self) -> napi::Result<AnalysisIterator> {
        self.analyzer.analyze_delta()
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze_delta(&self) -> Result<AnalysisIterator, String> {
        self.analyzer.analyze_delta()
    }

    #[cfg(feature = "napi")]
    #[napi]
    pub fn analyze_optimized_delta(&self) -> napi::Result<AnalysisIterator> {
        self.analyzer.analyze_optimized_delta()
    }

    #[cfg(not(feature = "napi"))]
    pub fn analyze_optimized_delta(&self) -> Result<AnalysisIterator, String> {
        self.analyzer.analyze_optimized_delta()
    }
}
