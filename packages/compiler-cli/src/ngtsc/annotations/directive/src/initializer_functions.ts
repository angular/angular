/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ImportedSymbolsTracker} from '../../../imports';
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
 * Metadata that can be inferred from an initializer
 * statically without going through the type checker.
 */
interface StaticInitializerData {
  /** Identifier in the initializer that refers to the Angular API. */
  node: ts.Identifier;

  /** Whether the call is required. */
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
    importTracker: ImportedSymbolsTracker): InitializerFunctionMetadata|null {
  if (member.value === null || !ts.isCallExpression(member.value)) {
    return null;
  }

  const call = member.value;
  const staticResult = parseTopLevelCall(call, fnNames, importTracker) ||
      parseTopLevelRequiredCall(call, fnNames, importTracker) ||
      parseTopLevelCallFromNamespace(call, fnNames, importTracker);

  if (staticResult === null) {
    return null;
  }

  // Once we've statically determined that the initializer is one of the APIs we're looking for, we
  // need to verify it using the type checker which accounts for things like shadowed variables.
  // This should be done as the absolute last step since using the type check can be expensive.
  const resolvedImport = reflector.getImportOfIdentifier(staticResult.node);
  if (resolvedImport === null || !(fnNames as string[]).includes(resolvedImport.name)) {
    return null;
  }

  return {
    call,
    isRequired: staticResult.isRequired,
    apiName: resolvedImport.name as InitializerApiFunction,
  };
}

/**
 * Attempts to parse a top-level call to an initializer function,
 * e.g. `prop = input()`. Returns null if it can't be parsed.
 */
function parseTopLevelCall(
    call: ts.CallExpression, fnNames: InitializerApiFunction[],
    importTracker: ImportedSymbolsTracker): StaticInitializerData|null {
  const node = call.expression;

  if (!ts.isIdentifier(node)) {
    return null;
  }

  return fnNames.some(
             name => importTracker.isPotentialReferenceToNamedImport(node, name, CORE_MODULE)) ?
      {node, isRequired: false} :
      null;
}

/**
 * Attempts to parse a top-level call to a required initializer,
 * e.g. `prop = input.required()`. Returns null if it can't be parsed.
 */
function parseTopLevelRequiredCall(
    call: ts.CallExpression, fnNames: InitializerApiFunction[],
    importTracker: ImportedSymbolsTracker): StaticInitializerData|null {
  const node = call.expression;

  if (!ts.isPropertyAccessExpression(node) || !ts.isIdentifier(node.expression) ||
      node.name.text !== 'required') {
    return null;
  }

  const expression = node.expression;
  const matchesCoreApi = fnNames.some(
      name => importTracker.isPotentialReferenceToNamedImport(expression, name, CORE_MODULE));

  return matchesCoreApi ? {node: expression, isRequired: true} : null;
}


/**
 * Attempts to parse a top-level call to a function referenced via a namespace import,
 * e.g. `prop = core.input.required()`. Returns null if it can't be parsed.
 */
function parseTopLevelCallFromNamespace(
    call: ts.CallExpression, fnNames: InitializerApiFunction[],
    importTracker: ImportedSymbolsTracker): StaticInitializerData|null {
  const node = call.expression;

  if (!ts.isPropertyAccessExpression(node)) {
    return null;
  }

  let apiReference: ts.Identifier|null = null;
  let isRequired = false;

  // `prop = core.input()`
  if (ts.isIdentifier(node.expression) && ts.isIdentifier(node.name) &&
      importTracker.isPotentialReferenceToNamespaceImport(node.expression, CORE_MODULE)) {
    apiReference = node.name;
  } else if (
      // `prop = core.input.required()`
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) && ts.isIdentifier(node.expression.name) &&
      importTracker.isPotentialReferenceToNamespaceImport(
          node.expression.expression, CORE_MODULE) &&
      node.name.text === 'required') {
    apiReference = node.expression.name;
    isRequired = true;
  }

  if (apiReference === null || !(fnNames as string[]).includes(apiReference.text)) {
    return null;
  }

  return {node: apiReference, isRequired};
}
