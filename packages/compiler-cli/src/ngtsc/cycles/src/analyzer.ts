/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
   * Check whether adding an import from `from` to `to` would create a cycle in the `ts.Program`.
   */
  wouldCreateCycle(from: ts.SourceFile, to: ts.SourceFile): boolean {
    // Import of 'from' -> 'to' is illegal if an edge 'to' -> 'from' already exists.
    return this.importGraph.transitiveImportsOf(to).has(from);
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
