/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from 'path';
import * as ts from 'typescript';
import {isNullCheck, isSafeAccess} from '../../utils/typescript/nodes';
import {hasOneOfTypes, isNullableType} from '../../utils/typescript/symbol';

/** Names of symbols from `@angular/forms` whose `parent` accesses have to be migrated. */
const abstractControlSymbols = ['AbstractControl', 'FormArray', 'FormControl', 'FormGroup'];

/**
 * Finds the `PropertyAccessExpression`-s that are accessing the `parent` property in
 * such a way that may result in a compilation error after the v11 type changes.
 */
export function findParentAccesses(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile): ts.PropertyAccessExpression[] {
  const results: ts.PropertyAccessExpression[] = [];

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'parent' && !isNullCheck(node) &&
        !isSafeAccess(node) && results.indexOf(node) === -1 &&
        isAbstractControlReference(typeChecker, node) && isNullableType(typeChecker, node)) {
      results.unshift(node);
    }

    node.forEachChild(walk);
  });

  return results;
}

/** Checks whether a property access is on an `AbstractControl` coming from `@angular/forms`. */
function isAbstractControlReference(
    typeChecker: ts.TypeChecker, node: ts.PropertyAccessExpression): boolean {
  let current: ts.Expression = node;
  const formsPattern = /node_modules\/?.*\/@angular\/forms/;
  // Walks up the property access chain and tries to find a symbol tied to a `SourceFile`.
  // If such a node is found, we check whether the type is one of the `AbstractControl` symbols
  // and whether it comes from the `@angular/forms` directory in the `node_modules`.
  while (ts.isPropertyAccessExpression(current)) {
    const symbol = typeChecker.getTypeAtLocation(current.expression)?.getSymbol();
    if (symbol) {
      const sourceFile = symbol.valueDeclaration?.getSourceFile();
      return sourceFile != null &&
          formsPattern.test(normalize(sourceFile.fileName).replace(/\\/g, '/')) &&
          hasOneOfTypes(typeChecker, current.expression, abstractControlSymbols);
    }
    current = current.expression;
  }
  return false;
}
