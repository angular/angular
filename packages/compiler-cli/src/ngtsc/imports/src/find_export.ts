/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ReflectionHost} from '../../reflection';
import {isNamedDeclaration} from '../../util/src/typescript';

/**
 * Find the name, if any, by which a node is exported from a given file.
 */
export function findExportedNameOfNode(
    target: ts.Node, file: ts.SourceFile, reflector: ReflectionHost): string|null {
  const exports = reflector.getExportsOfModule(file);
  if (exports === null) {
    return null;
  }

  const declaredName = isNamedDeclaration(target) ? target.name.text : null;

  // Look for the export which declares the node.
  let foundExportName: string|null = null;
  for (const [exportName, declaration] of exports) {
    if (declaration.node !== target) {
      continue;
    }

    if (exportName === declaredName) {
      // A non-alias export exists which is always preferred, so use that one.
      return exportName;
    }

    foundExportName = exportName;
  }

  if (foundExportName === null) {
    throw new Error(
        `Failed to find exported name of node (${target.getText()}) in '${file.fileName}'.`);
  }
  return foundExportName;
}

/**
 * Check whether a given `ts.Symbol` represents a declaration of a given node.
 *
 * This is not quite as trivial as just checking the declarations, as some nodes are
 * `ts.ExportSpecifier`s and need to be unwrapped.
 */
function symbolDeclaresNode(sym: ts.Symbol, node: ts.Node, checker: ts.TypeChecker): boolean {
  if (sym.declarations === undefined) {
    return false;
  }

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
