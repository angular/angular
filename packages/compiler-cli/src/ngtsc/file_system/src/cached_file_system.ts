/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileStats, FileSystem, PathSegment, PathString} from './types';


/**
 * A wrapper around `FileSystem` that caches hits to `exists()` and
 * `readFile()` to improve performance.
 *
 * Be aware that any changes to the file system from outside of this
 * class could break the cache, leaving it with stale values.
 */
export class CachedFileSystem implements FileSystem {
  private existsCache = new Map<AbsoluteFsPath, boolean>();
  private readFileCache = new Map<AbsoluteFsPath, any>();

  constructor(private delegate: FileSystem) {}

  exists(path: AbsoluteFsPath): boolean {
    if (!this.existsCache.has(path)) {
      this.existsCache.set(path, this.delegate.exists(path));
    }
    return this.existsCache.get(path) !;
  }

  readFile(path: AbsoluteFsPath): string {
    if (!this.readFileCache.has(path)) {
      try {
        if (this.lstat(path).isSymbolicLink()) {
          // don't cache the value of a symbolic link
          return this.delegate.readFile(path);
        }
        this.readFileCache.set(path, this.delegate.readFile(path));
      } catch (e) {
        this.readFileCache.set(path, e);
      }
    }
    const result = this.readFileCache.get(path);
    if (typeof result === 'string') {
      return result;
    } else {
      throw result;
    }
  }

  writeFile(path: AbsoluteFsPath, data: string): void {
    this.delegate.writeFile(path, data);
    this.readFileCache.set(path, data);
    this.existsCache.set(path, true);
  }

  symlink(target: AbsoluteFsPath, path: AbsoluteFsPath): void {
    this.delegate.symlink(target, path);
    this.existsCache.set(path, true);
  }

  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    this.delegate.copyFile(from, to);
    this.existsCache.set(to, true);
  }

  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    this.delegate.moveFile(from, to);
    this.existsCache.set(from, false);
    if (this.readFileCache.has(from)) {
      this.readFileCache.set(to, this.readFileCache.get(from));
      this.readFileCache.delete(from);
    }
    this.existsCache.set(to, true);
  }

  mkdir(path: AbsoluteFsPath): void {
    this.delegate.mkdir(path);
    this.existsCache.set(path, true);
  }

  ensureDir(path: AbsoluteFsPath): void {
    this.delegate.ensureDir(path);
    while (!this.isRoot(path)) {
      this.existsCache.set(path, true);
      path = this.dirname(path);
    }
  }

  lstat(path: AbsoluteFsPath): FileStats {
    const stat = this.delegate.lstat(path);
    // if the `path` does not exist then `lstat` will thrown an error.
    this.existsCache.set(path, true);
    return stat;
  }

  stat(path: AbsoluteFsPath): FileStats {
    const stat = this.delegate.stat(path);
    // if the `path` does not exist then `stat` will thrown an error.
    this.existsCache.set(path, true);
    return stat;
  }

  // The following methods simply call through to the delegate.
  readdir(path: AbsoluteFsPath): PathSegment[] { return this.delegate.readdir(path); }
  pwd(): AbsoluteFsPath { return this.delegate.pwd(); }
  extname(path: AbsoluteFsPath|PathSegment): string { return this.delegate.extname(path); }
  isCaseSensitive(): boolean { return this.delegate.isCaseSensitive(); }
  isRoot(path: AbsoluteFsPath): boolean { return this.delegate.isRoot(path); }
  isRooted(path: string): boolean { return this.delegate.isRooted(path); }
  resolve(...paths: string[]): AbsoluteFsPath { return this.delegate.resolve(...paths); }
  dirname<T extends PathString>(file: T): T { return this.delegate.dirname(file); }
  join<T extends PathString>(basePath: T, ...paths: string[]): T {
    return this.delegate.join(basePath, ...paths);
  }
  relative<T extends PathString>(from: T, to: T): PathSegment {
    return this.delegate.relative(from, to);
  }
  basename(filePath: string, extension?: string|undefined): PathSegment {
    return this.delegate.basename(filePath, extension);
  }
  realpath(filePath: AbsoluteFsPath): AbsoluteFsPath { return this.delegate.realpath(filePath); }
  getDefaultLibLocation(): AbsoluteFsPath { return this.delegate.getDefaultLibLocation(); }
  normalize<T extends PathString>(path: T): T { return this.delegate.normalize(path); }
}
