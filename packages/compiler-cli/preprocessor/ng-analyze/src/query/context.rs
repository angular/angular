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

    pub fn extend_dependencies(&self, deps: impl IntoIterator<Item = FileId>) {
        if let Ok(mut guard) = self.dependencies.lock() {
            guard.extend(deps);
        }
    }

    pub fn dependencies(&self) -> HashSet<FileId> {
        if let Ok(guard) = self.dependencies.lock() {
            guard.clone()
        } else {
            HashSet::new()
        }
    }

    async fn query_with_deps(&self, key: QueryKey) -> Arc<QueryValue> {
        let cached = self.engine.query(key).await;
        self.extend_dependencies(cached.dependencies.iter().copied());
        cached.value.clone()
    }

    pub async fn analyze_file_semantic(&self, file_id: FileId) -> Arc<FileData> {
        match &*self
            .query_with_deps(QueryKey::AnalyzeFileSemantic(file_id))
            .await
        {
            QueryValue::Semantic(r) => r.clone(),
            _ => unreachable!("AnalyzeFileSemantic must yield Semantic"),
        }
    }

    pub async fn analyze_file_wire(
        &self,
        file_id: FileId,
        is_optimized: bool,
    ) -> Arc<crate::query::keys::WireFileResult> {
        use futures::FutureExt;
        let key = QueryKey::AnalyzeFileWire {
            file_id,
            is_optimized,
        };
        let cached = if let Some(shared) = self.engine.cache.get(&key) {
            shared.await
        } else {
            let res = self.engine.clone().execute(key).await;
            let (remote, handle) = futures::future::ready(res.clone()).remote_handle();
            let _ = remote.now_or_never();
            self.engine.cache.insert(key, handle.shared());
            res
        };
        self.extend_dependencies(cached.dependencies.iter().copied());
        match &*cached.value {
            QueryValue::Wire(r) => r.clone(),
            _ => unreachable!("AnalyzeFileWire must yield Wire"),
        }
    }

    pub async fn analyze_file_syntax(&self, file_id: FileId) -> Arc<FileData> {
        match &*self
            .query_with_deps(QueryKey::AnalyzeFileSyntax(file_id))
            .await
        {
            QueryValue::Syntax(r) => r.clone(),
            _ => unreachable!("AnalyzeFileSyntax must yield Syntax"),
        }
    }

    /// The file's analysis with declaration metadata evaluated across files
    /// ([`QueryKey::AnalyzeFileEvaluated`]).
    pub async fn analyze_file_evaluated(&self, file_id: FileId) -> Arc<FileData> {
        match &*self
            .query_with_deps(QueryKey::AnalyzeFileEvaluated(file_id))
            .await
        {
            QueryValue::Evaluated(r) => r.clone(),
            _ => unreachable!("AnalyzeFileEvaluated must yield Evaluated"),
        }
    }

    /// Resolve [`crate::analyzer::WireContext::declaring_exports`] for `file_data`.
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

    /// The name `reference`'s declaring file publishes it under, or `None` if unexported.
    pub async fn declaring_export_name(
        &self,
        reference: &crate::types::analysis::Reference,
    ) -> Option<String> {
        self.analyze_file_syntax(reference.file)
            .await
            .exported_name_of(&reference.name)
    }

    pub async fn parse_file(&self, file_id: FileId) -> Arc<Mutex<crate::ParsedFile>> {
        match &*self.query_with_deps(QueryKey::ParseFile(file_id)).await {
            QueryValue::ParsedFile(r) => r.clone(),
            _ => unreachable!("ParseFile must yield ParsedFile"),
        }
    }

    pub async fn ngmodule_exports_scope(
        &self,
        reference_id: ReferenceId,
    ) -> Arc<Vec<DeclarationData>> {
        match &*self
            .query_with_deps(QueryKey::NgModuleExportsScope(reference_id))
            .await
        {
            QueryValue::Scope(r) => r.clone(),
            _ => unreachable!("NgModuleExportsScope must yield Scope"),
        }
    }

    /// Cached export map of a package entry point (upstream's `moduleExportsCache`).
    pub async fn module_export_map(
        &self,
        file_id: FileId,
    ) -> Arc<crate::query::keys::ModuleExportMap> {
        match &*self
            .query_with_deps(QueryKey::ModuleExportMap(file_id))
            .await
        {
            QueryValue::ExportMap(r) => r.clone(),
            _ => unreachable!("ModuleExportMap must yield ExportMap"),
        }
    }

    pub async fn ngmodule_imports_scope(
        &self,
        reference_id: ReferenceId,
    ) -> Arc<crate::query::keys::NgModuleImportsScopeData> {
        match &*self
            .query_with_deps(QueryKey::NgModuleImportsScope(reference_id))
            .await
        {
            QueryValue::ImportsScope(r) => r.clone(),
            _ => unreachable!("NgModuleImportsScope must yield ImportsScope"),
        }
    }

    pub fn record_component_mapping_deps(&self, mapping: &NgModuleComponentMap, file_id: FileId) {
        self.record_file(file_id);
        if let Some(deps) = mapping.file_dependencies.get(&file_id) {
            self.extend_dependencies(deps.iter().copied());
        }
    }

    pub async fn component_mapping(&self) -> Arc<NgModuleComponentMap> {
        self.record_file(crate::query::engine::ROOTS_FILE_ID);
        let key = QueryKey::ComponentMapping;
        let cached = self.engine.query(key).await;
        match &*cached.value {
            QueryValue::ComponentMap(r) => r.clone(),
            _ => unreachable!("ComponentMapping must yield ComponentMap"),
        }
    }

    pub async fn component_mapping_for(&self, file_id: FileId) -> Arc<NgModuleComponentMap> {
        let mapping = self.component_mapping().await;
        self.record_component_mapping_deps(&mapping, file_id);
        mapping
    }

    pub fn record_ngmodule_scope_deps(
        &self,
        registry: &crate::query::module_scope::NgModuleScopeRegistry,
        module: ReferenceId,
    ) {
        self.record_file(module.file);
        if let Some(deps) = registry.module_dependencies(module) {
            self.extend_dependencies(deps.iter().copied());
        }
    }

    pub async fn ngmodule_scope_registry(
        &self,
    ) -> Arc<crate::query::module_scope::NgModuleScopeRegistry> {
        self.record_file(crate::query::engine::ROOTS_FILE_ID);
        let key = QueryKey::NgModuleScopeRegistry;
        let cached = self.engine.query(key).await;
        match &*cached.value {
            QueryValue::ScopeRegistry(r) => r.clone(),
            _ => unreachable!("NgModuleScopeRegistry must yield ScopeRegistry"),
        }
    }

    pub async fn ngmodule_scope_registry_for(
        &self,
        module: ReferenceId,
    ) -> Arc<crate::query::module_scope::NgModuleScopeRegistry> {
        let registry = self.ngmodule_scope_registry().await;
        self.record_ngmodule_scope_deps(&registry, module);
        registry
    }

    pub async fn local_extra_imports(&self) -> Arc<crate::query::keys::LocalExtraImportsData> {
        let key = QueryKey::LocalExtraImports;
        let cached = self.engine.query(key).await;
        self.record_file(crate::query::engine::ROOTS_FILE_ID);
        let data = match &*cached.value {
            QueryValue::LocalExtraImports(r) => r.clone(),
            _ => unreachable!("LocalExtraImports must yield LocalExtraImports"),
        };
        self.extend_dependencies(data.entrypoints_ids.iter().copied());
        data
    }

    /// Tsconfig roots plus their import closure, including dynamic imports ([`QueryKey::ProgramFiles`]).
    pub async fn program_files(&self) -> Arc<Vec<FileId>> {
        match &*self.query_with_deps(QueryKey::ProgramFiles).await {
            QueryValue::ProgramFiles(r) => r.clone(),
            _ => unreachable!("ProgramFiles must yield ProgramFiles"),
        }
    }

    pub async fn ambient_module_files(&self) -> Arc<crate::query::keys::AmbientModuleFiles> {
        match &*self.query_with_deps(QueryKey::AmbientModuleFiles).await {
            QueryValue::AmbientModuleFiles(r) => r.clone(),
            _ => unreachable!("AmbientModuleFiles must yield AmbientModuleFiles"),
        }
    }

    pub async fn has_path(&self, start: FileId, target: FileId) -> bool {
        self.record_file(crate::query::engine::ROOTS_FILE_ID);
        let graph = self.engine.get_or_build_import_graph().await;
        let (found, visited) = graph.has_path_with_deps(start, target);
        self.extend_dependencies(visited);
        found
    }
}

impl<Fs: ResourceResolverFs + Clone + 'static> std::ops::Deref for QueryContext<Fs> {
    type Target = QueryEngine<Fs>;

    fn deref(&self) -> &Self::Target {
        &self.engine
    }
}
