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
import {NgccConfiguration} from '../packages/configuration';
import {EntryPoint, getEntryPointInfo} from '../packages/entry_point';
import {PathMappings} from '../utils';
import {EntryPointFinder} from './interface';
import {getBasePaths} from './utils';

/**
 * An EntryPointFinder that searches for all entry-points that can be found given a `basePath` and
 * `pathMappings`.
 */
export class DirectoryWalkerEntryPointFinder implements EntryPointFinder {
  private basePaths = getBasePaths(this.sourceDirectory, this.pathMappings);
  constructor(
      private fs: FileSystem, private config: NgccConfiguration, private logger: Logger,
      private resolver: DependencyResolver, private sourceDirectory: AbsoluteFsPath,
      private pathMappings: PathMappings|undefined) {}
  /**
   * Search the `sourceDirectory`, and sub-directories, using `pathMappings` as necessary, to find
   * all package entry-points.
   */
  findEntryPoints(): SortedEntryPointsInfo {
    const unsortedEntryPoints = this.basePaths.reduce<EntryPoint[]>(
        (entryPoints, basePath) => entryPoints.concat(this.walkDirectoryForEntryPoints(basePath)),
        []);
    return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints);
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
    const topLevelEntryPoint =
        getEntryPointInfo(this.fs, this.config, this.logger, packagePath, packagePath);

    // If there is no primary entry-point then exit
    if (topLevelEntryPoint === null) {
      return [];
    }

    // Otherwise store it and search for secondary entry-points
    entryPoints.push(topLevelEntryPoint);
    this.walkDirectory(packagePath, packagePath, (path, isDirectory) => {
      // If the path is a JS file then strip its extension and see if we can match an entry-point.
      const possibleEntryPointPath = isDirectory ? path : stripJsExtension(path);
      const subEntryPoint =
          getEntryPointInfo(this.fs, this.config, this.logger, packagePath, possibleEntryPointPath);
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
  private walkDirectory(
      packagePath: AbsoluteFsPath, dir: AbsoluteFsPath,
      fn: (path: AbsoluteFsPath, isDirectory: boolean) => void) {
    return this.fs
        .readdir(dir)
        // Not interested in hidden files
        .filter(path => !path.startsWith('.'))
        // Ignore node_modules
        .filter(path => path !== 'node_modules')
        .map(path => resolve(dir, path))
        .forEach(path => {
          const stat = this.fs.lstat(path);

          if (stat.isSymbolicLink()) {
            // We are not interested in symbolic links
            return;
          }

          fn(path, stat.isDirectory());

          if (stat.isDirectory()) {
            this.walkDirectory(packagePath, path, fn);
          }
        });
  }
}

function stripJsExtension<T extends string>(filePath: T): T {
  return filePath.replace(/\.js$/, '') as T;
}
