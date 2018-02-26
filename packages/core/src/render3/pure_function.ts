/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindingUpdated, bindingUpdated2, bindingUpdated4, checkAndUpdateBinding, consumeBinding, getCreationMode} from './instructions';
import {unwrap} from './util';


/**
 * If the value hasn't been saved, calls the pure function to store and return the
 * value. If it has been saved, returns the saved value.
 *
 * @param pureFn Function that returns a value
 * @returns value
 */
export function pureFunction0<T>(pureFn: () => T, thisArg: any = null): T {
  return getCreationMode() ? checkAndUpdateBinding(thisArg ? pureFn.call(thisArg) : pureFn()) :
                             consumeBinding();
}

/**
 * If the value of the provided exp has changed, calls the pure function to return
 * an updated value. Or if the value has not changed, returns cached value.
 *
 * @param pureFn Function that returns an updated value
 * @param exp Updated expression value
 * @returns Updated value
 */
export function pureFunction1(pureFn: (v: any) => any, exp: any, thisArg: any = null): any {
  let result;
  if (bindingUpdated(exp)) {
    const uwExp = unwrap(exp);
    result = checkAndUpdateBinding(thisArg ? pureFn.call(thisArg, uwExp) : pureFn(uwExp));
  } else {
    result = consumeBinding();
  }
  return result;
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
export function pureFunction2(
    pureFn: (v1: any, v2: any) => any, exp1: any, exp2: any, thisArg: any = null): any {
  let result;
  if (bindingUpdated2(exp1, exp2)) {
    const uwExp1 = unwrap(exp1);
    const uwExp2 = unwrap(exp2);
    result = checkAndUpdateBinding(
        thisArg ? pureFn.call(thisArg, uwExp1, uwExp2) : pureFn(uwExp1, uwExp2));
  } else {
    result = consumeBinding();
  }
  return result;
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
    pureFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any,
    thisArg: any = null): any {
  let result;
  const different = bindingUpdated2(exp1, exp2);
  if (bindingUpdated(exp3) || different) {
    const uwExp1 = unwrap(exp1);
    const uwExp2 = unwrap(exp2);
    const uwExp3 = unwrap(exp3);
    result = checkAndUpdateBinding(
        thisArg ? pureFn.call(thisArg, uwExp1, uwExp2, uwExp3) : pureFn(uwExp1, uwExp2, uwExp3));
  } else {
    result = consumeBinding();
  }
  return result;
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
    pureFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any, exp3: any, exp4: any,
    thisArg: any = null): any {
  let result;
  if (bindingUpdated4(exp1, exp2, exp3, exp4)) {
    const uwExp1 = unwrap(exp1);
    const uwExp2 = unwrap(exp2);
    const uwExp3 = unwrap(exp3);
    const uwExp4 = unwrap(exp4);
    result = checkAndUpdateBinding(
        thisArg ? pureFn.call(thisArg, uwExp1, uwExp2, uwExp3, uwExp4) :
                  pureFn(uwExp1, uwExp2, uwExp3, uwExp4));
  } else {
    result = consumeBinding();
  }
  return result;
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
    exp4: any, exp5: any, thisArg: any = null): any {
  let result;
  const different = bindingUpdated4(exp1, exp2, exp3, exp4);
  if (bindingUpdated(exp5) || different) {
    const uwExp1 = unwrap(exp1);
    const uwExp2 = unwrap(exp2);
    const uwExp3 = unwrap(exp3);
    const uwExp4 = unwrap(exp4);
    const uwExp5 = unwrap(exp5);
    result = checkAndUpdateBinding(
        thisArg ? pureFn.call(thisArg, uwExp1, uwExp2, uwExp3, uwExp4, uwExp5) :
                  pureFn(uwExp1, uwExp2, uwExp3, uwExp4, uwExp5));
  } else {
    result = consumeBinding();
  }
  return result;
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
    exp3: any, exp4: any, exp5: any, exp6: any, thisArg: any = null): any {
  let result;
  const different = bindingUpdated4(exp1, exp2, exp3, exp4);
  if (bindingUpdated2(exp5, exp6) || different) {
    const uwExp1 = unwrap(exp1);
    const uwExp2 = unwrap(exp2);
    const uwExp3 = unwrap(exp3);
    const uwExp4 = unwrap(exp4);
    const uwExp5 = unwrap(exp5);
    const uwExp6 = unwrap(exp6);
    result = checkAndUpdateBinding(
        thisArg ? pureFn.call(thisArg, uwExp1, uwExp2, uwExp3, uwExp4, uwExp5, uwExp6) :
                  pureFn(uwExp1, uwExp2, uwExp3, uwExp4, uwExp5, uwExp6));
  } else {
    result = consumeBinding();
  }
  return result;
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
    exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, thisArg: any = null): any {
  let result;
  let different = bindingUpdated4(exp1, exp2, exp3, exp4);
  different = bindingUpdated2(exp5, exp6) || different;
  if (bindingUpdated(exp7) || different) {
    const uwExp1 = unwrap(exp1);
    const uwExp2 = unwrap(exp2);
    const uwExp3 = unwrap(exp3);
    const uwExp4 = unwrap(exp4);
    const uwExp5 = unwrap(exp5);
    const uwExp6 = unwrap(exp6);
    const uwExp7 = unwrap(exp7);
    result = checkAndUpdateBinding(
        thisArg ? pureFn.call(thisArg, uwExp1, uwExp2, uwExp3, uwExp4, uwExp5, uwExp6, uwExp7) :
                  pureFn(uwExp1, uwExp2, uwExp3, uwExp4, uwExp5, uwExp6, uwExp7));
  } else {
    result = consumeBinding();
  }
  return result;
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
    exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, exp8: any,
    thisArg: any = null): any {
  let result;
  const different = bindingUpdated4(exp1, exp2, exp3, exp4);
  if (bindingUpdated4(exp5, exp6, exp7, exp8) || different) {
    const uwExp1 = unwrap(exp1);
    const uwExp2 = unwrap(exp2);
    const uwExp3 = unwrap(exp3);
    const uwExp4 = unwrap(exp4);
    const uwExp5 = unwrap(exp5);
    const uwExp6 = unwrap(exp6);
    const uwExp7 = unwrap(exp7);
    const uwExp8 = unwrap(exp8);
    result = checkAndUpdateBinding(
        thisArg ?
            pureFn.call(thisArg, uwExp1, uwExp2, uwExp3, uwExp4, uwExp5, uwExp6, uwExp7, uwExp8) :
            pureFn(uwExp1, uwExp2, uwExp3, uwExp4, uwExp5, uwExp6, uwExp7, uwExp8));
  } else {
    result = consumeBinding();
  }
  return result;
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
export function pureFunctionV(pureFn: (...v: any[]) => any, exps: any[], thisArg: any = null): any {
  let different = false;

  for (let i = 0; i < exps.length; i++) {
    bindingUpdated(exps[i]) && (different = true);
  }
  const unwrappedExps = [];
  for (let i = 0; i < exps.length; i++) {
    unwrappedExps[i] = unwrap(exps[i]);
  }
  return different ? checkAndUpdateBinding(pureFn.apply(thisArg, unwrappedExps)) : consumeBinding();
}
