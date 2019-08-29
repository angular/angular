/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom, dirname, relative, resolve} from './helpers';
import {AbsoluteFsPath, BrandedPath, PathSegment} from './types';
import {stripExtension} from './util';



/**
 * A path that's relative to the logical root of a TypeScript project (one of the project's
 * rootDirs).
 *
 * Paths in the type system use POSIX format.
 */
export type LogicalProjectPath = BrandedPath<'LogicalProjectPath'>;

export const LogicalProjectPath = {
  /**
   * Get the relative path between two `LogicalProjectPath`s.
   *
   * This will return a `PathSegment` which would be a valid module specifier to use in `from` when
   * importing from `to`.
   */
  relativePathBetween: function(from: LogicalProjectPath, to: LogicalProjectPath): PathSegment {
    let relativePath = relative(dirname(resolve(from)), resolve(to));
    if (!relativePath.startsWith('../')) {
      relativePath = ('./' + relativePath) as PathSegment;
    }
    return relativePath as PathSegment;
  },
};

/**
 * A utility class which can translate absolute paths to source files into logical paths in
 * TypeScript's logical file system, based on the root directories of the project.
 */
export class LogicalFileSystem {
  /**
   * The root directories of the project, sorted with the longest path first.
   */
  private rootDirs: AbsoluteFsPath[];

  /**
   * A cache of file paths to project paths, because computation of these paths is slightly
   * expensive.
   */
  private cache: Map<AbsoluteFsPath, LogicalProjectPath|null> = new Map();

  constructor(rootDirs: AbsoluteFsPath[]) {
    // Make a copy and sort it by length in reverse order (longest first). This speeds up lookups,
    // since there's no need to keep going through the array once a match is found.
    this.rootDirs = rootDirs.concat([]).sort((a, b) => b.length - a.length);
  }

  /**
   * Get the logical path in the project of a `ts.SourceFile`.
   *
   * This method is provided as a convenient alternative to calling
   * `logicalPathOfFile(absoluteFromSourceFile(sf))`.
   */
  logicalPathOfSf(sf: ts.SourceFile): LogicalProjectPath|null {
    return this.logicalPathOfFile(absoluteFrom(sf.fileName));
  }

  /**
   * Get the logical path in the project of a source file.
   *
   * @returns A `LogicalProjectPath` to the source file, or `null` if the source file is not in any
   * of the TS project's root directories.
   */
  logicalPathOfFile(physicalFile: AbsoluteFsPath): LogicalProjectPath|null {
    if (!this.cache.has(physicalFile)) {
      let logicalFile: LogicalProjectPath|null = null;
      for (const rootDir of this.rootDirs) {
        if (physicalFile.startsWith(rootDir)) {
          logicalFile = this.createLogicalProjectPath(physicalFile, rootDir);
          // The logical project does not include any special "node_modules" nested directories.
          if (logicalFile.indexOf('/node_modules/') !== -1) {
            logicalFile = null;
          } else {
            break;
          }
        }
      }
      this.cache.set(physicalFile, logicalFile);
    }
    return this.cache.get(physicalFile) !;
  }

  private createLogicalProjectPath(file: AbsoluteFsPath, rootDir: AbsoluteFsPath):
      LogicalProjectPath {
    const logicalPath = stripExtension(file.substr(rootDir.length));
    return (logicalPath.startsWith('/') ? logicalPath : '/' + logicalPath) as LogicalProjectPath;
  }
}
