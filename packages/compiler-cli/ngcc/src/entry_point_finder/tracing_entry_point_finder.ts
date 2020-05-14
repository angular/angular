/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, join, PathSegment, relative, relativeFrom} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';

import {EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {NgccConfiguration} from '../packages/configuration';
import {EntryPoint, getEntryPointInfo, isEntryPoint} from '../packages/entry_point';
import {PathMappings} from '../path_mappings';

import {EntryPointFinder} from './interface';
import {getBasePaths} from './utils';

/**
 * An EntryPointFinder that starts from a set of initial files and only returns entry-points that
 * are dependencies of these files.
 *
 * This is faster than searching the entire file-system for all the entry-points,
 * and is used primarily by the CLI integration.
 *
 * There are two concrete implementations of this class.
 *
 * * `TargetEntryPointFinder` - is given a single entry-point as the initial entry-point
 * * `ProgramBasedEntryPointFinder` - computes the initial entry-points from program files given by
 * a `tsconfig.json` file.
 */
export abstract class TracingEntryPointFinder implements EntryPointFinder {
  protected unprocessedPaths: AbsoluteFsPath[] = [];
  protected unsortedEntryPoints = new Map<AbsoluteFsPath, EntryPointWithDependencies>();
  private basePaths: AbsoluteFsPath[]|null = null;

  constructor(
      protected fs: FileSystem, protected config: NgccConfiguration, protected logger: Logger,
      protected resolver: DependencyResolver, protected basePath: AbsoluteFsPath,
      protected pathMappings: PathMappings|undefined) {}

  protected getBasePaths() {
    if (this.basePaths === null) {
      this.basePaths = getBasePaths(this.logger, this.basePath, this.pathMappings);
    }
    return this.basePaths;
  }

  findEntryPoints(): SortedEntryPointsInfo {
    this.unprocessedPaths = this.getInitialEntryPointPaths();
    while (this.unprocessedPaths.length > 0) {
      this.processNextPath();
    }
    return this.resolver.sortEntryPointsByDependency(Array.from(this.unsortedEntryPoints.values()));
  }

  protected abstract getInitialEntryPointPaths(): AbsoluteFsPath[];

  protected getEntryPoint(entryPointPath: AbsoluteFsPath): EntryPoint|null {
    const packagePath = this.computePackagePath(entryPointPath);
    const entryPoint =
        getEntryPointInfo(this.fs, this.config, this.logger, packagePath, entryPointPath);

    return isEntryPoint(entryPoint) ? entryPoint : null;
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

  private computePackagePath(entryPointPath: AbsoluteFsPath): AbsoluteFsPath {
    // First try the main basePath, to avoid having to compute the other basePaths from the paths
    // mappings, which can be computationally intensive.
    if (entryPointPath.startsWith(this.basePath)) {
      const packagePath = this.computePackagePathFromContainingPath(entryPointPath, this.basePath);
      if (packagePath !== null) {
        return packagePath;
      }
    }

    // The main `basePath` didn't work out so now we try the `basePaths` computed from the paths
    // mappings in `tsconfig.json`.
    for (const basePath of this.getBasePaths()) {
      if (entryPointPath.startsWith(basePath)) {
        const packagePath = this.computePackagePathFromContainingPath(entryPointPath, basePath);
        if (packagePath !== null) {
          return packagePath;
        }
        // If we got here then we couldn't find a `packagePath` for the current `basePath`.
        // Since `basePath`s are guaranteed not to be a sub-directory of each other then no other
        // `basePath` will match either.
        break;
      }
    }

    // Finally, if we couldn't find a `packagePath` using `basePaths` then try to find the nearest
    // `node_modules` that contains the `entryPointPath`, if there is one, and use it as a
    // `basePath`.
    return this.computePackagePathFromNearestNodeModules(entryPointPath);
  }


  /**
   * Search down to the `entryPointPath` from the `containingPath` for the first `package.json` that
   * we come to. This is the path to the entry-point's containing package. For example if
   * `containingPath` is `/a/b/c` and `entryPointPath` is `/a/b/c/d/e` and there exists
   * `/a/b/c/d/package.json` and `/a/b/c/d/e/package.json`, then we will return `/a/b/c/d`.
   *
   * To account for nested `node_modules` we actually start the search at the last `node_modules` in
   * the `entryPointPath` that is below the `containingPath`. E.g. if `containingPath` is `/a/b/c`
   * and `entryPointPath` is `/a/b/c/d/node_modules/x/y/z`, we start the search at
   * `/a/b/c/d/node_modules`.
   */
  private computePackagePathFromContainingPath(
      entryPointPath: AbsoluteFsPath, containingPath: AbsoluteFsPath): AbsoluteFsPath|null {
    let packagePath = containingPath;
    const segments = this.splitPath(relative(containingPath, entryPointPath));
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
    return null;
  }

  /**
   * Search up the directory tree from the `entryPointPath` looking for a `node_modules` directory
   * that we can use as a potential starting point for computing the package path.
   */
  private computePackagePathFromNearestNodeModules(entryPointPath: AbsoluteFsPath): AbsoluteFsPath {
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
