/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4, getBinding, updateBinding} from './bindings';
import {getBindingRoot, getLView, isCreationMode} from './state';



/**
 * Bindings for pure functions are stored after regular bindings.
 *
 * |------consts------|---------vars---------|                 |----- hostVars (dir1) ------|
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
 * If the value hasn't been saved, calls the pure function to store and return the
 * value. If it has been saved, returns the saved value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn Function that returns a value
 * @param thisArg Optional calling context of pureFn
 * @returns value
 */
export function pureFunction0<T>(slotOffset: number, pureFn: () => T, thisArg?: any): T {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  return isCreationMode() ?
      updateBinding(lView, bindingIndex, thisArg ? pureFn.call(thisArg) : pureFn()) :
      getBinding(lView, bindingIndex);
}

/**
 * If the value of the provided exp has changed, calls the pure function to return
 * an updated value. Or if the value has not changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn Function that returns an updated value
 * @param exp Updated expression value
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunction1(
    slotOffset: number, pureFn: (v: any) => any, exp: any, thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const lView = getLView();
  const bindingIndex = getBindingRoot() + slotOffset;
  return bindingUpdated(lView, bindingIndex, exp) ?
      updateBinding(lView, bindingIndex + 1, thisArg ? pureFn.call(thisArg, exp) : pureFn(exp)) :
      getBinding(lView, bindingIndex + 1);
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunction2(
    slotOffset: number, pureFn: (v1: any, v2: any) => any, exp1: any, exp2: any,
    thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  return bindingUpdated2(lView, bindingIndex, exp1, exp2) ?
      updateBinding(
          lView, bindingIndex + 2,
          thisArg ? pureFn.call(thisArg, exp1, exp2) : pureFn(exp1, exp2)) :
      getBinding(lView, bindingIndex + 2);
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunction3(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any,
    thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  return bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3) ?
      updateBinding(
          lView, bindingIndex + 3,
          thisArg ? pureFn.call(thisArg, exp1, exp2, exp3) : pureFn(exp1, exp2, exp3)) :
      getBinding(lView, bindingIndex + 3);
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunction4(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any,
    exp3: any, exp4: any, thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  return bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4) ?
      updateBinding(
          lView, bindingIndex + 4,
          thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4) : pureFn(exp1, exp2, exp3, exp4)) :
      getBinding(lView, bindingIndex + 4);
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
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
 */
export function pureFunction5(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any) => any, exp1: any,
    exp2: any, exp3: any, exp4: any, exp5: any, thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated(lView, bindingIndex + 4, exp5) || different ?
      updateBinding(
          lView, bindingIndex + 5, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5) :
                                             pureFn(exp1, exp2, exp3, exp4, exp5)) :
      getBinding(lView, bindingIndex + 5);
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
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
 */
export function pureFunction6(
    slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any) => any,
    exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated2(lView, bindingIndex + 4, exp5, exp6) || different ?
      updateBinding(
          lView, bindingIndex + 6, thisArg ?
              pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6) :
              pureFn(exp1, exp2, exp3, exp4, exp5, exp6)) :
      getBinding(lView, bindingIndex + 6);
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
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
 */
export function pureFunction7(
    slotOffset: number,
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any) => any, exp1: any,
    exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  let different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated3(lView, bindingIndex + 4, exp5, exp6, exp7) || different ?
      updateBinding(
          lView, bindingIndex + 7, thisArg ?
              pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7) :
              pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7)) :
      getBinding(lView, bindingIndex + 7);
}

/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
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
 */
export function pureFunction8(
    slotOffset: number,
    pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any) => any,
    exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, exp8: any,
    thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated4(lView, bindingIndex + 4, exp5, exp6, exp7, exp8) || different ?
      updateBinding(
          lView, bindingIndex + 8, thisArg ?
              pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8) :
              pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8)) :
      getBinding(lView, bindingIndex + 8);
}

/**
 * pureFunction instruction that can support any number of bindings.
 *
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn A pure function that takes binding values and builds an object or array
 * containing those values.
 * @param exps An array of binding values
 * @param thisArg Optional calling context of pureFn
 * @returns Updated or cached value
 */
export function pureFunctionV(
    slotOffset: number, pureFn: (...v: any[]) => any, exps: any[], thisArg?: any): any {
  // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
  let bindingIndex = getBindingRoot() + slotOffset;
  let different = false;
  const lView = getLView();
  for (let i = 0; i < exps.length; i++) {
    bindingUpdated(lView, bindingIndex++, exps[i]) && (different = true);
  }
  return different ? updateBinding(lView, bindingIndex, pureFn.apply(thisArg, exps)) :
                     getBinding(lView, bindingIndex);
}
