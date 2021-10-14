/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getImportOfIdentifier, Import} from './imports';

export type CallExpressionDecorator = ts.Decorator & {
  expression: ts.CallExpression;
};

export interface NgDecorator {
  name: string;
  node: CallExpressionDecorator;
}

/**
 * Gets all decorators which are imported from an Angular package
 * (e.g. "@angular/core") from a list of decorators.
 */
export function getAngularDecorators(
  typeChecker: ts.TypeChecker,
  decorators: readonly ts.Decorator[],
): readonly NgDecorator[] {
  return decorators
    .map(node => ({node, importData: getCallDecoratorImport(typeChecker, node)}))
    .filter(({importData}) => importData && importData.moduleName.startsWith('@angular/'))
    .map(({node, importData}) => ({
      node: node as CallExpressionDecorator,
      name: importData!.symbolName,
    }));
}

export function getCallDecoratorImport(
  typeChecker: ts.TypeChecker,
  decorator: ts.Decorator,
): Import | null {
  if (!ts.isCallExpression(decorator.expression)) {
    return null;
  }
  const valueExpr = decorator.expression.expression;
  let identifier: ts.Identifier | null = null;
  if (ts.isIdentifier(valueExpr)) {
    identifier = valueExpr;
  } else if (ts.isPropertyAccessExpression(valueExpr) && ts.isIdentifier(valueExpr.name)) {
    identifier = valueExpr.name;
  }
  return identifier ? getImportOfIdentifier(identifier, typeChecker) : null;
}
