pub use oxc_ast_visit::utf8_to_utf16::Utf8ToUtf16;

/// The `@angular/core` module specifier. Angular APIs are recognized by the module they are
/// imported from, so this is compared against import specifiers in several places.
pub const ANGULAR_CORE: &str = "@angular/core";
use oxc_resolver::{
    FileSystem, ResolveOptions, ResolverGeneric, TsconfigDiscovery, TsconfigOptions,
    TsconfigReferences,
};
use std::path::Path;

/// Generic concurrent query cache wrapping thread-safe locks and SharedQuery handles.
/// Encapsulates locking boundaries and exposes a highly ergonomic API for concurrent query caches.
pub struct QueryCache<K, V: 'static> {
    map: std::sync::RwLock<std::collections::HashMap<K, crate::SharedQuery<V>>>,
}

impl<K: Eq + std::hash::Hash + Clone, V: 'static> Default for QueryCache<K, V> {
    fn default() -> Self {
        Self::new()
    }
}

impl<K: Eq + std::hash::Hash + Clone, V: 'static> QueryCache<K, V> {
    pub fn new() -> Self {
        Self {
            map: std::sync::RwLock::new(std::collections::HashMap::new()),
        }
    }

    /// Try to get a cached query by key.
    pub fn get(&self, key: &K) -> Option<crate::SharedQuery<V>> {
        let read = self.map.read().unwrap();
        read.get(key).cloned()
    }

    /// Retrieve the query if cached, or compute and cache a new query atomically.
    pub fn get_or_create<F>(&self, key: K, creator: F) -> crate::SharedQuery<V>
    where
        F: FnOnce() -> crate::SharedQuery<V>,
    {
        // 1. Try read lock first
        if let Some(shared) = self.get(&key) {
            return shared;
        }

        // 2. Acquire write lock to insert
        let mut write = self.map.write().unwrap();
        if let Some(shared) = write.get(&key) {
            return shared.clone();
        }

        let shared = creator();
        write.insert(key, shared.clone());
        shared
    }

    /// Remove a key from the cache.
    pub fn remove(&self, key: &K) -> Option<crate::SharedQuery<V>> {
        let mut write = self.map.write().unwrap();
        write.remove(key)
    }

    /// Retain elements matching the predicate.
    pub fn retain<F>(&self, mut f: F)
    where
        F: FnMut(&K, &mut crate::SharedQuery<V>) -> bool,
    {
        let mut write = self.map.write().unwrap();
        write.retain(&mut f);
    }
}

pub(crate) fn create_resolver_with_fs<Fs: FileSystem + 'static>(
    tsconfig_path: &Path,
    fs: Fs,
    preserve_symlinks: bool,
    node_modules_path_override: Option<String>,
) -> ResolverGeneric<Fs> {
    let mut modules = vec!["node_modules".into()];
    if let Some(p) = node_modules_path_override {
        modules.push(p);
    }

    ResolverGeneric::new_with_file_system(
        fs,
        ResolveOptions {
            symlinks: !preserve_symlinks,
            extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
            // TypeScript resolution semantics: a `./x.js` specifier reaches `x.ts`/`x.d.ts`.
            // Published `.d.ts` entry points import their chunk files that way, so without
            // this the declaration chase stops at the package entry.
            extension_alias: vec![
                (
                    ".js".into(),
                    vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ),
                (
                    ".mjs".into(),
                    vec![".mts".into(), ".d.mts".into(), ".mjs".into()],
                ),
                (
                    ".cjs".into(),
                    vec![".cts".into(), ".d.cts".into(), ".cjs".into()],
                ),
            ],
            condition_names: vec!["types".into(), "node".into(), "import".into()],
            modules,
            tsconfig: Some(TsconfigDiscovery::Manual(TsconfigOptions {
                config_file: tsconfig_path.to_path_buf(),
                references: TsconfigReferences::Disabled,
            })),
            ..ResolveOptions::default()
        },
    )
}

pub(crate) fn is_ts_source(path: &Path) -> bool {
    let Some(ext) = path.extension() else {
        return false;
    };
    if ext != "ts" {
        return false;
    }
    let Some(file_name) = path.file_name() else {
        return false;
    };
    if let Some(s) = file_name.to_str() {
        !s.ends_with(".d.ts")
    } else {
        !file_name.to_string_lossy().ends_with(".d.ts")
    }
}

pub(crate) fn is_dts(path: &Path) -> bool {
    let Some(ext) = path.extension() else {
        return false;
    };
    if ext != "ts" {
        return false;
    }
    let Some(file_name) = path.file_name() else {
        return false;
    };
    if let Some(s) = file_name.to_str() {
        s.ends_with(".d.ts")
    } else {
        file_name.to_string_lossy().ends_with(".d.ts")
    }
}

pub(crate) fn is_ts_file(path: &Path) -> bool {
    let Some(ext) = path.extension() else {
        return false;
    };
    if let Some(s) = ext.to_str() {
        matches!(
            s,
            "ts" | "tsx" | "js" | "jsx" | "mts" | "cts" | "mjs" | "cjs"
        ) || is_dts(path)
    } else {
        false
    }
}

#[cfg(test)]
mod tests;
