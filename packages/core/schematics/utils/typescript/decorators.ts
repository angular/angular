/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {getImportOfIdentifier, Import} from './imports';

export function getCallDecoratorImport(
  typeChecker: ts.TypeChecker,
  decorator: ts.Decorator,
): Import | null {
  // Note that this does not cover the edge case where decorators are called from
  // a namespace import: e.g. "@core.Component()". This is not handled by Ngtsc either.
  if (
    !ts.isCallExpression(decorator.expression) ||
    !ts.isIdentifier(decorator.expression.expression)
  ) {
    return null;
  }

  const identifier = decorator.expression.expression;
  return getImportOfIdentifier(typeChecker, identifier);
}
