/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getCallDecoratorImport} from '../../utils/typescript/decorators';

/** Finds and migrates all Angular decorators that pass in `entryComponents`. */
export function migrateEntryComponentsUsages(
    typeChecker: ts.TypeChecker, printer: ts.Printer, sourceFile: ts.SourceFile) {
  const results: {start: number, length: number, end: number, replacement: string}[] = [];

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression) &&
        node.expression.arguments.length === 1 &&
        ts.isObjectLiteralExpression(node.expression.arguments[0])) {
      const analysis = getCallDecoratorImport(typeChecker, node);

      if (analysis && analysis.importModule === '@angular/core' &&
          (analysis.name === 'Component' || analysis.name === 'NgModule')) {
        const literal = node.expression.arguments[0];
        const entryComponentsProp = literal.properties.find(
            property => ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) &&
                property.name.text === 'entryComponents');

        if (entryComponentsProp) {
          const replacementNode = ts.updateObjectLiteral(
              literal, literal.properties.filter(prop => prop !== entryComponentsProp));

          results.push({
            start: literal.getStart(),
            length: literal.getWidth(),
            end: literal.getEnd(),
            replacement: printer.printNode(ts.EmitHint.Unspecified, replacementNode, sourceFile)
          });
        }
      }
    }

    node.forEachChild(walk);
  });

  // Sort the operations in reverse order in order to avoid
  // issues when migrating multiple usages within the same file.
  return results.sort((a, b) => b.start - a.start);
}
