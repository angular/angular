/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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

/**
 * Gets whether the given field is accessed via the
 * given reference.
 *
 * E.g. whether `<my-read>.toArray` is detected.
 */
export function checkTsReferenceAccessesField(
  ref: TsReference<ClassFieldDescriptor>,
  fieldName: string,
): (ts.PropertyAccessExpression & {name: ts.Identifier}) | null {
  const accessNode = traverseAccess(ref.from.node);

  // Check if the reference is part of a property access.
  if (
    !ts.isPropertyAccessExpression(accessNode.parent) ||
    !ts.isIdentifier(accessNode.parent.name)
  ) {
    return null;
  }

  // Check if the reference is refers to the given field name.
  if (accessNode.parent.name.text !== fieldName) {
    return null;
  }

  return accessNode.parent as ReturnType<typeof checkTsReferenceAccessesField>;
}

/**
 * Gets whether the given read is used to access
 * the specified field.
 *
 * E.g. whether `<my-read>.toArray` is detected.
 */
export function checkNonTsReferenceAccessesField(
  ref: HostBindingReference<ClassFieldDescriptor> | TemplateReference<ClassFieldDescriptor>,
  fieldName: string,
): PropertyRead | null {
  const readFromPath = ref.from.readAstPath.at(-1) as PropertyRead | AST | undefined;
  const parentRead = ref.from.readAstPath.at(-2) as PropertyRead | AST | undefined;

  if (ref.from.read !== readFromPath) {
    return null;
  }
  if (!(parentRead instanceof PropertyRead) || parentRead.name !== fieldName) {
    return null;
  }

  return parentRead;
}

export interface FnCallExpression extends ts.CallExpression {
  expression: ts.PropertyAccessExpression & {
    name: ts.Identifier;
  };
}

/**
 * Gets whether the given reference is accessed to call the
 * specified function on it.
 *
 * E.g. whether `<my-read>.toArray()` is detected.
 */
export function checkTsReferenceCallsField(
  ref: TsReference<ClassFieldDescriptor>,
  fieldName: string,
): FnCallExpression | null {
  const propertyAccess = checkTsReferenceAccessesField(ref, fieldName);
  if (propertyAccess === null) {
    return null;
  }
  if (
    ts.isCallExpression(propertyAccess.parent) &&
    propertyAccess.parent.expression === propertyAccess
  ) {
    return propertyAccess.parent as FnCallExpression;
  }
  return null;
}

/**
 * Gets whether the given reference is accessed to call the
 * specified function on it.
 *
 * E.g. whether `<my-read>.toArray()` is detected.
 */
export function checkNonTsReferenceCallsField(
  ref: TemplateReference<ClassFieldDescriptor> | HostBindingReference<ClassFieldDescriptor>,
  fieldName: string,
): (Call & {receiver: PropertyRead}) | null {
  const propertyAccess = checkNonTsReferenceAccessesField(ref, fieldName);
  if (propertyAccess === null) {
    return null;
  }
  const accessIdx = ref.from.readAstPath.indexOf(propertyAccess);
  if (accessIdx === -1) {
    return null;
  }
  const potentialCall = ref.from.readAstPath[accessIdx - 1];
  if (potentialCall === undefined || !(potentialCall instanceof Call)) {
    return null;
  }
  return potentialCall as Call & {receiver: PropertyRead};
}
