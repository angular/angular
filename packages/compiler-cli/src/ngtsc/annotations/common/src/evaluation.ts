/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {Reference} from '../../../imports';
import {EnumValue, PartialEvaluator, ResolvedValue} from '../../../partial_evaluator';
import {ClassDeclaration, Decorator} from '../../../reflection';

import {createValueHasWrongTypeError} from './diagnostics';
import {isAngularCoreReference, unwrapExpression} from './util';


export function resolveEnumValue(
    evaluator: PartialEvaluator, metadata: Map<string, ts.Expression>, field: string,
    enumSymbolName: string): number|null {
  let resolved: number|null = null;
  if (metadata.has(field)) {
    const expr = metadata.get(field)!;
    const value = evaluator.evaluate(expr) as any;
    if (value instanceof EnumValue && isAngularCoreReference(value.enumRef, enumSymbolName)) {
      resolved = value.resolved as number;
    } else {
      throw createValueHasWrongTypeError(
          expr, value, `${field} must be a member of ${enumSymbolName} enum from @angular/core`);
    }
  }
  return resolved;
}

/** Determines if the result of an evaluation is a string array. */
export function isStringArray(resolvedValue: ResolvedValue): resolvedValue is string[] {
  return Array.isArray(resolvedValue) && resolvedValue.every(elem => typeof elem === 'string');
}

export function isClassReferenceArray(resolvedValue: ResolvedValue):
    resolvedValue is Reference<ClassDeclaration>[] {
  return Array.isArray(resolvedValue) &&
      resolvedValue.every(elem => elem instanceof Reference && ts.isClassDeclaration(elem.node));
}

export function isArray(value: ResolvedValue): value is Array<ResolvedValue> {
  return Array.isArray(value);
}

export function resolveLiteral(
    decorator: Decorator,
    literalCache: Map<Decorator, ts.ObjectLiteralExpression>): ts.ObjectLiteralExpression {
  if (literalCache.has(decorator)) {
    return literalCache.get(decorator)!;
  }
  if (decorator.args === null || decorator.args.length !== 1) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
        `Incorrect number of arguments to @${decorator.name} decorator`);
  }
  const meta = unwrapExpression(decorator.args[0]);

  if (!ts.isObjectLiteralExpression(meta)) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, `Decorator argument must be literal.`);
  }

  literalCache.set(decorator, meta);
  return meta;
}
