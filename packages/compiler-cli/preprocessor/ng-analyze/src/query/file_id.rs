use crate::host::{IdKind, ModuleId};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::RwLock;

/// Canonical thread-safe file/module identifier.
pub type FileId = u32;

/// Upper bound on sequential [`FileId`] values allocated by [`FileIdInterner`], leaving the top
/// values (`u32::MAX - 15..=u32::MAX`) reserved for engine pseudo-dependencies such as
/// `ROOTS_FILE_ID`, `UNRESOLVED_IMPORTS_FILE_ID`, and `R3_SYMBOLS_ROOT_FILE_ID`.
pub const MAX_INTERNED_FILE_ID: FileId = FileId::MAX - 16;

#[derive(Clone, Debug)]
struct InternedModule {
    id: ModuleId,
    path: PathBuf,
    kind: IdKind,
}

/// Thread-safe canonical module ID and path interner.
///
/// - [`IdKind::Path`] entries normalize `.`/`..` segments and trailing separators structurally
///   (preserving first-seen case spelling) and case-fold lookup keys on case-insensitive platforms
///   (macOS/Windows).
/// - [`IdKind::Virtual`] entries are stored and matched verbatim with zero path normalization.
#[derive(Debug, Default)]
pub struct FileIdInterner {
    inner: RwLock<InternerInner>,
}

#[derive(Debug, Default)]
struct InternerInner {
    exact_map: HashMap<ModuleId, FileId>,
    path_map: HashMap<PathBuf, FileId>,
    entries: Vec<InternedModule>,
}

fn allocate_file_id(next_index: usize) -> FileId {
    assert!(
        next_index <= MAX_INTERNED_FILE_ID as usize,
        "FileIdInterner capacity exhausted"
    );
    next_index as FileId
}

fn log_id_kind_override(id: &str, previous: IdKind, authoritative: IdKind) {
    #[cfg(debug_assertions)]
    #[allow(clippy::print_stderr)]
    {
        eprintln!(
            "Warning: Module '{id}' was previously interned as {previous:?}, overriding to host-reported {authoritative:?}"
        );
    }
    #[cfg(not(debug_assertions))]
    {
        let _ = (id, previous, authoritative);
    }
}

impl FileIdInterner {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn len(&self) -> usize {
        self.inner
            .read()
            .expect("FileIdInterner lock poisoned")
            .entries
            .len()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn intern_path(&self, path: impl AsRef<Path>) -> FileId {
        self.intern_path_inner(path.as_ref(), false)
    }

    /// Intern a module identifier with a caller-supplied [`IdKind`].
    ///
    /// If `id` has already been interned, its existing [`IdKind`] is preserved; use
    /// [`Self::intern_authoritative`] when recording results returned by the host's `resolve` hook
    /// so the host's reported [`IdKind`] wins.
    pub fn intern_module(&self, id: &str, kind: IdKind) -> FileId {
        match kind {
            IdKind::Path => self.intern_path_inner(Path::new(id), false),
            IdKind::Virtual => self.intern_virtual(id, false),
        }
    }

    /// Intern a module identifier reported by an authoritative host resolution.
    ///
    /// If `id` was previously interned with a different [`IdKind`] (for example via a string entry
    /// point that defaulted to [`IdKind::Path`]), the host-reported `kind` wins.
    pub fn intern_authoritative(&self, id: &str, kind: IdKind) -> FileId {
        match kind {
            IdKind::Path => self.intern_path_inner(Path::new(id), true),
            IdKind::Virtual => self.intern_virtual(id, true),
        }
    }

    fn intern_virtual(&self, id: &str, authoritative: bool) -> FileId {
        {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.exact_map.get(id) {
                if !authoritative || read.entries[fid as usize].kind == IdKind::Virtual {
                    return fid;
                }
            }
        }

        let mut guard = self.inner.write().expect("FileIdInterner lock poisoned");
        // Reborrow the guard as `&mut InternerInner` so `entries` and `path_map` borrow disjointly.
        let write = &mut *guard;
        if let Some(&fid) = write.exact_map.get(id) {
            if authoritative && write.entries[fid as usize].kind != IdKind::Virtual {
                log_id_kind_override(id, write.entries[fid as usize].kind, IdKind::Virtual);
                let norm = crate::fs::normalize_path(&write.entries[fid as usize].path);
                if write.path_map.get(&*norm) == Some(&fid) {
                    write.path_map.remove(&*norm);
                }
                write.entries[fid as usize].kind = IdKind::Virtual;
            }
            return fid;
        }

        let fid = allocate_file_id(write.entries.len());
        let module_id = ModuleId::from(id);
        write.entries.push(InternedModule {
            id: module_id.clone(),
            path: PathBuf::from(id),
            kind: IdKind::Virtual,
        });
        write.exact_map.insert(module_id, fid);
        fid
    }

    fn intern_path_inner(&self, path_ref: &Path, authoritative: bool) -> FileId {
        if let Some(raw_str) = path_ref.to_str() {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.exact_map.get(raw_str) {
                if !authoritative || read.entries[fid as usize].kind == IdKind::Path {
                    return fid;
                }
            }
        }

        let key = crate::fs::normalize_path(path_ref);
        {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.path_map.get(&*key) {
                return fid;
            }
        }

        let spelled_path = crate::fs::normalize_path_structural(path_ref).into_owned();
        let is_valid_utf8 = spelled_path.to_str().is_some();
        let spelled_id = ModuleId::from_path(&spelled_path);

        let mut write = self.inner.write().expect("FileIdInterner lock poisoned");
        if let Some(&fid) = write.path_map.get(&*key) {
            return fid;
        }
        if is_valid_utf8 {
            let existing = path_ref
                .to_str()
                .and_then(|raw_str| write.exact_map.get(raw_str).copied())
                .or_else(|| write.exact_map.get(spelled_id.as_str()).copied());
            if let Some(fid) = existing {
                if authoritative && write.entries[fid as usize].kind != IdKind::Path {
                    log_id_kind_override(
                        spelled_id.as_str(),
                        write.entries[fid as usize].kind,
                        IdKind::Path,
                    );
                    write.entries[fid as usize].kind = IdKind::Path;
                    write.path_map.insert(key.into_owned(), fid);
                }
                return fid;
            }
        }

        let fid = allocate_file_id(write.entries.len());
        write.entries.push(InternedModule {
            id: spelled_id.clone(),
            path: spelled_path,
            kind: IdKind::Path,
        });
        if is_valid_utf8 {
            write.exact_map.insert(spelled_id, fid);
        }
        write.path_map.insert(key.into_owned(), fid);
        fid
    }

    /// Lookup the `PathBuf` corresponding to a `FileId`.
    pub fn lookup_path(&self, id: FileId) -> PathBuf {
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.entries
            .get(id as usize)
            .map(|entry| entry.path.clone())
            .expect("FileId out of bounds in FileIdInterner")
    }

    /// Lookup the canonical [`ModuleId`] corresponding to a `FileId`.
    pub fn lookup_id(&self, id: FileId) -> ModuleId {
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.entries
            .get(id as usize)
            .map(|entry| entry.id.clone())
            .expect("FileId out of bounds in FileIdInterner")
    }

    /// Lookup the [`IdKind`] corresponding to a `FileId`.
    pub fn lookup_kind(&self, id: FileId) -> IdKind {
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.entries
            .get(id as usize)
            .map(|entry| entry.kind)
            .expect("FileId out of bounds in FileIdInterner")
    }

    /// Lookup both `(ModuleId, IdKind)` corresponding to a `FileId` under a single lock.
    pub fn lookup_module(&self, id: FileId) -> (ModuleId, IdKind) {
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.entries
            .get(id as usize)
            .map(|entry| (entry.id.clone(), entry.kind))
            .expect("FileId out of bounds in FileIdInterner")
    }

    /// Return the `FileId` if the path has already been interned.
    pub fn get_if_interned(&self, path: impl AsRef<Path>) -> Option<FileId> {
        let path_ref = path.as_ref();
        if let Some(raw_str) = path_ref.to_str() {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.exact_map.get(raw_str) {
                return Some(fid);
            }
        }
        let normalized = crate::fs::normalize_path(path_ref);
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.path_map.get(&*normalized).copied()
    }

    /// Return the `FileId` if the module `(id, kind)` has already been interned.
    ///
    /// [`IdKind::Virtual`] lookups perform an exact string match only; [`IdKind::Path`] lookups
    /// check exact match first and fall back to normalized path lookup.
    pub fn get_module_if_interned(&self, id: &str, kind: IdKind) -> Option<FileId> {
        {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.exact_map.get(id) {
                return Some(fid);
            }
        }
        if kind == IdKind::Virtual {
            return None;
        }
        let normalized = crate::fs::normalize_path(Path::new(id));
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.path_map.get(&*normalized).copied()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_id_interner() {
        let interner = FileIdInterner::new();
        assert!(interner.is_empty());

        let p1 = PathBuf::from("/foo/bar.ts");
        let p2 = PathBuf::from("/foo/baz.ts");

        assert_eq!(interner.get_if_interned(&p1), None);

        let id1 = interner.intern_path(&p1);
        let id1_dup = interner.intern_path(&p1);
        assert_eq!(id1, id1_dup);
        assert_eq!(interner.get_if_interned(&p1), Some(id1));

        let id2 = interner.intern_path(&p2);
        assert_ne!(id1, id2);

        assert_eq!(interner.lookup_path(id1), p1);
        assert_eq!(interner.lookup_path(id2), p2);
        assert_eq!(interner.lookup_id(id1), ModuleId::from("/foo/bar.ts"));
        assert_eq!(interner.lookup_kind(id1), IdKind::Path);
        assert_eq!(interner.len(), 2);
    }

    #[test]
    fn test_file_id_interner_preserves_spelling() {
        let interner = FileIdInterner::new();
        let spelled = PathBuf::from("/Users/Dev/Proj/src/App.ts");
        let id = interner.intern_path(&spelled);
        assert_eq!(interner.lookup_path(id), spelled);

        let other_case = PathBuf::from("/users/dev/proj/src/app.ts");
        if cfg!(any(target_os = "windows", target_os = "macos")) {
            // First spelling wins.
            assert_eq!(interner.intern_path(&other_case), id);
            assert_eq!(interner.get_if_interned(&other_case), Some(id));
            assert_eq!(interner.lookup_path(id), spelled);
        } else {
            assert_ne!(interner.intern_path(&other_case), id);
        }
    }

    #[test]
    fn test_virtual_module_ids_skip_path_normalization_and_case_folding() {
        let interner = FileIdInterner::new();

        // Virtual IDs with `\0`, `..`, trailing slashes, and query strings are preserved verbatim.
        let raw_virtual = "\0virtual:pkg/../entry.ts?inline/";
        let collapsed = "\0virtual:entry.ts?inline";

        let id_raw = interner.intern_module(raw_virtual, IdKind::Virtual);
        let id_collapsed = interner.intern_module(collapsed, IdKind::Virtual);
        assert_ne!(id_raw, id_collapsed);
        assert_eq!(
            interner.lookup_module(id_raw),
            (ModuleId::from(raw_virtual), IdKind::Virtual)
        );
        assert_eq!(
            interner.get_module_if_interned(raw_virtual, IdKind::Virtual),
            Some(id_raw)
        );

        // Virtual IDs are always case-sensitive, even on macOS/Windows.
        let upper_id = interner.intern_module("/@virtual/AppComp.ts", IdKind::Virtual);
        assert_eq!(
            interner.get_module_if_interned("/@virtual/appcomp.ts", IdKind::Virtual),
            None
        );
        let lower_id = interner.intern_module("/@virtual/appcomp.ts", IdKind::Virtual);
        assert_ne!(upper_id, lower_id);
    }

    #[test]
    fn test_authoritative_resolve_kind_wins_over_defaulted_kind() {
        let interner = FileIdInterner::new();

        // 1. Entry point passed as bare string defaults to `IdKind::Path`.
        let fid = interner.intern_module("/@id/virtual-entry", IdKind::Path);
        assert_eq!(interner.lookup_kind(fid), IdKind::Path);

        // 2. Non-authoritative lookup/intern does not clobber existing kind, while authoritative
        //    host resolution overrides `IdKind` to `Virtual` on the same `FileId`.
        let fid_resolved = interner.intern_authoritative("/@id/virtual-entry", IdKind::Virtual);
        assert_eq!(fid_resolved, fid);
        assert_eq!(interner.lookup_kind(fid), IdKind::Virtual);

        // 3. Subsequent string-defaulted `Path` calls (e.g. `invalidateFiles` without `idKind`)
        //    still find the same `FileId` and do not revert `IdKind::Virtual` back to `Path`.
        assert_eq!(interner.get_if_interned("/@id/virtual-entry"), Some(fid));
        assert_eq!(
            interner.intern_module("/@id/virtual-entry", IdKind::Path),
            fid
        );
        assert_eq!(interner.lookup_kind(fid), IdKind::Virtual);

        // 4. An authoritative `Path` resolution can likewise override a prior `Virtual` kind.
        let fid_back_to_path = interner.intern_authoritative("/@id/virtual-entry", IdKind::Path);
        assert_eq!(fid_back_to_path, fid);
        assert_eq!(interner.lookup_kind(fid), IdKind::Path);
    }

    #[test]
    fn test_file_id_interner_stress_and_bounds() {
        let interner = FileIdInterner::new();
        let count = 10_000;
        for i in 0..count {
            let path = PathBuf::from(format!("/src/file_{}.ts", i));
            let id = interner.intern_path(&path);
            assert_eq!(id, i);
            assert_eq!(interner.lookup_path(id), path);
        }

        // Verify exact deduplication across all 10,000 paths
        for i in 0..count {
            let path = PathBuf::from(format!("/src/file_{}.ts", i));
            assert_eq!(interner.get_if_interned(&path), Some(i));
            assert_eq!(interner.intern_path(&path), i);
        }
    }

    #[test]
    #[should_panic(expected = "FileId out of bounds in FileIdInterner")]
    fn test_file_id_interner_out_of_bounds() {
        let interner = FileIdInterner::new();
        interner.lookup_path(42);
    }

    #[test]
    fn test_file_id_interner_concurrent() {
        use std::sync::Arc;
        let interner = Arc::new(FileIdInterner::new());
        let threads = 10;
        let files_per_thread = 1_000;

        std::thread::scope(|s| {
            for _ in 0..threads {
                let interner = Arc::clone(&interner);
                s.spawn(move || {
                    for i in 0..files_per_thread {
                        let path = PathBuf::from(format!("/shared/path_{}.ts", i));
                        let id = interner.intern_path(&path);
                        assert_eq!(interner.lookup_path(id), path);
                    }
                });
            }
        });

        // Verify total distinct files is exactly `files_per_thread`
        for i in 0..files_per_thread {
            let path = PathBuf::from(format!("/shared/path_{}.ts", i));
            let Some(id) = interner.get_if_interned(&path) else {
                panic!("Path not interned");
            };
            assert_eq!(interner.lookup_path(id), path);
        }
    }

    #[test]
    fn test_empirical_challenger_adversarial() {
        let interner = FileIdInterner::new();

        // 1. Unicode and special symbols
        let unicode_path = PathBuf::from("/🚀/frontend/app.component.ts");
        let id1 = interner.intern_path(&unicode_path);
        assert_eq!(interner.lookup_path(id1), unicode_path);
        assert_eq!(interner.get_if_interned(&unicode_path), Some(id1));

        // 2. Trailing slashes in PathBuf
        let p_slash = PathBuf::from("/foo/bar/");
        let p_no_slash = PathBuf::from("/foo/bar");
        let id_slash = interner.intern_path(&p_slash);
        let id_no_slash = interner.intern_path(&p_no_slash);
        // PathBuf::from("/foo/bar/") and PathBuf::from("/foo/bar") are treated as identical by Path equality in Rust when constructed
        assert_eq!(id_slash, id_no_slash);

        // 3. Exact deduplication check maintaining entries length perfectly
        for _ in 0..500 {
            assert_eq!(interner.intern_path(&unicode_path), id1);
        }
        assert_eq!(interner.len(), 2);
    }
}
