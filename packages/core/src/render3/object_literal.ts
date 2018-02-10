/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NO_CHANGE, bind, peekBinding} from './instructions';

/**
 * If the object or array has changed, returns a copy with the updated expression.
 * Or if the expression hasn't changed, returns NO_CHANGE.
 *
 * @param factoryFn Function that returns an updated instance of the object/array
 * @param exp Updated expression value
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteral1(factoryFn: (v: any) => any, exp: any): any {
  let different = false;
  if (exp === NO_CHANGE) exp = peekBinding();
  if (bind(exp) !== NO_CHANGE) different = true;

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
  let different = false;

  if (exp1 === NO_CHANGE) exp1 = peekBinding();
  if (bind(exp1) !== NO_CHANGE) different = true;

  if (exp2 === NO_CHANGE) exp2 = peekBinding();
  if (bind(exp2) !== NO_CHANGE) different = true;

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
  let different = false;

  if (exp1 === NO_CHANGE) exp1 = peekBinding();
  if (bind(exp1) !== NO_CHANGE) different = true;

  if (exp2 === NO_CHANGE) exp2 = peekBinding();
  if (bind(exp2) !== NO_CHANGE) different = true;

  if (exp3 === NO_CHANGE) exp3 = peekBinding();
  if (bind(exp3) !== NO_CHANGE) different = true;

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
  let different = false;

  if (exp1 === NO_CHANGE) exp1 = peekBinding();
  if (bind(exp1) !== NO_CHANGE) different = true;

  if (exp2 === NO_CHANGE) exp2 = peekBinding();
  if (bind(exp2) !== NO_CHANGE) different = true;

  if (exp3 === NO_CHANGE) exp3 = peekBinding();
  if (bind(exp3) !== NO_CHANGE) different = true;

  if (exp4 === NO_CHANGE) exp4 = peekBinding();
  if (bind(exp4) !== NO_CHANGE) different = true;

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
  let different = false;

  if (exp1 === NO_CHANGE) exp1 = peekBinding();
  if (bind(exp1) !== NO_CHANGE) different = true;

  if (exp2 === NO_CHANGE) exp2 = peekBinding();
  if (bind(exp2) !== NO_CHANGE) different = true;

  if (exp3 === NO_CHANGE) exp3 = peekBinding();
  if (bind(exp3) !== NO_CHANGE) different = true;

  if (exp4 === NO_CHANGE) exp4 = peekBinding();
  if (bind(exp4) !== NO_CHANGE) different = true;

  if (exp5 === NO_CHANGE) exp5 = peekBinding();
  if (bind(exp5) !== NO_CHANGE) different = true;

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
  let different = false;

  if (exp1 === NO_CHANGE) exp1 = peekBinding();
  if (bind(exp1) !== NO_CHANGE) different = true;

  if (exp2 === NO_CHANGE) exp2 = peekBinding();
  if (bind(exp2) !== NO_CHANGE) different = true;

  if (exp3 === NO_CHANGE) exp3 = peekBinding();
  if (bind(exp3) !== NO_CHANGE) different = true;

  if (exp4 === NO_CHANGE) exp4 = peekBinding();
  if (bind(exp4) !== NO_CHANGE) different = true;

  if (exp5 === NO_CHANGE) exp5 = peekBinding();
  if (bind(exp5) !== NO_CHANGE) different = true;

  if (exp6 === NO_CHANGE) exp6 = peekBinding();
  if (bind(exp6) !== NO_CHANGE) different = true;

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
  let different = false;

  if (exp1 === NO_CHANGE) exp1 = peekBinding();
  if (bind(exp1) !== NO_CHANGE) different = true;

  if (exp2 === NO_CHANGE) exp2 = peekBinding();
  if (bind(exp2) !== NO_CHANGE) different = true;

  if (exp3 === NO_CHANGE) exp3 = peekBinding();
  if (bind(exp3) !== NO_CHANGE) different = true;

  if (exp4 === NO_CHANGE) exp4 = peekBinding();
  if (bind(exp4) !== NO_CHANGE) different = true;

  if (exp5 === NO_CHANGE) exp5 = peekBinding();
  if (bind(exp5) !== NO_CHANGE) different = true;

  if (exp6 === NO_CHANGE) exp6 = peekBinding();
  if (bind(exp6) !== NO_CHANGE) different = true;

  if (exp7 === NO_CHANGE) exp7 = peekBinding();
  if (bind(exp7) !== NO_CHANGE) different = true;

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
  let different = false;

  if (exp1 === NO_CHANGE) exp1 = peekBinding();
  if (bind(exp1) !== NO_CHANGE) different = true;

  if (exp2 === NO_CHANGE) exp2 = peekBinding();
  if (bind(exp2) !== NO_CHANGE) different = true;

  if (exp3 === NO_CHANGE) exp3 = peekBinding();
  if (bind(exp3) !== NO_CHANGE) different = true;

  if (exp4 === NO_CHANGE) exp4 = peekBinding();
  if (bind(exp4) !== NO_CHANGE) different = true;

  if (exp5 === NO_CHANGE) exp5 = peekBinding();
  if (bind(exp5) !== NO_CHANGE) different = true;

  if (exp6 === NO_CHANGE) exp6 = peekBinding();
  if (bind(exp6) !== NO_CHANGE) different = true;

  if (exp7 === NO_CHANGE) exp7 = peekBinding();
  if (bind(exp7) !== NO_CHANGE) different = true;

  if (exp8 === NO_CHANGE) exp8 = peekBinding();
  if (bind(exp8) !== NO_CHANGE) different = true;

  return different ? factoryFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8) : NO_CHANGE;
}

/**
 * objectLiteral instruction that can support any number of bindings.
 *
 * If the object or array has changed, returns a copy with all updated expressions.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param factoryFn A factory function that takes binding values and builds an object or array
 * containing those values.
 * @param exp An array of binding values
 * @returns A copy of the object/array or NO_CHANGE
 */
export function objectLiteralV(factoryFn: (v: any[]) => any, exps: any[]): any {
  let different = false;

  for (let i = 0; i < exps.length; i++) {
    let exp = exps[i];
    if (exp === NO_CHANGE) exps[i] = peekBinding();
    if (bind(exp) !== NO_CHANGE) different = true;
  }

  return different ? factoryFn(exps) : NO_CHANGE;
}
