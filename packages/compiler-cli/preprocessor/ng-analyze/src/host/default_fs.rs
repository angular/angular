use super::{
    AnalysisHost, HostError, HostFuture, IdKind, LoadKind, LoadedModule, ModuleFormat, ModuleId,
    ResolveRequest, ResolvedModule, ResolvedResourceId, ResourceKind,
};
use crate::fs::OverlayFileSystem;
use crate::{ResourceResolver, ResourceResolverFs};
use futures::future::FutureExt;
use oxc_resolver::ResolverGeneric;
use std::collections::HashMap;
use std::fmt;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};

/// Cached positive resolution state for [`DefaultFsHost`], cleared on [`AnalysisHost::clear_cache`]
/// or when [`ResourceResolverFs::config_epoch`] advances.
///
/// `by_dir` keys on `(importer_dir, specifier)` because [`DefaultFsHost::resolve`] passes only
/// those two arguments to [`ResolverGeneric::resolve`]. Failed resolutions are not cached here so
/// transient config/IO errors or newly created files never stick. `resolved_by_path` caches
/// post-resolution `rootDirs` backing-path lookup and canonicalization across directories that
/// resolve to the same raw path.
#[derive(Default)]
struct HostResolveCache {
    config_epoch: u64,
    by_dir: HashMap<PathBuf, HashMap<String, ResolvedModule>>,
    resolved_by_path: HashMap<PathBuf, ResolvedModule>,
}

/// Synchronous [`AnalysisHost`] backed by [`oxc_resolver::ResolverGeneric`] and a
/// [`ResourceResolverFs`] (typically [`crate::fs::OverlayFileSystem`]).
///
/// Every returned future wraps [`futures::future::ready`], so polling completes in a single step
/// without yielding and blocking entry points keep working.
pub struct DefaultFsHost<Fs: ResourceResolverFs> {
    fs: Fs,
    resolver: Arc<ResolverGeneric<Fs>>,
    resolve_cache: Arc<RwLock<HostResolveCache>>,
}

impl<Fs: ResourceResolverFs + Clone> Clone for DefaultFsHost<Fs> {
    fn clone(&self) -> Self {
        Self {
            fs: self.fs.clone(),
            resolver: Arc::clone(&self.resolver),
            resolve_cache: Arc::clone(&self.resolve_cache),
        }
    }
}

impl<Fs: ResourceResolverFs> fmt::Debug for DefaultFsHost<Fs> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("DefaultFsHost").finish_non_exhaustive()
    }
}

impl<Fs: ResourceResolverFs> DefaultFsHost<Fs> {
    pub fn new(fs: Fs, resolver: Arc<ResolverGeneric<Fs>>) -> Self {
        let config_epoch = fs.config_epoch();
        Self {
            fs,
            resolver,
            resolve_cache: Arc::new(RwLock::new(HostResolveCache {
                config_epoch,
                ..HostResolveCache::default()
            })),
        }
    }

    pub fn fs(&self) -> &Fs {
        &self.fs
    }

    fn ensure_cache_epoch(&self) -> u64 {
        let current_epoch = self.fs.config_epoch();
        if self.resolve_cache.read().unwrap().config_epoch == current_epoch {
            return current_epoch;
        }
        let mut cache = self.resolve_cache.write().unwrap();
        let current_epoch = self.fs.config_epoch();
        if cache.config_epoch != current_epoch {
            self.resolver.clear_cache();
            cache.by_dir.clear();
            cache.resolved_by_path.clear();
            cache.config_epoch = current_epoch;
        }
        current_epoch
    }

    fn resolve_canonical_module(&self, raw_path: &Path) -> ResolvedModule {
        let backing = self
            .fs
            .resolve_root_dirs_backing_path(raw_path)
            .unwrap_or_else(|| raw_path.to_path_buf());
        let canonical = self.fs.canonicalize(&backing).unwrap_or(backing);
        ResolvedModule {
            id: ModuleId::from_path(&canonical),
            id_kind: IdKind::Path,
            format: ModuleFormat::from_path(&canonical),
            external: false,
            code: None,
        }
    }
}

impl DefaultFsHost<OverlayFileSystem> {
    /// Build a host over `fs` with a new resolver. `preserve_symlinks` is applied to `fs` as well
    /// as the resolver because resolved paths are canonicalized through `fs`.
    pub fn from_fs_and_options(
        fs: OverlayFileSystem,
        tsconfig_path: Option<&Path>,
        preserve_symlinks: bool,
        node_modules_path_override: Option<String>,
    ) -> Self {
        fs.set_preserve_symlinks(preserve_symlinks);
        let resolver = Arc::new(crate::utils::create_resolver_with_fs(
            tsconfig_path,
            fs.clone(),
            preserve_symlinks,
            node_modules_path_override,
        ));
        Self::new(fs, resolver)
    }
}

impl<Fs: ResourceResolverFs + Send + Sync + 'static> AnalysisHost for DefaultFsHost<Fs> {
    fn resolve(
        &self,
        req: ResolveRequest,
    ) -> HostFuture<Result<Option<ResolvedModule>, HostError>> {
        // Destructure exhaustively so adding a field to `ResolveRequest` forces updating the cache key.
        let ResolveRequest {
            importer,
            specifier,
            kind: _,
            type_only: _,
            attributes: _,
        } = req;
        let epoch_at_start = self.ensure_cache_epoch();
        let importer_path = Path::new(importer.as_str());
        let file_dir = importer_path.parent().unwrap_or_else(|| Path::new("."));
        if let Some(cached) = self
            .resolve_cache
            .read()
            .unwrap()
            .by_dir
            .get(file_dir)
            .and_then(|specs| specs.get(specifier.as_str()))
        {
            return futures::future::ready(Ok(Some(cached.clone()))).boxed();
        }

        let Ok(resolution) = self.resolver.resolve(file_dir, &specifier) else {
            return futures::future::ready(Ok(None)).boxed();
        };
        let raw_path = resolution.into_path_buf();
        let cached_module = {
            let cache = self.resolve_cache.read().unwrap();
            (cache.config_epoch == epoch_at_start)
                .then(|| cache.resolved_by_path.get(&raw_path).cloned())
                .flatten()
        };
        let (resolved, new_resolved_path) = match cached_module {
            Some(module) => (module, None),
            None => {
                let module = self.resolve_canonical_module(&raw_path);
                (module.clone(), Some((raw_path, module)))
            }
        };

        let mut cache = self.resolve_cache.write().unwrap();
        let current_epoch = self.fs.config_epoch();
        if cache.config_epoch != current_epoch {
            self.resolver.clear_cache();
            cache.by_dir.clear();
            cache.resolved_by_path.clear();
            cache.config_epoch = current_epoch;
        }
        if current_epoch == epoch_at_start {
            let resolved = match new_resolved_path {
                Some((raw_path, module)) => cache
                    .resolved_by_path
                    .entry(raw_path)
                    .or_insert(module)
                    .clone(),
                None => resolved,
            };
            if let Some(specs) = cache.by_dir.get_mut(file_dir) {
                specs.insert(specifier, resolved.clone());
            } else {
                cache.by_dir.insert(
                    file_dir.to_path_buf(),
                    HashMap::from([(specifier, resolved.clone())]),
                );
            }
            return futures::future::ready(Ok(Some(resolved))).boxed();
        }
        futures::future::ready(Ok(Some(resolved))).boxed()
    }

    fn load(
        &self,
        id: &ModuleId,
        kind: LoadKind,
        _external: bool,
    ) -> HostFuture<Result<Option<LoadedModule>, HostError>> {
        let path = Path::new(id.as_str());
        let result = match self.fs.read_to_string(path) {
            Ok(code) => {
                let (code, format): (Arc<str>, Option<ModuleFormat>) = match kind {
                    LoadKind::Module => (Arc::from(code), ModuleFormat::from_path(path)),
                    // Drop a leading BOM, as `resolve_resource` does via `ResourceResolver`.
                    LoadKind::Template | LoadKind::Style => {
                        (Arc::from(code.strip_prefix('\u{feff}').unwrap_or(&code)), None)
                    }
                };
                Ok(Some(LoadedModule { code, format }))
            }
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(err) => Err(HostError::from(err)),
        };
        futures::future::ready(result).boxed()
    }

    fn resolve_resource(
        &self,
        containing: &ModuleId,
        url: &str,
        _kind: ResourceKind,
    ) -> HostFuture<Result<Option<ResolvedResourceId>, HostError>> {
        let resource_resolver = ResourceResolver::new(&self.fs, &self.resolver);
        let result = match resource_resolver.load_resource(Path::new(containing.as_str()), url) {
            Ok(loaded) => Ok(Some(ResolvedResourceId {
                id: ModuleId::from_path(&loaded.resolved_path),
                id_kind: IdKind::Path,
                code: loaded.content.map(Arc::from),
            })),
            Err(err) => Err(HostError::new(err)),
        };
        futures::future::ready(result).boxed()
    }

    fn is_synchronous(&self) -> bool {
        true
    }

    fn clear_cache(&self) {
        let mut cache = self.resolve_cache.write().unwrap();
        self.resolver.clear_cache();
        cache.by_dir.clear();
        cache.resolved_by_path.clear();
        cache.config_epoch = self.fs.config_epoch();
    }

    fn resolve_backing_path(&self, path: &Path) -> Option<PathBuf> {
        self.fs.resolve_root_dirs_backing_path(path)
    }

    fn canonicalize_path(&self, path: &Path) -> Option<PathBuf> {
        self.fs.canonicalize(path).ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::host::ImportKind;

    fn make_overlay_host(
        files: &[(&str, &str)],
        root_dirs: &[&str],
    ) -> DefaultFsHost<OverlayFileSystem> {
        let fs = OverlayFileSystem::new_with_overlay();
        for (path, content) in files {
            fs.upsert_file(PathBuf::from(path), (*content).to_string());
        }
        if !root_dirs.is_empty() {
            fs.set_root_dirs(root_dirs.iter().map(PathBuf::from).collect());
        }
        DefaultFsHost::from_fs_and_options(fs, None, false, None)
    }

    #[test]
    fn test_default_fs_host_resolves_ts_and_dts_synchronously() {
        let host = make_overlay_host(
            &[
                ("/app/src/main.ts", "import { Dep } from './dep';"),
                ("/app/src/dep.ts", "export class Dep {}"),
                (
                    "/app/node_modules/pkg/package.json",
                    r#"{"name": "pkg", "types": "./index.d.ts"}"#,
                ),
                (
                    "/app/node_modules/pkg/index.d.ts",
                    "export declare class Lib {}",
                ),
            ],
            &[],
        );

        assert!(host.is_synchronous());

        let local = host
            .resolve(ResolveRequest::new(
                "/app/src/main.ts",
                "./dep",
                ImportKind::Static,
            ))
            .now_or_never()
            .expect("DefaultFsHost::resolve must complete on first poll")
            .unwrap()
            .expect("expected ./dep to resolve");
        assert_eq!(local.id, ModuleId::from("/app/src/dep.ts"));
        assert_eq!(local.id_kind, IdKind::Path);
        assert_eq!(local.format, Some(ModuleFormat::Ts));
        assert!(!local.external);
        assert_eq!(local.code, None);

        let pkg = host
            .resolve(ResolveRequest::new(
                "/app/src/main.ts",
                "pkg",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected pkg to resolve to index.d.ts");
        assert_eq!(pkg.id, ModuleId::from("/app/node_modules/pkg/index.d.ts"));
        assert_eq!(pkg.id_kind, IdKind::Path);
        assert_eq!(pkg.format, Some(ModuleFormat::Dts));

        let missing = host
            .resolve(ResolveRequest::new(
                "/app/src/main.ts",
                "./does-not-exist",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap();
        assert_eq!(missing, None);
    }

    #[test]
    fn test_default_fs_host_resolves_root_dirs_to_backing_path() {
        let host = make_overlay_host(
            &[
                ("/app/src/entry.ts", "import { Generated } from './gen_dep';"),
                ("/app/bazel-bin/gen_dep.ts", "export class Generated {}"),
            ],
            &["/app/src", "/app/bazel-bin"],
        );

        let resolved = host
            .resolve(ResolveRequest::new(
                "/app/src/entry.ts",
                "./gen_dep",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected ./gen_dep to resolve across rootDirs");

        assert_eq!(resolved.id, ModuleId::from("/app/bazel-bin/gen_dep.ts"));
        assert_eq!(resolved.format, Some(ModuleFormat::Ts));
        assert_eq!(
            host.resolve_backing_path(Path::new("/app/src/gen_dep.ts")),
            Some(PathBuf::from("/app/bazel-bin/gen_dep.ts"))
        );
    }

    #[cfg(unix)]
    #[test]
    fn test_from_fs_and_options_applies_preserve_symlinks_to_canonicalization() {
        let dir = tempfile::TempDir::new().unwrap();
        let real_dir = dir.path().join("real");
        std::fs::create_dir(&real_dir).unwrap();
        std::fs::write(real_dir.join("dep.ts"), "export const x = 1;").unwrap();
        let link_dir = dir.path().join("link");
        std::os::unix::fs::symlink(&real_dir, &link_dir).unwrap();

        let resolve_dep = |preserve_symlinks: bool| {
            let host = DefaultFsHost::from_fs_and_options(
                OverlayFileSystem::new_with_overlay(),
                None,
                preserve_symlinks,
                None,
            );
            let importer = ModuleId::from_path(&link_dir.join("main.ts"));
            host.resolve(ResolveRequest::new(importer, "./dep", ImportKind::Static))
                .now_or_never()
                .unwrap()
                .unwrap()
                .expect("expected ./dep to resolve")
                .id
        };

        // The resolver and the canonicalization step must agree on symlink handling.
        assert_eq!(
            resolve_dep(true),
            ModuleId::from_path(&link_dir.join("dep.ts"))
        );
        assert_eq!(
            resolve_dep(false),
            ModuleId::from_path(&std::fs::canonicalize(real_dir.join("dep.ts")).unwrap())
        );
    }

    #[test]
    fn test_default_fs_host_clear_cache_picks_up_newly_created_file() {
        let host = make_overlay_host(&[("/app/src/main.ts", "import './later';")], &[]);

        let before = host
            .resolve(ResolveRequest::new(
                "/app/src/main.ts",
                "./later",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap();
        assert_eq!(before, None);

        host.fs().upsert_file(
            PathBuf::from("/app/src/later.ts"),
            "export const x = 1;".to_string(),
        );
        host.clear_cache();

        let after = host
            .resolve(ResolveRequest::new(
                "/app/src/main.ts",
                "./later",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected ./later to resolve after clear_cache");
        assert_eq!(after.id, ModuleId::from("/app/src/later.ts"));
    }

    #[test]
    fn test_default_fs_host_load_module_missing_and_directory_error() {
        let host = make_overlay_host(
            &[
                ("/app/src/comp.tsx", "export const v = 1;"),
                ("/app/src/comp.html", "<div>Hello</div>"),
            ],
            &[],
        );

        let loaded_mod = host
            .load(&ModuleId::from("/app/src/comp.tsx"), LoadKind::Module, false)
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected module to load");
        assert_eq!(&*loaded_mod.code, "export const v = 1;");
        assert_eq!(loaded_mod.format, Some(ModuleFormat::Tsx));

        let loaded_tpl = host
            .load(
                &ModuleId::from("/app/src/comp.html"),
                LoadKind::Template,
                false,
            )
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected template to load");
        assert_eq!(&*loaded_tpl.code, "<div>Hello</div>");
        assert_eq!(loaded_tpl.format, None);

        let missing = host
            .load(
                &ModuleId::from("/app/src/missing.ts"),
                LoadKind::Module,
                false,
            )
            .now_or_never()
            .unwrap()
            .unwrap();
        assert_eq!(missing, None);

        // Reading a directory yields an actionable HostError rather than None.
        let dir_err = host
            .load(&ModuleId::from("/app/src"), LoadKind::Module, false)
            .now_or_never()
            .unwrap()
            .expect_err("expected directory read to return HostError");
        assert!(
            dir_err.message.contains("directory"),
            "unexpected error: {dir_err}"
        );
    }

    #[test]
    fn test_default_fs_host_resolve_resource_inline_and_lenient_missing() {
        let host = make_overlay_host(
            &[
                ("/app/src/app.component.ts", ""),
                ("/app/src/app.component.css", ".btn { color: red; }"),
            ],
            &[],
        );

        // `.scss` falls back to `.css` via ResourceResolver and returns inline `code`.
        let style = host
            .resolve_resource(
                &ModuleId::from("/app/src/app.component.ts"),
                "./app.component.scss",
                ResourceKind::Style,
            )
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected style resource resolution");
        assert_eq!(style.id, ModuleId::from("/app/src/app.component.css"));
        assert_eq!(style.id_kind, IdKind::Path);
        assert_eq!(style.code.as_deref(), Some(".btn { color: red; }"));

        // Missing template still returns lenient candidate path with `code: None`.
        let missing_tpl = host
            .resolve_resource(
                &ModuleId::from("/app/src/app.component.ts"),
                "./missing.component.html",
                ResourceKind::Template,
            )
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected lenient candidate ID for missing template");
        assert_eq!(
            missing_tpl.id,
            ModuleId::from("/app/src/missing.component.html")
        );
        assert_eq!(missing_tpl.id_kind, IdKind::Path);
        assert_eq!(missing_tpl.code, None);
    }

    #[test]
    fn test_default_fs_host_load_strips_resource_bom_like_resolve_resource() {
        let host = make_overlay_host(
            &[
                ("/app/src/app.component.ts", ""),
                ("/app/src/app.component.html", "\u{feff}<div>Hello</div>"),
                ("/app/src/app.component.css", "\u{feff}.box { color: red; }"),
            ],
            &[],
        );
        let containing = ModuleId::from("/app/src/app.component.ts");
        for (url, resource_kind, load_kind, expected) in [
            (
                "./app.component.html",
                ResourceKind::Template,
                LoadKind::Template,
                "<div>Hello</div>",
            ),
            (
                "./app.component.css",
                ResourceKind::Style,
                LoadKind::Style,
                ".box { color: red; }",
            ),
        ] {
            let resolved = host
                .resolve_resource(&containing, url, resource_kind)
                .now_or_never()
                .unwrap()
                .unwrap()
                .expect("expected resource resolution");
            assert_eq!(resolved.code.as_deref(), Some(expected), "{url}");

            let loaded = host
                .load(&resolved.id, load_kind, false)
                .now_or_never()
                .unwrap()
                .unwrap()
                .expect("expected resource to load");
            assert_eq!(&*loaded.code, expected, "{url}");
        }
    }

    #[test]
    fn test_default_fs_host_memoizes_resolutions_and_canonical_paths_until_clear_cache() {
        let dir = tempfile::TempDir::new().unwrap();
        let ws = dir.path();
        let src_dir = ws.join("src");
        let gen_dir = ws.join("gen");
        let src_a = src_dir.join("a");
        let src_b = src_dir.join("b");
        std::fs::create_dir_all(&src_a).unwrap();
        std::fs::create_dir_all(&src_b).unwrap();
        std::fs::create_dir_all(&gen_dir).unwrap();

        let gen_target = gen_dir.join("target.ts");
        std::fs::write(&gen_target, "export const V = 'gen';").unwrap();

        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_root_dirs(vec![src_dir.clone(), gen_dir.clone()]);
        // With `preserve_symlinks = true`, `oxc_resolver` returns the logical `src/target.ts` path
        // for both `src/a` and `src/b`, while `DefaultFsHost` maps it to the backing `rootDirs`
        // target in `resolved_by_path`.
        let host = DefaultFsHost::from_fs_and_options(fs, None, true, None);
        let resolve_from = |importer: PathBuf, spec: &str| {
            host.resolve(ResolveRequest::new(
                ModuleId::from_path(&importer),
                spec,
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .map(|m| m.id)
        };

        let expected_gen = ModuleId::from_path(&gen_target);
        assert_eq!(
            resolve_from(src_a.join("one.ts"), "../target"),
            Some(expected_gen.clone())
        );

        // Shadow `gen/target.ts` on disk without clearing the cache: both a sibling importer in
        // `src/a` (`by_dir`) and an importer in `src/b` (`resolved_by_path`) keep the memoized
        // backing target until `clear_cache()` runs.
        let src_target = src_dir.join("target.ts");
        std::fs::write(&src_target, "export const V = 'src';").unwrap();
        assert_eq!(
            resolve_from(src_a.join("two.ts"), "../target"),
            Some(expected_gen.clone())
        );
        assert_eq!(
            resolve_from(src_b.join("three.ts"), "../target"),
            Some(expected_gen)
        );

        // Clearing the cache (including via a cloned host) evicts both `by_dir` and
        // `resolved_by_path` so subsequent lookups pick up `src/target.ts`.
        host.clone().clear_cache();
        let expected_src = ModuleId::from_path(&src_target);
        assert_eq!(
            resolve_from(src_a.join("two.ts"), "../target"),
            Some(expected_src.clone())
        );
        assert_eq!(
            resolve_from(src_b.join("three.ts"), "../target"),
            Some(expected_src)
        );
    }

    #[test]
    fn test_default_fs_host_does_not_negative_cache_transient_config_errors() {
        let dir = tempfile::TempDir::new().unwrap();
        let ws = dir.path().canonicalize().unwrap();
        let src_dir = ws.join("src");
        let pkg_dir = ws.join("node_modules/my-pkg");
        std::fs::create_dir_all(&src_dir).unwrap();
        std::fs::create_dir_all(&pkg_dir).unwrap();

        let dep_ts = src_dir.join("dep.ts");
        std::fs::write(&dep_ts, "export const DEP = 1;").unwrap();
        let pkg_dts = pkg_dir.join("index.d.ts");
        std::fs::write(&pkg_dts, "export declare const PKG: number;").unwrap();

        let tsconfig_path = ws.join("tsconfig.json");
        let pkg_json_path = pkg_dir.join("package.json");
        std::fs::write(&tsconfig_path, "{ malformed json").unwrap();
        std::fs::write(&pkg_json_path, "{ malformed json").unwrap();

        let fs = OverlayFileSystem::new_with_overlay();
        let host = DefaultFsHost::from_fs_and_options(fs, Some(&tsconfig_path), false, None);
        let resolve_from = |importer: PathBuf, spec: &str| {
            host.resolve(ResolveRequest::new(
                ModuleId::from_path(&importer),
                spec,
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .map(|m| m.id)
        };

        // Transient parse failures in `tsconfig.json` and `package.json` must not poison `by_dir`.
        assert_eq!(resolve_from(src_dir.join("a.ts"), "@aliased/dep"), None);

        std::fs::write(
            &tsconfig_path,
            r#"{"compilerOptions": {"paths": {"@aliased/dep": ["./src/dep.ts"]}}}"#,
        )
        .unwrap();
        assert_eq!(
            resolve_from(src_dir.join("b.ts"), "@aliased/dep"),
            Some(ModuleId::from_path(&dep_ts))
        );

        assert_eq!(resolve_from(src_dir.join("a.ts"), "my-pkg"), None);
        std::fs::write(
            &pkg_json_path,
            r#"{"name": "my-pkg", "types": "./index.d.ts"}"#,
        )
        .unwrap();
        assert_eq!(
            resolve_from(src_dir.join("b.ts"), "my-pkg"),
            Some(ModuleId::from_path(&pkg_dts))
        );
    }

    #[test]
    fn test_default_fs_host_invalidates_cache_on_overlay_fs_mutations_without_clear_cache() {
        let host = make_overlay_host(
            &[
                ("/app/src/main.ts", "import './dep'; import './virtual_only';"),
                ("/app/gen1/dep.ts", "export const V = 1;"),
                ("/app/gen2/dep.ts", "export const V = 2;"),
            ],
            &["/app/src", "/app/gen1"],
        );
        let resolve_spec = |spec: &str| {
            host.resolve(ResolveRequest::new(
                "/app/src/main.ts",
                spec,
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .map(|m| m.id)
        };

        assert_eq!(
            resolve_spec("./dep"),
            Some(ModuleId::from("/app/gen1/dep.ts"))
        );
        assert_eq!(resolve_spec("./virtual_only"), None);

        // Reconfiguring `rootDirs` on `OverlayFileSystem` without calling `host.clear_cache()`
        // must still evict stale `HostResolveCache` and `oxc_resolver` entries.
        host.fs()
            .set_root_dirs(vec![PathBuf::from("/app/src"), PathBuf::from("/app/gen2")]);
        assert_eq!(
            resolve_spec("./dep"),
            Some(ModuleId::from("/app/gen2/dep.ts"))
        );

        // Creating and later removing a virtual file on `OverlayFileSystem` without calling
        // `host.clear_cache()` must also be reflected immediately.
        host.fs().upsert_file(
            PathBuf::from("/app/src/virtual_only.ts"),
            "export const X = 1;".to_string(),
        );
        assert_eq!(
            resolve_spec("./virtual_only"),
            Some(ModuleId::from("/app/src/virtual_only.ts"))
        );

        assert!(host
            .fs()
            .remove_virtual_file(Path::new("/app/src/virtual_only.ts")));
        assert_eq!(resolve_spec("./virtual_only"), None);
    }
}
