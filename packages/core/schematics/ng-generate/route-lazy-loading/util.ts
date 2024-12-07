/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {findAngularDecorator} from '@angular/compiler-cli/src/ngtsc/annotations';
import {ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection/index';
import {findLiteralProperty} from '../../utils/typescript/property_name';

/**
 * Checks whether a component is standalone.
 * @param node Class being checked.
 * @param reflector The reflection host to use.
 */
export function isStandaloneComponent(
  node: ts.ClassDeclaration,
  reflector: ReflectionHost,
): boolean {
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  if (decorators === null) {
    return false;
  }
  const decorator = findAngularDecorator(decorators, 'Component', false);
  if (decorator === undefined || decorator.args === null || decorator.args.length !== 1) {
    return false;
  }

  const arg = decorator.args[0];
  if (ts.isObjectLiteralExpression(arg)) {
    const property = findLiteralProperty(arg, 'standalone') as ts.PropertyAssignment;
    if (property) {
      return property.initializer.getText() === 'true';
    } else {
      return true; // standalone is true by default in v19
    }
  }

  return false;
}

/**
 * Checks whether a node is variable declaration of type Routes or Route[] and comes from @angular/router
 * @param node Variable declaration being checked.
 * @param typeChecker
 */
export function isAngularRoutesArray(node: ts.Node, typeChecker: ts.TypeChecker) {
  if (ts.isVariableDeclaration(node)) {
    const type = typeChecker.getTypeAtLocation(node);
    if (type && typeChecker.isArrayType(type)) {
      // Route[] is an array type
      const typeArguments = typeChecker.getTypeArguments(type as ts.TypeReference);
      const symbol = typeArguments[0]?.getSymbol();
      return (
        symbol?.name === 'Route' &&
        symbol?.declarations?.some((decl) => {
          return decl.getSourceFile().fileName.includes('@angular/router');
        })
      );
    }
  }
  return false;
}

/**
 * Checks whether a node is a call expression to a router module method.
 * Examples:
 * - RouterModule.forRoot(routes)
 * - RouterModule.forChild(routes)
 */
export function isRouterModuleCallExpression(node: ts.CallExpression, typeChecker: ts.TypeChecker) {
  if (ts.isPropertyAccessExpression(node.expression)) {
    const propAccess = node.expression;
    const moduleSymbol = typeChecker.getSymbolAtLocation(propAccess.expression);
    return (
      moduleSymbol?.name === 'RouterModule' &&
      (propAccess.name.text === 'forRoot' || propAccess.name.text === 'forChild')
    );
  }
  return false;
}

/**
 * Checks whether a node is a call expression to a router method.
 * Example: this.router.resetConfig(routes)
 */
export function isRouterCallExpression(node: ts.CallExpression, typeChecker: ts.TypeChecker) {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'resetConfig'
  ) {
    const calleeExpression = node.expression.expression;
    const symbol = typeChecker.getSymbolAtLocation(calleeExpression);
    if (symbol) {
      const type = typeChecker.getTypeOfSymbolAtLocation(symbol, calleeExpression);
      // if type of router is Router, then it is a router call expression
      return type.aliasSymbol?.escapedName === 'Router';
    }
  }
  return false;
}

/**
 * Checks whether a node is a call expression to router provide function.
 * Example: provideRoutes(routes)
 */
export function isRouterProviderCallExpression(
  node: ts.CallExpression,
  typeChecker: ts.TypeChecker,
) {
  if (ts.isIdentifier(node.expression)) {
    const moduleSymbol = typeChecker.getSymbolAtLocation(node.expression);
    return moduleSymbol && moduleSymbol.name === 'provideRoutes';
  }
  return false;
}

/**
 * Checks whether a node is a call expression to provideRouter function.
 * Example: provideRouter(routes)
 */
export function isProvideRoutesCallExpression(
  node: ts.CallExpression,
  typeChecker: ts.TypeChecker,
) {
  if (ts.isIdentifier(node.expression)) {
    const moduleSymbol = typeChecker.getSymbolAtLocation(node.expression);
    return moduleSymbol && moduleSymbol.name === 'provideRouter';
  }
  return false;
}
