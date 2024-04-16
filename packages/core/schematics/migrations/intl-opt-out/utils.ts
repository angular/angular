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

const PLATFORM_BROWSER = '@angular/platform-browser';
const PLATFORM_BROWSER_DYNAMIC = '@angular/platform-browser-dynamic';
const COMMON = '@angular/common';
const platformBrowserDynamic = 'platformBrowserDynamic';
const bootstrapModule = 'bootstrapModule';
const bootstrapApplication = 'bootstrapApplication';
const optOutFunction = 'useLegacyDateFormatting';

const todoComment =
    '// TODO: Remove this opt-out to enable the Intl based implementation for date formatting';

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  const changeTracker = new ChangeTracker(ts.createPrinter());

  const bootstrapApplicationIdentifier = getImportSpecifier(
                                             sourceFile,
                                             PLATFORM_BROWSER,
                                             bootstrapApplication,
                                             )
                                             ?.getText();
  const platformBrowserDynamicIdentifier = getImportSpecifier(
                                               sourceFile,
                                               PLATFORM_BROWSER_DYNAMIC,
                                               platformBrowserDynamic,
                                               )
                                               ?.getText();

  if (!bootstrapApplicationIdentifier && !platformBrowserDynamicIdentifier) {
    return;
  }

  const visitNode = (node: ts.Node) => {
    ts.forEachChild(node, visitNode);

    if (bootstrapApplicationIdentifier) {
      migrateBoostrapApplication(node, sourceFile, bootstrapApplicationIdentifier, changeTracker);
    } else if (platformBrowserDynamicIdentifier) {
      migrateBoostrapModule(node, sourceFile, platformBrowserDynamicIdentifier, changeTracker);
    }
  };

  ts.forEachChild(sourceFile, visitNode);

  // Writing the changes
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}

function migrateBoostrapApplication(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    bootstrapApplicationIdentifier: string,
    changeTracker: ChangeTracker,
) {
  if (!ts.isCallExpression(node)) {
    return;
  }

  const functionName = node.expression.getText();
  if (functionName !== bootstrapApplicationIdentifier) {
    return;
  }

  changeTracker.insertText(
      sourceFile,
      node.getFullStart(),
      `\n
  ${todoComment}
  ${optOutFunction}()`,
  );

  changeTracker.addImport(sourceFile, optOutFunction, COMMON);
}

function migrateBoostrapModule(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    platformBrowserDynamicIdentifier: string,
    changeTracker: ChangeTracker,
) {
  if (!ts.isCallExpression(node)) {
    return;
  }

  const functionName = node.expression.getText();
  if (functionName !== platformBrowserDynamicIdentifier) {
    return;
  }

  changeTracker.insertText(
      sourceFile,
      node.getFullStart(),
      `\n
  ${todoComment}
  ${optOutFunction}()`,
  );

  changeTracker.addImport(sourceFile, optOutFunction, COMMON);
}
