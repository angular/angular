/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {EntryPointWithDependencies} from '../dependencies/dependency_host';
import {DependencyResolver, SortedEntryPointsInfo} from '../dependencies/dependency_resolver';

import {EntryPointsWithDeps} from './entry_points_with_deps/interface';
import {InitialEntryPoints} from './initial_entry_points/interface';
import {EntryPointFinder} from './interface';

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
  constructor(
      protected resolver: DependencyResolver, protected initialEntryPoints: InitialEntryPoints,
      protected entryPointsWithDeps: EntryPointsWithDeps) {}

  /**
   * Search for Angular package entry-points.
   */
  findEntryPoints(): SortedEntryPointsInfo {
    const unsortedEntryPoints = new Map<AbsoluteFsPath, EntryPointWithDependencies>();
    const unprocessedPaths = this.initialEntryPoints.getInitialEntryPointPaths();
    while (unprocessedPaths.length > 0) {
      const path = unprocessedPaths.shift()!;
      const entryPointWithDeps = this.entryPointsWithDeps.getEntryPointWithDeps(path);
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
}
