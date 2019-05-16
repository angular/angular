/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DepGraph} from 'dependency-graph';
import {AbsoluteFsPath, FileSystem, resolve} from '../../../src/ngtsc/file_system';
import {Logger} from '../logging/logger';
import {EntryPoint, EntryPointFormat, EntryPointJsonProperty, getEntryPointFormat} from '../packages/entry_point';
import {DependencyHost, DependencyInfo} from './dependency_host';

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

export interface DependencyDiagnostics {
  invalidEntryPoints: InvalidEntryPoint[];
  ignoredDependencies: IgnoredDependency[];
}

/**
 * A list of entry-points, sorted by their dependencies.
 *
 * The `entryPoints` array will be ordered so that no entry point depends upon an entry point that
 * appears later in the array.
 *
 * Some entry points or their dependencies may be have been ignored. These are captured for
 * diagnostic purposes in `invalidEntryPoints` and `ignoredDependencies` respectively.
 */
export interface SortedEntryPointsInfo extends DependencyDiagnostics { entryPoints: EntryPoint[]; }

/**
 * A class that resolves dependencies between entry-points.
 */
export class DependencyResolver {
  constructor(
      private fs: FileSystem, private logger: Logger,
      private hosts: Partial<Record<EntryPointFormat, DependencyHost>>) {}
  /**
   * Sort the array of entry points so that the dependant entry points always come later than
   * their dependencies in the array.
   * @param entryPoints An array entry points to sort.
   * @param target If provided, only return entry-points depended on by this entry-point.
   * @returns the result of sorting the entry points by dependency.
   */
  sortEntryPointsByDependency(entryPoints: EntryPoint[], target?: EntryPoint):
      SortedEntryPointsInfo {
    const {invalidEntryPoints, ignoredDependencies, graph} =
        this.computeDependencyGraph(entryPoints);

    let sortedEntryPointNodes: string[];
    if (target) {
      if (target.compiledByAngular) {
        sortedEntryPointNodes = graph.dependenciesOf(target.path);
        sortedEntryPointNodes.push(target.path);
      } else {
        sortedEntryPointNodes = [];
      }
    } else {
      sortedEntryPointNodes = graph.overallOrder();
    }

    return {
      entryPoints: sortedEntryPointNodes.map(path => graph.getNodeData(path)),
      invalidEntryPoints,
      ignoredDependencies,
    };
  }

  getEntryPointDependencies(entryPoint: EntryPoint): DependencyInfo {
    const formatInfo = this.getEntryPointFormatInfo(entryPoint);
    const host = this.hosts[formatInfo.format];
    if (!host) {
      throw new Error(
          `Could not find a suitable format for computing dependencies of entry-point: '${entryPoint.path}'.`);
    }
    return host.findDependencies(formatInfo.path);
  }

  /**
   * Computes a dependency graph of the given entry-points.
   *
   * The graph only holds entry-points that ngcc cares about and whose dependencies
   * (direct and transitive) all exist.
   */
  private computeDependencyGraph(entryPoints: EntryPoint[]): DependencyGraph {
    const invalidEntryPoints: InvalidEntryPoint[] = [];
    const ignoredDependencies: IgnoredDependency[] = [];
    const graph = new DepGraph<EntryPoint>();

    const angularEntryPoints = entryPoints.filter(entryPoint => entryPoint.compiledByAngular);

    // Add the Angular compiled entry points to the graph as nodes
    angularEntryPoints.forEach(entryPoint => graph.addNode(entryPoint.path, entryPoint));

    // Now add the dependencies between them
    angularEntryPoints.forEach(entryPoint => {
      const {dependencies, missing, deepImports} = this.getEntryPointDependencies(entryPoint);

      if (missing.size > 0) {
        // This entry point has dependencies that are missing
        // so remove it from the graph.
        removeNodes(entryPoint, Array.from(missing));
      } else {
        dependencies.forEach(dependencyPath => {
          if (!graph.hasNode(entryPoint.path)) {
            // The entry-point has already been identified as invalid so we don't need
            // to do any further work on it.
          } else if (graph.hasNode(dependencyPath)) {
            // The entry-point is still valid (i.e. has no missing dependencies) and
            // the dependency maps to an entry point that exists in the graph so add it
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
        this.logger.warn(
            `Entry point '${entryPoint.name}' contains deep imports into ${imports}. ` +
            `This is probably not a problem, but may cause the compilation of entry points to be out of order.`);
      }
    });

    return {invalidEntryPoints, ignoredDependencies, graph};

    function removeNodes(entryPoint: EntryPoint, missingDependencies: string[]) {
      const nodesToRemove = [entryPoint.path, ...graph.dependantsOf(entryPoint.path)];
      nodesToRemove.forEach(node => {
        invalidEntryPoints.push({entryPoint: graph.getNodeData(node), missingDependencies});
        graph.removeNode(node);
      });
    }
  }

  private getEntryPointFormatInfo(entryPoint: EntryPoint):
      {format: EntryPointFormat, path: AbsoluteFsPath} {
    const properties = Object.keys(entryPoint.packageJson);
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i] as EntryPointJsonProperty;
      const format = getEntryPointFormat(this.fs, entryPoint, property);

      if (format === 'esm2015' || format === 'esm5' || format === 'umd' || format === 'commonjs') {
        const formatPath = entryPoint.packageJson[property] !;
        return {format, path: resolve(entryPoint.path, formatPath)};
      }
    }
    throw new Error(
        `There is no appropriate source code format in '${entryPoint.path}' entry-point.`);
  }
}

interface DependencyGraph extends DependencyDiagnostics {
  graph: DepGraph<EntryPoint>;
}
