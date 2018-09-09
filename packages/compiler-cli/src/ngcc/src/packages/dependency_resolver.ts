/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DepGraph} from 'dependency-graph';
import {DependencyHost} from './dependency_host';
import {EntryPoint} from './entry_point';


/**
 * Holds information about entry points that were ignored because
 * they have depedencies that are missing.
 *
 * This might not be an error, because the entry point might not actually be used
 * in the application. If it is used then the `ngc` application compilation would
 * fail also.
 *
 * For example, an application use the `@angular/router` package. This package includes an
 * entry-point called `@angular/router/upgrade`, which has a dependency on the
 * `@angular/upgrade` package. If the application never uses code from `@angular/router/upgrade`
 * then there is no need for `@angular/upgrade` to be installed.
 *
 * In this case the ngcc tool should just ignore the `@angular/router/upgrade` end-point.
 */
export interface IgnoredEntryPoint {
  entryPoint: EntryPoint;
  missingDeps: string[];
}

/**
 * Holds information about dependencies of an entry-point that do not need to be processed
 * by the ngcc tool.
 *
 * For example, the `rxjs` package does not contain any Angular decorators that need to be
 * compiled and so this can be safely ignored by ngcc.
 */
export interface IgnoredDependency {
  entryPoint: EntryPoint;
  dependencyPath: string;
}

/**
 * The result of sorting the entry-points by their dependencies.
 *
 * The `entryPoints` array will be ordered so that no entry point depends upon an entry point that
 * appears later in the array.
 *
 * Some entry points or their dependencies may be have been ignored. These are captured for
 * diagnostic purposes in `ignoredEntryPoints` and `ignoredDependencies` respectively.
 */
export interface SortedEntryPointsInfo {
  entryPoints: EntryPoint[];
  ignoredEntryPoints: IgnoredEntryPoint[];
  ignoredDependencies: IgnoredDependency[];
}

/**
 * A class that resolves dependencies between entry-points.
 */
export class DependencyResolver {
  constructor(private host: DependencyHost) {}
  /**
   * Sort the array of entry points so that the dependant entry points always come later than
   * their dependencies in the array.
   * @param entryPoints An array entry points to sort.
   * @returns the result of sorting the entry points.
   */
  sortEntryPointsByDependency(entryPoints: EntryPoint[]): SortedEntryPointsInfo {
    const ignoredEntryPoints: IgnoredEntryPoint[] = [];
    const ignoredDependencies: IgnoredDependency[] = [];
    const graph = new DepGraph();

    // Add the entry ponts to the graph as nodes
    entryPoints.forEach(entryPoint => graph.addNode(entryPoint.path, entryPoint));

    // Now add the dependencies between them
    entryPoints.forEach(entryPoint => {
      const entryPointPath = entryPoint.esm2015;
      if (!entryPointPath) {
        throw new Error(`Esm2015 format missing in '${entryPoint.path}' entry-point.`);
      }

      const dependencies = new Set<string>();
      const missing = new Set<string>();
      this.host.computeDependencies(entryPointPath, dependencies, missing);

      if (missing.size > 0) {
        const nodesToRemove = [entryPoint.path, ...graph.dependantsOf(entryPoint.path)];
        nodesToRemove.forEach(node => {
          ignoredEntryPoints.push({
            entryPoint: graph.getNodeData(node) as EntryPoint,
            missingDeps: Array.from(missing)
          });
          graph.removeNode(node);
        });
      } else {
        dependencies.forEach(dependencyPath => {
          if (graph.hasNode(dependencyPath)) {
            graph.addDependency(entryPoint.path, dependencyPath);
          } else {
            ignoredDependencies.push({entryPoint, dependencyPath});
          }
        });
      }
    });

    return {
      entryPoints: graph.overallOrder().map(path => graph.getNodeData(path) as EntryPoint),
      ignoredEntryPoints,
      ignoredDependencies
    };
  }
}
