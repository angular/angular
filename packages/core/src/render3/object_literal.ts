/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NO_CHANGE, bind, getCurrentBinding} from './instructions';

/**
 * Whether one of the bindings in an object/array literal has changed.
 * Resets to false at the start of every o() instruction.
 */
let different = false;

/**
 * Gets the latest value for this binding.
 *
 * @param value new value to check against binding
 */
function getLatestValue(value: any): any {
  // When expressions are nested like {a: {b: exp}}, o() instructions must be built on top
  // of each other (e.g. o1(e0_ff, o1(e0_ff_1, ctx.exp)). For these cases, the value might be
  // NO_CHANGES from the level before it, so the binding needs to be retrieved manually.
  if (value === NO_CHANGE) return getCurrentBinding();

  if (bind(value) !== NO_CHANGE) {
    different = true;
  }
  return value;
}

/**
 * If the object or array has changed, returns a copy with the updated expression.
 * Or if the expression hasn't changed, returns NO_CHANGE.
 *
 * @param factoryFn Function that returns an updated instance of the object/array
 * @param exp Updated expression value
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral1(factoryFn: (v: any) => any, exp: any): any {
  different = false;
  exp = getLatestValue(exp);
  return different ? factoryFn(exp) : NO_CHANGE;
}

/**
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn
 * @param exp1
 * @param exp2
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral2(factoryFn: (v1: any, v2: any) => any, exp1: any, exp2: any): any {
  different = false;
  exp1 = getLatestValue(exp1);
  exp2 = getLatestValue(exp2);
  return different ? factoryFn(exp1, exp2) : NO_CHANGE;
}

/**
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral3(
    factoryFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any): any {
  different = false;
  exp1 = getLatestValue(exp1);
  exp2 = getLatestValue(exp2);
  exp3 = getLatestValue(exp3);
  return different ? factoryFn(exp1, exp2, exp3) : NO_CHANGE;
}

/**
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral4(
    factoryFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any, exp3: any,
    exp4: any): any {
  different = false;
  exp1 = getLatestValue(exp1);
  exp2 = getLatestValue(exp2);
  exp3 = getLatestValue(exp3);
  exp4 = getLatestValue(exp4);
  return different ? factoryFn(exp1, exp2, exp3, exp4) : NO_CHANGE;
}

/**
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral5(
    factoryFn: (v1: any, v2: any, v3: any, v4: any, v5: any) => any, exp1: any, exp2: any,
    exp3: any, exp4: any, exp5: any): any {
  different = false;
  exp1 = getLatestValue(exp1);
  exp2 = getLatestValue(exp2);
  exp3 = getLatestValue(exp3);
  exp4 = getLatestValue(exp4);
  exp5 = getLatestValue(exp5);
  return different ? factoryFn(exp1, exp2, exp3, exp4, exp5) : NO_CHANGE;
}

/**
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral6(
    factoryFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any) => any, exp1: any, exp2: any,
    exp3: any, exp4: any, exp5: any, exp6: any): any {
  different = false;
  exp1 = getLatestValue(exp1);
  exp2 = getLatestValue(exp2);
  exp3 = getLatestValue(exp3);
  exp4 = getLatestValue(exp4);
  exp5 = getLatestValue(exp5);
  exp6 = getLatestValue(exp6);
  return different ? factoryFn(exp1, exp2, exp3, exp4, exp5, exp6) : NO_CHANGE;
}

/**
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral7(
    factoryFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any) => any, exp1: any,
    exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any): any {
  different = false;
  exp1 = getLatestValue(exp1);
  exp2 = getLatestValue(exp2);
  exp3 = getLatestValue(exp3);
  exp4 = getLatestValue(exp4);
  exp5 = getLatestValue(exp5);
  exp6 = getLatestValue(exp6);
  exp7 = getLatestValue(exp7);
  return different ? factoryFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7) : NO_CHANGE;
}

/**
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @param exp8
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral8(
    factoryFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any) => any,
    exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, exp8: any): any {
  different = false;
  exp1 = getLatestValue(exp1);
  exp2 = getLatestValue(exp2);
  exp3 = getLatestValue(exp3);
  exp4 = getLatestValue(exp4);
  exp5 = getLatestValue(exp5);
  exp6 = getLatestValue(exp6);
  exp7 = getLatestValue(exp7);
  exp8 = getLatestValue(exp8);
  return different ? factoryFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8) : NO_CHANGE;
}
