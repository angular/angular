use super::metadata::{
    AngularFieldMetadata, ClassMetadata, HostDirectiveMetadata, ImportDeclarationMetadata,
    LegacyAnimationTriggerNames, SpanMetadata, TemplateGuardMetadata, TypeParameterMetadata,
};
use crate::query::FileId;
#[cfg(feature = "napi")]
use napi_derive::napi;
use std::collections::HashMap;

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct NgDiagnostic {
    pub category: u8,
    pub code: u32,
    pub message_text: String,
    pub file_path: Option<String>,
    pub span: Option<SpanMetadata>,
}

impl NgDiagnostic {
    pub fn from_oxc(
        diag: &oxc_diagnostics::OxcDiagnostic,
        file_path: Option<String>,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> Self {
        let code = diag
            .code
            .number
            .as_ref()
            .and_then(|c| c.strip_prefix("NG").unwrap_or(c).parse::<u32>().ok())
            .unwrap_or(1010);
        let span = diag.labels.first().map(|l| {
            let start = l.offset();
            let end = start + l.len();
            SpanMetadata::new(oxc_span::Span::new(start, end), converter)
        });

        Self {
            category: match diag.severity {
                oxc_diagnostics::Severity::Error => 1,
                _ => 0,
            },
            code,
            message_text: diag.message.to_string(),
            file_path,
            span,
        }
    }
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisResult {
    pub file_id: FileId,
    pub file_path: String,
    pub imports_end: u32, // byte position after the initial import block
    pub classes: Vec<ClassMetadata>,
    /// The file's static `import` declarations, in source order, so consumers never have to
    /// re-parse the source to find or edit an import.
    pub imports: Vec<ImportDeclarationMetadata>,
    pub type_only_exports: Vec<String>,
    pub diagnostics: Vec<NgDiagnostic>,
    pub signal_debug_names: Vec<super::metadata::SignalDebugNameMetadata>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzerOptions {
    pub tsconfig_path: String,
    pub optimize: Option<bool>,
    pub virtual_files: Option<HashMap<String, String>>,
    pub node_modules_path_override: Option<String>,
    /// Optional allowlist of absolute JS/TS source paths that may be read from disk (used to
    /// enforce build boundaries by falling back to `.d.ts` files). Both symlink and resolved paths
    /// are permitted.
    pub allowed_sources: Option<Vec<String>>,
    /// Workspace name used by `PrefixImportStrategy` for module specifiers (e.g., "google3").
    pub workspace_name: Option<String>,
    /// Root directories used by `PrefixImportStrategy` to strip prefixes.
    pub root_dirs: Option<Vec<String>>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileUpdate {
    pub file_path: String,
    pub content: String,
}

// https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#fileChangeType
#[cfg_attr(feature = "napi", napi)]
#[derive(Debug, PartialEq, Clone, Copy, serde::Serialize, serde::Deserialize)]
pub enum FileUpdateType {
    Created,
    Deleted,
    Changed,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileInvalidation {
    pub file_path: String,
    pub update_type: FileUpdateType,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeclarationMetadata {
    pub name: String,
    pub r#ref: crate::types::metadata::ReferenceMetadata,
    /// Reference projected into the declaring NgModule's file for remote scoping (`ɵɵsetComponentScope`).
    pub ref_in_declaring_module: Option<crate::types::metadata::ReferenceMetadata>,
    pub name_span: SpanMetadata,
    pub declaration_type: String, // "component", "directive", "pipe", "ngmodule"
    pub selector: Option<String>, // For components/directives
    pub pipe_name: Option<String>, // For pipes: the template binding name
    pub is_standalone: Option<bool>, // Whether the declaration is standalone
    pub export_as: Option<Vec<String>>,

    pub file_id: FileId,
    pub file_path: Option<String>,
    pub host_directives: Option<Vec<HostDirectiveMetadata>>,
    pub fields: Option<Vec<AngularFieldMetadata>>,
    pub flattened_fields: Option<Vec<AngularFieldMetadata>>,
    pub ng_content_selectors: Option<Vec<String>>,
    pub type_parameters: Option<Vec<TypeParameterMetadata>>,

    pub has_ng_template_context_guard: bool,
    pub ng_template_guards: Vec<TemplateGuardMetadata>,
    pub animation_trigger_names: Option<LegacyAnimationTriggerNames>,
    pub has_ng_field_directive: bool,
    pub is_forward_ref: bool,
    pub is_structural: bool,
    pub cycle_prone: Option<bool>,
    pub is_exported: bool,
    pub has_non_exported_bounds: bool,
    pub is_explicitly_deferred: bool,
    pub deferred_blocks: Option<Vec<String>>,
    /// Resolved `hostDirectives` in the consuming component's frame; they apply only where this
    /// declaration matches and are not members of the consumer's scope.
    pub resolved_host_directives: Option<Vec<ResolvedHostDirectiveMetadata>>,
}

/// Wire form of `ResolvedHostDirective`.
#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolvedHostDirectiveMetadata {
    pub directive: DeclarationMetadata,
    pub inputs: Option<Vec<crate::types::metadata::HostDirectiveBinding>>,
    pub outputs: Option<Vec<crate::types::metadata::HostDirectiveBinding>>,
}

impl ResolvedHostDirectiveMetadata {
    pub fn to_wire(
        hd: &crate::types::analysis::ResolvedHostDirective,
        path_lookup: Option<&dyn Fn(crate::query::FileId) -> std::path::PathBuf>,
    ) -> Self {
        Self {
            directive: DeclarationMetadata::to_wire(&hd.directive, path_lookup),
            inputs: hd.inputs.clone(),
            outputs: hd.outputs.clone(),
        }
    }
}

impl DeclarationMetadata {
    pub fn to_wire(
        d: &crate::types::analysis::DeclarationData,
        path_lookup: Option<&dyn Fn(crate::query::FileId) -> std::path::PathBuf>,
    ) -> Self {
        let declaration_type = match d.declaration_type {
            crate::types::analysis::ClassType::Component => "component",
            crate::types::analysis::ClassType::Directive => "directive",
            crate::types::analysis::ClassType::Pipe => "pipe",
            crate::types::analysis::ClassType::NgModule => "ngmodule",
            crate::types::analysis::ClassType::Injectable
            | crate::types::analysis::ClassType::Service => "injectable",
        }
        .to_string();

        let file_path =
            path_lookup.map(|lookup| lookup(d.reference.file).to_string_lossy().into_owned());

        Self {
            name: d.reference.name.clone(),
            r#ref: d.ref_meta.clone(),
            ref_in_declaring_module: d.ref_in_declaring_module.clone(),
            name_span: d.name_span,
            declaration_type,
            selector: d.selector.clone(),
            pipe_name: d.pipe_name.clone(),
            is_standalone: d.is_standalone,
            export_as: d.export_as.clone(),
            file_id: d.reference.file,
            file_path,
            host_directives: d.host_directives.clone().map(|entries| {
                let consumer_path = path_lookup.map(|lookup| lookup(d.reference.file));
                entries
                    .into_iter()
                    .map(|e| e.into_wire(d.reference.file, consumer_path.as_deref(), path_lookup))
                    .collect()
            }),
            fields: d.fields.clone(),
            flattened_fields: d.flattened_fields.clone(),
            ng_content_selectors: d.ng_content_selectors.clone(),
            type_parameters: d.type_parameters.clone(),
            has_ng_template_context_guard: d.has_ng_template_context_guard,
            ng_template_guards: d.ng_template_guards.clone(),
            animation_trigger_names: d.animation_trigger_names.clone(),
            has_ng_field_directive: d.has_ng_field_directive,
            is_forward_ref: d.is_forward_ref,
            is_structural: d.is_structural,
            cycle_prone: d.cycle_prone,
            is_exported: d.is_exported,
            has_non_exported_bounds: d.has_non_exported_bounds,
            is_explicitly_deferred: d.is_explicitly_deferred,
            deferred_blocks: d.deferred_blocks.clone(),
            resolved_host_directives: d.resolved_host_directives.as_ref().map(|hds| {
                hds.iter()
                    .map(|hd| ResolvedHostDirectiveMetadata::to_wire(hd, path_lookup))
                    .collect()
            }),
        }
    }
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompilationChunk {
    pub files: Vec<AnalysisResult>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub static_edges: Option<HashMap<String, Vec<FileId>>>,
}

#[cfg_attr(feature = "napi", napi(object))]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TemplateUsage {
    pub ts_file_path: String,
    pub symbol_id: u32,
}
