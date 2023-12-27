/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ClassMember, ReflectionHost} from '../../../reflection';

/** Metadata describing an input declared via the `input` function. */
export interface InputMemberMetadata {
  /** Node referring to the call expression. */
  inputCall: ts.CallExpression;
  /** Node referring to the options expression, if specified. */
  optionsNode: ts.Expression|undefined;
  /** Whether the input is required or not. i.e. `input.required` was used. */
  isRequired: boolean;
}

/**
 * Attempts to identify and parse an Angular input that is declared
 * as a class member using the `input`/`input.required` functions.
 */
export function tryParseInputInitializerAndOptions(
    member: ClassMember, reflector: ReflectionHost,
    coreModule: string|undefined): InputMemberMetadata|null {
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

  // Case 1: No `required`.
  // TODO(signal-input-public): Clean this up.
  if (target.text === 'input' || target.text === 'ɵinput') {
    if (!isReferenceToInputFunction(target, coreModule, reflector)) {
      return null;
    }
    const optionsNode: ts.Expression|undefined = call.arguments[1];
    return {inputCall: call, optionsNode, isRequired: false};
  }

  // Case 2: Using `required.
  // Ensure there is a property access to `[input].required` or `[core.input].required`.
  if (target.text !== 'required' || !ts.isPropertyAccessExpression(call.expression)) {
    return null;
  }

  const inputCall = call.expression;
  target = extractPropertyTarget(inputCall.expression);
  if (target === null || !isReferenceToInputFunction(target, coreModule, reflector)) {
    // Ensure the call refers to the real `input` function from Angular core.
    return null;
  }

  const optionsNode: ts.Expression|undefined = call.arguments[0];

  return {
    inputCall: call,
    optionsNode,
    isRequired: true,
  };
}

/**
 * Extracts the identifier property target of a expression, supporting
 * one level deep property accesses.
 *
 * e.g. `input.required` will return `input`.
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
 * Verifies that the given identifier resolves to the `input` expression from
 * Angular core.
 */
function isReferenceToInputFunction(
    target: ts.Identifier, coreModule: string|undefined, reflector: ReflectionHost): boolean {
  const decl = reflector.getDeclarationOfIdentifier(target);
  if (decl === null || !ts.isVariableDeclaration(decl.node) || decl.node.name === undefined ||
      !ts.isIdentifier(decl.node.name)) {
    // The initializer isn't a declared, identifier named variable declaration.
    return false;
  }
  if (coreModule !== undefined && decl.viaModule !== coreModule) {
    // The initializer is matching so far, but in the wrong module.
    return false;
  }
  // TODO(signal-input-public): Clean this up.
  return decl.node.name.text === 'input' || decl.node.name.text === 'ɵinput';
}
