/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {InvalidFileSystem} from './invalid_file_system';
import {AbsoluteFsPath, FileSystem, PathSegment, PathString} from './types';
import {normalizeSeparators} from './util';

let fs: FileSystem = new InvalidFileSystem();
export function getFileSystem(): FileSystem {
  return fs;
}
export function setFileSystem(fileSystem: FileSystem) {
  fs = fileSystem;
}

/**
 * Convert the path `path` to an `AbsoluteFsPath`, throwing an error if it's not an absolute path.
 */
export function absoluteFrom(path: string): AbsoluteFsPath {
  if (!fs.isRooted(path)) {
    throw new Error(`Internal Error: absoluteFrom(${path}): path is not absolute`);
  }
  return fs.resolve(path);
}

/**
 * Extract an `AbsoluteFsPath` from a `ts.SourceFile`.
 */
export function absoluteFromSourceFile(sf: ts.SourceFile): AbsoluteFsPath {
  return fs.resolve(sf.fileName);
}

/**
 * Convert the path `path` to a `PathSegment`, throwing an error if it's not a relative path.
 */
export function relativeFrom(path: string): PathSegment {
  const normalized = normalizeSeparators(path);
  if (fs.isRooted(normalized)) {
    throw new Error(`Internal Error: relativeFrom(${path}): path is not relative`);
  }
  return normalized as PathSegment;
}

/**
 * Static access to `dirname`.
 */
export function dirname<T extends PathString>(file: T): T {
  return fs.dirname(file);
}

/**
 * Static access to `join`.
 */
export function join<T extends PathString>(basePath: T, ...paths: string[]): T {
  return fs.join(basePath, ...paths);
}

/**
 * Static access to `resolve`s.
 */
export function resolve(basePath: string, ...paths: string[]): AbsoluteFsPath {
  return fs.resolve(basePath, ...paths);
}

/** Returns true when the path provided is the root path. */
export function isRoot(path: AbsoluteFsPath): boolean {
  return fs.isRoot(path);
}

/**
 * Static access to `isRooted`.
 */
export function isRooted(path: string): boolean {
  return fs.isRooted(path);
}

/**
 * Static access to `relative`.
 */
export function relative<T extends PathString>(from: T, to: T): PathSegment|AbsoluteFsPath {
  return fs.relative(from, to);
}

/**
 * Static access to `basename`.
 */
export function basename(filePath: PathString, extension?: string): PathSegment {
  return fs.basename(filePath, extension) as PathSegment;
}

/**
 * Returns true if the given path is locally relative.
 *
 * This is used to work out if the given path is relative (i.e. not absolute) but also is not
 * escaping the current directory.
 */
export function isLocalRelativePath(relativePath: string): boolean {
  return !isRooted(relativePath) && !relativePath.startsWith('..');
}

/**
 * Converts a path to a form suitable for use as a relative module import specifier.
 *
 * In other words it adds the `./` to the path if it is locally relative.
 */
export function toRelativeImport(relativePath: PathSegment|AbsoluteFsPath): PathSegment|
    AbsoluteFsPath {
  return isLocalRelativePath(relativePath) ? `./${relativePath}` as PathSegment : relativePath;
}
