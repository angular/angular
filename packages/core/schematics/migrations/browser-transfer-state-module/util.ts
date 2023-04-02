/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ChangeTracker} from '../../utils/change_tracker';
import {getImportSpecifier} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';

const platformBrowserModule = '@angular/platform-browser';
const browserTransferStateModuleName = 'BrowserTransferStateModule';

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  const browserTransferStateModuleImport =
      getImportSpecifier(sourceFile, platformBrowserModule, browserTransferStateModuleName);
  if (browserTransferStateModuleImport === null) {
    return;
  }

  const changeTracker = new ChangeTracker(ts.createPrinter());

  removeIdentifiers(sourceFile, changeTracker);

  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}

function removeIdentifiers(sourceFile: ts.SourceFile, changeTracker: ChangeTracker) {
  const browserTransferStateModuleImport =
      getImportSpecifier(sourceFile, platformBrowserModule, 'BrowserTransferStateModule');
  const namedImports = browserTransferStateModuleImport ?
      closestNode(browserTransferStateModuleImport, ts.isNamedImports) :
      null;
  if (!browserTransferStateModuleImport || !namedImports) {
    return;
  }

  const visitNode = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.type?.getText() !== browserTransferStateModuleName) {
      return;
    }

    if (ts.isIdentifier(node) && node.text === browserTransferStateModuleName) {
      changeTracker.removeNode(node.parent);
      changeTracker.removeNode(browserTransferStateModuleImport);

      if (browserTransferStateModuleImport.parent.elements.length === 1) {
        changeTracker.removeNode(browserTransferStateModuleImport.parent.parent.parent);
      }
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
}
