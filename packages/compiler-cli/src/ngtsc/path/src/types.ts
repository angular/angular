/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as path from 'path';
import * as ts from 'typescript';

import {isAbsolutePath, normalizeSeparators} from './util';

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
 * Contains utility functions for creating and manipulating `AbsoluteFsPath`s.
 */
export const AbsoluteFsPath = {
  /**
   * Convert the path `str` to an `AbsoluteFsPath`, throwing an error if it's not an absolute path.
   */
  from: function(str: string): AbsoluteFsPath {
    if (str.startsWith('/') && process.platform === 'win32') {
      // in Windows if it's absolute path and starts with `/` we shall
      // resolve it and return it including the drive.
      str = path.resolve(str);
    }

    const normalized = normalizeSeparators(str);
    if (!isAbsolutePath(normalized)) {
      throw new Error(`Internal Error: AbsoluteFsPath.from(${str}): path is not absolute`);
    }
    return normalized as AbsoluteFsPath;
  },

  /**
   * Assume that the path `str` is an `AbsoluteFsPath` in the correct format already.
   */
  fromUnchecked: function(str: string): AbsoluteFsPath { return str as AbsoluteFsPath;},

  /**
   * Extract an `AbsoluteFsPath` from a `ts.SourceFile`.
   *
   * This is cheaper than calling `AbsoluteFsPath.from(sf.fileName)`, as source files already have
   * their file path in absolute POSIX format.
   */
  fromSourceFile: function(sf: ts.SourceFile): AbsoluteFsPath {
    // ts.SourceFile paths are always absolute.
    return sf.fileName as AbsoluteFsPath;
  },

  /**
   * Wrapper around `path.dirname` that returns an absolute path.
   */
  dirname: function(file: AbsoluteFsPath):
      AbsoluteFsPath { return AbsoluteFsPath.fromUnchecked(path.dirname(file));},

  /**
   * Wrapper around `path.join` that returns an absolute path.
   */
  join: function(basePath: AbsoluteFsPath, ...paths: string[]):
      AbsoluteFsPath { return AbsoluteFsPath.fromUnchecked(path.posix.join(basePath, ...paths));},

  /**
   * Wrapper around `path.resolve` that returns an absolute paths.
   */
  resolve: function(basePath: string, ...paths: string[]):
      AbsoluteFsPath { return AbsoluteFsPath.from(path.resolve(basePath, ...paths));},

  /** Returns true when the path provided is the root path. */
  isRoot: function(path: AbsoluteFsPath): boolean { return AbsoluteFsPath.dirname(path) === path;},
};

/**
 * Contains utility functions for creating and manipulating `PathSegment`s.
 */
export const PathSegment = {
  /**
   * Convert the path `str` to a `PathSegment`, throwing an error if it's not a relative path.
   */
  fromFsPath: function(str: string): PathSegment {
    const normalized = normalizeSeparators(str);
    if (isAbsolutePath(normalized)) {
      throw new Error(`Internal Error: PathSegment.fromFsPath(${str}): path is not relative`);
    }
    return normalized as PathSegment;
  },

  /**
   * Convert the path `str` to a `PathSegment`, while assuming that `str` is already normalized.
   */
  fromUnchecked: function(str: string): PathSegment { return str as PathSegment;},

  /**
   * Wrapper around `path.relative` that returns a `PathSegment`.
   */
  relative: function(from: AbsoluteFsPath, to: AbsoluteFsPath):
      PathSegment { return PathSegment.fromFsPath(path.relative(from, to));},

  basename: function(filePath: string, extension?: string):
      PathSegment { return path.basename(filePath, extension) as PathSegment;}
};
