/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {escapeIdentifier} from '../output/abstract_emitter';
import * as o from '../output/output_ast';
import {Identifiers} from './r3_identifiers';
export function typeWithParameters(type, numParams) {
  if (numParams === 0) {
    return o.expressionType(type);
  }
  const params = [];
  for (let i = 0; i < numParams; i++) {
    params.push(o.DYNAMIC_TYPE);
  }
  return o.expressionType(type, undefined, params);
}
const LEGACY_ANIMATE_SYMBOL_PREFIX = '@';
export function prepareSyntheticPropertyName(name) {
  return `${LEGACY_ANIMATE_SYMBOL_PREFIX}${name}`;
}
export function prepareSyntheticListenerName(name, phase) {
  return `${LEGACY_ANIMATE_SYMBOL_PREFIX}${name}.${phase}`;
}
export function getSafePropertyAccessString(accessor, name) {
  const escapedName = escapeIdentifier(name, false, false);
  return escapedName !== name ? `${accessor}[${escapedName}]` : `${accessor}.${name}`;
}
export function prepareSyntheticListenerFunctionName(name, phase) {
  return `animation_${name}_${phase}`;
}
export function jitOnlyGuardedExpression(expr) {
  return guardedExpression('ngJitMode', expr);
}
export function devOnlyGuardedExpression(expr) {
  return guardedExpression('ngDevMode', expr);
}
export function guardedExpression(guard, expr) {
  const guardExpr = new o.ExternalExpr({name: guard, moduleName: null});
  const guardNotDefined = new o.BinaryOperatorExpr(
    o.BinaryOperator.Identical,
    new o.TypeofExpr(guardExpr),
    o.literal('undefined'),
  );
  const guardUndefinedOrTrue = new o.BinaryOperatorExpr(
    o.BinaryOperator.Or,
    guardNotDefined,
    guardExpr,
    /* type */ undefined,
    /* sourceSpan */ undefined,
  );
  return new o.BinaryOperatorExpr(o.BinaryOperator.And, guardUndefinedOrTrue, expr);
}
export function wrapReference(value) {
  const wrapped = new o.WrappedNodeExpr(value);
  return {value: wrapped, type: wrapped};
}
export function refsToArray(refs, shouldForwardDeclare) {
  const values = o.literalArr(refs.map((ref) => ref.value));
  return shouldForwardDeclare ? o.arrowFn([], values) : values;
}
export function createMayBeForwardRefExpression(expression, forwardRef) {
  return {expression, forwardRef};
}
/**
 * Convert a `MaybeForwardRefExpression` to an `Expression`, possibly wrapping its expression in a
 * `forwardRef()` call.
 *
 * If `MaybeForwardRefExpression.forwardRef` is `ForwardRefHandling.Unwrapped` then the expression
 * was originally wrapped in a `forwardRef()` call to prevent the value from being eagerly evaluated
 * in the code.
 *
 * See `packages/compiler-cli/src/ngtsc/annotations/src/injectable.ts` and
 * `packages/compiler/src/jit_compiler_facade.ts` for more information.
 */
export function convertFromMaybeForwardRefExpression({expression, forwardRef}) {
  switch (forwardRef) {
    case 0 /* ForwardRefHandling.None */:
    case 1 /* ForwardRefHandling.Wrapped */:
      return expression;
    case 2 /* ForwardRefHandling.Unwrapped */:
      return generateForwardRef(expression);
  }
}
/**
 * Generate an expression that has the given `expr` wrapped in the following form:
 *
 * ```ts
 * forwardRef(() => expr)
 * ```
 */
export function generateForwardRef(expr) {
  return o.importExpr(Identifiers.forwardRef).callFn([o.arrowFn([], expr)]);
}
//# sourceMappingURL=util.js.map
