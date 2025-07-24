/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ViewEncapsulation} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {Reference} from '../../../imports';
import {EnumValue, PartialEvaluator, ResolvedValue} from '../../../partial_evaluator';
import {ClassDeclaration, Decorator} from '../../../reflection';

import {createValueHasWrongTypeError} from './diagnostics';
import {isAngularCoreReferenceWithPotentialAliasing, unwrapExpression} from './util';

export function resolveEnumValue(
  evaluator: PartialEvaluator,
  metadata: Map<string, ts.Expression>,
  field: string,
  enumSymbolName: string,
  isCore: boolean,
): number | null {
  let resolved: number | null = null;
  if (metadata.has(field)) {
    const expr = metadata.get(field)!;
    const value = evaluator.evaluate(expr) as any;
    if (
      value instanceof EnumValue &&
      isAngularCoreReferenceWithPotentialAliasing(value.enumRef, enumSymbolName, isCore)
    ) {
      resolved = value.resolved as number;
    } else {
      throw createValueHasWrongTypeError(
        expr,
        value,
        `${field} must be a member of ${enumSymbolName} enum from @angular/core`,
      );
    }
  }
  return resolved;
}

/**
 * Resolves a EncapsulationEnum expression locally on best effort without having to calculate the
 * reference. This suites local compilation mode where each file is compiled individually.
 *
 * The static analysis is still needed in local compilation mode since the value of this enum will
 * be used later to decide the generated code for styles.
 */
export function resolveEncapsulationEnumValueLocally(expr?: ts.Expression): number | null {
  if (!expr) {
    return null;
  }

  const exprText = expr.getText().trim();

  for (const key in ViewEncapsulation) {
    if (!Number.isNaN(Number(key))) {
      continue;
    }

    const suffix = `ViewEncapsulation.${key}`;

    // Check whether the enum is imported by name or used by import namespace (e.g.,
    // core.ViewEncapsulation.None)
    if (exprText === suffix || exprText.endsWith(`.${suffix}`)) {
      const ans = Number(ViewEncapsulation[key]);
      return ans;
    }
  }

  return null;
}

/** Determines if the result of an evaluation is a string array. */
export function isStringArray(resolvedValue: ResolvedValue): resolvedValue is string[] {
  return Array.isArray(resolvedValue) && resolvedValue.every((elem) => typeof elem === 'string');
}

export function isClassReferenceArray(
  resolvedValue: ResolvedValue,
): resolvedValue is Reference<ClassDeclaration>[] {
  return (
    Array.isArray(resolvedValue) &&
    resolvedValue.every((elem) => elem instanceof Reference && ts.isClassDeclaration(elem.node))
  );
}

export function isArray(value: ResolvedValue): value is Array<ResolvedValue> {
  return Array.isArray(value);
}

export function resolveLiteral(
  decorator: Decorator,
  literalCache: Map<Decorator, ts.ObjectLiteralExpression>,
): ts.ObjectLiteralExpression {
  if (literalCache.has(decorator)) {
    return literalCache.get(decorator)!;
  }
  if (decorator.args === null || decorator.args.length !== 1) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_ARITY_WRONG,
      decorator.node,
      `Incorrect number of arguments to @${decorator.name} decorator`,
    );
  }
  const meta = unwrapExpression(decorator.args[0]);

  if (!ts.isObjectLiteralExpression(meta)) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_ARG_NOT_LITERAL,
      meta,
      `Decorator argument must be literal.`,
    );
  }

  literalCache.set(decorator, meta);
  return meta;
}
