/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/**
 * Finds the class declaration that is being referred to by a node.
 * @param reference Node referring to a class declaration.
 * @param typeChecker
 */
export function findClassDeclaration(
  reference: ts.Node,
  typeChecker: ts.TypeChecker,
): ts.ClassDeclaration | null {
  return (
    typeChecker
      .getTypeAtLocation(reference)
      .getSymbol()
      ?.declarations?.find(ts.isClassDeclaration) || null
  );
}

/** Finds a property with a specific name in an object literal expression. */
export function findLiteralProperty(literal: ts.ObjectLiteralExpression, name: string) {
  return literal.properties.find(
    (prop) => prop.name && ts.isIdentifier(prop.name) && prop.name.text === name,
  );
}


