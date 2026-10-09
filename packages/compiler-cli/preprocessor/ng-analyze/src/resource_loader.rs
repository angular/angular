use oxc_resolver::{FileSystem, ResolverGeneric};
use std::path::{Path, PathBuf};

/// Trait to expose TSConfig `rootDirs` from the underlying filesystem.
pub trait ResourceResolverFs: FileSystem {
    fn root_dirs(&self) -> Vec<PathBuf>;

    /// Per-instance cache backing `detect_is_core` (directory -> is-`@angular/core`), keeping
    /// separate analyzer runs isolated. The process-global default is only used by mock filesystems.
    fn is_core_cache(&self) -> &std::sync::RwLock<std::collections::HashMap<PathBuf, bool>> {
        use std::sync::{OnceLock, RwLock};
        static GLOBAL: OnceLock<RwLock<std::collections::HashMap<PathBuf, bool>>> = OnceLock::new();
        GLOBAL.get_or_init(|| RwLock::new(std::collections::HashMap::new()))
    }
}

/// Resource path resolver for component templates and stylesheets.
pub struct ResourceResolver<'a, Fs: ResourceResolverFs> {
    fs: &'a Fs,
    resolver: &'a ResolverGeneric<Fs>,
}

impl<'a, Fs: ResourceResolverFs> ResourceResolver<'a, Fs> {
    pub fn new(fs: &'a Fs, resolver: &'a ResolverGeneric<Fs>) -> Self {
        Self { fs, resolver }
    }

    /// Resolve a rooted path (starting with `/`) using the configured `rootDirs`.
    /// Lenient: returns a candidate path even if the file does not exist.
    pub fn resolve_rooted(&self, resource_path: &str) -> Result<PathBuf, String> {
        let relative_segment = resource_path.strip_prefix('/').unwrap_or(resource_path);

        let root_dirs = self.fs.root_dirs();
        if root_dirs.is_empty() {
            return Ok(Path::new("/").join(relative_segment));
        }

        for root in &root_dirs {
            let relative_path = format!("./{}", relative_segment);
            if let Some(path) = self.resolve_with_oxc(root, &relative_path) {
                return Ok(path);
            }
        }

        // Lenient fallback: return the candidate in the first root directory
        Ok(root_dirs[0].join(relative_segment))
    }

    /// Entry point to resolve any resource path using the appropriate strategy.
    pub fn resolve_resource(
        &self,
        containing_file: &Path,
        resource_path: &str,
    ) -> Result<PathBuf, String> {
        let decoded_path = percent_decode(resource_path);
        let resource_path = decoded_path.as_ref();

        if resource_path.starts_with('/') {
            return self.resolve_rooted(resource_path);
        }

        let parent_dir = containing_file.parent().unwrap_or_else(|| Path::new("."));

        // 1. Try resolving as a relative path
        let is_explicit_relative =
            resource_path.starts_with("./") || resource_path.starts_with("../");
        let relative_path = if is_explicit_relative {
            std::borrow::Cow::Borrowed(resource_path)
        } else {
            std::borrow::Cow::Owned(format!("./{}", resource_path))
        };

        if let Some(path) = self.resolve_with_oxc(parent_dir, &relative_path) {
            return Ok(path);
        }

        // 2. For ambiguous paths, try module resolution
        if !is_explicit_relative {
            if let Some(path) = self.resolve_with_oxc(parent_dir, resource_path) {
                return Ok(path);
            }
        }

        // 3. Lenient fallback: treat as relative
        Ok(parent_dir.join(&*relative_path))
    }

    fn resolve_with_oxc(&self, parent_dir: &Path, resource_path: &str) -> Option<PathBuf> {
        if let Ok(resolution) = self.resolver.resolve(parent_dir, resource_path) {
            return Some(resolution.into_path_buf());
        }

        let path = Path::new(resource_path);
        let ext = path.extension()?.to_str()?;
        if !is_preprocessor_extension(ext) {
            return None;
        }

        let fallback_path = path.with_extension("css");
        let fallback_str = fallback_path.to_string_lossy();
        let resolution = self.resolver.resolve(parent_dir, &fallback_str).ok()?;
        Some(resolution.into_path_buf())
    }
}

fn is_preprocessor_extension(ext: &str) -> bool {
    matches!(ext, "scss" | "sass" | "less" | "styl")
}

fn percent_decode(s: &str) -> std::borrow::Cow<'_, str> {
    if !s.contains('%') {
        return std::borrow::Cow::Borrowed(s);
    }

    let mut decoded_bytes = Vec::with_capacity(s.len());
    let mut bytes = s.as_bytes().iter().peekable();
    while let Some(&b) = bytes.next() {
        if b != b'%' {
            decoded_bytes.push(b);
            continue;
        }

        let mut hex_bytes = bytes.clone();
        let (Some(&h1), Some(&h2)) = (hex_bytes.next(), hex_bytes.next()) else {
            decoded_bytes.push(b'%');
            continue;
        };

        if !h1.is_ascii_hexdigit() || !h2.is_ascii_hexdigit() {
            decoded_bytes.push(b'%');
            continue;
        }

        let hex = [h1, h2];
        let Ok(hex_str) = std::str::from_utf8(&hex) else {
            decoded_bytes.push(b'%');
            continue;
        };

        let Ok(byte) = u8::from_str_radix(hex_str, 16) else {
            decoded_bytes.push(b'%');
            continue;
        };

        // Successfully decoded a percent-escape sequence.
        // Advance the iterator past the two hex digits.
        bytes.next();
        bytes.next();
        decoded_bytes.push(byte);
    }
    std::borrow::Cow::Owned(String::from_utf8_lossy(&decoded_bytes).into_owned())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[derive(Clone)]
    struct MockFs {
        root_dirs: Vec<PathBuf>,
        files: HashMap<PathBuf, String>,
    }

    impl FileSystem for MockFs {
        fn new() -> Self {
            Self {
                root_dirs: Vec::new(),
                files: HashMap::new(),
            }
        }

        fn read(&self, path: &Path) -> std::io::Result<Vec<u8>> {
            self.files
                .get(path)
                .map(|s| s.as_bytes().to_vec())
                .ok_or_else(|| std::io::Error::from(std::io::ErrorKind::NotFound))
        }

        fn read_to_string(&self, path: &Path) -> std::io::Result<String> {
            self.files
                .get(path)
                .cloned()
                .ok_or_else(|| std::io::Error::from(std::io::ErrorKind::NotFound))
        }

        fn metadata(&self, path: &Path) -> std::io::Result<oxc_resolver::FileMetadata> {
            if self.files.contains_key(path) {
                return Ok(oxc_resolver::FileMetadata::new(true, false, false));
            }
            // Check if path is a parent directory of any mock file
            for file_path in self.files.keys() {
                if file_path
                    .ancestors()
                    .any(|ancestor| ancestor == path && ancestor != file_path)
                {
                    return Ok(oxc_resolver::FileMetadata::new(false, true, false));
                }
            }
            Err(std::io::Error::from(std::io::ErrorKind::NotFound))
        }

        fn symlink_metadata(&self, path: &Path) -> std::io::Result<oxc_resolver::FileMetadata> {
            self.metadata(path)
        }

        fn read_link(
            &self,
            _path: &Path,
        ) -> std::result::Result<PathBuf, oxc_resolver::ResolveError> {
            Err(oxc_resolver::ResolveError::NotFound("".to_string()))
        }

        fn canonicalize(&self, path: &Path) -> std::io::Result<PathBuf> {
            Ok(path.to_path_buf())
        }
    }

    impl ResourceResolverFs for MockFs {
        fn root_dirs(&self) -> Vec<PathBuf> {
            self.root_dirs.clone()
        }
    }

    #[test]
    fn test_resolve_rooted_success() {
        let mut files = HashMap::new();
        files.insert(PathBuf::from("/root1/css/styles.scss"), "".to_string());
        let fs = MockFs {
            root_dirs: vec![PathBuf::from("/root1")],
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_rooted("/css/styles.scss");
        assert_eq!(result, Ok(PathBuf::from("/root1/css/styles.scss")));
    }

    #[test]
    fn test_resolve_rooted_preprocessor_fallback() {
        let mut files = HashMap::new();
        files.insert(PathBuf::from("/root2/css/styles.css"), "".to_string());
        let fs = MockFs {
            root_dirs: vec![PathBuf::from("/root1"), PathBuf::from("/root2")],
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_rooted("/css/styles.scss");
        assert_eq!(result, Ok(PathBuf::from("/root2/css/styles.css")));
    }

    #[test]
    fn test_resolve_rooted_lenient_fallback() {
        let fs = MockFs {
            root_dirs: vec![PathBuf::from("/root1"), PathBuf::from("/root2")],
            files: HashMap::new(),
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_rooted("/css/styles.scss");
        assert_eq!(result, Ok(PathBuf::from("/root1/css/styles.scss")));
    }

    #[test]
    fn test_resolve_relative_success() {
        let mut files = HashMap::new();
        files.insert(
            PathBuf::from("/project/src/app/app.component.html"),
            "".to_string(),
        );
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "./app.component.html",
        );
        assert_eq!(
            result,
            Ok(PathBuf::from("/project/src/app/app.component.html"))
        );
    }

    #[test]
    fn test_resolve_relative_preprocessor_fallback() {
        let mut files = HashMap::new();
        files.insert(
            PathBuf::from("/project/src/app/app.component.css"),
            "".to_string(),
        );
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "./app.component.scss",
        );
        assert_eq!(
            result,
            Ok(PathBuf::from("/project/src/app/app.component.css"))
        );
    }

    #[test]
    fn test_resolve_relative_lenient() {
        let fs = MockFs {
            root_dirs: Vec::new(),
            files: HashMap::new(),
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "./missing.html",
        );
        assert_eq!(result, Ok(PathBuf::from("/project/src/app/missing.html")));
    }

    #[test]
    fn test_resolve_ambiguous_existing_relative() {
        let mut files = HashMap::new();
        files.insert(
            PathBuf::from("/project/src/app/template.html"),
            "".to_string(),
        );
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "template.html",
        );
        assert_eq!(result, Ok(PathBuf::from("/project/src/app/template.html")));
    }

    #[test]
    fn test_resolve_ambiguous_module_fallback() {
        let mut files = HashMap::new();
        files.insert(
            PathBuf::from("/project/node_modules/my-lib/styles.css"),
            "".to_string(),
        );
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions {
                modules: vec!["node_modules".to_string()],
                ..oxc_resolver::ResolveOptions::default()
            },
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver
            .resolve_resource(Path::new("/project/src/app.ts"), "my-lib/styles.css");
        assert!(result.is_ok());
        assert!(result
            .unwrap()
            .to_string_lossy()
            .contains("node_modules/my-lib/styles.css"));
    }

    #[test]
    fn test_resolve_percent_decode_utf8() {
        let mut files = HashMap::new();
        // The percent-encoded UTF-8 path "r%C3%A9sum%C3%A9.css" correctly decodes to "résumé.css"
        files.insert(
            PathBuf::from("/project/src/app/résumé.css"),
            ".resume { color: black; }".to_string(),
        );
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "r%C3%A9sum%C3%A9.css",
        );
        assert_eq!(result, Ok(PathBuf::from("/project/src/app/résumé.css")));
    }

    #[test]
    fn test_resolve_percent_decode_malformed() {
        let mut files = HashMap::new();
        files.insert(
            PathBuf::from("/project/src/app/style%2.css"),
            "".to_string(),
        );
        files.insert(
            PathBuf::from("/project/src/app/style%2g.css"),
            "".to_string(),
        );
        files.insert(
            PathBuf::from("/project/src/app/style%zz.css"),
            "".to_string(),
        );
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        // %2 is malformed (only 1 character after %) -> should be left as-is
        let res1 = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "style%2.css",
        );
        assert_eq!(res1, Ok(PathBuf::from("/project/src/app/style%2.css")));

        // %2g has a non-hex char 'g' -> should be left as-is
        let res2 = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "style%2g.css",
        );
        assert_eq!(res2, Ok(PathBuf::from("/project/src/app/style%2g.css")));

        // %zz has non-hex chars -> should be left as-is
        let res3 = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "style%zz.css",
        );
        assert_eq!(res3, Ok(PathBuf::from("/project/src/app/style%zz.css")));
    }

    #[test]
    fn test_resolve_empty_path() {
        let fs = MockFs {
            root_dirs: Vec::new(),
            files: HashMap::new(),
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        // Resolving empty string path: should resolve to the parent directory of containing file (lenient fallback)
        let result =
            resource_resolver.resolve_resource(Path::new("/project/src/app/app.component.ts"), "");
        assert_eq!(result, Ok(PathBuf::from("/project/src/app/.")));
    }

    #[test]
    fn test_resolve_consecutive_slashes() {
        let mut files = HashMap::new();
        files.insert(PathBuf::from("/project/src/app/styles.css"), "".to_string());
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        // Trailing / consecutive slashes in relative paths
        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            ".//styles.css",
        );
        // Note: consecutive slashes in path segment: .//styles.css becomes ./styles.css during joins
        assert_eq!(result, Ok(PathBuf::from("/project/src/app/styles.css")));
    }

    #[test]
    fn test_resolve_rooted_traversal_escape() {
        let mut files = HashMap::new();
        files.insert(PathBuf::from("/outside.css"), "".to_string());
        let fs = MockFs {
            root_dirs: vec![PathBuf::from("/root1")],
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        // Rooted path with traversal escaping the root directory.
        // It now correctly resolves via oxc_resolver to "/outside.css" instead of falling back to the unnormalized path.
        let result = resource_resolver
            .resolve_resource(Path::new("/root1/app.component.ts"), "/../outside.css");
        assert_eq!(result, Ok(PathBuf::from("/outside.css")));
    }

    #[test]
    fn test_resolve_preprocessor_double_extension() {
        let mut files = HashMap::new();
        // File exists with double extension .scss.css
        files.insert(
            PathBuf::from("/project/src/app/styles.scss.css"),
            "".to_string(),
        );
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        // Resolving styles.scss.scss: extension is scss, so fallback with_extension("css") checks styles.scss.css!
        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            "./styles.scss.scss",
        );
        assert_eq!(
            result,
            Ok(PathBuf::from("/project/src/app/styles.scss.css"))
        );
    }

    #[test]
    fn test_resolve_extremely_long_path() {
        let mut files = HashMap::new();
        let mut long_name = String::new();
        for _ in 0..200 {
            long_name.push_str("very_long_path_segment_");
        }
        long_name.push_str(".css");

        let target_path = PathBuf::from(format!("/project/src/app/{}", long_name));
        files.insert(target_path.clone(), "".to_string());

        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );
        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        let result = resource_resolver.resolve_resource(
            Path::new("/project/src/app/app.component.ts"),
            &format!("./{}", long_name),
        );
        assert_eq!(result, Ok(target_path));
    }

    #[test]
    fn test_resolve_resource_concurrency() {
        use std::thread;

        let mut files = HashMap::new();
        files.insert(PathBuf::from("/project/src/app/styles.css"), "".to_string());
        let fs = MockFs {
            root_dirs: Vec::new(),
            files,
        };
        let resolver = ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions::default(),
        );

        let resource_resolver = ResourceResolver::new(&fs, &resolver);

        thread::scope(|s| {
            for _ in 0..10 {
                let resolver_ref = &resource_resolver;
                s.spawn(move || {
                    for _ in 0..100 {
                        let result = resolver_ref.resolve_resource(
                            Path::new("/project/src/app/app.component.ts"),
                            "./styles.css",
                        );
                        assert_eq!(result, Ok(PathBuf::from("/project/src/app/styles.css")));
                    }
                });
            }
        });
    }
}
