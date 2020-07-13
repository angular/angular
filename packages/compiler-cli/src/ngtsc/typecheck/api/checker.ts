/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstNode} from '@angular/compiler';

import * as ts from 'typescript';

/**
 * Interface to the Angular Template Type Checker to extract diagnostics and intelligence from the
 * compiler's understanding of component templates.
 *
 * This interface is analogous to TypeScript's own `ts.TypeChecker` API.
 *
 * In general, this interface supports two kinds of operations:
 *  - updating Type Check Blocks (TCB)s that capture the template in the form of TypeScript code
 *  - querying information about available TCBs, including diagnostics
 *
 * Once a TCB is available, information about it can be queried. If no TCB is available to answer a
 * query, depending on the method either `null` will be returned or an error will be thrown.
 */
export interface TemplateTypeChecker {
  /**
   * Get all `ts.Diagnostic`s currently available for the given `ts.SourceFile`.
   *
   * This method will fail (throw) if there are components within the `ts.SourceFile` that do not
   * have TCBs available.
   */
  getDiagnosticsForFile(sf: ts.SourceFile): ts.Diagnostic[];

  /**
   * Retrieve the top-level node representing the TCB for the given component.
   *
   * This can return `null` if there is no TCB available for the component.
   *
   * This method always runs in `OptimizeFor.SingleFile` mode.
   */
  getTypeCheckBlock(component: ts.ClassDeclaration): ts.Node|null;
}
