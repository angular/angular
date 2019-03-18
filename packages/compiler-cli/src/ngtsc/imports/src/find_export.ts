/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Find the name, if any, by which a node is exported from a given file.
 */
export function findExportedNameOfNode(
    target: ts.Node, file: ts.SourceFile, checker: ts.TypeChecker): string|null {
  // First, get the exports of the file.
  const symbol = checker.getSymbolAtLocation(file);
  if (symbol === undefined) {
    return null;
  }
  const exports = checker.getExportsOfModule(symbol);

  // Look for the export which declares the node.
  const found = exports.find(sym => symbolDeclaresNode(sym, target, checker));
  if (found === undefined) {
    throw new Error(
        `Failed to find exported name of node (${target.getText()}) in '${file.fileName}'.`);
  }
  return found.name;
}

/**
 * Check whether a given `ts.Symbol` represents a declaration of a given node.
 *
 * This is not quite as trivial as just checking the declarations, as some nodes are
 * `ts.ExportSpecifier`s and need to be unwrapped.
 */
function symbolDeclaresNode(sym: ts.Symbol, node: ts.Node, checker: ts.TypeChecker): boolean {
  return sym.declarations.some(decl => {
    if (ts.isExportSpecifier(decl)) {
      const exportedSymbol = checker.getExportSpecifierLocalTargetSymbol(decl);
      if (exportedSymbol !== undefined) {
        return symbolDeclaresNode(exportedSymbol, node, checker);
      }
    }
    return decl === node;
  });
}
