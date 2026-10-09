use std::collections::HashSet;
use std::sync::{Arc, Mutex};

use crate::query::{FileId, ReferenceId};
use crate::{types::analysis::DeclarationData, FileData, NgModuleComponentMap, ParsedFile};

#[derive(Clone, Debug)]
pub struct CachedResult {
    pub value: Arc<QueryValue>,
    pub dependencies: HashSet<FileId>,
}

/// Identity of a single analyzer query.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum QueryKey {
    /// Cross-file semantic analysis for a file (Stage 2).
    AnalyzeFileSemantic(FileId),
    /// Single-file syntactic extraction (`analyzer::analyze_file`) and resource registration.
    AnalyzeFileSyntax(FileId),
    /// [`QueryKey::AnalyzeFileSyntax`] with consumer-visible declaration metadata (selectors, pipe
    /// names, `exportAs`, inputs/outputs) completed across files via the partial evaluator, and the
    /// symbol table rebuilt from it; other files read template-dependency metadata from this table.
    /// Invariant: depends only on the evaluator (syntax/parse queries), never on scopes or semantic
    /// analysis, so any query may read it without forming a cycle.
    AnalyzeFileEvaluated(FileId),
    /// Parsed AST and semantic index for a source file in a self-contained arena.
    ParseFile(FileId),
    /// All declarations (components/directives/pipes) transitively exported by an NgModule.
    NgModuleExportsScope(ReferenceId),
    /// Full compilation scope (imports + declarations) visible to templates inside an NgModule.
    NgModuleImportsScope(ReferenceId),
    /// Export map of a package entry point (upstream's `moduleExportsCache`).
    ModuleExportMap(FileId),
    /// Singleton: component → owning-NgModule mapping across [`QueryKey::ProgramFiles`].
    ComponentMapping,
    /// Singleton: tsconfig root files plus every local TS source reachable via static and dynamic
    /// imports. Whole-program questions iterate this, never the roots alone: a CLI app's tsconfig
    /// names only `main.ts`, and lazy feature modules are reached only via `loadChildren`.
    ProgramFiles,
}

impl QueryKey {
    /// The file this key caches a per-file result for; `None` for NgModule-scope and
    /// whole-program keys.
    pub fn file_id(&self) -> Option<FileId> {
        match *self {
            Self::AnalyzeFileSemantic(file_id)
            | Self::AnalyzeFileSyntax(file_id)
            | Self::AnalyzeFileEvaluated(file_id)
            | Self::ParseFile(file_id)
            | Self::ModuleExportMap(file_id) => Some(file_id),
            Self::NgModuleExportsScope(_)
            | Self::NgModuleImportsScope(_)
            | Self::ComponentMapping
            | Self::ProgramFiles => None,
        }
    }
}

/// `enumerateExportsOfModule`'s `exportMap`, keyed by `(declaring file, declared name)`.
pub type ModuleExportMap = std::collections::HashMap<(FileId, String), String>;

#[derive(Clone, Debug)]
pub struct NgModuleImportsScopeData {
    pub declarations: Vec<DeclarationData>,
    pub is_complete: bool,
}

/// Tagged query result stored in the query cache.
pub enum QueryValue {
    /// Single-file analysis ([`QueryKey::AnalyzeFileSyntax`]).
    Syntax(Arc<FileData>),
    /// Single-file analysis with cross-file declaration metadata evaluated
    /// ([`QueryKey::AnalyzeFileEvaluated`]).
    Evaluated(Arc<FileData>),
    /// Cross-file resolved analysis ([`QueryKey::AnalyzeFileSemantic`]).
    Semantic(Arc<FileData>),
    /// Parsed source file ([`QueryKey::ParseFile`]).
    ParsedFile(Arc<Mutex<ParsedFile>>),
    /// An NgModule exports scope.
    Scope(Arc<Vec<DeclarationData>>),
    /// An NgModule imports compilation scope.
    ImportsScope(Arc<NgModuleImportsScopeData>),
    /// A package entry point's export map.
    ExportMap(Arc<ModuleExportMap>),
    /// The component → NgModule mapping singleton.
    ComponentMap(Arc<NgModuleComponentMap>),
    /// The program's files ([`QueryKey::ProgramFiles`]), roots first in tsconfig order, then the
    /// files they import in breadth-first discovery order.
    ProgramFiles(Arc<Vec<FileId>>),
}

impl std::fmt::Debug for QueryValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Syntax(v) => write!(f, "Syntax({})", v.file_path.display()),
            Self::Evaluated(v) => write!(f, "Evaluated({})", v.file_path.display()),
            Self::Semantic(v) => write!(f, "Semantic({})", v.file_path.display()),
            Self::ParsedFile(_) => write!(f, "ParsedFile"),
            Self::Scope(v) => write!(f, "Scope({} decls)", v.len()),
            Self::ImportsScope(v) => {
                write!(
                    f,
                    "ImportsScope({} decls, complete={})",
                    v.declarations.len(),
                    v.is_complete
                )
            }
            Self::ExportMap(v) => write!(f, "ExportMap({} decls)", v.len()),
            Self::ComponentMap(v) => {
                write!(f, "ComponentMap({} entries)", v.component_to_module.len())
            }
            Self::ProgramFiles(v) => write!(f, "ProgramFiles({} files)", v.len()),
        }
    }
}
