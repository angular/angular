/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Expands the given reference to its containing expression, capturing
 * the full context.
 *
 * E.g. `traverseAccess(ref<`bla`>)` may return `this.bla`
 *   or `traverseAccess(ref<`bla`>)` may return `this.someObj.a.b.c.bla`.
 *
 * This helper is useful as we will replace the full access with a temporary
 * variable for narrowing. Replacing just the identifier is wrong.
 */
export function traverseAccess(
  access: ts.Identifier,
): ts.Identifier | ts.PropertyAccessExpression | ts.ElementAccessExpression {
  if (ts.isPropertyAccessExpression(access.parent) && access.parent.name === access) {
    return access.parent;
  } else if (
    ts.isElementAccessExpression(access.parent) &&
    access.parent.argumentExpression === access
  ) {
    return access.parent;
  }
  return access;
}
