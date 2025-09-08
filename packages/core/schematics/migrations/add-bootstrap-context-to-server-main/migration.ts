/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';

type Rewriter = (startPos: number, width: number, text: string | null) => void;

function findArrowFunction(node: ts.Node): ts.ArrowFunction | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isArrowFunction(current)) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

export function migrateFile(sourceFile: ts.SourceFile, rewriter: Rewriter) {
  if (!sourceFile.fileName.endsWith('main.server.ts')) {
    return;
  }

  const bootstrapAppCalls: ts.CallExpression[] = [];
  ts.forEachChild(sourceFile, function findCalls(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'bootstrapApplication' &&
      node.arguments.length < 3
    ) {
      bootstrapAppCalls.push(node);
    }
    ts.forEachChild(node, findCalls);
  });

  if (bootstrapAppCalls.length === 0) {
    return;
  }

  const importManager = new ImportManager({
    generateUniqueIdentifier: () => null,
    shouldUseSingleQuotes: () => true,
  });

  for (const node of bootstrapAppCalls) {
    const end = node.arguments[node.arguments.length - 1].getEnd();
    rewriter(end, 0, ', context');

    const arrowFunction = findArrowFunction(node);
    if (arrowFunction && arrowFunction.parameters.length === 0) {
      const pos = arrowFunction.parameters.end;
      rewriter(pos, 0, 'context: BootstrapContext');
    }
  }

  importManager.addImport({
    exportSymbolName: 'BootstrapContext',
    exportModuleSpecifier: '@angular/platform-browser',
    requestedFile: sourceFile,
  });

  const finalization = importManager.finalize();
  const printer = ts.createPrinter();

  for (const [oldBindings, newBindings] of finalization.updatedImports) {
    const newText = printer.printNode(ts.EmitHint.Unspecified, newBindings, sourceFile);
    const start = oldBindings.getStart();
    const width = oldBindings.getWidth();
    rewriter(start, width, newText);
  }
}
