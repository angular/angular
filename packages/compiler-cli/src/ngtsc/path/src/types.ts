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
 * A fully qualified path in the file system, in POSIX form.
 *
 * An `AbsoluteFsPath` is not assignable to a `string` and vice versa,
 * but the runtime type is actually a string.
 *
 * You must use `AbsoluteFsPath.from()` and `AbsoluteFsPath.toString()`
 * to convert.
 */
export interface AbsoluteFsPath extends String { _brand: 'AbsoluteFsPath'; }

/**
 * A path that's relative to another (unspecified) root.
 *
 * This does not necessarily have to refer to a physical file.
 *
 * A `PathSegment` is not assignable to a `string` and vice versa,
 * but the runtime type is actually a string.
 *
 * You must use `PathSegment.fromFsPath()` and `PathSegment.toString()`
 * to convert.
 */
export interface PathSegment extends String { _brand: 'PathSegment'; }

/**
 * A path that is used to specify where to import a module from.
 * This could be relative or absolute.
 */
export type ModuleSpecifier = AbsoluteFsPath | PathSegment;

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
      throw new Error(`Internal Error: AbsoluteFsPath.from("${str}"): path is not absolute`);
    }
    return normalized as any as AbsoluteFsPath;
  },

  /**
   * Extract an `AbsoluteFsPath` from a `ts.SourceFile`.
   *
   * This is cheaper than calling `AbsoluteFsPath.from(sf.fileName)`, as source files already have
   * their file path in absolute POSIX format.
   */
  fromSourceFile: function(sf: ts.SourceFile): AbsoluteFsPath {
    // ts.SourceFile paths are always absolute.
    if (sf.fileName !== AbsoluteFsPath.from(sf.fileName).toString()) {
      throw new Error(`Bad file cast: ${sf.fileName} -> ${AbsoluteFsPath.from(sf.fileName)}`);
    }
    return sf.fileName as any as AbsoluteFsPath;
  },

  /**
   * Wrapper around `path.dirname` that returns an absolute path.
   */
  dirname: function(file: AbsoluteFsPath):
      AbsoluteFsPath { return path.dirname(file as any as string) as any;},

  /**
   * Wrapper around `path.join` that returns an absolute path.
   */
  join: function(basePath: AbsoluteFsPath, ...paths: Array<PathSegment|AbsoluteFsPath|string>):
      AbsoluteFsPath {
        return path.posix.join(basePath as any as string, ...(paths as string[])) as any;
      },

  /**
   * Wrapper around `path.resolve` that returns an absolute paths.
   */
  resolve: function(
      basePath: AbsoluteFsPath|string, ...paths: Array<AbsoluteFsPath|PathSegment|string>):
      AbsoluteFsPath {
        return AbsoluteFsPath.from(path.resolve(basePath as string, ...(paths as string[])));
      },

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
    return normalized as any as PathSegment;
  },

  /**
   * Wrapper around `path.relative` that returns a `PathSegment`.
   */
  relative: function(from: AbsoluteFsPath, to: AbsoluteFsPath): PathSegment {
    return PathSegment.fromFsPath(path.relative(from as any as string, to as any as string));
  },

  basename: function(filePath: AbsoluteFsPath|PathSegment, extension?: string):
      PathSegment { return path.basename(filePath.toString(), extension) as any as PathSegment;}
};

/**
 * Contains utility functions for creating and manipulating `ModuleSpecifier`s.
 */
export const ModuleSpecifier = {
  from: function(specifier: string): ModuleSpecifier {
    // This could be a relative PathSegment or an AbsoluteFsPath.
    return specifier as any;
  }
};

export const ANGULAR_CORE_SPECIFIER = ModuleSpecifier.from('@angular/core');
