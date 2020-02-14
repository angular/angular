/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4, getBinding, updateBinding} from './bindings';
import {LView} from './interfaces/view';
import {getBindingRoot, getLView} from './state';
import {NO_CHANGE} from './tokens';


/**
 * Bindings for pure functions are stored after regular bindings.
 *
 * |-------decls------|---------vars---------|                 |----- hostVars (dir1) ------|
 * ------------------------------------------------------------------------------------------
 * | nodes/refs/pipes | bindings | fn slots  | injector | dir1 | host bindings | host slots |
 * ------------------------------------------------------------------------------------------
 *                    ^                      ^
 *      TView.bindingStartIndex      TView.expandoStartIndex
 *
 * Pure function instructions are given an offset from the binding root. Adding the offset to the
 * binding root gives the first index where the bindings are stored. In component views, the binding
 * root is the bindingStartIndex. In host bindings, the binding root is the expandoStartIndex +
 * any directive instances + any hostVars in directives evaluated before it.
 *
 * See VIEW_DATA.md for more information about host binding resolution.
 */

/**
 * Instruction which invokes 0 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change. (Since there are no inputs this will only get
 * invoked once per template.)
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn Function that returns a value
 * @param thisArg Optional calling context of pureFn
 * @returns value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction0<T>(slotOffset: number, pureFn: () => T, thisArg?: any): T {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` we don't expect `pureFn`
  // to throw an exception. For this reason no try-catch is necessary.
  return lView[bindingIndex] === NO_CHANGE ?
      updateBinding(lView, bindingIndex, thisArg ? pureFn.call(thisArg) : pureFn()) :
      getBinding(lView, bindingIndex);
}

/**
 * Instruction which invokes 1 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn Function that returns an updated value
 * @param exp Updated expression value
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction1(
    slotOffset: number, pureFn: (v: any) => any, exp: any, thisArg?: any): any {
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` and Pipes, it is possible
  // for `pureFn` to throw an exception. For this reason try-catch is necessary (in
  // pureFunction1Internal).
  return pureFunction1Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp, thisArg);
}

/**
 * Instruction which invokes 2 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction2(
    slotOffset: number, pureFn: (v1: any, v2: any) => any, exp1: any, exp2: any,
    thisArg?: any): any {
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` and Pipes, it is possible
  // for `pureFn` to throw an exception. For this reason try-catch is necessary (in
  // pureFunction2Internal).
  return pureFunction2Internal(
      getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, thisArg);
}

/**
 * Instruction which invokes 3 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction3(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any,
    thisArg?: any): any {
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` and Pipes, it is possible
  // for `pureFn` to throw an exception. For this reason try-catch is necessary (in
  // pureFunction3Internal).
  return pureFunction3Internal(
      getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, exp3, thisArg);
}

/**
 * Instruction which invokes 4 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction4(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any,
    exp3: any, exp4: any, thisArg?: any): any {
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` and Pipes, it is possible
  // for `pureFn` to throw an exception. For this reason try-catch is necessary (in
  // pureFunction4Internal).
  return pureFunction4Internal(
      getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, exp3, exp4, thisArg);
}

/**
 * Instruction which invokes 5 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction5(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any) => any, exp1: any,
    exp2: any, exp3: any, exp4: any, exp5: any, thisArg?: any): any {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` we don't expect `pureFn`
  // to throw an exception. For this reason no try-catch is necessary.
  return bindingUpdated(lView, bindingIndex + 4, exp5) || different ?
      updateBinding(
          lView, bindingIndex + 5, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5) :
                                             pureFn(exp1, exp2, exp3, exp4, exp5)) :
      getBinding(lView, bindingIndex + 5);
}

/**
 * Instruction which invokes 6 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction6(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any) => any,
    exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, thisArg?: any): any {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` we don't expect `pureFn`
  // to throw an exception. For this reason no try-catch is necessary.
  return bindingUpdated2(lView, bindingIndex + 4, exp5, exp6) || different ?
      updateBinding(
          lView, bindingIndex + 6, thisArg ?
              pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6) :
              pureFn(exp1, exp2, exp3, exp4, exp5, exp6)) :
      getBinding(lView, bindingIndex + 6);
}

/**
 * Instruction which invokes 7 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction7(
    slotOffset: number,
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any) => any, exp1: any,
    exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, thisArg?: any): any {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  let different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` we don't expect `pureFn`
  // to throw an exception. For this reason no try-catch is necessary.
  return bindingUpdated3(lView, bindingIndex + 4, exp5, exp6, exp7) || different ?
      updateBinding(
          lView, bindingIndex + 7, thisArg ?
              pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7) :
              pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7)) :
      getBinding(lView, bindingIndex + 7);
}

/**
 * Instruction which invokes 8 argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @param exp8
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunction8(
    slotOffset: number,
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any) => any,
    exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, exp8: any,
    thisArg?: any): any {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` we don't expect `pureFn`
  // to throw an exception. For this reason no try-catch is necessary.
  return bindingUpdated4(lView, bindingIndex + 4, exp5, exp6, exp7, exp8) || different ?
      updateBinding(
          lView, bindingIndex + 8, thisArg ?
              pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8) :
              pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8)) :
      getBinding(lView, bindingIndex + 8);
}

/**
 * Instruction which invokes any number argument pure function.
 *
 * Invoke the `pureFn` only when inputs change.
 *
 * NOTE: This is used with object literals and arrays in the template such as `{{[exp, ...]}}`
 *
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn A pure function that takes binding values and builds an object or array
 * containing those values.
 * @param exps An array of binding values
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
export function ɵɵpureFunctionV(
    slotOffset: number, pureFn: (...v: any[]) => any, exps: any[], thisArg?: any): any {
  // NOTE: Because this is used with object literals such as `{{ [exp] }}` we don't expect `pureFn`
  // to throw an exception. For this reason no try-catch is necessary.
  return pureFunctionVInternal(getLView(), getBindingRoot(), slotOffset, pureFn, exps, thisArg);
}


/**
 * If the value of the provided exp has changed, calls the pure function to return
 * an updated value. Or if the value has not changed, returns cached value.
 *
 * @param lView LView in which the function is being executed.
 * @param bindingRoot Binding root index.
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn Function that returns an updated value
 * @param exp Updated expression value
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunction1Internal(
    lView: LView, bindingRoot: number, slotOffset: number, pureFn: (v: any) => any, exp: any,
    thisArg?: any): any {
  const bindingIndex = bindingRoot + slotOffset;
  const returnBindingIndex = bindingIndex + 1;
  let returnValue = undefined;
  if (bindingUpdated(lView, bindingIndex, exp)) {
    try {
      returnValue = thisArg ? pureFn.call(thisArg, exp) : pureFn(exp);
    } finally {
      updateBinding(lView, returnBindingIndex, returnValue);
    }
  } else {
    returnValue = getBinding(lView, returnBindingIndex);
  }
  return returnValue;
}


/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param lView LView in which the function is being executed.
 * @param bindingRoot Binding root index.
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunction2Internal(
    lView: LView, bindingRoot: number, slotOffset: number, pureFn: (v1: any, v2: any) => any,
    exp1: any, exp2: any, thisArg?: any): any {
  const bindingIndex = bindingRoot + slotOffset;
  const returnBindingIndex = bindingIndex + 2;
  let returnValue = undefined;
  if (bindingUpdated2(lView, bindingIndex, exp1, exp2)) {
    try {
      returnValue = thisArg ? pureFn.call(thisArg, exp1, exp2) : pureFn(exp1, exp2);
    } finally {
      updateBinding(lView, returnBindingIndex, returnValue);
    }
  } else {
    returnValue = getBinding(lView, returnBindingIndex);
  }
  return returnValue;
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param lView LView in which the function is being executed.
 * @param bindingRoot Binding root index.
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunction3Internal(
    lView: LView, bindingRoot: number, slotOffset: number,
    pureFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any,
    thisArg?: any): any {
  const bindingIndex = bindingRoot + slotOffset;
  const returnBindingIndex = bindingIndex + 3;
  let returnValue = undefined;
  if (bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3)) {
    try {
      returnValue = thisArg ? pureFn.call(thisArg, exp1, exp2, exp3) : pureFn(exp1, exp2, exp3);
    } finally {
      updateBinding(lView, returnBindingIndex, returnValue);
    }
  } else {
    returnValue = getBinding(lView, returnBindingIndex);
  }
  return returnValue;
}


/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param lView LView in which the function is being executed.
 * @param bindingRoot Binding root index.
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 *
 */
export function pureFunction4Internal(
    lView: LView, bindingRoot: number, slotOffset: number,
    pureFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any, exp3: any, exp4: any,
    thisArg?: any): any {
  const bindingIndex = bindingRoot + slotOffset;
  const returnBindingIndex = bindingIndex + 4;
  let returnValue = undefined;
  if (bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4)) {
    try {
      returnValue =
          thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4) : pureFn(exp1, exp2, exp3, exp4);
    } finally {
      updateBinding(lView, returnBindingIndex, returnValue);
    }
  } else {
    returnValue = getBinding(lView, returnBindingIndex);
  }
  return returnValue;
}

/**
 * pureFunction instruction that can support any number of bindings.
 *
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param lView LView in which the function is being executed.
 * @param bindingRoot Binding root index.
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn A pure function that takes binding values and builds an object or array
 * containing those values.
 * @param exps An array of binding values
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunctionVInternal(
    lView: LView, bindingRoot: number, slotOffset: number, pureFn: (...v: any[]) => any,
    exps: any[], thisArg?: any): any {
  let bindingIndex = bindingRoot + slotOffset;
  let different = false;
  for (let i = 0; i < exps.length; i++) {
    bindingUpdated(lView, bindingIndex++, exps[i]) && (different = true);
  }
  let returnValue = undefined;
  if (different) {
    try {
      returnValue = pureFn.apply(thisArg, exps);
    } finally {
      updateBinding(lView, bindingIndex, returnValue);
    }
  } else {
    returnValue = getBinding(lView, bindingIndex);
  }
  return returnValue;
}
