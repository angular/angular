/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

import {absoluteFromSourceFile, dirname, isLocalRelativePath, relative, resolve, toRelativeImport} from './helpers';
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
    const relativePath = relative(dirname(resolve(from)), resolve(to));
    return toRelativeImport(relativePath) as PathSegment;
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
   * The same root directories as `rootDirs` but with each one converted to its
   * canonical form for matching in case-insensitive file-systems.
   */
  private canonicalRootDirs: AbsoluteFsPath[];

  /**
   * A cache of file paths to project paths, because computation of these paths is slightly
   * expensive.
   */
  private cache: Map<AbsoluteFsPath, LogicalProjectPath|null> = new Map();

  constructor(
      rootDirs: AbsoluteFsPath[],
      private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>) {
    // Make a copy and sort it by length in reverse order (longest first). This speeds up lookups,
    // since there's no need to keep going through the array once a match is found.
    this.rootDirs = rootDirs.concat([]).sort((a, b) => b.length - a.length);
    this.canonicalRootDirs =
        this.rootDirs.map(dir => this.compilerHost.getCanonicalFileName(dir) as AbsoluteFsPath);
  }

  /**
   * Get the logical path in the project of a `ts.SourceFile`.
   *
   * This method is provided as a convenient alternative to calling
   * `logicalPathOfFile(absoluteFromSourceFile(sf))`.
   */
  logicalPathOfSf(sf: ts.SourceFile): LogicalProjectPath|null {
    return this.logicalPathOfFile(absoluteFromSourceFile(sf));
  }

  /**
   * Get the logical path in the project of a source file.
   *
   * @returns A `LogicalProjectPath` to the source file, or `null` if the source file is not in any
   * of the TS project's root directories.
   */
  logicalPathOfFile(physicalFile: AbsoluteFsPath): LogicalProjectPath|null {
    if (!this.cache.has(physicalFile)) {
      const canonicalFilePath =
          this.compilerHost.getCanonicalFileName(physicalFile) as AbsoluteFsPath;
      let logicalFile: LogicalProjectPath|null = null;
      for (let i = 0; i < this.rootDirs.length; i++) {
        const rootDir = this.rootDirs[i];
        const canonicalRootDir = this.canonicalRootDirs[i];
        if (isWithinBasePath(canonicalRootDir, canonicalFilePath)) {
          // Note that we match against canonical paths but then create the logical path from
          // original paths.
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
    return this.cache.get(physicalFile)!;
  }

  private createLogicalProjectPath(file: AbsoluteFsPath, rootDir: AbsoluteFsPath):
      LogicalProjectPath {
    const logicalPath = stripExtension(file.slice(rootDir.length));
    return (logicalPath.startsWith('/') ? logicalPath : '/' + logicalPath) as LogicalProjectPath;
  }
}

/**
 * Is the `path` a descendant of the `base`?
 * E.g. `foo/bar/zee` is within `foo/bar` but not within `foo/car`.
 */
function isWithinBasePath(base: AbsoluteFsPath, path: AbsoluteFsPath): boolean {
  return isLocalRelativePath(relative(base, path));
}
