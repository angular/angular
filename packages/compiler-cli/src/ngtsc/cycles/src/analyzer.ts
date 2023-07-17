/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ImportGraph} from './imports';

/**
 * Analyzes a `ts.Program` for cycles.
 */
export class CycleAnalyzer {
  /**
   * Cycle detection is requested with the same `from` source file for all used directives and pipes
   * within a component, which makes it beneficial to cache the results as long as the `from` source
   * file has not changed. This avoids visiting the import graph that is reachable from multiple
   * directives/pipes more than once.
   */
  private cachedResults: CycleResults|null = null;

  constructor(private importGraph: ImportGraph) {}

  /**
   * Check for a cycle to be created in the `ts.Program` by adding an import between `from` and
   * `to`.
   *
   * @returns a `Cycle` object if an import between `from` and `to` would create a cycle; `null`
   *     otherwise.
   */
  wouldCreateCycle(from: ts.SourceFile, to: ts.SourceFile): Cycle|null {
    // Try to reuse the cached results as long as the `from` source file is the same.
    if (this.cachedResults === null || this.cachedResults.from !== from) {
      this.cachedResults = new CycleResults(from, this.importGraph);
    }

    // Import of 'from' -> 'to' is illegal if an edge 'to' -> 'from' already exists.
    return this.cachedResults.wouldBeCyclic(to) ? new Cycle(this.importGraph, from, to) : null;
  }

  /**
   * Record a synthetic import from `from` to `to`.
   *
   * This is an import that doesn't exist in the `ts.Program` but will be considered as part of the
   * import graph for cycle creation.
   */
  recordSyntheticImport(from: ts.SourceFile, to: ts.SourceFile): void {
    this.cachedResults = null;
    this.importGraph.addSyntheticImport(from, to);
  }
}

const NgCyclicResult = Symbol('NgCyclicResult');
type CyclicResultMarker = {
  __brand: 'CyclicResultMarker';
};
type CyclicSourceFile = ts.SourceFile&{[NgCyclicResult]?: CyclicResultMarker};

/**
 * Stores the results of cycle detection in a memory efficient manner. A symbol is attached to
 * source files that indicate what the cyclic analysis result is, as indicated by two markers that
 * are unique to this instance. This alleviates memory pressure in large import graphs, as each
 * execution is able to store its results in the same memory location (i.e. in the symbol
 * on the source file) as earlier executions.
 */
class CycleResults {
  private readonly cyclic = {} as CyclicResultMarker;
  private readonly acyclic = {} as CyclicResultMarker;

  constructor(readonly from: ts.SourceFile, private importGraph: ImportGraph) {}

  wouldBeCyclic(sf: ts.SourceFile): boolean {
    const cached = this.getCachedResult(sf);
    if (cached !== null) {
      // The result for this source file has already been computed, so return its result.
      return cached;
    }

    if (sf === this.from) {
      // We have reached the source file that we want to create an import from, which means that
      // doing so would create a cycle.
      return true;
    }

    // Assume for now that the file will be acyclic; this prevents infinite recursion in the case
    // that `sf` is visited again as part of an existing cycle in the graph.
    this.markAcyclic(sf);

    const imports = this.importGraph.importsOf(sf);
    for (const imported of imports) {
      if (this.wouldBeCyclic(imported)) {
        this.markCyclic(sf);
        return true;
      }
    }
    return false;
  }

  /**
   * Returns whether the source file is already known to be cyclic, or `null` if the result is not
   * yet known.
   */
  private getCachedResult(sf: CyclicSourceFile): boolean|null {
    const result = sf[NgCyclicResult];
    if (result === this.cyclic) {
      return true;
    } else if (result === this.acyclic) {
      return false;
    } else {
      // Either the symbol is missing or its value does not correspond with one of the current
      // result markers. As such, the result is unknown.
      return null;
    }
  }

  private markCyclic(sf: CyclicSourceFile): void {
    sf[NgCyclicResult] = this.cyclic;
  }

  private markAcyclic(sf: CyclicSourceFile): void {
    sf[NgCyclicResult] = this.acyclic;
  }
}

/**
 * Represents an import cycle between `from` and `to` in the program.
 *
 * This class allows us to do the work to compute the cyclic path between `from` and `to` only if
 * needed.
 */
export class Cycle {
  constructor(
      private importGraph: ImportGraph, readonly from: ts.SourceFile, readonly to: ts.SourceFile) {}

  /**
   * Compute an array of source-files that illustrates the cyclic path between `from` and `to`.
   *
   * Note that a `Cycle` will not be created unless a path is available between `to` and `from`,
   * so `findPath()` will never return `null`.
   */
  getPath(): ts.SourceFile[] {
    return [this.from, ...this.importGraph.findPath(this.to, this.from)!];
  }
}


/**
 * What to do if a cycle is detected.
 */
export const enum CycleHandlingStrategy {
  /** Add "remote scoping" code to avoid creating a cycle. */
  UseRemoteScoping,
  /** Fail the compilation with an error. */
  Error,
}
