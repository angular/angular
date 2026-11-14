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

#[derive(Default)]
struct ResolveCacheState {
    generation: u64,
    by_dir: HashMap<(PathBuf, String), Option<ResolvedModule>>,
    bare: HashMap<String, Option<ResolvedModule>>,
}

/// Synchronous [`AnalysisHost`] backed by [`oxc_resolver::ResolverGeneric`] and a
/// [`ResourceResolverFs`] (typically [`crate::fs::OverlayFileSystem`]).
///
/// Every returned future wraps [`futures::future::ready`], so polling completes in a single step
/// without yielding and blocking entry points keep working.
pub struct DefaultFsHost<Fs: ResourceResolverFs> {
    fs: Fs,
    resolver: Arc<ResolverGeneric<Fs>>,
    resolve_cache: Arc<RwLock<ResolveCacheState>>,
    share_bare_resolutions: bool,
}

impl<Fs: ResourceResolverFs + Clone> Clone for DefaultFsHost<Fs> {
    fn clone(&self) -> Self {
        Self {
            fs: self.fs.clone(),
            resolver: Arc::clone(&self.resolver),
            resolve_cache: Arc::clone(&self.resolve_cache),
            share_bare_resolutions: self.share_bare_resolutions,
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
        let generation = fs.cache_generation();
        Self {
            fs,
            resolver,
            resolve_cache: Arc::new(RwLock::new(ResolveCacheState {
                generation,
                ..ResolveCacheState::default()
            })),
            share_bare_resolutions: false,
        }
    }

    /// Share non-relative, non-`node_modules` module resolutions across directories when unified
    /// workspace module naming is active.
    pub fn with_shared_bare_resolutions(mut self, enabled: bool) -> Self {
        self.share_bare_resolutions = enabled;
        self
    }

    pub fn fs(&self) -> &Fs {
        &self.fs
    }

    pub fn resolver(&self) -> &Arc<ResolverGeneric<Fs>> {
        &self.resolver
    }

    fn canonicalize_resolved_path(&self, resolved: PathBuf) -> PathBuf {
        self.fs.canonicalize_resolved_path(resolved)
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
        let importer_path = Path::new(req.importer.as_str());
        let file_dir = importer_path.parent().unwrap_or_else(|| Path::new("."));
        let gen = self.fs.cache_generation();
        let is_bare = !req.specifier.starts_with('.')
            && !req.specifier.starts_with('/')
            && !req.specifier.starts_with('#');
        let share_bare = is_bare
            && self.share_bare_resolutions
            && !self.fs.has_virtual_files()
            && !file_dir
                .components()
                .any(|c| c.as_os_str() == "node_modules");

        {
            let cache = self.resolve_cache.read().unwrap();
            if cache.generation == gen {
                if share_bare {
                    if let Some(cached) = cache.bare.get(&req.specifier) {
                        return futures::future::ready(Ok(cached.clone())).boxed();
                    }
                }
                if let Some(cached) = cache
                    .by_dir
                    .get(&(file_dir.to_path_buf(), req.specifier.clone()))
                {
                    return futures::future::ready(Ok(cached.clone())).boxed();
                }
            }
        }

        let resolved = self
            .resolver
            .resolve(file_dir, &req.specifier)
            .ok()
            .map(|resolution| {
                let canonical = self.canonicalize_resolved_path(resolution.into_path_buf());
                let format = ModuleFormat::from_path(&canonical);
                ResolvedModule {
                    id: ModuleId::from_path(&canonical),
                    id_kind: IdKind::Path,
                    format,
                    external: false,
                    code: None,
                }
            });

        {
            let mut cache = self.resolve_cache.write().unwrap();
            if cache.generation != gen {
                cache.by_dir.clear();
                cache.bare.clear();
                cache.generation = gen;
            }
            cache.by_dir.insert(
                (file_dir.to_path_buf(), req.specifier.clone()),
                resolved.clone(),
            );
            if share_bare
                && resolved.as_ref().is_some_and(|m| {
                    !Path::new(m.id.as_str())
                        .components()
                        .any(|c| c.as_os_str() == "node_modules")
                })
            {
                cache.bare.insert(req.specifier, resolved.clone());
            }
        }

        futures::future::ready(Ok(resolved)).boxed()
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
        self.fs.clear_caches();
        self.resolver.clear_cache();
        let mut cache = self.resolve_cache.write().unwrap();
        cache.by_dir.clear();
        cache.bare.clear();
        cache.generation = self.fs.cache_generation();
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
    fn test_default_fs_host_shared_bare_resolutions_and_invalidation() {
        let dir = tempfile::TempDir::new().unwrap();
        let pkg_a = dir.path().join("pkg_a");
        let pkg_b = dir.path().join("pkg_b");
        let shared = dir.path().join("shared");
        let nested_nm = pkg_b.join("node_modules/local-only");
        std::fs::create_dir_all(&pkg_a).unwrap();
        std::fs::create_dir_all(&pkg_b).unwrap();
        std::fs::create_dir_all(&shared).unwrap();
        std::fs::create_dir_all(&nested_nm).unwrap();

        let shared_dts = shared.join("lib.d.ts");
        std::fs::write(&shared_dts, "export declare class Shared {}").unwrap();
        let local_dts = nested_nm.join("index.d.ts");
        std::fs::write(&local_dts, "export declare class LocalOnly {}").unwrap();
        let tsconfig = dir.path().join("tsconfig.json");
        std::fs::write(
            &tsconfig,
            r#"{"compilerOptions": {"baseUrl": ".", "paths": {"@ws/*": ["./*"]}}}"#,
        )
        .unwrap();

        let fs = OverlayFileSystem::new_with_overlay();
        let resolver = Arc::new(crate::utils::create_resolver_with_fs(
            Some(&tsconfig),
            fs.clone(),
            false,
            None,
        ));
        let host = DefaultFsHost::new(fs, resolver).with_shared_bare_resolutions(true);

        let from_a = host
            .resolve(ResolveRequest::new(
                ModuleId::from_path(&pkg_a.join("a.ts")),
                "@ws/shared/lib",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected @ws/shared/lib from pkg_a");
        let from_b = host
            .resolve(ResolveRequest::new(
                ModuleId::from_path(&pkg_b.join("b.ts")),
                "@ws/shared/lib",
                ImportKind::ReExport,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected @ws/shared/lib from pkg_b");
        assert_eq!(
            from_a.id,
            ModuleId::from_path(&std::fs::canonicalize(&shared_dts).unwrap())
        );
        assert_eq!(from_a, from_b);

        // A missing bare package in pkg_a must not prevent pkg_b's nested node_modules from
        // resolving it.
        let missing_in_a = host
            .resolve(ResolveRequest::new(
                ModuleId::from_path(&pkg_a.join("a.ts")),
                "local-only",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap();
        assert_eq!(missing_in_a, None);

        let found_in_b = host
            .resolve(ResolveRequest::new(
                ModuleId::from_path(&pkg_b.join("b.ts")),
                "local-only",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected nested node_modules package to resolve in pkg_b");
        assert_eq!(
            found_in_b.id,
            ModuleId::from_path(&std::fs::canonicalize(&local_dts).unwrap())
        );
    }
}
