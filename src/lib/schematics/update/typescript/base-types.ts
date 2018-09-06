/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Determines the base types of the specified class declaration. */
export function determineBaseTypes(node: ts.ClassDeclaration): string[] | null {
  if (!node.heritageClauses) {
    return null;
  }

  return node.heritageClauses
    .reduce((types, clause) => types.concat(clause.types), [] as ts.ExpressionWithTypeArguments[])
    .map(typeExpression => typeExpression.expression)
    .filter(expression => expression && ts.isIdentifier(expression))
    .map((identifier: ts.Identifier) => identifier.text);
}
