/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
 * A basic interface to abstract the underlying file-system.
 *
 * This makes it easier to provide mock file-systems in unit tests,
 * but also to create clever file-systems that have features such as caching.
 */
export interface FileSystem {
  exists(path: AbsoluteFsPath): boolean;
  readFile(path: AbsoluteFsPath): string;
  writeFile(path: AbsoluteFsPath, data: string): void;
  symlink(target: AbsoluteFsPath, path: AbsoluteFsPath): void;
  readdir(path: AbsoluteFsPath): PathSegment[];
  lstat(path: AbsoluteFsPath): FileStats;
  stat(path: AbsoluteFsPath): FileStats;
  pwd(): AbsoluteFsPath;
  extname(path: AbsoluteFsPath|PathSegment): string;
  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
  mkdir(path: AbsoluteFsPath): void;
  ensureDir(path: AbsoluteFsPath): void;
  isCaseSensitive(): boolean;
  isRoot(path: AbsoluteFsPath): boolean;
  isRooted(path: string): boolean;
  resolve(...paths: string[]): AbsoluteFsPath;
  dirname<T extends PathString>(file: T): T;
  join<T extends PathString>(basePath: T, ...paths: string[]): T;
  relative<T extends PathString>(from: T, to: T): PathSegment;
  basename(filePath: string, extension?: string): PathSegment;
  realpath(filePath: AbsoluteFsPath): AbsoluteFsPath;
  getDefaultLibLocation(): AbsoluteFsPath;
  normalize<T extends PathString>(path: T): T;
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
