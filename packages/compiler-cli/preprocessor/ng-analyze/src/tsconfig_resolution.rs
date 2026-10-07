pub use oxc_resolver::{CompilerOptions, FileSystem, ResolveOptions, ResolverGeneric, TsConfig};
use std::collections::HashSet;

use pathdiff;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct ResolvedTsConfig {
    pub files: HashSet<PathBuf>,
    pub compiler_options: CompilerOptions,
    pub preserve_symlinks: bool,
    pub workspace_name: Option<String>,
    pub generate_extra_imports_in_local_mode: bool,
    pub compile_non_exported_classes: bool,
}

pub fn load_and_resolve_tsconfig(
    path: &Path,
    fs: &crate::fs::OverlayFileSystem,
) -> Result<ResolvedTsConfig, String> {
    let resolver = ResolverGeneric::new_with_file_system(
        fs.clone(),
        ResolveOptions {
            ..ResolveOptions::default()
        },
    );

    let tsconfig = resolver
        .resolve_tsconfig(path)
        .map_err(|e| format!("Failed to resolve tsconfig: {:?}", e))?;

    let resolved_files = tsconfig.files.clone().unwrap_or_default();
    let mut resolved_include = tsconfig.include.clone().unwrap_or_default();
    let mut resolved_exclude = tsconfig.exclude.clone().unwrap_or_default();
    let mut resolved_compiler_options = tsconfig.compiler_options.clone();

    // Apply defaults if missing
    if resolved_files.is_empty() && resolved_include.is_empty() {
        resolved_include.push(PathBuf::from("**/*"));
    }

    if resolved_exclude.is_empty() {
        resolved_exclude.push(PathBuf::from("node_modules"));
        resolved_exclude.push(PathBuf::from("bower_components"));
        resolved_exclude.push(PathBuf::from("jspm_packages"));
    }

    // Resolve extended options recursively to handle rootDirs, preserveSymlinks, and workspaceName
    let mut visited = HashSet::new();
    let extended_options = resolve_extended_options_recursive(path, fs, &resolver, &mut visited)?;
    resolved_compiler_options.root_dirs = extended_options.root_dirs;

    // Resolve files
    let mut files = HashSet::new();
    let base_dir = path.parent().unwrap_or(Path::new("."));

    // 1. files
    for f in resolved_files {
        if fs.metadata(&f).is_ok() {
            files.insert(f);
        }
    }

    // 2. include/exclude
    let allow_js = resolved_compiler_options.allow_js.unwrap_or(false);

    if !resolved_include.is_empty() {
        let expanded = expand_globs(base_dir, &resolved_include, &resolved_exclude, allow_js, fs);
        files.extend(expanded);
    }

    Ok(ResolvedTsConfig {
        files,
        compiler_options: resolved_compiler_options,
        preserve_symlinks: extended_options.preserve_symlinks.unwrap_or(false),
        workspace_name: extended_options.workspace_name,
        generate_extra_imports_in_local_mode: extended_options
            .generate_extra_imports_in_local_mode
            .unwrap_or(false),
        compile_non_exported_classes: extended_options
            .compile_non_exported_classes
            .unwrap_or(true),
    })
}

fn get_search_root(
    pattern: &Path,
    limit: &Path,
    fs: &dyn crate::physical_fs::PhysicalFs,
) -> PathBuf {
    let mut current = pattern.to_path_buf();
    while !fs.exists(&current) && current != limit {
        let Some(parent) = current.parent() else {
            break;
        };
        current = parent.to_path_buf();
    }

    if current == limit {
        return current;
    }

    if fs.is_dir(&current) {
        current
    } else if let Some(parent) = current.parent() {
        parent.to_path_buf()
    } else {
        current
    }
}

/// Recursively walks `root`, invoking `visit` for every file and consulting
/// `descend` before entering a directory.
///
/// Replaces `ignore::WalkBuilder`, which walks the process's real filesystem directly
/// and so cannot see the JavaScript-hosted filesystem the WebAssembly engine uses.
/// Behaviour is matched deliberately on two points and changed on a third:
///
/// - Hidden entries are visited (the old builder set `hidden(false)`).
/// - Symlinks are not followed for the purposes of *descending* (the builder defaulted
///   to `follow_links(false)`), but a symlink pointing at a file is still collected,
///   because the previous filter used `Path::is_file`, which follows links.
/// - `.gitignore` and friends are **no longer consulted**. `tsc` does not consult them
///   when expanding `include`, so honouring them was a parity bug; it also could not be
///   reproduced on the host filesystem.
///
/// `descend` prunes a directory without recursing, mirroring `filter_entry`.
fn walk_source_tree(
    root: &Path,
    fs: &std::sync::Arc<dyn crate::physical_fs::PhysicalFs>,
    visit: &mut dyn FnMut(&Path),
    descend: &mut dyn FnMut(&Path) -> bool,
) {
    // `WalkBuilder` yields the root itself before descending.
    if fs.is_file(root) {
        visit(root);
        return;
    }
    if !descend(root) {
        return;
    }

    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let Ok(entries) = fs.read_dir(&dir) else {
            continue;
        };
        for entry in entries {
            let path = dir.join(&entry.name);
            // `entry.is_dir` comes from a non-following file type, so symlinked
            // directories are not traversed.
            if entry.is_dir {
                if descend(&path) {
                    stack.push(path);
                }
            } else if fs.is_file(&path) {
                visit(&path);
            }
        }
    }
}

fn expand_globs(
    base_dir: &Path,
    include: &[PathBuf],
    exclude: &[PathBuf],
    allow_js: bool,
    fs: &crate::fs::OverlayFileSystem,
) -> HashSet<PathBuf> {
    let mut files = HashSet::new();

    let exclude_patterns: Vec<String> = exclude
        .iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect();

    // Pre-process include patterns to handle directory matches
    let mut effective_patterns = vec![];
    for pattern_path in include {
        let full_pattern = base_dir.join(pattern_path);

        let pattern_str = full_pattern.to_string_lossy();
        let pattern = pattern_path.to_string_lossy(); // For check logic

        if fs.physical().is_dir(&full_pattern) {
            effective_patterns.push(format!("{}/**/*", pattern_str));
        } else {
            effective_patterns.push(pattern_str.to_string());
            if !pattern.contains('*')
                && !pattern.contains('?')
                && !is_supported_extension(Path::new(&*pattern), true)
            {
                effective_patterns.push(format!("{}/**/*", pattern_str));
            }
        }
    }

    let compiled_patterns: Vec<glob::Pattern> = effective_patterns
        .iter()
        .filter_map(|p| glob::Pattern::new(p).ok())
        .collect();

    let options = glob::MatchOptions {
        case_sensitive: !cfg!(any(target_os = "windows", target_os = "macos")),
        require_literal_separator: false,
        require_literal_leading_dot: false,
    };

    let mut root_to_patterns: std::collections::HashMap<PathBuf, Vec<&glob::Pattern>> =
        std::collections::HashMap::new();
    for (i, pat_str) in effective_patterns.iter().enumerate() {
        let root = get_search_root(Path::new(pat_str), base_dir, fs.physical().as_ref());
        if fs.physical().exists(&root) {
            root_to_patterns
                .entry(root)
                .or_default()
                .push(&compiled_patterns[i]);
        }
    }

    for (root, patterns) in root_to_patterns {
        walk_source_tree(
            &root,
            fs.physical(),
            &mut |path| {
                if !is_excluded(path, base_dir, &exclude_patterns)
                    && is_supported_extension(path, allow_js)
                    && patterns
                        .iter()
                        .any(|pat| pat.matches_path_with(path, options))
                {
                    files.insert(path.to_path_buf());
                }
            },
            &mut |dir| !is_excluded(dir, base_dir, &exclude_patterns),
        );
    }

    // Add virtual files that match
    fs.for_each_virtual_path(|path| {
        if !is_supported_extension(path, allow_js) {
            return;
        }

        let included = compiled_patterns
            .iter()
            .any(|pat| pat.matches_path_with(path, options));

        if included && !is_excluded(path, base_dir, &exclude_patterns) {
            files.insert(path.clone());
        }
    });

    files
}

#[derive(Default)]
struct ExtendedOptions {
    root_dirs: Option<Vec<PathBuf>>,
    preserve_symlinks: Option<bool>,
    workspace_name: Option<String>,
    generate_extra_imports_in_local_mode: Option<bool>,
    compile_non_exported_classes: Option<bool>,
}

fn resolve_extended_options_recursive(
    path: &Path,
    fs: &crate::fs::OverlayFileSystem,
    resolver: &ResolverGeneric<crate::fs::OverlayFileSystem>,
    visited: &mut HashSet<PathBuf>,
) -> Result<ExtendedOptions, String> {
    let abs_path = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(path)
    };

    let canonical = abs_path.canonicalize().unwrap_or_else(|_| abs_path.clone());
    if !visited.insert(canonical.clone()) {
        return Err(format!(
            "Circular dependency detected in tsconfig extends: {:?}",
            canonical
        ));
    }

    let json_str = fs
        .read_to_string(path)
        .map_err(|e| format!("Failed to read tsconfig at {:?}: {}", path, e))?;

    let mut stripped_json = json_str.clone();
    let _ = json_strip_comments::strip(&mut stripped_json);

    let tsconfig = TsConfig::parse(false, path, path, json_str)
        .map_err(|e| format!("Failed to parse tsconfig JSON at {:?}: {:?}", path, e))?;

    // Extract preserveSymlinks and workspaceName directly from the stripped JSON using serde_json.
    let parsed_json: Result<serde_json::Value, _> = serde_json::from_str(&stripped_json);
    let mut current_preserve_symlinks = parsed_json.as_ref().ok().and_then(|json| {
        json.pointer("/compilerOptions/preserveSymlinks")
            .and_then(|v| v.as_bool())
    });

    let mut current_workspace_name = parsed_json.as_ref().ok().and_then(|json| {
        json.pointer("/angularCompilerOptions/workspaceName")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
    });

    let mut current_generate_extra_imports = parsed_json.as_ref().ok().and_then(|json| {
        json.pointer("/angularCompilerOptions/generateExtraImportsInLocalMode")
            .or_else(|| {
                json.pointer("/bazelOptions/angularCompilerOptions/generateExtraImportsInLocalMode")
            })
            .and_then(|v| v.as_bool())
    });

    let mut current_compile_non_exported = parsed_json.as_ref().ok().and_then(|json| {
        json.pointer("/angularCompilerOptions/compileNonExportedClasses")
            .and_then(|v| v.as_bool())
    });

    let base_dir = abs_path.parent().unwrap_or(Path::new("."));

    let mut current_root_dirs = tsconfig.compiler_options.root_dirs.clone().map(|dirs| {
        dirs.into_iter()
            .map(|d| {
                let p = if d.is_absolute() { d } else { base_dir.join(d) };
                crate::fs::normalize_path(&p).into_owned()
            })
            .collect::<Vec<_>>()
    });

    if current_root_dirs.is_some()
        && current_preserve_symlinks.is_some()
        && current_workspace_name.is_some()
        && current_generate_extra_imports.is_some()
        && current_compile_non_exported.is_some()
    {
        visited.remove(&canonical);
        return Ok(ExtendedOptions {
            root_dirs: current_root_dirs,
            preserve_symlinks: current_preserve_symlinks,
            workspace_name: current_workspace_name,
            generate_extra_imports_in_local_mode: current_generate_extra_imports,
            compile_non_exported_classes: current_compile_non_exported,
        });
    }

    let Some(extends_field) = &tsconfig.extends else {
        visited.remove(&canonical);
        return Ok(ExtendedOptions {
            root_dirs: current_root_dirs,
            preserve_symlinks: current_preserve_symlinks,
            workspace_name: current_workspace_name,
            generate_extra_imports_in_local_mode: current_generate_extra_imports,
            compile_non_exported_classes: current_compile_non_exported,
        });
    };

    let extends_list: &[String] = match extends_field {
        oxc_resolver::ExtendsField::Single(s) => std::slice::from_ref(s),
        oxc_resolver::ExtendsField::Multiple(v) => v.as_slice(),
    };

    let mut inherited = ExtendedOptions::default();
    for extends_str in extends_list {
        let base_dir = path.parent().unwrap_or(Path::new("."));
        let extends_path = match resolver.resolve(base_dir, extends_str) {
            Ok(resolution) => resolution.into_path_buf(),
            Err(_) => {
                let mut extends_path = base_dir.join(extends_str);
                if fs.metadata(&extends_path).is_err()
                    && extends_path.extension().and_then(|e| e.to_str()) != Some("json")
                {
                    let mut as_json = extends_path.into_os_string();
                    as_json.push(".json");
                    extends_path = PathBuf::from(as_json);
                }
                extends_path
            }
        };

        let res = resolve_extended_options_recursive(&extends_path, fs, resolver, visited)?;

        if let Some(dirs) = res.root_dirs {
            inherited.root_dirs = Some(dirs);
        }
        if let Some(preserve_symlinks) = res.preserve_symlinks {
            inherited.preserve_symlinks = Some(preserve_symlinks);
        }
        if let Some(workspace_name) = res.workspace_name {
            inherited.workspace_name = Some(workspace_name);
        }
        if let Some(generate_extra_imports) = res.generate_extra_imports_in_local_mode {
            inherited.generate_extra_imports_in_local_mode = Some(generate_extra_imports);
        }
        if let Some(compile_non_exported) = res.compile_non_exported_classes {
            inherited.compile_non_exported_classes = Some(compile_non_exported);
        }
    }
    if current_root_dirs.is_none() {
        current_root_dirs = inherited.root_dirs;
    }
    if current_preserve_symlinks.is_none() {
        current_preserve_symlinks = inherited.preserve_symlinks;
    }
    if current_workspace_name.is_none() {
        current_workspace_name = inherited.workspace_name;
    }
    if current_generate_extra_imports.is_none() {
        current_generate_extra_imports = inherited.generate_extra_imports_in_local_mode;
    }
    if current_compile_non_exported.is_none() {
        current_compile_non_exported = inherited.compile_non_exported_classes;
    }

    visited.remove(&canonical);
    Ok(ExtendedOptions {
        root_dirs: current_root_dirs,
        preserve_symlinks: current_preserve_symlinks,
        workspace_name: current_workspace_name,
        generate_extra_imports_in_local_mode: current_generate_extra_imports,
        compile_non_exported_classes: current_compile_non_exported,
    })
}

pub fn is_supported_extension(path: &Path, allow_js: bool) -> bool {
    if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
        match ext {
            "ts" | "tsx" | "d.ts" | "mts" | "cts" => true,
            "js" | "jsx" | "mjs" | "cjs" if allow_js => true,
            _ => false,
        }
    } else {
        false
    }
}

pub fn is_excluded(path: &Path, base_dir: &Path, exclude_patterns: &[String]) -> bool {
    // Get path relative to base_dir
    let rel_path = match pathdiff::diff_paths(path, base_dir) {
        Some(p) => p,
        None => return false,
    };

    // Check strict exclusions
    for pattern in exclude_patterns {
        let pattern_path = Path::new(pattern);
        let pat_relative = if pattern_path.is_absolute() {
            match pathdiff::diff_paths(pattern_path, base_dir) {
                Some(p) => p.to_string_lossy().to_string(),
                None => pattern.clone(),
            }
        } else {
            pattern.clone()
        };

        // Normalize pattern to glob:
        // If pattern has no slash, it matches any file/dir component (e.g. "node_modules" -> "**/node_modules")
        let pat_str = if !pat_relative.contains('/') {
            format!("**/{}", pat_relative)
        } else {
            pat_relative.clone()
        };

        let pat1 = pat_str.clone();
        if glob_matches(&rel_path, &pat1) {
            return true;
        }

        // If pattern does not end in *, try appending /** to match contents of a directory
        if !pat_str.ends_with('*') {
            let pat2 = format!("{}/**", pat_str);
            if glob_matches(&rel_path, &pat2) {
                return true;
            }
        }
    }

    false
}

fn glob_matches(path: &Path, pattern: &str) -> bool {
    match glob::Pattern::new(pattern) {
        Ok(pat) => pat.matches_path(path),
        Err(_) => false,
    }
}

#[cfg(test)]
mod walker_tests {
    use super::*;
    use crate::physical_fs::{DirEntry, PhysicalFs};
    use oxc_resolver::FileMetadata;
    use std::collections::HashMap;
    use std::io::{Error, ErrorKind, Result};
    use std::sync::Arc;

    /// An in-memory [`PhysicalFs`] so the walker can be exercised without touching
    /// disk — the same seam the WebAssembly build uses to reach a JavaScript host.
    #[derive(Default)]
    struct MockFs {
        /// path -> (is_file, is_dir, is_symlink); directories list children by prefix.
        entries: HashMap<PathBuf, (bool, bool, bool)>,
        /// Symlink targets, consulted by the *following* metadata call.
        links: HashMap<PathBuf, PathBuf>,
    }

    impl MockFs {
        fn dir(mut self, path: &str) -> Self {
            self.entries
                .insert(PathBuf::from(path), (false, true, false));
            self
        }
        fn file(mut self, path: &str) -> Self {
            self.entries
                .insert(PathBuf::from(path), (true, false, false));
            self
        }
        /// A symlink at `path` pointing at `target`.
        fn symlink(mut self, path: &str, target: &str) -> Self {
            self.entries
                .insert(PathBuf::from(path), (false, false, true));
            self.links
                .insert(PathBuf::from(path), PathBuf::from(target));
            self
        }
        fn arc(self) -> Arc<dyn PhysicalFs> {
            Arc::new(self)
        }
    }

    impl PhysicalFs for MockFs {
        fn read(&self, _: &Path) -> Result<Vec<u8>> {
            Ok(Vec::new())
        }
        fn read_to_string(&self, _: &Path) -> Result<String> {
            Ok(String::new())
        }
        /// Follows symlinks, like `std::fs::metadata`.
        fn metadata(&self, path: &Path) -> Result<FileMetadata> {
            let resolved = self.links.get(path).cloned().unwrap_or_else(|| path.into());
            self.entries
                .get(&resolved)
                .map(|&(f, d, _)| FileMetadata::new(f, d, false))
                .ok_or_else(|| Error::new(ErrorKind::NotFound, "missing"))
        }
        /// Does not follow symlinks, like `std::fs::symlink_metadata`.
        fn symlink_metadata(&self, path: &Path) -> Result<FileMetadata> {
            self.entries
                .get(path)
                .map(|&(f, d, s)| FileMetadata::new(f, d, s))
                .ok_or_else(|| Error::new(ErrorKind::NotFound, "missing"))
        }
        fn read_link(&self, path: &Path) -> Result<PathBuf> {
            self.links
                .get(path)
                .cloned()
                .ok_or_else(|| Error::new(ErrorKind::NotFound, "not a link"))
        }
        fn canonicalize(&self, path: &Path) -> Result<PathBuf> {
            Ok(path.to_path_buf())
        }
        fn read_dir(&self, path: &Path) -> Result<Vec<DirEntry>> {
            if !self.entries.get(path).map(|e| e.1).unwrap_or(false) {
                return Err(Error::new(ErrorKind::NotFound, "not a directory"));
            }
            let mut out = Vec::new();
            for (child, &(is_file, is_dir, is_symlink)) in &self.entries {
                if child.parent() == Some(path) {
                    out.push(DirEntry {
                        name: child.file_name().unwrap().to_string_lossy().into_owned(),
                        is_file,
                        is_dir,
                        is_symlink,
                    });
                }
            }
            // Deterministic ordering; HashMap iteration is not stable.
            out.sort_by(|a, b| a.name.cmp(&b.name));
            Ok(out)
        }
    }

    fn collect(fs: &Arc<dyn PhysicalFs>, root: &str, prune: &[&str]) -> Vec<String> {
        let pruned: Vec<String> = prune.iter().map(|s| s.to_string()).collect();
        let mut found = Vec::new();
        walk_source_tree(
            Path::new(root),
            fs,
            &mut |p| found.push(p.to_string_lossy().into_owned()),
            &mut |d| {
                let name = d.file_name().map(|n| n.to_string_lossy().into_owned());
                !name.map(|n| pruned.contains(&n)).unwrap_or(false)
            },
        );
        found.sort();
        found
    }

    #[test]
    fn walks_nested_directories() {
        let fs = MockFs::default()
            .dir("/p")
            .dir("/p/src")
            .file("/p/src/a.ts")
            .file("/p/src/b.ts")
            .dir("/p/src/deep")
            .file("/p/src/deep/c.ts")
            .arc();
        assert_eq!(
            collect(&fs, "/p", &[]),
            vec!["/p/src/a.ts", "/p/src/b.ts", "/p/src/deep/c.ts"]
        );
    }

    #[test]
    fn visits_hidden_entries() {
        // The previous `ignore::WalkBuilder` set `.hidden(false)`; preserve that.
        let fs = MockFs::default()
            .dir("/p")
            .file("/p/.hidden.ts")
            .dir("/p/.config")
            .file("/p/.config/d.ts")
            .arc();
        assert_eq!(
            collect(&fs, "/p", &[]),
            vec!["/p/.config/d.ts", "/p/.hidden.ts"]
        );
    }

    #[test]
    fn prunes_directories_without_descending() {
        // Mirrors `filter_entry`: an excluded directory is not traversed at all.
        let fs = MockFs::default()
            .dir("/p")
            .file("/p/a.ts")
            .dir("/p/node_modules")
            .file("/p/node_modules/dep.ts")
            .arc();
        assert_eq!(collect(&fs, "/p", &["node_modules"]), vec!["/p/a.ts"]);
    }

    #[test]
    fn collects_symlinked_files_but_does_not_descend_symlinked_dirs() {
        // The old filter used `Path::is_file`, which follows links, while the walker
        // itself did not follow links when descending. Both halves must hold.
        let fs = MockFs::default()
            .dir("/p")
            .file("/real/target.ts")
            .dir("/real/dir")
            .file("/real/dir/inner.ts")
            .symlink("/p/link.ts", "/real/target.ts")
            .symlink("/p/linkdir", "/real/dir")
            .arc();
        assert_eq!(collect(&fs, "/p", &[]), vec!["/p/link.ts"]);
    }

    #[test]
    fn root_that_is_a_file_yields_only_itself() {
        let fs = MockFs::default().dir("/p").file("/p/only.ts").arc();
        assert_eq!(collect(&fs, "/p/only.ts", &[]), vec!["/p/only.ts"]);
    }

    #[test]
    fn missing_root_yields_nothing() {
        let fs = MockFs::default().dir("/p").arc();
        assert!(collect(&fs, "/p/nope", &[]).is_empty());
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::TempDir;

    #[test]
    fn test_is_excluded() {
        let base_dir = Path::new("/project");
        let excludes = vec![
            "node_modules".to_string(),
            "dist".to_string(),
            "**/*.spec.ts".to_string(),
        ];

        assert!(is_excluded(
            Path::new("/project/node_modules/foo/index.js"),
            base_dir,
            &excludes
        ));
        assert!(is_excluded(
            Path::new("/project/src/app.spec.ts"),
            base_dir,
            &excludes
        ));
        assert!(!is_excluded(
            Path::new("/project/src/app.ts"),
            base_dir,
            &excludes
        ));
        assert!(is_excluded(
            Path::new("/project/dist/main.js"),
            base_dir,
            &excludes
        ));
    }

    #[test]
    fn test_extends() {
        let dir = TempDir::new().unwrap();
        let base_path = dir.path().join("base.json");
        let derived_path = dir.path().join("tsconfig.json");
        let src_dir = dir.path().join("src");
        std::fs::create_dir(&src_dir).unwrap();

        let mut base_file = std::fs::File::create(&base_path).unwrap();
        write!(
            base_file,
            r#"{{
            "compilerOptions": {{
                "outDir": "./dist",
                "allowJs": true
            }},
            "include": ["src/**/*"]
        }}"#
        )
        .unwrap();

        let mut derived_file = std::fs::File::create(&derived_path).unwrap();
        write!(
            derived_file,
            r#"{{
            "extends": "./base.json",
            "compilerOptions": {{
                "outDir": "./build"
            }}
        }}"#
        )
        .unwrap();

        // Create a dummy file to be found
        let main_ts = src_dir.join("main.ts");
        std::fs::File::create(&main_ts).unwrap();

        let config = load_and_resolve_tsconfig(
            &derived_path,
            &crate::fs::OverlayFileSystem::new_with_overlay(),
        )
        .unwrap();
        assert!(config.files.contains(&main_ts));
    }

    #[test]
    fn test_extends_without_json_extension() {
        let dir = TempDir::new().unwrap();
        let base_path = dir.path().join("base.json");
        let derived_path = dir.path().join("tsconfig.json");
        let src_dir = dir.path().join("src");
        std::fs::create_dir(&src_dir).unwrap();

        let mut base_file = std::fs::File::create(&base_path).unwrap();
        write!(
            base_file,
            r#"{{
            "include": ["src/**/*"]
        }}"#
        )
        .unwrap();

        // This extends omits .json
        let mut derived_file = std::fs::File::create(&derived_path).unwrap();
        write!(
            derived_file,
            r#"{{
            "extends": "./base"
        }}"#
        )
        .unwrap();

        let main_ts = src_dir.join("main.ts");
        std::fs::File::create(&main_ts).unwrap();

        let config = load_and_resolve_tsconfig(
            &derived_path,
            &crate::fs::OverlayFileSystem::new_with_overlay(),
        )
        .unwrap();
        assert!(
            config.files.contains(&main_ts),
            "Should resolve ./base to ./base.json and find main.ts"
        );
    }

    #[test]
    fn test_extends_without_json_extension_virtual() {
        println!("test_extends_without_json_extension_virtual");
        let dir = TempDir::new().unwrap();
        let base_path = dir.path().join("base.json");
        let src_dir = dir.path().join("src");
        std::fs::create_dir(&src_dir).unwrap();

        write!(
            std::fs::File::create(&base_path).unwrap(),
            r#"{{
                "include": ["src/do_not_include.ts"]
            }}"#
        )
        .unwrap();

        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        fs.upsert_file(
            base_path,
            r#"{
                "include": ["src/include.ts"]
            }"#
            .to_string(),
        );
        fs.upsert_file(
            dir.path().join("tsconfig.json"),
            r#"{
                "extends": "./base",
                "compilerOptions": {
                    "outDir": "./dist"
                }
            }"#
            .to_string(),
        );
        fs.upsert_file(src_dir.join("do_not_include.ts"), "".to_string());
        fs.upsert_file(src_dir.join("include.ts"), "".to_string());

        let config = load_and_resolve_tsconfig(&dir.path().join("tsconfig.json"), &fs).unwrap();

        assert!(config.files.contains(&src_dir.join("include.ts")));
        assert!(!config.files.contains(&src_dir.join("do_not_include.ts")));
        assert_eq!(config.compiler_options.allow_js, None);
    }

    #[test]
    fn test_circular_extends() {
        let dir = TempDir::new().unwrap();
        let path_a = dir.path().join("cycle_a.json");
        let path_b = dir.path().join("cycle_b.json");

        let mut file_a = std::fs::File::create(&path_a).unwrap();
        write!(file_a, r#"{{ "extends": "./cycle_b.json" }}"#).unwrap();

        let mut file_b = std::fs::File::create(&path_b).unwrap();
        write!(file_b, r#"{{ "extends": "./cycle_a.json" }}"#).unwrap();

        let result =
            load_and_resolve_tsconfig(&path_a, &crate::fs::OverlayFileSystem::new_with_overlay());
        assert!(result.is_err());
        let err = result.err().unwrap();
        println!("CIRCULAR ERROR IS: {}", err);
        assert!(
            err.contains("Circular")
                || err.contains("circular")
                || err.contains("TsconfigCircularExtend")
        );
    }

    #[test]
    fn test_inheritance_overwrite() {
        let dir = TempDir::new().unwrap();
        let base_path = dir.path().join("base.json");
        let derived_path = dir.path().join("tsconfig.json");
        let src_dir = dir.path().join("src");
        let app_dir = dir.path().join("app");
        std::fs::create_dir(&src_dir).unwrap();
        std::fs::create_dir(&app_dir).unwrap();

        let mut base_file = std::fs::File::create(&base_path).unwrap();
        write!(
            base_file,
            r#"{{
            "include": ["src/**/*"],
            "exclude": ["node_modules"]
        }}"#
        )
        .unwrap();

        let mut derived_file = std::fs::File::create(&derived_path).unwrap();
        write!(
            derived_file,
            r#"{{
            "extends": "./base.json",
            "include": ["app/**/*"]
        }}"#
        )
        .unwrap();

        // base defines src/**, derived defines app/**.
        // Derived should OVERWRITE base, so ONLY app/** should be present.

        // Create files
        let src_file = src_dir.join("main.ts");
        std::fs::File::create(&src_file).unwrap();

        let app_file = app_dir.join("app.ts");
        std::fs::File::create(&app_file).unwrap();

        let config = load_and_resolve_tsconfig(
            &derived_path,
            &crate::fs::OverlayFileSystem::new_with_overlay(),
        )
        .unwrap();

        assert!(config.files.contains(&app_file), "Should contain app file");
        assert!(
            !config.files.contains(&src_file),
            "Should NOT contain src file (overwritten)"
        );
    }

    use crate::{Analyzer, AnalyzerOptions, TestAnalyzer, TestAnalyzerOptions};
    use std::collections::HashMap;

    #[test]
    fn test_missing_files_error() {
        let mut virtual_files = HashMap::new();
        virtual_files.insert(
            "/virtual_project/tsconfig.json".to_string(),
            r#"{
                "compilerOptions": {
                    "outDir": "./dist"
                }
            }"#
            .to_string(),
        );
        virtual_files.insert(
            "/virtual_project/src/main.ts".to_string(),
            "export const a = 1;".to_string(),
        );

        let options = TestAnalyzerOptions {
            virtual_files,
            optimize: Some(false),
            tsconfig_path: "/virtual_project/tsconfig.json".to_string(),
            ..Default::default()
        };

        let result = TestAnalyzer::new(options);
        assert!(result.is_ok());
        let _analyzer = result.unwrap();
    }

    #[test]
    fn test_contagion() {
        let mut virtual_files = HashMap::new();
        virtual_files.insert(
            "/virtual_project/tsconfig.json".to_string(),
            r#"{
                "exclude": ["excluded.ts"]
            }"#
            .to_string(),
        );
        virtual_files.insert(
            "/virtual_project/main.ts".to_string(),
            "import { x } from './excluded';".to_string(),
        );
        virtual_files.insert(
            "/virtual_project/excluded.ts".to_string(),
            "export const x = 1;".to_string(),
        );

        let options = TestAnalyzerOptions {
            virtual_files,
            optimize: Some(false),
            tsconfig_path: "/virtual_project/tsconfig.json".to_string(),
            ..Default::default()
        };

        let result = TestAnalyzer::new(options);
        assert!(result.is_ok());
        let analyzer = result.unwrap();
        let iterator = analyzer.analyze().unwrap();

        let mut processed_files = std::collections::HashSet::new();
        let mut count = 0;
        while let Some(res) = futures::executor::block_on(iterator.next()).unwrap() {
            for file in res.files {
                processed_files.insert(file.file_path);
                count += 1;
            }
            if count >= 2 {
                break;
            }
        }

        assert!(
            processed_files
                .iter()
                .any(|p| p.to_lowercase().ends_with("main.ts")),
            "Should process main.ts"
        );
        assert!(
            processed_files
                .iter()
                .any(|p| p.to_lowercase().ends_with("excluded.ts")),
            "Should process excluded.ts via import (contagion)"
        );
    }

    #[test]
    fn test_exclude_works() {
        let mut virtual_files = HashMap::new();
        virtual_files.insert(
            "/virtual_project/tsconfig.json".to_string(),
            r#"{
                "exclude": ["excluded.ts"]
            }"#
            .to_string(),
        );
        virtual_files.insert(
            "/virtual_project/excluded.ts".to_string(),
            "export const x = 1;".to_string(),
        );

        let options = TestAnalyzerOptions {
            virtual_files,
            optimize: Some(false),
            tsconfig_path: "/virtual_project/tsconfig.json".to_string(),
            ..Default::default()
        };

        let result = TestAnalyzer::new(options);
        assert!(result.is_ok());
        let analyzer = result.unwrap();
        let iterator = analyzer.analyze().unwrap();

        let mut count = 0;
        while futures::executor::block_on(iterator.next())
            .unwrap()
            .is_some()
        {
            count += 1;
        }

        assert_eq!(count, 0, "Should exclude excluded.ts and find nothing else");
    }

    #[test]
    fn test_real_fs_resolution() {
        use std::io::Write;
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let tsconfig_path = dir.path().join("tsconfig.json");
        let src_dir = dir.path().join("src");
        std::fs::create_dir(&src_dir).unwrap();

        let mut tsconfig = std::fs::File::create(&tsconfig_path).unwrap();
        write!(
            tsconfig,
            r#"{{
            "compilerOptions": {{
                "outDir": "./dist"
            }},
            "include": ["src/**/*"]
        }}"#
        )
        .unwrap();

        let main_ts = src_dir.join("main.ts");
        let mut main_file = std::fs::File::create(&main_ts).unwrap();
        write!(main_file, "export const x = 1;").unwrap();

        let result = Analyzer::new(AnalyzerOptions {
            tsconfig_path: tsconfig_path.to_string_lossy().to_string(),
            optimize: Some(false),
            ..Default::default()
        });
        assert!(
            result.is_ok(),
            "Analyzer should initialize successfully with real FS and missing 'files'"
        );

        let analyzer = result.unwrap();
        let iterator = analyzer.analyze().unwrap();
        let mut count = 0;
        while let Some(res) = futures::executor::block_on(iterator.next()).unwrap() {
            for file in res.files {
                if file.file_path.contains("main.ts") {
                    count += 1;
                }
            }
        }

        assert_eq!(
            count, 1,
            "Should find main.ts via glob inclusion on real FS"
        );
    }

    #[test]
    fn test_virtual_extends() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        fs.upsert_file(
            PathBuf::from("/virtual/base.json"),
            r#"{
                "compilerOptions": {
                    "allowJs": true
                },
                "include": ["src/**/*"]
            }"#
            .to_string(),
        );
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.json"),
            r#"{
                "extends": "./base.json",
                "compilerOptions": {
                    "outDir": "./dist"
                }
            }"#
            .to_string(),
        );
        fs.upsert_file(PathBuf::from("/virtual/src/main.ts"), "".to_string());

        let config = load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.json"), &fs).unwrap();
        assert!(config
            .files
            .contains(&PathBuf::from("/virtual/src/main.ts")));
        assert_eq!(config.compiler_options.allow_js, Some(true));
    }

    #[test]
    fn test_expand_globs_virtual() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/virtual/src/main.ts"), "".to_string());
        fs.upsert_file(PathBuf::from("/virtual/src/app.ts"), "".to_string());
        fs.upsert_file(PathBuf::from("/virtual/test/app.spec.ts"), "".to_string());

        let include = vec![PathBuf::from("src/**/*")];
        let exclude = vec![];
        let base_dir = Path::new("/virtual");

        let files = expand_globs(base_dir, &include, &exclude, false, &fs);

        assert_eq!(files.len(), 2);
        assert!(files.contains(&PathBuf::from("/virtual/src/main.ts")));
        assert!(files.contains(&PathBuf::from("/virtual/src/app.ts")));
        assert!(!files.contains(&PathBuf::from("/virtual/test/app.spec.ts")));
    }

    #[test]
    fn test_node_modules_path_override() {
        use std::io::Write;
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let node_modules_path = dir.path().join("node_modules");
        std::fs::create_dir(&node_modules_path).unwrap();

        let dummy_pkg = node_modules_path.join("dummy-pkg");
        std::fs::create_dir(&dummy_pkg).unwrap();

        let index_ts = dummy_pkg.join("index.ts");
        let mut file = std::fs::File::create(&index_ts).unwrap();
        write!(file, "export const x = 1;").unwrap();

        let mut virtual_files = HashMap::new();
        virtual_files.insert(
            "/virtual_project/tsconfig.json".to_string(),
            r#"{
                "compilerOptions": {
                    "outDir": "./dist"
                }
            }"#
            .to_string(),
        );
        virtual_files.insert(
            "/virtual_project/src/main.ts".to_string(),
            "import { x } from 'dummy-pkg';".to_string(),
        );

        let options = TestAnalyzerOptions {
            virtual_files,
            optimize: Some(false),
            tsconfig_path: "/virtual_project/tsconfig.json".to_string(),
            node_modules_path_override: Some(node_modules_path.to_string_lossy().to_string()),
            ..Default::default()
        };

        let result = TestAnalyzer::new(options);
        assert!(
            result.is_ok(),
            "TestAnalyzer should initialize successfully"
        );
        let analyzer = result.unwrap();
        let iterator = analyzer.analyze().unwrap();

        let mut processed = false;
        while let Some(res) = futures::executor::block_on(iterator.next()).unwrap() {
            for file in res.files {
                if file.file_path.ends_with("main.ts") {
                    processed = true;
                }
            }
        }
        assert!(processed, "Should process main.ts");
    }

    #[test]
    fn test_virtual_extends_real() {
        use std::io::Write;
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let real_base_path = dir.path().join("base.json");

        // 1. Create the REAL base file on disk
        let mut file = std::fs::File::create(&real_base_path).unwrap();
        write!(file, r#"{{ "compilerOptions": {{ "allowJs": true }} }}"#).unwrap();

        // 2. Create the virtual file system and add the VIRTUAL derived file
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        let virtual_tsconfig_path = PathBuf::from("/virtual/tsconfig.json");

        fs.upsert_file(
            virtual_tsconfig_path.clone(),
            format!(
                r#"{{ "extends": "{}", "compilerOptions": {{ "outDir": "./dist" }} }}"#,
                real_base_path.to_string_lossy().replace("\\", "/")
            ), // Normalize for JSON
        );

        // 3. Load and resolve starting from the virtual file
        let config = load_and_resolve_tsconfig(&virtual_tsconfig_path, &fs).unwrap();

        // 4. Assert we got values from both
        assert_eq!(config.compiler_options.allow_js, Some(true)); // From real base
    }

    #[test]
    fn test_real_extends_virtual() {
        use std::io::Write;
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let real_tsconfig_path = dir.path().join("tsconfig.json");

        // 1. Create the virtual file system and add the VIRTUAL base file
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        let virtual_base_path = PathBuf::from("/virtual/base.json");

        fs.upsert_file(
            virtual_base_path.clone(),
            r#"{ "compilerOptions": { "allowJs": true } }"#.to_string(),
        );

        // 2. Create the REAL derived file on disk extending the virtual one
        let mut file = std::fs::File::create(&real_tsconfig_path).unwrap();
        write!(
            file,
            r#"{{ "extends": "/virtual/base.json", "compilerOptions": {{ "outDir": "./dist" }} }}"#
        )
        .unwrap();

        // 3. Load and resolve starting from the real file
        let config = load_and_resolve_tsconfig(&real_tsconfig_path, &fs).unwrap();

        // 4. Assert we got values from both
        assert_eq!(config.compiler_options.allow_js, Some(true)); // From virtual base
    }

    #[test]
    fn test_extends_prefers_extensionless_file_real() {
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let base_path = dir.path().join("base");
        let base_json_path = dir.path().join("base.json");
        let tsconfig_path = dir.path().join("tsconfig.json");

        std::fs::write(&base_path, r#"{ "compilerOptions": { "allowJs": true } }"#).unwrap();
        std::fs::write(
            &base_json_path,
            r#"{ "compilerOptions": { "allowJs": false } }"#,
        )
        .unwrap();
        std::fs::write(&tsconfig_path, r#"{ "extends": "./base" }"#).unwrap();

        let config = load_and_resolve_tsconfig(
            &tsconfig_path,
            &crate::fs::OverlayFileSystem::new_with_overlay(),
        )
        .unwrap();

        assert_eq!(config.compiler_options.allow_js, Some(true));
    }

    #[test]
    fn test_extends_prefers_extensionless_file_virtual() {
        let dir = tempfile::TempDir::new().unwrap();
        let base_path = dir.path().join("base");
        let base_json_path = dir.path().join("base.json");
        let tsconfig_path = dir.path().join("tsconfig.json");

        let fs = crate::fs::OverlayFileSystem::new_with_overlay();

        fs.upsert_file(
            base_path.clone(),
            r#"{ "compilerOptions": { "allowJs": true } }"#.to_string(),
        );

        fs.upsert_file(
            base_json_path.clone(),
            r#"{ "compilerOptions": { "allowJs": false } }"#.to_string(),
        );

        fs.upsert_file(
            tsconfig_path.clone(),
            r#"{ "extends": "./base" }"#.to_string(),
        );

        let config = load_and_resolve_tsconfig(&tsconfig_path, &fs).unwrap();

        assert_eq!(config.compiler_options.allow_js, Some(true));
    }

    #[test]
    fn test_relative_root_dirs_in_extended_tsconfig() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        let base_path = PathBuf::from("/virtual/base/tsconfig.base.json");
        let tsconfig_path = PathBuf::from("/virtual/app/tsconfig.json");

        fs.upsert_file(
            base_path.clone(),
            r#"{
                "compilerOptions": {
                    "rootDirs": ["./src", "./gen"]
                }
            }"#
            .to_string(),
        );

        fs.upsert_file(
            tsconfig_path.clone(),
            r#"{
                "extends": "../base/tsconfig.base.json"
            }"#
            .to_string(),
        );

        let config = load_and_resolve_tsconfig(&tsconfig_path, &fs).unwrap();
        let root_dirs = config.compiler_options.root_dirs.unwrap();

        assert_eq!(root_dirs.len(), 2);
        assert_eq!(root_dirs[0], PathBuf::from("/virtual/base/src"));
        assert_eq!(root_dirs[1], PathBuf::from("/virtual/base/gen"));
    }

    #[test]
    fn test_node_modules_tsconfig_resolution() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        let tsconfig_path = PathBuf::from("/virtual/app/tsconfig.json");

        // The base tsconfig is in node_modules, simulating an external package
        let base_path =
            PathBuf::from("/virtual/app/node_modules/my-tsconfig-package/tsconfig.json");
        fs.upsert_file(
            base_path.clone(),
            r#"{
                "compilerOptions": {
                    "allowJs": true,
                    "rootDirs": ["./src"]
                }
            }"#
            .to_string(),
        );

        fs.upsert_file(
            tsconfig_path.clone(),
            r#"{
                "extends": "my-tsconfig-package/tsconfig.json",
                "compilerOptions": {
                    "outDir": "./dist"
                }
            }"#
            .to_string(),
        );

        let config = load_and_resolve_tsconfig(&tsconfig_path, &fs).unwrap();

        assert_eq!(config.compiler_options.allow_js, Some(true));
        let root_dirs = config.compiler_options.root_dirs.unwrap();
        assert_eq!(root_dirs.len(), 1);
        assert_eq!(
            root_dirs[0],
            PathBuf::from("/virtual/app/node_modules/my-tsconfig-package/src")
        );
    }

    #[test]
    fn test_relative_files_with_parent() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();

        fs.upsert_file(
            PathBuf::from("/virtual/sub/tsconfig.json"),
            r#"{
                "files": ["../src/main.ts", "../src/non_existent.ts"]
            }"#
            .to_string(),
        );
        fs.upsert_file(PathBuf::from("/virtual/src/main.ts"), "".to_string());

        let config =
            load_and_resolve_tsconfig(Path::new("/virtual/sub/tsconfig.json"), &fs).unwrap();

        assert!(
            config
                .files
                .contains(&PathBuf::from("/virtual/src/main.ts")),
            "Expected resolved files to contain /virtual/src/main.ts. Files: {:?}",
            config.files
        );
        assert!(
            !config
                .files
                .contains(&PathBuf::from("/virtual/src/non_existent.ts")),
            "Expected resolved files to NOT contain non_existent.ts. Files: {:?}",
            config.files
        );
    }

    #[test]
    fn test_relative_tsconfig_path() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();

        fs.upsert_file(
            PathBuf::from("sub/tsconfig.json"),
            r#"{
                "files": ["../src/main.ts"]
            }"#
            .to_string(),
        );
        fs.upsert_file(PathBuf::from("src/main.ts"), "".to_string());

        let config = load_and_resolve_tsconfig(Path::new("sub/tsconfig.json"), &fs).unwrap();

        assert!(
            config.files.contains(&PathBuf::from("src/main.ts")),
            "Expected resolved files to contain src/main.ts. Files: {:?}",
            config.files
        );
    }

    #[test]
    fn test_preserve_symlinks_parsing() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();

        // 1. Default (not specified)
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.default.json"),
            r#"{
                "files": []
            }"#
            .to_string(),
        );
        let config =
            load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.default.json"), &fs).unwrap();
        assert!(!config.preserve_symlinks);

        // 2. Explicit true
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.true.json"),
            r#"{
                "compilerOptions": {
                    "preserveSymlinks": true
                },
                "files": []
            }"#
            .to_string(),
        );
        let config =
            load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.true.json"), &fs).unwrap();
        assert!(config.preserve_symlinks);

        // 3. Explicit false
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.false.json"),
            r#"{
                "compilerOptions": {
                    "preserveSymlinks": false
                },
                "files": []
            }"#
            .to_string(),
        );
        let config =
            load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.false.json"), &fs).unwrap();
        assert!(!config.preserve_symlinks);

        // 4. Inherited from base
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.base.json"),
            r#"{
                "compilerOptions": {
                    "preserveSymlinks": true
                }
            }"#
            .to_string(),
        );
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.derived.json"),
            r#"{
                "extends": "./tsconfig.base.json",
                "files": []
            }"#
            .to_string(),
        );
        let config =
            load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.derived.json"), &fs).unwrap();
        assert!(config.preserve_symlinks);

        // 5. Overridden in derived
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.overridden.json"),
            r#"{
                "extends": "./tsconfig.base.json",
                "compilerOptions": {
                    "preserveSymlinks": false
                },
                "files": []
            }"#
            .to_string(),
        );
        let config =
            load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.overridden.json"), &fs).unwrap();
        assert!(!config.preserve_symlinks);

        // 6. With comments in tsconfig
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.comments.json"),
            r#"{
                // Comment here
                "compilerOptions": {
                    /* another comment */
                    "preserveSymlinks": true
                },
                "files": []
            }"#
            .to_string(),
        );
        let config =
            load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.comments.json"), &fs).unwrap();
        assert!(config.preserve_symlinks);
    }

    #[cfg(unix)]
    #[test]
    fn test_preserve_symlinks_resolution() {
        use crate::utils::create_resolver_with_fs;

        let dir = TempDir::new().unwrap();
        let project_dir = dir.path().to_path_buf();

        let pkg_dir = project_dir.join("pkg");
        std::fs::create_dir(&pkg_dir).unwrap();
        let target_file = pkg_dir.join("index.ts");
        std::fs::write(&target_file, "export const a = 1;").unwrap();

        let node_modules_dir = project_dir.join("node_modules");
        std::fs::create_dir(&node_modules_dir).unwrap();
        let symlink_dir = node_modules_dir.join("pkg");
        std::os::unix::fs::symlink(&pkg_dir, &symlink_dir).unwrap();

        // 1. Resolve with preserve_symlinks = false (follows symlink to real path /pkg/index.ts)
        let tsconfig_path = project_dir.join("tsconfig.json");
        std::fs::write(
            &tsconfig_path,
            r#"{"compilerOptions": {"preserveSymlinks": false}}"#,
        )
        .unwrap();

        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        let config = load_and_resolve_tsconfig(&tsconfig_path, &fs).unwrap();
        assert!(!config.preserve_symlinks);

        let resolver =
            create_resolver_with_fs(&tsconfig_path, fs.clone(), config.preserve_symlinks, None);
        let resolved = resolver.resolve(&project_dir, "pkg").unwrap();
        let resolved_path = resolved.path().canonicalize().unwrap();
        assert!(resolved_path.ends_with("pkg/index.ts"));
        assert!(!resolved_path.ends_with("node_modules/pkg/index.ts"));

        // 2. Resolve with preserve_symlinks = true (preserves symlink path /node_modules/pkg/index.ts)
        std::fs::write(
            &tsconfig_path,
            r#"{"compilerOptions": {"preserveSymlinks": true}}"#,
        )
        .unwrap();

        // We need a fresh loader because of cache or overlays
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        let config = load_and_resolve_tsconfig(&tsconfig_path, &fs).unwrap();
        assert!(config.preserve_symlinks);

        let resolver =
            create_resolver_with_fs(&tsconfig_path, fs.clone(), config.preserve_symlinks, None);
        let resolved = resolver.resolve(&project_dir, "pkg").unwrap();
        let resolved_path = resolved.path();
        assert!(resolved_path.ends_with("node_modules/pkg/index.ts"));
    }

    #[test]
    fn test_workspace_name_resolution() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        fs.upsert_file(
            PathBuf::from("/virtual/tsconfig.json"),
            r#"{
                "compilerOptions": {
                    "rootDirs": ["/virtual/src"]
                },
                "angularCompilerOptions": {
                    "workspaceName": "my_workspace"
                },
                "files": ["/virtual/src/main.ts"]
            }"#
            .to_string(),
        );

        fs.upsert_file(
            PathBuf::from("/virtual/src/main.ts"),
            "export const a = 1;".to_string(),
        );

        let config = load_and_resolve_tsconfig(Path::new("/virtual/tsconfig.json"), &fs).unwrap();
        assert_eq!(config.workspace_name.as_deref(), Some("my_workspace"));
    }

    #[test]
    fn test_workspace_name_inheritance() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        fs.upsert_file(
            PathBuf::from("/virtual/base.json"),
            r#"{
                "angularCompilerOptions": {
                    "workspaceName": "inherited_ws"
                }
            }"#
            .to_string(),
        );
        fs.upsert_file(
            PathBuf::from("/virtual/child.json"),
            r#"{
                "extends": "./base.json",
                "files": ["/virtual/src/main.ts"]
            }"#
            .to_string(),
        );
        fs.upsert_file(
            PathBuf::from("/virtual/src/main.ts"),
            "export const a = 1;".to_string(),
        );

        let config = load_and_resolve_tsconfig(Path::new("/virtual/child.json"), &fs).unwrap();
        assert_eq!(config.workspace_name.as_deref(), Some("inherited_ws"));
    }

    #[test]
    fn test_workspace_name_override() {
        let fs = crate::fs::OverlayFileSystem::new_with_overlay();
        fs.upsert_file(
            PathBuf::from("/virtual/base.json"),
            r#"{
                "angularCompilerOptions": {
                    "workspaceName": "base_ws"
                }
            }"#
            .to_string(),
        );
        fs.upsert_file(
            PathBuf::from("/virtual/child.json"),
            r#"{
                "extends": "./base.json",
                "angularCompilerOptions": {
                    "workspaceName": "child_ws"
                },
                "files": ["/virtual/src/main.ts"]
            }"#
            .to_string(),
        );
        fs.upsert_file(
            PathBuf::from("/virtual/src/main.ts"),
            "export const a = 1;".to_string(),
        );

        let config = load_and_resolve_tsconfig(Path::new("/virtual/child.json"), &fs).unwrap();
        assert_eq!(config.workspace_name.as_deref(), Some("child_ws"));
    }
}
