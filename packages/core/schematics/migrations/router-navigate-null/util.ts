/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getImportOfIdentifier} from '../../utils/typescript/imports';

const routerFunctions = new Set(['navigate', 'navigateByUrl']);
const routerModule = '@angular/router';

type UpdateFn = (sourceFile: ts.SourceFile, node: ts.Node, content: string) => void;

export function migrateFile(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, updateFn: UpdateFn) {
  findRouterNavigateCalls(typeChecker, sourceFile)
      .forEach((node) => updateFn(sourceFile, node, '.then((result) => result!)'));
}

/**
 * Finds the `Node`s that are `Router.navigate` or `Router.navigateByUrl` function call expressions.
 * Call expressions which values are not used are ignored.
 */
export function findRouterNavigateCalls(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile): ts.Node[] {
  const results: ts.Node[] = [];

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isPropertyAccessExpression(node) && !results.includes(node) &&
        isRouterReference(typeChecker, node) && isRouterCallExpression(node.parent) &&
        isCallExpressionUsed(typeChecker, node.parent)) {
      results.unshift(node.parent);
    }
    node.forEachChild(walk);
  });

  return results;
}

function isRouterCallExpression(node: ts.Node): node is ts.CallExpression {
  if (ts.isCallExpression(node)) {
    // Walk through each children in this call expression and try to find call to any router
    // function we are interested. This check is necessary to catch cases where the function is
    // passed to another function and not called.
    return (node.expression.forEachChild((child) => {
      return ts.isIdentifier(child) && routerFunctions.has(child.getText());
    }) ?? false);
  }

  return false;
}

/**
 * Checks whether the given call expression node's return value is used.
 * Return values of `fn()` and `await fn()` are not used, while `return fn()`,
 * `const r = await fn()` and `fn().then()` are.
 */
function isCallExpressionUsed(typeChecker: ts.TypeChecker, node: ts.CallExpression) {
  // In case the call expression is awaited, we are interested about the grandparent node
  const resultNode = ts.isAwaitExpression(node.parent) ? node.parent.parent : node.parent;

  if (ts.isPropertyAccessExpression(resultNode)) {
    const hasThenIdentifier = resultNode.forEachChild((child) => {
      return ts.isIdentifier(child) && child.getText() === 'then';
    });

    if (hasThenIdentifier) {
      // Represents "navigateByUrl().then(...)" part
      const parentCallExpr = resultNode.parent as ts.CallExpression;

      // Represents whatever is inside the "then(...)" call
      const thenExpr = parentCallExpr.arguments.at(0);

      // If there are at least one parameter used by the function inside then() call,
      // we can assume that the function is using navigation result.
      return thenExpr && getFunctionParameterCount(typeChecker, thenExpr) > 0;
    }
  }

  return !ts.isExpressionStatement(resultNode);
}

/** Returns count of parameters the given node accepts. */
function getFunctionParameterCount(typeChecker: ts.TypeChecker, node: ts.Expression): number {
  // Matches arrow functions "() => {}" and functions "function () {}"
  if (ts.isFunctionLike(node)) {
    // If the function has at least one parameter, it has a good change of using the
    // navigation result
    return node.parameters.length;
  } else if (ts.isPropertyAccessExpression(node)) {
    const symbol = typeChecker.getSymbolAtLocation(node);
    const declaration = symbol?.declarations?.[0];

    if (declaration) {
      // Declaration might be an arrow function. Return count of parameters in property initializer
      if (ts.isPropertyDeclaration(declaration) && declaration.initializer &&
          ts.isArrowFunction(declaration.initializer)) {
        return declaration.initializer.parameters.length;
      }

      // Declaration is a method
      if (ts.isMethodDeclaration(declaration)) {
        const signature = typeChecker.getSignatureFromDeclaration(declaration);
        if (signature) {
          return signature.getParameters().length;
        }
      }
    }
  }

  return 0;
}

/** Checks whether a property access is coming from module `@angular/router`. */
function isRouterReference(
    typeChecker: ts.TypeChecker, node: ts.PropertyAccessExpression): boolean {
  // Walks recursively down the node tree and tries to find either identifier or call expression
  // that is coming from `@angular/router` module.
  const visitChildren = (child: ts.Node): boolean => {
    if (ts.isIdentifier(child) || ts.isCallExpression(child)) {
      const type = getInjectedTypeIdentifier(typeChecker, child);
      const importIdentifier = type && getImportOfIdentifier(typeChecker, type);
      return importIdentifier?.importModule === routerModule;
    }
    return ts.forEachChild(child, visitChildren) ?? false;
  };
  return ts.forEachChild(node, visitChildren) ?? false;
}

/**
 * Returns type identifier node that was used when initializing the variable or property via
 * constructor injection or via `inject` function.
 */
function getInjectedTypeIdentifier(typeChecker: ts.TypeChecker, node: ts.Node) {
  // Special handling for cases when return value of `inject` function is used right away
  // e.g. `inject(Router).navigate(...)`
  if (ts.isCallExpression(node)) {
    return getInjectReturnType(node);
  }

  const symbol = typeChecker.getSymbolAtLocation(node);
  const valueDecl = symbol?.valueDeclaration;

  if (!symbol || !valueDecl) {
    return null;
  }

  if (ts.isParameter(valueDecl) || ts.isPropertyDeclaration(valueDecl) ||
      ts.isVariableDeclaration(valueDecl)) {
    if (valueDecl.type && ts.isTypeReferenceNode(valueDecl.type) &&
        ts.isIdentifier(valueDecl.type.typeName)) {
      // Identifier has been declared via constructor or as a class property and has a type
      // reference with type identifier that we can use
      return valueDecl.type.typeName;
    } else if (valueDecl.initializer && ts.isCallExpression(valueDecl.initializer)) {
      // Identifier's type is inferred from initializer function `inject`
      return getInjectReturnType(valueDecl.initializer);
    }
  }

  return null;
}

/** Returns the first argument given to the `inject` function, if it's an identifier */
function getInjectReturnType(node: ts.CallExpression) {
  const {arguments: args, expression} = node;
  const firstArgument = args.at(0);

  // Return first argument of `inject` function
  if (expression.getText() == 'inject' && firstArgument && ts.isIdentifier(firstArgument)) {
    return firstArgument;
  }

  return null;
}
