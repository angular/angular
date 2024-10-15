/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ChangeTracker} from '../../utils/change_tracker';
import {getImportSpecifier, getNamedImports} from '../../utils/typescript/imports';

const HTTP = '@angular/common/http';
const provideHttpClient = 'provideHttpClient';

const WITH_FETCH = 'withFetch';
const WITH_XHR = 'withXhr';

type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  const changeTracker = new ChangeTracker(ts.createPrinter());
  // Check if there are any imports of Http & provideHttpClient.
  const httpImports = getNamedImports(sourceFile, HTTP);
  if (!httpImports) {
    return;
  }
  const importSpecifier = getImportSpecifier(sourceFile, HTTP, provideHttpClient);
  if (!importSpecifier) {
    return;
  }

  ts.forEachChild(sourceFile, function visit(node: ts.Node) {
    node.forEachChild(visit);

    if (!ts.isCallExpression(node)) return;
    if (!ts.isIdentifier(node.expression)) return;
    if (node.expression.text !== 'provideHttpClient') return;

    const hasWithFetch = node.arguments.some((arg) => {
      return (
        ts.isCallExpression(arg) &&
        ts.isIdentifier(arg.expression) &&
        arg.expression.text === WITH_FETCH
      );
    });

    const provideHttpClientIdentifier = ts.factory.createIdentifier('provideHttpClient');

    if (!hasWithFetch) {
      const newProvideHttpClient = ts.factory.createCallExpression(
        provideHttpClientIdentifier,
        undefined,
        [
          ts.factory.createCallExpression(ts.factory.createIdentifier(WITH_XHR), undefined, []),
          ...node.arguments,
        ],
      );
      changeTracker.replaceNode(node, newProvideHttpClient);

      // add withXhr import
      const newImports = ts.factory.updateNamedImports(httpImports, [
        ...httpImports.elements,
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(WITH_XHR)),
      ]);
      changeTracker.replaceNode(httpImports, newImports);
    } else {
      const argsWithoutFetch = node.arguments.filter((arg) => {
        return (
          ts.isCallExpression(arg) &&
          ts.isIdentifier(arg.expression) &&
          arg.expression.text !== WITH_FETCH
        );
      });
      const newProvideHttpClient = ts.factory.createCallExpression(
        provideHttpClientIdentifier,
        undefined,
        argsWithoutFetch,
      );
      changeTracker.replaceNode(node, newProvideHttpClient);

      // remove withFetch import
      const newImports = ts.factory.updateNamedImports(httpImports, [
        ...httpImports.elements.filter((elt) => elt.name.text !== WITH_FETCH),
      ]);
      changeTracker.replaceNode(httpImports, newImports);
    }
  });

  // Write the changes.
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}
