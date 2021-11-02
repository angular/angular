/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, PathSegment, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {hasBeenProcessed} from '../packages/build_marker';
import {NgccConfiguration} from '../packages/configuration';
import {EntryPointJsonProperty, getEntryPointInfo, isEntryPoint} from '../packages/entry_point';
import {PathMappings} from '../path_mappings';

import {TracingEntryPointFinder} from './tracing_entry_point_finder';

/**
 * An EntryPointFinder that starts from a target entry-point and only finds
 * entry-points that are dependencies of the target.
 *
 * This is faster than searching the entire file-system for all the entry-points,
 * and is used primarily by the CLI integration.
 */
export class TargetedEntryPointFinder extends TracingEntryPointFinder {
  constructor(
      fs: ReadonlyFileSystem, config: NgccConfiguration, logger: Logger,
      resolver: DependencyResolver, basePath: AbsoluteFsPath, pathMappings: PathMappings|undefined,
      private targetPath: AbsoluteFsPath) {
    super(fs, config, logger, resolver, basePath, pathMappings);
  }

  /**
   * Search for Angular entry-points that can be reached from the entry-point specified by the given
   * `targetPath`.
   */
  override findEntryPoints(): SortedEntryPointsInfo {
    const entryPoints = super.findEntryPoints();

    const invalidTarget =
        entryPoints.invalidEntryPoints.find(i => i.entryPoint.path === this.targetPath);
    if (invalidTarget !== undefined) {
      throw new Error(
          `The target entry-point "${invalidTarget.entryPoint.name}" has missing dependencies:\n` +
          invalidTarget.missingDependencies.map(dep => ` - ${dep}\n`).join(''));
    }
    return entryPoints;
  }

  /**
   * Determine whether the entry-point at the given `targetPath` needs to be processed.
   *
   * @param propertiesToConsider the package.json properties that should be considered for
   *     processing.
   * @param compileAllFormats true if all formats need to be processed, or false if it is enough for
   *     one of the formats covered by the `propertiesToConsider` is processed.
   */
  targetNeedsProcessingOrCleaning(
      propertiesToConsider: EntryPointJsonProperty[], compileAllFormats: boolean): boolean {
    const entryPointWithDeps = this.getEntryPointWithDeps(this.targetPath);
    if (entryPointWithDeps === null) {
      return false;
    }

    for (const property of propertiesToConsider) {
      if (entryPointWithDeps.entryPoint.packageJson[property]) {
        // Here is a property that should be processed.
        if (!hasBeenProcessed(entryPointWithDeps.entryPoint.packageJson, property)) {
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

  /**
   * Return an array containing the `targetPath` from which to start the trace.
   */
  protected override getInitialEntryPointPaths(): AbsoluteFsPath[] {
    return [this.targetPath];
  }

  /**
   * For the given `entryPointPath`, compute, or retrieve, the entry-point information, including
   * paths to other entry-points that this entry-point depends upon.
   *
   * @param entryPointPath the path to the entry-point whose information and dependencies are to be
   *     retrieved or computed.
   *
   * @returns the entry-point and its dependencies or `null` if the entry-point is not compiled by
   *     Angular or cannot be determined.
   */
  protected override getEntryPointWithDeps(entryPointPath: AbsoluteFsPath):
      EntryPointWithDependencies|null {
    const packagePath = this.computePackagePath(entryPointPath);
    const entryPoint =
        getEntryPointInfo(this.fs, this.config, this.logger, packagePath, entryPointPath);
    if (!isEntryPoint(entryPoint) || !entryPoint.compiledByAngular) {
      return null;
    }
    return this.resolver.getEntryPointWithDependencies(entryPoint);
  }

  /**
   * Compute the path to the package that contains the given entry-point.
   *
   * In this entry-point finder it is not trivial to find the containing package, since it is
   * possible that this entry-point is not directly below the directory containing the package.
   * Moreover, the import path could be affected by path-mapping.
   *
   * @param entryPointPath the path to the entry-point, whose package path we want to compute.
   */
  private computePackagePath(entryPointPath: AbsoluteFsPath): AbsoluteFsPath {
    // First try the main basePath, to avoid having to compute the other basePaths from the paths
    // mappings, which can be computationally intensive.
    if (this.isPathContainedBy(this.basePath, entryPointPath)) {
      const packagePath = this.computePackagePathFromContainingPath(entryPointPath, this.basePath);
      if (packagePath !== null) {
        return packagePath;
      }
    }

    // The main `basePath` didn't work out so now we try the `basePaths` computed from the paths
    // mappings in `tsconfig.json`.
    for (const basePath of this.getBasePaths()) {
      if (this.isPathContainedBy(basePath, entryPointPath)) {
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
   * Compute whether the `test` path is contained within the `base` path.
   *
   * Note that this doesn't use a simple `startsWith()` since that would result in a false positive
   * for `test` paths such as `a/b/c-x` when the `base` path is `a/b/c`.
   *
   * Since `fs.relative()` can be quite expensive we check the fast possibilities first.
   */
  private isPathContainedBy(base: AbsoluteFsPath, test: AbsoluteFsPath): boolean {
    return test === base ||
        (test.startsWith(base) && !this.fs.relative(base, test).startsWith('..'));
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
    const segments = this.splitPath(this.fs.relative(containingPath, entryPointPath));
    let nodeModulesIndex = segments.lastIndexOf('node_modules' as PathSegment);

    // If there are no `node_modules` in the relative path between the `basePath` and the
    // `entryPointPath` then just try the `basePath` as the `packagePath`.
    // (This can be the case with path-mapped entry-points.)
    if (nodeModulesIndex === -1) {
      if (this.fs.exists(this.fs.join(packagePath, 'package.json'))) {
        return packagePath;
      }
    }

    // Start the search at the deepest nested `node_modules` folder that is below the `basePath`
    // but above the `entryPointPath`, if there are any.
    while (nodeModulesIndex >= 0) {
      packagePath = this.fs.join(packagePath, segments.shift()!);
      nodeModulesIndex--;
    }

    // Note that we start at the folder below the current candidate `packagePath` because the
    // initial candidate `packagePath` is either a `node_modules` folder or the `basePath` with
    // no `package.json`.
    for (const segment of segments) {
      packagePath = this.fs.join(packagePath, segment);
      if (this.fs.exists(this.fs.join(packagePath, 'package.json'))) {
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

    if (this.fs.exists(this.fs.join(packagePath, 'package.json'))) {
      // The directory directly below `node_modules` is a package - use it
      return packagePath;
    } else if (
        this.fs.basename(packagePath).startsWith('@') &&
        this.fs.exists(this.fs.join(scopedPackagePath, 'package.json'))) {
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
   */
  private splitPath(path: PathSegment|AbsoluteFsPath) {
    const segments = [];
    let container = this.fs.dirname(path);
    while (path !== container) {
      segments.unshift(this.fs.basename(path));
      path = container;
      container = this.fs.dirname(container);
    }
    return segments;
  }
}
