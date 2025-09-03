/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, Tree} from '@angular-devkit/schematics';
import {insertImport} from '@schematics/angular/utility/ast-utils';
import ts from 'typescript';
import {getImportSpecifier, removeSymbolFromNamedImports} from '../../utils/typescript/imports';
import {applyToUpdateRecorder} from '@schematics/angular/utility/change';

function findBootstrapApplicationCall(sourceFile: ts.SourceFile): ts.CallExpression | null {
  let call: ts.CallExpression | null = null;
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'bootstrapApplication'
    ) {
      call = node;
    }
    if (!call) {
      ts.forEachChild(node, visit);
    }
  };
  visit(sourceFile);
  return call;
}

export function migrate(): Rule {
  return (tree: Tree) => {
    tree.visit((path) => {
      if (!path.endsWith('main.server.ts')) {
        return;
      }

      const content = tree.read(path);
      if (!content) {
        return;
      }

      const sourceFile = ts.createSourceFile(
        path,
        content.toString(),
        ts.ScriptTarget.Latest,
        true,
      );

      const bootstrapAppCall = findBootstrapApplicationCall(sourceFile);
      if (!bootstrapAppCall) {
        return;
      }

      const recorder = tree.beginUpdate(path);

      const parent = bootstrapAppCall.parent;
      let arrowFunc: ts.ArrowFunction | undefined;

      if (ts.isArrowFunction(parent) && parent.body === bootstrapAppCall) {
        arrowFunc = parent;
      } else if (ts.isReturnStatement(parent)) {
        const block = parent.parent;
        if (ts.isBlock(block) && ts.isArrowFunction(block.parent)) {
          arrowFunc = block.parent;
        }
      }

      if (arrowFunc && ts.isVariableDeclaration(arrowFunc.parent)) {
        const varDeclaration = arrowFunc.parent;
        if (varDeclaration.initializer === arrowFunc) {
          const argsText = bootstrapAppCall.arguments
            .map((arg) => arg.getText(sourceFile))
            .join(', ');
          const newCallText = `bootstrapServerApplication(${argsText})`;
          recorder.remove(arrowFunc.getStart(), arrowFunc.getWidth());
          recorder.insertRight(arrowFunc.getStart(), newCallText);
        }
      } else {
        recorder.remove(
          bootstrapAppCall.expression.getStart(),
          bootstrapAppCall.expression.getWidth(),
        );
        recorder.insertRight(bootstrapAppCall.expression.getStart(), 'bootstrapServerApplication');
      }

      const serverImportChange = insertImport(
        sourceFile,
        path,
        'bootstrapServerApplication',
        '@angular/platform-server',
      );

      applyToUpdateRecorder(recorder, [serverImportChange]);

      const bootstrapAppSpecifier = getImportSpecifier(
        sourceFile,
        '@angular/platform-browser',
        'bootstrapApplication',
      );

      if (bootstrapAppSpecifier) {
        const namedImports = bootstrapAppSpecifier.parent;
        if (namedImports.elements.length === 1) {
          const importDeclaration = namedImports.parent.parent;
          recorder.remove(importDeclaration.getFullStart(), importDeclaration.getFullWidth());
        } else {
          const updatedImports = removeSymbolFromNamedImports(namedImports, bootstrapAppSpecifier);
          const printer = ts.createPrinter();
          const replacement = printer.printNode(
            ts.EmitHint.Unspecified,
            updatedImports,
            sourceFile,
          );
          recorder.remove(namedImports.getStart(), namedImports.getWidth());
          recorder.insertRight(namedImports.getStart(), replacement);
        }
      }

      tree.commitUpdate(recorder);
    });
  };
}
