use crate::host::{IdKind, ModuleId};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::RwLock;

/// Canonical thread-safe file/module identifier.
pub type FileId = u32;

/// Upper bound on sequential [`FileId`] values allocated by [`FileIdInterner`], leaving the top
/// values (`u32::MAX - 15..=u32::MAX`) reserved for engine pseudo-dependencies such as
/// `ROOTS_FILE_ID`, `UNRESOLVED_IMPORTS_FILE_ID`, and `R3_SYMBOLS_ROOT_FILE_ID`.
pub(crate) const MAX_INTERNED_FILE_ID: FileId = FileId::MAX - 16;

#[derive(Clone, Debug)]
struct InternedModule {
    id: ModuleId,
    kind: IdKind,
    /// Filesystem path when it differs from `id`: a non-UTF-8 path (`id` is then lossy) or a
    /// module promoted to [`IdKind::Path`] whose verbatim `id` is not structurally normalized.
    path_override: Option<PathBuf>,
}

impl InternedModule {
    /// The entry's filesystem path (for [`IdKind::Virtual`] entries, the verbatim `id`).
    fn path(&self) -> PathBuf {
        match &self.path_override {
            Some(path) => path.clone(),
            None => PathBuf::from(self.id.as_str()),
        }
    }
}

/// Thread-safe canonical module ID and path interner.
///
/// - [`IdKind::Path`] entries normalize `.`/`..` segments and trailing separators structurally
///   (preserving first-seen case spelling) and case-fold lookup keys on case-insensitive platforms
///   (macOS/Windows).
/// - [`IdKind::Virtual`] entries are stored and matched verbatim with zero path normalization.
/// - A path resolves to the [`IdKind::Path`] entry with its lookup key. Failing that, it names the
///   entry of any kind whose ID equals its exact or structurally normalized spelling, and an
///   authoritative host resolution can change that entry's kind (see
///   [`Self::intern_authoritative`]).
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
    // Debug builds only: a host reclassifying an already-interned module is unexpected, so make it
    // visible during development without adding stderr noise to release builds.
    #[cfg(debug_assertions)]
    #[allow(clippy::print_stderr)]
    {
        eprintln!(
            "Warning: Module {id:?} was previously interned as {previous:?}, overriding to host-reported {authoritative:?}"
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
        self.intern_path_inner(path.as_ref(), false).0
    }

    /// Intern a module identifier with a caller-supplied [`IdKind`].
    ///
    /// If `id` has already been interned, its existing [`IdKind`] is preserved; use
    /// [`Self::intern_authoritative`] when recording results returned by the host's `resolve` hook
    /// so the host's reported [`IdKind`] wins.
    pub fn intern_module(&self, id: &str, kind: IdKind) -> FileId {
        match kind {
            IdKind::Path => self.intern_path_inner(Path::new(id), false).0,
            IdKind::Virtual => self.intern_virtual(id, false).0,
        }
    }

    /// Intern a module identifier reported by an authoritative host resolution.
    ///
    /// If `id` was previously interned with a different [`IdKind`] (for example via a string entry
    /// point that defaulted to [`IdKind::Path`]), the host-reported `kind` wins and the previous
    /// kind is returned so callers can invalidate results computed under it.
    pub fn intern_authoritative(&self, id: &str, kind: IdKind) -> (FileId, Option<IdKind>) {
        match kind {
            IdKind::Path => self.intern_path_inner(Path::new(id), true),
            IdKind::Virtual => self.intern_virtual(id, true),
        }
    }

    fn intern_virtual(&self, id: &str, authoritative: bool) -> (FileId, Option<IdKind>) {
        {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.exact_map.get(id) {
                if !authoritative || read.entries[fid as usize].kind == IdKind::Virtual {
                    return (fid, None);
                }
            }
        }

        let mut guard = self.inner.write().expect("FileIdInterner lock poisoned");
        // Reborrow the guard as `&mut InternerInner` so `entries` and `path_map` borrow disjointly.
        let write = &mut *guard;
        if let Some(&fid) = write.exact_map.get(id) {
            let previous = write.entries[fid as usize].kind;
            if authoritative && previous != IdKind::Virtual {
                log_id_kind_override(id, previous, IdKind::Virtual);
                let path = write.entries[fid as usize].path();
                let norm = crate::fs::normalize_path(&path);
                if write.path_map.get(&*norm) == Some(&fid) {
                    write.path_map.remove(&*norm);
                }
                let entry = &mut write.entries[fid as usize];
                entry.kind = IdKind::Virtual;
                entry.path_override = None;
                return (fid, Some(previous));
            }
            return (fid, None);
        }

        let fid = allocate_file_id(write.entries.len());
        let module_id = ModuleId::from(id);
        write.entries.push(InternedModule {
            id: module_id.clone(),
            kind: IdKind::Virtual,
            path_override: None,
        });
        write.exact_map.insert(module_id, fid);
        (fid, None)
    }

    fn intern_path_inner(&self, path_ref: &Path, authoritative: bool) -> (FileId, Option<IdKind>) {
        // Only a `Path` entry may short-circuit here. A `Virtual` entry spelled like the path must
        // not shadow the `Path` entry that owns its lookup key, so it is matched after `path_map`.
        if let Some(raw_str) = path_ref.to_str() {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.exact_map.get(raw_str) {
                if read.entries[fid as usize].kind == IdKind::Path {
                    return (fid, None);
                }
            }
        }

        let key = crate::fs::normalize_path(path_ref);
        {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.path_map.get(&*key) {
                return (fid, None);
            }
        }

        let spelled_path = crate::fs::normalize_path_structural(path_ref).into_owned();
        let is_valid_utf8 = spelled_path.to_str().is_some();
        let spelled_id = ModuleId::from_path(&spelled_path);

        let mut write = self.inner.write().expect("FileIdInterner lock poisoned");
        if let Some(&fid) = write.path_map.get(&*key) {
            return (fid, None);
        }
        if is_valid_utf8 {
            let existing = path_ref
                .to_str()
                .and_then(|raw_str| write.exact_map.get(raw_str).copied())
                .or_else(|| write.exact_map.get(spelled_id.as_str()).copied());
            if let Some(fid) = existing {
                let previous = write.entries[fid as usize].kind;
                if authoritative && previous != IdKind::Path {
                    let entry = &mut write.entries[fid as usize];
                    log_id_kind_override(entry.id.as_str(), previous, IdKind::Path);
                    entry.kind = IdKind::Path;
                    // Keep the host's verbatim ID, but give path math the normalized spelling.
                    entry.path_override = (entry.id != spelled_id).then_some(spelled_path);
                    write.path_map.insert(key.into_owned(), fid);
                    return (fid, Some(previous));
                }
                return (fid, None);
            }
        }

        let fid = allocate_file_id(write.entries.len());
        write.entries.push(InternedModule {
            id: spelled_id.clone(),
            kind: IdKind::Path,
            path_override: (!is_valid_utf8).then_some(spelled_path),
        });
        if is_valid_utf8 {
            write.exact_map.insert(spelled_id, fid);
        }
        write.path_map.insert(key.into_owned(), fid);
        (fid, None)
    }

    /// Lookup the `PathBuf` corresponding to a `FileId`.
    pub fn lookup_path(&self, id: FileId) -> PathBuf {
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.entries
            .get(id as usize)
            .map(InternedModule::path)
            .expect("FileId out of bounds in FileIdInterner")
    }

    /// Like [`Self::lookup_path`], but `None` for an unknown id.
    pub fn try_lookup_path(&self, id: FileId) -> Option<PathBuf> {
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.entries.get(id as usize).map(InternedModule::path)
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
        self.get_path_if_interned(path.as_ref())
    }

    /// Return the `FileId` if the module `(id, kind)` has already been interned.
    ///
    /// [`IdKind::Virtual`] lookups perform an exact string match only; [`IdKind::Path`] lookups
    /// match the same entries [`Self::intern_module`] would return.
    pub fn get_module_if_interned(&self, id: &str, kind: IdKind) -> Option<FileId> {
        match kind {
            IdKind::Path => self.get_path_if_interned(Path::new(id)),
            IdKind::Virtual => {
                let read = self.inner.read().expect("FileIdInterner lock poisoned");
                read.exact_map.get(id).copied()
            }
        }
    }

    /// Path lookup that probes the same keys, in the same order, as [`Self::intern_path_inner`].
    fn get_path_if_interned(&self, path_ref: &Path) -> Option<FileId> {
        let raw_str = path_ref.to_str();
        if let Some(raw_str) = raw_str {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&fid) = read.exact_map.get(raw_str) {
                if read.entries[fid as usize].kind == IdKind::Path {
                    return Some(fid);
                }
            }
        }
        let key = crate::fs::normalize_path(path_ref);
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        if let Some(&fid) = read.path_map.get(&*key) {
            return Some(fid);
        }
        let spelled = crate::fs::normalize_path_structural(path_ref);
        raw_str
            .and_then(|raw_str| read.exact_map.get(raw_str))
            .or_else(|| spelled.to_str().and_then(|s| read.exact_map.get(s)))
            .copied()
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
        //    host resolution overrides `IdKind` to `Virtual` on the same `FileId` and reports the
        //    previous kind so callers can invalidate.
        assert_eq!(
            interner.intern_authoritative("/@id/virtual-entry", IdKind::Virtual),
            (fid, Some(IdKind::Path))
        );
        assert_eq!(interner.lookup_kind(fid), IdKind::Virtual);
        // Reporting the same kind again is not an override.
        assert_eq!(
            interner.intern_authoritative("/@id/virtual-entry", IdKind::Virtual),
            (fid, None)
        );

        // 3. Subsequent string-defaulted `Path` calls (e.g. `invalidateFiles` without `idKind`)
        //    still find the same `FileId` and do not revert `IdKind::Virtual` back to `Path`.
        assert_eq!(interner.get_if_interned("/@id/virtual-entry"), Some(fid));
        assert_eq!(
            interner.intern_module("/@id/virtual-entry", IdKind::Path),
            fid
        );
        assert_eq!(interner.lookup_kind(fid), IdKind::Virtual);

        // 4. An authoritative `Path` resolution can likewise override a prior `Virtual` kind.
        assert_eq!(
            interner.intern_authoritative("/@id/virtual-entry", IdKind::Path),
            (fid, Some(IdKind::Virtual))
        );
        assert_eq!(interner.lookup_kind(fid), IdKind::Path);

        // 5. A first sighting is not an override.
        let (other, previous) = interner.intern_authoritative("\0virtual:other", IdKind::Virtual);
        assert_ne!(other, fid);
        assert_eq!(previous, None);
    }

    #[test]
    fn test_promotion_to_path_normalizes_lookup_path_but_keeps_verbatim_id() {
        let interner = FileIdInterner::new();
        let verbatim = "/@id/./entry.ts";
        let fid = interner.intern_module(verbatim, IdKind::Virtual);
        // `Path` equality ignores interior `.` segments, so compare the raw spelling.
        assert_eq!(interner.lookup_path(fid).as_os_str(), verbatim);

        assert_eq!(
            interner.intern_authoritative(verbatim, IdKind::Path),
            (fid, Some(IdKind::Virtual))
        );
        assert_eq!(
            interner.lookup_module(fid),
            (ModuleId::from(verbatim), IdKind::Path)
        );
        assert_eq!(interner.lookup_path(fid).as_os_str(), "/@id/entry.ts");
        assert_eq!(interner.get_if_interned("/@id/entry.ts"), Some(fid));

        // Demoting restores the verbatim path and drops the normalized alias.
        assert_eq!(
            interner.intern_authoritative(verbatim, IdKind::Virtual),
            (fid, Some(IdKind::Path))
        );
        assert_eq!(interner.lookup_path(fid).as_os_str(), verbatim);
        assert_eq!(interner.get_if_interned("/@id/entry.ts"), None);
    }

    #[test]
    fn test_path_lookups_agree_with_interning_near_virtual_ids() {
        let interner = FileIdInterner::new();
        let virt = interner.intern_module("/@id/x", IdKind::Virtual);
        // A path whose structurally normalized spelling equals a virtual ID names that module,
        // whichever API asks.
        for probe in ["/@id/./x", "/@id/x/"] {
            assert_eq!(interner.get_if_interned(probe), Some(virt), "{probe}");
            assert_eq!(
                interner.get_module_if_interned(probe, IdKind::Path),
                Some(virt),
                "{probe}"
            );
            assert_eq!(interner.intern_path(probe), virt, "{probe}");
        }
        // Virtual lookups stay verbatim.
        assert_eq!(
            interner.get_module_if_interned("/@id/./x", IdKind::Virtual),
            None
        );
        assert_eq!(interner.len(), 1);
    }

    #[test]
    fn test_path_lookups_prefer_the_path_entry_over_a_virtual_spelling() {
        let interner = FileIdInterner::new();
        let path_fid = interner.intern_path("/app/entry.ts");
        let probe = "/app/./entry.ts";
        let virt_fid = interner.intern_module(probe, IdKind::Virtual);
        assert_ne!(path_fid, virt_fid);

        // The path names the `Path` entry that owns its lookup key, whichever API asks, even
        // though a `Virtual` entry has its exact spelling.
        assert_eq!(interner.get_if_interned(probe), Some(path_fid));
        assert_eq!(
            interner.get_module_if_interned(probe, IdKind::Path),
            Some(path_fid)
        );
        assert_eq!(interner.intern_path(probe), path_fid);
        assert_eq!(
            interner.intern_authoritative(probe, IdKind::Path),
            (path_fid, None)
        );

        // Virtual lookups still match verbatim, and the virtual entry keeps its kind.
        assert_eq!(
            interner.get_module_if_interned(probe, IdKind::Virtual),
            Some(virt_fid)
        );
        assert_eq!(interner.lookup_kind(virt_fid), IdKind::Virtual);
        assert_eq!(interner.len(), 2);
    }

    #[cfg(unix)]
    #[test]
    fn test_non_utf8_path_round_trips_through_lookup_path() {
        use std::ffi::OsStr;
        use std::os::unix::ffi::OsStrExt;

        let interner = FileIdInterner::new();
        let path = Path::new(OsStr::from_bytes(b"/src/caf\xe9.ts"));
        let fid = interner.intern_path(path);
        assert_eq!(interner.lookup_path(fid), path);
        assert_eq!(interner.lookup_id(fid), ModuleId::from("/src/caf\u{fffd}.ts"));
        assert_eq!(interner.intern_path(path), fid);
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
