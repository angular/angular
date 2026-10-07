use crate::query::FileId;
use crate::types::analysis::OwningReference;
use crate::ResourceResolverFs;
use futures::future::{BoxFuture, FutureExt};
use oxc_resolver::ResolverGeneric;
use oxc_semantic::SymbolId;
use oxc_syntax::module_record::{ExportExportName, ExportImportName, ImportImportName};
use oxc_syntax::symbol::SymbolFlags;
use std::collections::HashSet;
use std::path::{Path, PathBuf};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ChaseSymbolError {
    DepthLimitExceeded,
    CycleDetected,
}

#[derive(Clone, Debug)]
pub struct DeclaredSymbol {
    pub file_path: PathBuf,
    pub symbol_id: SymbolId,
    pub flags: SymbolFlags,
    pub owning_reference: Option<OwningReference>,
    /// The name this symbol is bound to in each file the chase passed through, declaration
    /// file first. Only files that actually *bind* the name are recorded: a bare
    /// `export { X } from './x'` forwards the symbol without introducing a binding, so
    /// nothing there can name it. Consumers rely on that — an entry means "this file can
    /// write this identifier today", and its absence means "emit an import".
    pub aliases: Vec<(FileId, String)>,
    /// Each file the chase entered from another module, declaration file first, paired with the
    /// name it was asked for there: the name that file *exports* the symbol under. Unlike
    /// [`Self::aliases`] this includes files that only forward the symbol, and it keeps the
    /// exported name where a file renames (`export { X as Y }` records `Y`, `aliases` records `X`).
    pub export_hops: Vec<(FileId, String)>,
    /// True when `file_path` exports this symbol under the reserved `default` key rather
    /// than under [`Self::symbol_id`]'s own name, i.e. importers reach it as `m.default`.
    pub exported_as_default: bool,
}

impl DeclaredSymbol {
    pub fn is_type_only(&self) -> bool {
        self.flags.intersects(SymbolFlags::Type) && !self.flags.intersects(SymbolFlags::Value)
    }
}

/// A module's `default` export that binds no name: `export default <expression>`. Upstream's
/// reflection host resolves such an export to its `ExportAssignment`, which
/// `StaticInterpreter.visitDeclaration` evaluates as the exported expression.
#[derive(Clone, Debug)]
pub struct DefaultExportExpression {
    /// The module whose `export default` statement holds the expression.
    pub file_path: PathBuf,
    pub owning_reference: Option<OwningReference>,
}

/// Where the chase for an exported name ends.
#[derive(Clone, Debug)]
pub enum ChasedExport {
    /// A declared symbol: a class, function, variable, enum, …
    Symbol(DeclaredSymbol),
    /// `export default <expression>`, which has no symbol to name.
    DefaultExpression(DefaultExportExpression),
}

impl ChasedExport {
    fn is_type_only(&self) -> bool {
        match self {
            Self::Symbol(symbol) => symbol.is_type_only(),
            Self::DefaultExpression(_) => false,
        }
    }

    /// Record that the chase entered `file` asking for `name` (see
    /// [`DeclaredSymbol::export_hops`]). An expression has no identity to project into other
    /// files, so only symbols keep the trail.
    fn record_export_hop(&mut self, file: FileId, name: String) {
        if let Self::Symbol(symbol) = self {
            symbol.export_hops.push((file, name));
        }
    }

    fn into_symbol(self) -> Option<DeclaredSymbol> {
        match self {
            Self::Symbol(symbol) => Some(symbol),
            Self::DefaultExpression(_) => None,
        }
    }
}

/// Resolve an import specifier relative to a file using oxc_resolver's standard resolution logic.
pub fn resolve_specifier<Fs: ResourceResolverFs>(
    resolver: &ResolverGeneric<Fs>,
    file_path: &Path,
    specifier: &str,
) -> Option<PathBuf> {
    let file_dir = file_path.parent().unwrap_or(Path::new("."));
    resolver
        .resolve(file_dir, specifier)
        .ok()
        .map(|res| res.into_path_buf())
}

/// Resolve `export_name` from `specifier` relative to `file_path`, chasing re-exports across file boundaries.
///
/// If `specifier` is provided, it first resolves the specifier to a target file. Then it traces the symbol
/// through import and re-export chains to locate its underlying declaration. A chase that ends at
/// `export default <expression>` names no symbol and yields `None`; value consumers that can
/// evaluate the expression use [`cross_file_resolve_export`].
pub fn cross_file_resolve<'a, Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &'a crate::QueryCtx<Fs>,
    file_path: &'a Path,
    specifier: Option<&'a str>,
    export_name: String,
    visited: &'a mut HashSet<(PathBuf, String)>,
) -> BoxFuture<'a, Result<Option<DeclaredSymbol>, ChaseSymbolError>> {
    async move {
        let chased =
            cross_file_resolve_export(ctx, file_path, specifier, export_name, visited).await?;
        Ok(chased.and_then(ChasedExport::into_symbol))
    }
    .boxed()
}

/// [`cross_file_resolve`], but also reporting a chase that ends at `export default <expression>`.
pub fn cross_file_resolve_export<'a, Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &'a crate::QueryCtx<Fs>,
    file_path: &'a Path,
    specifier: Option<&'a str>,
    export_name: String,
    visited: &'a mut HashSet<(PathBuf, String)>,
) -> BoxFuture<'a, Result<Option<ChasedExport>, ChaseSymbolError>> {
    async move {
        let (target_file, initial_owning) = match specifier {
            Some(spec) if !spec.is_empty() => {
                let Some(resolved) =
                    resolve_specifier(ctx.engine.resolver.as_ref(), file_path, spec)
                else {
                    return Ok(None);
                };
                // `export_name` is what this specifier is being asked for, which is exactly
                // the name it exports the symbol under.
                let owning = OwningReference::is_absolute_specifier(spec).then(|| {
                    // `spec` is the specifier text of the import/re-export being chased.
                    OwningReference::from_source_specifier(spec, export_name.clone())
                });
                (resolved, owning)
            }
            _ => (file_path.to_path_buf(), None),
        };

        let entered_from_specifier = specifier.is_some_and(|spec| !spec.is_empty());
        let target_id = ctx.engine.intern_path(&target_file);
        let mut resolved = chase_symbol_declaration(
            ctx,
            target_file,
            export_name.clone(),
            initial_owning,
            visited,
            0,
            entered_from_specifier,
        )
        .await?;
        if let (Some(chased), true) = (resolved.as_mut(), entered_from_specifier) {
            chased.record_export_hop(target_id, export_name);
        }
        Ok(resolved)
    }
    .boxed()
}

const MAX_SYMBOL_CHASE_DEPTH: usize = 32;

/// Whenever an absolute specifier is encountered along the export resolution chain it
/// overwrites the current owning module with the deeper one — paired with `name_in_target`,
/// the name that specifier exports the symbol under.
fn update_owning_reference(
    current: Option<&OwningReference>,
    specifier: &str,
    name_in_target: &str,
) -> Option<OwningReference> {
    if OwningReference::is_absolute_specifier(specifier) {
        // `specifier` is the specifier text of a re-export encountered on the chain.
        return Some(OwningReference::from_source_specifier(
            specifier,
            name_in_target,
        ));
    }
    current.cloned()
}

/// Target resolution metadata extracted synchronously under mutex lock from a parsed AST.
enum ChaseTarget {
    /// The symbol is exported or imported from another module (`export { A } from 'spec'` or `import { A } from 'spec'`).
    /// Points to `(original_name, source_specifier)`.
    Exported {
        original_name: String,
        source: String,
        /// True when this file also *binds* the name being chased, so code here can write it
        /// directly. An `import` binds; a bare re-export does not.
        binds_locally: bool,
    },

    /// The symbol is an alias for a distinct local identifier in the same file (`export { localName as exportedName }`).
    LocalAlias(String),

    /// The symbol is not explicitly exported/imported directly, but the file has wildcard re-exports (`export * from 'spec'`).
    Wildcards(Vec<String>),

    /// The symbol is declared locally in this file's root scope.
    LocalBinding(SymbolId, SymbolFlags),

    /// The chased name is `default` and this file's `export default` binds no name
    /// (`export default [A]`).
    DefaultExpression,

    /// The symbol was not found in this file.
    NotFound,
}

/// Synchronously inspect a parsed AST's module record and semantic model to extract the primary chase target for `name`.
fn chase_symbol_in_file_inner(
    dep: &crate::parsed::ParsedFileDependent<'_>,
    name: &str,
    require_exported: bool,
) -> ChaseTarget {
    let module_record = &dep.module_record;

    // Steps 1 and 2 match export names, which only an exported lookup asks for. A local
    // lookup names a binding of this file, and export names are a separate namespace:
    // `export { a as SHARED, b as a }` exports `b` as `a`, but the local `a` is still `a`.

    // 1. Indirect exports (`export { A as B } from 'source'`)
    for entry in &module_record.indirect_export_entries {
        // A type-only re-export cannot back a value reference.
        if entry.is_type {
            continue;
        }
        let Some(ref source) = entry.module_request else {
            continue;
        };
        let exported_name = match &entry.export_name {
            ExportExportName::Name(ns) => ns.name.as_str(),
            ExportExportName::Default(_) => "default",
            ExportExportName::Null => continue,
        };
        if require_exported && exported_name == name {
            let local_name = match &entry.import_name {
                ExportImportName::Name(ns) => ns.name.to_string(),
                ExportImportName::All => "*".to_string(),
                _ => continue,
            };
            return ChaseTarget::Exported {
                original_name: local_name,
                source: source.name.to_string(),
                // The spec folds `import { X } from './x'; export { X };` into an indirect
                // export entry, and there `X` *is* bound here.
                binds_locally: module_record
                    .import_entries
                    .iter()
                    .any(|import| import.local_name.name.as_str() == name),
            };
        }
    }

    // 2. Local export aliases (`export { localName as exportedName }`)
    for entry in &module_record.local_export_entries {
        let exported_name = match &entry.export_name {
            ExportExportName::Name(ns) => ns.name.as_str(),
            ExportExportName::Default(_) => "default",
            ExportExportName::Null => continue,
        };
        if !require_exported || exported_name != name {
            continue;
        }
        // Bare-identifier `export default Foo` chases as a local alias; other expressions return `DefaultExpression`.
        let Some(local_name) = entry.local_name.name() else {
            for node in dep.semantic.nodes() {
                let oxc_ast::AstKind::ExportDefaultDeclaration(decl) = node.kind() else {
                    continue;
                };
                if let Some(oxc_ast::ast::Expression::Identifier(ident)) =
                    decl.declaration.as_expression()
                {
                    return ChaseTarget::LocalAlias(ident.name.to_string());
                }
                break;
            }
            return ChaseTarget::DefaultExpression;
        };
        if local_name.as_str() != name {
            return ChaseTarget::LocalAlias(local_name.to_string());
        }
    }

    let is_locally_exported = !require_exported
        || module_record.local_export_entries.iter().any(|entry| {
            let exported_name = match &entry.export_name {
                ExportExportName::Name(ns) => ns.name.as_str(),
                ExportExportName::Default(_) => "default",
                ExportExportName::Null => return false,
            };
            exported_name == name
        });

    if is_locally_exported {
        // 3. Local imports (`import { A as B } from 'source'`)
        for entry in &module_record.import_entries {
            if entry.local_name.name.as_str() == name {
                let original_name = match &entry.import_name {
                    ImportImportName::Name(ns) => ns.name.to_string(),
                    ImportImportName::Default(_) => "default".to_string(),
                    ImportImportName::NamespaceObject => name.to_string(),
                };
                return ChaseTarget::Exported {
                    original_name,
                    source: entry.module_request.name.to_string(),
                    binds_locally: true,
                };
            }
        }

        // 4. Local symbol binding in root scope
        if let Some(symbol_id) = dep.semantic.scoping().get_root_binding(name.into()) {
            let flags = dep.semantic.scoping().symbol_flags(symbol_id);
            return ChaseTarget::LocalBinding(symbol_id, flags);
        }
    }

    // 5. Wildcard / star exports (`export * from 'source'`), which never re-export `default`.
    if name == "default" {
        return ChaseTarget::NotFound;
    }
    let mut wildcards = Vec::new();
    for entry in &module_record.star_export_entries {
        // `export type * from 'source'` forwards no values.
        if entry.is_type {
            continue;
        }
        let Some(ref source) = entry.module_request else {
            continue;
        };
        wildcards.push(source.name.to_string());
    }
    if !wildcards.is_empty() {
        return ChaseTarget::Wildcards(wildcards);
    }

    ChaseTarget::NotFound
}

/// Asynchronously inspect a file's cached `AnalyzeFileSyntax` exports and semantic model to extract the primary chase target for `name`.
async fn chase_symbol_in_file<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &crate::QueryCtx<Fs>,
    file_path: &Path,
    name: &str,
    require_exported: bool,
) -> ChaseTarget {
    // Step 1: Check memoized single-file syntax exports cache (QueryKey::AnalyzeFileSyntax)
    let file_id = ctx.engine.intern_path(file_path);
    let syntax = ctx.analyze_file_syntax(file_id).await;
    let exports = &syntax.file_exports;

    // Steps 1 and 2 match export names, which only an exported lookup asks for (see
    // `chase_symbol_in_file_inner`).

    // 1. Indirect / named re-exports (`export { A as B } from 'source'`)
    for entry in &exports.named {
        if entry.is_type {
            continue;
        }
        if require_exported && entry.exported_name == name {
            return ChaseTarget::Exported {
                original_name: entry.local_name.clone(),
                source: entry.source.clone(),
                binds_locally: entry.binds_locally,
            };
        }
    }

    // 2. Local export aliases (`export { localName as exportedName }`)
    for entry in &exports.local_aliases {
        if require_exported && entry.exported_name == name && entry.local_name != name {
            return ChaseTarget::LocalAlias(entry.local_name.clone());
        }
    }

    // Step 2: Fall back to parsed AST for local import, root binding, or wildcard lookup
    let parsed_file_arc = ctx.parse_file(file_id).await;
    let guard = parsed_file_arc.lock().unwrap();
    let inner_target = chase_symbol_in_file_inner(guard.borrow_dependent(), name, require_exported);
    if !matches!(inner_target, ChaseTarget::NotFound) {
        return inner_target;
    }

    // 3. Wildcard / star exports (`export * from 'source'`), which never re-export `default`.
    if name == "default" {
        return ChaseTarget::NotFound;
    }
    let value_wildcards: Vec<String> = exports
        .wildcards
        .iter()
        .filter(|w| !w.is_type)
        .map(|w| w.source.clone())
        .collect();
    if !value_wildcards.is_empty() {
        return ChaseTarget::Wildcards(value_wildcards);
    }

    ChaseTarget::NotFound
}

/// Trace a symbol through import and re-export chains starting from `file_path` and `name`.
fn chase_symbol_declaration<'a, Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &'a crate::QueryCtx<Fs>,
    file_path: PathBuf,
    name: String,
    owning_reference: Option<OwningReference>,
    visited: &'a mut HashSet<(PathBuf, String)>,
    depth: usize,
    require_exported: bool,
) -> BoxFuture<'a, Result<Option<ChasedExport>, ChaseSymbolError>> {
    async move {
        // Depth limit detection
        if depth >= MAX_SYMBOL_CHASE_DEPTH {
            return Err(ChaseSymbolError::DepthLimitExceeded);
        }

        // Cycle detection on active call stack
        let key = (
            file_path.clone(),
            if require_exported {
                name.clone()
            } else {
                format!("#local:{name}")
            },
        );
        if !visited.insert(key.clone()) {
            return Err(ChaseSymbolError::CycleDetected);
        }

        // Record file dependency in query context
        let file_id = ctx.engine.intern_path(&file_path);
        ctx.record_file(file_id);

        let res = async {
            let target = chase_symbol_in_file(ctx, &file_path, &name, require_exported).await;

            match target {
                // Branch 1: Exported or imported from another file (`export { A } from 'spec'` or `import { A } from 'spec'`).
                ChaseTarget::Exported {
                    original_name,
                    source,
                    binds_locally,
                } => {
                    if let Some(resolved_path) =
                        resolve_specifier(ctx.engine.resolver.as_ref(), &file_path, &source)
                    {
                        let next_owning = update_owning_reference(
                            owning_reference.as_ref(),
                            &source,
                            &original_name,
                        );
                        let resolved_id = ctx.engine.intern_path(&resolved_path);
                        let mut resolved = chase_symbol_declaration(
                            ctx,
                            resolved_path,
                            original_name.clone(),
                            next_owning,
                            visited,
                            depth + 1,
                            true,
                        )
                        .await?;
                        // Recorded on the way back up, so only the chain that actually reached
                        // a declaration contributes — abandoned wildcard branches do not.
                        let Some(chased) = resolved.as_mut() else {
                            return Ok(None);
                        };
                        chased.record_export_hop(resolved_id, original_name);
                        if let (ChasedExport::Symbol(symbol), true) = (chased, binds_locally) {
                            symbol.aliases.push((file_id, name.clone()));
                        }
                        return Ok(resolved);
                    }
                }

                // Branch 2: Local export alias (`export { localName as exportedName }`).
                ChaseTarget::LocalAlias(alias_target) => {
                    match chase_symbol_declaration(
                        ctx,
                        file_path.clone(),
                        alias_target,
                        owning_reference.clone(),
                        visited,
                        depth + 1,
                        false,
                    )
                    .await
                    {
                        Ok(Some(mut res)) => {
                            // `export default class Foo {}` binds `Foo` locally but exports it
                            // under the reserved `default` key. Only claim that when the alias
                            // resolved within this same file — `import {X} from './a'; export
                            // {X as default}` declares nothing here, and `./a` still exports it
                            // as `X`.
                            if let (ChasedExport::Symbol(symbol), true) =
                                (&mut res, name == "default")
                            {
                                symbol.exported_as_default |= symbol.file_path == file_path;
                            }
                            return Ok(Some(res));
                        }
                        Err(err) => return Err(err),
                        Ok(None) => {}
                    }
                }

                // Branch 3: Wildcard re-exports (`export * from 'source'`).
                ChaseTarget::Wildcards(wildcards) => {
                    let mut type_only_fallback: Option<ChasedExport> = None;
                    let mut saw_cycle = false;
                    for wildcard_source in &wildcards {
                        let Some(resolved_path) = resolve_specifier(
                            ctx.engine.resolver.as_ref(),
                            &file_path,
                            wildcard_source,
                        ) else {
                            continue;
                        };

                        // `export *` forwards the name unchanged.
                        let next_owning = update_owning_reference(
                            owning_reference.as_ref(),
                            wildcard_source,
                            &name,
                        );
                        let resolved_id = ctx.engine.intern_path(&resolved_path);
                        match chase_symbol_declaration(
                            ctx,
                            resolved_path,
                            name.clone(),
                            next_owning,
                            visited,
                            depth + 1,
                            true,
                        )
                        .await
                        {
                            Ok(Some(mut result)) => {
                                result.record_export_hop(resolved_id, name.clone());
                                if !result.is_type_only() {
                                    return Ok(Some(result));
                                }
                                if type_only_fallback.is_none() {
                                    type_only_fallback = Some(result);
                                }
                            }
                            Err(ChaseSymbolError::CycleDetected) => {
                                saw_cycle = true;
                            }
                            Err(err) => return Err(err),
                            Ok(None) => {}
                        }
                    }
                    if let Some(fallback) = type_only_fallback {
                        return Ok(Some(fallback));
                    }
                    if saw_cycle {
                        return Err(ChaseSymbolError::CycleDetected);
                    }
                }

                // Branch 4: Terminal local symbol binding.
                ChaseTarget::LocalBinding(symbol_id, flags) => {
                    return Ok(Some(ChasedExport::Symbol(DeclaredSymbol {
                        file_path,
                        symbol_id,
                        flags,
                        owning_reference,
                        aliases: vec![(file_id, name.clone())],
                        export_hops: Vec::new(),
                        exported_as_default: false,
                    })));
                }

                // Branch 5: Anonymous `export default <expr>` (not a bare identifier).
                ChaseTarget::DefaultExpression => {
                    return Ok(Some(ChasedExport::DefaultExpression(
                        DefaultExportExpression {
                            file_path,
                            owning_reference,
                        },
                    )));
                }

                // Branch 6: Not found in this file.
                ChaseTarget::NotFound => {}
            }

            Ok(None)
        }
        .await;

        visited.remove(&key);
        res
    }
    .boxed()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fs::OverlayFileSystem;
    use crate::query::{QueryContext, QueryEngine};
    use crate::resource_registry::ResourceRegistry;
    use crate::test_utils::create_test_fs;
    use oxc_resolver::{ResolveOptions, ResolverGeneric};
    use std::sync::Arc;

    fn build_engine(
        files: &[(&str, &str)],
        entrypoints: &[&str],
    ) -> Arc<QueryEngine<OverlayFileSystem>> {
        let fs = create_test_fs(files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(
            entrypoints.iter().map(PathBuf::from).collect::<Vec<_>>(),
        ));
        QueryEngine::new_default(fs, resolver, registry, entrypoints)
    }

    #[test]
    fn wildcard_ignores_unexported_interface_and_private_import() {
        let engine = build_engine(
            &[
                (
                    "/private-types.ts",
                    "export interface PrivateControl { id: string; }",
                ),
                (
                    "/form-field.ts",
                    r#"
                    import type { PrivateControl as ShadowedByPrivateImport } from './private-types';
                    interface MatFormFieldControl<T> { value: T | null; }
                    export class MatFormField {
                        private ctrl?: ShadowedByPrivateImport;
                    }
                    "#,
                ),
                (
                    "/form-field-control.ts",
                    r#"
                    export abstract class MatFormFieldControl<T> {
                        value: T | null = null;
                    }
                    export class ShadowedByPrivateImport {}
                    "#,
                ),
                (
                    "/public-api.ts",
                    r#"
                    export * from './form-field';
                    export * from './form-field-control';
                    "#,
                ),
                (
                    "/consumer.ts",
                    r#"
                    import { MatFormFieldControl, ShadowedByPrivateImport } from './public-api';
                    "#,
                ),
            ],
            &["/consumer.ts"],
        );

        let ctx = QueryContext::new(engine);

        let mut visited = HashSet::new();
        let resolved_ctrl = futures::executor::block_on(cross_file_resolve(
            &ctx,
            Path::new("/consumer.ts"),
            None,
            "MatFormFieldControl".to_string(),
            &mut visited,
        ))
        .expect("chase should succeed")
        .expect("MatFormFieldControl should resolve");

        assert_eq!(
            resolved_ctrl.file_path,
            PathBuf::from("/form-field-control.ts")
        );
        assert!(
            !resolved_ctrl.is_type_only(),
            "MatFormFieldControl must resolve to the exported abstract class, not the unexported interface"
        );

        let mut visited = HashSet::new();
        let resolved_shadowed = futures::executor::block_on(cross_file_resolve(
            &ctx,
            Path::new("/consumer.ts"),
            None,
            "ShadowedByPrivateImport".to_string(),
            &mut visited,
        ))
        .expect("chase should succeed")
        .expect("ShadowedByPrivateImport should resolve");

        assert_eq!(
            resolved_shadowed.file_path,
            PathBuf::from("/form-field-control.ts")
        );
        assert!(
            !resolved_shadowed.is_type_only(),
            "ShadowedByPrivateImport must resolve to the exported class, not the private import"
        );
    }

    #[test]
    fn wildcard_does_not_expose_unexported_symbols() {
        let engine = build_engine(
            &[
                (
                    "/internal.ts",
                    r#"
                    interface SecretInterface {}
                    class SecretClass {}
                    export class PublicClass {}
                    "#,
                ),
                ("/barrel.ts", "export * from './internal';"),
                (
                    "/consumer.ts",
                    "import { SecretInterface, SecretClass } from './barrel';",
                ),
            ],
            &["/consumer.ts"],
        );

        let ctx = QueryContext::new(engine);

        for symbol in ["SecretInterface", "SecretClass"] {
            let mut visited = HashSet::new();
            let resolved = futures::executor::block_on(cross_file_resolve(
                &ctx,
                Path::new("/consumer.ts"),
                None,
                symbol.to_string(),
                &mut visited,
            ))
            .expect("chase should not error");
            assert!(
                resolved.is_none(),
                "Unexported symbol {symbol} must not resolve through export *"
            );
        }
    }

    /// Following `export { a as SHARED }` to the local `a` must find the binding `a`, not
    /// the declaration another export clause exports *under the name* `a`.
    #[test]
    fn local_alias_target_ignores_export_names() {
        let engine = build_engine(
            &[
                (
                    "/shared.ts",
                    r#"
                    const a = [1];
                    const b = [2];
                    export { a as SHARED, b as a };
                    "#,
                ),
                ("/consumer.ts", "import { SHARED } from './shared';"),
            ],
            &["/consumer.ts"],
        );
        let ctx = QueryContext::new(engine.clone());

        for (export_name, declared) in [("SHARED", "a"), ("a", "b")] {
            let mut visited = HashSet::new();
            let resolved = futures::executor::block_on(cross_file_resolve(
                &ctx,
                Path::new("/consumer.ts"),
                Some("./shared"),
                export_name.to_string(),
                &mut visited,
            ))
            .expect("chase should succeed")
            .unwrap_or_else(|| panic!("{export_name} should resolve"));

            let parsed =
                futures::executor::block_on(ctx.parse_file(engine.intern_path("/shared.ts")));
            let guard = parsed.lock().unwrap();
            let name = guard
                .borrow_dependent()
                .semantic
                .scoping()
                .symbol_name(resolved.symbol_id)
                .to_string();
            assert_eq!(name, declared, "export `{export_name}`");
        }
    }
}
