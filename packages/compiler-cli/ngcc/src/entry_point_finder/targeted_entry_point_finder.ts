/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, PathSegment, join, relative, relativeFrom} from '../../../src/ngtsc/file_system';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {Logger} from '../logging/logger';
import {NgccConfiguration} from '../packages/configuration';
import {EntryPoint, getEntryPointInfo} from '../packages/entry_point';
import {PathMappings} from '../utils';
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
  private unsortedEntryPoints = new Map<AbsoluteFsPath, EntryPoint>();
  private basePaths = getBasePaths(this.basePath, this.pathMappings);

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
    return this.resolver.sortEntryPointsByDependency(
        Array.from(this.unsortedEntryPoints.values()), targetEntryPoint);
  }

  private processNextPath(): void {
    const path = this.unprocessedPaths.shift() !;
    const entryPoint = this.getEntryPoint(path);
    if (entryPoint !== null) {
      this.unsortedEntryPoints.set(entryPoint.path, entryPoint);
      const deps = this.resolver.getEntryPointDependencies(entryPoint);
      deps.dependencies.forEach(dep => {
        if (!this.unsortedEntryPoints.has(dep)) {
          this.unprocessedPaths.push(dep);
        }
      });
    }
  }

  private getEntryPoint(entryPointPath: AbsoluteFsPath): EntryPoint|null {
    const packagePath = this.computePackagePath(entryPointPath);
    return getEntryPointInfo(this.fs, this.config, this.logger, packagePath, entryPointPath);
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

        // Start the search at the last nested `node_modules` folder if the relative
        // `entryPointPath` contains one or more.
        let nodeModulesIndex = segments.lastIndexOf(relativeFrom('node_modules'));
        while (nodeModulesIndex >= 0) {
          packagePath = join(packagePath, segments.shift() !);
          nodeModulesIndex--;
        }

        // Note that we skip the first `packagePath` and start looking from the first folder below
        // it because that will be the `node_modules` folder.
        for (const segment of segments) {
          packagePath = join(packagePath, segment);
          if (this.fs.exists(join(packagePath, 'package.json'))) {
            return packagePath;
          }
        }

        // If we got here then we couldn't find a `packagePath` for the current `basePath` but since
        // `basePath`s are guaranteed not to be a sub-directory each other then no other `basePath`
        // will match either.
        break;
      }
    }
    // If we get here then none of the `basePaths` matched the `entryPointPath`, which
    // is somewhat unexpected and means that this entry-point lives completely outside
    // any of the `basePaths`.
    // All we can do is assume that his entry-point is a primary entry-point to a package.
    return entryPointPath;
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
