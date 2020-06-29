/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getValueSymbolOfDeclaration} from '../../../utils/typescript/symbol';

export interface ResolvedExport {
  symbol: ts.Symbol;
  exportName: string;
  identifier: ts.Identifier;
}

/** Computes the resolved exports of a given source file. */
export function getExportSymbolsOfFile(
    sf: ts.SourceFile, typeChecker: ts.TypeChecker): ResolvedExport[] {
  const exports: {exportName: string, identifier: ts.Identifier}[] = [];
  const resolvedExports: ResolvedExport[] = [];

  ts.forEachChild(sf, function visitNode(node) {
    if (ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) ||
        ts.isInterfaceDeclaration(node) &&
            (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0) {
      if (node.name) {
        exports.push({exportName: node.name.text, identifier: node.name});
      }
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        visitNode(decl);
      }
    } else if (ts.isVariableDeclaration(node)) {
      if ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) != 0 &&
          ts.isIdentifier(node.name)) {
        exports.push({exportName: node.name.text, identifier: node.name});
      }
    } else if (ts.isExportDeclaration(node)) {
      const {moduleSpecifier, exportClause} = node;
      if (!moduleSpecifier && exportClause && ts.isNamedExports(exportClause)) {
        exportClause.elements.forEach(el => exports.push({
          exportName: el.name.text,
          identifier: el.propertyName ? el.propertyName : el.name
        }));
      }
    }
  });

  exports.forEach(({identifier, exportName}) => {
    const symbol = getValueSymbolOfDeclaration(identifier, typeChecker);
    if (symbol) {
      resolvedExports.push({symbol, identifier, exportName});
    }
  });

  return resolvedExports;
}
