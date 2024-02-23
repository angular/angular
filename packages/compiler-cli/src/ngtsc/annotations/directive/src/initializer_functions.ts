/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ClassMember, ReflectionHost} from '../../../reflection';
import {CORE_MODULE} from '../../common';

/**
 * @fileoverview
 *
 * Angular exposes functions that can be used as class member initializers
 * to make use of various APIs. Those are called initializer APIs.
 *
 * Signal-based inputs are relying on initializer APIs because such inputs
 * are declared using `input` and `input.required` intersection functions.
 * Similarly, signal-based queries follow the same pattern and are also
 * declared through initializer APIs.
 */

export type InitializerApiFunction =
    'input'|'model'|'ɵoutput'|'output'|'viewChild'|'viewChildren'|'contentChild'|'contentChildren';

/**
 * Metadata describing an Angular class member that was recognized through
 * a function initializer. Like `input`, `input.required` or `viewChild`.
 */
interface InitializerFunctionMetadata {
  /** Name of the initializer API function that was recognized. */
  apiName: InitializerApiFunction;
  /** Node referring to the call expression. */
  call: ts.CallExpression;
  /** Whether the initializer is required or not. E.g. `input.required` was used. */
  isRequired: boolean;
}

/**
 * Attempts to identify an Angular class member that is declared via
 * its initializer referring to a given initializer API function.
 *
 * Note that multiple possible initializer API function names can be specified,
 * allowing for checking multiple types in one pass.
 */
export function tryParseInitializerApiMember<FnNames extends InitializerApiFunction[]>(
    fnNames: FnNames, member: Pick<ClassMember, 'value'>, reflector: ReflectionHost,
    isCore: boolean): InitializerFunctionMetadata&{apiName: FnNames[number]}|null {
  if (member.value === null || !ts.isCallExpression(member.value)) {
    return null;
  }
  const call = member.value;

  // Extract target. Either:
  //    - `[input]`
  //    - `core.[input]`
  //    - `input.[required]`
  //    - `core.input.[required]`.
  let target = extractPropertyTarget(call.expression);
  if (target === null) {
    return null;
  }

  // Find if the `target` matches one of the expected APIs we are looking for.
  // e.g. `input`, or `viewChild`.
  let apiName = fnNames.find(n => n === target!.text);

  // Case 1: API is directly called. e.g. `input`
  // If no API name was matched, continue looking for `input.required`.
  if (apiName !== undefined) {
    if (!isReferenceToInitializerApiFunction(apiName, target, isCore, reflector)) {
      return null;
    }
    return {apiName, call, isRequired: false};
  }

  // Case 2: API is the `.required`
  // Ensure there is a property access to `[input].required` or `[core.input].required`.
  if (target.text !== 'required' || !ts.isPropertyAccessExpression(call.expression)) {
    return null;
  }

  // e.g. `[input.required]` (the full property access is this)
  const apiPropertyAccess = call.expression;
  // e.g. `[input].required` (we now extract the left side of the access).
  target = extractPropertyTarget(apiPropertyAccess.expression);
  if (target === null) {
    return null;
  }

  // Find if the `target` matches one of the expected APIs are are looking for.
  apiName = fnNames.find(n => n === target!.text);

  // Ensure the call refers to the real API function from Angular core.
  if (apiName === undefined ||
      !isReferenceToInitializerApiFunction(apiName, target, isCore, reflector)) {
    return null;
  }

  return {
    apiName,
    call,
    isRequired: true,
  };
}

/**
 * Extracts the identifier property target of a expression, supporting
 * one level deep property accesses.
 *
 * e.g. `input.required` will return `required`.
 * e.g. `input` will return `input`.
 *
 */
function extractPropertyTarget(node: ts.Expression): ts.Identifier|null {
  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
    return node.name;
  } else if (ts.isIdentifier(node)) {
    return node;
  }
  return null;
}

/**
 * Verifies that the given identifier resolves to the given initializer API
 * function expression from Angular core.
 */
function isReferenceToInitializerApiFunction(
    functionName: InitializerApiFunction, target: ts.Identifier, isCore: boolean,
    reflector: ReflectionHost): boolean {
  let targetImport: {name: string, from: string}|null = reflector.getImportOfIdentifier(target);
  if (targetImport === null) {
    if (!isCore) {
      return false;
    }
    // We are compiling the core module, where no import can be present.
    targetImport = {name: target.text, from: CORE_MODULE};
  }

  return targetImport.name === functionName && targetImport.from === CORE_MODULE;
}
