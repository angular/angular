/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from 'path';
import ts from 'typescript';

import {isNullCheck, isSafeAccess} from '../../utils/typescript/nodes';
import {hasOneOfTypes, isNullableType} from '../../utils/typescript/symbol';

type UpdateFn =
    (sourceFile: ts.SourceFile, start: number, length: number, content: string,
     basePath?: string) => void;

export function migrateFile(
    sourceFile: ts.SourceFile, basePath: string, typeChecker: ts.TypeChecker, updateFn: UpdateFn) {
  // We sort the nodes based on their position in the file and we offset the positions by one
  // for each non-null assertion that we've added. We have to do it this way, rather than
  // creating and printing a new AST node like in other migrations, because property access
  // expressions can be nested (e.g. `control.parent.parent.value`), but the node positions
  // aren't being updated as we're inserting new code. If we were to go through the AST,
  // we'd have to update the `SourceFile` and start over after each operation.
  findFirstLastAccesses(typeChecker, sourceFile)
      .sort((a, b) => a.getStart() - b.getStart())
      .forEach(
          (node, index) =>
              updateFn(sourceFile, node.getStart(), node.getWidth() + index, '!', basePath));
}

/**
 * Finds the `PropertyAccessExpression`-s that are accessing the `first` or `last` property of
 * a QueryList.
 */
function findFirstLastAccesses(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile): ts.PropertyAccessExpression[] {
  const results: ts.PropertyAccessExpression[] = [];

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isPropertyAccessExpression(node) &&
        (node.name.text === 'first' || node.name.text === 'last') && !isNullCheck(node) &&
        !isSafeAccess(node) && results.indexOf(node) === -1 &&
        isQueryListReference(typeChecker, node) && isNullableType(typeChecker, node)) {
      results.unshift(node);
    }

    node.forEachChild(walk);
  });

  return results;
}

/** Checks whether a property access is on an `QueryList` coming from `@angular/core`. */
function isQueryListReference(
    typeChecker: ts.TypeChecker, node: ts.PropertyAccessExpression): boolean {
  let current: ts.Expression = node;
  const corePattern = /node_modules\/?.*\/@angular\/core/;
  // Walks up the property access chain and tries to find a symbol tied to a `SourceFile`.
  // If such a node is found, we check whether the type is the QueryList symbol
  // and whether it comes from the `@angular/core` directory in the `node_modules`.
  while (ts.isPropertyAccessExpression(current)) {
    const symbol = typeChecker.getTypeAtLocation(current.expression)?.getSymbol();
    if (symbol) {
      const sourceFile = symbol.valueDeclaration?.getSourceFile();
      return sourceFile != null &&
          corePattern.test(normalize(sourceFile.fileName).replace(/\\/g, '/')) &&
          hasOneOfTypes(typeChecker, current.expression, ['QueryList']);
    }
    current = current.expression;
  }
  return false;
}
