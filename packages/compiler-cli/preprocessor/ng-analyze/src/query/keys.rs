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
///
/// This is plain data and deliberately carries **no `Fs` type parameter**, so that every query —
/// regardless of which filesystem backend the engine runs on — keys a single shared cache
/// (`QueryCache<QueryKey, QueryValue>`). Each variant corresponds to one "question" the analyzer
/// answers; a query may, while executing, request other queries (forming an acyclic graph).
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum QueryKey {
    /// Semantic single-file analysis: builds on [`QueryKey::AnalyzeFileSyntax`] and additionally
    /// publishes the file's `ClassInfo`/exports records into the shared cross-file index. Returns
    /// the same `FileData` the syntactic query produced; drives the optimized pipeline and is the
    /// Stage-1 input every other query builds on.
    AnalyzeFileSemantic(FileId),
    /// Syntactic single-file analysis (`analyzer::analyze_file`): the complete single-file
    /// extraction — every decorated class plus registrations, re-exports, and per-component imports
    /// — and resource registration, with no cross-file work. The base the semantic query builds on;
    /// also drives the plain `analyze` pipeline directly.
    AnalyzeFileSyntax(FileId),
    /// [`QueryKey::AnalyzeFileSyntax`] with the metadata a file's *consumers* read — selectors,
    /// pipe names, `exportAs`, evaluated input/output declarations — completed across files by
    /// the partial evaluator, and the symbol table rebuilt from the completed classes. This is
    /// the table other files read a template dependency's metadata from. It depends only on
    /// the evaluator (other files' syntax and parse results), never on scopes or semantic
    /// analysis, so reading it from any query cannot form a cycle.
    AnalyzeFileEvaluated(FileId),
    /// Complete parsed AST and semantic index for a source file, managed in a self-contained arena.
    ParseFile(FileId),
    /// All declarations (components/directives/pipes) transitively exported by an NgModule.
    NgModuleExportsScope(ReferenceId),
    /// Full compilation scope (imports + declarations) visible to templates inside an NgModule.
    NgModuleImportsScope(ReferenceId),
    /// Which name a package entry point publishes each declaration under. Keyed by the
    /// resolved entry point, mirroring upstream's `moduleExportsCache`.
    ModuleExportMap(FileId),
    /// Singleton: the component → owning-NgModule mapping over every file of the program
    /// ([`QueryKey::ProgramFiles`]).
    ComponentMapping,
    /// Singleton: the program's files — the tsconfig root files plus every local TS source they
    /// reach through static and dynamic imports (`import()` calls with a literal specifier, import
    /// types), the closure TypeScript builds a `Program` from. Whole-program questions ("which
    /// NgModule declares this class?") iterate this, never the root list alone: the Angular CLI's
    /// `tsconfig.app.json` names only `main.ts`, and a lazy-loaded feature module is reached only
    /// through `loadChildren`.
    ProgramFiles,
}

/// `enumerateExportsOfModule`'s `exportMap`, keyed by `(declaring file, declared name)` — the
/// closest stand-in oxc gives us for its `DeclarationNode` key.
pub type ModuleExportMap = std::collections::HashMap<(FileId, String), String>;

#[derive(Clone, Debug)]
pub struct NgModuleImportsScopeData {
    pub declarations: Vec<DeclarationData>,
    pub is_complete: bool,
}

/// The result of a query, tagged by kind.
///
/// Variants hold `Arc<…>` so the engine's typed accessors can hand back the inner value cheaply
/// (a refcount bump, not a deep clone). The cache stores `Arc<QueryValue>`, so the outer tag is
/// itself shared across all awaiters of a given key.
pub enum QueryValue {
    /// Single-file analysis ([`QueryKey::AnalyzeFileSyntax`]).
    Syntax(Arc<FileData>),
    /// Single-file analysis with cross-file declaration metadata evaluated
    /// ([`QueryKey::AnalyzeFileEvaluated`]).
    Evaluated(Arc<FileData>),
    /// Cross-file resolved analysis ([`QueryKey::AnalyzeFileSemantic`]). Internal facts; the
    /// serialized `AnalysisResult` is projected from this at the engine boundary
    /// (`compiler::lower`).
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
