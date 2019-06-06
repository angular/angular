/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, join, resolve} from '../../../src/ngtsc/file_system';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {Logger} from '../logging/logger';
import {PathMappings} from '../utils';

import {EntryPoint, getEntryPointInfo} from './entry_point';

export class EntryPointFinder {
  constructor(
      private fs: FileSystem, private logger: Logger, private resolver: DependencyResolver) {}
  /**
   * Search the given directory, and sub-directories, for Angular package entry points.
   * @param sourceDirectory An absolute path to the directory to search for entry points.
   */
  findEntryPoints(
      sourceDirectory: AbsoluteFsPath, targetEntryPointPath?: AbsoluteFsPath,
      pathMappings?: PathMappings): SortedEntryPointsInfo {
    const basePaths = this.getBasePaths(sourceDirectory, pathMappings);
    const unsortedEntryPoints = basePaths.reduce<EntryPoint[]>(
        (entryPoints, basePath) => entryPoints.concat(this.walkDirectoryForEntryPoints(basePath)),
        []);
    const targetEntryPoint = targetEntryPointPath ?
        unsortedEntryPoints.find(entryPoint => entryPoint.path === targetEntryPointPath) :
        undefined;
    return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints, targetEntryPoint);
  }

  /**
   * Extract all the base-paths that we need to search for entry-points.
   *
   * This always contains the standard base-path (`sourceDirectory`).
   * But it also parses the `paths` mappings object to guess additional base-paths.
   *
   * For example:
   *
   * ```
   * getBasePaths('/node_modules', {baseUrl: '/dist', paths: {'*': ['lib/*', 'lib/generated/*']}})
   * > ['/node_modules', '/dist/lib']
   * ```
   *
   * Notice that `'/dist'` is not included as there is no `'*'` path,
   * and `'/dist/lib/generated'` is not included as it is covered by `'/dist/lib'`.
   *
   * @param sourceDirectory The standard base-path (e.g. node_modules).
   * @param pathMappings Path mapping configuration, from which to extract additional base-paths.
   */
  private getBasePaths(sourceDirectory: AbsoluteFsPath, pathMappings?: PathMappings):
      AbsoluteFsPath[] {
    const basePaths = [sourceDirectory];
    if (pathMappings) {
      const baseUrl = resolve(pathMappings.baseUrl);
      values(pathMappings.paths).forEach(paths => paths.forEach(path => {
        basePaths.push(join(baseUrl, extractPathPrefix(path)));
      }));
    }
    basePaths.sort();  // Get the paths in order with the shorter ones first.
    return basePaths.filter(removeDeeperPaths);
  }

  /**
   * Look for entry points that need to be compiled, starting at the source directory.
   * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
   * @param sourceDirectory An absolute path to the root directory where searching begins.
   */
  private walkDirectoryForEntryPoints(sourceDirectory: AbsoluteFsPath): EntryPoint[] {
    const entryPoints = this.getEntryPointsForPackage(sourceDirectory);
    if (entryPoints.length > 0) {
      // The `sourceDirectory` is an entry-point itself so no need to search its sub-directories.
      return entryPoints;
    }

    this.fs
        .readdir(sourceDirectory)
        // Not interested in hidden files
        .filter(p => !p.startsWith('.'))
        // Ignore node_modules
        .filter(p => p !== 'node_modules')
        // Only interested in directories (and only those that are not symlinks)
        .filter(p => {
          const stat = this.fs.lstat(resolve(sourceDirectory, p));
          return stat.isDirectory() && !stat.isSymbolicLink();
        })
        .forEach(p => {
          // Either the directory is a potential package or a namespace containing packages (e.g
          // `@angular`).
          const packagePath = join(sourceDirectory, p);
          entryPoints.push(...this.walkDirectoryForEntryPoints(packagePath));

          // Also check for any nested node_modules in this package
          const nestedNodeModulesPath = join(packagePath, 'node_modules');
          if (this.fs.exists(nestedNodeModulesPath)) {
            entryPoints.push(...this.walkDirectoryForEntryPoints(nestedNodeModulesPath));
          }
        });
    return entryPoints;
  }

  /**
   * Recurse the folder structure looking for all the entry points
   * @param packagePath The absolute path to an npm package that may contain entry points
   * @returns An array of entry points that were discovered.
   */
  private getEntryPointsForPackage(packagePath: AbsoluteFsPath): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];

    // Try to get an entry point from the top level package directory
    const topLevelEntryPoint = getEntryPointInfo(this.fs, this.logger, packagePath, packagePath);

    // If there is no primary entry-point then exit
    if (topLevelEntryPoint === null) {
      return [];
    }

    // Otherwise store it and search for secondary entry-points
    entryPoints.push(topLevelEntryPoint);
    this.walkDirectory(packagePath, subdir => {
      const subEntryPoint = getEntryPointInfo(this.fs, this.logger, packagePath, subdir);
      if (subEntryPoint !== null) {
        entryPoints.push(subEntryPoint);
      }
    });

    return entryPoints;
  }

  /**
   * Recursively walk a directory and its sub-directories, applying a given
   * function to each directory.
   * @param dir the directory to recursively walk.
   * @param fn the function to apply to each directory.
   */
  private walkDirectory(dir: AbsoluteFsPath, fn: (dir: AbsoluteFsPath) => void) {
    return this.fs
        .readdir(dir)
        // Not interested in hidden files
        .filter(p => !p.startsWith('.'))
        // Ignore node_modules
        .filter(p => p !== 'node_modules')
        // Only interested in directories (and only those that are not symlinks)
        .filter(p => {
          const stat = this.fs.lstat(resolve(dir, p));
          return stat.isDirectory() && !stat.isSymbolicLink();
        })
        .forEach(subDir => {
          const resolvedSubDir = resolve(dir, subDir);
          fn(resolvedSubDir);
          this.walkDirectory(resolvedSubDir, fn);
        });
  }
}

/**
 * Extract everything in the `path` up to the first `*`.
 * @param path The path to parse.
 * @returns The extracted prefix.
 */
function extractPathPrefix(path: string) {
  return path.split('*', 1)[0];
}

/**
 * A filter function that removes paths that are already covered by higher paths.
 *
 * @param value The current path.
 * @param index The index of the current path.
 * @param array The array of paths (sorted alphabetically).
 * @returns true if this path is not already covered by a previous path.
 */
function removeDeeperPaths(value: AbsoluteFsPath, index: number, array: AbsoluteFsPath[]) {
  for (let i = 0; i < index; i++) {
    if (value.startsWith(array[i])) return false;
  }
  return true;
}

/**
 * Extract all the values (not keys) from an object.
 * @param obj The object to process.
 */
function values<T>(obj: {[key: string]: T}): T[] {
  return Object.keys(obj).map(key => obj[key]);
}
