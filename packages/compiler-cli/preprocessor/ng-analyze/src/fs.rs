//! Virtual filesystem overlay that checks in-memory files first and falls back to
//! [`crate::physical_fs::PhysicalFs`].

use crate::perf::Counter;
use crate::physical_fs::{default_physical_fs, PhysicalFs};
use oxc_resolver::{FileMetadata, FileSystem, ResolveError};
use std::collections::{HashMap, HashSet};
use std::ffi::OsString;
use std::io::{Error, Result};
use std::path::{Path, PathBuf};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, RwLock,
};

struct SourceAllowlist {
    paths: HashSet<PathBuf>,
    canonical_file_names: HashSet<OsString>,
}

impl SourceAllowlist {
    fn build(
        files: HashSet<PathBuf>,
        cwd: &Path,
        physical: &dyn PhysicalFs,
        is_virtual: impl Fn(&Path) -> bool,
    ) -> Self {
        let mut paths = HashSet::new();
        let mut canonical_file_names = HashSet::new();
        for path in files {
            if let Some(name) = path.file_name() {
                canonical_file_names.insert(name.to_os_string());
            }
            let normalized = normalize_path(&path).into_owned();
            if let Some(name) = normalized.file_name() {
                canonical_file_names.insert(name.to_os_string());
            }
            paths.insert(path.clone());
            paths.insert(normalized);

            let abs = if is_absolute_path(&path) {
                None
            } else {
                let joined = cwd.join(&path);
                let joined_norm = normalize_path(&joined).into_owned();
                if let Some(name) = joined_norm.file_name() {
                    canonical_file_names.insert(name.to_os_string());
                }
                paths.insert(joined.clone());
                paths.insert(joined_norm);
                Some(joined)
            };

            let canon_target = abs.as_deref().unwrap_or(&path);
            if is_virtual(canon_target) || is_virtual(&path) {
                continue;
            }
            crate::perf::count(Counter::FsCanonicalizeCalls, 1);
            if let Ok(canon) = physical.canonicalize(canon_target) {
                let canon_normalized = normalize_path(&canon).into_owned();
                if let Some(name) = canon_normalized.file_name() {
                    canonical_file_names.insert(name.to_os_string());
                }
                paths.insert(canon);
                paths.insert(canon_normalized);
            }
        }
        Self {
            paths,
            canonical_file_names,
        }
    }

    /// Returns `(allowed, exists_on_disk)`.
    fn check_physical_candidate(
        &self,
        candidate: &Path,
        symlink_meta: Option<FileMetadata>,
        fs: &OverlayFileSystem,
    ) -> (bool, bool) {
        let meta = match symlink_meta {
            Some(m) => m,
            None => {
                crate::perf::count(Counter::FsStatCalls, 1);
                let Ok(m) = fs.physical.symlink_metadata(candidate) else {
                    return (false, false);
                };
                m
            }
        };
        if meta.is_dir() {
            return (true, true);
        }
        if !meta.is_symlink() {
            let name_matches = normalize_path(candidate)
                .file_name()
                .is_some_and(|n| self.canonical_file_names.contains(n));
            if !name_matches {
                return (false, true);
            }
        }
        crate::perf::count(Counter::FsCanonicalizeCalls, 1);
        let Ok(canon) = fs.physical.canonicalize(candidate) else {
            return (false, true);
        };
        if self.paths.contains(normalize_path(&canon).as_ref()) {
            return (true, true);
        }
        if meta.is_symlink() {
            crate::perf::count(Counter::FsStatCalls, 1);
            if fs.physical.metadata(&canon).is_ok_and(|m| m.is_dir()) {
                return (true, true);
            }
        }
        (false, true)
    }

    fn is_allowed_uncached(
        &self,
        path: &Path,
        symlink_meta: Option<FileMetadata>,
        fs: &OverlayFileSystem,
    ) -> bool {
        let norm_path = normalize_path(path);
        if self.paths.contains(norm_path.as_ref()) {
            return true;
        }

        let (abs_path, abs_meta) = if is_absolute_path(path) {
            (std::borrow::Cow::Borrowed(path), symlink_meta)
        } else {
            let abs = fs.cwd.join(path);
            if self.paths.contains(normalize_path(&abs).as_ref()) {
                return true;
            }
            (std::borrow::Cow::Owned(abs), None)
        };

        let (direct_allowed, phys_exists) = self.check_physical_candidate(&abs_path, abs_meta, fs);
        if direct_allowed {
            return true;
        }

        let root_dirs = fs.root_dirs.read().unwrap();
        if root_dirs.len() <= 1 {
            return false;
        }
        let abs_exists =
            phys_exists || (fs.has_virtual_files() && fs.get_virtual_entry(&abs_path).is_some());
        let normalized_abs = normalize_path(&abs_path);
        for root in root_dirs.iter() {
            let Some(rel_path) = strip_root_dir_prefix(&normalized_abs, root) else {
                continue;
            };
            for target_root in root_dirs.iter() {
                if target_root == root {
                    continue;
                }
                let candidate = target_root.join(rel_path);
                let candidate_norm = normalize_path(&candidate);
                if (self.paths.contains(candidate_norm.as_ref())
                    && (abs_exists || fs.exists_raw(&candidate)))
                    || self.check_physical_candidate(&candidate, None, fs).0
                {
                    return true;
                }
            }
            break;
        }
        false
    }
}

fn strip_root_dir_prefix<'a>(normalized_path: &'a Path, root: &Path) -> Option<&'a Path> {
    if let Ok(rel) = normalized_path.strip_prefix(root) {
        return Some(rel);
    }
    if let Ok(rel) = normalized_path.strip_prefix(root.strip_prefix("/").unwrap_or(root)) {
        return Some(rel);
    }
    normalized_path.strip_prefix(Path::new("/").join(root)).ok()
}

/// Virtual file entry containing content and metadata
#[derive(Clone, Debug)]
pub struct VirtualFile {
    pub content: Arc<str>,
    pub is_dir: bool,
    pub path: PathBuf,
}

/// Overlay filesystem: checks virtual files first, falls back to real FS.
///
/// This enables testing the analyzer with in-memory files while still
/// being able to resolve packages from real node_modules.
pub struct OverlayFileSystem {
    /// Virtual files: normalized path -> VirtualFile (wrapped in Arc for cloning)
    virtual_files: Arc<RwLock<HashMap<PathBuf, VirtualFile>>>,
    /// Fast path check: true if any virtual files have been added
    has_virtual_files: Arc<AtomicBool>,
    /// Configured rootDirs for virtual merging
    root_dirs: Arc<RwLock<Vec<PathBuf>>>,
    /// Cached current working directory to avoid repeated OS syscalls during hot lookups
    cwd: Arc<PathBuf>,
    pub preserve_symlinks: Arc<AtomicBool>,
    /// Optional set of allowed source files for build-system boundaries
    allowed_sources: Arc<RwLock<Option<SourceAllowlist>>>,
    /// Cache for is_allowed results to avoid repeated canonicalization and normalization.
    is_allowed_cache: Arc<RwLock<HashMap<PathBuf, bool>>>,
    /// The non-virtual filesystem underneath this overlay.
    physical: Arc<dyn PhysicalFs>,
    #[cfg(test)]
    pub delays: Arc<RwLock<HashMap<PathBuf, u64>>>,
}

impl Clone for OverlayFileSystem {
    fn clone(&self) -> Self {
        Self {
            virtual_files: Arc::clone(&self.virtual_files),
            has_virtual_files: Arc::clone(&self.has_virtual_files),
            root_dirs: Arc::clone(&self.root_dirs),
            cwd: Arc::clone(&self.cwd),
            preserve_symlinks: Arc::clone(&self.preserve_symlinks),
            allowed_sources: Arc::clone(&self.allowed_sources),
            is_allowed_cache: Arc::clone(&self.is_allowed_cache),
            physical: Arc::clone(&self.physical),
            #[cfg(test)]
            delays: Arc::clone(&self.delays),
        }
    }
}

/// Helper to convert a PathBuf to a String without allocating if it is valid UTF-8.
pub fn path_to_string(path: PathBuf) -> String {
    path.into_os_string()
        .into_string()
        .unwrap_or_else(|os_str| os_str.to_string_lossy().into_owned())
}

/// Whether `path` is absolute. `Path::is_absolute` is always `false` on `wasm32-unknown-unknown`,
/// which has no platform path rules, so a rooted path (`/a/b`) counts as absolute there.
pub fn is_absolute_path(path: &Path) -> bool {
    path.is_absolute() || (cfg!(target_arch = "wasm32") && path.has_root())
}

/// Normalize a path for lookup (resolve . and .., remove trailing slashes)
///
/// Performs case-folding on case-insensitive platforms (Windows/macOS) to match real FS behavior.
pub fn normalize_path<'a>(path: &'a Path) -> std::borrow::Cow<'a, Path> {
    let normalized = normalize_path_structural(path);

    let needs_case_fold = cfg!(any(target_os = "windows", target_os = "macos"))
        && normalized
            .to_str()
            .map(|s| s.chars().any(|c| c.is_uppercase()))
            .unwrap_or(true);

    if !needs_case_fold {
        return normalized;
    }

    let path_str = normalized.to_string_lossy().to_lowercase();
    std::borrow::Cow::Owned(PathBuf::from(path_str))
}

pub fn normalize_path_structural<'a>(path: &'a Path) -> std::borrow::Cow<'a, Path> {
    // Fast path: check if normalization is needed
    let has_trailing_slash = path
        .as_os_str()
        .to_str()
        .map(|s| s.ends_with('/') || s.ends_with('\\'))
        .unwrap_or(true);

    let path_str = path.to_str().unwrap_or("");
    let needs_normalization = has_trailing_slash
        || path_str.contains("/./")
        || path_str.contains("\\.\\")
        || path_str.starts_with("./")
        || path_str.starts_with("../")
        || path_str.starts_with(".\\")
        || path_str.starts_with("..\\")
        || path_str.ends_with("/.")
        || path_str.ends_with("\\.")
        || path.components().any(|c| {
            matches!(
                c,
                std::path::Component::ParentDir | std::path::Component::CurDir
            )
        });

    if !needs_normalization {
        return std::borrow::Cow::Borrowed(path);
    }

    let mut result = PathBuf::new();
    for component in path.components() {
        match component {
            std::path::Component::ParentDir => {
                result.pop();
            }
            std::path::Component::CurDir => {}
            other => {
                result.push(other);
            }
        }
    }
    std::borrow::Cow::Owned(result)
}

impl OverlayFileSystem {
    /// Create a new overlay filesystem.
    pub fn new_with_overlay() -> Self {
        Self::new_with_allowed_sources(None)
    }

    /// Create a new overlay filesystem with allowed sources filter.
    pub fn new_with_allowed_sources(allowed_sources: Option<HashSet<PathBuf>>) -> Self {
        Self::new_with_allowed_sources_and_fs(allowed_sources, Arc::new(default_physical_fs()))
    }

    /// As [`Self::new_with_allowed_sources`], but over an explicit physical filesystem.
    /// Tests use this to inject a mock; the wasm build uses it to reach the JS host.
    pub fn new_with_allowed_sources_and_fs(
        allowed_sources: Option<HashSet<PathBuf>>,
        physical: Arc<dyn PhysicalFs>,
    ) -> Self {
        let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let allowed = allowed_sources
            .map(|files| SourceAllowlist::build(files, &cwd, physical.as_ref(), |_| false));
        Self {
            physical,
            virtual_files: Arc::new(RwLock::new(HashMap::new())),
            has_virtual_files: Arc::new(AtomicBool::new(false)),
            root_dirs: Arc::new(RwLock::new(Vec::new())),
            cwd: Arc::new(cwd),
            preserve_symlinks: Arc::new(AtomicBool::new(false)),
            allowed_sources: Arc::new(RwLock::new(allowed)),
            is_allowed_cache: Arc::new(RwLock::new(HashMap::new())),
            #[cfg(test)]
            delays: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    #[cfg(test)]
    pub fn set_delay(&self, path: PathBuf, delay_ms: u64) {
        self.delays.write().unwrap().insert(path, delay_ms);
    }

    pub fn has_virtual_files(&self) -> bool {
        self.has_virtual_files.load(Ordering::Relaxed)
    }

    pub fn has_allowed_sources(&self) -> bool {
        self.allowed_sources.read().unwrap().is_some()
    }

    pub fn clear_allowed_cache(&self) {
        if self.has_allowed_sources() {
            self.is_allowed_cache.write().unwrap().clear();
        }
    }

    pub fn set_allowed_sources(&self, allowed_sources: Option<HashSet<PathBuf>>) {
        let allowlist = allowed_sources.map(|files| {
            SourceAllowlist::build(files, &self.cwd, self.physical.as_ref(), |p| {
                self.get_virtual_entry(p).is_some()
            })
        });
        *self.allowed_sources.write().unwrap() = allowlist;
        self.is_allowed_cache.write().unwrap().clear();
    }

    pub fn set_root_dirs(&self, root_dirs: Vec<PathBuf>) {
        let mut seen = HashSet::new();
        let mut normalized: Vec<PathBuf> = root_dirs
            .into_iter()
            .map(|p| normalize_path(&p).into_owned())
            .filter(|p| seen.insert(p.clone()))
            .collect();
        // Sort by path length in descending order (longest first) for robust prefix matching;
        // `sort_by_key` is stable so equal-length entries preserve `tsconfig.json` priority.
        // https://github.com/angular/angular/blob/b53fa3c/packages/compiler-cli/src/ngtsc/file_system/src/logical.ts#L70
        normalized.sort_by_key(|p| std::cmp::Reverse(p.as_os_str().len()));
        let mut dirs = self.root_dirs.write().unwrap();
        if *dirs != normalized {
            *dirs = normalized;
            drop(dirs);
            self.clear_allowed_cache();
        }
    }

    pub fn set_preserve_symlinks(&self, value: bool) {
        self.preserve_symlinks.store(value, Ordering::Relaxed);
    }

    /// The physical filesystem underneath this overlay.
    pub fn physical(&self) -> &Arc<dyn PhysicalFs> {
        &self.physical
    }

    fn exists_raw(&self, path: &Path) -> bool {
        if self.has_virtual_files.load(Ordering::Relaxed) {
            let files = self.virtual_files.read().unwrap();
            if self.get_virtual_file(path, &files).is_some() {
                return true;
            }
        }
        crate::perf::count(Counter::FsStatCalls, 1);
        self.physical.exists(path)
    }

    /// Attempt to resolve a file across configured `rootDirs`.
    /// Matches only the longest `rootDirs` prefix (matching TypeScript's
    /// `tryLoadModuleUsingRootDirs` and `ngtsc`'s `LogicalFileSystem`) and checks the remaining
    /// `rootDirs` for an existing virtual or physical file.
    pub fn resolve_across_root_dirs(&self, path: &Path) -> Option<PathBuf> {
        let root_dirs = self.root_dirs.read().unwrap();
        if root_dirs.len() <= 1 {
            return None;
        }

        let abs_path = if is_absolute_path(path) {
            std::borrow::Cow::Borrowed(path)
        } else {
            std::borrow::Cow::Owned(self.cwd.join(path))
        };
        let normalized_path = normalize_path(&abs_path);

        for root in root_dirs.iter() {
            let Some(rel_path) = strip_root_dir_prefix(&normalized_path, root) else {
                continue;
            };
            for target_root in root_dirs.iter() {
                if target_root == root {
                    continue;
                }
                let candidate = target_root.join(rel_path);
                if self.exists_raw(&candidate) {
                    return Some(candidate);
                }
            }
            break;
        }
        None
    }

    /// Remove a virtual file from the overlay
    pub fn remove_virtual_file(&self, path: &std::path::Path) {
        if !self.has_virtual_files.load(Ordering::Relaxed) {
            return;
        }
        let normalized = normalize_path(path);
        let removed = self
            .virtual_files
            .write()
            .unwrap()
            .remove(normalized.as_ref())
            .is_some();
        if removed {
            self.clear_allowed_cache();
        }
    }

    /// Check if a physical path is allowed by the allowed_sources filter
    pub fn is_allowed(&self, path: &Path) -> bool {
        self.is_allowed_with_meta(path, None)
    }

    fn is_allowed_with_meta(&self, path: &Path, symlink_meta: Option<FileMetadata>) -> bool {
        let check_allowed =
            crate::utils::is_ts_source(path) || path.extension().is_some_and(|e| e == "js");
        if !check_allowed {
            return true;
        }

        let allowed_guard = self.allowed_sources.read().unwrap();
        let Some(allowlist) = allowed_guard.as_ref() else {
            return true;
        };

        if let Some(&cached) = self.is_allowed_cache.read().unwrap().get(path) {
            crate::perf::count(Counter::IsAllowedCacheHits, 1);
            return cached;
        }

        crate::perf::count(Counter::IsAllowedCacheMisses, 1);
        let allowed = allowlist.is_allowed_uncached(path, symlink_meta, self);
        drop(allowed_guard);

        self.is_allowed_cache
            .write()
            .unwrap()
            .insert(path.to_path_buf(), allowed);
        allowed
    }

    /// Add or update a virtual file with the given content
    pub fn upsert_file(&self, path: PathBuf, content: String) {
        self.has_virtual_files.store(true, Ordering::Relaxed);
        let spelled = normalize_path_structural(&path).into_owned();
        let normalized = normalize_path(&spelled).into_owned();
        let is_new_file = {
            let mut files = self.virtual_files.write().unwrap();

            // Ensure parent directories exist as virtual dirs
            for dir in spelled.ancestors().skip(1) {
                let key = normalize_path(dir).into_owned();
                files.entry(key).or_insert_with(|| VirtualFile {
                    content: "".into(),
                    is_dir: true,
                    path: dir.to_path_buf(),
                });
            }

            // Add the file itself
            let old_file = files.insert(
                normalized,
                VirtualFile {
                    content: content.into(),
                    is_dir: false,
                    path: spelled,
                },
            );
            old_file.map_or(true, |vf| vf.is_dir)
        };

        // Only invalidate the cache if a new file was actually added.
        // Modifying an existing file does not change its allowed status.
        if is_new_file {
            self.clear_allowed_cache();
        }
    }

    /// Check if a path is in the virtual filesystem
    #[cfg(test)]
    fn is_virtual(&self, path: &Path) -> bool {
        let normalized = normalize_path(path);
        self.virtual_files
            .read()
            .unwrap()
            .contains_key(&*normalized)
    }

    /// Get a virtual file by path, checking raw path first then normalized path if needed.
    fn get_virtual_file<'a>(
        &'a self,
        path: &Path,
        files: &'a HashMap<PathBuf, VirtualFile>,
    ) -> Option<&'a VirtualFile> {
        if let Some(vf) = files.get(path) {
            return Some(vf);
        }
        let normalized = normalize_path(path);
        if let Some(vf) = files.get(&*normalized) {
            return Some(vf);
        }
        let clean_path = path
            .strip_prefix("/")
            .unwrap_or_else(|_| path.strip_prefix(".").unwrap_or(path));
        if let Some((_, vf)) = files.iter().find(|(k, _)| {
            let clean_k = k
                .strip_prefix("/")
                .unwrap_or_else(|_| k.strip_prefix(".").unwrap_or(k));
            clean_k == clean_path
        }) {
            return Some(vf);
        }
        None
    }

    /// Retrieve a cloned VirtualFile entry if virtual files are enabled.
    fn get_virtual_entry(&self, path: &Path) -> Option<VirtualFile> {
        if !self.has_virtual_files.load(Ordering::Relaxed) {
            return None;
        }
        let files = self.virtual_files.read().unwrap();
        let res = self.get_virtual_file(path, &files).cloned();
        if res.is_some() {
            crate::perf::count(Counter::VirtualFileHits, 1);
        }
        res
    }

    /// Iterate over all virtual file paths, as the caller spelled them.
    pub fn for_each_virtual_path<F>(&self, mut f: F)
    where
        F: FnMut(&PathBuf),
    {
        let map = self.virtual_files.read().unwrap();
        for vf in map.values() {
            f(&vf.path);
        }
    }
}

impl crate::resource_loader::ResourceResolverFs for OverlayFileSystem {
    fn root_dirs(&self) -> Vec<PathBuf> {
        self.root_dirs.read().unwrap().clone()
    }

    fn resolve_root_dirs_backing_path(&self, path: &Path) -> Option<PathBuf> {
        if self.root_dirs.read().unwrap().len() <= 1 || self.exists_raw(path) {
            return None;
        }
        let resolved = self.resolve_across_root_dirs(path)?;
        // Prefer the virtual file's own spelling over the case-folded lookup key.
        Some(match self.get_virtual_entry(&resolved) {
            Some(vf) => vf.path,
            None => resolved,
        })
    }
}

impl FileSystem for OverlayFileSystem {
    fn new() -> Self {
        // Default constructor for the trait - creates empty overlay
        Self {
            physical: Arc::new(default_physical_fs()),
            virtual_files: Arc::new(RwLock::new(HashMap::new())),
            has_virtual_files: Arc::new(AtomicBool::new(false)),
            root_dirs: Arc::new(RwLock::new(Vec::new())),
            cwd: Arc::new(std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))),
            preserve_symlinks: Arc::new(AtomicBool::new(false)),
            allowed_sources: Arc::new(RwLock::new(None)),
            is_allowed_cache: Arc::new(RwLock::new(HashMap::new())),
            #[cfg(test)]
            delays: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    fn read(&self, path: &Path) -> Result<Vec<u8>> {
        #[cfg(test)]
        {
            if let Some(&delay) = self.delays.read().unwrap().get(path) {
                std::thread::sleep(std::time::Duration::from_millis(delay));
            }
        }

        if let Some(vf) = self.get_virtual_entry(path) {
            if vf.is_dir {
                return Err(Error::other("Is a directory"));
            }
            return Ok(vf.content.as_bytes().to_vec());
        }

        if self.is_allowed(path) {
            if let Ok(content) = self.physical.read(path) {
                count_read(content.len());
                return Ok(content);
            }
        }

        // If direct lookup fails on both virtual and physical FS, check across rootDirs virtual merging
        if let Some(resolved) = self.resolve_across_root_dirs(path) {
            if let Some(vf) = self.get_virtual_entry(&resolved) {
                if vf.is_dir {
                    return Err(Error::other("Is a directory"));
                }
                return Ok(vf.content.as_bytes().to_vec());
            }
            if self.is_allowed(&resolved) {
                let res = self.physical.read(&resolved);
                if let Ok(content) = &res {
                    count_read(content.len());
                }
                return res;
            }
        }

        Err(Error::from(std::io::ErrorKind::NotFound))
    }

    fn read_to_string(&self, path: &Path) -> Result<String> {
        #[cfg(test)]
        {
            if let Some(&delay) = self.delays.read().unwrap().get(path) {
                std::thread::sleep(std::time::Duration::from_millis(delay));
            }
        }

        if let Some(vf) = self.get_virtual_entry(path) {
            if vf.is_dir {
                return Err(Error::other("Is a directory"));
            }
            return Ok(vf.content.to_string());
        }

        if self.is_allowed(path) {
            if let Ok(content) = self.physical.read_to_string(path) {
                count_read(content.len());
                return Ok(content);
            }
        }

        // If direct lookup fails on both virtual and physical FS, check across rootDirs virtual merging
        if let Some(resolved) = self.resolve_across_root_dirs(path) {
            if let Some(vf) = self.get_virtual_entry(&resolved) {
                if vf.is_dir {
                    return Err(Error::other("Is a directory"));
                }
                return Ok(vf.content.to_string());
            }
            if self.is_allowed(&resolved) {
                let res = self.physical.read_to_string(&resolved);
                if let Ok(content) = &res {
                    count_read(content.len());
                }
                return res;
            }
        }

        Err(Error::from(std::io::ErrorKind::NotFound))
    }

    fn metadata(&self, path: &Path) -> Result<FileMetadata> {
        if let Some(vf) = self.get_virtual_entry(path) {
            return Ok(FileMetadata::new(!vf.is_dir, vf.is_dir, false));
        }

        crate::perf::count(Counter::FsStatCalls, 1);
        if let Ok(m) = self.physical.metadata(path) {
            if m.is_dir() || self.is_allowed(path) {
                return Ok(FileMetadata::new(m.is_file(), m.is_dir(), m.is_symlink()));
            }
        }

        // If direct lookup fails on both virtual and physical FS, check across rootDirs virtual merging
        if let Some(resolved) = self.resolve_across_root_dirs(path) {
            if let Some(vf) = self.get_virtual_entry(&resolved) {
                return Ok(FileMetadata::new(!vf.is_dir, vf.is_dir, false));
            }
            crate::perf::count(Counter::FsStatCalls, 1);
            if let Ok(m) = self.physical.metadata(&resolved) {
                if m.is_dir() || self.is_allowed(&resolved) {
                    return Ok(FileMetadata::new(m.is_file(), m.is_dir(), m.is_symlink()));
                }
            }
        }

        Err(Error::from(std::io::ErrorKind::NotFound))
    }

    fn symlink_metadata(&self, path: &Path) -> Result<FileMetadata> {
        // Fast path: check virtual files first (virtual files are never symlinks)
        if let Some(vf) = self.get_virtual_entry(path) {
            return Ok(FileMetadata::new(!vf.is_dir, vf.is_dir, false));
        }

        crate::perf::count(Counter::FsStatCalls, 1);
        if let Ok(m) = self.physical.symlink_metadata(path) {
            if m.is_dir() || self.is_allowed_with_meta(path, Some(m)) {
                return Ok(FileMetadata::new(m.is_file(), m.is_dir(), m.is_symlink()));
            }
        }

        // If direct lookup fails on both virtual and physical FS, check across rootDirs virtual merging
        if let Some(resolved) = self.resolve_across_root_dirs(path) {
            if let Some(vf) = self.get_virtual_entry(&resolved) {
                return Ok(FileMetadata::new(!vf.is_dir, vf.is_dir, false));
            }
            crate::perf::count(Counter::FsStatCalls, 1);
            if let Ok(m) = self.physical.symlink_metadata(&resolved) {
                if m.is_dir() || self.is_allowed_with_meta(&resolved, Some(m)) {
                    return Ok(FileMetadata::new(m.is_file(), m.is_dir(), m.is_symlink()));
                }
            }
        }

        Err(Error::from(std::io::ErrorKind::NotFound))
    }

    fn read_link(&self, path: &Path) -> std::result::Result<PathBuf, ResolveError> {
        // Virtual filesystem doesn't support symlinks; if a virtual file exists here, it's not a symlink.
        let not_found = || ResolveError::NotFound(path.to_string_lossy().into_owned());
        if self.get_virtual_entry(path).is_some() || !self.is_allowed(path) {
            return Err(not_found());
        }

        self.physical.read_link(path).map_err(|_| not_found())
    }

    fn canonicalize(&self, path: &Path) -> Result<PathBuf> {
        // For virtual files, canonicalize purely by path normalization.
        if self.get_virtual_entry(path).is_some() {
            let normalized = normalize_path_structural(path);
            return Ok(normalized.into_owned());
        }

        if self.preserve_symlinks.load(Ordering::Relaxed) {
            let abs_path = if is_absolute_path(path) {
                path.to_path_buf()
            } else {
                self.cwd.join(path)
            };
            crate::perf::count(Counter::FsStatCalls, 1);
            if self.physical.exists(&abs_path) {
                return Ok(normalize_path_structural(&abs_path).into_owned());
            }
        } else {
            crate::perf::count(Counter::FsCanonicalizeCalls, 1);
            match self.physical.canonicalize(path) {
                Ok(canon) => return Ok(canon),
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
                Err(e) => return Err(e),
            }
        }

        // If direct lookup fails, attempt to canonicalize candidate path resolved across rootDirs.
        if let Some(resolved) = self.resolve_across_root_dirs(path) {
            if self.preserve_symlinks.load(Ordering::Relaxed) {
                return Ok(normalize_path_structural(&resolved).into_owned());
            }
            if self.get_virtual_entry(&resolved).is_some() {
                return Ok(normalize_path_structural(&resolved).into_owned());
            }
            crate::perf::count(Counter::FsCanonicalizeCalls, 1);
            return Ok(self.physical.canonicalize(&resolved).unwrap_or(resolved));
        }

        Err(Error::from(std::io::ErrorKind::NotFound))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_virtual_file_read() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(
            PathBuf::from("/test/src/app.ts"),
            "console.log('hello');".to_string(),
        );

        let content = fs.read_to_string(Path::new("/test/src/app.ts")).unwrap();
        assert_eq!(content, "console.log('hello');");
    }

    #[test]
    fn test_virtual_file_metadata() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/test/src/app.ts"), "".to_string());

        let meta = fs.metadata(Path::new("/test/src/app.ts")).unwrap();
        assert!(meta.is_file());
        assert!(!meta.is_dir());
    }

    #[test]
    fn test_virtual_directory_created() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/test/src/deep/app.ts"), "".to_string());

        let meta = fs.metadata(Path::new("/test/src")).unwrap();
        assert!(meta.is_dir());
        assert!(!meta.is_file());
    }

    #[test]
    fn test_read_directory_error() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/test/src/app.ts"), "".to_string());

        // Attempt to read a directory (which was implicitly created)
        let result = fs.read(Path::new("/test"));
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "Is a directory");
    }

    #[test]
    fn test_path_normalization() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/test/src/app.ts"), "content".to_string());

        // Should resolve ../src/app.ts from /test/foo
        let content = fs
            .read_to_string(Path::new("/test/foo/../src/app.ts"))
            .unwrap();
        assert_eq!(content, "content");
    }

    #[test]
    fn test_canonicalize_virtual() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/test/src/app.ts"), "".to_string());

        let canonical = fs
            .canonicalize(Path::new("/test/foo/../src/app.ts"))
            .unwrap();
        assert_eq!(canonical, PathBuf::from("/test/src/app.ts"));
    }

    #[test]
    fn test_read_link_virtual() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/test/src/app.ts"), "".to_string());

        // read_link should return NotFound for virtual files
        let result = fs.read_link(Path::new("/test/src/app.ts"));
        assert!(result.is_err());
        match result {
            Err(ResolveError::NotFound(path)) => assert!(path.contains("app.ts")),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[test]
    fn test_not_found_error() {
        let fs = OverlayFileSystem::new_with_overlay();

        let result = fs.read_to_string(Path::new("/test/nonexistent.ts"));
        assert!(result.is_err());
    }

    #[test]
    fn test_fallback_to_real_fs() {
        let fs = OverlayFileSystem::new_with_overlay();
        let mut temp_file = tempfile::NamedTempFile::new().unwrap();
        use std::io::Write;
        writeln!(temp_file, "package test;").unwrap();
        let real_path = std::fs::canonicalize(temp_file.path()).unwrap();

        // Should NOT be in virtual files
        assert!(!fs.is_virtual(&real_path));

        // But we should be able to read it
        let result = fs.read_to_string(&real_path);
        assert!(result.is_ok());
        let content = result.unwrap();
        assert!(content.contains("package"));
    }

    #[test]
    fn test_virtual_shadowing() {
        let fs = OverlayFileSystem::new_with_overlay();
        let mut temp_file = tempfile::NamedTempFile::new().unwrap();
        use std::io::Write;
        writeln!(temp_file, "real content").unwrap();
        let real_path = std::fs::canonicalize(temp_file.path()).unwrap();

        // Add a virtual file shadowing the real file
        fs.upsert_file(real_path.clone(), "virtual content".to_string());

        // Now it should be virtual
        assert!(fs.is_virtual(&real_path));

        // Reading it should return virtual content
        let content = fs.read_to_string(&real_path).unwrap();
        assert_eq!(content, "virtual content");
    }

    #[test]
    fn test_case_sensitivity_virtual() {
        let fs = OverlayFileSystem::new_with_overlay();
        let path1 = PathBuf::from("/test/file.ts");
        let path2 = PathBuf::from("/TEST/file.ts");

        fs.upsert_file(path1.clone(), "content1".to_string());

        if cfg!(any(target_os = "windows", target_os = "macos")) {
            // They should be treated as the same file
            assert_eq!(fs.read_to_string(&path2).unwrap(), "content1");

            // Adding with other casing should overwrite
            fs.upsert_file(path2.clone(), "content2".to_string());
            assert_eq!(fs.read_to_string(&path1).unwrap(), "content2");
        } else {
            // On case-sensitive platforms, they should be distinct
            fs.upsert_file(path2.clone(), "content2".to_string());
            assert_eq!(fs.read_to_string(&path1).unwrap(), "content1");
            assert_eq!(fs.read_to_string(&path2).unwrap(), "content2");
        }
    }

    #[test]
    fn test_virtual_paths_enumerate_as_spelled() {
        let fs = OverlayFileSystem::new_with_overlay();
        fs.upsert_file(PathBuf::from("/Users/Dev/Proj/src/App.ts"), "".to_string());

        let mut paths = Vec::new();
        fs.for_each_virtual_path(|p| paths.push(p.clone()));
        assert!(paths.contains(&PathBuf::from("/Users/Dev/Proj/src/App.ts")));
        assert!(paths.contains(&PathBuf::from("/Users/Dev/Proj/src")));
        // None of the entries may come back lowercased.
        assert!(paths.iter().all(|p| {
            let s = p.to_string_lossy();
            s == "/" || s != s.to_lowercase()
        }));

        if cfg!(any(target_os = "windows", target_os = "macos")) {
            assert!(fs.is_virtual(Path::new("/users/dev/proj/src/app.ts")));
        }
    }

    #[test]
    fn test_resolve_fallback_to_real_fs() {
        let fs = OverlayFileSystem::new_with_overlay();

        let temp_dir = tempfile::tempdir().unwrap();
        let real_file_path = temp_dir.path().join("real_file.ts");
        std::fs::write(&real_file_path, "export const x = 1;").unwrap();
        let real_path = std::fs::canonicalize(&real_file_path).unwrap();
        let project_root = real_path.parent().unwrap();

        // Add a virtual file in the same directory
        fs.upsert_file(project_root.join("virtual.ts"), "".to_string());

        // Create a resolver using the overlay FS
        let resolver = oxc_resolver::ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions {
                extensions: vec![".ts".into(), ".js".into()],
                ..oxc_resolver::ResolveOptions::default()
            },
        );

        // Resolve "./real_file.ts" from project_root
        // The resolver will check virtual files first (via fs), then fall back to real FS.
        let result = resolver.resolve(project_root, "./real_file");
        assert!(result.is_ok());
        let resolution = result.unwrap();
        assert_eq!(resolution.path(), real_path);

        // Also verify that the virtual file itself can be resolved!
        let result = resolver.resolve(project_root, "./virtual.ts");
        assert!(result.is_ok());
        let resolution = result.unwrap();
        assert_eq!(resolution.path(), project_root.join("virtual.ts"));
    }

    #[test]
    fn test_resolve_virtual_cross_directory() {
        let fs = OverlayFileSystem::new_with_overlay();

        // Add files in different directories
        fs.upsert_file(
            PathBuf::from("/app/src/main.ts"),
            "import '../common/util';".to_string(),
        );
        fs.upsert_file(PathBuf::from("/app/common/util.ts"), "".to_string());

        let resolver = oxc_resolver::ResolverGeneric::new_with_file_system(
            fs.clone(),
            oxc_resolver::ResolveOptions {
                extensions: vec![".ts".into()],
                ..oxc_resolver::ResolveOptions::default()
            },
        );

        // Resolve "../common/util" from "/app/src"
        let result = resolver.resolve(Path::new("/app/src"), "../common/util");
        assert!(result.is_ok());
        let resolution = result.unwrap();
        assert_eq!(resolution.path(), PathBuf::from("/app/common/util.ts"));
    }

    #[test]
    fn test_root_dirs_sorting_longest_first() {
        let fs = OverlayFileSystem::new_with_overlay();
        let p1 = PathBuf::from("/project/src");
        let p2 = PathBuf::from("/project/src/extra/deep");
        let p3 = PathBuf::from("/project/src/extra");
        fs.set_root_dirs(vec![p1.clone(), p2.clone(), p3.clone()]);

        let dirs = fs.root_dirs.read().unwrap();
        assert_eq!(dirs.len(), 3);
        // Longest first: p2, p3, p1
        assert_eq!(dirs[0], normalize_path(&p2).into_owned());
        assert_eq!(dirs[1], normalize_path(&p3).into_owned());
        assert_eq!(dirs[2], normalize_path(&p1).into_owned());
    }

    #[test]
    fn test_root_dirs_priority() {
        use std::io::Write;
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let root_src = dir.path().join("src");
        let root_extra = dir.path().join("extra");
        std::fs::create_dir(&root_src).unwrap();
        std::fs::create_dir(&root_extra).unwrap();

        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_root_dirs(vec![root_src.clone(), root_extra.clone()]);

        let direct_path = root_src.join("app.html");
        let extra_path = root_extra.join("app.html");

        // 1. Create physical file at extra_path
        let mut phys_file = std::fs::File::create(&extra_path).unwrap();
        write!(phys_file, "physical extra").unwrap();
        drop(phys_file);

        // Now, reading direct_path should resolve across rootDirs to extra_path and return physical content
        assert_eq!(fs.read_to_string(&direct_path).unwrap(), "physical extra");

        // 2. Add virtual file at extra_path shadowing the physical file
        fs.upsert_file(extra_path.clone(), "virtual extra".to_string());

        // Reading direct_path should now return virtual extra content (virtual > physical across rootDirs)
        assert_eq!(fs.read_to_string(&direct_path).unwrap(), "virtual extra");

        // 3. Add virtual file directly at direct_path
        fs.upsert_file(direct_path.clone(), "virtual direct".to_string());

        // Reading direct_path should now return virtual direct content (direct > resolved across rootDirs)
        assert_eq!(fs.read_to_string(&direct_path).unwrap(), "virtual direct");
    }

    #[test]
    fn test_canonicalize_root_dirs_priority() {
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let root_src = dir.path().join("src");
        let root_extra = dir.path().join("extra");
        std::fs::create_dir(&root_src).unwrap();
        std::fs::create_dir(&root_extra).unwrap();

        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_root_dirs(vec![root_src.clone(), root_extra.clone()]);

        let direct_path = root_src.join("app.html");
        let extra_path = root_extra.join("app.html");

        std::fs::write(&direct_path, "direct").unwrap();
        std::fs::write(&extra_path, "extra").unwrap();

        // Should return the direct path, not the extra path
        let canon = fs.canonicalize(&direct_path).unwrap();
        assert_eq!(canon, std::fs::canonicalize(&direct_path).unwrap());
    }

    #[cfg(unix)]
    #[test]
    fn test_canonicalize_preserve_symlinks() {
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let target_dir = dir.path().join("target");
        std::fs::create_dir(&target_dir).unwrap();
        let target_file = target_dir.join("file.ts");
        std::fs::write(&target_file, "content").unwrap();

        let link_dir = dir.path().join("link");
        std::os::unix::fs::symlink(&target_dir, &link_dir).unwrap();
        let link_file = link_dir.join("file.ts");

        // 1. With preserve_symlinks = true
        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_preserve_symlinks(true);

        let canonical = fs.canonicalize(&link_file).unwrap();
        assert_eq!(
            canonical,
            normalize_path_structural(&link_file).into_owned()
        );
        assert_ne!(
            canonical,
            normalize_path_structural(&target_file).into_owned()
        );

        // 2. With preserve_symlinks = false
        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_preserve_symlinks(false);

        let canonical = fs.canonicalize(&link_file).unwrap();
        assert_eq!(canonical, std::fs::canonicalize(&target_file).unwrap());

        // 3. Resolve across rootDirs with preserve_symlinks = true
        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_preserve_symlinks(true);

        let root_src = dir.path().join("src");
        let root_extra = dir.path().join("extra");
        std::fs::create_dir(&root_src).unwrap();
        std::fs::create_dir(&root_extra).unwrap();
        fs.set_root_dirs(vec![root_src.clone(), root_extra.clone()]);

        let extra_link_file = root_extra.join("app.ts");
        std::os::unix::fs::symlink(&target_file, &extra_link_file).unwrap();

        let direct_path = root_src.join("app.ts");

        let canonical = fs.canonicalize(&direct_path).unwrap();
        assert_eq!(
            normalize_path(&canonical).into_owned(),
            normalize_path(&extra_link_file).into_owned()
        );

        // 4. Resolve across rootDirs with preserve_symlinks = false
        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_preserve_symlinks(false);
        fs.set_root_dirs(vec![root_src.clone(), root_extra.clone()]);

        let canonical = fs.canonicalize(&direct_path).unwrap();
        assert_eq!(canonical, std::fs::canonicalize(&target_file).unwrap());
    }

    #[test]
    fn test_allowed_sources_filter() {
        let mut allowed = HashSet::new();
        allowed.insert(PathBuf::from("/project/allowed.ts"));

        let fs = OverlayFileSystem::new_with_allowed_sources(Some(allowed));

        // Allowed TS file
        assert!(fs.is_allowed(Path::new("/project/allowed.ts")));

        // Blocked TS file
        assert!(!fs.is_allowed(Path::new("/project/blocked.ts")));

        // Blocked .d.ts file (should be allowed automatically, not in allowed list)
        assert!(fs.is_allowed(Path::new("/project/blocked.d.ts")));
        assert!(fs.is_allowed(Path::new("/project/allowed.d.ts")));

        // JSON file (should be allowed automatically, not in allowed list)
        assert!(fs.is_allowed(Path::new("/project/tsconfig.json")));
        assert!(fs.is_allowed(Path::new("/project/package.json")));
        assert!(fs.is_allowed(Path::new("/project/any_other.json")));

        // Other non-JS/TS files should also be allowed (or at least not blocked by this filter)
        assert!(fs.is_allowed(Path::new("/project/app.html")));
    }

    #[test]
    fn test_allowed_sources_filter_symlinks() {
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let target_file = dir.path().join("target.ts");
        std::fs::write(&target_file, "console.log('hello');").unwrap();

        let link_file = dir.path().join("link.ts");
        #[cfg(unix)]
        std::os::unix::fs::symlink(&target_file, &link_file).unwrap();
        #[cfg(windows)]
        std::os::windows::fs::symlink_file(&target_file, &link_file).unwrap();

        let canonical_target = std::fs::canonicalize(&target_file).unwrap();

        // Direction A: If only the symlink path is in allowed_sources,
        // both the symlink and its canonical target path must be allowed.
        {
            let mut allowed = HashSet::new();
            allowed.insert(link_file.clone());
            let fs = OverlayFileSystem::new_with_allowed_sources(Some(allowed));

            assert!(fs.is_allowed(&link_file));
            assert!(fs.is_allowed(&canonical_target));
        }

        // Direction B (G3 case): If only the canonical target path is in allowed_sources,
        // the symlink path must be allowed.
        {
            let mut allowed = HashSet::new();
            allowed.insert(canonical_target.clone());
            let fs = OverlayFileSystem::new_with_allowed_sources(Some(allowed));

            assert!(fs.is_allowed(&link_file));
            assert!(fs.is_allowed(&canonical_target));
        }

        // A completely different blocked file should still be blocked
        {
            let mut allowed = HashSet::new();
            allowed.insert(canonical_target.clone());
            let fs = OverlayFileSystem::new_with_allowed_sources(Some(allowed));
            let blocked_file = dir.path().join("blocked.ts");
            assert!(!fs.is_allowed(&blocked_file));
        }
    }

    #[test]
    fn test_get_virtual_entry_bypasses_allowed_sources() {
        let mut allowed = HashSet::new();
        allowed.insert(PathBuf::from("/project/allowed.ts"));

        let fs = OverlayFileSystem::new_with_allowed_sources(Some(allowed));
        fs.upsert_file(
            PathBuf::from("/project/blocked.ts"),
            "console.log('blocked but virtual');".to_string(),
        );

        // Even though /project/blocked.ts is blocked by the allowed_sources filter...
        assert!(!fs.is_allowed(Path::new("/project/blocked.ts")));

        // ...get_virtual_entry should still bypass the filter and return the virtual file entry!
        let entry = fs.get_virtual_entry(Path::new("/project/blocked.ts"));
        assert!(entry.is_some());
        assert_eq!(
            entry.unwrap().content.as_ref(),
            "console.log('blocked but virtual');"
        );

        // Reading it via read_to_string should also work because virtual bypasses permission checks
        let content = fs.read_to_string(Path::new("/project/blocked.ts")).unwrap();
        assert_eq!(content, "console.log('blocked but virtual');");
    }

    #[test]
    fn test_allowed_sources_filter_root_dirs() {
        let mut allowed = HashSet::new();
        allowed.insert(PathBuf::from("/src/app.component.ts"));

        let fs = OverlayFileSystem::new_with_allowed_sources(Some(allowed));
        fs.set_root_dirs(vec![PathBuf::from("/src"), PathBuf::from("/blaze-out")]);

        // 1. If the candidate file doesn't exist anywhere, resolve_across_root_dirs returns None,
        // so it should be blocked because /blaze-out/app.component.ts is not directly allowed.
        assert!(!fs.is_allowed(Path::new("/blaze-out/app.component.ts")));

        // 2. Now let's make the candidate exist by upserting a virtual file at /src/app.component.ts.
        fs.upsert_file(
            PathBuf::from("/src/app.component.ts"),
            "export class AppComponent {}".to_string(),
        );

        // Now, it should be successfully resolved across rootDirs to /src/app.component.ts,
        // which is in allowed_sources, so it should return true!
        assert!(fs.is_allowed(Path::new("/blaze-out/app.component.ts")));

        // 3. A blocked file that exists in /src but is not allowed should still be blocked in both paths.
        fs.upsert_file(
            PathBuf::from("/src/blocked.ts"),
            "export class Blocked {}".to_string(),
        );
        assert!(!fs.is_allowed(Path::new("/src/blocked.ts")));
        assert!(!fs.is_allowed(Path::new("/blaze-out/blocked.ts")));
    }

    #[test]
    fn test_allowed_sources_relative_path_canonicalization() {
        // This test ensures that when `is_allowed` is called with a relative path,
        // it correctly canonicalizes the absolute version of that path (resolved against
        // the compiler's configured `cwd`) rather than using the testing process's global
        // current working directory, which would fail if they differ.
        let dir = tempfile::tempdir().unwrap();

        // `target_file` represents a real source file on disk within our isolated temp directory.
        let target_file = dir.path().join("target.ts");

        // `link_file` represents a symlink that points to `target_file`.
        // This simulates a `node_modules` dependency that is symlinked in a bazel environment.
        let link_file = dir.path().join("link.ts");
        std::fs::write(&target_file, "console.log('hello');").unwrap();

        #[cfg(unix)]
        std::os::unix::fs::symlink(&target_file, &link_file).unwrap();
        #[cfg(windows)]
        std::os::windows::fs::symlink_file(&target_file, &link_file).unwrap();

        // `canonical_target` is the absolute, fully-resolved path to the underlying physical file.
        let canonical_target = std::fs::canonicalize(&target_file).unwrap();

        // We only add the `canonical_target` to `allowed_sources`, simulating the build system's strict boundary
        // which resolves symlinks completely and only approves the final physical paths.
        let mut allowed = HashSet::new();
        allowed.insert(canonical_target.clone());

        let mut fs = OverlayFileSystem::new_with_allowed_sources(Some(allowed));

        // Force the compiler instance's current working directory to our temp directory.
        fs.cwd = std::sync::Arc::new(dir.path().to_path_buf());

        // `rel_path` is a purely relative lookup. The compiler evaluates this relative to its `cwd`.
        // Prior to our fix, canonicalizing "link.ts" evaluated against `std::env::current_dir()`.
        // With the fix, `fs.cwd.join("link.ts")` is canonicalized correctly to match `canonical_target`.
        let rel_path = Path::new("link.ts");
        assert!(fs.is_allowed(rel_path));
    }

    #[test]
    fn test_resolve_root_dirs_backing_path() {
        use crate::resource_loader::ResourceResolverFs;

        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_root_dirs(vec![
            PathBuf::from("/project"),
            PathBuf::from("/project/out-dir"),
        ]);
        fs.upsert_file(
            PathBuf::from("/project/out-dir/pkg/index.d.ts"),
            "export declare class Lib {}".to_string(),
        );

        assert!(fs.metadata(Path::new("/project/pkg/index.d.ts")).is_ok());
        assert_eq!(
            fs.resolve_root_dirs_backing_path(Path::new("/project/pkg/index.d.ts")),
            Some(PathBuf::from("/project/out-dir/pkg/index.d.ts"))
        );
        assert_eq!(
            fs.resolve_root_dirs_backing_path(Path::new("/project/out-dir/pkg/index.d.ts")),
            None
        );
        assert_eq!(
            fs.resolve_root_dirs_backing_path(Path::new("/project/missing.d.ts")),
            None
        );

        fs.upsert_file(
            PathBuf::from("/project/pkg/index.d.ts"),
            "export declare class Lib {}".to_string(),
        );
        assert_eq!(
            fs.resolve_root_dirs_backing_path(Path::new("/project/pkg/index.d.ts")),
            None
        );
    }

    #[cfg(unix)]
    #[test]
    fn test_allowed_sources_allows_js_named_directories_and_symlink_aliases() {
        let dir = tempfile::TempDir::new().unwrap();
        let ws = dir.path();
        let real_dir = ws.join("real");
        let pkg_dir = ws.join("pkg");
        let zone_dir = ws.join("third_party/zone.js");
        std::fs::create_dir_all(&real_dir).unwrap();
        std::fs::create_dir_all(&pkg_dir).unwrap();
        std::fs::create_dir_all(&zone_dir).unwrap();

        let real_foo = real_dir.join("foo.ts");
        let other_ts = pkg_dir.join("other.ts");
        let blocked_js = ws.join("third_party/blocked.js");
        let zone_dts = zone_dir.join("index.d.ts");
        std::fs::write(&real_foo, "export const x = 1;").unwrap();
        std::fs::write(&other_ts, "export const y = 2;").unwrap();
        std::fs::write(&blocked_js, "export const z = 3;").unwrap();
        std::fs::write(&zone_dts, "export declare const Zone: any;").unwrap();

        let foo_link = pkg_dir.join("foo.ts");
        let alias_link = pkg_dir.join("alias.ts");
        let zone_link = ws.join("third_party/zone_link.js");
        std::os::unix::fs::symlink(&real_foo, &foo_link).unwrap();
        std::os::unix::fs::symlink(Path::new("foo.ts"), &alias_link).unwrap();
        std::os::unix::fs::symlink(&zone_dir, &zone_link).unwrap();

        let fs = OverlayFileSystem::new_with_allowed_sources(Some(HashSet::from([foo_link])));

        assert!(fs.metadata(&zone_dir).unwrap().is_dir());
        assert!(fs.symlink_metadata(&zone_dir).unwrap().is_dir());
        assert!(fs.metadata(&zone_link).unwrap().is_dir());
        assert!(fs.symlink_metadata(&zone_link).unwrap().is_symlink());
        assert!(fs.read_link(&zone_link).is_ok());

        assert!(fs.is_allowed(&alias_link));
        assert_eq!(
            fs.read_to_string(&alias_link).unwrap(),
            "export const x = 1;"
        );

        assert!(!fs.is_allowed(&other_ts));
        assert!(fs.metadata(&other_ts).is_err());
        assert!(fs.symlink_metadata(&other_ts).is_err());
        assert!(!fs.is_allowed(&blocked_js));
        assert!(fs.metadata(&blocked_js).is_err());
    }

    #[test]
    fn test_nested_root_dirs_uses_only_longest_matching_prefix() {
        use crate::resource_loader::ResourceResolverFs;

        let dir = tempfile::TempDir::new().unwrap();
        let ws = dir.path();
        let pkg_dir = ws.join("pkg");
        let sub_src = ws.join("sub");
        let out_bin_pkg = ws.join("out/bin/pkg");
        let out_sub = ws.join("out/sub");
        let out_dir = ws.join("out");
        std::fs::create_dir_all(&pkg_dir).unwrap();
        std::fs::create_dir_all(&sub_src).unwrap();
        std::fs::create_dir_all(&out_bin_pkg).unwrap();
        std::fs::create_dir_all(&out_sub).unwrap();

        let pkg_dts = pkg_dir.join("foo.d.ts");
        let sub_dts = sub_src.join("only_in_ws_sub.d.ts");
        std::fs::write(&pkg_dts, "export declare const x: number;").unwrap();
        std::fs::write(&sub_dts, "export declare const y: number;").unwrap();

        let fs = OverlayFileSystem::new_with_overlay();
        fs.set_root_dirs(vec![
            ws.join("out/bin"),
            out_sub.clone(),
            out_dir,
            ws.to_path_buf(),
        ]);

        // `/ws/out/bin/pkg/foo.d.ts` matches longest prefix `/ws/out/bin` -> `pkg/foo.d.ts` -> `/ws/pkg/foo.d.ts`.
        assert_eq!(
            fs.resolve_root_dirs_backing_path(&out_bin_pkg.join("foo.d.ts")),
            Some(normalize_path(&pkg_dts).into_owned())
        );

        // `/ws/out/sub/only_in_ws_sub.d.ts` matches longest prefix `/ws/out/sub` (`rel_path = only_in_ws_sub.d.ts`)
        // and must NOT fall through to shorter prefix `/ws/out` (`rel_path = sub/only_in_ws_sub.d.ts`).
        assert_eq!(
            fs.resolve_root_dirs_backing_path(&out_sub.join("only_in_ws_sub.d.ts")),
            None
        );

        // Equal-length `rootDirs` preserve `tsconfig.json` declaration priority after dedup + sort.
        fs.set_root_dirs(vec![
            PathBuf::from("/ws/src"),
            PathBuf::from("/ws/gen"),
            PathBuf::from("/ws/src"),
        ]);
        assert_eq!(
            fs.root_dirs(),
            vec![PathBuf::from("/ws/src"), PathBuf::from("/ws/gen")]
        );
    }

    #[cfg(unix)]
    #[test]
    fn test_root_dirs_generated_sources_and_symlinked_workspace_resolution() {
        use crate::host::{AnalysisHost, DefaultFsHost, ImportKind, LoadKind, ModuleId, ResolveRequest};
        use futures::FutureExt;

        let dir = tempfile::TempDir::new().unwrap();
        let real_ws = dir.path().join("real_ws");
        let ws_link = dir.path().join("ws_link");
        std::fs::create_dir_all(&real_ws).unwrap();
        std::os::unix::fs::symlink(&real_ws, &ws_link).unwrap();

        let cas_dir = real_ws.join("cas");
        let pkg_dir = ws_link.join("pkg");
        let out_pkg_dir = ws_link.join("out/bin/pkg");
        std::fs::create_dir_all(&cas_dir).unwrap();
        std::fs::create_dir_all(&pkg_dir).unwrap();
        std::fs::create_dir_all(&out_pkg_dir).unwrap();

        let cas_gen = cas_dir.join("sha256_gen");
        let cas_dts = cas_dir.join("sha256_dts");
        let blocked_in_out = out_pkg_dir.join("blocked.ts");
        std::fs::write(&cas_gen, "export const GEN = 42;").unwrap();
        std::fs::write(&cas_dts, "export declare const LIB: number;").unwrap();
        std::fs::write(&blocked_in_out, "export const BLOCKED = 1;").unwrap();

        std::os::unix::fs::symlink(&cas_gen, out_pkg_dir.join("gen.ts")).unwrap();
        std::os::unix::fs::symlink(&cas_dts, out_pkg_dir.join("lib.d.ts")).unwrap();

        let logical_gen = pkg_dir.join("gen.ts");
        let logical_blocked = pkg_dir.join("blocked.ts");
        let fs =
            OverlayFileSystem::new_with_allowed_sources(Some(HashSet::from([logical_gen.clone()])));
        fs.set_root_dirs(vec![ws_link.join("out/bin"), ws_link.clone()]);

        assert!(fs.metadata(&logical_gen).is_ok());
        assert_eq!(
            fs.read_to_string(&logical_gen).unwrap(),
            "export const GEN = 42;"
        );
        assert!(fs.metadata(&logical_blocked).is_err());
        assert!(fs.symlink_metadata(&logical_blocked).is_err());

        // `DefaultFsHost::resolve` + `load` resolves and reads symlinked `./lib` across `rootDirs`
        // even when parent directories canonicalize through `ws_link -> real_ws`.
        let host = DefaultFsHost::from_fs_and_options(fs, None, false, None);
        let resolved = host
            .resolve(ResolveRequest::new(
                ModuleId::from_path(&pkg_dir.join("app.ts")),
                "./lib",
                ImportKind::Static,
            ))
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected ./lib to resolve");
        let loaded = host
            .load(&resolved.id, LoadKind::Module, false)
            .now_or_never()
            .unwrap()
            .unwrap()
            .expect("expected resolved ./lib to load");
        assert_eq!(&*loaded.code, "export declare const LIB: number;");
    }
}

fn count_read(bytes: usize) {
    crate::perf::count(Counter::FsReads, 1);
    crate::perf::count(Counter::FsReadBytes, bytes as u64);
}
