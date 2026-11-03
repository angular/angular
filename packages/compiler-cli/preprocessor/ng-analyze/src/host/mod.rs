//! Host abstraction for module resolution, source loading, and resource lookup.
//!
//! [`AnalysisHost`] is the boundary between `ng-analyze` and the surrounding build environment:
//! - [`DefaultFsHost`] wraps `oxc_resolver` and [`crate::ResourceResolverFs`] for standalone CLI,
//!   language-service, and test runs, completing futures immediately on first poll.
//! - Asynchronous bundler hosts (the planned `BatchingHost`) suspend queries across pump waves so
//!   external bundlers can supply resolutions and source text without filesystem access in Rust.

mod default_fs;

pub use default_fs::DefaultFsHost;

use futures::future::BoxFuture;
use std::borrow::Borrow;
use std::fmt;
use std::path::{Path, PathBuf};
use std::sync::Arc;

/// Canonical, host-owned identifier for a module or resource.
///
/// Stored as a reference-counted string so cloning across query keys, resolution caches, and wire
/// structures is `O(1)`. Core analysis treats `ModuleId` as opaque unless its associated
/// [`IdKind`] is [`IdKind::Path`].
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ModuleId(Arc<str>);

impl ModuleId {
    pub fn new(id: impl Into<Arc<str>>) -> Self {
        Self(id.into())
    }

    /// Build an ID from a filesystem path; non-UTF-8 paths are converted lossily.
    pub fn from_path(path: &Path) -> Self {
        Self(Arc::from(path.to_string_lossy()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl AsRef<str> for ModuleId {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl Borrow<str> for ModuleId {
    fn borrow(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ModuleId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl From<&str> for ModuleId {
    fn from(value: &str) -> Self {
        Self(Arc::from(value))
    }
}

impl From<String> for ModuleId {
    fn from(value: String) -> Self {
        Self(Arc::from(value))
    }
}

impl From<Arc<str>> for ModuleId {
    fn from(value: Arc<str>) -> Self {
        Self(value)
    }
}

impl serde::Serialize for ModuleId {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.0)
    }
}

impl<'de> serde::Deserialize<'de> for ModuleId {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        Ok(Self::from(s))
    }
}

/// What the core may do with a [`ModuleId`].
///
/// Inference from the string is unreliable: bundler IDs such as Vite's `/@id/...` look like
/// absolute POSIX paths without being filesystem paths.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IdKind {
    /// Absolute filesystem path, without query or hash suffixes. Path math is allowed (relative
    /// import specifiers, debug-info `filePath`, separator/case normalization).
    #[default]
    Path,
    /// Opaque identifier (`\0virtual:x`, `x.ts?inline`, URLs, ...). No path math or normalization
    /// is performed; emitted verbatim.
    Virtual,
}

/// Syntactic format of a module, supplied by the host or inferred from file extensions by
/// [`DefaultFsHost`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModuleFormat {
    Ts,
    Tsx,
    Dts,
    Js,
    Jsx,
}

impl ModuleFormat {
    /// Infer module format from a filesystem path's extension, returning `None` for non-module
    /// files (such as `.html`, `.css`, or `.json`).
    ///
    /// Formats carry no ESM/CommonJS distinction: `.mts`/`.cts` infer as [`Self::Ts`] and
    /// `.mjs`/`.cjs` as [`Self::Js`], so [`Self::to_oxc_source_type`] parses them as
    /// `ModuleKind::Unambiguous`.
    pub fn from_path(path: &Path) -> Option<Self> {
        let file_name = path.file_name()?.to_string_lossy();
        if file_name.ends_with(".d.ts")
            || file_name.ends_with(".d.mts")
            || file_name.ends_with(".d.cts")
        {
            return Some(Self::Dts);
        }
        match path.extension()?.to_str()? {
            "ts" | "mts" | "cts" => Some(Self::Ts),
            "tsx" => Some(Self::Tsx),
            "js" | "mjs" | "cjs" => Some(Self::Js),
            "jsx" => Some(Self::Jsx),
            _ => None,
        }
    }

    pub fn is_dts(self) -> bool {
        matches!(self, Self::Dts)
    }

    /// Whether this is a TypeScript source (`ts`/`tsx`), i.e. a format eligible for the program
    /// closure. Broader than the path-based `utils::is_ts_source`, which accepts only `.ts`.
    pub fn is_ts_source(self) -> bool {
        matches!(self, Self::Ts | Self::Tsx)
    }

    pub fn is_compilation_root(self) -> bool {
        !self.is_dts()
    }

    /// The [`SourceType`](oxc_span::SourceType) that `SourceType::from_path` gives a file with
    /// this format's canonical extension, so host-supplied formats parse like files on disk.
    /// oxc's presets are not equivalent: `SourceType::d_ts()` and `SourceType::jsx()` use
    /// `ModuleKind::Module`, while `from_path` yields `ModuleKind::Unambiguous`.
    pub fn to_oxc_source_type(self) -> oxc_span::SourceType {
        let synthetic = match self {
            Self::Ts => "module.ts",
            Self::Tsx => "module.tsx",
            Self::Dts => "module.d.ts",
            Self::Js => "module.js",
            Self::Jsx => "module.jsx",
        };
        oxc_span::SourceType::from_path(Path::new(synthetic))
            .unwrap_or_else(|_| oxc_span::SourceType::ts())
    }
}

/// Syntax form of a module specifier lookup.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum ImportKind {
    #[serde(rename = "import")]
    Static,
    #[serde(rename = "re-export")]
    ReExport,
    #[serde(rename = "dynamic-import")]
    Dynamic,
    /// `TSImportType` (`import('...')` in a type position).
    #[serde(rename = "type-import")]
    TypeImport,
}

/// Content kind requested via [`AnalysisHost::load`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LoadKind {
    Module,
    Template,
    Style,
}

/// Component resource kind requested via [`AnalysisHost::resolve_resource`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ResourceKind {
    Template,
    Style,
}

/// Error reported by an [`AnalysisHost`] operation for a specific request slot.
#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct HostError {
    pub message: String,
}

impl HostError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl fmt::Display for HostError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for HostError {}

impl From<String> for HostError {
    fn from(message: String) -> Self {
        Self { message }
    }
}

impl From<&str> for HostError {
    fn from(message: &str) -> Self {
        Self {
            message: message.to_owned(),
        }
    }
}

impl From<std::io::Error> for HostError {
    fn from(err: std::io::Error) -> Self {
        Self {
            message: err.to_string(),
        }
    }
}

/// Parameters for a single [`AnalysisHost::resolve`] lookup.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ResolveRequest {
    pub importer: ModuleId,
    pub specifier: String,
    pub kind: ImportKind,
    /// `true` for `import type`, `export type`, and [`ImportKind::TypeImport`].
    pub type_only: bool,
    /// Sorted `(key, value)` import attributes (`with { ... }`).
    pub attributes: Vec<(String, String)>,
}

impl ResolveRequest {
    pub fn new(
        importer: impl Into<ModuleId>,
        specifier: impl Into<String>,
        kind: ImportKind,
    ) -> Self {
        Self {
            importer: importer.into(),
            specifier: specifier.into(),
            type_only: matches!(kind, ImportKind::TypeImport),
            kind,
            attributes: Vec::new(),
        }
    }

    pub fn with_type_only(mut self, type_only: bool) -> Self {
        self.type_only = type_only || matches!(self.kind, ImportKind::TypeImport);
        self
    }

    pub fn with_attributes(mut self, mut attributes: Vec<(String, String)>) -> Self {
        attributes.sort();
        self.attributes = attributes;
        self
    }
}

/// Successful module resolution returned by [`AnalysisHost::resolve`].
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ResolvedModule {
    pub id: ModuleId,
    pub id_kind: IdKind,
    /// Required either here or on [`LoadedModule`] for module loads.
    pub format: Option<ModuleFormat>,
    /// Whether the module is external to the bundle (analyzed lazily for metadata, excluded from
    /// program closure).
    pub external: bool,
    /// Optional inline source text to skip a follow-up [`AnalysisHost::load`] round trip.
    pub code: Option<Arc<str>>,
}

/// Successful resource resolution returned by [`AnalysisHost::resolve_resource`].
///
/// Not named `ResolvedResource`: that is the napi wire type re-exported at the crate root
/// ([`crate::ResolvedResource`]).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ResolvedResourceId {
    pub id: ModuleId,
    pub id_kind: IdKind,
    /// Optional inline resource text (e.g. compiled CSS or HTML) to skip a follow-up
    /// [`AnalysisHost::load`] round trip.
    pub code: Option<Arc<str>>,
}

/// Source text (and optional module format) returned by [`AnalysisHost::load`].
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LoadedModule {
    pub code: Arc<str>,
    pub format: Option<ModuleFormat>,
}

/// Boxed `'static` future returned by [`AnalysisHost`] methods.
pub type HostFuture<T> = BoxFuture<'static, T>;

/// Environment boundary for resolving module specifiers, resolving component resources, and
/// loading file contents.
///
/// Futures are `'static`, so implementations own whatever they capture: each [`ResolveRequest`]
/// is built for a single call and passed by value so it can move into the future, while module
/// IDs and URLs are borrowed because callers keep them (cloning a [`ModuleId`] is `O(1)`).
pub trait AnalysisHost: Send + Sync + 'static {
    /// Resolve `req.specifier` as imported from `req.importer`.
    ///
    /// `Ok(None)` means the specifier does not resolve; hosts may also return it for any
    /// `type_only` request they prefer not to resolve. `Err` reports a host failure, with a
    /// message suitable for showing to the user.
    fn resolve(&self, req: ResolveRequest) -> HostFuture<Result<Option<ResolvedModule>, HostError>>;

    /// Load the text of `id`. `Ok(None)` means there is no such module or resource.
    ///
    /// Module loads must report a format unless the resolution already did. `external` echoes
    /// [`ResolvedModule::external`] so the host can read bundle-external modules directly instead
    /// of running them through its pipeline.
    fn load(
        &self,
        id: &ModuleId,
        kind: LoadKind,
        external: bool,
    ) -> HostFuture<Result<Option<LoadedModule>, HostError>>;

    /// Resolve a component resource `url` (`templateUrl`, `styleUrl(s)`, or a template's
    /// `<link rel="stylesheet">`) relative to the component module `containing`.
    ///
    /// `Ok(None)` means the URL does not resolve. The result may carry the content inline;
    /// otherwise it is fetched with [`Self::load`]. [`DefaultFsHost`] is lenient: when no file
    /// exists it still returns the candidate ID, without content.
    fn resolve_resource(
        &self,
        containing: &ModuleId,
        url: &str,
        kind: ResourceKind,
    ) -> HostFuture<Result<Option<ResolvedResourceId>, HostError>>;

    /// Whether every future returned by this host resolves immediately on first poll.
    ///
    /// Blocking entry points (such as the TypeScript `*Sync` APIs) require this to be `true`.
    fn is_synchronous(&self) -> bool {
        false
    }

    /// Clear any internal resolution caches held by the host.
    fn clear_cache(&self) {}

    /// Resolve a `rootDirs` virtual path to its backing path when supported by the host.
    fn resolve_backing_path(&self, _path: &Path) -> Option<PathBuf> {
        None
    }

    /// Canonicalize a filesystem path when supported by the host.
    fn canonicalize_path(&self, _path: &Path) -> Option<PathBuf> {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_module_id_borrow_and_serde_roundtrip() {
        let id = ModuleId::from("/app/src/main.ts");
        assert_eq!(id.as_str(), "/app/src/main.ts");
        assert_eq!(id.to_string(), "/app/src/main.ts");

        let mut set = std::collections::HashSet::new();
        set.insert(id.clone());
        assert!(set.contains("/app/src/main.ts"));
        assert!(!set.contains("/app/src/other.ts"));

        let json = serde_json::to_string(&id).unwrap();
        assert_eq!(json, "\"/app/src/main.ts\"");
        let parsed: ModuleId = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, id);
    }

    #[test]
    fn test_id_kind_default_and_serde() {
        assert_eq!(IdKind::default(), IdKind::Path);
        assert_eq!(serde_json::to_string(&IdKind::Path).unwrap(), "\"path\"");
        assert_eq!(
            serde_json::to_string(&IdKind::Virtual).unwrap(),
            "\"virtual\""
        );
        assert_eq!(
            serde_json::from_str::<IdKind>("\"path\"").unwrap(),
            IdKind::Path
        );
        assert_eq!(
            serde_json::from_str::<IdKind>("\"virtual\"").unwrap(),
            IdKind::Virtual
        );
    }

    #[test]
    fn test_module_format_from_path_and_predicates() {
        let cases = [
            ("/pkg/a.ts", Some(ModuleFormat::Ts)),
            ("/pkg/a.mts", Some(ModuleFormat::Ts)),
            ("/pkg/a.cts", Some(ModuleFormat::Ts)),
            ("/pkg/a.tsx", Some(ModuleFormat::Tsx)),
            ("/pkg/a.d.ts", Some(ModuleFormat::Dts)),
            ("/pkg/a.d.mts", Some(ModuleFormat::Dts)),
            ("/pkg/a.d.cts", Some(ModuleFormat::Dts)),
            ("/pkg/a.component.d.ts", Some(ModuleFormat::Dts)),
            ("/pkg/a.js", Some(ModuleFormat::Js)),
            ("/pkg/a.mjs", Some(ModuleFormat::Js)),
            ("/pkg/a.cjs", Some(ModuleFormat::Js)),
            ("/pkg/a.jsx", Some(ModuleFormat::Jsx)),
            ("/pkg/a.html", None),
            ("/pkg/a.scss", None),
            ("/pkg/a.css", None),
            ("/pkg/a.json", None),
            ("/pkg/no_ext", None),
        ];

        for (path, expected) in cases {
            assert_eq!(
                ModuleFormat::from_path(Path::new(path)),
                expected,
                "unexpected format for {path}"
            );
        }

        assert!(ModuleFormat::Ts.is_ts_source());
        assert!(ModuleFormat::Tsx.is_ts_source());
        assert!(!ModuleFormat::Dts.is_ts_source());
        assert!(!ModuleFormat::Js.is_ts_source());
        assert!(!ModuleFormat::Jsx.is_ts_source());

        assert!(ModuleFormat::Dts.is_dts());
        assert!(!ModuleFormat::Dts.is_compilation_root());
        assert!(ModuleFormat::Ts.is_compilation_root());
        assert!(ModuleFormat::Js.is_compilation_root());
        assert!(ModuleFormat::Jsx.is_compilation_root());

        assert!(ModuleFormat::Dts
            .to_oxc_source_type()
            .is_typescript_definition());
        assert!(ModuleFormat::Tsx.to_oxc_source_type().is_jsx());
        assert!(ModuleFormat::Jsx.to_oxc_source_type().is_jsx());
    }

    #[test]
    fn test_module_format_source_type_matches_from_path() {
        for (format, path) in [
            (ModuleFormat::Ts, "/pkg/a.ts"),
            (ModuleFormat::Tsx, "/pkg/a.tsx"),
            (ModuleFormat::Dts, "/pkg/a.d.ts"),
            (ModuleFormat::Js, "/pkg/a.js"),
            (ModuleFormat::Jsx, "/pkg/a.jsx"),
        ] {
            assert_eq!(
                format.to_oxc_source_type(),
                oxc_span::SourceType::from_path(path).unwrap(),
                "source type mismatch for {format:?}"
            );
        }
    }

    #[test]
    fn test_wire_enums_serde_names() {
        assert_eq!(
            serde_json::to_string(&ImportKind::Static).unwrap(),
            "\"import\""
        );
        assert_eq!(
            serde_json::to_string(&ImportKind::ReExport).unwrap(),
            "\"re-export\""
        );
        assert_eq!(
            serde_json::to_string(&ImportKind::Dynamic).unwrap(),
            "\"dynamic-import\""
        );
        assert_eq!(
            serde_json::to_string(&ImportKind::TypeImport).unwrap(),
            "\"type-import\""
        );

        assert_eq!(
            serde_json::to_string(&LoadKind::Module).unwrap(),
            "\"module\""
        );
        assert_eq!(
            serde_json::to_string(&LoadKind::Template).unwrap(),
            "\"template\""
        );
        assert_eq!(
            serde_json::to_string(&LoadKind::Style).unwrap(),
            "\"style\""
        );

        assert_eq!(
            serde_json::to_string(&ResourceKind::Template).unwrap(),
            "\"template\""
        );
        assert_eq!(
            serde_json::to_string(&ResourceKind::Style).unwrap(),
            "\"style\""
        );
    }

    #[test]
    fn test_resolve_request_builder_sorts_attributes_and_preserves_type_import() {
        let req = ResolveRequest::new("/app/a.ts", "./b", ImportKind::TypeImport)
            .with_type_only(false)
            .with_attributes(vec![
                ("type".to_string(), "json".to_string()),
                ("assert".to_string(), "json".to_string()),
            ]);
        assert!(req.type_only);
        assert_eq!(
            req.attributes,
            vec![
                ("assert".to_string(), "json".to_string()),
                ("type".to_string(), "json".to_string()),
            ]
        );
    }
}
