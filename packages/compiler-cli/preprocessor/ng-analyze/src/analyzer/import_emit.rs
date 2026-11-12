use crate::query::FileId;
use crate::types::analysis::Reference;
use crate::types::metadata::{ImportableRef, ReferenceMetadata};
use std::path::{Path, PathBuf};

/// Strip a TypeScript or JavaScript file extension (including multi-part `.d.ts` forms).
pub fn strip_extension_str(s: &str) -> &str {
    for ext in [
        ".d.ts", ".d.mts", ".d.cts", ".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs",
    ] {
        if let Some(stripped) = s.strip_suffix(ext) {
            return stripped;
        }
    }
    s
}

/// The name each `(declaring file, declared name)` is published under by its own declaring
/// file, for the references a wire projection emits. A key mapped to `None` was resolved
/// and is not published at all; an absent key was never resolved by the pre-pass.
pub type DeclaringExportNames = std::collections::HashMap<(FileId, String), Option<String>>;

/// Strategy for emitting symbol references and module specifiers (after ngtsc's
/// `ReferenceEmitter` / `ReferenceEmitStrategy`).
pub trait ReferenceEmitStrategy: Send + Sync {
    /// Emits reference metadata describing how to refer to `reference` both in-situ
    /// (within `consumer_path`) and for type-checking (`.ngtypecheck.ts`).
    ///
    /// `declaring_export_name` is the name the declaring file itself publishes the symbol under
    /// (`findExportedNameOfNode`), or `None` when unexported. Resolved by the caller because it
    /// requires the query engine while `emit` is synchronous. A strategy that imports directly
    /// from the declaring file declines when this is `None`.
    fn emit(
        &self,
        reference: &Reference,
        consumer: FileId,
        consumer_path: &Path,
        target_path: &Path,
        declaring_export_name: Option<&str>,
    ) -> ReferenceMetadata;

    /// [`Self::emit`] aware of the consumer and target [`crate::host::IdKind`]s, so non-path
    /// (`IdKind::Virtual`) modules never undergo relative-path diffing or extension stripping.
    fn emit_with_kinds(
        &self,
        reference: &Reference,
        consumer: FileId,
        consumer_path: &Path,
        consumer_kind: crate::host::IdKind,
        target_path: &Path,
        target_kind: crate::host::IdKind,
        declaring_export_name: Option<&str>,
    ) -> ReferenceMetadata {
        let _ = (consumer_kind, target_kind);
        self.emit(
            reference,
            consumer,
            consumer_path,
            target_path,
            declaring_export_name,
        )
    }

    /// Resolves an import module specifier declared in `declaring_path` so it is importable from `consumer_path`.
    fn resolve_import_specifier(
        &self,
        declaring_path: &Path,
        consumer_path: &Path,
        specifier: &str,
    ) -> String;

    /// [`Self::resolve_import_specifier`] for a [`crate::host::IdKind::Virtual`] consumer, which
    /// has no directory a specifier could be relative to: a relative specifier becomes the
    /// absolute path it names from `declaring_path`.
    fn resolve_import_specifier_for_virtual_consumer(
        &self,
        declaring_path: &Path,
        specifier: &str,
    ) -> String {
        if !specifier.starts_with('.') {
            return specifier.to_string();
        }
        let declaring_dir = declaring_path.parent().unwrap_or(Path::new("."));
        let joined = declaring_dir.join(specifier);
        crate::fs::path_to_import_specifier(&crate::fs::normalize_path_structural(&joined))
    }

    /// True when this strategy routes package imports through `owning_reference` (like ngtsc's
    /// `AbsoluteModuleStrategy`), rather than workspace-prefixed file paths.
    fn uses_owning_reference(&self) -> bool {
        false
    }
}

/// APF (Angular Package Format) and standard Node relative import strategy.
///
/// - Published packages use `owning_reference` specifier semantics (e.g. `@angular/core`).
/// - In-project [`crate::host::IdKind::Path`] files compute relative import paths (`./...` or
///   `../...`).
/// - Whenever either consumer or target is [`crate::host::IdKind::Virtual`], the target module ID
///   is emitted verbatim without path diffing or extension stripping.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct ApfImportStrategy;

pub(crate) fn relative_specifier_between(consumer_path: &Path, target_path: &Path) -> String {
    let from_dir = consumer_path.parent().unwrap_or(Path::new("."));
    let to_dir = target_path.parent().unwrap_or(Path::new("."));

    let relative = pathdiff::diff_paths(to_dir, from_dir).unwrap_or_else(|| to_dir.to_path_buf());
    let file_stem = strip_extension_str(
        target_path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or(""),
    );

    let mut out = relative
        .join(file_stem)
        .to_string_lossy()
        .replace('\\', "/");

    if !relative.is_absolute() && !out.starts_with('.') {
        out = format!("./{}", out);
    }
    out
}

impl ApfImportStrategy {
    pub fn new() -> Self {
        Self
    }

    pub fn resolve_specifier_from_paths(
        &self,
        declaring_path: &Path,
        consumer_path: &Path,
        specifier: &str,
    ) -> String {
        if !specifier.starts_with('.') {
            return specifier.to_string();
        }
        let declaring_dir = declaring_path.parent().unwrap_or(Path::new("."));
        let target_path = declaring_dir.join(specifier);
        let normalized_target = crate::fs::normalize_path_structural(&target_path);
        relative_specifier_between(consumer_path, &normalized_target)
    }

    fn resolve_specifier(
        &self,
        reference: &Reference,
        consumer_path: &Path,
        consumer_kind: crate::host::IdKind,
        target_path: &Path,
        target_kind: crate::host::IdKind,
    ) -> Option<String> {
        if let Some(owning) = &reference.owning_reference {
            return Some(owning.specifier_for_consumer(
                Some(consumer_path),
                consumer_kind == crate::host::IdKind::Path,
            ));
        }

        match (consumer_kind, target_kind) {
            (crate::host::IdKind::Path, crate::host::IdKind::Path) => {
                Some(relative_specifier_between(consumer_path, target_path))
            }
            (_, crate::host::IdKind::Virtual) => Some(target_path.to_string_lossy().into_owned()),
            (crate::host::IdKind::Virtual, crate::host::IdKind::Path) => {
                Some(crate::fs::path_to_import_specifier(target_path))
            }
        }
    }
}

impl ReferenceEmitStrategy for ApfImportStrategy {
    fn emit(
        &self,
        reference: &Reference,
        consumer: FileId,
        consumer_path: &Path,
        target_path: &Path,
        declaring_export_name: Option<&str>,
    ) -> ReferenceMetadata {
        self.emit_with_kinds(
            reference,
            consumer,
            consumer_path,
            crate::host::IdKind::Path,
            target_path,
            crate::host::IdKind::Path,
            declaring_export_name,
        )
    }

    fn emit_with_kinds(
        &self,
        reference: &Reference,
        consumer: FileId,
        consumer_path: &Path,
        consumer_kind: crate::host::IdKind,
        target_path: &Path,
        target_kind: crate::host::IdKind,
        declaring_export_name: Option<&str>,
    ) -> ReferenceMetadata {
        let specifier = self.resolve_specifier(
            reference,
            consumer_path,
            consumer_kind,
            target_path,
            target_kind,
        );
        // Specifier and name must come from the same module. The owning package publishes both;
        // a relative path targets the declaring file, so only that file's export table can name
        // the symbol.
        let mut symbol = match &reference.owning_reference {
            Some(owning) => Some(owning.export_name().to_string()),
            None => declaring_export_name.map(str::to_string),
        };
        // A reference synthesized from a still-unresolved import records the importer as its
        // `file`, so only a reference with no `owning_reference` is actually declared in
        // `consumer`.
        let declared_in_consumer =
            reference.file == consumer && reference.owning_reference.is_none();
        if declared_in_consumer {
            // Already in scope here, so nothing is being imported and there is nothing to
            // decline; the .ngtypecheck.ts import is governed by export and bounds status.
            symbol = symbol.or_else(|| Some(reference.name.clone()));
        }
        let typecheck_import = specifier
            .zip(symbol)
            .map(|(specifier, symbol)| ImportableRef { specifier, symbol });

        if declared_in_consumer {
            ReferenceMetadata {
                consumer_import: None,
                typecheck_import,
                local_alias: reference
                    .aliases
                    .get(&consumer)
                    .cloned()
                    .or_else(|| Some(reference.name.clone())),
                invalid_reason: None,
            }
        } else {
            let local_alias = reference.aliases.get(&consumer).cloned();
            let consumer_import = if local_alias.is_some() {
                None
            } else {
                typecheck_import.clone()
            };
            ReferenceMetadata {
                consumer_import,
                typecheck_import,
                local_alias,
                invalid_reason: None,
            }
        }
    }

    fn resolve_import_specifier(
        &self,
        declaring_path: &Path,
        consumer_path: &Path,
        specifier: &str,
    ) -> String {
        self.resolve_specifier_from_paths(declaring_path, consumer_path, specifier)
    }

    fn uses_owning_reference(&self) -> bool {
        true
    }
}

/// Prefix / UnifiedModules import strategy for monorepo and Bazel builds (google3).
///
/// - Prefix matches `target_path` against `root_dirs`.
/// - Strips the matched `rootDir` prefix and file extension.
/// - Prepends the configured `workspace_name` (e.g. `${workspace_name}/${rel_path}`).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PrefixImportStrategy {
    workspace_name: String,
    root_dirs: Vec<PathBuf>,
}

impl PrefixImportStrategy {
    pub fn new(workspace_name: impl Into<String>, mut root_dirs: Vec<PathBuf>) -> Self {
        let ws = workspace_name.into();
        let ws_cleaned = ws.trim_matches('/').to_string();

        // Sort root_dirs by descending path length for most-specific root matching first
        root_dirs.sort_by_key(|b| std::cmp::Reverse(b.as_os_str().len()));

        Self {
            workspace_name: ws_cleaned,
            root_dirs,
        }
    }

    pub fn workspace_name(&self) -> &str {
        &self.workspace_name
    }

    pub fn root_dirs(&self) -> &[PathBuf] {
        &self.root_dirs
    }

    pub fn path_to_module_specifier(&self, target_path: &Path) -> String {
        let normalized_target = crate::fs::normalize_path_structural(target_path);
        let mut matched_rel: Option<&Path> = None;

        for root_dir in &self.root_dirs {
            let normalized_root = crate::fs::normalize_path_structural(root_dir);
            if let Ok(rel) = normalized_target.strip_prefix(&normalized_root) {
                matched_rel = Some(rel);
                break;
            }
        }

        let rel_path = matched_rel.unwrap_or(&normalized_target);
        let rel_str = rel_path.to_string_lossy();
        let stripped_rel = strip_extension_str(&rel_str)
            .replace('\\', "/")
            .trim_start_matches('/')
            .to_string();

        if self.workspace_name.is_empty() {
            stripped_rel
        } else {
            format!("{}/{}", self.workspace_name, stripped_rel)
        }
    }
}

impl ReferenceEmitStrategy for PrefixImportStrategy {
    fn emit(
        &self,
        reference: &Reference,
        consumer: FileId,
        consumer_path: &Path,
        target_path: &Path,
        declaring_export_name: Option<&str>,
    ) -> ReferenceMetadata {
        self.emit_with_kinds(
            reference,
            consumer,
            consumer_path,
            crate::host::IdKind::Path,
            target_path,
            crate::host::IdKind::Path,
            declaring_export_name,
        )
    }

    fn emit_with_kinds(
        &self,
        reference: &Reference,
        consumer: FileId,
        _consumer_path: &Path,
        _consumer_kind: crate::host::IdKind,
        target_path: &Path,
        target_kind: crate::host::IdKind,
        declaring_export_name: Option<&str>,
    ) -> ReferenceMetadata {
        let specifier = match target_kind {
            crate::host::IdKind::Path => self.path_to_module_specifier(target_path),
            crate::host::IdKind::Virtual => target_path.to_string_lossy().into_owned(),
        };
        // The specifier is always the declaring file's, `owning_reference` deliberately ignored,
        // so the name has to be the declaring file's too — pairing it with a barrel's alias
        // emits an import that file does not satisfy.
        let mut symbol = declaring_export_name.map(str::to_string);
        let declared_in_consumer =
            reference.file == consumer && reference.owning_reference.is_none();
        if declared_in_consumer {
            symbol = symbol.or_else(|| Some(reference.name.clone()));
        }
        let typecheck_import = symbol.map(|symbol| ImportableRef { specifier, symbol });

        if declared_in_consumer {
            ReferenceMetadata {
                consumer_import: None,
                typecheck_import: typecheck_import.clone(),
                local_alias: reference
                    .aliases
                    .get(&consumer)
                    .cloned()
                    .or_else(|| Some(reference.name.clone())),
                invalid_reason: None,
            }
        } else {
            let local_alias = reference.aliases.get(&consumer).cloned();
            let consumer_import = if local_alias.is_some() {
                None
            } else {
                typecheck_import.clone()
            };
            ReferenceMetadata {
                consumer_import,
                typecheck_import,
                local_alias,
                invalid_reason: None,
            }
        }
    }

    fn resolve_import_specifier(
        &self,
        declaring_path: &Path,
        _consumer_path: &Path,
        specifier: &str,
    ) -> String {
        if !specifier.starts_with('.') {
            return specifier.to_string();
        }
        let declaring_dir = declaring_path.parent().unwrap_or(Path::new("."));
        let target_path = declaring_dir.join(specifier);
        self.path_to_module_specifier(&target_path)
    }

    fn resolve_import_specifier_for_virtual_consumer(
        &self,
        declaring_path: &Path,
        specifier: &str,
    ) -> String {
        // Workspace-prefixed specifiers do not depend on the consumer.
        self.resolve_import_specifier(declaring_path, declaring_path, specifier)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::analysis::OwningReference;
    use std::collections::HashMap;

    fn make_reference(
        file: u32,
        name: &str,
        owning: Option<(&str, &str)>,
        aliases: Vec<(u32, &str)>,
    ) -> Reference {
        let mut alias_map = HashMap::new();
        for (fid, alias) in aliases {
            alias_map.insert(fid, alias.to_string());
        }
        Reference {
            file,
            name: name.to_string(),
            owning_reference: owning
                .map(|(spec, exp)| OwningReference::from_source_specifier(spec, exp)),
            aliases: alias_map,
            is_default_export: false,
        }
    }

    #[test]
    fn test_strip_extension_str() {
        assert_eq!(strip_extension_str("foo.d.ts"), "foo");
        assert_eq!(strip_extension_str("foo.d.mts"), "foo");
        assert_eq!(strip_extension_str("foo.d.cts"), "foo");
        assert_eq!(strip_extension_str("foo.component.ts"), "foo.component");
        assert_eq!(strip_extension_str("foo.spec.tsx"), "foo.spec");
        assert_eq!(strip_extension_str("foo.service.mts"), "foo.service");
        assert_eq!(strip_extension_str("foo.cts"), "foo");
        assert_eq!(strip_extension_str("foo.js"), "foo");
        assert_eq!(strip_extension_str("foo.jsx"), "foo");
        assert_eq!(strip_extension_str("foo.mjs"), "foo");
        assert_eq!(strip_extension_str("foo.cjs"), "foo");
        assert_eq!(strip_extension_str("foo"), "foo");
    }

    #[test]
    fn test_apf_strategy_same_file() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(1, "MyComp", None, vec![(1, "MyComp")]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/my.component.ts"),
            Path::new("/src/app/my.component.ts"),
            Some("MyComp"),
        );

        assert!(meta.consumer_import.is_none());
        assert_eq!(meta.local_alias.as_deref(), Some("MyComp"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "./my.component");
        assert_eq!(tc.symbol, "MyComp");
    }

    /// A symbol in its own file is already in scope, so there is nothing to decline.
    #[test]
    fn test_apf_strategy_same_file_unexported() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(1, "MyComp", None, vec![(1, "MyComp")]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/my.component.ts"),
            Path::new("/src/app/my.component.ts"),
            None,
        );

        assert_eq!(meta.local_alias.as_deref(), Some("MyComp"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.symbol, "MyComp");
    }

    #[test]
    fn test_apf_strategy_cross_file_with_alias() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(2, "OtherComp", None, vec![(1, "OtherCompAlias")]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/parent.component.ts"),
            Path::new("/src/app/other.component.ts"),
            Some("OtherComp"),
        );

        assert!(meta.consumer_import.is_none());
        assert_eq!(meta.local_alias.as_deref(), Some("OtherCompAlias"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "./other.component");
        assert_eq!(tc.symbol, "OtherComp");
    }

    #[test]
    fn test_apf_strategy_cross_file_unbound() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(2, "OtherComp", None, vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/parent.component.ts"),
            Path::new("/src/app/other.component.ts"),
            Some("OtherComp"),
        );

        assert_eq!(meta.local_alias, None);
        let ci = meta.consumer_import.expect("Expected consumer import");
        assert_eq!(ci.specifier, "./other.component");
        assert_eq!(ci.symbol, "OtherComp");
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "./other.component");
        assert_eq!(tc.symbol, "OtherComp");
    }

    /// `class Internal {}` plus `export {Internal as Public}`: the relative specifier targets the
    /// declaring file, so the name has to be the one *that* file publishes.
    #[test]
    fn test_apf_strategy_relative_uses_declaring_file_alias() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(2, "Internal", None, vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/parent.component.ts"),
            Path::new("/src/app/other.component.ts"),
            Some("Public"),
        );

        let ci = meta.consumer_import.expect("Expected consumer import");
        assert_eq!(ci.specifier, "./other.component");
        assert_eq!(ci.symbol, "Public");
    }

    #[test]
    fn test_apf_strategy_relative_declines_unexported_symbol() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(2, "Internal", None, vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/parent.component.ts"),
            Path::new("/src/app/other.component.ts"),
            None,
        );

        assert_eq!(meta.local_alias, None);
        assert!(meta.consumer_import.is_none());
        assert!(meta.typecheck_import.is_none());
    }

    #[test]
    fn test_apf_strategy_owning_package() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(
            99,
            "Component",
            Some(("@angular/core", "Component")),
            vec![(1, "i0.Component")],
        );

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/parent.component.ts"),
            Path::new("/node_modules/@angular/core/index.d.ts"),
            None,
        );

        assert!(meta.consumer_import.is_none());
        assert_eq!(meta.local_alias.as_deref(), Some("i0.Component"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "@angular/core");
        assert_eq!(tc.symbol, "Component");
    }

    /// The owning package publishes both halves, so the declaring file has no say.
    #[test]
    fn test_apf_strategy_owning_package_keeps_barrel_name() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(99, "MatButton", Some(("@ng/mat", "MatButton")), vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/src/app/parent.component.ts"),
            Path::new("/node_modules/@ng/mat/button/button.d.ts"),
            Some("ɵMatButtonInternal"),
        );

        let ci = meta.consumer_import.expect("Expected consumer import");
        assert_eq!(ci.specifier, "@ng/mat");
        assert_eq!(ci.symbol, "MatButton");
    }

    /// Guards specifier provenance. Without an `owning_reference` there is no import provenance for
    /// the target, so the only specifier we may emit is a relative one — even though the path
    /// makes `@scope/pkg` look obvious and even though the relative form is uglier.
    #[test]
    fn test_apf_strategy_node_modules_without_owning_reference_stays_relative() {
        let strategy = ApfImportStrategy::new();
        let reference = make_reference(99, "DeepDir", None, vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/app/src/app/parent.component.ts"),
            Path::new("/app/node_modules/@scope/pkg/deep/deep.directive.d.ts"),
            Some("DeepDir"),
        );

        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(
            tc.specifier,
            "../../node_modules/@scope/pkg/deep/deep.directive"
        );
    }

    #[test]
    fn test_prefix_strategy_same_file() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(1, "MyComp", None, vec![(1, "MyComp")]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/src/app/my.component.ts"),
            Path::new("/workspace/src/app/my.component.ts"),
            Some("MyComp"),
        );

        assert!(meta.consumer_import.is_none());
        assert_eq!(meta.local_alias.as_deref(), Some("MyComp"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "google3/src/app/my.component");
        assert_eq!(tc.symbol, "MyComp");
    }

    #[test]
    fn test_prefix_strategy_same_file_unexported() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(1, "MyComp", None, vec![(1, "MyComp")]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/src/app/my.component.ts"),
            Path::new("/workspace/src/app/my.component.ts"),
            None,
        );

        assert_eq!(meta.local_alias.as_deref(), Some("MyComp"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.symbol, "MyComp");
    }

    #[test]
    fn test_prefix_strategy_cross_file() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(2, "ButtonComp", None, vec![(1, "Btn")]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/src/app/parent.component.ts"),
            Path::new("/workspace/src/app/button.component.ts"),
            Some("ButtonComp"),
        );

        assert!(meta.consumer_import.is_none());
        assert_eq!(meta.local_alias.as_deref(), Some("Btn"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "google3/src/app/button.component");
        assert_eq!(tc.symbol, "ButtonComp");
    }

    #[test]
    fn test_prefix_strategy_cross_file_unbound() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(2, "ButtonComp", None, vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/src/app/parent.component.ts"),
            Path::new("/workspace/src/app/button.component.ts"),
            Some("ButtonComp"),
        );

        assert_eq!(meta.local_alias, None);
        let ci = meta.consumer_import.expect("Expected consumer import");
        assert_eq!(ci.specifier, "google3/src/app/button.component");
        assert_eq!(ci.symbol, "ButtonComp");
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "google3/src/app/button.component");
        assert_eq!(tc.symbol, "ButtonComp");
    }

    #[test]
    fn test_prefix_strategy_uses_declaring_file_alias() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(2, "Internal", None, vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/consumer.ts"),
            Path::new("/workspace/my/upstream/directive.ts"),
            Some("Public"),
        );

        let ci = meta.consumer_import.expect("Expected consumer import");
        assert_eq!(ci.specifier, "google3/my/upstream/directive");
        assert_eq!(ci.symbol, "Public");
    }

    #[test]
    fn test_prefix_strategy_declines_unexported_symbol() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(2, "Internal", None, vec![]);

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/consumer.ts"),
            Path::new("/workspace/my/upstream/directive.ts"),
            None,
        );

        assert_eq!(meta.local_alias, None);
        assert!(meta.consumer_import.is_none());
        assert!(meta.typecheck_import.is_none());
    }

    #[test]
    fn test_prefix_strategy_default_export() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let mut reference = make_reference(2, "DirectiveA", None, vec![]);
        reference.is_default_export = true;

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/consumer.ts"),
            Path::new("/workspace/my/upstream/directive.ts"),
            Some("default"),
        );

        let ci = meta.consumer_import.expect("Expected consumer import");
        assert_eq!(ci.symbol, "default");
    }

    #[test]
    fn test_prefix_strategy_nested_root_dirs_precedence() {
        let strategy = PrefixImportStrategy::new(
            "google3",
            vec![
                PathBuf::from("/workspace"),
                PathBuf::from("/workspace/bazel-out/k8-opt/bin"),
            ],
        );

        // Generated file inside bazel-out should match the more specific rootDir
        let gen_path = Path::new("/workspace/bazel-out/k8-opt/bin/src/app/gen.component.ts");
        assert_eq!(
            strategy.path_to_module_specifier(gen_path),
            "google3/src/app/gen.component"
        );

        // Regular source file matches /workspace
        let src_path = Path::new("/workspace/src/app/normal.component.ts");
        assert_eq!(
            strategy.path_to_module_specifier(src_path),
            "google3/src/app/normal.component"
        );
    }

    #[test]
    fn test_prefix_strategy_empty_workspace_name() {
        let strategy = PrefixImportStrategy::new("", vec![PathBuf::from("/workspace")]);
        let src_path = Path::new("/workspace/src/app/normal.component.ts");
        assert_eq!(
            strategy.path_to_module_specifier(src_path),
            "src/app/normal.component"
        );
    }

    #[test]
    fn test_prefix_strategy_ignores_owning_reference() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(
            99,
            "Component",
            Some(("@angular/core", "Component")),
            vec![(1, "i0.Component")],
        );

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/src/app/parent.component.ts"),
            Path::new("/workspace/third_party/angular/core/index.d.ts"),
            Some("Component"),
        );

        assert!(meta.consumer_import.is_none());
        assert_eq!(meta.local_alias.as_deref(), Some("i0.Component"));
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "google3/third_party/angular/core/index");
        assert_eq!(tc.symbol, "Component");
    }

    /// The specifier is the declaring file's, so a barrel's alias must not ride along with it.
    #[test]
    fn test_prefix_strategy_uses_declared_name_even_if_owning_alias_differs() {
        let strategy = PrefixImportStrategy::new("google3", vec![PathBuf::from("/workspace")]);
        let reference = make_reference(
            2,
            "DirectiveA",
            Some(("google3/my/upstream/upstream-module", "ɵɵDirectiveA")),
            vec![],
        );

        let meta = strategy.emit(
            &reference,
            1,
            Path::new("/workspace/consumer.ts"),
            Path::new("/workspace/my/upstream/directive.ts"),
            Some("DirectiveA"),
        );

        assert_eq!(meta.local_alias, None);
        let ci = meta.consumer_import.expect("Expected consumer import");
        assert_eq!(ci.specifier, "google3/my/upstream/directive");
        assert_eq!(ci.symbol, "DirectiveA");
        let tc = meta.typecheck_import.expect("Expected typecheck import");
        assert_eq!(tc.specifier, "google3/my/upstream/directive");
        assert_eq!(tc.symbol, "DirectiveA");
    }

    #[test]
    fn test_apf_strategy_resolve_import_specifier() {
        let strategy = ApfImportStrategy::new();

        // Cross-folder relative specifier
        let resolved = strategy.resolve_import_specifier(
            Path::new("/workspace/src/components/list.component.ts"),
            Path::new("/workspace/src/app/app.component.ts"),
            "./models",
        );
        assert_eq!(resolved, "../components/models");

        // Same-folder relative specifier
        let resolved_same = strategy.resolve_import_specifier(
            Path::new("/workspace/src/app/list.component.ts"),
            Path::new("/workspace/src/app/app.component.ts"),
            "./models",
        );
        assert_eq!(resolved_same, "./models");

        // Bare/external package specifier
        let resolved_pkg = strategy.resolve_import_specifier(
            Path::new("/workspace/src/components/list.component.ts"),
            Path::new("/workspace/src/app/app.component.ts"),
            "@angular/core",
        );
        assert_eq!(resolved_pkg, "@angular/core");

        // Directory/index relative specifier
        let resolved_index = strategy.resolve_import_specifier(
            Path::new("/workspace/src/components/list.component.ts"),
            Path::new("/workspace/src/app/app.component.ts"),
            "./models/index",
        );
        assert_eq!(resolved_index, "../components/models/index");

        // Directory with trailing slash
        let resolved_dir = strategy.resolve_import_specifier(
            Path::new("/workspace/src/components/list.component.ts"),
            Path::new("/workspace/src/app/app.component.ts"),
            "./models/",
        );
        assert_eq!(resolved_dir, "../components/models");

        // Empty specifier (local export)
        let resolved_empty = strategy.resolve_import_specifier(
            Path::new("/workspace/src/components/list.component.ts"),
            Path::new("/workspace/src/app/app.component.ts"),
            "",
        );
        assert_eq!(resolved_empty, "");
    }

    #[test]
    fn test_prefix_strategy_resolve_import_specifier() {
        let strategy = PrefixImportStrategy::new("repo", vec![PathBuf::from("/workspace")]);

        // Cross-folder relative specifier resolved to workspace prefix path
        let resolved = strategy.resolve_import_specifier(
            Path::new("/workspace/packages/widgets/filter_bar.ts"),
            Path::new("/workspace/apps/dashboard/main.ts"),
            "./filter_model",
        );
        assert_eq!(resolved, "repo/packages/widgets/filter_model");

        // Directory/index relative specifier resolved to prefix path
        let resolved_index = strategy.resolve_import_specifier(
            Path::new("/workspace/packages/widgets/filter_bar.ts"),
            Path::new("/workspace/apps/dashboard/main.ts"),
            "./filter_model/index",
        );
        assert_eq!(resolved_index, "repo/packages/widgets/filter_model/index");

        // Bare/external package specifier
        let resolved_pkg = strategy.resolve_import_specifier(
            Path::new("/workspace/packages/widgets/filter_bar.ts"),
            Path::new("/workspace/apps/dashboard/main.ts"),
            "@angular/core",
        );
        assert_eq!(resolved_pkg, "@angular/core");

        // Empty specifier (local export)
        let resolved_empty = strategy.resolve_import_specifier(
            Path::new("/workspace/packages/widgets/filter_bar.ts"),
            Path::new("/workspace/apps/dashboard/main.ts"),
            "",
        );
        assert_eq!(resolved_empty, "");
    }

    #[test]
    fn test_resolve_import_specifier_for_virtual_consumer() {
        let apf = ApfImportStrategy::new();
        let declaring = Path::new("/workspace/src/components/list.component.ts");

        // A virtual consumer has no directory, so a relative specifier becomes absolute.
        assert_eq!(
            apf.resolve_import_specifier_for_virtual_consumer(declaring, "./models"),
            "/workspace/src/components/models"
        );
        assert_eq!(
            apf.resolve_import_specifier_for_virtual_consumer(declaring, "../shared/models"),
            "/workspace/src/shared/models"
        );
        assert_eq!(
            apf.resolve_import_specifier_for_virtual_consumer(declaring, "@angular/core"),
            "@angular/core"
        );

        // Workspace-prefixed specifiers are the same for every consumer.
        let prefix = PrefixImportStrategy::new("repo", vec![PathBuf::from("/workspace")]);
        assert_eq!(
            prefix.resolve_import_specifier_for_virtual_consumer(
                Path::new("/workspace/packages/widgets/filter_bar.ts"),
                "./filter_model",
            ),
            "repo/packages/widgets/filter_model"
        );
    }

    #[test]
    fn test_apf_emit_with_virtual_ids() {
        use crate::host::IdKind;
        let strategy = ApfImportStrategy::new();
        let virt_target = Reference {
            file: 2,
            name: "VirtDir".to_string(),
            owning_reference: None,
            aliases: std::collections::HashMap::new(),
            is_default_export: false,
        };

        // Path consumer -> Virtual target emits verbatim virtual ID without stripping `.ts?inline`.
        let meta = strategy.emit_with_kinds(
            &virt_target,
            1,
            Path::new("/app/src/app.component.ts"),
            IdKind::Path,
            Path::new("\0virtual:dir.ts?inline"),
            IdKind::Virtual,
            Some("VirtDir"),
        );
        assert_eq!(
            meta.consumer_import.as_ref().map(|i| i.specifier.as_str()),
            Some("\0virtual:dir.ts?inline")
        );

        // Virtual consumer -> Path target emits the full path verbatim instead of diffing paths.
        let path_target = Reference {
            file: 3,
            name: "RealDir".to_string(),
            owning_reference: None,
            aliases: std::collections::HashMap::new(),
            is_default_export: false,
        };
        let from_virt = strategy.emit_with_kinds(
            &path_target,
            2,
            Path::new("/@id/virtual-app"),
            IdKind::Virtual,
            Path::new("/app/src/real.directive.ts"),
            IdKind::Path,
            Some("RealDir"),
        );
        assert_eq!(
            from_virt
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("/app/src/real.directive.ts")
        );
    }

    #[test]
    fn test_apf_emit_with_external_relative_and_aliased_specifiers() {
        use crate::host::IdKind;
        let strategy = ApfImportStrategy::new();

        // Rooted alias (`/external/ui`) stays verbatim regardless of consumer directory.
        let aliased = Reference {
            file: 10,
            name: "ExtButton".to_string(),
            owning_reference: Some(OwningReference::from_external_specifier(
                "/@ext/ui",
                "ExtButton",
                Some(1),
                Some(Path::new("/app/src/shared/mod.ts")),
            )),
            aliases: std::collections::HashMap::new(),
            is_default_export: false,
        };
        let meta_alias = strategy.emit_with_kinds(
            &aliased,
            11,
            Path::new("/app/src/feature/deep/cmp.ts"),
            IdKind::Path,
            Path::new("/vendor/unbundled/ui/internal/button.ts"),
            IdKind::Path,
            Some("ExtButton"),
        );
        assert_eq!(
            meta_alias
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("/@ext/ui")
        );

        // Relative external (`../vendor/ext.mjs`) stays verbatim in the same directory and rebases
        // cleanly for consumers in deeper directories without touching the resolved target path.
        let rel_ext = Reference {
            file: 12,
            name: "ExtCard".to_string(),
            owning_reference: Some(OwningReference::from_external_specifier(
                "../vendor/ext.mjs",
                "ExtCard",
                Some(1),
                Some(Path::new("/app/src/shared/mod.ts")),
            )),
            aliases: std::collections::HashMap::new(),
            is_default_export: false,
        };
        let same_dir = strategy.emit_with_kinds(
            &rel_ext,
            13,
            Path::new("/app/src/shared/other.ts"),
            IdKind::Path,
            Path::new("/cache/external/dist/internal/card.ts"),
            IdKind::Path,
            Some("ExtCard"),
        );
        assert_eq!(
            same_dir
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("../vendor/ext.mjs")
        );

        let deeper_dir = strategy.emit_with_kinds(
            &rel_ext,
            14,
            Path::new("/app/src/feature/deep/cmp.ts"),
            IdKind::Path,
            Path::new("/cache/external/dist/internal/card.ts"),
            IdKind::Path,
            Some("ExtCard"),
        );
        assert_eq!(
            deeper_dir
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("../../vendor/ext.mjs")
        );

        let virtual_consumer = strategy.emit_with_kinds(
            &rel_ext,
            15,
            Path::new("\0virtual:page"),
            IdKind::Virtual,
            Path::new("/cache/external/dist/internal/card.ts"),
            IdKind::Path,
            Some("ExtCard"),
        );
        assert_eq!(
            virtual_consumer
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("/app/src/vendor/ext.mjs")
        );
    }

    #[test]
    fn test_prefix_emit_with_virtual_target_preserves_verbatim_id() {
        use crate::host::IdKind;
        let strategy = PrefixImportStrategy::new("my_ws", vec![PathBuf::from("/workspace")]);
        let virt_target = Reference {
            file: 2,
            name: "VirtDir".to_string(),
            owning_reference: None,
            aliases: std::collections::HashMap::new(),
            is_default_export: false,
        };
        let meta = strategy.emit_with_kinds(
            &virt_target,
            1,
            Path::new("/workspace/app/cmp.ts"),
            IdKind::Path,
            Path::new("/workspace/virt.ts?inline"),
            IdKind::Virtual,
            Some("VirtDir"),
        );
        assert_eq!(
            meta.consumer_import.as_ref().map(|i| i.specifier.as_str()),
            Some("/workspace/virt.ts?inline")
        );
    }
}
