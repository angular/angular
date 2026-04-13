/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

let tempPrinter: ts.Printer | null = null;

/**
 * Prints a TypeScript node as a string.
 *
 * @deprecated This is a temporary method until all code generation code has been migrated.
 */
export function tempPrint(node: ts.Node, sourceFile: ts.SourceFile): string {
  tempPrinter ??= ts.createPrinter();
  return tempPrinter.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}
