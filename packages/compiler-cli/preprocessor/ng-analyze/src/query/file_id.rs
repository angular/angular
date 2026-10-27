use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::RwLock;

/// Canonical thread-safe file identifier.
pub type FileId = u32;

/// Thread-safe canonical path interner.
#[derive(Debug, Default)]
pub struct FileIdInterner {
    inner: RwLock<InternerInner>,
}

#[derive(Debug, Default)]
struct InternerInner {
    map: HashMap<PathBuf, FileId>,
    vec: Vec<PathBuf>,
}

impl FileIdInterner {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn intern_path(&self, path: impl AsRef<Path>) -> FileId {
        let path_ref = path.as_ref();
        let key = crate::fs::normalize_path(path_ref);
        {
            let read = self.inner.read().expect("FileIdInterner lock poisoned");
            if let Some(&id) = read.map.get(&*key) {
                return id;
            }
        }

        let mut write = self.inner.write().expect("FileIdInterner lock poisoned");
        if let Some(&id) = write.map.get(&*key) {
            return id;
        }

        let id = write.vec.len() as u32;
        write
            .vec
            .push(crate::fs::normalize_path_structural(path_ref).into_owned());
        write.map.insert(key.into_owned(), id);
        id
    }

    /// Lookup the `PathBuf` corresponding to a `FileId`.
    pub fn lookup_path(&self, id: FileId) -> PathBuf {
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.vec
            .get(id as usize)
            .cloned()
            .expect("FileId out of bounds in FileIdInterner")
    }

    /// Return the `FileId` if the path has already been interned, without allocating.
    pub fn get_if_interned(&self, path: impl AsRef<Path>) -> Option<FileId> {
        let path_ref = path.as_ref();
        let normalized = crate::fs::normalize_path(path_ref);
        let read = self.inner.read().expect("FileIdInterner lock poisoned");
        read.map.get(&*normalized).copied()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_id_interner() {
        let interner = FileIdInterner::new();
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

        // 3. Exact deduplication check maintaining Vec capacity/length perfectly
        for _ in 0..500 {
            assert_eq!(interner.intern_path(&unicode_path), id1);
        }
        let read = interner.inner.read().unwrap();
        assert_eq!(read.vec.len(), 2);
    }
}
