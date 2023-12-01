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

  constructor(private readonly typeChecker: ts.TypeChecker) {}

  addImportForSourceFile(sf: ts.SourceFile, moduleName: string) {
    // console.warn(">>>>>> addImportForSourceFile", sf.fileName, moduleName);

    if (!this.localImportsMap.has(sf.fileName)) {
      this.localImportsMap.set(sf.fileName, new Set<string>());
    }

    this.localImportsMap.get(sf.fileName)!.add(moduleName);
  }

  getImportsForFile(sf: ts.SourceFile): string[] {
    const localImports = this.localImportsMap.get(sf.fileName);

    return localImports ? [...localImports] : [];
  }
}
