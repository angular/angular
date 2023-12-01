/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getContainingImportDeclaration} from '../../reflection/src/typescript';

export class ExtraImportsTracker {
  private readonly localImportsMap = new Map<string, Set<string>>();
  private readonly globalImportsSet = new Set<string>();

  constructor(private readonly typeChecker: ts.TypeChecker) {}

  addImportForSourceFile(sf: ts.SourceFile, moduleName: string) {
    // console.warn(">>>>>> addImportForSourceFile", sf.fileName, moduleName);

    if (!this.localImportsMap.has(sf.fileName)) {
      this.localImportsMap.set(sf.fileName, new Set<string>());
    }

    this.localImportsMap.get(sf.fileName)!.add(moduleName);
  }

  addGlobalImportFromIdentifier(node: ts.Node) {
    // console.warn('>>>> addGlobalImportFromIdentifier for', node.getText());

    let identifier: ts.Identifier|null = null;
    if (ts.isIdentifier(node)) {
      identifier = node;
    } else if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      identifier = node.expression;
    }

    if (identifier === null) return;

    const sym = this.typeChecker.getSymbolAtLocation(identifier);
    if (sym === undefined) {
      // console.warn('>>>> no sym');
      return;
    }
    if (sym.declarations === undefined || sym.declarations.length === 0) {
      // console.warn('>>>> no decls');
      return;
    }

    const importClause = sym.declarations[0];
    // Is declaration from this import statement?
    const decl = getContainingImportDeclaration(importClause);

    // console.warn(">>>>> decl", decl?.moduleSpecifier.getText());

    if (decl) {
      this.globalImportsSet.add(removeQutations(decl?.moduleSpecifier.getText()));
    }
  }

  getImportsForFile(sf: ts.SourceFile): string[] {
    const localImports = this.localImportsMap.get(sf.fileName);

    return [
      ...(localImports ?? []),
      ...this.globalImportsSet,
    ]
  }
}

function removeQutations(s: string) {
  return s.substring(1, s.length - 1);
}