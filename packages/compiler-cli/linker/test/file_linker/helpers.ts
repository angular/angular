/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

/**
 * A simple helper to render a TS Node as a string.
 */
export function generate(node: ts.Node): string {
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
  const sf = ts.createSourceFile('test.ts', '', ts.ScriptTarget.ES2015, true);
  return printer.printNode(ts.EmitHint.Unspecified, node, sf);
}
