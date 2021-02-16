/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, PathManipulation, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';
import {NgccConfiguration} from '../packages/configuration';
import {PathMappings} from '../path_mappings';

import {EntryPointFinder} from './interface';
import {getBasePaths} from './utils';

/**
 * An EntryPointFinder that starts from a set of initial files and only returns entry-points that
 * are dependencies of these files.
 *
 * This is faster than processing all entry-points in the entire file-system, and is used primarily
 * by the CLI integration.
 *
 * There are two concrete implementations of this class.
 *
 * * `TargetEntryPointFinder` - is given a single entry-point as the initial entry-point. This can
 *   be used in the synchronous CLI integration where the build tool has identified an external
 *   import to one of the source files being built.
 * * `ProgramBasedEntryPointFinder` - computes the initial entry-points from the source files
 *   computed from a `tsconfig.json` file. This can be used in the asynchronous CLI integration
 *   where the `tsconfig.json` to be used to do the build is known.
 */
export abstract class TracingEntryPointFinder implements EntryPointFinder {
  private basePaths: AbsoluteFsPath[]|null = null;

  constructor(
      protected fs: ReadonlyFileSystem, protected config: NgccConfiguration,
      protected logger: Logger, protected resolver: DependencyResolver,
      protected basePath: AbsoluteFsPath, protected pathMappings: PathMappings|undefined) {}

  /**
   * Search for Angular package entry-points.
   */
  findEntryPoints(): SortedEntryPointsInfo {
    const unsortedEntryPoints = new Map<AbsoluteFsPath, EntryPointWithDependencies>();
    const unprocessedPaths = this.getInitialEntryPointPaths();
    while (unprocessedPaths.length > 0) {
      const path = unprocessedPaths.shift()!;
      const entryPointWithDeps = this.getEntryPointWithDeps(path);
      if (entryPointWithDeps === null) {
        continue;
      }
      unsortedEntryPoints.set(entryPointWithDeps.entryPoint.path, entryPointWithDeps);
      entryPointWithDeps.depInfo.dependencies.forEach(dep => {
        if (!unsortedEntryPoints.has(dep)) {
          unprocessedPaths.push(dep);
        }
      });
    }
    return this.resolver.sortEntryPointsByDependency(Array.from(unsortedEntryPoints.values()));
  }


  /**
   * Return an array of entry-point paths from which to start the trace.
   */
  protected abstract getInitialEntryPointPaths(): AbsoluteFsPath[];

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
  protected abstract getEntryPointWithDeps(entryPointPath: AbsoluteFsPath):
      EntryPointWithDependencies|null;


  /**
   * Parse the path-mappings to compute the base-paths that need to be considered when finding
   * entry-points.
   *
   * This processing can be time-consuming if the path-mappings are complex or extensive.
   * So the result is cached locally once computed.
   */
  protected getBasePaths() {
    if (this.basePaths === null) {
      this.basePaths = getBasePaths(this.logger, this.basePath, this.pathMappings);
    }
    return this.basePaths;
  }
}
