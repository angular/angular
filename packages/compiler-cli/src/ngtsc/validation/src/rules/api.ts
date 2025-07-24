/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Rule that checks a source file a specific issue.
 */
export interface SourceFileValidatorRule {
  /**
   * Whether the file should be checked. Used to stop the traversal of the file early.
   * @param sourceFile File to be checked.
   */
  shouldCheck(sourceFile: ts.SourceFile): boolean;

  /**
   * Produces diagnostics for a specific node that may
   * contain the issue that the rule is enforcing.
   * @param node Node to be checked.
   */
  checkNode(node: ts.Node): ts.Diagnostic | ts.Diagnostic[] | null;
}
