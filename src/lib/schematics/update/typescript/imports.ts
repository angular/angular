/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Checks whether the given node is part of an import specifier node. */
export function isImportSpecifierNode(node: ts.Node) {
  return isPartOfKind(node, ts.SyntaxKind.ImportSpecifier);
}

/** Checks whether the given node is part of an export specifier node. */
export function isExportSpecifierNode(node: ts.Node) {
  return isPartOfKind(node, ts.SyntaxKind.ExportSpecifier);
}

/** Checks whether the given node is part of a namespace import. */
export function isNamespaceImportNode(node: ts.Node) {
  return isPartOfKind(node, ts.SyntaxKind.NamespaceImport);
}

/** Finds the parent import declaration of a given TypeScript node. */
export function getImportDeclaration(node: ts.Node) {
  return findDeclaration(node, ts.SyntaxKind.ImportDeclaration) as ts.ImportDeclaration;
}

/** Finds the parent export declaration of a given TypeScript node */
export function getExportDeclaration(node: ts.Node) {
  return findDeclaration(node, ts.SyntaxKind.ExportDeclaration) as ts.ExportDeclaration;
}

/** Finds the specified declaration for the given node by walking up the TypeScript nodes. */
function findDeclaration<T extends ts.SyntaxKind>(node: ts.Node, kind: T) {
  while (node.kind !== kind) {
    node = node.parent;
  }

  return node;
}

/** Checks whether the given node is part of another TypeScript Node with the specified kind. */
function isPartOfKind<T extends ts.SyntaxKind>(node: ts.Node, kind: T): boolean {
  if (node.kind === kind) {
    return true;
  } else if (node.kind === ts.SyntaxKind.SourceFile) {
    return false;
  }

  return isPartOfKind(node.parent, kind);
}
