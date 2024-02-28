/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {createMayBeForwardRefExpression, ForwardRefHandling, MaybeForwardRefExpression, outputAst as o, R3QueryMetadata} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {ImportedSymbolsTracker} from '../../../imports';
import {ClassMember, ReflectionHost, reflectObjectLiteral} from '../../../reflection';
import {tryUnwrapForwardRef} from '../../common';

import {tryParseInitializerApiMember} from './initializer_functions';

/** Possible query initializer API functions. */
export type QueryFunctionName = 'viewChild'|'contentChild'|'viewChildren'|'contentChildren';

/** Possible names of query initializer APIs. */
const queryFunctionNames: QueryFunctionName[] =
    ['viewChild', 'viewChildren', 'contentChild', 'contentChildren'];

// The `descendants` option is enabled by default, except for content children.
const defaultDescendantsValue = (type: QueryFunctionName) => type !== 'contentChildren';

/**
 * Attempts to detect a possible query definition for the given class member.
 *
 * This function checks for all possible variants of queries and matches the
 * first one. The query is then analyzed and its resolved metadata is returned.
 *
 * @returns Resolved query metadata, or null if no query is declared.
 */
export function tryParseSignalQueryFromInitializer(
    member: Pick<ClassMember, 'name'|'value'>, reflector: ReflectionHost,
    importTracker: ImportedSymbolsTracker):
    {name: QueryFunctionName, metadata: R3QueryMetadata, call: ts.CallExpression}|null {
  const query = tryParseInitializerApiMember(queryFunctionNames, member, reflector, importTracker);
  if (query === null) {
    return null;
  }

  const isSingleQuery = query.apiName === 'viewChild' || query.apiName === 'contentChild';
  const predicateNode = query.call.arguments[0] as ts.Expression | undefined;
  if (predicateNode === undefined) {
    throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE, query.call, 'No locator specified.');
  }

  const optionsNode = query.call.arguments[1] as ts.Expression | undefined;
  if (optionsNode !== undefined && !ts.isObjectLiteralExpression(optionsNode)) {
    throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE, optionsNode, 'Argument needs to be an object literal.');
  }
  const options = optionsNode && reflectObjectLiteral(optionsNode);
  const read = options?.has('read') ? parseReadOption(options.get('read')!) : null;
  const descendants = options?.has('descendants') ?
      parseDescendantsOption(options.get('descendants')!) :
      defaultDescendantsValue(query.apiName as QueryFunctionName);

  return {
    name: query.apiName as QueryFunctionName,
    call: query.call,
    metadata: {
      isSignal: true,
      propertyName: member.name,
      static: false,
      emitDistinctChangesOnly: true,
      predicate: parseLocator(predicateNode, reflector),
      first: isSingleQuery,
      read,
      descendants,
    },
  };
}

/** Parses the locator/predicate of the query. */
function parseLocator(expression: ts.Expression, reflector: ReflectionHost): string[]|
    MaybeForwardRefExpression<o.Expression> {
  // Attempt to unwrap `forwardRef` calls.
  const unwrappedExpression = tryUnwrapForwardRef(expression, reflector);
  if (unwrappedExpression !== null) {
    expression = unwrappedExpression;
  }

  if (ts.isStringLiteralLike(expression)) {
    return [expression.text];
  }

  return createMayBeForwardRefExpression(
      new o.WrappedNodeExpr(expression),
      unwrappedExpression !== null ? ForwardRefHandling.Unwrapped : ForwardRefHandling.None);
}

/**
 * Parses the `read` option of a query.
 *
 * We only support the following patterns for the `read` option:
 *     - `read: someImport.BLA`,
 *     - `read: BLA`
 *
 * That is because we cannot trivially support complex expressions,
 * especially those referencing `this`. The read provider token will
 * live outside of the class in the static class definition.
 */
function parseReadOption(value: ts.Expression): o.Expression {
  if (ts.isExpressionWithTypeArguments(value) || ts.isParenthesizedExpression(value) ||
      ts.isAsExpression(value)) {
    return parseReadOption(value.expression);
  }

  if (ts.isPropertyAccessExpression(value) && ts.isIdentifier(value.expression) ||
      ts.isIdentifier(value)) {
    return new o.WrappedNodeExpr(value);
  }

  throw new FatalDiagnosticError(
      ErrorCode.VALUE_NOT_LITERAL, value,
      `Query "read" option expected a literal class reference.`);
}

/** Parses the `descendants` option of a query. */
function parseDescendantsOption(value: ts.Expression): boolean {
  if (value.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  } else if (value.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  throw new FatalDiagnosticError(
      ErrorCode.VALUE_HAS_WRONG_TYPE, value,
      `Expected "descendants" option to be a boolean literal.`);
}
