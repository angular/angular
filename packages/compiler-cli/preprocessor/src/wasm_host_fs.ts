/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Filesystem bridge for the WebAssembly analysis engine.
 *
 * The engine targets `wasm32-unknown-unknown`, which has no operating system
 * beneath it: Rust's `std::fs` compiles but fails at runtime for every call. Without
 * a bridge the engine can only see files handed to it through `virtualFiles`, so it
 * cannot analyze a project that lives on disk.
 *
 * Every method is synchronous by necessity. `oxc_resolver`'s `FileSystem` trait is
 * synchronous and the whole query engine is built on it, so the engine cannot await a
 * host call. That constrains this bridge to environments with synchronous file access
 * — i.e. Node, which is what the engine is built for (`wasm-pack --target nodejs`).
 *
 * Methods return `null` to mean "not found"; throwing is reserved for real I/O
 * failures, which surface on the Rust side as an error rather than a missing file.
 */

import * as fs from 'node:fs';

/** Result of a stat call, as the Rust side expects it. */
export interface HostFileStat {
  isFile: boolean;
  isDir: boolean;
  isSymlink: boolean;
}

/** A single directory entry. `name` is relative to the directory that was read. */
export interface HostDirEntry extends HostFileStat {
  name: string;
}

/**
 * The synchronous filesystem surface the wasm engine calls back into.
 *
 * Implement this to point the engine at something other than the local disk (an
 * in-memory tree, a bundler's module graph, a virtualized workspace).
 */
export interface WasmHostFs {
  read(path: string): Uint8Array | null;
  metadata(path: string): HostFileStat | null;
  symlinkMetadata(path: string): HostFileStat | null;
  readLink(path: string): string | null;
  canonicalize(path: string): string | null;
  readDir(path: string): HostDirEntry[] | null;
}

/** Error codes that mean "this path isn't there", as opposed to a real I/O failure. */
const NOT_FOUND_CODES = new Set(['ENOENT', 'ENOTDIR', 'ENAMETOOLONG', 'EINVAL']);

function isNotFound(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return code !== undefined && NOT_FOUND_CODES.has(code);
}

/** Runs `op`, converting "missing path" errors into `null` and rethrowing the rest. */
function orNull<T>(op: () => T): T | null {
  try {
    return op();
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function toStat(stats: fs.Stats): HostFileStat {
  return {
    isFile: stats.isFile(),
    isDir: stats.isDirectory(),
    isSymlink: stats.isSymbolicLink(),
  };
}

/**
 * A {@link WasmHostFs} backed by the local filesystem via Node's synchronous APIs.
 *
 * Note on cost: the resolver probes metadata heavily while walking `node_modules`, and
 * every call crosses the wasm boundary. The native engine remains the fast path; this
 * exists so the portable engine can work against a real project at all.
 */
export function createNodeHostFs(): WasmHostFs {
  return {
    read(path) {
      // Copied into a fresh Uint8Array: Buffer is a view onto a pooled allocation,
      // and the Rust side reads the backing store directly.
      const buffer = orNull(() => fs.readFileSync(path));
      return buffer === null ? null : new Uint8Array(buffer);
    },

    metadata(path) {
      // Follows symlinks, matching std::fs::metadata.
      const stats = orNull(() => fs.statSync(path));
      return stats === null ? null : toStat(stats);
    },

    symlinkMetadata(path) {
      // Does not follow symlinks, matching std::fs::symlink_metadata.
      const stats = orNull(() => fs.lstatSync(path));
      return stats === null ? null : toStat(stats);
    },

    readLink(path) {
      return orNull(() => fs.readlinkSync(path, 'utf-8'));
    },

    canonicalize(path) {
      return orNull(() => fs.realpathSync(path));
    },

    readDir(path) {
      const entries = orNull(() => fs.readdirSync(path, {withFileTypes: true}));
      if (entries === null) {
        return null;
      }
      return entries.map((entry) => ({
        name: entry.name,
        // Dirent reflects the entry's own type without following symlinks, which is
        // what the Rust walker needs to avoid descending into symlinked directories.
        isFile: entry.isFile(),
        isDir: entry.isDirectory(),
        isSymlink: entry.isSymbolicLink(),
      }));
    },
  };
}
