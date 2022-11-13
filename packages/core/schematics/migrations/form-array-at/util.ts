/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from 'path';
import ts from 'typescript';

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
  findAtCalls(typeChecker, sourceFile)
      .sort((a, b) => a.getStart() - b.getStart())
      .forEach(
          (node, index) =>
              updateFn(sourceFile, node.getStart(), node.getWidth() + index, '!', basePath));
}

/**
 * Finds the `PropertyAccessExpression`-s that are accessing the `parent` property in
 * such a way that may result in a compilation error after the v11 type changes.
 */
export function findAtCalls(typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile): ts.Node[] {
  const results: ts.Node[] = [];

  sourceFile.forEachChild(function walk(node: ts.Node) {
    const parent = node.parent;
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'at' &&
        ts.isCallExpression(node.parent) && !isNullCheck(node) && !isSafeAccess(node.parent) &&
        results.indexOf(node) === -1 && isFormArrayReference(typeChecker, node) &&
        isNullableType(typeChecker, node)) {
      const lastToken = node.parent.expression.getLastToken();
      if (lastToken) {
        results.unshift(parent);
      }
    }
    node.forEachChild(walk);
  });

  return results;
}

/**
 * Checks whether a particular node is part of a null check. E.g. given:
 * `control.parent ? control.parent.value : null` the null check would be `control.parent`.
 */
function isNullCheck(node: ts.Node): boolean {
  if (!node.parent) {
    return false;
  }

  // `control.parent && control.parent.value` where `node` is `control.parent`.
  if (ts.isBinaryExpression(node.parent) && node.parent.left === node) {
    return true;
  }

  // `control.parent && control.parent.parent && control.parent.parent.value`
  // where `node` is `control.parent`.
  if (node.parent.parent && ts.isBinaryExpression(node.parent.parent) &&
      node.parent.parent.left === node.parent) {
    return true;
  }

  // `if (control.parent) {...}` where `node` is `control.parent`.
  if (ts.isIfStatement(node.parent) && node.parent.expression === node) {
    return true;
  }

  // `control.parent ? control.parent.value : null` where `node` is `control.parent`.
  if (ts.isConditionalExpression(node.parent) && node.parent.condition === node) {
    return true;
  }

  return false;
}

/** Checks whether a property access is safe (e.g. `foo.parent?.value`). */
function isSafeAccess(node: ts.Node): boolean {
  return (
      node.parent != null && ts.isPropertyAccessExpression(node.parent) &&
      node.parent.expression === node && node.parent.questionDotToken != null);
}

/** Checks whether a property access is on an `FormArray` coming from `@angular/forms`. */
function isFormArrayReference(
    typeChecker: ts.TypeChecker, node: ts.PropertyAccessExpression): boolean {
  let current: ts.Expression = node;
  const formsPattern = /node_modules\/?.*\/@angular\/forms/;
  // Walks up the property access chain and tries to find a symbol tied to a `SourceFile`.
  // If such a node is found, we check whether the type is one of the `FormArray` symbols
  // and whether it comes from the `@angular/forms` directory in the `node_modules`.
  while (ts.isPropertyAccessExpression(current)) {
    const symbol = typeChecker.getTypeAtLocation(current.expression)?.getSymbol();

    if (symbol) {
      const sourceFile = symbol.valueDeclaration?.getSourceFile();
      return (
          sourceFile != null &&
          formsPattern.test(normalize(sourceFile.fileName).replace(/\\/g, '/')) &&
          hasOneOfTypes(typeChecker, current.expression, ['FormArray']));
    }
    current = current.expression;
  }
  return false;
}
