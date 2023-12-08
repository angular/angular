/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {PartialEvaluator} from '../../../partial_evaluator';
import {ClassMember, ReflectionHost} from '../../../reflection';


// identify input
// extract options if there are one (via `.configure`)

export interface InputMemberMetadata {
  inputCall: ts.CallExpression;
  optionsNode?: ts.Expression;
  isRequired: boolean;
}

export function tryParseInputInitializerAndOptions(
    member: ClassMember, reflector: ReflectionHost, evaluator: PartialEvaluator,
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
    const optionsNode = call.arguments[1];
    return {inputCall: call, optionsNode, isRequired: false};
  }

  // Case 2: Using `required.
  // -----
  if (target.text !== 'required' || !ts.isPropertyAccessExpression(call.expression)) {
    // Ensure there is a property access to `[input].with` or `[core.input].required`.
    return null;
  }

  const inputCall = call.expression;
  target = extractPropertyTarget(inputCall.expression);
  if (target === null || !isReferenceToInputFunction(target, coreModule, reflector)) {
    // Ensure the call refers to the real `input` function from Angular core.
    return null;
  }

  const optionsNode = call.arguments[0];

  return {
    inputCall: call,
    isRequired: true,
    optionsNode,
  };
}

function extractPropertyTarget(node: ts.Expression): ts.Identifier|null {
  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
    return node.name;
  } else if (ts.isIdentifier(node)) {
    return node;
  }
  return null;
}

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
  return decl.node.name.text === 'input';
}
