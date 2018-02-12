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
  const latestValue = exp === NO_CHANGE ? peekBinding() : exp;
  if (bind(exp) !== NO_CHANGE) different = true;

  return different ? factoryFn(latestValue) : NO_CHANGE;
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

  const latestVal1 = exp1 === NO_CHANGE ? peekBinding() : exp1;
  if (bind(exp1) !== NO_CHANGE) different = true;

  const latestVal2 = exp2 === NO_CHANGE ? peekBinding() : exp2;
  if (bind(exp2) !== NO_CHANGE) different = true;

  return different ? factoryFn(latestVal1, latestVal2) : NO_CHANGE;
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

  const latestVal1 = exp1 === NO_CHANGE ? peekBinding() : exp1;
  if (bind(exp1) !== NO_CHANGE) different = true;

  const latestVal2 = exp2 === NO_CHANGE ? peekBinding() : exp2;
  if (bind(exp2) !== NO_CHANGE) different = true;

  const latestVal3 = exp3 === NO_CHANGE ? peekBinding() : exp3;
  if (bind(exp3) !== NO_CHANGE) different = true;

  return different ? factoryFn(latestVal1, latestVal2, latestVal3) : NO_CHANGE;
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

  const latestVal1 = exp1 === NO_CHANGE ? peekBinding() : exp1;
  if (bind(exp1) !== NO_CHANGE) different = true;

  const latestVal2 = exp2 === NO_CHANGE ? peekBinding() : exp2;
  if (bind(exp2) !== NO_CHANGE) different = true;

  const latestVal3 = exp3 === NO_CHANGE ? peekBinding() : exp3;
  if (bind(exp3) !== NO_CHANGE) different = true;

  const latestVal4 = exp4 === NO_CHANGE ? peekBinding() : exp4;
  if (bind(exp4) !== NO_CHANGE) different = true;

  return different ? factoryFn(latestVal1, latestVal2, latestVal3, latestVal4) : NO_CHANGE;
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

  const latestVal1 = exp1 === NO_CHANGE ? peekBinding() : exp1;
  if (bind(exp1) !== NO_CHANGE) different = true;

  const latestVal2 = exp2 === NO_CHANGE ? peekBinding() : exp2;
  if (bind(exp2) !== NO_CHANGE) different = true;

  const latestVal3 = exp3 === NO_CHANGE ? peekBinding() : exp3;
  if (bind(exp3) !== NO_CHANGE) different = true;

  const latestVal4 = exp4 === NO_CHANGE ? peekBinding() : exp4;
  if (bind(exp4) !== NO_CHANGE) different = true;

  const latestVal5 = exp5 === NO_CHANGE ? peekBinding() : exp5;
  if (bind(exp5) !== NO_CHANGE) different = true;

  return different ? factoryFn(latestVal1, latestVal2, latestVal3, latestVal4, latestVal5) :
                     NO_CHANGE;
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

  const latestVal1 = exp1 === NO_CHANGE ? peekBinding() : exp1;
  if (bind(exp1) !== NO_CHANGE) different = true;

  const latestVal2 = exp2 === NO_CHANGE ? peekBinding() : exp2;
  if (bind(exp2) !== NO_CHANGE) different = true;

  const latestVal3 = exp3 === NO_CHANGE ? peekBinding() : exp3;
  if (bind(exp3) !== NO_CHANGE) different = true;

  const latestVal4 = exp4 === NO_CHANGE ? peekBinding() : exp4;
  if (bind(exp4) !== NO_CHANGE) different = true;

  const latestVal5 = exp5 === NO_CHANGE ? peekBinding() : exp5;
  if (bind(exp5) !== NO_CHANGE) different = true;

  const latestVal6 = exp6 === NO_CHANGE ? peekBinding() : exp6;
  if (bind(exp6) !== NO_CHANGE) different = true;

  return different ?
      factoryFn(latestVal1, latestVal2, latestVal3, latestVal4, latestVal5, latestVal6) :
      NO_CHANGE;
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

  const latestVal1 = exp1 === NO_CHANGE ? peekBinding() : exp1;
  if (bind(exp1) !== NO_CHANGE) different = true;

  const latestVal2 = exp2 === NO_CHANGE ? peekBinding() : exp2;
  if (bind(exp2) !== NO_CHANGE) different = true;

  const latestVal3 = exp3 === NO_CHANGE ? peekBinding() : exp3;
  if (bind(exp3) !== NO_CHANGE) different = true;

  const latestVal4 = exp4 === NO_CHANGE ? peekBinding() : exp4;
  if (bind(exp4) !== NO_CHANGE) different = true;

  const latestVal5 = exp5 === NO_CHANGE ? peekBinding() : exp5;
  if (bind(exp5) !== NO_CHANGE) different = true;

  const latestVal6 = exp6 === NO_CHANGE ? peekBinding() : exp6;
  if (bind(exp6) !== NO_CHANGE) different = true;

  const latestVal7 = exp7 === NO_CHANGE ? peekBinding() : exp7;
  if (bind(exp7) !== NO_CHANGE) different = true;

  return different ?
      factoryFn(
          latestVal1, latestVal2, latestVal3, latestVal4, latestVal5, latestVal6, latestVal7) :
      NO_CHANGE;
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

  const latestVal1 = exp1 === NO_CHANGE ? peekBinding() : exp1;
  if (bind(exp1) !== NO_CHANGE) different = true;

  const latestVal2 = exp2 === NO_CHANGE ? peekBinding() : exp2;
  if (bind(exp2) !== NO_CHANGE) different = true;

  const latestVal3 = exp3 === NO_CHANGE ? peekBinding() : exp3;
  if (bind(exp3) !== NO_CHANGE) different = true;

  const latestVal4 = exp4 === NO_CHANGE ? peekBinding() : exp4;
  if (bind(exp4) !== NO_CHANGE) different = true;

  const latestVal5 = exp5 === NO_CHANGE ? peekBinding() : exp5;
  if (bind(exp5) !== NO_CHANGE) different = true;

  const latestVal6 = exp6 === NO_CHANGE ? peekBinding() : exp6;
  if (bind(exp6) !== NO_CHANGE) different = true;

  const latestVal7 = exp7 === NO_CHANGE ? peekBinding() : exp7;
  if (bind(exp7) !== NO_CHANGE) different = true;

  const latestVal8 = exp8 === NO_CHANGE ? peekBinding() : exp8;
  if (bind(exp8) !== NO_CHANGE) different = true;

  return different ? factoryFn(
                         latestVal1, latestVal2, latestVal3, latestVal4, latestVal5, latestVal6,
                         latestVal7, latestVal8) :
                     NO_CHANGE;
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
    const exp = exps[i];
    if (exp === NO_CHANGE) exps[i] = peekBinding();
    if (bind(exp) !== NO_CHANGE) different = true;
  }

  return different ? factoryFn(exps) : NO_CHANGE;
}
