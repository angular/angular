/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindingUpdated, bindingUpdated2, bindingUpdated4, checkAndUpdateBinding, consumeBinding, getCreationMode} from './instructions';



/**
 * If the value hasn't been saved, calls the pure function to store and return the
 * value. If it has been saved, returns the saved value.
 *
 * @param pureFn Function that returns a value
 * @returns value
 */
export function pureFunction0<T>(pureFn: () => T): T {
  return getCreationMode() ? checkAndUpdateBinding(pureFn()) : consumeBinding();
}

/**
 * If the value of the provided exp has changed, calls the pure function to return
 * an updated value. Or if the value has not changed, returns cached value.
 *
 * @param pureFn Function that returns an updated value
 * @param exp Updated expression value
 * @returns Updated value
 */
export function pureFunction1(pureFn: (v: any) => any, exp: any): any {
  return bindingUpdated(exp) ? checkAndUpdateBinding(pureFn(exp)) : consumeBinding();
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn
 * @param exp1
 * @param exp2
 * @returns Updated value
 */
export function pureFunction2(pureFn: (v1: any, v2: any) => any, exp1: any, exp2: any): any {
  return bindingUpdated2(exp1, exp2) ? checkAndUpdateBinding(pureFn(exp1, exp2)) : consumeBinding();
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @returns Updated value
 */
export function pureFunction3(
    pureFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any): any {
  const different = bindingUpdated2(exp1, exp2);
  return bindingUpdated(exp3) || different ? checkAndUpdateBinding(pureFn(exp1, exp2, exp3)) :
                                             consumeBinding();
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @returns Updated value
 */
export function pureFunction4(
    pureFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any, exp3: any,
    exp4: any): any {
  return bindingUpdated4(exp1, exp2, exp3, exp4) ?
      checkAndUpdateBinding(pureFn(exp1, exp2, exp3, exp4)) :
      consumeBinding();
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @returns Updated value
 */
export function pureFunction5(
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any) => any, exp1: any, exp2: any, exp3: any,
    exp4: any, exp5: any): any {
  const different = bindingUpdated4(exp1, exp2, exp3, exp4);
  return bindingUpdated(exp5) || different ?
      checkAndUpdateBinding(pureFn(exp1, exp2, exp3, exp4, exp5)) :
      consumeBinding();
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @returns Updated value
 */
export function pureFunction6(
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any) => any, exp1: any, exp2: any,
    exp3: any, exp4: any, exp5: any, exp6: any): any {
  const different = bindingUpdated4(exp1, exp2, exp3, exp4);
  return bindingUpdated2(exp5, exp6) || different ?
      checkAndUpdateBinding(pureFn(exp1, exp2, exp3, exp4, exp5, exp6)) :
      consumeBinding();
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @returns Updated value
 */
export function pureFunction7(
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any) => any, exp1: any,
    exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any): any {
  let different = bindingUpdated4(exp1, exp2, exp3, exp4);
  different = bindingUpdated2(exp5, exp6) || different;
  return bindingUpdated(exp7) || different ?
      checkAndUpdateBinding(pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7)) :
      consumeBinding();
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @param exp8
 * @returns Updated value
 */
export function pureFunction8(
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any) => any,
    exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, exp8: any): any {
  const different = bindingUpdated4(exp1, exp2, exp3, exp4);
  return bindingUpdated4(exp5, exp6, exp7, exp8) || different ?
      checkAndUpdateBinding(pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8)) :
      consumeBinding();
}

/**
 * pureFunction instruction that can support any number of bindings.
 *
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param pureFn A pure function that takes binding values and builds an object or array
 * containing those values.
 * @param exp An array of binding values
 * @returns Updated value
 */
export function pureFunctionV(pureFn: (...v: any[]) => any, exps: any[]): any {
  let different = false;

  for (let i = 0; i < exps.length; i++) {
    bindingUpdated(exps[i]) && (different = true);
  }
  return different ? checkAndUpdateBinding(pureFn.apply(null, exps)) : consumeBinding();
}
