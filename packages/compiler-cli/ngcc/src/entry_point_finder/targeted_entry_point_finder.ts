/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, join, PathSegment, relative, relativeFrom} from '../../../src/ngtsc/file_system';
import {EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {Logger} from '../logging/logger';
import {hasBeenProcessed} from '../packages/build_marker';
import {NgccConfiguration} from '../packages/configuration';
import {EntryPoint, EntryPointJsonProperty, getEntryPointInfo, INCOMPATIBLE_ENTRY_POINT, NO_ENTRY_POINT} from '../packages/entry_point';
import {PathMappings} from '../path_mappings';

import {EntryPointFinder} from './interface';
import {getBasePaths} from './utils';

/**
 * An EntryPointFinder that starts from a target entry-point and only finds
 * entry-points that are dependencies of the target.
 *
 * This is faster than searching the entire file-system for all the entry-points,
 * and is used primarily by the CLI integration.
 */
export class TargetedEntryPointFinder implements EntryPointFinder {
  private unprocessedPaths: AbsoluteFsPath[] = [];
  private unsortedEntryPoints = new Map<AbsoluteFsPath, EntryPointWithDependencies>();
  private basePaths = getBasePaths(this.logger, this.basePath, this.pathMappings);

  constructor(
      private fs: FileSystem, private config: NgccConfiguration, private logger: Logger,
      private resolver: DependencyResolver, private basePath: AbsoluteFsPath,
      private targetPath: AbsoluteFsPath, private pathMappings: PathMappings|undefined) {}

  findEntryPoints(): SortedEntryPointsInfo {
    this.unprocessedPaths = [this.targetPath];
    while (this.unprocessedPaths.length > 0) {
      this.processNextPath();
    }
    const targetEntryPoint = this.unsortedEntryPoints.get(this.targetPath);
    const entryPoints = this.resolver.sortEntryPointsByDependency(
        Array.from(this.unsortedEntryPoints.values()), targetEntryPoint?.entryPoint);

    const invalidTarget =
        entryPoints.invalidEntryPoints.find(i => i.entryPoint.path === this.targetPath);
    if (invalidTarget !== undefined) {
      throw new Error(
          `The target entry-point "${invalidTarget.entryPoint.name}" has missing dependencies:\n` +
          invalidTarget.missingDependencies.map(dep => ` - ${dep}\n`).join(''));
    }
    return entryPoints;
  }

  targetNeedsProcessingOrCleaning(
      propertiesToConsider: EntryPointJsonProperty[], compileAllFormats: boolean): boolean {
    const entryPoint = this.getEntryPoint(this.targetPath);
    if (entryPoint === null || !entryPoint.compiledByAngular) {
      return false;
    }

    for (const property of propertiesToConsider) {
      if (entryPoint.packageJson[property]) {
        // Here is a property that should be processed.
        if (!hasBeenProcessed(entryPoint.packageJson, property)) {
          return true;
        }
        if (!compileAllFormats) {
          // This property has been processed, and we only need one.
          return false;
        }
      }
    }
    // All `propertiesToConsider` that appear in this entry-point have been processed.
    // In other words, there were no properties that need processing.
    return false;
  }

  private processNextPath(): void {
    const path = this.unprocessedPaths.shift()!;
    const entryPoint = this.getEntryPoint(path);
    if (entryPoint === null || !entryPoint.compiledByAngular) {
      return;
    }
    const entryPointWithDeps = this.resolver.getEntryPointWithDependencies(entryPoint);
    this.unsortedEntryPoints.set(entryPoint.path, entryPointWithDeps);
    entryPointWithDeps.depInfo.dependencies.forEach(dep => {
      if (!this.unsortedEntryPoints.has(dep)) {
        this.unprocessedPaths.push(dep);
      }
    });
  }

  private getEntryPoint(entryPointPath: AbsoluteFsPath): EntryPoint|null {
    const packagePath = this.computePackagePath(entryPointPath);
    const entryPoint =
        getEntryPointInfo(this.fs, this.config, this.logger, packagePath, entryPointPath);
    if (entryPoint === NO_ENTRY_POINT || entryPoint === INCOMPATIBLE_ENTRY_POINT) {
      return null;
    }
    return entryPoint;
  }

  /**
   * Search down to the `entryPointPath` from each `basePath` for the first `package.json` that we
   * come to. This is the path to the entry-point's containing package. For example if `basePath` is
   * `/a/b/c` and `entryPointPath` is `/a/b/c/d/e` and there exists `/a/b/c/d/package.json` and
   * `/a/b/c/d/e/package.json`, then we will return `/a/b/c/d`.
   *
   * To account for nested `node_modules` we actually start the search at the last `node_modules` in
   * the `entryPointPath` that is below the `basePath`. E.g. if `basePath` is `/a/b/c` and
   * `entryPointPath` is `/a/b/c/d/node_modules/x/y/z`, we start the search at
   * `/a/b/c/d/node_modules`.
   */
  private computePackagePath(entryPointPath: AbsoluteFsPath): AbsoluteFsPath {
    for (const basePath of this.basePaths) {
      if (entryPointPath.startsWith(basePath)) {
        let packagePath = basePath;
        const segments = this.splitPath(relative(basePath, entryPointPath));
        let nodeModulesIndex = segments.lastIndexOf(relativeFrom('node_modules'));

        // If there are no `node_modules` in the relative path between the `basePath` and the
        // `entryPointPath` then just try the `basePath` as the `packagePath`.
        // (This can be the case with path-mapped entry-points.)
        if (nodeModulesIndex === -1) {
          if (this.fs.exists(join(packagePath, 'package.json'))) {
            return packagePath;
          }
        }

        // Start the search at the deepest nested `node_modules` folder that is below the `basePath`
        // but above the `entryPointPath`, if there are any.
        while (nodeModulesIndex >= 0) {
          packagePath = join(packagePath, segments.shift()!);
          nodeModulesIndex--;
        }

        // Note that we start at the folder below the current candidate `packagePath` because the
        // initial candidate `packagePath` is either a `node_modules` folder or the `basePath` with
        // no `package.json`.
        for (const segment of segments) {
          packagePath = join(packagePath, segment);
          if (this.fs.exists(join(packagePath, 'package.json'))) {
            return packagePath;
          }
        }

        // If we got here then we couldn't find a `packagePath` for the current `basePath`.
        // Since `basePath`s are guaranteed not to be a sub-directory of each other then no other
        // `basePath` will match either.
        break;
      }
    }

    // We couldn't find a `packagePath` using `basePaths` so try to find the nearest `node_modules`
    // that contains the `entryPointPath`, if there is one, and use it as a `basePath`.
    let packagePath = entryPointPath;
    let scopedPackagePath = packagePath;
    let containerPath = this.fs.dirname(packagePath);
    while (!this.fs.isRoot(containerPath) && !containerPath.endsWith('node_modules')) {
      scopedPackagePath = packagePath;
      packagePath = containerPath;
      containerPath = this.fs.dirname(containerPath);
    }

    if (this.fs.exists(join(packagePath, 'package.json'))) {
      // The directory directly below `node_modules` is a package - use it
      return packagePath;
    } else if (
        this.fs.basename(packagePath).startsWith('@') &&
        this.fs.exists(join(scopedPackagePath, 'package.json'))) {
      // The directory directly below the `node_modules` is a scope and the directory directly
      // below that is a scoped package - use it
      return scopedPackagePath;
    } else {
      // If we get here then none of the `basePaths` contained the `entryPointPath` and the
      // `entryPointPath` contains no `node_modules` that contains a package or a scoped
      // package. All we can do is assume that this entry-point is a primary entry-point to a
      // package.
      return entryPointPath;
    }
  }

  /**
   * Split the given `path` into path segments using an FS independent algorithm.
   * @param path The path to split.
   */
  private splitPath(path: PathSegment) {
    const segments = [];
    while (path !== '.') {
      segments.unshift(this.fs.basename(path));
      path = this.fs.dirname(path);
    }
    return segments;
  }
}
