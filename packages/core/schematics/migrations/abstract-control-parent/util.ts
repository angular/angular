/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from 'path';
import * as ts from 'typescript';

/** Names of symbols from `@angular/forms` whose `parent` accesses have to be migrated. */
const abstractControlSymbols = new Set<string>([
  'AbstractControl',
  'FormArray',
  'FormControl',
  'FormGroup',
]);

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

/** Checks whether a node's type is nullable (`null`, `undefined` or `void`). */
function isNullableType(typeChecker: ts.TypeChecker, node: ts.Node) {
  // Skip expressions in the form of `foo.bar!.baz` since the `TypeChecker` seems
  // to identify them as null, even though the user indicated that it won't be.
  if (node.parent && ts.isNonNullExpression(node.parent)) {
    return false;
  }

  const type = typeChecker.getTypeAtLocation(node);
  const typeNode = typeChecker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.None);
  let hasSeenNullableType = false;

  // Trace the type of the node back to a type node, walk
  // through all of its sub-nodes and look for nullable tyes.
  if (typeNode) {
    (function walk(current: ts.Node) {
      if (current.kind === ts.SyntaxKind.NullKeyword ||
          current.kind === ts.SyntaxKind.UndefinedKeyword ||
          current.kind === ts.SyntaxKind.VoidKeyword) {
        hasSeenNullableType = true;
        // Note that we don't descend into type literals, because it may cause
        // us to mis-identify the root type as nullable, because it has a nullable
        // property (e.g. `{ foo: string | null }`).
      } else if (!hasSeenNullableType && !ts.isTypeLiteralNode(current)) {
        current.forEachChild(walk);
      }
    })(typeNode);
  }

  return hasSeenNullableType;
}

/**
 * Checks whether a particular node is part of a null check. E.g. given:
 * `control.parent ? control.parent.value : null` the null check would be `control.parent`.
 */
function isNullCheck(node: ts.PropertyAccessExpression): boolean {
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
function isSafeAccess(node: ts.PropertyAccessExpression): boolean {
  return node.parent != null && ts.isPropertyAccessExpression(node.parent) &&
      node.parent.expression === node && node.parent.questionDotToken != null;
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
    const type = typeChecker.getTypeAtLocation(current.expression);
    const symbol = type.getSymbol();
    if (symbol && type) {
      const sourceFile = symbol.valueDeclaration?.getSourceFile();
      return sourceFile != null &&
          formsPattern.test(normalize(sourceFile.fileName).replace(/\\/g, '/')) &&
          hasAbstractControlType(typeChecker, type);
    }
    current = current.expression;
  }
  return false;
}

/**
 * Walks through the sub-types of a type, looking for a type that
 * has the same name as one of the `AbstractControl` types.
 */
function hasAbstractControlType(typeChecker: ts.TypeChecker, type: ts.Type): boolean {
  const typeNode = typeChecker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.None);
  let hasMatch = false;
  if (typeNode) {
    (function walk(current: ts.Node) {
      if (ts.isIdentifier(current) && abstractControlSymbols.has(current.text)) {
        hasMatch = true;
        // Note that we don't descend into type literals, because it may cause
        // us to mis-identify the root type as nullable, because it has a nullable
        // property (e.g. `{ foo: FormControl }`).
      } else if (!hasMatch && !ts.isTypeLiteralNode(current)) {
        current.forEachChild(walk);
      }
    })(typeNode);
  }
  return hasMatch;
}
