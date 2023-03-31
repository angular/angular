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
import {isReferenceToImport} from '../../utils/typescript/symbol';

export const deprecatedInterfaces = new Set([
  'CanLoad',
  'CanMatch',
  'CanActivate',
  'CanDeactivate',
  'CanActivateChild',
  'Resolve',
]);
export const routerModule = '@angular/router';

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, rewriteFn: RewriteFn) {
  const changeTracker = new ChangeTracker(ts.createPrinter());

  insertAsAnyAssertions(sourceFile, typeChecker, changeTracker);

  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}

function insertAsAnyAssertions(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, changeTracker: ChangeTracker): void {
  const visitNode = (node: ts.Node) => {
    if (ts.isPropertyAccessExpression(node) && node.getLastToken()?.getText() === 'changes') {
      const queryListImport = getImportSpecifier(sourceFile, '@angular/core', 'QueryList')!;
      let isQueryListChanges: boolean =
          isReferenceToImport(typeChecker, node.expression, queryListImport);
      for (const n of node.expression.getChildren()) {
        if (isReferenceToImport(typeChecker, n, queryListImport)) {
          isQueryListChanges = true;
          break;
        }
      }

      if (isQueryListChanges) {
        const observableAny = ts.factory.createTypeReferenceNode('Observable', [
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        ]);
        const replacement = ts.factory.createAsExpression(node, observableAny);
        const parenthesized = ts.factory.createParenthesizedExpression(replacement);

        changeTracker.replaceNode(node, parenthesized);
      }
    }

    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
}
