use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use futures::future::{BoxFuture, FutureExt};
use oxc_span::Span;

use crate::evaluator::value::{DeclKind, SyntheticValue, ValueReference};
use crate::evaluator::{Resolved, ResolvedValue};
use crate::query::{FileId, QueryContext, QueryEngine, ReferenceId};
use crate::types::metadata::SpanMetadata;
use crate::{ClassInfo, ClassType, NgDiagnostic, NgRelatedInformation, ResourceResolverFs};

pub type DeclKey = (FileId, String);

pub(crate) async fn duplicate_declaration_context<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryContext<Fs>,
    class_file: FileId,
    class_name: &str,
    modules: &[ReferenceId],
) -> Vec<NgRelatedInformation> {
    if modules.is_empty() {
        return Vec::new();
    }
    let registry = ctx.ngmodule_scope_registry().await;
    let key = (class_file, class_name.to_string());
    modules
        .iter()
        .filter_map(|&module| {
            let module_path = ctx.engine.lookup_path(module.file);
            registry.duplicate_declaration_context(
                module,
                &key,
                class_name,
                &module_path.to_string_lossy(),
            )
        })
        .collect()
}

/// What `getScopeOfModuleReference` concluded about one source NgModule.
#[derive(Clone, Debug, Default)]
pub struct NgModuleScopeOutcome {
    /// `compilation.isPoisoned`.
    pub is_poisoned: bool,
    /// Analysis failed outright.
    pub failed: bool,
    /// The diagnostics this module owns (`scopeErrors` plus the analysis-time ones), already in
    /// wire form since they may point into other files.
    pub diagnostics: Vec<NgDiagnostic>,
}

/// Per-module facts other handlers read back (`makeDuplicateDeclarationError`,
/// `makeNotStandaloneDiagnostic`).
#[derive(Clone, Debug)]
struct ModuleRecord {
    name: String,
    name_span: SpanMetadata,
    /// Where each declaration is named inside `declarations`, for related information.
    declaration_origins: HashMap<DeclKey, SpanMetadata>,
    /// Declarations the module exports, by key (`exported.dependencies`).
    exported: HashSet<DeclKey>,
}

/// The whole-program result: one [`NgModuleScopeOutcome`] per source NgModule.
#[derive(Debug, Default)]
pub struct NgModuleScopeRegistry {
    outcomes: HashMap<ReferenceId, NgModuleScopeOutcome>,
    records: HashMap<ReferenceId, ModuleRecord>,
}

impl NgModuleScopeRegistry {
    pub fn outcome(&self, module: ReferenceId) -> Option<&NgModuleScopeOutcome> {
        self.outcomes.get(&module)
    }

    pub fn is_poisoned(&self, module: ReferenceId) -> bool {
        self.outcomes
            .get(&module)
            .is_some_and(|outcome| outcome.is_poisoned || outcome.failed)
    }

    pub fn duplicate_declaration_context(
        &self,
        module: ReferenceId,
        decl: &DeclKey,
        decl_name: &str,
        module_path: &str,
    ) -> Option<NgRelatedInformation> {
        let record = self.records.get(&module)?;
        let span = record
            .declaration_origins
            .get(decl)
            .copied()
            .unwrap_or(record.name_span);
        Some(NgRelatedInformation {
            file_path: module_path.to_string(),
            span,
            message_text: format!(
                "'{decl_name}' is listed in the declarations of the NgModule '{}'.",
                record.name
            ),
        })
    }

    pub fn not_standalone_hint(
        &self,
        module: ReferenceId,
        decl: &DeclKey,
        module_path: &str,
    ) -> Option<NgRelatedInformation> {
        let record = self.records.get(&module)?;
        let message_text = if record.exported.contains(decl) {
            format!(
                "It can be imported using its '{}' NgModule instead.",
                record.name
            )
        } else {
            format!(
                "It's declared in the '{}' NgModule, but is not exported. Consider exporting it \
                 and importing the NgModule instead.",
                record.name
            )
        };
        Some(NgRelatedInformation {
            file_path: module_path.to_string(),
            span: record.name_span,
            message_text,
        })
    }
}

/// One element of an evaluated `declarations`/`imports`/`exports` list, flattened like
/// `resolveTypeList` does (nested arrays spliced, `ModuleWithProviders` unwrapped).
#[derive(Clone, Debug)]
pub(crate) struct ScopeEntry {
    pub reference: ValueReference,
    /// Span of the identifier naming this entry inside the list expression, when the evaluator
    /// recorded one (`Reference.getOriginForDiagnostics`).
    pub origin: Option<Span>,
}

/// Rejection of a scope list or one of its entries, which ngtsc's `resolveTypeList` /
/// `validateAndFlattenComponentImports` report as diagnostics.
#[derive(Clone, Debug)]
pub(crate) enum ScopeEntryRejection {
    /// The top-level list expression evaluated to a non-array value.
    NotAnArray(ResolvedValue),
    /// A `ModuleWithProviders` whose `ngModule` could not be resolved to a reference.
    ModuleWithProvidersWithoutModule(ResolvedValue),
    /// A `ModuleWithProviders` return type missing its generic type argument (`NG6005`).
    ModuleWithProvidersMissingGeneric {
        file: FileId,
        span: Span,
        symbol_name: String,
    },
    /// An object literal without an `ngModule` property.
    MapWithoutModule(ResolvedValue),
}

/// Flatten an evaluated type list into [`ScopeEntry`]s. Values the evaluator could not resolve
/// (`Dynamic`, `Incomplete`) are skipped rather than reported.
// TODO(parity): report `Value at position N ... is not a reference` once the evaluator reaches
// parity for the shapes ngtsc resolves.
pub(crate) fn collect_scope_entries(
    value: &ResolvedValue,
    out: &mut Vec<Result<ScopeEntry, ScopeEntryRejection>>,
) {
    match value.unwrap_named() {
        ResolvedValue::Array(items) => {
            for item in items {
                collect_scope_entry(item, None, false, out);
            }
        }
        ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_) => {}
        _ => out.push(Err(ScopeEntryRejection::NotAnArray(value.clone()))),
    }
}

fn collect_scope_entry(
    value: &ResolvedValue,
    named: Option<Span>,
    in_mwp: bool,
    out: &mut Vec<Result<ScopeEntry, ScopeEntryRejection>>,
) {
    match value {
        ResolvedValue::Named { span, value, .. } => {
            collect_scope_entry(value, named.or(Some(*span)), in_mwp, out);
        }
        ResolvedValue::Array(items) => {
            for item in items {
                collect_scope_entry(item, None, in_mwp, out);
            }
        }
        ResolvedValue::Reference(reference) => out.push(Ok(ScopeEntry {
            reference: reference.clone(),
            origin: named,
        })),
        ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders { ng_module, .. }) => {
            out.push(Ok(ScopeEntry {
                reference: ng_module.clone(),
                origin: named,
            }));
        }
        ResolvedValue::Map(map) => match map.get("ngModule") {
            Some(ng_module) => collect_scope_entry(ng_module, named, true, out),
            None => out.push(Err(ScopeEntryRejection::MapWithoutModule(value.clone()))),
        },
        ResolvedValue::Dynamic(dynamic) => {
            let root = dynamic.root_cause();
            if let crate::evaluator::DynamicReason::ModuleWithProvidersMissingGeneric {
                symbol_name,
            } = &root.reason
            {
                out.push(Err(
                    ScopeEntryRejection::ModuleWithProvidersMissingGeneric {
                        file: root.file,
                        span: root.span,
                        symbol_name: symbol_name.clone(),
                    },
                ));
                return;
            }
            if in_mwp {
                out.push(Err(
                    ScopeEntryRejection::ModuleWithProvidersWithoutModule(value.clone()),
                ));
            }
        }
        _ if in_mwp => {
            out.push(Err(
                ScopeEntryRejection::ModuleWithProvidersWithoutModule(value.clone()),
            ));
        }
        _ => {}
    }
}

/// Complete a decorator list slot across files and flatten it.
pub(crate) async fn scope_entries<Fs: ResourceResolverFs + Clone + 'static>(
    slot: &Resolved<Vec<crate::types::analysis::Reference>>,
    ctx: &QueryContext<Fs>,
) -> Vec<Result<ScopeEntry, ScopeEntryRejection>> {
    let mut completed = slot.clone();
    completed
        .complete_with(ctx, crate::analyzer::resolvers::angular_foreign_resolvers())
        .await;
    let mut out = Vec::new();
    collect_scope_entries(completed.raw(), &mut out);
    out
}

/// The flattened `declarations`, `imports` and `exports` of one source NgModule.
type PreparedLists = [Vec<Result<ScopeEntry, ScopeEntryRejection>>; 3];

/// The order-independent half of resolving a module (ngtsc's `analyze`): evaluate and flatten
/// its three lists. Runs for every source NgModule concurrently so the registry's only serial
/// work is the cycle-sensitive graph walk.
async fn prepare_module<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryContext<Fs>,
    module: ReferenceId,
) -> (ReferenceId, PreparedLists) {
    let syntax = ctx.analyze_file_syntax(module.file).await;
    let Some(ng_module) = syntax
        .classes
        .iter()
        .find(|class| class.reference_id == module)
        .and_then(|class| class.as_ng_module())
    else {
        return (module, PreparedLists::default());
    };
    let flatten = |slot: &Option<Resolved<Vec<crate::types::analysis::Reference>>>| {
        let slot = slot.clone();
        async move {
            match &slot {
                Some(slot) => scope_entries(slot, ctx).await,
                None => Vec::new(),
            }
        }
    };
    let (declarations, imports, exports) = futures::join!(
        flatten(&ng_module.declarations),
        flatten(&ng_module.imports),
        flatten(&ng_module.exports),
    );
    (module, [declarations, imports, exports])
}

/// The key the registry files `reference` under.
pub(crate) fn decl_key(reference: &ValueReference) -> DeclKey {
    (reference.file, reference.name.clone())
}

/// `.d.ts` directives and pipes written before the `standalone` type argument existed default to
/// non-standalone, as in `DtsMetadataReader`; source declarations default to standalone.
pub(crate) fn is_standalone_class(info: &ClassInfo, is_dts: bool) -> bool {
    info.is_standalone.unwrap_or(!is_dts)
}

/// Which field a diagnostic is about; selects the error code and wording.
#[derive(Clone, Copy, PartialEq, Eq)]
enum ListKind {
    Import,
    Export,
}

impl ListKind {
    fn code(self) -> u32 {
        match self {
            // NGMODULE_INVALID_IMPORT / NGMODULE_INVALID_EXPORT
            ListKind::Import => 6002,
            ListKind::Export => 6003,
        }
    }

    fn noun(self) -> &'static str {
        match self {
            ListKind::Import => "import",
            ListKind::Export => "export",
        }
    }
}

/// What `getExportedScope` returned for a referenced NgModule.
enum ExportedScope {
    /// Not a registered NgModule (`null`).
    NotAModule,
    /// The module is still being resolved further up the stack (`'cycle'`).
    Cycle,
    Scope {
        is_poisoned: bool,
        exported: Vec<DeclKey>,
    },
}

/// Resolution state of a source NgModule in the cache (`LocalModuleScopeRegistry.cache`).
#[derive(Clone)]
enum State {
    InProgress,
    Done(Arc<ResolvedScope>),
    /// Analysis failed; the module is unregistered.
    Failed,
}

struct ResolvedScope {
    is_poisoned: bool,
    exported: Vec<DeclKey>,
}

struct Resolver<'a, Fs: ResourceResolverFs + Clone + 'static> {
    env: ScopeEnv<'a, Fs>,
    cache: HashMap<ReferenceId, State>,
    dts_cache: HashMap<ReferenceId, Option<Arc<ResolvedScope>>>,
    /// Lists flattened up front by [`prepare_module`]; taken when the module is resolved.
    prepared: HashMap<ReferenceId, PreparedLists>,
    /// Modules that declare a class some other module also declares
    /// (`modulesWithStructuralErrors`, before scope resolution adds to it).
    structurally_broken: HashSet<ReferenceId>,
    registry: NgModuleScopeRegistry,
}

impl<Fs: ResourceResolverFs + Clone + 'static> QueryEngine<Fs> {
    /// Resolve every source NgModule of the program, recording the outcome of each
    /// ([`QueryKey::NgModuleScopeRegistry`]).
    ///
    /// Like [`Self::component_mapping_body`], this is a whole-program singleton every NgModule's
    /// semantic query waits on, so the per-module work is fanned out first and only the graph
    /// walk is sequential: which member of an import cycle reports "contains a cycle" (vs.
    /// "contains errors") depends on the order ngtsc resolves modules in, so that walk runs in
    /// program order on one task.
    ///
    /// [`QueryKey::NgModuleScopeRegistry`]: crate::query::QueryKey::NgModuleScopeRegistry
    pub(crate) async fn ngmodule_scope_registry_body(
        self: &Arc<Self>,
        ctx: &QueryContext<Fs>,
    ) -> Arc<NgModuleScopeRegistry> {
        let program_files = ctx.program_files().await;
        let (mapping, syntaxes) = futures::join!(
            ctx.component_mapping(),
            futures::future::join_all(
                program_files
                    .iter()
                    .map(|&file_id| ctx.analyze_file_syntax(file_id)),
            ),
        );

        let mut structurally_broken = HashSet::new();
        for by_name in mapping.duplicate_declarations.values() {
            for modules in by_name.values() {
                structurally_broken.extend(modules.iter().copied());
            }
        }

        // Source NgModules in program order.
        let modules: Vec<ReferenceId> = syntaxes
            .iter()
            .filter(|syntax| !crate::utils::is_dts(&syntax.file_path))
            .flat_map(|syntax| {
                syntax
                    .classes
                    .iter()
                    .filter(|class| class.as_ng_module().is_some() && class.class_name.is_some())
                    .map(|class| class.reference_id)
            })
            .collect();

        // Phase 1 (parallel): per-module analysis.
        let prepared: HashMap<ReferenceId, PreparedLists> = futures::future::join_all(
            modules.iter().map(|&module| prepare_module(ctx, module)),
        )
        .await
        .into_iter()
        .collect();

        // Phase 2 (ordered): scope resolution.
        let mut resolver = Resolver {
            env: ScopeEnv { ctx },
            cache: HashMap::new(),
            dts_cache: HashMap::new(),
            prepared,
            structurally_broken,
            registry: NgModuleScopeRegistry::default(),
        };
        for module in modules {
            resolver.get_scope_of_module(module).await;
        }

        Arc::new(resolver.registry)
    }
}

/// The query-backed lookups shared by the module resolver and the standalone component import
/// check.
pub(crate) struct ScopeEnv<'a, Fs: ResourceResolverFs + Clone + 'static> {
    pub ctx: &'a QueryContext<Fs>,
}

impl<'a, Fs: ResourceResolverFs + Clone + 'static> ScopeEnv<'a, Fs> {
    fn file_path(&self, file: FileId) -> String {
        self.ctx
            .engine
            .lookup_path(file)
            .to_string_lossy()
            .into_owned()
    }

    fn is_dts(&self, file: FileId) -> bool {
        crate::utils::is_dts(&self.ctx.engine.lookup_path(file))
    }

    /// A span of `file` in wire (UTF-16) offsets.
    async fn wire_span(&self, file: FileId, span: Span) -> SpanMetadata {
        let syntax = self.ctx.analyze_file_syntax(file).await;
        SpanMetadata::new(span, &syntax.converter)
    }

    /// The wire span of the identifier declaring `reference` (`decl.node.name`): the registered
    /// class's name span when it is an Angular class, otherwise the binding's own span.
    async fn declaration_name_span(
        &self,
        reference: &ValueReference,
        info: Option<&ClassInfo>,
    ) -> SpanMetadata {
        if let Some(info) = info {
            return info.name_span;
        }
        let Some(reference_id) = reference.reference_id else {
            return self.wire_span(reference.file, reference.span).await;
        };
        let parsed = self.ctx.parse_file(reference.file).await;
        let span = {
            let guard = parsed.lock().unwrap();
            guard
                .borrow_dependent()
                .semantic
                .scoping()
                .symbol_span(reference_id.symbol)
        };
        self.wire_span(reference.file, span).await
    }

    /// `getDiagnosticNode(decl, rawExpr)`: the identifier naming the entry inside the list, or
    /// the whole list expression.
    async fn diagnostic_span(
        &self,
        module_file: FileId,
        entry: &ScopeEntry,
        list_span: Option<Span>,
    ) -> Option<SpanMetadata> {
        let within_list = entry
            .origin
            .filter(|origin| {
                list_span.is_none_or(|list| list.start <= origin.start && origin.end <= list.end)
            })
            .or_else(|| {
                list_span.and_then(|list| entry.reference.identity_in_expression(module_file, list))
            });
        let span = within_list.or(list_span)?;
        Some(self.wire_span(module_file, span).await)
    }

    async fn class_info(&self, reference: &ValueReference) -> Option<ClassInfo> {
        let syntax = self.ctx.analyze_file_syntax(reference.file).await;
        syntax.class_index.get(&reference.name).cloned()
    }
}

impl<'a, Fs: ResourceResolverFs + Clone + 'static> Resolver<'a, Fs> {
    /// `getScopeOfModuleReference` for a source NgModule, memoized with an in-progress marker so a
    /// module reached again while being resolved reports as a cycle.
    fn get_scope_of_module(&mut self, module: ReferenceId) -> BoxFuture<'_, State> {
        async move {
            if let Some(state) = self.cache.get(&module) {
                return state.clone();
            }
            self.cache.insert(module, State::InProgress);
            let state = self.resolve_module(module).await;
            self.cache.insert(module, state.clone());
            state
        }
        .boxed()
    }

    async fn resolve_module(&mut self, module: ReferenceId) -> State {
        let syntax = self.env.ctx.analyze_file_syntax(module.file).await;
        let Some(class) = syntax
            .classes
            .iter()
            .find(|class| class.reference_id == module)
        else {
            return State::Failed;
        };
        let (Some(ng_module), Some(module_name)) = (class.as_ng_module(), class.class_name.clone())
        else {
            return State::Failed;
        };
        let module_path = self.env.file_path(module.file);
        let module_name_span =
            SpanMetadata::new(class.name_span.unwrap_or(class.span), &syntax.converter);

        let mut diagnostics: Vec<NgDiagnostic> = Vec::new();

        // --- `analyze`: resolve the three lists, failing fast like `resolveTypeList`. -----------
        // The lists were flattened in parallel by `prepare_module`; a module reached through an
        // import that `ProgramFiles` did not enumerate falls back to flattening here.
        let mut prepared = self.prepared.remove(&module);
        let mut lists: [Vec<ScopeEntry>; 3] = Default::default();
        for (index, (slot, list_span, field)) in [
            (
                &ng_module.declarations,
                ng_module.declarations_span,
                "declarations",
            ),
            (&ng_module.imports, ng_module.imports_span, "imports"),
            (&ng_module.exports, ng_module.exports_span, "exports"),
        ]
        .into_iter()
        .enumerate()
        {
            let Some(slot) = slot else {
                continue;
            };
            let entries = match prepared.as_mut() {
                Some(prepared) => std::mem::take(&mut prepared[index]),
                None => scope_entries(slot, self.env.ctx).await,
            };
            let mut position = 0usize;
            let mut accepted = Vec::with_capacity(entries.len());
            for entry in entries {
                let entry = match entry {
                    Ok(entry) => entry,
                    Err(ScopeEntryRejection::NotAnArray(value)) => {
                        if let Some(span) = list_span {
                            diagnostics.push(NgDiagnostic::error(
                                1010,
                                module_path.clone(),
                                self.env.wire_span(module.file, span).await,
                                crate::evaluator::wrong_type_message(
                                    &format!(
                                        "Expected array when reading the NgModule.{field} of \
                                         {module_name}"
                                    ),
                                    &value,
                                ),
                            ));
                        }
                        self.registry.outcomes.insert(
                            module,
                            NgModuleScopeOutcome {
                                is_poisoned: true,
                                failed: true,
                                diagnostics,
                            },
                        );
                        return State::Failed;
                    }
                    Err(
                        ScopeEntryRejection::ModuleWithProvidersWithoutModule(rejected)
                        | ScopeEntryRejection::MapWithoutModule(rejected),
                    ) => {
                        if matches!(
                            rejected.unwrap_named(),
                            ResolvedValue::Dynamic(_) | ResolvedValue::Incomplete(_)
                        ) {
                            position += 1;
                            continue;
                        }
                        if let Some(span) = list_span {
                            diagnostics.push(NgDiagnostic::error(
                                1010,
                                module_path.clone(),
                                self.env.wire_span(module.file, span).await,
                                crate::evaluator::wrong_type_message(
                                    &format!(
                                        "Value at position {position} in the NgModule.{field} of \
                                         {module_name} is not a reference"
                                    ),
                                    &rejected,
                                ),
                            ));
                        }
                        self.registry.outcomes.insert(
                            module,
                            NgModuleScopeOutcome {
                                is_poisoned: true,
                                failed: true,
                                diagnostics,
                            },
                        );
                        return State::Failed;
                    }
                    Err(ScopeEntryRejection::ModuleWithProvidersMissingGeneric {
                        file,
                        span,
                        symbol_name,
                    }) => {
                        diagnostics.push(NgDiagnostic::error(
                            // NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC
                            6005,
                            self.env.file_path(file),
                            self.env.wire_span(file, span).await,
                            format!(
                                "{symbol_name} returns a ModuleWithProviders type without a \
                                 generic type argument. Please add a generic type argument to the \
                                 ModuleWithProviders type. If this occurrence is in library code \
                                 you don't control, please contact the library authors."
                            ),
                        ));
                        self.registry.outcomes.insert(
                            module,
                            NgModuleScopeOutcome {
                                is_poisoned: true,
                                failed: true,
                                diagnostics,
                            },
                        );
                        return State::Failed;
                    }
                };
                if entry.reference.kind != DeclKind::Class || entry.reference.member.is_some() {
                    let name_span = self.env.declaration_name_span(&entry.reference, None).await;
                    diagnostics.push(NgDiagnostic::error(
                        1010,
                        self.env.file_path(entry.reference.file),
                        name_span,
                        format!(
                            "Value at position {position} in the NgModule.{field} of {module_name} \
                             is not a class\n  Value is a reference to '{}'.",
                            entry.reference.name
                        ),
                    ));
                    self.registry.outcomes.insert(
                        module,
                        NgModuleScopeOutcome {
                            is_poisoned: true,
                            failed: true,
                            diagnostics,
                        },
                    );
                    return State::Failed;
                }
                position += 1;
                accepted.push(entry);
            }
            lists[index] = accepted;

            // Declarations must all be part of the current compilation; analysis stops here if
            // any is not.
            if field != "declarations" {
                continue;
            }
            for entry in &lists[0] {
                if !self.env.is_dts(entry.reference.file) {
                    continue;
                }
                let Some(span) = self
                    .env
                    .diagnostic_span(module.file, entry, ng_module.declarations_span)
                    .await
                else {
                    continue;
                };
                let info = self.env.class_info(&entry.reference).await;
                let name_span = self
                    .env
                    .declaration_name_span(&entry.reference, info.as_ref())
                    .await;
                let name = &entry.reference.name;
                diagnostics.push(
                    NgDiagnostic::error(
                        6001,
                        module_path.clone(),
                        span,
                        format!(
                            "Cannot declare '{name}' in an NgModule as it's not a part of the \
                             current compilation."
                        ),
                    )
                    .with_related_information(vec![NgRelatedInformation {
                        file_path: self.env.file_path(entry.reference.file),
                        span: name_span,
                        message_text: format!("'{name}' is declared here."),
                    }]),
                );
            }
            if !diagnostics.is_empty() {
                self.registry.outcomes.insert(
                    module,
                    NgModuleScopeOutcome {
                        is_poisoned: true,
                        failed: true,
                        diagnostics,
                    },
                );
                return State::Failed;
            }
        }
        let [declarations, imports, exports] = lists;

        // --- `getScopeOfModuleReference` ----------------------------------------------------
        let mut is_poisoned = self.structurally_broken.contains(&module);
        let mut compilation: HashSet<DeclKey> = HashSet::new();
        let mut declared: HashMap<DeclKey, SpanMetadata> = HashMap::new();
        let mut exported: Vec<DeclKey> = Vec::new();
        let mut exported_set: HashSet<DeclKey> = HashSet::new();

        // 1) imports.
        for entry in &imports {
            let info = self.env.class_info(&entry.reference).await;
            let key = decl_key(&entry.reference);
            match self
                .get_exported_scope(info.as_ref(), ListKind::Import, &mut diagnostics)
                .await
            {
                ExportedScope::Cycle => {
                    is_poisoned = true;
                    continue;
                }
                ExportedScope::Scope {
                    is_poisoned: import_poisoned,
                    exported: deps,
                } => {
                    if import_poisoned {
                        is_poisoned = true;
                        if let Some(span) = self
                            .env
                            .diagnostic_span(module.file, entry, ng_module.imports_span)
                            .await
                        {
                            diagnostics.push(NgDiagnostic::error(
                                ListKind::Import.code(),
                                module_path.clone(),
                                span,
                                "This import contains errors, which may affect components that \
                                 depend on this NgModule."
                                    .to_string(),
                            ));
                        }
                    }
                    compilation.extend(deps);
                    continue;
                }
                ExportedScope::NotAModule => {}
            }

            // Not an NgModule. Maybe a standalone entity?
            match info.as_ref().map(|info| info.class_type) {
                Some(ClassType::Component | ClassType::Directive | ClassType::Pipe) => {
                    let info = info.as_ref().unwrap();
                    if is_standalone_class(info, self.env.is_dts(entry.reference.file)) {
                        compilation.insert(key);
                    } else {
                        is_poisoned = true;
                        if let Some(span) = self
                            .env
                            .diagnostic_span(module.file, entry, ng_module.imports_span)
                            .await
                        {
                            diagnostics.push(
                                self.not_standalone_diagnostic(
                                    info,
                                    &key,
                                    module_path.clone(),
                                    span,
                                )
                                .await,
                            );
                        }
                    }
                }
                _ => {
                    is_poisoned = true;
                    if let Some(span) = self
                        .env
                        .diagnostic_span(module.file, entry, ng_module.imports_span)
                        .await
                    {
                        diagnostics.push(
                            self.invalid_ref(
                                entry,
                                info.as_ref(),
                                ListKind::Import,
                                module_path.clone(),
                                span,
                            )
                            .await,
                        );
                    }
                }
            }
        }

        // 2) declarations.
        for entry in &declarations {
            let key = decl_key(&entry.reference);
            let info = self.env.class_info(&entry.reference).await;
            let origin = self
                .env
                .diagnostic_span(module.file, entry, ng_module.declarations_span)
                .await;
            match info.as_ref().map(|info| info.class_type) {
                Some(ClassType::Component | ClassType::Directive | ClassType::Pipe) => {
                    let info = info.as_ref().unwrap();
                    if is_standalone_class(info, self.env.is_dts(entry.reference.file)) {
                        is_poisoned = true;
                        let kind = match info.class_type {
                            ClassType::Component => "Component",
                            ClassType::Directive => "Directive",
                            _ => "Pipe",
                        };
                        if let Some(span) = origin {
                            diagnostics.push(NgDiagnostic::error(
                                // NGMODULE_DECLARATION_IS_STANDALONE
                                6008,
                                module_path.clone(),
                                span,
                                format!(
                                    "{kind} {} is standalone, and cannot be declared in an \
                                     NgModule. Did you mean to import it instead?",
                                    entry.reference.name
                                ),
                            ));
                        }
                        continue;
                    }
                    compilation.insert(key.clone());
                }
                _ => {
                    is_poisoned = true;
                    if let Some(span) = origin {
                        let name = &entry.reference.name;
                        let name_span = self
                            .env
                            .declaration_name_span(&entry.reference, info.as_ref())
                            .await;
                        diagnostics.push(
                            NgDiagnostic::error(
                                // NGMODULE_INVALID_DECLARATION
                                6001,
                                module_path.clone(),
                                span,
                                format!(
                                    "The class '{name}' is listed in the declarations of the \
                                     NgModule '{module_name}', but is not a directive, a component, \
                                     or a pipe. Either remove it from the NgModule's declarations, \
                                     or add an appropriate Angular decorator."
                                ),
                            )
                            .with_related_information(vec![NgRelatedInformation {
                                file_path: self.env.file_path(entry.reference.file),
                                span: name_span,
                                message_text: format!("'{name}' is declared here."),
                            }]),
                        );
                    }
                    continue;
                }
            }
            declared.insert(key, origin.unwrap_or(module_name_span));
        }

        // 3) exports.
        for entry in &exports {
            let key = decl_key(&entry.reference);
            let info = self.env.class_info(&entry.reference).await;
            match self
                .get_exported_scope(info.as_ref(), ListKind::Export, &mut diagnostics)
                .await
            {
                ExportedScope::Cycle => {
                    is_poisoned = true;
                    continue;
                }
                ExportedScope::Scope {
                    is_poisoned: export_poisoned,
                    exported: deps,
                } => {
                    if export_poisoned {
                        is_poisoned = true;
                        if let Some(span) = self
                            .env
                            .diagnostic_span(module.file, entry, ng_module.exports_span)
                            .await
                        {
                            diagnostics.push(NgDiagnostic::error(
                                ListKind::Export.code(),
                                module_path.clone(),
                                span,
                                "This export contains errors, which may affect components that \
                                 depend on this NgModule."
                                    .to_string(),
                            ));
                        }
                    }
                    for dep in deps {
                        if exported_set.insert(dep.clone()) {
                            exported.push(dep);
                        }
                    }
                    continue;
                }
                ExportedScope::NotAModule => {}
            }

            if compilation.contains(&key) {
                if exported_set.insert(key.clone()) {
                    exported.push(key);
                }
                continue;
            }

            is_poisoned = true;
            let Some(span) = self
                .env
                .diagnostic_span(module.file, entry, ng_module.exports_span)
                .await
            else {
                continue;
            };
            match info.as_ref().map(|info| info.class_type) {
                Some(ClassType::Component | ClassType::Directive | ClassType::Pipe) => {
                    let info = info.as_ref().unwrap();
                    let is_dts = self.env.is_dts(entry.reference.file);
                    let reason = if is_standalone_class(info, is_dts) {
                        "it must be imported first"
                    } else if is_dts {
                        "it must be imported via its NgModule first"
                    } else {
                        "it must be either declared by this NgModule, or imported here via its \
                         NgModule first"
                    };
                    diagnostics.push(NgDiagnostic::error(
                        // NGMODULE_INVALID_REEXPORT
                        6004,
                        module_path.clone(),
                        span,
                        format!("Can't be exported from this NgModule, as {reason}"),
                    ));
                }
                _ => {
                    diagnostics.push(
                        self.invalid_ref(
                            entry,
                            info.as_ref(),
                            ListKind::Export,
                            module_path.clone(),
                            span,
                        )
                        .await,
                    );
                }
            }
        }

        // TODO(parity): `getReexports` (NG6006, `NGMODULE_REEXPORT_NAME_COLLISION`) depends on
        // the aliasing host used for private re-export emission, which NGP does not implement yet.

        self.registry.records.insert(
            module,
            ModuleRecord {
                name: module_name,
                name_span: module_name_span,
                declaration_origins: declared,
                exported: exported_set,
            },
        );
        self.registry.outcomes.insert(
            module,
            NgModuleScopeOutcome {
                is_poisoned,
                failed: false,
                diagnostics,
            },
        );
        State::Done(Arc::new(ResolvedScope {
            is_poisoned,
            exported,
        }))
    }

    /// `getExportedScope`: the export scope of a referenced NgModule, from this program or a
    /// `.d.ts`, or `NotAModule` when the reference is not a registered NgModule.
    async fn get_exported_scope(
        &mut self,
        info: Option<&ClassInfo>,
        kind: ListKind,
        diagnostics: &mut Vec<NgDiagnostic>,
    ) -> ExportedScope {
        let Some(info) = info.filter(|info| info.class_type == ClassType::NgModule) else {
            return ExportedScope::NotAModule;
        };
        if self.env.is_dts(info.reference_id.file) {
            return match self.resolve_dts_module(info.reference_id).await {
                Some(scope) => ExportedScope::Scope {
                    is_poisoned: scope.is_poisoned,
                    exported: scope.exported.clone(),
                },
                None => ExportedScope::NotAModule,
            };
        }
        match self.get_scope_of_module(info.reference_id).await {
            State::InProgress => {
                diagnostics.push(NgDiagnostic::error(
                    kind.code(),
                    self.env.file_path(info.reference_id.file),
                    info.name_span,
                    format!("NgModule \"{}\" field contains a cycle", kind.noun()),
                ));
                ExportedScope::Cycle
            }
            State::Failed => ExportedScope::NotAModule,
            State::Done(scope) => ExportedScope::Scope {
                is_poisoned: scope.is_poisoned,
                exported: scope.exported.clone(),
            },
        }
    }

    /// `MetadataDtsModuleScopeResolver.resolve`: a `.d.ts` NgModule's export scope, poisoned when
    /// its `exports` type tuple does not resolve entirely to classes (`DtsMetadataReader`).
    fn resolve_dts_module(
        &mut self,
        module: ReferenceId,
    ) -> BoxFuture<'_, Option<Arc<ResolvedScope>>> {
        async move {
            if let Some(cached) = self.dts_cache.get(&module) {
                return cached.clone();
            }
            // Guard against re-export cycles between `.d.ts` modules.
            self.dts_cache.insert(module, None);

            let syntax = self.env.ctx.analyze_file_syntax(module.file).await;
            let Some(ng_module) = syntax
                .classes
                .iter()
                .find(|class| class.reference_id == module)
                .and_then(|class| class.as_ng_module())
            else {
                return None;
            };

            let mut is_poisoned = false;
            if let Some(slot) = &ng_module.exports {
                let mut completed = slot.clone();
                completed
                    .complete_with(
                        self.env.ctx,
                        crate::analyzer::resolvers::angular_foreign_resolvers(),
                    )
                    .await;
                is_poisoned = !exports_resolve_to_classes(completed.raw());
            }

            let scope = self.env.ctx.ngmodule_exports_scope(module).await;
            let exported = scope
                .iter()
                .map(|decl| (decl.reference.file, decl.reference.name.clone()))
                .collect();
            let resolved = Arc::new(ResolvedScope {
                is_poisoned,
                exported,
            });
            self.dts_cache.insert(module, Some(resolved.clone()));
            Some(resolved)
        }
        .boxed()
    }

    /// `makeNotStandaloneDiagnostic` for an NgModule import, with the hint from the registry
    /// being built.
    async fn not_standalone_diagnostic(
        &self,
        info: &ClassInfo,
        key: &DeclKey,
        file_path: String,
        span: SpanMetadata,
    ) -> NgDiagnostic {
        self.env
            .not_standalone_diagnostic(&self.registry, info, key, file_path, span)
            .await
    }

    async fn invalid_ref(
        &self,
        entry: &ScopeEntry,
        info: Option<&ClassInfo>,
        kind: ListKind,
        file_path: String,
        span: SpanMetadata,
    ) -> NgDiagnostic {
        self.env
            .invalid_ref(entry, info, kind, file_path, span)
            .await
    }
}

impl<'a, Fs: ResourceResolverFs + Clone + 'static> ScopeEnv<'a, Fs> {
    /// `makeNotStandaloneDiagnostic` (NG2011, `COMPONENT_IMPORT_NOT_STANDALONE`): a
    /// non-standalone component/directive/pipe listed in `imports`, with a hint naming the
    /// NgModule that declares it when there is one.
    async fn not_standalone_diagnostic(
        &self,
        registry: &NgModuleScopeRegistry,
        info: &ClassInfo,
        key: &DeclKey,
        file_path: String,
        span: SpanMetadata,
    ) -> NgDiagnostic {
        let kind = match info.class_type {
            ClassType::Component => "component",
            ClassType::Directive => "directive",
            _ => "pipe",
        };
        let mapping = self.ctx.component_mapping().await;
        let hint = mapping.get(key.0, &key.1).and_then(|declaring| {
            let module_path = self.file_path(declaring.file);
            registry.not_standalone_hint(declaring, key, &module_path)
        });
        let mut message = format!(
            "The {kind} '{}' appears in 'imports', but is not standalone and cannot be \
             imported directly.",
            info.class_name
        );
        if hint.is_none() {
            message.push_str(" It must be imported via an NgModule.");
        }
        NgDiagnostic::error(2011, file_path, span, message)
            .with_related_information(hint.into_iter().collect())
    }

    /// `invalidRef`: an import that is not an NgModule or standalone entity, or an export that
    /// is none of NgModule/component/directive/pipe, with ngtsc's hint about why.
    async fn invalid_ref(
        &self,
        entry: &ScopeEntry,
        info: Option<&ClassInfo>,
        kind: ListKind,
        file_path: String,
        span: SpanMetadata,
    ) -> NgDiagnostic {
        let name = &entry.reference.name;
        let resolve_target = match kind {
            ListKind::Import => "NgModule",
            ListKind::Export => "NgModule, Component, Directive, or Pipe",
        };
        let decl_path = self.file_path(entry.reference.file);
        let library = entry
            .reference
            .owning_reference
            .as_ref()
            .map(|owning| format!(" ({})", owning.specifier()))
            .unwrap_or_default();
        let related_message = if !crate::utils::is_dts(std::path::Path::new(&decl_path)) {
            let annotation = match kind {
                ListKind::Import => "@NgModule",
                ListKind::Export => "Angular",
            };
            format!("Is it missing an {annotation} annotation?")
        } else if decl_path.contains("node_modules") {
            format!(
                "This likely means that the library{library} which declares {name} is not \
                 compatible with Angular Ivy. Check if a newer version of the library is \
                 available, and update if so. Also consider checking with the library's authors \
                 to see if the library is expected to be compatible with Ivy."
            )
        } else {
            format!(
                "This likely means that the dependency{library} which declares {name} is not \
                 compatible with Angular Ivy."
            )
        };
        let name_span = self.declaration_name_span(&entry.reference, info).await;
        NgDiagnostic::error(
            kind.code(),
            file_path,
            span,
            format!("'{name}' does not appear to be an {resolve_target} class."),
        )
        .with_related_information(vec![NgRelatedInformation {
            file_path: decl_path,
            span: name_span,
            message_text: related_message,
        }])
    }
}

/// What a standalone component's `imports` validation found.
#[derive(Debug, Default)]
pub(crate) struct StandaloneImportsValidation {
    pub diagnostics: Vec<NgDiagnostic>,
    /// `StandaloneComponentScopeReader`'s `isPoisoned`: an entry was not a standalone
    /// component/directive/pipe or an NgModule, or an imported NgModule's scope is poisoned.
    pub is_poisoned: bool,
}

enum ComponentImportItem {
    Reference {
        entry: ScopeEntry,
        expr_span: Option<Span>,
    },
    WrongType {
        span: Option<Span>,
        value: ResolvedValue,
    },
    ModuleWithProviders {
        span: Option<Span>,
    },
    ModuleWithProvidersMissingGeneric {
        file: FileId,
        span: Span,
        symbol_name: String,
    },
}

fn unwrap_named_with_span(mut value: &ResolvedValue) -> (Option<Span>, &ResolvedValue) {
    let mut outer_span = None;
    while let ResolvedValue::Named {
        span, value: inner, ..
    } = value
    {
        if outer_span.is_none() {
            outer_span = Some(*span);
        }
        value = inner;
    }
    (outer_span, value)
}

/// Walk evaluated `@Component.imports` in lockstep with the syntactic [`ExprSpanTree`],
/// mirroring ngtsc's `validateAndFlattenComponentImports` and `getDiagnosticOrigin`.
fn collect_component_import_items(
    component_file: FileId,
    imports: &ResolvedValue,
    expr: Option<&crate::analyzer::ExprSpanTree>,
    fallback_span: Option<Span>,
    out: &mut Vec<ComponentImportItem>,
) {
    let expr_span = expr.map(crate::analyzer::ExprSpanTree::span).or(fallback_span);
    let ResolvedValue::Array(items) = imports.unwrap_named() else {
        match imports.unwrap_named() {
            ResolvedValue::Incomplete(_) => return,
            ResolvedValue::Dynamic(d) => {
                let root = d.root_cause();
                if matches!(
                    root.reason,
                    crate::evaluator::DynamicReason::UnresolvedImport(_)
                        | crate::evaluator::DynamicReason::ImportCycle
                        | crate::evaluator::DynamicReason::DepthLimit
                ) {
                    return;
                }
                if let crate::evaluator::DynamicReason::ModuleWithProvidersMissingGeneric {
                    symbol_name,
                } = &root.reason
                {
                    out.push(ComponentImportItem::ModuleWithProvidersMissingGeneric {
                        file: root.file,
                        span: root.span,
                        symbol_name: symbol_name.clone(),
                    });
                    return;
                }
            }
            _ => {}
        }
        out.push(ComponentImportItem::WrongType {
            span: expr_span,
            value: imports.clone(),
        });
        return;
    };

    let elem_trees = match expr {
        Some(crate::analyzer::ExprSpanTree::Array { elements, .. })
            if elements.len() == items.len() =>
        {
            Some(elements.as_slice())
        }
        _ => None,
    };

    for (i, raw_item) in items.iter().enumerate() {
        let ref_expr = elem_trees.map(|elems| &elems[i]).or(expr);
        let (named_span, item) = unwrap_named_with_span(raw_item);
        match item {
            ResolvedValue::Array(_) => {
                collect_component_import_items(component_file, item, ref_expr, expr_span, out);
            }
            ResolvedValue::Reference(reference) => {
                out.push(ComponentImportItem::Reference {
                    entry: ScopeEntry {
                        reference: reference.clone(),
                        origin: named_span,
                    },
                    expr_span,
                });
            }
            ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders {
                call_span,
                call_file,
                ..
            }) => {
                let call_within = (*call_file == component_file
                    && expr_span.is_some_and(|list| {
                        list.start <= call_span.start && call_span.end <= list.end
                    }))
                .then_some(*call_span);
                out.push(ComponentImportItem::ModuleWithProviders {
                    span: call_within.or(expr_span),
                });
            }
            ResolvedValue::Map(map) if map.contains_key("ngModule") => {
                if let Some(ResolvedValue::Dynamic(d)) =
                    map.get("ngModule").map(ResolvedValue::unwrap_named)
                {
                    let root = d.root_cause();
                    if let crate::evaluator::DynamicReason::ModuleWithProvidersMissingGeneric {
                        symbol_name,
                    } = &root.reason
                    {
                        out.push(ComponentImportItem::ModuleWithProvidersMissingGeneric {
                            file: root.file,
                            span: root.span,
                            symbol_name: symbol_name.clone(),
                        });
                        continue;
                    }
                }
                out.push(ComponentImportItem::ModuleWithProviders { span: expr_span });
            }
            ResolvedValue::Incomplete(_) => {}
            ResolvedValue::Dynamic(d) => {
                let root = d.root_cause();
                if matches!(
                    root.reason,
                    crate::evaluator::DynamicReason::UnresolvedImport(_)
                        | crate::evaluator::DynamicReason::ImportCycle
                        | crate::evaluator::DynamicReason::DepthLimit
                ) {
                    continue;
                }
                if let crate::evaluator::DynamicReason::ModuleWithProvidersMissingGeneric {
                    symbol_name,
                } = &root.reason
                {
                    out.push(ComponentImportItem::ModuleWithProvidersMissingGeneric {
                        file: root.file,
                        span: root.span,
                        symbol_name: symbol_name.clone(),
                    });
                    continue;
                }
                let ref_expr_span = ref_expr
                    .map(crate::analyzer::ExprSpanTree::span)
                    .or(expr_span);
                let (diag_span, diag_value) = if d.file == component_file
                    && expr_span
                        .is_some_and(|es| es.start <= d.span.start && d.span.end <= es.end)
                {
                    (Some(d.span), item.clone())
                } else if ref_expr_span != expr_span {
                    (ref_expr_span, item.clone())
                } else {
                    (expr_span, imports.clone())
                };
                out.push(ComponentImportItem::WrongType {
                    span: diag_span,
                    value: diag_value,
                });
            }
            _ => {
                let ref_expr_span = ref_expr
                    .map(crate::analyzer::ExprSpanTree::span)
                    .or(expr_span);
                let (diag_span, diag_value) = if ref_expr_span != expr_span {
                    (ref_expr_span, item.clone())
                } else {
                    (expr_span, imports.clone())
                };
                out.push(ComponentImportItem::WrongType {
                    span: diag_span,
                    value: diag_value,
                });
            }
        }
    }
}

/// Validate the evaluated `imports` of a standalone component in `component_file`: ngtsc's
/// `validateStandaloneImports` (`annotations/component/src/handler.ts`) together with the
/// `ModuleWithProviders` rejection of `validateAndFlattenComponentImports` (`.../util.ts`).
/// `imports_span` is the `imports` property's value expression, the fallback diagnostic node.
pub(crate) async fn validate_standalone_imports<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryContext<Fs>,
    component_file: FileId,
    imports: &ResolvedValue,
    imports_span: Option<Span>,
    imports_span_tree: Option<&crate::analyzer::ExprSpanTree>,
) -> StandaloneImportsValidation {
    let env = ScopeEnv { ctx };
    let file_path = env.file_path(component_file);
    let mut out = StandaloneImportsValidation::default();

    let mut items = Vec::new();
    collect_component_import_items(
        component_file,
        imports,
        imports_span_tree,
        imports_span,
        &mut items,
    );
    if items.is_empty() {
        return out;
    }
    // The registry is a whole-program barrier (`ngmodule_scope_registry_body`); only fetch it
    // when an entry needs it, so a component importing only standalone entities does not wait.
    let mut registry: Option<Arc<NgModuleScopeRegistry>> = None;

    for item in items {
        let (entry, entry_expr_span) = match item {
            ComponentImportItem::Reference { entry, expr_span } => (entry, expr_span),
            ComponentImportItem::WrongType { span, value } => {
                out.is_poisoned = true;
                if let Some(span) = span.or(imports_span) {
                    out.diagnostics.push(NgDiagnostic::error(
                        // VALUE_HAS_WRONG_TYPE
                        1010,
                        file_path.clone(),
                        env.wire_span(component_file, span).await,
                        crate::evaluator::wrong_type_message(
                            "'imports' must be an array of components, directives, pipes, or \
                             NgModules.",
                            &value,
                        ),
                    ));
                }
                continue;
            }
            ComponentImportItem::ModuleWithProviders { span } => {
                out.is_poisoned = true;
                if let Some(span) = span.or(imports_span) {
                    out.diagnostics.push(NgDiagnostic::error(
                        // COMPONENT_UNKNOWN_IMPORT
                        2012,
                        file_path.clone(),
                        env.wire_span(component_file, span).await,
                        "Component imports contains a ModuleWithProviders value, likely the \
                         result of a 'Module.forRoot()'-style call. These calls are not used to \
                         configure components and are not valid in standalone component imports - \
                         consider importing them in the application bootstrap instead."
                            .to_string(),
                    ));
                }
                continue;
            }
            ComponentImportItem::ModuleWithProvidersMissingGeneric {
                file,
                span,
                symbol_name,
            } => {
                out.is_poisoned = true;
                out.diagnostics.push(NgDiagnostic::error(
                    // NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC
                    6005,
                    env.file_path(file),
                    env.wire_span(file, span).await,
                    format!(
                        "{symbol_name} returns a ModuleWithProviders type without a generic type \
                         argument. Please add a generic type argument to the ModuleWithProviders \
                         type. If this occurrence is in library code you don't control, please \
                         contact the library authors."
                    ),
                ));
                continue;
            }
        };

        let Some(span) = env
            .diagnostic_span(component_file, &entry, entry_expr_span.or(imports_span))
            .await
        else {
            continue;
        };
        if entry.reference.kind != DeclKind::Class || entry.reference.member.is_some() {
            out.is_poisoned = true;
            out.diagnostics.push(NgDiagnostic::error(
                // VALUE_HAS_WRONG_TYPE
                1010,
                file_path.clone(),
                span,
                format!(
                    "'imports' must be an array of components, directives, pipes, or NgModules.\n  \
                     Value is a reference to '{}'.",
                    entry.reference.name
                ),
            ));
            continue;
        }

        let info = env.class_info(&entry.reference).await;
        match info.as_ref().map(|info| info.class_type) {
            Some(ClassType::Component | ClassType::Directive | ClassType::Pipe) => {
                let info = info.as_ref().unwrap();
                if is_standalone_class(info, env.is_dts(entry.reference.file)) {
                    continue;
                }
                out.is_poisoned = true;
                let key = decl_key(&entry.reference);
                if registry.is_none() {
                    registry = Some(ctx.ngmodule_scope_registry().await);
                }
                let registry = registry.as_ref().unwrap();
                out.diagnostics.push(
                    env.not_standalone_diagnostic(registry, info, &key, file_path.clone(), span)
                        .await,
                );
            }
            Some(ClassType::NgModule) => {
                let info = info.as_ref().unwrap();
                if env.is_dts(info.reference_id.file) {
                    continue;
                }
                if registry.is_none() {
                    registry = Some(ctx.ngmodule_scope_registry().await);
                }
                if registry.as_ref().unwrap().is_poisoned(info.reference_id) {
                    out.is_poisoned = true;
                }
            }
            _ => {
                out.is_poisoned = true;
                out.diagnostics.push(NgDiagnostic::error(
                    // COMPONENT_UNKNOWN_IMPORT
                    2012,
                    file_path.clone(),
                    span,
                    "Component imports must be standalone components, directives, pipes, or must \
                     be NgModules."
                        .to_string(),
                ));
            }
        }
    }
    out
}

/// `DtsMetadataReader.extractReferencesFromResolvedValue`: every element must be a class
/// reference for the metadata to be complete.
fn exports_resolve_to_classes(value: &ResolvedValue) -> bool {
    match value.unwrap_named() {
        ResolvedValue::Array(items) => items.iter().all(exports_resolve_to_classes),
        ResolvedValue::Reference(reference)
        | ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders {
            ng_module: reference,
            ..
        }) => reference.kind == DeclKind::Class && reference.member.is_none(),
        _ => false,
    }
}
