/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ChangeTracker} from '../../utils/change_tracker';
import {
  getImportOfIdentifier,
  getImportSpecifier,
  getNamedImports,
} from '../../utils/typescript/imports';

const CORE = '@angular/core';
const EXPERIMENTAL_PENDING_TASKS = 'ExperimentalPendingTasks';

type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
  rewriteFn: RewriteFn,
) {
  const changeTracker = new ChangeTracker(ts.createPrinter());
  // Check if there are any imports of the `AfterRenderPhase` enum.
  const coreImports = getNamedImports(sourceFile, CORE);
  if (!coreImports) {
    return;
  }
  const importSpecifier = getImportSpecifier(sourceFile, CORE, EXPERIMENTAL_PENDING_TASKS);
  if (!importSpecifier) {
    return;
  }
  const nodeToReplace = importSpecifier.propertyName ?? importSpecifier.name;
  if (!ts.isIdentifier(nodeToReplace)) {
    return;
  }

  changeTracker.replaceNode(nodeToReplace, ts.factory.createIdentifier('PendingTasks'));

  ts.forEachChild(sourceFile, function visit(node: ts.Node) {
    // import handled above
    if (ts.isImportDeclaration(node)) {
      return;
    }

    if (
      ts.isIdentifier(node) &&
      node.text === EXPERIMENTAL_PENDING_TASKS &&
      getImportOfIdentifier(typeChecker, node)?.name === EXPERIMENTAL_PENDING_TASKS
    ) {
      changeTracker.replaceNode(node, ts.factory.createIdentifier('PendingTasks'));
    }

    ts.forEachChild(node, visit);
  });

  // Write the changes.
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}
