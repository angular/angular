/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

export function getValueSymbolOfDeclaration(node: ts.Node, typeChecker: ts.TypeChecker): ts.Symbol|
    undefined {
  let symbol = typeChecker.getSymbolAtLocation(node);

  while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
    symbol = typeChecker.getAliasedSymbol(symbol);
  }

  return symbol;
}

/** Checks whether a node is referring to a specific import specifier. */
export function isReferenceToImport(
    typeChecker: ts.TypeChecker, node: ts.Node, importSpecifier: ts.ImportSpecifier): boolean {
  const nodeSymbol = typeChecker.getTypeAtLocation(node).getSymbol();
  const importSymbol = typeChecker.getTypeAtLocation(importSpecifier).getSymbol();
  return !!(nodeSymbol?.declarations?.[0] && importSymbol?.declarations?.[0]) &&
      nodeSymbol.declarations[0] === importSymbol.declarations[0];
}

/** Checks whether a node's type is nullable (`null`, `undefined` or `void`). */
export function isNullableType(typeChecker: ts.TypeChecker, node: ts.Node) {
  // Skip expressions in the form of `foo.bar!.baz` since the `TypeChecker` seems
  // to identify them as null, even though the user indicated that it won't be.
  if (node.parent && ts.isNonNullExpression(node.parent)) {
    return false;
  }

  const type = typeChecker.getTypeAtLocation(node);
  const typeNode = typeChecker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.None);
  let hasSeenNullableType = false;

  // Trace the type of the node back to a type node, walk
  // through all of its sub-nodes and look for nullable types.
  if (typeNode) {
    (function walk(current: ts.Node) {
      if (current.kind === ts.SyntaxKind.NullKeyword ||
          current.kind === ts.SyntaxKind.UndefinedKeyword ||
          current.kind === ts.SyntaxKind.VoidKeyword) {
        hasSeenNullableType = true;
        // Note that we don't descend into type literals, because it may cause
        // us to mis-identify the root type as nullable, because it has a nullable
        // property (e.g. `{ foo: string | null }`).
      } else if (!hasSeenNullableType && !ts.isTypeLiteralNode(current)) {
        current.forEachChild(walk);
      }
    })(typeNode);
  }

  return hasSeenNullableType;
}

/**
 * Walks through the types and sub-types of a node, looking for a
 * type that has the same name as one of the passed-in ones.
 */
export function hasOneOfTypes(
    typeChecker: ts.TypeChecker, node: ts.Node, types: string[]): boolean {
  const type = typeChecker.getTypeAtLocation(node);
  const typeNode =
      type ? typeChecker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.None) : undefined;
  let hasMatch = false;
  if (typeNode) {
    (function walk(current: ts.Node) {
      if (ts.isIdentifier(current) && types.includes(current.text)) {
        hasMatch = true;
      } else if (!hasMatch && !ts.isTypeLiteralNode(current)) {
        current.forEachChild(walk);
      }
    })(typeNode);
  }
  return hasMatch;
}
