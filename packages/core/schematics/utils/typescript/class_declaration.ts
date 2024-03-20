/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/** Determines the base type identifiers of a specified class declaration. */
export function getBaseTypeIdentifiers(node: ts.ClassDeclaration): ts.Identifier[]|null {
  if (!node.heritageClauses) {
    return null;
  }

  return node.heritageClauses.filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
      .reduce((types, clause) => types.concat(clause.types), [] as ts.ExpressionWithTypeArguments[])
      .map(typeExpression => typeExpression.expression)
      .filter(ts.isIdentifier);
}

/** Gets the first found parent class declaration of a given node. */
export function findParentClassDeclaration(node: ts.Node): ts.ClassDeclaration|null {
  while (!ts.isClassDeclaration(node)) {
    if (ts.isSourceFile(node)) {
      return null;
    }
    node = node.parent;
  }
  return node;
}

/** Checks whether the given class declaration has an explicit constructor or not. */
export function hasExplicitConstructor(node: ts.ClassDeclaration): boolean {
  return node.members.some(ts.isConstructorDeclaration);
}
