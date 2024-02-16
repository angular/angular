/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ImportedSymbolsTracker} from '../../../imports';
import {ClassMember} from '../../../reflection';
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
    fnNames: FnNames, member: Pick<ClassMember, 'value'>, importTracker: ImportedSymbolsTracker,
    isCore: boolean): InitializerFunctionMetadata|null {
  if (isCore || member.value === null || !ts.isCallExpression(member.value)) {
    return null;
  }

  const call = member.value;
  return parseTopLevelCall(call, fnNames, importTracker) ||
      parseTopLevelRequiredCall(call, fnNames, importTracker) ||
      parseTopLevelCallFromNamespace(call, fnNames, importTracker);
}

/**
 * Attempts to parse a top-level call to an initializer function,
 * e.g. `prop = input()`. Returns null if it can't be parsed.
 */
function parseTopLevelCall(
    call: ts.CallExpression, fnNames: InitializerApiFunction[],
    importTracker: ImportedSymbolsTracker): InitializerFunctionMetadata|null {
  const node = call.expression;

  if (!ts.isIdentifier(node)) {
    return null;
  }

  const matchingNamedImport =
      fnNames.find(name => importTracker.isReferenceToNamedImport(node, name, CORE_MODULE));

  return matchingNamedImport === undefined ? null : {
    apiName: matchingNamedImport,
    call,
    isRequired: false,
  };
}

/**
 * Attempts to parse a top-level call to a required initializer,
 * e.g. `prop = input.required()`. Returns null if it can't be parsed.
 */
function parseTopLevelRequiredCall(
    call: ts.CallExpression, fnNames: InitializerApiFunction[],
    importTracker: ImportedSymbolsTracker): InitializerFunctionMetadata|null {
  const node = call.expression;

  if (!ts.isPropertyAccessExpression(node) || !ts.isIdentifier(node.expression) ||
      node.name.text !== 'required') {
    return null;
  }

  const expression = node.expression;
  const matchingNamedImport =
      fnNames.find(name => importTracker.isReferenceToNamedImport(expression, name, CORE_MODULE));

  return matchingNamedImport === undefined ? null : {
    apiName: matchingNamedImport,
    call,
    isRequired: true,
  };
}


/**
 * Attempts to parse a top-level call to a function referenced via a namespace import,
 * e.g. `prop = core.input.required()`. Returns null if it can't be parsed.
 */
function parseTopLevelCallFromNamespace(
    call: ts.CallExpression, fnNames: InitializerApiFunction[],
    importTracker: ImportedSymbolsTracker): InitializerFunctionMetadata|null {
  const node = call.expression;

  if (!ts.isPropertyAccessExpression(node)) {
    return null;
  }

  let apiReference: ts.Identifier|null = null;
  let isRequired = false;

  // `prop = core.input()`
  if (ts.isIdentifier(node.expression) && ts.isIdentifier(node.name) &&
      importTracker.isReferenceToNamespaceImport(node.expression, CORE_MODULE)) {
    apiReference = node.name;
  } else if (
      // `prop = core.input.required()`
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) && ts.isIdentifier(node.expression.name) &&
      importTracker.isReferenceToNamespaceImport(node.expression.expression, CORE_MODULE) &&
      node.name.text === 'required') {
    apiReference = node.expression.name;
    isRequired = true;
  }

  return (apiReference === null || !fnNames.includes(apiReference.text as InitializerApiFunction)) ?
      null :
      {
        apiName: apiReference.text as InitializerApiFunction,
        call,
        isRequired,
      };
}
