/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getImportOfIdentifier, Import} from './imports';

export type CallExpressionDecorator = ts.Decorator&{
  expression: ts.CallExpression;
};

export interface NgDecorator {
  name: string;
  node: CallExpressionDecorator;
  importNode: ts.ImportDeclaration;
}

/**
 * Gets all decorators which are imported from an Angular package
 * (e.g. "@angular/core") from a list of decorators.
 */
export function getAngularDecorators(
    typeChecker: ts.TypeChecker, decorators: ReadonlyArray<ts.Decorator>): NgDecorator[] {
  return decorators.map(node => ({node, importData: getCallDecoratorImport(typeChecker, node)}))
      .filter(({importData}) => importData && importData.importModule.startsWith('@angular/'))
      .map(({node, importData}) => ({
             node: node as CallExpressionDecorator,
             name: importData!.name,
             importNode: importData!.node
           }));
}

export function getCallDecoratorImport(
    typeChecker: ts.TypeChecker, decorator: ts.Decorator): Import|null {
  // Note that this does not cover the edge case where decorators are called from
  // a namespace import: e.g. "@core.Component()". This is not handled by Ngtsc either.
  if (!ts.isCallExpression(decorator.expression) ||
      !ts.isIdentifier(decorator.expression.expression)) {
    return null;
  }

  const identifier = decorator.expression.expression;
  return getImportOfIdentifier(typeChecker, identifier);
}
