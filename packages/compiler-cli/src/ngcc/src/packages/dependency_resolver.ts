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
 * Holds information about entry points that are removed because
 * they have dependencies that are missing (directly or transitively).
 *
 * This might not be an error, because such an entry point might not actually be used
 * in the application. If it is used then the `ngc` application compilation would
 * fail also, so we don't need ngcc to catch this.
 *
 * For example, consider an application that uses the `@angular/router` package.
 * This package includes an entry-point called `@angular/router/upgrade`, which has a dependency
 * on the `@angular/upgrade` package.
 * If the application never uses code from `@angular/router/upgrade` then there is no need for
 * `@angular/upgrade` to be installed.
 * In this case the ngcc tool should just ignore the `@angular/router/upgrade` end-point.
 */
export interface InvalidEntryPoint {
  entryPoint: EntryPoint;
  missingDependencies: string[];
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
 * diagnostic purposes in `invalidEntryPoints` and `ignoredDependencies` respectively.
 */
export interface SortedEntryPointsInfo {
  entryPoints: EntryPoint[];
  invalidEntryPoints: InvalidEntryPoint[];
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
    const invalidEntryPoints: InvalidEntryPoint[] = [];
    const ignoredDependencies: IgnoredDependency[] = [];
    const graph = new DepGraph<EntryPoint>();

    // Add the entry ponts to the graph as nodes
    entryPoints.forEach(entryPoint => graph.addNode(entryPoint.path, entryPoint));

    // Now add the dependencies between them
    entryPoints.forEach(entryPoint => {
      const entryPointPath = entryPoint.fesm2015 || entryPoint.esm2015;
      if (!entryPointPath) {
        throw new Error(
            `ESM2015 format (flat and non-flat) missing in '${entryPoint.path}' entry-point.`);
      }

      const dependencies = new Set<string>();
      const missing = new Set<string>();
      const deepImports = new Set<string>();
      this.host.computeDependencies(entryPointPath, dependencies, missing, deepImports);

      if (missing.size > 0) {
        // This entry point has dependencies that are missing
        // so remove it from the graph.
        removeNodes(entryPoint, Array.from(missing));
      } else {
        dependencies.forEach(dependencyPath => {
          if (graph.hasNode(dependencyPath)) {
            // The dependency path maps to an entry point that exists in the graph
            // so add the dependency.
            graph.addDependency(entryPoint.path, dependencyPath);
          } else if (invalidEntryPoints.some(i => i.entryPoint.path === dependencyPath)) {
            // The dependency path maps to an entry-point that was previously removed
            // from the graph, so remove this entry-point as well.
            removeNodes(entryPoint, [dependencyPath]);
          } else {
            // The dependency path points to a package that ngcc does not care about.
            ignoredDependencies.push({entryPoint, dependencyPath});
          }
        });
      }

      if (deepImports.size) {
        const imports = Array.from(deepImports).map(i => `'${i}'`).join(', ');
        console.warn(
            `Entry point '${entryPoint.name}' contains deep imports into ${imports}. ` +
            `This is probably not a problem, but may cause the compilation of entry points to be out of order.`);
      }
    });

    // The map now only holds entry-points that ngcc cares about and whose dependencies
    // (direct and transitive) all exist.
    return {
      entryPoints: graph.overallOrder().map(path => graph.getNodeData(path)),
      invalidEntryPoints,
      ignoredDependencies
    };

    function removeNodes(entryPoint: EntryPoint, missingDependencies: string[]) {
      const nodesToRemove = [entryPoint.path, ...graph.dependantsOf(entryPoint.path)];
      nodesToRemove.forEach(node => {
        invalidEntryPoints.push({entryPoint: graph.getNodeData(node), missingDependencies});
        graph.removeNode(node);
      });
    }
  }
}
