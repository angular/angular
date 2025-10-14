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
import {EnumValue} from '../../../partial_evaluator';
import {createValueHasWrongTypeError} from './diagnostics';
import {isAngularCoreReferenceWithPotentialAliasing, unwrapExpression} from './util';
export function resolveEnumValue(evaluator, metadata, field, enumSymbolName, isCore) {
  let resolved = null;
  if (metadata.has(field)) {
    const expr = metadata.get(field);
    const value = evaluator.evaluate(expr);
    if (
      value instanceof EnumValue &&
      isAngularCoreReferenceWithPotentialAliasing(value.enumRef, enumSymbolName, isCore)
    ) {
      resolved = value.resolved;
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
export function resolveEncapsulationEnumValueLocally(expr) {
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
export function isStringArray(resolvedValue) {
  return Array.isArray(resolvedValue) && resolvedValue.every((elem) => typeof elem === 'string');
}
export function isClassReferenceArray(resolvedValue) {
  return (
    Array.isArray(resolvedValue) &&
    resolvedValue.every((elem) => elem instanceof Reference && ts.isClassDeclaration(elem.node))
  );
}
export function isArray(value) {
  return Array.isArray(value);
}
export function resolveLiteral(decorator, literalCache) {
  if (literalCache.has(decorator)) {
    return literalCache.get(decorator);
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
//# sourceMappingURL=evaluation.js.map
