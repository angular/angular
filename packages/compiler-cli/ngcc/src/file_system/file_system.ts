/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath, PathSegment} from '../../../src/ngtsc/path';

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
  readdir(path: AbsoluteFsPath): PathSegment[];
  lstat(path: AbsoluteFsPath): FileStats;
  stat(path: AbsoluteFsPath): FileStats;
  pwd(): AbsoluteFsPath;
  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void;
  ensureDir(path: AbsoluteFsPath): void;
}

/**
 * Information about an object in the FileSystem.
 * This is analogous to the `fs.Stats` class in Node.js.
 */
export interface FileStats {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
}
