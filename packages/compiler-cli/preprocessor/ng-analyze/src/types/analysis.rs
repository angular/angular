use super::metadata::{
    AngularFieldMetadata, DeclarationTuple, HostDirectiveMetadata, LegacyAnimationTriggerNames,
    SpanMetadata, TemplateGuardMetadata, TypeParameterMetadata,
};
use crate::evaluator::Resolved;
use crate::query::{FileId, ReferenceId};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

/// Package specifier and exported name through which a symbol is published (`bestGuessOwningModule`).
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct OwningReference {
    /// Absolute/package specifier (e.g. `@angular/router`), constructed only via
    /// [`OwningReference::from_source_specifier`].
    specifier: String,
    export_name: String,
}

impl OwningReference {
    /// Construct from a literal non-relative module specifier written in source or propagated
    /// through `.d.ts` metadata (`Reference.bestGuessOwningModule` in `imports/src/references.ts`).
    /// Never reconstruct one from a file path.
    pub fn from_source_specifier(
        specifier: impl Into<String>,
        export_name: impl Into<String>,
    ) -> Self {
        Self {
            specifier: specifier.into(),
            export_name: export_name.into(),
        }
    }

    /// True when `specifier` is bare/package-scoped (neither relative nor rooted).
    pub(crate) fn is_absolute_specifier(specifier: &str) -> bool {
        !specifier.starts_with('.') && !specifier.starts_with('/')
    }

    /// The specifier an importer must write to reach the owning package.
    pub fn specifier(&self) -> &str {
        self.specifier.as_str()
    }

    /// The name that package exports the symbol under.
    pub fn export_name(&self) -> &str {
        self.export_name.as_str()
    }
}

/// A single `hostDirectives` entry before projection into a consuming file's frame (`HostDirectiveMeta` in ngtsc).
#[derive(Clone, Debug, PartialEq)]
pub struct HostDirectiveEntry {
    pub directive: Reference,
    /// True when produced by `forwardRef`, requiring the `hostDirectives` array to be emitted inside a closure.
    pub is_forward_ref: bool,
    pub inputs: Option<Vec<crate::types::metadata::HostDirectiveBinding>>,
    pub outputs: Option<Vec<crate::types::metadata::HostDirectiveBinding>>,
}

impl HostDirectiveEntry {
    /// Project this entry into `consumer`'s frame, deciding how that file writes the directive.
    pub(crate) fn into_wire(
        self,
        consumer: FileId,
        consumer_path: Option<&Path>,
        lookup: Option<&(impl Fn(FileId) -> PathBuf + ?Sized)>,
    ) -> HostDirectiveMetadata {
        let specifier = self
            .directive
            .specifier_for(consumer, consumer_path, lookup);
        HostDirectiveMetadata {
            directive: crate::types::metadata::ReferenceMetadata::for_consumer(
                &self.directive,
                consumer,
                specifier,
            ),
            inputs: self.inputs,
            outputs: self.outputs,
            is_forward_ref: self.is_forward_ref,
        }
    }
}

/// Internal representation of a declaration reference.
#[derive(Clone, Debug, Eq)]
pub struct Reference {
    pub file: FileId,
    pub name: String,
    /// External package publishing this symbol (`None` for local or relative workspace files).
    pub owning_reference: Option<OwningReference>,
    /// Local binding name for this symbol in each file that binds it (declaring file, importers,
    /// and binding re-exports). A file absent from the map cannot name the symbol and must import
    /// it, so only insert real bindings, never invented or exported-only names.
    pub aliases: std::collections::HashMap<FileId, String>,
    /// True when exported under the reserved `default` key.
    pub is_default_export: bool,
}

impl PartialEq for Reference {
    fn eq(&self, other: &Self) -> bool {
        self.file == other.file && self.name == other.name
    }
}

impl std::hash::Hash for Reference {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.file.hash(state);
        self.name.hash(state);
    }
}

impl Reference {
    pub fn name(&self) -> &str {
        self.name.as_str()
    }

    /// Exported symbol name to dereference on a generated import (`i1.Foo`, `i1.default`, or a
    /// barrel's renamed export).
    pub fn export_name(&self) -> &str {
        if let Some(owning) = &self.owning_reference {
            return owning.export_name();
        }
        if self.is_default_export {
            return "default";
        }
        &self.name
    }

    /// The identifier `file_id` can write to reach this symbol, falling back to the export
    /// name for files that cannot name it directly.
    pub fn name_in_file(&self, file_id: FileId) -> &str {
        self.aliases
            .get(&file_id)
            .map(|alias| alias.as_str())
            .unwrap_or_else(|| self.export_name())
    }

    /// True when `file_id` already has a binding for this symbol, so it can be referenced
    /// by name instead of through a generated import.
    pub fn is_in_scope_of(&self, file_id: FileId) -> bool {
        self.aliases.contains_key(&file_id)
    }

    /// Module specifier for `consumer` to import this symbol (`None` if declared in `consumer`).
    pub fn specifier_for(
        &self,
        consumer: FileId,
        consumer_path: Option<&Path>,
        lookup: Option<&(impl Fn(FileId) -> PathBuf + ?Sized)>,
    ) -> Option<String> {
        // Check `owning_reference` first: import-hole references record the importer as `self.file`.
        if let Some(owning) = &self.owning_reference {
            return Some(owning.specifier().to_string());
        }
        if self.file == consumer {
            return None;
        }
        let target = lookup?(self.file);
        Some(crate::analyzer::import_emit::relative_specifier_between(
            consumer_path?,
            &target,
        ))
    }
    pub fn from_value_reference(r: &crate::evaluator::value::ValueReference) -> Self {
        let mut aliases = std::collections::HashMap::new();
        aliases.insert(r.file, r.name.clone());
        aliases.extend(r.aliases.iter().cloned());
        Self {
            file: r.file,
            name: r.name.clone(),
            owning_reference: r.owning_reference.clone(),
            aliases,
            is_default_export: r.is_default_export,
        }
    }
}

#[derive(Clone, Debug)]
pub struct DeclarationData {
    pub reference: Reference,
    pub name_span: crate::types::metadata::SpanMetadata,
    pub declaration_type: ClassType,
    pub selector: Option<String>,
    pub pipe_name: Option<String>,
    pub is_standalone: Option<bool>,
    pub export_as: Option<Vec<String>>,
    pub host_directives: Option<Vec<HostDirectiveEntry>>,
    pub fields: Option<Vec<crate::types::metadata::AngularFieldMetadata>>,
    pub flattened_fields: Option<Vec<crate::types::metadata::AngularFieldMetadata>>,
    pub ng_content_selectors: Option<Vec<String>>,
    pub type_parameters: Option<Vec<crate::types::metadata::TypeParameterMetadata>>,
    pub has_ng_template_context_guard: bool,
    pub ng_template_guards: Vec<crate::types::metadata::TemplateGuardMetadata>,
    pub animation_trigger_names: Option<crate::types::metadata::LegacyAnimationTriggerNames>,
    pub has_ng_field_directive: bool,
    pub is_forward_ref: bool,
    pub is_structural: bool,
    /// Reference as written in the emitting file: constructors fill it in the declaring file's
    /// frame, and stage 2 re-projects it per consumer (scope entries are shared across consumers).
    pub ref_meta: crate::types::metadata::ReferenceMetadata,
    /// Reference projected into the declaring NgModule's file for remote scoping (`ɵɵsetComponentScope`),
    /// or `None` for standalone components.
    pub ref_in_declaring_module: Option<crate::types::metadata::ReferenceMetadata>,
    pub cycle_prone: Option<bool>,
    pub is_exported: bool,
    pub has_non_exported_bounds: bool,
    pub is_explicitly_deferred: bool,
    pub deferred_blocks: Option<Vec<String>>,
    /// Resolved `hostDirectives` in the consuming component's frame; `None` if absent or unresolved
    /// (outside a stage-2 scope). Kept attached to the host, not added to the consumer's scope:
    /// ngtsc reaches them only via `HostDirectivesResolver` (`MatchSource.HostDirective`).
    pub resolved_host_directives: Option<Vec<ResolvedHostDirective>>,
}

/// Stage-2 resolved `hostDirectives` entry (`HostDirectiveMeta` with resolved `DeclarationData`).
#[derive(Clone, Debug)]
pub struct ResolvedHostDirective {
    /// The host directive's declaration, with its own `resolved_host_directives` for a chain.
    pub directive: DeclarationData,
    /// The inputs the host exposes, or `None` when it exposes none.
    pub inputs: Option<Vec<crate::types::metadata::HostDirectiveBinding>>,
    /// The outputs the host exposes, or `None` when it exposes none.
    pub outputs: Option<Vec<crate::types::metadata::HostDirectiveBinding>>,
}

impl DeclarationData {
    pub fn deduplicate(decls: &mut Vec<Self>) {
        let mut seen = std::collections::HashSet::new();
        decls.retain(|d| seen.insert(d.reference.clone()));
    }

    pub(crate) fn from_class_info(
        reference: Reference,
        local_info: &ClassInfo,
        flattened_info: &ClassInfo,
        is_forward_ref: bool,
    ) -> Option<Self> {
        let ref_meta = crate::types::metadata::ReferenceMetadata::for_local_declaration(
            reference.name.clone(),
        );
        let declaration_type = match local_info.class_type {
            ClassType::Component => ClassType::Component,
            ClassType::Directive => ClassType::Directive,
            ClassType::Pipe => ClassType::Pipe,
            ClassType::NgModule => ClassType::NgModule,
            ClassType::Injectable | ClassType::Service => return None,
        };

        Some(Self {
            reference,
            name_span: local_info.name_span,
            declaration_type,
            selector: local_info.selector.clone(),
            export_as: local_info.export_as.clone(),
            pipe_name: local_info.pipe_name.clone(),
            is_standalone: local_info.is_standalone,
            host_directives: local_info.host_directives.clone(),
            fields: local_info.fields.clone(),
            flattened_fields: flattened_info.fields.clone(),
            ng_content_selectors: local_info.ng_content_selectors.clone(),
            type_parameters: local_info.type_parameters.clone(),
            has_ng_template_context_guard: local_info.has_ng_template_context_guard,
            ng_template_guards: local_info.ng_template_guards.clone(),
            animation_trigger_names: local_info.animation_trigger_names.clone(),
            has_ng_field_directive: local_info.has_ng_field_directive,
            is_forward_ref,
            is_structural: local_info.is_structural,
            ref_meta,
            ref_in_declaring_module: None,
            cycle_prone: None,
            is_exported: local_info.is_exported,
            has_non_exported_bounds: local_info.has_non_exported_bounds,
            is_explicitly_deferred: false,
            deferred_blocks: None,
            resolved_host_directives: None,
        })
    }

    pub(crate) fn from_class_data(
        name: String,
        class: &crate::analyzer::ClassData,
        is_forward_ref: bool,
        source_text: &str,
        converter: &crate::utils::Utf8ToUtf16,
    ) -> Option<Self> {
        use crate::analyzer::DecoratorData;

        let (declaration_type, selector, pipe_name, is_standalone, export_as, host_directives) =
            match &class.decorator {
                DecoratorData::Component(c) => (
                    ClassType::Component,
                    c.effective_selector(),
                    None,
                    Some(c.directive.standalone),
                    c.directive.export_as_names(),
                    c.directive
                        .host_directives
                        .as_ref()
                        .and_then(Resolved::get_optional),
                ),
                DecoratorData::Directive(d) => (
                    ClassType::Directive,
                    d.effective_selector(),
                    None,
                    Some(d.standalone),
                    d.export_as_names(),
                    d.host_directives.as_ref().and_then(Resolved::get_optional),
                ),
                DecoratorData::Pipe(p) => (
                    ClassType::Pipe,
                    None,
                    p.name.as_ref().and_then(Resolved::get_optional),
                    p.standalone,
                    None,
                    None,
                ),
                DecoratorData::NgModule(_) => {
                    (ClassType::NgModule, None, None, Some(false), None, None)
                }
                _ => return None,
            };

        let animation_trigger_names = match &class.decorator {
            DecoratorData::Component(c) => c.animation_trigger_names.clone(),
            _ => None,
        };
        let members = match &class.decorator {
            DecoratorData::Component(c) => Some(&c.directive),
            DecoratorData::Directive(d) => Some(d),
            _ => None,
        };
        let is_structural = match &class.decorator {
            DecoratorData::Directive(d) => d.is_structural,
            _ => false,
        };

        let fields_metadata = members.map(|m| {
            m.fields
                .iter()
                .map(|f| f.to_wire(source_text, converter))
                .collect::<Vec<_>>()
        });

        let mut aliases = std::collections::HashMap::new();
        aliases.insert(class.reference_id.file, name.clone());
        let reference = Reference {
            file: class.reference_id.file,
            name: name.clone(),
            owning_reference: None,
            aliases,
            is_default_export: false,
        };
        let ref_meta = crate::types::metadata::ReferenceMetadata::for_local_declaration(
            reference.name.clone(),
        );

        Some(Self {
            reference,
            name_span: crate::types::metadata::SpanMetadata::new(
                class.name_span.unwrap_or_default(),
                converter,
            ),
            declaration_type,
            selector,
            pipe_name,
            is_standalone,
            export_as,
            host_directives,
            fields: fields_metadata.clone(),
            flattened_fields: fields_metadata,
            ng_content_selectors: None,
            type_parameters: class.type_parameters.clone().map(|params| {
                params
                    .into_iter()
                    .map(|p| p.into_wire(source_text, converter))
                    .collect()
            }),
            has_ng_template_context_guard: class.has_ng_template_context_guard,
            ng_template_guards: class.ng_template_guards.clone(),
            animation_trigger_names,
            has_ng_field_directive: class.has_ng_field_directive,
            is_forward_ref,
            is_structural,
            ref_meta,
            ref_in_declaring_module: None,
            cycle_prone: None,
            is_exported: class.is_exported,
            has_non_exported_bounds: class.has_non_exported_bounds,
            is_explicitly_deferred: false,
            deferred_blocks: None,
            resolved_host_directives: None,
        })
    }
}

// Internal types for optimize mode
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum ClassType {
    Component,
    Directive,
    Injectable,
    NgModule,
    Pipe,
    Service,
}

#[derive(Clone, Debug)]
pub struct ClassInfo {
    pub reference_id: ReferenceId,
    pub(crate) file_path: PathBuf,
    pub class_name: String,
    /// Span of the class name in UTF-16 code units of the declaring file (a wire span, for
    /// `.ts` and `.d.ts` alike); not an oxc byte span.
    pub name_span: SpanMetadata,
    pub(crate) class_type: ClassType,
    pub(crate) selector: Option<String>,
    /// For pipes: the template binding name (e.g., "upcase")
    pub(crate) pipe_name: Option<String>,
    pub(crate) is_standalone: Option<bool>,
    pub is_structural: bool,
    pub export_as: Option<Vec<String>>,
    pub host_directives: Option<Vec<HostDirectiveEntry>>,
    pub fields: Option<Vec<AngularFieldMetadata>>,
    pub exports: Option<Vec<String>>,
    pub ng_content_selectors: Option<Vec<String>>,
    pub type_parameters: Option<Vec<TypeParameterMetadata>>,

    pub has_ng_template_context_guard: bool,
    pub ng_template_guards: Vec<TemplateGuardMetadata>,
    pub schemas: Option<Vec<String>>,
    pub animation_trigger_names: Option<LegacyAnimationTriggerNames>,
    pub has_ng_field_directive: bool,
    pub raw_imports: Option<Vec<DeclarationTuple>>,
    /// ngtsc's `mayDeclareProviders`: the NgModule literal carries a non-empty `providers`.
    pub may_declare_providers: bool,
    pub super_class: Option<DeclarationTuple>,
    pub is_exported: bool,
    pub has_non_exported_bounds: bool,
}

/// Mapping from declared classes to their owning NgModules (`LocalModuleScopeRegistry`).
#[derive(Default)]
pub struct NgModuleComponentMap {
    /// Classes declared by exactly one NgModule, keyed by file and class name.
    pub component_to_module: HashMap<FileId, HashMap<String, ReferenceId>>,
    /// Classes declared by multiple NgModules (excluded from `component_to_module` and reported as NG6007).
    pub duplicate_declarations: HashMap<FileId, HashMap<String, Vec<ReferenceId>>>,
}

impl NgModuleComponentMap {
    /// The single NgModule declaring the class, or `None` if undeclared or declared by multiple modules.
    pub fn get(&self, file_id: FileId, class_name: &str) -> Option<ReferenceId> {
        self.component_to_module
            .get(&file_id)?
            .get(class_name)
            .copied()
    }

    /// Every NgModule declaring the class when more than one does (`getDuplicateDeclarations`),
    /// otherwise `None`.
    pub fn get_duplicate_declarations(
        &self,
        file_id: FileId,
        class_name: &str,
    ) -> Option<&[ReferenceId]> {
        self.duplicate_declarations
            .get(&file_id)?
            .get(class_name)
            .map(Vec::as_slice)
    }

    /// Returns `(declaring_module, duplicate_modules)` for `class_name` in `file_id`.
    pub fn declaring_ng_modules(
        &self,
        file_id: FileId,
        class_name: Option<&str>,
    ) -> (Option<ReferenceId>, Vec<ReferenceId>) {
        let Some(class_name) = class_name else {
            return (None, Vec::new());
        };
        let duplicates = self
            .get_duplicate_declarations(file_id, class_name)
            .map(<[ReferenceId]>::to_vec)
            .unwrap_or_default();
        (self.get(file_id, class_name), duplicates)
    }

    /// Record that `ng_module` declares `class_name` in `file_id` (`registerDeclarationOfModule`).
    /// Moves the class to `duplicate_declarations` if a second distinct module declares it.
    pub fn register_declaration(
        &mut self,
        file_id: FileId,
        class_name: &str,
        ng_module: ReferenceId,
    ) {
        if let Some(modules) = self
            .duplicate_declarations
            .get_mut(&file_id)
            .and_then(|by_name| by_name.get_mut(class_name))
        {
            if !modules.contains(&ng_module) {
                modules.push(ng_module);
            }
            return;
        }

        let owners = self.component_to_module.entry(file_id).or_default();
        let Some(&first) = owners.get(class_name) else {
            owners.insert(class_name.to_string(), ng_module);
            return;
        };
        if first == ng_module {
            return;
        }
        owners.remove(class_name);
        self.duplicate_declarations
            .entry(file_id)
            .or_default()
            .insert(class_name.to_string(), vec![first, ng_module]);
    }
}

/// Internal per-file analysis result shared by [`crate::QueryKey::AnalyzeFileSyntax`] and
/// [`crate::QueryKey::AnalyzeFileSemantic`], projected to [`crate::AnalysisResult`] at the API
/// boundary via [`FileData::to_wire`].
#[derive(Clone)]
pub struct FileData {
    pub(crate) file_id: FileId,
    pub(crate) file_path: PathBuf,
    pub(crate) converter: Arc<crate::utils::Utf8ToUtf16>,

    pub(crate) imports_end: u32,
    pub(crate) classes: Vec<crate::analyzer::ClassData>,
    /// Static `import` declarations in source order.
    pub(crate) import_declarations: Vec<crate::analyzer::ImportDeclarationInfo>,
    pub(crate) type_only_exports: Vec<String>,
    /// Resolved on-disk TS paths of static imports (edges of the static import graph).
    pub(crate) resolved_dependencies: Vec<PathBuf>,
    /// Resolved on-disk TS paths of dynamic `import()` calls and literal import types (included in
    /// the program closure, excluded from static cycle detection).
    pub(crate) dynamic_dependencies: Vec<PathBuf>,
    /// Declared classes keyed by name. A cross-file `selector` is `None` here in Stage 1;
    /// see `QueryKey::AnalyzeFileEvaluated`.
    pub(crate) class_index: Arc<HashMap<String, ClassInfo>>,
    /// Declared classes keyed by `ReferenceId` (same Stage 1 selector caveat as `class_index`).
    pub(crate) symbol_index: Arc<HashMap<ReferenceId, ClassInfo>>,
    /// Re-export table (`export … from …`).
    pub(crate) file_exports: Arc<crate::analyzer::FileExportInfo>,
    pub(crate) errors: Vec<String>,
    pub(crate) diagnostics: Vec<crate::NgDiagnostic>,
    /// Byte offsets for implicit signal `debugName` insertions.
    pub(crate) signal_debug_names:
        Vec<crate::analyzer::signal_debug_name::SignalDebugNameInsertion>,
}

impl FileData {
    /// Static and dynamic import dependencies included in the program closure (`ProgramFiles`).
    ///
    /// TODO(parity): follow `/// <reference path="…" />` directives (tsc's `processReferencedFiles`).
    pub(crate) fn program_dependencies(&self) -> impl Iterator<Item = &PathBuf> {
        self.resolved_dependencies
            .iter()
            .chain(&self.dynamic_dependencies)
    }

    /// Project analysis into the serialized wire shape using the provided `WireContext`.
    pub fn to_wire(
        &self,
        cx: &crate::analyzer::WireContext,
    ) -> Result<crate::AnalysisResult, crate::analyzer::WireError> {
        let classes = self
            .classes
            .iter()
            .map(|c| c.to_wire(cx))
            .collect::<Result<Vec<_>, _>>()?;

        Ok(crate::AnalysisResult {
            file_id: self.file_id,
            file_path: self.file_path.to_string_lossy().into(),
            imports_end: self.imports_end,
            classes,
            imports: self.wire_imports(),
            type_only_exports: self.type_only_exports.clone(),
            diagnostics: self.diagnostics.clone(),
            signal_debug_names: self
                .signal_debug_names
                .iter()
                .map(|insertion| {
                    crate::types::metadata::SignalDebugNameMetadata::to_wire(
                        insertion,
                        &self.converter,
                    )
                })
                .collect(),
        })
    }

    /// The import table is single-file syntactic data, identical in both projections.
    fn wire_imports(&self) -> Vec<crate::types::metadata::ImportDeclarationMetadata> {
        self.import_declarations
            .iter()
            .map(|info| {
                crate::types::metadata::ImportDeclarationMetadata::to_wire(info, &self.converter)
            })
            .collect()
    }

    /// Every `(declaring file, declared name)` a wire projection of this file asks the emit
    /// strategy about. Resolving them is a query, so it happens before projection.
    pub(crate) fn wire_reference_decls(&self) -> std::collections::HashSet<(FileId, String)> {
        let mut out = std::collections::HashSet::new();
        for class in &self.classes {
            if let Some(name) = &class.class_name {
                out.insert((class.reference_id.file, name.clone()));
            }
            for slot in class.wire_reference_slots() {
                let Some(refs) = slot.as_ref().and_then(|s| s.get_optional()) else {
                    continue;
                };
                for r in refs {
                    out.insert((r.file, r.name.clone()));
                }
            }
        }
        out
    }

    /// The name this file publishes a symbol it declares under, or `None` when it publishes
    /// none — the rule behind `findExportedNameOfNode`. A non-alias export wins over an alias.
    pub(crate) fn exported_name_of(&self, declared: &str) -> Option<String> {
        // `import {X} from './y'; export {X}` republishes `./y`'s declaration, not one of ours.
        if self
            .import_declarations
            .iter()
            .any(|d| d.bindings.iter().any(|b| b.local == declared))
        {
            return None;
        }
        let mut aliased = None;
        for a in self.file_exports.local_aliases.iter() {
            // Deliberate divergence: upstream's `findExportedNameOfNode` accepts type-only
            // exports, emitting value imports a consumer's tsc rejects; we decline instead.
            if a.is_type || a.local_name != declared {
                continue;
            }
            if a.exported_name == declared {
                return Some(a.exported_name.clone());
            }
            aliased = Some(a.exported_name.clone());
        }
        aliased
    }

    /// Validates metadata values across all classes in this file.
    pub fn validate(&mut self) {
        for class in &self.classes {
            class.validate(&self.file_path, &self.converter, &mut self.diagnostics);
        }
    }
}
