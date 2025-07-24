/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A `string` representing a specific type of path, with a particular brand `B`.
 *
 * A `string` is not assignable to a `BrandedPath`, but a `BrandedPath` is assignable to a `string`.
 * Two `BrandedPath`s with different brands are not mutually assignable.
 */
export type BrandedPath<B extends string> = string & {
  _brand: B;
};

/**
 * A fully qualified path in the file system, in POSIX form.
 */
export type AbsoluteFsPath = BrandedPath<'AbsoluteFsPath'>;

/**
 * A path that's relative to another (unspecified) root.
 *
 * This does not necessarily have to refer to a physical file.
 */
export type PathSegment = BrandedPath<'PathSegment'>;

/**
 * An abstraction over the path manipulation aspects of a file-system.
 */
export interface PathManipulation {
  extname(path: AbsoluteFsPath | PathSegment): string;
  isRoot(path: AbsoluteFsPath): boolean;
  isRooted(path: string): boolean;
  dirname<T extends PathString>(file: T): T;
  extname(path: AbsoluteFsPath | PathSegment): string;
  join<T extends PathString>(basePath: T, ...paths: string[]): T;
  /**
   * Compute the relative path between `from` and `to`.
   *
   * In file-systems that can have multiple file trees the returned path may not actually be
   * "relative" (i.e. `PathSegment`). For example, Windows can have multiple drives :
   * `relative('c:/a/b', 'd:/a/c')` would be `d:/a/c'.
   */
  relative<T extends PathString>(from: T, to: T): PathSegment | AbsoluteFsPath;
  basename(filePath: string, extension?: string): PathSegment;
  normalize<T extends PathString>(path: T): T;
  resolve(...paths: string[]): AbsoluteFsPath;
  pwd(): AbsoluteFsPath;
  chdir(path: AbsoluteFsPath): void;
}

/**
 * An abstraction over the read-only aspects of a file-system.
 */
export interface ReadonlyFileSystem extends PathManipulation {
  isCaseSensitive(): boolean;
  exists(path: AbsoluteFsPath): boolean;
  readFile(path: AbsoluteFsPath): string;
  readFileBuffer(path: AbsoluteFsPath): Uint8Array;
  readdir(path: AbsoluteFsPath): PathSegment[];
  lstat(path: AbsoluteFsPath): FileStats;
  stat(path: AbsoluteFsPath): FileStats;
  realpath(filePath: AbsoluteFsPath): AbsoluteFsPath;
  getDefaultLibLocation(): AbsoluteFsPath;
}

/**
 * A basic interface to abstract the underlying file-system.
 *
 * This makes it easier to provide mock file-systems in unit tests,
 * but also to create clever file-systems that have features such as caching.
 */
export interface FileSystem extends ReadonlyFileSystem {
  writeFile(path: AbsoluteFsPath, data: string | Uint8Array, exclusive?: boolean): void;
  removeFile(path: AbsoluteFsPath): void;
  symlink(target: AbsoluteFsPath, path: AbsoluteFsPath): void;
  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
  ensureDir(path: AbsoluteFsPath): void;
  removeDeep(path: AbsoluteFsPath): void;
}

export type PathString = string | AbsoluteFsPath | PathSegment;

/**
 * Information about an object in the FileSystem.
 * This is analogous to the `fs.Stats` class in Node.js.
 */
export interface FileStats {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
}
