/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getImportSpecifier} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

/**
 * Finds typed nodes (e.g. function parameters or class properties) that are referencing the old
 * `Renderer`, as well as calls to the `Renderer` methods.
 */
export function findRendererReferences(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    rendererImportSpecifier: ts.ImportSpecifier) {
  const typedNodes = new Set<ts.ParameterDeclaration|ts.PropertyDeclaration|ts.AsExpression>();
  const methodCalls = new Set<ts.CallExpression>();
  const forwardRefs = new Set<ts.Identifier>();
  const forwardRefSpecifier = getImportSpecifier(sourceFile, '@angular/core', 'forwardRef');

  ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
    if ((ts.isParameter(node) || ts.isPropertyDeclaration(node)) &&
        isReferenceToImport(typeChecker, node.name, rendererImportSpecifier)) {
      typedNodes.add(node);
    } else if (
        ts.isAsExpression(node) &&
        isReferenceToImport(typeChecker, node.type, rendererImportSpecifier)) {
      typedNodes.add(node);
    } else if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) &&
          isReferenceToImport(typeChecker, node.expression.expression, rendererImportSpecifier)) {
        methodCalls.add(node);
      } else if (
          // If we're dealing with a forwardRef that's returning a Renderer.
          forwardRefSpecifier && ts.isIdentifier(node.expression) &&
          isReferenceToImport(typeChecker, node.expression, forwardRefSpecifier) &&
          node.arguments.length) {
        const rendererIdentifier =
            findRendererIdentifierInForwardRef(typeChecker, node, rendererImportSpecifier);
        if (rendererIdentifier) {
          forwardRefs.add(rendererIdentifier);
        }
      }
    }

    ts.forEachChild(node, visitNode);
  });

  return {typedNodes, methodCalls, forwardRefs};
}

/** Finds the identifier referring to the `Renderer` inside a `forwardRef` call expression. */
function findRendererIdentifierInForwardRef(
    typeChecker: ts.TypeChecker, node: ts.CallExpression,
    rendererImport: ts.ImportSpecifier|null): ts.Identifier|null {
  const firstArg = node.arguments[0];

  if (ts.isArrowFunction(firstArg) && rendererImport) {
    // Check if the function is `forwardRef(() => Renderer)`.
    if (ts.isIdentifier(firstArg.body) &&
        isReferenceToImport(typeChecker, firstArg.body, rendererImport)) {
      return firstArg.body;
    } else if (ts.isBlock(firstArg.body) && ts.isReturnStatement(firstArg.body.statements[0])) {
      // Otherwise check if the expression is `forwardRef(() => { return Renderer })`.
      const returnStatement = firstArg.body.statements[0] as ts.ReturnStatement;

      if (returnStatement.expression && ts.isIdentifier(returnStatement.expression) &&
          isReferenceToImport(typeChecker, returnStatement.expression, rendererImport)) {
        return returnStatement.expression;
      }
    }
  }

  return null;
}
