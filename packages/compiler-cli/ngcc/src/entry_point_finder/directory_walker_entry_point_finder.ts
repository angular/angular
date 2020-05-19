/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, PathSegment} from '../../../src/ngtsc/file_system';
import {EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {Logger} from '../logging/logger';
import {NgccConfiguration} from '../packages/configuration';
import {getEntryPointInfo, INCOMPATIBLE_ENTRY_POINT, NO_ENTRY_POINT} from '../packages/entry_point';
import {EntryPointManifest} from '../packages/entry_point_manifest';
import {PathMappings} from '../path_mappings';
import {NGCC_DIRECTORY} from '../writing/new_entry_point_file_writer';

import {EntryPointFinder} from './interface';
import {getBasePaths, trackDuration} from './utils';

/**
 * An EntryPointFinder that searches for all entry-points that can be found given a `basePath` and
 * `pathMappings`.
 */
export class DirectoryWalkerEntryPointFinder implements EntryPointFinder {
  private basePaths = getBasePaths(this.logger, this.sourceDirectory, this.pathMappings);
  constructor(
      private fs: FileSystem, private config: NgccConfiguration, private logger: Logger,
      private resolver: DependencyResolver, private entryPointManifest: EntryPointManifest,
      private sourceDirectory: AbsoluteFsPath, private pathMappings: PathMappings|undefined) {}
  /**
   * Search the `sourceDirectory`, and sub-directories, using `pathMappings` as necessary, to find
   * all package entry-points.
   */
  findEntryPoints(): SortedEntryPointsInfo {
    const unsortedEntryPoints: EntryPointWithDependencies[] = [];
    for (const basePath of this.basePaths) {
      const entryPoints = this.entryPointManifest.readEntryPointsUsingManifest(basePath) ||
          this.walkBasePathForPackages(basePath);
      entryPoints.forEach(e => unsortedEntryPoints.push(e));
    }
    return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints);
  }

  /**
   * Search the `basePath` for possible Angular packages and entry-points.
   *
   * @param basePath The path at which to start the search
   * @returns an array of `EntryPoint`s that were found within `basePath`.
   */
  walkBasePathForPackages(basePath: AbsoluteFsPath): EntryPointWithDependencies[] {
    this.logger.debug(
        `No manifest found for ${basePath} so walking the directories for entry-points.`);
    const entryPoints = trackDuration(
        () => this.walkDirectoryForPackages(basePath),
        duration => this.logger.debug(`Walking ${basePath} for entry-points took ${duration}s.`));
    this.entryPointManifest.writeEntryPointManifest(basePath, entryPoints);
    return entryPoints;
  }

  /**
   * Look for Angular packages that need to be compiled, starting at the source directory.
   * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
   *
   * @param sourceDirectory An absolute path to the root directory where searching begins.
   * @returns an array of `EntryPoint`s that were found within `sourceDirectory`.
   */
  walkDirectoryForPackages(sourceDirectory: AbsoluteFsPath): EntryPointWithDependencies[] {
    // Try to get a primary entry point from this directory
    const primaryEntryPoint =
        getEntryPointInfo(this.fs, this.config, this.logger, sourceDirectory, sourceDirectory);

    // If there is an entry-point but it is not compatible with ngcc (it has a bad package.json or
    // invalid typings) then exit. It is unlikely that such an entry point has a dependency on an
    // Angular library.
    if (primaryEntryPoint === INCOMPATIBLE_ENTRY_POINT) {
      return [];
    }

    const entryPoints: EntryPointWithDependencies[] = [];
    if (primaryEntryPoint !== NO_ENTRY_POINT) {
      entryPoints.push(this.resolver.getEntryPointWithDependencies(primaryEntryPoint));
      this.collectSecondaryEntryPoints(
          entryPoints, sourceDirectory, sourceDirectory, this.fs.readdir(sourceDirectory));

      // Also check for any nested node_modules in this package but only if at least one of the
      // entry-points was compiled by Angular.
      if (entryPoints.some(e => e.entryPoint.compiledByAngular)) {
        const nestedNodeModulesPath = this.fs.join(sourceDirectory, 'node_modules');
        if (this.fs.exists(nestedNodeModulesPath)) {
          entryPoints.push(...this.walkDirectoryForPackages(nestedNodeModulesPath));
        }
      }

      return entryPoints;
    }

    // The `sourceDirectory` was not a package (i.e. there was no package.json)
    // So search its sub-directories for Angular packages and entry-points
    for (const path of this.fs.readdir(sourceDirectory)) {
      if (isIgnorablePath(path)) {
        // Ignore hidden files, node_modules and ngcc directory
        continue;
      }

      const absolutePath = this.fs.resolve(sourceDirectory, path);
      const stat = this.fs.lstat(absolutePath);
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        // Ignore symbolic links and non-directories
        continue;
      }

      entryPoints.push(...this.walkDirectoryForPackages(this.fs.join(sourceDirectory, path)));
    }

    return entryPoints;
  }

  /**
   * Search the `directory` looking for any secondary entry-points for a package, adding any that
   * are found to the `entryPoints` array.
   *
   * @param entryPoints An array where we will add any entry-points found in this directory
   * @param packagePath The absolute path to the package that may contain entry-points
   * @param directory The current directory being searched
   * @param paths The paths contained in the current `directory`.
   */
  private collectSecondaryEntryPoints(
      entryPoints: EntryPointWithDependencies[], packagePath: AbsoluteFsPath,
      directory: AbsoluteFsPath, paths: PathSegment[]): void {
    for (const path of paths) {
      if (isIgnorablePath(path)) {
        // Ignore hidden files, node_modules and ngcc directory
        continue;
      }

      const absolutePath = this.fs.resolve(directory, path);
      const stat = this.fs.lstat(absolutePath);
      if (stat.isSymbolicLink()) {
        // Ignore symbolic links
        continue;
      }

      const isDirectory = stat.isDirectory();
      if (!path.endsWith('.js') && !isDirectory) {
        // Ignore files that do not end in `.js`
        continue;
      }

      // If the path is a JS file then strip its extension and see if we can match an
      // entry-point.
      const possibleEntryPointPath = isDirectory ? absolutePath : stripJsExtension(absolutePath);
      let isEntryPoint = false;
      const subEntryPoint =
          getEntryPointInfo(this.fs, this.config, this.logger, packagePath, possibleEntryPointPath);
      if (subEntryPoint !== NO_ENTRY_POINT && subEntryPoint !== INCOMPATIBLE_ENTRY_POINT) {
        entryPoints.push(this.resolver.getEntryPointWithDependencies(subEntryPoint));
        isEntryPoint = true;
      }

      if (!isDirectory) {
        // This path is not a directory so we are done.
        continue;
      }

      // This directory may contain entry-points of its own.
      const childPaths = this.fs.readdir(absolutePath);
      if (!isEntryPoint &&
          childPaths.some(
              childPath => childPath.endsWith('.js') &&
                  this.fs.stat(this.fs.resolve(absolutePath, childPath)).isFile())) {
        // We do not consider non-entry-point directories that contain JS files as they are very
        // unlikely to be containers for sub-entry-points.
        continue;
      }
      this.collectSecondaryEntryPoints(entryPoints, packagePath, absolutePath, childPaths);
    }
  }
}

function stripJsExtension<T extends string>(filePath: T): T {
  return filePath.replace(/\.js$/, '') as T;
}

function isIgnorablePath(path: PathSegment): boolean {
  return path.startsWith('.') || path === 'node_modules' || path === NGCC_DIRECTORY;
}
