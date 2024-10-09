/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * List of binary operators that indicate a write operation.
 *
 * Useful for figuring out whether an expression assigns to
 * something or not.
 */
export const writeBinaryOperators: ts.BinaryOperator[] = [
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
];
