/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/** Gets the string representation of a node's resolved type. */
export function extractResolvedTypeString(node: ts.Node, checker: ts.TypeChecker): string {
  const typeString = checker.typeToString(
    checker.getTypeAtLocation(node),
    undefined,
    ts.TypeFormatFlags.NoTruncation,
  );

  // Remove the `undefined` union from the type string if the property is optional
  if ((ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) && node.questionToken) {
    return typeString.replace(/\s?\|\s?undefined$/, '');
  }
  return typeString;
}
