/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Finds all module references in the specified source file.
 * @param node Source file which should be parsed.
 * @returns List of import specifiers in the source file.
 */
export function getModuleReferences(node: ts.SourceFile): string[] {
  const references: string[] = [];
  const visitNode = (node: ts.Node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier)) {
      references.push(node.moduleSpecifier.text);
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(node, visitNode);
  return references;
}
