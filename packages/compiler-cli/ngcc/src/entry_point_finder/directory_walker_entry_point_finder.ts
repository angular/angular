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
import {EntryPoint, INVALID_ENTRY_POINT, NO_ENTRY_POINT, getEntryPointInfo} from '../packages/entry_point';
import {EntryPointManifest} from '../packages/entry_point_manifest';
import {PathMappings} from '../utils';
import {NGCC_DIRECTORY} from '../writing/new_entry_point_file_writer';
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
      private resolver: DependencyResolver, private entryPointManifest: EntryPointManifest,
      private sourceDirectory: AbsoluteFsPath, private pathMappings: PathMappings|undefined) {}
  /**
   * Search the `sourceDirectory`, and sub-directories, using `pathMappings` as necessary, to find
   * all package entry-points.
   */
  findEntryPoints(): SortedEntryPointsInfo {
    const unsortedEntryPoints: EntryPoint[] = [];
    for (const basePath of this.basePaths) {
      let entryPoints = this.entryPointManifest.readEntryPointsUsingManifest(basePath);
      if (entryPoints === null) {
        this.logger.debug(
            `No manifest found for ${basePath} so walking the directories for entry-points.`);
        const startTime = Date.now();
        entryPoints = this.walkDirectoryForEntryPoints(basePath);
        const duration = Math.round((Date.now() - startTime) / 100) / 10;
        this.logger.debug(`Walking directories took ${duration}s.`);

        this.entryPointManifest.writeEntryPointManifest(basePath, entryPoints);
      }
      unsortedEntryPoints.push(...entryPoints);
    }
    return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints);
  }

  /**
   * Look for entry points that need to be compiled, starting at the source directory.
   * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
   * @param sourceDirectory An absolute path to the root directory where searching begins.
   */
  walkDirectoryForEntryPoints(sourceDirectory: AbsoluteFsPath): EntryPoint[] {
    const entryPoints = this.getEntryPointsForPackage(sourceDirectory);
    if (entryPoints === null) {
      return [];
    }

    if (entryPoints.length > 0) {
      // The `sourceDirectory` is an entry point itself so no need to search its sub-directories.
      // Also check for any nested node_modules in this package but only if it was compiled by
      // Angular.
      // It is unlikely that a non Angular entry point has a dependency on an Angular library.
      if (entryPoints.some(e => e.compiledByAngular)) {
        const nestedNodeModulesPath = this.fs.join(sourceDirectory, 'node_modules');
        if (this.fs.exists(nestedNodeModulesPath)) {
          entryPoints.push(...this.walkDirectoryForEntryPoints(nestedNodeModulesPath));
        }
      }

      return entryPoints;
    }

    this.fs
        .readdir(sourceDirectory)
        // Not interested in hidden files
        .filter(p => !p.startsWith('.'))
        // Ignore node_modules
        .filter(p => p !== 'node_modules' && p !== NGCC_DIRECTORY)
        // Only interested in directories (and only those that are not symlinks)
        .filter(p => {
          const stat = this.fs.lstat(resolve(sourceDirectory, p));
          return stat.isDirectory() && !stat.isSymbolicLink();
        })
        .forEach(p => {
          // Package is a potential namespace containing packages (e.g `@angular`).
          const packagePath = join(sourceDirectory, p);
          entryPoints.push(...this.walkDirectoryForEntryPoints(packagePath));
        });
    return entryPoints;
  }

  /**
   * Recurse the folder structure looking for all the entry points
   * @param packagePath The absolute path to an npm package that may contain entry points
   * @returns An array of entry points that were discovered or null when it's not a valid entrypoint
   */
  private getEntryPointsForPackage(packagePath: AbsoluteFsPath): EntryPoint[]|null {
    const entryPoints: EntryPoint[] = [];

    // Try to get an entry point from the top level package directory
    const topLevelEntryPoint =
        getEntryPointInfo(this.fs, this.config, this.logger, packagePath, packagePath);

    // If there is no primary entry-point then exit
    if (topLevelEntryPoint === NO_ENTRY_POINT) {
      return [];
    }

    if (topLevelEntryPoint === INVALID_ENTRY_POINT) {
      return null;
    }

    // Otherwise store it and search for secondary entry-points
    entryPoints.push(topLevelEntryPoint);
    this.walkDirectory(packagePath, packagePath, (path, isDirectory) => {
      if (!path.endsWith('.js') && !isDirectory) {
        return false;
      }

      // If the path is a JS file then strip its extension and see if we can match an entry-point.
      const possibleEntryPointPath = isDirectory ? path : stripJsExtension(path);
      const subEntryPoint =
          getEntryPointInfo(this.fs, this.config, this.logger, packagePath, possibleEntryPointPath);
      if (subEntryPoint === NO_ENTRY_POINT || subEntryPoint === INVALID_ENTRY_POINT) {
        return false;
      }
      entryPoints.push(subEntryPoint);
      return true;
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
      fn: (path: AbsoluteFsPath, isDirectory: boolean) => boolean) {
    return this.fs
        .readdir(dir)
        // Not interested in hidden files
        .filter(path => !path.startsWith('.'))
        // Ignore node_modules
        .filter(path => path !== 'node_modules' && path !== NGCC_DIRECTORY)
        .forEach(path => {
          const absolutePath = resolve(dir, path);
          const stat = this.fs.lstat(absolutePath);

          if (stat.isSymbolicLink()) {
            // We are not interested in symbolic links
            return;
          }

          const containsEntryPoint = fn(absolutePath, stat.isDirectory());
          if (containsEntryPoint) {
            this.walkDirectory(packagePath, absolutePath, fn);
          }
        });
  }
}

function stripJsExtension<T extends string>(filePath: T): T {
  return filePath.replace(/\.js$/, '') as T;
}
