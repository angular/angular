/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {traverseAccess} from '../signal-migration/src/utils/traverse_access';
import {
  HostBindingReference,
  TemplateReference,
  TsReference,
} from '../signal-migration/src/passes/reference_resolution/reference_kinds';
import {ClassFieldDescriptor} from '../signal-migration/src';
import {AST, Call, PropertyRead} from '@angular/compiler';

export interface FnCallExpression extends ts.CallExpression {
  expression: ts.PropertyAccessExpression & {
    name: ts.Identifier;
  };
}

/**
 * Gets whether the given identifier is accessed to call the
 * specified function on it.
 *
 * E.g. whether `<my-read>.toArray()` is detected.
 */
export function checkTsReferenceIsPartOfCallExpression(
  ref: TsReference<ClassFieldDescriptor>,
  fnName: string,
): FnCallExpression | null {
  const accessNode = traverseAccess(ref.from.node);

  // Check if the reference is part of a property access.
  if (
    !ts.isPropertyAccessExpression(accessNode.parent) ||
    !ts.isIdentifier(accessNode.parent.name)
  ) {
    return null;
  }

  // Check if the reference is part of a call expression.
  if (
    accessNode.parent.name.text !== fnName ||
    !ts.isCallExpression(accessNode.parent.parent) ||
    accessNode.parent.parent.expression !== accessNode.parent
  ) {
    return null;
  }

  return accessNode.parent.parent as FnCallExpression;
}

/**
 * Gets whether the given read is used to call the specified
 * function on it.
 *
 * E.g. whether `<my-read>.toArray()` is detected.
 */
export function checkNonTsReferenceIsPartOfCallExpression(
  ref: HostBindingReference<ClassFieldDescriptor> | TemplateReference<ClassFieldDescriptor>,
  fnName: string,
): (Call & {receiver: PropertyRead}) | null {
  const readFromPath = ref.from.readAstPath.at(-1) as PropertyRead | AST | undefined;
  const parentRead = ref.from.readAstPath.at(-2) as PropertyRead | AST | undefined;
  const call = ref.from.readAstPath.at(-3) as Call | AST | undefined;

  if (ref.from.read !== readFromPath) {
    return null;
  }
  if (!(parentRead instanceof PropertyRead) || parentRead.name !== fnName) {
    return null;
  }
  if (!(call instanceof Call) || call.receiver !== parentRead) {
    return null;
  }

  return call as Call & {receiver: PropertyRead};
}
