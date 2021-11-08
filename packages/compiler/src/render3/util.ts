/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeIdentifier} from '../output/abstract_emitter';
import * as o from '../output/output_ast';
import {Identifiers} from './r3_identifiers';

export function typeWithParameters(type: o.Expression, numParams: number): o.ExpressionType {
  if (numParams === 0) {
    return o.expressionType(type);
  }
  const params: o.Type[] = [];
  for (let i = 0; i < numParams; i++) {
    params.push(o.DYNAMIC_TYPE);
  }
  return o.expressionType(type, undefined, params);
}

export interface R3Reference {
  value: o.Expression;
  type: o.Expression;
}

/**
 * Result of compilation of a render3 code unit, e.g. component, directive, pipe, etc.
 */
export interface R3CompiledExpression {
  expression: o.Expression;
  type: o.Type;
  statements: o.Statement[];
}

const ANIMATE_SYMBOL_PREFIX = '@';
export function prepareSyntheticPropertyName(name: string) {
  return `${ANIMATE_SYMBOL_PREFIX}${name}`;
}

export function prepareSyntheticListenerName(name: string, phase: string) {
  return `${ANIMATE_SYMBOL_PREFIX}${name}.${phase}`;
}

export function getSafePropertyAccessString(accessor: string, name: string): string {
  const escapedName = escapeIdentifier(name, false, false);
  return escapedName !== name ? `${accessor}[${escapedName}]` : `${accessor}.${name}`;
}

export function prepareSyntheticListenerFunctionName(name: string, phase: string) {
  return `animation_${name}_${phase}`;
}

export function jitOnlyGuardedExpression(expr: o.Expression): o.Expression {
  return guardedExpression('ngJitMode', expr);
}

export function devOnlyGuardedExpression(expr: o.Expression): o.Expression {
  return guardedExpression('ngDevMode', expr);
}

export function guardedExpression(guard: string, expr: o.Expression): o.Expression {
  const guardExpr = new o.ExternalExpr({name: guard, moduleName: null});
  const guardNotDefined = new o.BinaryOperatorExpr(
      o.BinaryOperator.Identical, new o.TypeofExpr(guardExpr), o.literal('undefined'));
  const guardUndefinedOrTrue = new o.BinaryOperatorExpr(
      o.BinaryOperator.Or, guardNotDefined, guardExpr, /* type */ undefined,
      /* sourceSpan */ undefined, true);
  return new o.BinaryOperatorExpr(o.BinaryOperator.And, guardUndefinedOrTrue, expr);
}

export function wrapReference(value: any): R3Reference {
  const wrapped = new o.WrappedNodeExpr(value);
  return {value: wrapped, type: wrapped};
}

export function refsToArray(refs: R3Reference[], shouldForwardDeclare: boolean): o.Expression {
  const values = o.literalArr(refs.map(ref => ref.value));
  return shouldForwardDeclare ? o.fn([], [new o.ReturnStatement(values)]) : values;
}


/**
 * Describes an expression that may have been wrapped in a `forwardRef()` guard.
 *
 * This is used when describing expressions that can refer to types that may eagerly reference types
 * that have not yet been defined.
 */
export interface MaybeForwardRefExpression<T extends o.Expression = o.Expression> {
  /**
   * The unwrapped expression.
   */
  expression: T;
  /**
   * If true, then the `expression` contains a reference to something that has not yet been
   * defined.
   *
   * This means that the expression must not be eagerly evaluated. Instead it must be wrapped in a
   * function closure that will be evaluated lazily to allow the definition of the expression to be
   * evaluated first.
   *
   * In some cases the expression will naturally be placed inside such a function closure, such as
   * in a fully compiled factory function. In those cases nothing more needs to be done.
   *
   * But in other cases, such as partial-compilation the expression will be located in top level
   * code so will need to be wrapped in a function that is passed to a `forwardRef()` call.
   */
  isForwardRef: boolean;
}

export function createMayBeForwardRefExpression<T extends o.Expression>(
    expression: T, isForwardRef: boolean): MaybeForwardRefExpression<T> {
  return {expression, isForwardRef};
}

/**
 * Convert a `MaybeForwardRefExpression` to an `Expression`, possibly wrapping its expression in a
 * `forwardRef()` call.
 *
 * If `MaybeForwardRefExpression.isForwardRef` is true then the expression was originally wrapped in
 * a `forwardRef()` call to prevent the value from being eagerly evaluated in the code.
 *
 * Normally, the linker will statically process the code, putting the `expression` inside a factory
 * function so the `forwardRef()` wrapper is not evaluated before it has been defined. But if the
 * partial declaration is evaluated by the JIT compiler the `forwardRef()` call is still needed to
 * prevent eager evaluation of the `expression`.
 *
 * So in partial declarations, expressions that could be forward-refs are wrapped in `forwardRef()`
 * calls, and this is then unwrapped in the linker as necessary.
 *
 * See `packages/compiler-cli/src/ngtsc/annotations/src/injectable.ts` and
 * `packages/compiler/src/jit_compiler_facade.ts` for more information.
 */
export function convertFromMaybeForwardRefExpression(
    {expression, isForwardRef}: MaybeForwardRefExpression): o.Expression {
  return isForwardRef ? generateForwardRef(expression) : expression;
}

/**
 * Generate an expression that has the given `expr` wrapped in the following form:
 *
 * ```
 * forwardRef(() => expr)
 * ```
 */
export function generateForwardRef(expr: o.Expression): o.Expression {
  return o.importExpr(Identifiers.forwardRef).callFn([o.fn([], [new o.ReturnStatement(expr)])]);
}
