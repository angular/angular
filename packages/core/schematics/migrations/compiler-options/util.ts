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

const coreModule = '@angular/core';
const compilerOptionsType = 'CompilerOptions';
const deletedIdentifiers = new Set(['useJit', 'missingTranslation']);

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  const compilerOptionsImport = getImportSpecifier(sourceFile, coreModule, compilerOptionsType);
  if (compilerOptionsImport === null) {
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
  const missingTranslationStrategyImport =
      getImportSpecifier(sourceFile, coreModule, 'MissingTranslationStrategy');
  const namedImports = missingTranslationStrategyImport ?
      closestNode(missingTranslationStrategyImport, ts.isNamedImports) :
      null;

  const visitNode = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.type?.getText() !== compilerOptionsType) {
      return;
    }

    if (ts.isIdentifier(node) && deletedIdentifiers.has(node.text)) {
      changeTracker.removeNode(node.parent);
      if (node.text === 'missingTranslation') {
        if (namedImports && missingTranslationStrategyImport) {
          changeTracker.removeNode(missingTranslationStrategyImport);
        }
      }
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
}
