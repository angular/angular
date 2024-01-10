/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {InputMapping} from '../../../metadata';
import {ClassMember, ReflectionHost, reflectObjectLiteral} from '../../../reflection';

/** Metadata describing an input declared via the `input` function. */
interface InputMemberMetadata {
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
function tryParseInputInitializerAndOptions(
    member: Pick<ClassMember, 'value'>, reflector: ReflectionHost,
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
  if (target.text === 'input') {
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
  let targetImport: {name: string}|null = reflector.getImportOfIdentifier(target);
  if (targetImport === null) {
    if (coreModule !== undefined) {
      return false;
    }
    // We are compiling the core module, where no import can be present.
    targetImport = {name: target.text};
  }

  return targetImport.name === 'input';
}

/** Parses and validates the input function options expression. */
function parseAndValidateOptions(optionsNode: ts.Expression): {alias: string|undefined} {
  if (!ts.isObjectLiteralExpression(optionsNode)) {
    throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE, optionsNode,
        'Argument needs to be an object literal that is statically analyzable.');
  }

  const options = reflectObjectLiteral(optionsNode);
  let alias: string|undefined = undefined;

  if (options.has('alias')) {
    const aliasExpr = options.get('alias')!;
    if (!ts.isStringLiteralLike(aliasExpr)) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, aliasExpr,
          'Alias needs to be a string that is statically analyzable.');
    }

    alias = aliasExpr.text;
  }

  return {alias};
}

/**
 * Attempts to parse a signal input class member. Returns the parsed
 * input mapping if possible.
 */
export function tryParseSignalInputMapping(
    member: Pick<ClassMember, 'name'|'value'>, reflector: ReflectionHost,
    coreModule: string|undefined): InputMapping|null {
  const signalInput = tryParseInputInitializerAndOptions(member, reflector, coreModule);
  if (signalInput === null) {
    return null;
  }

  const optionsNode = signalInput.optionsNode;
  const options = optionsNode !== undefined ? parseAndValidateOptions(optionsNode) : null;
  const classPropertyName = member.name;

  return {
    isSignal: true,
    classPropertyName,
    bindingPropertyName: options?.alias ?? classPropertyName,
    required: signalInput.isRequired,
    // Signal inputs do not capture complex transform metadata.
    // See more details in the `transform` type of `InputMapping`.
    transform: null,
  };
}
