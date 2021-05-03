/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DepGraph} from 'dependency-graph';

import {AbsoluteFsPath, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {NgccConfiguration} from '../packages/configuration';
import {EntryPoint, EntryPointFormat, getEntryPointFormat, SUPPORTED_FORMAT_PROPERTIES} from '../packages/entry_point';
import {PartiallyOrderedList} from '../utils';

import {createDependencyInfo, DependencyHost, EntryPointWithDependencies} from './dependency_host';

const builtinNodeJsModules = new Set<string>(require('module').builtinModules);

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
 * Represents a partially ordered list of entry-points.
 *
 * The entry-points' order/precedence is such that dependent entry-points always come later than
 * their dependencies in the list.
 *
 * See `DependencyResolver#sortEntryPointsByDependency()`.
 */
export type PartiallyOrderedEntryPoints = PartiallyOrderedList<EntryPoint>;

/**
 * A list of entry-points, sorted by their dependencies, and the dependency graph.
 *
 * The `entryPoints` array will be ordered so that no entry point depends upon an entry point that
 * appears later in the array.
 *
 * Some entry points or their dependencies may have been ignored. These are captured for
 * diagnostic purposes in `invalidEntryPoints` and `ignoredDependencies` respectively.
 */
export interface SortedEntryPointsInfo extends DependencyDiagnostics {
  entryPoints: PartiallyOrderedEntryPoints;
  graph: DepGraph<EntryPoint>;
}

/**
 * A class that resolves dependencies between entry-points.
 */
export class DependencyResolver {
  constructor(
      private fs: ReadonlyFileSystem, private logger: Logger, private config: NgccConfiguration,
      private hosts: Partial<Record<EntryPointFormat, DependencyHost>>,
      private typingsHost: DependencyHost) {}
  /**
   * Sort the array of entry points so that the dependant entry points always come later than
   * their dependencies in the array.
   * @param entryPoints An array entry points to sort.
   * @param target If provided, only return entry-points depended on by this entry-point.
   * @returns the result of sorting the entry points by dependency.
   */
  sortEntryPointsByDependency(entryPoints: EntryPointWithDependencies[], target?: EntryPoint):
      SortedEntryPointsInfo {
    const {invalidEntryPoints, ignoredDependencies, graph} =
        this.computeDependencyGraph(entryPoints);

    let sortedEntryPointNodes: string[];
    if (target) {
      if (target.compiledByAngular && graph.hasNode(target.path)) {
        sortedEntryPointNodes = graph.dependenciesOf(target.path);
        sortedEntryPointNodes.push(target.path);
      } else {
        sortedEntryPointNodes = [];
      }
    } else {
      sortedEntryPointNodes = graph.overallOrder();
    }

    return {
      entryPoints: (sortedEntryPointNodes as PartiallyOrderedList<string>)
                       .map(path => graph.getNodeData(path)),
      graph,
      invalidEntryPoints,
      ignoredDependencies,
    };
  }

  getEntryPointWithDependencies(entryPoint: EntryPoint): EntryPointWithDependencies {
    const dependencies = createDependencyInfo();
    if (entryPoint.compiledByAngular) {
      // Only bother to compute dependencies of entry-points that have been compiled by Angular
      const formatInfo = this.getEntryPointFormatInfo(entryPoint);
      const host = this.hosts[formatInfo.format];
      if (!host) {
        throw new Error(
            `Could not find a suitable format for computing dependencies of entry-point: '${
                entryPoint.path}'.`);
      }
      host.collectDependencies(formatInfo.path, dependencies);
      this.typingsHost.collectDependencies(entryPoint.typings, dependencies);
    }
    return {entryPoint, depInfo: dependencies};
  }

  /**
   * Computes a dependency graph of the given entry-points.
   *
   * The graph only holds entry-points that ngcc cares about and whose dependencies
   * (direct and transitive) all exist.
   */
  private computeDependencyGraph(entryPoints: EntryPointWithDependencies[]): DependencyGraph {
    const invalidEntryPoints: InvalidEntryPoint[] = [];
    const ignoredDependencies: IgnoredDependency[] = [];
    const graph = new DepGraph<EntryPoint>();

    const angularEntryPoints = entryPoints.filter(e => e.entryPoint.compiledByAngular);

    // Add the Angular compiled entry points to the graph as nodes
    angularEntryPoints.forEach(e => graph.addNode(e.entryPoint.path, e.entryPoint));

    // Now add the dependencies between them
    angularEntryPoints.forEach(({entryPoint, depInfo: {dependencies, missing, deepImports}}) => {
      const missingDependencies = Array.from(missing).filter(dep => !builtinNodeJsModules.has(dep));

      if (missingDependencies.length > 0 && !entryPoint.ignoreMissingDependencies) {
        // This entry point has dependencies that are missing
        // so remove it from the graph.
        removeNodes(entryPoint, missingDependencies);
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

      if (deepImports.size > 0) {
        const notableDeepImports = this.filterIgnorableDeepImports(entryPoint, deepImports);
        if (notableDeepImports.length > 0) {
          const imports = notableDeepImports.map(i => `'${i}'`).join(', ');
          this.logger.warn(
              `Entry point '${entryPoint.name}' contains deep imports into ${imports}. ` +
              `This is probably not a problem, but may cause the compilation of entry points to be out of order.`);
        }
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
    for (const property of SUPPORTED_FORMAT_PROPERTIES) {
      const formatPath = entryPoint.packageJson[property];
      if (formatPath === undefined) continue;

      const format = getEntryPointFormat(this.fs, entryPoint, property);
      if (format === undefined) continue;

      return {format, path: this.fs.resolve(entryPoint.path, formatPath)};
    }

    throw new Error(
        `There is no appropriate source code format in '${entryPoint.path}' entry-point.`);
  }

  /**
   * Filter out the deepImports that can be ignored, according to this entryPoint's config.
   */
  private filterIgnorableDeepImports(entryPoint: EntryPoint, deepImports: Set<AbsoluteFsPath>):
      AbsoluteFsPath[] {
    const version = (entryPoint.packageJson.version || null) as string | null;
    const packageConfig =
        this.config.getPackageConfig(entryPoint.packageName, entryPoint.packagePath, version);
    const matchers = packageConfig.ignorableDeepImportMatchers;
    return Array.from(deepImports)
        .filter(deepImport => !matchers.some(matcher => matcher.test(deepImport)));
  }
}

interface DependencyGraph extends DependencyDiagnostics {
  graph: DepGraph<EntryPoint>;
}
