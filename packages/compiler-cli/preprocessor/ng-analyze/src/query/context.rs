use std::collections::HashSet;
use std::sync::{Arc, Mutex};

use crate::ResourceResolverFs;

use crate::query::engine::QueryEngine;
use crate::query::keys::{QueryKey, QueryValue};
use crate::query::{FileId, ReferenceId};
use crate::{types::analysis::DeclarationData, FileData, NgModuleComponentMap};

/// Context passed down during query execution to track dependencies.
#[derive(Clone)]
pub struct QueryContext<Fs: ResourceResolverFs + Clone + 'static> {
    pub engine: Arc<QueryEngine<Fs>>,
    pub(crate) dependencies: Arc<Mutex<HashSet<FileId>>>,
}

impl<Fs: ResourceResolverFs + Clone + 'static> std::fmt::Debug for QueryContext<Fs> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("QueryContext")
            .field("dependencies", &self.dependencies)
            .finish()
    }
}

impl<Fs: ResourceResolverFs + Clone + 'static> QueryContext<Fs> {
    pub fn new(engine: Arc<QueryEngine<Fs>>) -> Self {
        Self {
            engine,
            dependencies: Arc::new(Mutex::new(HashSet::new())),
        }
    }

    pub fn record_file(&self, file_id: FileId) {
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.insert(file_id);
        }
    }

    pub fn merge_subquery(&self, other: &QueryContext<Fs>) {
        let other_deps = other.dependencies();
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(other_deps);
        }
    }

    pub fn dependencies(&self) -> HashSet<FileId> {
        if let Ok(guard) = self.dependencies.lock() {
            guard.clone()
        } else {
            HashSet::new()
        }
    }

    // --- Typed accessors moved from QueryEngine ---

    pub async fn analyze_file_semantic(&self, file_id: FileId) -> Arc<FileData> {
        let key = QueryKey::AnalyzeFileSemantic(file_id);
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::Semantic(r) => r.clone(),
            _ => unreachable!("AnalyzeFileSemantic must yield Semantic"),
        }
    }

    pub async fn analyze_file_syntax(&self, file_id: FileId) -> Arc<FileData> {
        let key = QueryKey::AnalyzeFileSyntax(file_id);
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::Syntax(r) => r.clone(),
            _ => unreachable!("AnalyzeFileSyntax must yield Syntax"),
        }
    }

    /// The file's analysis with its declaration metadata evaluated across files
    /// ([`QueryKey::AnalyzeFileEvaluated`]): the symbol table to read a template dependency's
    /// selector, pipe name, `exportAs` and inputs/outputs from.
    pub async fn analyze_file_evaluated(&self, file_id: FileId) -> Arc<FileData> {
        let key = QueryKey::AnalyzeFileEvaluated(file_id);
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::Evaluated(r) => r.clone(),
            _ => unreachable!("AnalyzeFileEvaluated must yield Evaluated"),
        }
    }

    /// Resolve [`crate::analyzer::WireContext::declaring_exports`] for `file_data`: one syntax
    /// query per declaring file, then a purely local lookup in each.
    pub async fn declaring_export_names(
        &self,
        file_data: &FileData,
    ) -> crate::analyzer::import_emit::DeclaringExportNames {
        let mut wanted: std::collections::HashMap<FileId, Vec<String>> = Default::default();
        for (file, name) in file_data.wire_reference_decls() {
            wanted.entry(file).or_default().push(name);
        }
        let mut out = crate::analyzer::import_emit::DeclaringExportNames::new();
        for (file, names) in wanted {
            let syntax = self.analyze_file_syntax(file).await;
            for name in names {
                let exported = syntax.exported_name_of(&name);
                out.insert((file, name), exported);
            }
        }
        out
    }

    /// The name `reference`'s declaring file publishes it under, `None` when it publishes none.
    pub async fn declaring_export_name(
        &self,
        reference: &crate::types::analysis::Reference,
    ) -> Option<String> {
        self.analyze_file_syntax(reference.file)
            .await
            .exported_name_of(&reference.name)
    }

    pub async fn parse_file(&self, file_id: FileId) -> Arc<Mutex<crate::ParsedFile>> {
        let key = QueryKey::ParseFile(file_id);
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::ParsedFile(r) => r.clone(),
            _ => unreachable!("ParseFile must yield ParsedFile"),
        }
    }

    pub async fn ngmodule_exports_scope(
        &self,
        reference_id: ReferenceId,
    ) -> Arc<Vec<DeclarationData>> {
        let key = QueryKey::NgModuleExportsScope(reference_id);
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::Scope(r) => r.clone(),
            _ => unreachable!("NgModuleExportsScope must yield Scope"),
        }
    }

    /// The export map of a package entry point, built once per entry point and shared by every
    /// declaration that resolves through it — upstream's `moduleExportsCache`.
    pub async fn module_export_map(
        &self,
        file_id: FileId,
    ) -> Arc<crate::query::keys::ModuleExportMap> {
        let key = QueryKey::ModuleExportMap(file_id);
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::ExportMap(r) => r.clone(),
            _ => unreachable!("ModuleExportMap must yield ExportMap"),
        }
    }

    pub async fn ngmodule_imports_scope(
        &self,
        reference_id: ReferenceId,
    ) -> Arc<crate::query::keys::NgModuleImportsScopeData> {
        let key = QueryKey::NgModuleImportsScope(reference_id);
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::ImportsScope(r) => r.clone(),
            _ => unreachable!("NgModuleImportsScope must yield ImportsScope"),
        }
    }

    pub async fn component_mapping(&self) -> Arc<NgModuleComponentMap> {
        let key = QueryKey::ComponentMapping;
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::ComponentMap(r) => r.clone(),
            _ => unreachable!("ComponentMapping must yield ComponentMap"),
        }
    }

    /// The program's files: the tsconfig roots plus their import closure, dynamic imports
    /// included (see [`QueryKey::ProgramFiles`]). Records every file the closure was built from.
    pub async fn program_files(&self) -> Arc<Vec<FileId>> {
        let key = QueryKey::ProgramFiles;
        let cached = self.engine.query(key).await;
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(cached.dependencies.iter().copied());
        }
        match &*cached.value {
            QueryValue::ProgramFiles(r) => r.clone(),
            _ => unreachable!("ProgramFiles must yield ProgramFiles"),
        }
    }

    pub async fn has_path(&self, start: FileId, target: FileId) -> bool {
        let graph = self.engine.get_or_build_import_graph().await;
        graph.has_path(start, target)
    }
}

impl<Fs: ResourceResolverFs + Clone + 'static> std::ops::Deref for QueryContext<Fs> {
    type Target = QueryEngine<Fs>;

    fn deref(&self) -> &Self::Target {
        &self.engine
    }
}
