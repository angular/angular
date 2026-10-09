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
    /// Local bindings along the chase path (declaration file first). Excludes pure re-exports
    /// (`export { X } from './x'`) that do not introduce a local binding in that file. An entry
    /// means that file can write the identifier directly; absence means emit an import.
    pub aliases: Vec<(FileId, String)>,
    /// Files entered across module boundaries (declaration file first) paired with the exported
    /// name requested at each hop (including pure re-exports and renamed exports).
    pub export_hops: Vec<(FileId, String)>,
    /// Whether `file_path` exports this symbol under `default` rather than its declared name.
    pub exported_as_default: bool,
}

impl DeclaredSymbol {
    pub fn is_type_only(&self) -> bool {
        self.flags.intersects(SymbolFlags::Type) && !self.flags.intersects(SymbolFlags::Value)
    }
}

/// An unnamed `export default <expression>`. Upstream resolves it to an `ExportAssignment`,
/// which `StaticInterpreter.visitDeclaration` evaluates as the exported expression.
#[derive(Clone, Debug)]
pub struct DefaultExportExpression {
    pub file_path: PathBuf,
    pub owning_reference: Option<OwningReference>,
}

/// Where the chase for an exported name ends.
#[derive(Clone, Debug)]
pub enum ChasedExport {
    Symbol(DeclaredSymbol),
    DefaultExpression(DefaultExportExpression),
}

impl ChasedExport {
    fn is_type_only(&self) -> bool {
        match self {
            Self::Symbol(symbol) => symbol.is_type_only(),
            Self::DefaultExpression(_) => false,
        }
    }

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

/// Resolves an import specifier relative to `file_path`.
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

/// Resolves `export_name` from `specifier` (or `file_path` when `None`) through import and
/// re-export chains to its underlying declaration. Returns `None` for unnamed `export default <expr>`
/// (use [`cross_file_resolve_export`] when default expressions are needed).
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

/// Like [`cross_file_resolve`], but also returns [`ChasedExport::DefaultExpression`] for unnamed
/// `export default <expression>`.
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
                let owning = OwningReference::is_absolute_specifier(spec)
                    .then(|| OwningReference::from_source_specifier(spec, export_name.clone()));
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

/// Overwrites the owning module whenever a deeper absolute specifier is crossed along the chain.
fn update_owning_reference(
    current: Option<&OwningReference>,
    specifier: &str,
    name_in_target: &str,
) -> Option<OwningReference> {
    if OwningReference::is_absolute_specifier(specifier) {
        return Some(OwningReference::from_source_specifier(
            specifier,
            name_in_target,
        ));
    }
    current.cloned()
}

enum ChaseTarget {
    /// Imported or re-exported from another module (`export { A } from 'spec'` or `import { A } from 'spec'`).
    Exported {
        original_name: String,
        source: String,
        /// True when this file binds the chased name locally (`import` binds; bare re-export does not).
        binds_locally: bool,
    },
    /// Local export alias (`export { localName as exportedName }`).
    LocalAlias(String),
    /// Candidate wildcard re-export specifiers (`export * from 'spec'`).
    Wildcards(Vec<String>),
    /// Declared locally in this file's root scope.
    LocalBinding(SymbolId, SymbolFlags),
    /// Unnamed `export default <expr>`.
    DefaultExpression,
    NotFound,
}

fn chase_symbol_in_file_inner(
    dep: &crate::parsed::ParsedFileDependent<'_>,
    name: &str,
    require_exported: bool,
) -> ChaseTarget {
    let module_record = &dep.module_record;

    // Indirect exports and local export aliases match export names (only checked when
    // `require_exported` is true, since `export { a as SHARED, b as a }` leaves local `a` as `a`).
    for entry in &module_record.indirect_export_entries {
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
                // `import { X } from './x'; export { X };` folds into an indirect export entry,
                // where `X` is also bound locally.
                binds_locally: module_record
                    .import_entries
                    .iter()
                    .any(|import| import.local_name.name.as_str() == name),
            };
        }
    }

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

        if let Some(symbol_id) = dep.semantic.scoping().get_root_binding(name.into()) {
            let flags = dep.semantic.scoping().symbol_flags(symbol_id);
            return ChaseTarget::LocalBinding(symbol_id, flags);
        }
    }

    // `export *` never forwards `default`.
    if name == "default" {
        return ChaseTarget::NotFound;
    }
    let mut wildcards = Vec::new();
    for entry in &module_record.star_export_entries {
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

async fn chase_symbol_in_file<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &crate::QueryCtx<Fs>,
    file_path: &Path,
    name: &str,
    require_exported: bool,
) -> ChaseTarget {
    let file_id = ctx.engine.intern_path(file_path);
    let syntax = ctx.analyze_file_syntax(file_id).await;
    let exports = &syntax.file_exports;

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

    for entry in &exports.local_aliases {
        if require_exported && entry.exported_name == name && entry.local_name != name {
            return ChaseTarget::LocalAlias(entry.local_name.clone());
        }
    }

    let parsed_file_arc = ctx.parse_file(file_id).await;
    let guard = parsed_file_arc.lock().unwrap();
    let inner_target = chase_symbol_in_file_inner(guard.borrow_dependent(), name, require_exported);
    if !matches!(inner_target, ChaseTarget::NotFound) {
        return inner_target;
    }

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
        if depth >= MAX_SYMBOL_CHASE_DEPTH {
            return Err(ChaseSymbolError::DepthLimitExceeded);
        }

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

        let file_id = ctx.engine.intern_path(&file_path);
        ctx.record_file(file_id);

        let res = async {
            let target = chase_symbol_in_file(ctx, &file_path, &name, require_exported).await;

            match target {
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
                        // Record on return so abandoned wildcard branches do not contribute hops.
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
                            // Only mark `exported_as_default` when the declaration lives in this
                            // file (`import {X} from './a'; export {X as default}` leaves `./a`
                            // exporting `X` under its declared name).
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

                ChaseTarget::DefaultExpression => {
                    return Ok(Some(ChasedExport::DefaultExpression(
                        DefaultExportExpression {
                            file_path,
                            owning_reference,
                        },
                    )));
                }

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
