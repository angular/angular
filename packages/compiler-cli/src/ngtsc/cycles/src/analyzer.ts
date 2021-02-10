/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ImportGraph} from './imports';

/**
 * Analyzes a `ts.Program` for cycles.
 */
export class CycleAnalyzer {
  constructor(private importGraph: ImportGraph) {}

  /**
   * Check for a cycle to be created in the `ts.Program` by adding an import between `from` and
   * `to`.
   *
   * @returns a `Cycle` object if an import between `from` and `to` would create a cycle; `null`
   *     otherwise.
   */
  wouldCreateCycle(from: ts.SourceFile, to: ts.SourceFile): Cycle|null {
    // Import of 'from' -> 'to' is illegal if an edge 'to' -> 'from' already exists.
    return this.importGraph.transitiveImportsOf(to).has(from) ?
        new Cycle(this.importGraph, from, to) :
        null;
  }

  /**
   * Record a synthetic import from `from` to `to`.
   *
   * This is an import that doesn't exist in the `ts.Program` but will be considered as part of the
   * import graph for cycle creation.
   */
  recordSyntheticImport(from: ts.SourceFile, to: ts.SourceFile): void {
    this.importGraph.addSyntheticImport(from, to);
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
