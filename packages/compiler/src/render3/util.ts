/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';
import {escapeIdentifier} from '../output/abstract_emitter';
import * as o from '../output/output_ast';
import {OutputContext} from '../util';

/**
 * Convert an object map with `Expression` values into a `LiteralMapExpr`.
 */
export function mapToMapExpression(map: {[key: string]: o.Expression|undefined}): o.LiteralMapExpr {
  const result = Object.keys(map).map(
      key => ({
        key,
        // The assertion here is because really TypeScript doesn't allow us to express that if the
        // key is present, it will have a value, but this is true in reality.
        value: map[key]!,
        quoted: false,
      }));
  return o.literalMap(result);
}

/**
 * Convert metadata into an `Expression` in the given `OutputContext`.
 *
 * This operation will handle arrays, references to symbols, or literal `null` or `undefined`.
 */
export function convertMetaToOutput(meta: any, ctx: OutputContext): o.Expression {
  if (Array.isArray(meta)) {
    return o.literalArr(meta.map(entry => convertMetaToOutput(entry, ctx)));
  }
  if (meta instanceof StaticSymbol) {
    return ctx.importExpr(meta);
  }
  if (meta == null) {
    return o.literal(meta);
  }

  throw new Error(`Internal error: Unsupported or unknown metadata: ${meta}`);
}

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

const ANIMATE_SYMBOL_PREFIX = '@';
export function prepareSyntheticPropertyName(name: string) {
  return `${ANIMATE_SYMBOL_PREFIX}${name}`;
}

export function prepareSyntheticListenerName(name: string, phase: string) {
  return `${ANIMATE_SYMBOL_PREFIX}${name}.${phase}`;
}

export function isSyntheticPropertyOrListener(name: string) {
  return name.charAt(0) == ANIMATE_SYMBOL_PREFIX;
}

export function getSyntheticPropertyName(name: string) {
  // this will strip out listener phase values...
  // @foo.start => @foo
  const i = name.indexOf('.');
  name = i > 0 ? name.substring(0, i) : name;
  if (name.charAt(0) !== ANIMATE_SYMBOL_PREFIX) {
    name = ANIMATE_SYMBOL_PREFIX + name;
  }
  return name;
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
