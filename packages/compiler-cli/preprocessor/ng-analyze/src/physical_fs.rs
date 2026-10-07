//! The physical filesystem layer beneath [`crate::fs::OverlayFileSystem`].
//!
//! `OverlayFileSystem` resolves virtual (in-memory) files first and otherwise falls
//! through to "the real filesystem". What *real* means depends on the build:
//!
//! - **native** — [`NativeFs`], a direct pass-through to [`std::fs`].
//! - **wasm32-unknown-unknown** — [`HostFs`], which calls back into the JavaScript host.
//!   The bare wasm target has no OS beneath it, so `std::fs` compiles but fails at
//!   runtime for every call; without a host bridge the engine can only ever see
//!   virtual files.
//!
//! Every method is synchronous because [`oxc_resolver::FileSystem`] is a synchronous
//! trait and the entire query engine is built on it. On wasm that means the host must
//! expose synchronous primitives (`fs.readFileSync` and friends), which is why the
//! wasm engine targets Node rather than the browser.

use oxc_resolver::FileMetadata;
use std::io::Result;
use std::path::{Path, PathBuf};

/// A single entry produced by [`PhysicalFs::read_dir`].
#[derive(Clone, Debug)]
pub struct DirEntry {
    /// File name relative to the directory that was read.
    pub name: String,
    pub is_file: bool,
    pub is_dir: bool,
    pub is_symlink: bool,
}

/// Synchronous access to the underlying (non-virtual) filesystem.
///
/// `Send + Sync` is required transitively: `OverlayFileSystem` implements
/// [`oxc_resolver::FileSystem`], which is `Send + Sync`, and holds one of these.
pub trait PhysicalFs: Send + Sync {
    fn read(&self, path: &Path) -> Result<Vec<u8>>;
    fn read_to_string(&self, path: &Path) -> Result<String>;
    fn metadata(&self, path: &Path) -> Result<FileMetadata>;
    fn symlink_metadata(&self, path: &Path) -> Result<FileMetadata>;
    fn read_link(&self, path: &Path) -> Result<PathBuf>;
    fn canonicalize(&self, path: &Path) -> Result<PathBuf>;
    fn read_dir(&self, path: &Path) -> Result<Vec<DirEntry>>;

    fn exists(&self, path: &Path) -> bool {
        self.metadata(path).is_ok()
    }

    fn is_file(&self, path: &Path) -> bool {
        self.metadata(path).map(|m| m.is_file()).unwrap_or(false)
    }

    fn is_dir(&self, path: &Path) -> bool {
        self.metadata(path).map(|m| m.is_dir()).unwrap_or(false)
    }
}

// ---------------------------------------------------------------------------
// Native
// ---------------------------------------------------------------------------

/// Pass-through to [`std::fs`]. Used on every non-wasm target.
#[cfg(not(target_arch = "wasm32"))]
#[derive(Debug, Default, Clone, Copy)]
pub struct NativeFs;

#[cfg(not(target_arch = "wasm32"))]
impl PhysicalFs for NativeFs {
    fn read(&self, path: &Path) -> Result<Vec<u8>> {
        std::fs::read(path)
    }

    fn read_to_string(&self, path: &Path) -> Result<String> {
        std::fs::read_to_string(path)
    }

    fn metadata(&self, path: &Path) -> Result<FileMetadata> {
        std::fs::metadata(path).map(|m| FileMetadata::new(m.is_file(), m.is_dir(), m.is_symlink()))
    }

    fn symlink_metadata(&self, path: &Path) -> Result<FileMetadata> {
        std::fs::symlink_metadata(path)
            .map(|m| FileMetadata::new(m.is_file(), m.is_dir(), m.is_symlink()))
    }

    fn read_link(&self, path: &Path) -> Result<PathBuf> {
        std::fs::read_link(path)
    }

    fn canonicalize(&self, path: &Path) -> Result<PathBuf> {
        std::fs::canonicalize(path)
    }

    fn read_dir(&self, path: &Path) -> Result<Vec<DirEntry>> {
        let mut out = Vec::new();
        for entry in std::fs::read_dir(path)? {
            let entry = entry?;
            // `file_type()` does not follow symlinks, matching symlink_metadata.
            let file_type = entry.file_type()?;
            out.push(DirEntry {
                name: entry.file_name().to_string_lossy().into_owned(),
                is_file: file_type.is_file(),
                is_dir: file_type.is_dir(),
                is_symlink: file_type.is_symlink(),
            });
        }
        Ok(out)
    }
}

// ---------------------------------------------------------------------------
// Wasm host bridge
// ---------------------------------------------------------------------------

/// The JavaScript-backed filesystem used by the `wasm32-unknown-unknown` build.
///
/// Owns its host handle, so each analyzer can be given a different filesystem — two
/// `WasmAnalyzer`s in one process do not interfere.
///
/// This satisfies the `Send + Sync` bound that `oxc_resolver::FileSystem` imposes
/// without any `unsafe`: wasm-bindgen implements `Send`/`Sync` for `JsValue` when the
/// build has no atomics, which is the case for this single-threaded target. (Under
/// `+atomics` those impls disappear, and this would stop compiling rather than
/// silently becoming unsound.) An `Arc` alone is enough — no `Mutex` — because every
/// host call takes `&self`.
#[cfg(target_arch = "wasm32")]
#[derive(Clone)]
pub struct HostFs {
    host: std::sync::Arc<host::JsHostFs>,
}

#[cfg(target_arch = "wasm32")]
impl HostFs {
    pub fn new(host: host::JsHostFs) -> Self {
        Self {
            host: std::sync::Arc::new(host),
        }
    }
}

#[cfg(target_arch = "wasm32")]
mod host {
    use super::{DirEntry, FileMetadata};
    use std::io::{Error, ErrorKind, Result};
    use std::path::{Path, PathBuf};
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    extern "C" {
        /// The host object supplied by JavaScript. Method names mirror
        /// `WasmHostFs` in `src/wasm_host_fs.ts`.
        pub type JsHostFs;

        #[wasm_bindgen(method, catch, js_name = "read")]
        fn read(this: &JsHostFs, path: &str) -> std::result::Result<JsValue, JsValue>;
        #[wasm_bindgen(method, catch, js_name = "metadata")]
        fn metadata(this: &JsHostFs, path: &str) -> std::result::Result<JsValue, JsValue>;
        #[wasm_bindgen(method, catch, js_name = "symlinkMetadata")]
        fn symlink_metadata(this: &JsHostFs, path: &str) -> std::result::Result<JsValue, JsValue>;
        #[wasm_bindgen(method, catch, js_name = "readLink")]
        fn read_link(this: &JsHostFs, path: &str) -> std::result::Result<JsValue, JsValue>;
        #[wasm_bindgen(method, catch, js_name = "canonicalize")]
        fn canonicalize(this: &JsHostFs, path: &str) -> std::result::Result<JsValue, JsValue>;
        #[wasm_bindgen(method, catch, js_name = "readDir")]
        fn read_dir(this: &JsHostFs, path: &str) -> std::result::Result<JsValue, JsValue>;
    }

    fn missing(path: &Path) -> Error {
        Error::new(ErrorKind::NotFound, format!("{}", path.display()))
    }

    /// Calls `f` against `host`, mapping a thrown or absent result to an `io::Error`
    /// so callers see ordinary filesystem semantics.
    fn with_host<T>(
        host: &JsHostFs,
        op: &str,
        path: &Path,
        f: impl FnOnce(&JsHostFs, &str) -> std::result::Result<JsValue, JsValue>,
        convert: impl FnOnce(JsValue) -> Option<T>,
    ) -> Result<T> {
        let path_str = path.to_string_lossy();
        let value = f(host, &path_str).map_err(|err| {
            Error::other(format!(
                "{op} failed for {}: {}",
                path.display(),
                describe(&err)
            ))
        })?;
        if value.is_null() || value.is_undefined() {
            return Err(missing(path));
        }
        convert(value).ok_or_else(|| {
            Error::other(format!(
                "{op} returned an unexpected shape for {}",
                path.display()
            ))
        })
    }

    fn describe(value: &JsValue) -> String {
        value
            .as_string()
            .or_else(|| {
                js_sys::Reflect::get(value, &JsValue::from_str("message"))
                    .ok()?
                    .as_string()
            })
            .unwrap_or_else(|| format!("{value:?}"))
    }

    fn to_metadata(value: JsValue) -> Option<FileMetadata> {
        let get = |key: &str| {
            js_sys::Reflect::get(&value, &JsValue::from_str(key))
                .ok()
                .and_then(|v| v.as_bool())
                .unwrap_or(false)
        };
        Some(FileMetadata::new(
            get("isFile"),
            get("isDir"),
            get("isSymlink"),
        ))
    }

    pub fn read(host: &JsHostFs, path: &Path) -> Result<Vec<u8>> {
        with_host(
            host,
            "read",
            path,
            |h, p| h.read(p),
            |v| Some(js_sys::Uint8Array::new(&v).to_vec()),
        )
    }

    pub fn metadata(host: &JsHostFs, path: &Path) -> Result<FileMetadata> {
        with_host(host, "metadata", path, |h, p| h.metadata(p), to_metadata)
    }

    pub fn symlink_metadata(host: &JsHostFs, path: &Path) -> Result<FileMetadata> {
        with_host(
            host,
            "symlinkMetadata",
            path,
            |h, p| h.symlink_metadata(p),
            to_metadata,
        )
    }

    pub fn read_link(host: &JsHostFs, path: &Path) -> Result<PathBuf> {
        with_host(
            host,
            "readLink",
            path,
            |h, p| h.read_link(p),
            |v| v.as_string().map(PathBuf::from),
        )
    }

    pub fn canonicalize(host: &JsHostFs, path: &Path) -> Result<PathBuf> {
        with_host(
            host,
            "canonicalize",
            path,
            |h, p| h.canonicalize(p),
            |v| v.as_string().map(PathBuf::from),
        )
    }

    pub fn read_dir(host: &JsHostFs, path: &Path) -> Result<Vec<DirEntry>> {
        with_host(
            host,
            "readDir",
            path,
            |h, p| h.read_dir(p),
            |value| {
                let array = js_sys::Array::from(&value);
                let mut out = Vec::with_capacity(array.length() as usize);
                for item in array.iter() {
                    let get_bool = |key: &str| {
                        js_sys::Reflect::get(&item, &JsValue::from_str(key))
                            .ok()
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false)
                    };
                    let name = js_sys::Reflect::get(&item, &JsValue::from_str("name"))
                        .ok()
                        .and_then(|v| v.as_string())?;
                    out.push(DirEntry {
                        name,
                        is_file: get_bool("isFile"),
                        is_dir: get_bool("isDir"),
                        is_symlink: get_bool("isSymlink"),
                    });
                }
                Some(out)
            },
        )
    }
}

#[cfg(target_arch = "wasm32")]
pub use host::JsHostFs;

#[cfg(target_arch = "wasm32")]
impl PhysicalFs for HostFs {
    fn read(&self, path: &Path) -> Result<Vec<u8>> {
        host::read(&self.host, path)
    }

    fn read_to_string(&self, path: &Path) -> Result<String> {
        let bytes = host::read(&self.host, path)?;
        String::from_utf8(bytes).map_err(|_| {
            std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("{} is not valid UTF-8", path.display()),
            )
        })
    }

    fn metadata(&self, path: &Path) -> Result<FileMetadata> {
        host::metadata(&self.host, path)
    }

    fn symlink_metadata(&self, path: &Path) -> Result<FileMetadata> {
        host::symlink_metadata(&self.host, path)
    }

    fn read_link(&self, path: &Path) -> Result<PathBuf> {
        host::read_link(&self.host, path)
    }

    fn canonicalize(&self, path: &Path) -> Result<PathBuf> {
        host::canonicalize(&self.host, path)
    }

    fn read_dir(&self, path: &Path) -> Result<Vec<DirEntry>> {
        host::read_dir(&self.host, path)
    }
}

// ---------------------------------------------------------------------------
// Default selection
// ---------------------------------------------------------------------------

/// A physical filesystem that has nothing behind it.
///
/// The wasm default when no host is supplied. Every operation reports "unsupported"
/// rather than "not found", so a caller who forgot the host gets an actionable error
/// instead of a project that mysteriously contains no files. Virtual files are
/// unaffected — the overlay answers those before consulting this layer.
#[cfg(target_arch = "wasm32")]
#[derive(Debug, Default, Clone, Copy)]
pub struct NoopFs;

#[cfg(target_arch = "wasm32")]
impl NoopFs {
    fn unsupported<T>(op: &str, path: &Path) -> Result<T> {
        Err(std::io::Error::new(
            std::io::ErrorKind::Unsupported,
            format!(
                "{op} {}: the WebAssembly engine has no filesystem host installed, so it \
                 can only reach files supplied via `virtualFiles`.",
                path.display()
            ),
        ))
    }
}

#[cfg(target_arch = "wasm32")]
impl PhysicalFs for NoopFs {
    fn read(&self, path: &Path) -> Result<Vec<u8>> {
        Self::unsupported("read", path)
    }
    fn read_to_string(&self, path: &Path) -> Result<String> {
        Self::unsupported("read", path)
    }
    fn metadata(&self, path: &Path) -> Result<FileMetadata> {
        Self::unsupported("metadata", path)
    }
    fn symlink_metadata(&self, path: &Path) -> Result<FileMetadata> {
        Self::unsupported("symlinkMetadata", path)
    }
    fn read_link(&self, path: &Path) -> Result<PathBuf> {
        Self::unsupported("readLink", path)
    }
    fn canonicalize(&self, path: &Path) -> Result<PathBuf> {
        Self::unsupported("canonicalize", path)
    }
    fn read_dir(&self, path: &Path) -> Result<Vec<DirEntry>> {
        Self::unsupported("readDir", path)
    }
}

/// The [`PhysicalFs`] used when a caller does not supply one.
#[cfg(not(target_arch = "wasm32"))]
pub type DefaultPhysicalFs = NativeFs;

/// The [`PhysicalFs`] used when a caller does not supply one.
///
/// Not [`HostFs`]: that needs a JavaScript host, and there is no ambient one to fall
/// back on now that each analyzer owns its own.
#[cfg(target_arch = "wasm32")]
pub type DefaultPhysicalFs = NoopFs;

/// Constructs the default physical filesystem for this build.
pub fn default_physical_fs() -> DefaultPhysicalFs {
    DefaultPhysicalFs::default()
}
