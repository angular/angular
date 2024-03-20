/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ChangeTracker} from '../../utils/change_tracker';
import {getImportSpecifiers, removeSymbolFromNamedImports} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';

export const symbolsToUpdate = new Set(['makeStateKey', 'StateKey', 'TransferState']);
export const platformBrowserModule = '@angular/platform-browser';
export const coreModule = '@angular/core';

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  const exposedImports =
      getImportSpecifiers(sourceFile, platformBrowserModule, [...symbolsToUpdate]);
  if (exposedImports.length === 0) {
    return;
  }

  migrateImports(sourceFile, rewriteFn);
}

function migrateImports(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  let changeTracker = new ChangeTracker(ts.createPrinter());
  const updatedImports = new Map<ts.NamedImports, ts.NamedImports>();
  const addedImports = new Array();
  const importSpecifiers =
      getImportSpecifiers(sourceFile, platformBrowserModule, [...symbolsToUpdate]);
  for (const importSpecifier of importSpecifiers) {
    const namedImports = closestNode(importSpecifier, ts.isNamedImports)!;
    const importToUpdate = updatedImports.get(namedImports) ?? namedImports;
    const rewrittenNamedImports = removeSymbolFromNamedImports(importToUpdate, importSpecifier);
    updatedImports.set(namedImports, rewrittenNamedImports);
    addedImports.push(importSpecifier.name.getText());
  }

  // Remove the existing imports
  for (const [originalNode, rewrittenNode] of updatedImports.entries()) {
    if (rewrittenNode.elements.length > 0) {
      changeTracker.replaceNode(originalNode, rewrittenNode);
    } else {
      const importDeclaration = originalNode.parent.parent;
      changeTracker.removeNode(importDeclaration);
    }
  }

  // Apply the removal changes
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }

  changeTracker.clearChanges();

  // Add the new imports
  for (const i of addedImports) {
    changeTracker.addImport(sourceFile, i, coreModule, null, true);
  }

  // Apply the adding changes
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}
