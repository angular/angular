/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Creates a TypeScript node representing a numeric value.
 */
export function tsNumericExpression(value: number): ts.NumericLiteral | ts.PrefixUnaryExpression {
  // As of TypeScript 5.3 negative numbers are represented as `prefixUnaryOperator` and passing a
  // negative number (even as a string) into `createNumericLiteral` will result in an error.
  if (value < 0) {
    const operand = ts.factory.createNumericLiteral(Math.abs(value));
    return ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.MinusToken, operand);
  }

  return ts.factory.createNumericLiteral(value);
}

/**
 * Creates a TypeScript node representing a numeric value.
 */
export function tsBigIntExpression(value: bigint): ts.BigIntLiteral | ts.PrefixUnaryExpression {
  // As of TypeScript 5.3 negative numbers/bigint are represented as `prefixUnaryOperator` and passing a
  // negative number (even as a string) into `createNumericLiteral` will result in an error.

  // For the bigint to be printed as a literal, it needs to be suffixed with 'n'.
  if (value < 0) {
    const operand = ts.factory.createBigIntLiteral(`${-value}n`);
    return ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.MinusToken, operand);
  }

  return ts.factory.createBigIntLiteral(`${value}n`);
}
