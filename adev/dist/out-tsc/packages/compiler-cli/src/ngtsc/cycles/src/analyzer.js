/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Analyzes a `ts.Program` for cycles.
 */
export class CycleAnalyzer {
  importGraph;
  /**
   * Cycle detection is requested with the same `from` source file for all used directives and pipes
   * within a component, which makes it beneficial to cache the results as long as the `from` source
   * file has not changed. This avoids visiting the import graph that is reachable from multiple
   * directives/pipes more than once.
   */
  cachedResults = null;
  constructor(importGraph) {
    this.importGraph = importGraph;
  }
  /**
   * Check for a cycle to be created in the `ts.Program` by adding an import between `from` and
   * `to`.
   *
   * @returns a `Cycle` object if an import between `from` and `to` would create a cycle; `null`
   *     otherwise.
   */
  wouldCreateCycle(from, to) {
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
  recordSyntheticImport(from, to) {
    this.cachedResults = null;
    this.importGraph.addSyntheticImport(from, to);
  }
}
const NgCyclicResult = Symbol('NgCyclicResult');
/**
 * Stores the results of cycle detection in a memory efficient manner. A symbol is attached to
 * source files that indicate what the cyclic analysis result is, as indicated by two markers that
 * are unique to this instance. This alleviates memory pressure in large import graphs, as each
 * execution is able to store its results in the same memory location (i.e. in the symbol
 * on the source file) as earlier executions.
 */
class CycleResults {
  from;
  importGraph;
  cyclic = {};
  acyclic = {};
  constructor(from, importGraph) {
    this.from = from;
    this.importGraph = importGraph;
  }
  wouldBeCyclic(sf) {
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
  getCachedResult(sf) {
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
  markCyclic(sf) {
    sf[NgCyclicResult] = this.cyclic;
  }
  markAcyclic(sf) {
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
  importGraph;
  from;
  to;
  constructor(importGraph, from, to) {
    this.importGraph = importGraph;
    this.from = from;
    this.to = to;
  }
  /**
   * Compute an array of source-files that illustrates the cyclic path between `from` and `to`.
   *
   * Note that a `Cycle` will not be created unless a path is available between `to` and `from`,
   * so `findPath()` will never return `null`.
   */
  getPath() {
    return [this.from, ...this.importGraph.findPath(this.to, this.from)];
  }
}
//# sourceMappingURL=analyzer.js.map
