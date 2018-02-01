/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NO_CHANGE, bind, getTView} from './instructions';


/**
 * Updates an expression in an array literal if the expression has changed.
 * Used in objectLiteral instructions.
 *
 * @param arr Array to update
 * @param index Index to set in array
 * @param exp Expression to set at index
 * @returns Whether or not there has been a change
 */
function updateArrBinding(arr: any[], index: number, exp: any): boolean {
  if (bind(exp) !== NO_CHANGE) {
    arr[index] = exp;
    return true;
  }
  return false;
}

/** Updates two expressions in an array literal if they have changed. */
function updateBinding2(arr: any[], index1: number, exp1: any, index2: number, exp2: any): boolean {
  let different = updateArrBinding(arr, index1, exp1);
  return updateArrBinding(arr, index2, exp2) || different;
}

/** Updates four expressions in an array literal if they have changed. */
function updateBinding4(
    arr: any[], index1: number, exp1: any, index2: number, exp2: any, index3: number, exp3: any,
    index4: number, exp4: any): boolean {
  let different = updateBinding2(arr, index1, exp1, index2, exp2);
  return updateBinding2(arr, index3, exp3, index4, exp4) || different;
}


function getObjectCopy(index: number, arr: any[]): any[] {
  const tView = getTView();
  const objectLiterals = tView.objectLiterals;
  return objectLiterals && index < objectLiterals.length ?
      objectLiterals[index] :
      (objectLiterals || (tView.objectLiterals = []))[index] = arr.slice();
}

/**
 * Updates the expression in the given array if it has changed and returns a copy of the array. Or,
 * if the expression hasn't changed, returns NO_CHANGE.
 *
 * @param  arr Array to update
 * @param index Index to set in array
 * @param exp Expression to set at index
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral1(objectIndex: number, arr: any[], index: number, exp: any): any[]|
    NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  if (bind(exp) === NO_CHANGE) {
    return NO_CHANGE;
  } else {
    arr[index] = exp;
    // Must slice to change identity when binding changes
    return arr.slice();
  }
}

/**
 * Updates the expressions in the given array if they have changed and returns a copy of the array.
 * Or if no expressions have changed, returns NO_CHANGE.
 * @param arr
 * @param index1
 * @param exp1
 * @param index2
 * @param exp2
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral2(
    objectIndex: number, arr: any[], index1: number, exp1: any, index2: number, exp2: any): any[]|
    NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  return updateBinding2(arr, index1, exp1, index2, exp2) ? arr.slice() : NO_CHANGE;
}

/**
 * Updates the expressions in the given array if they have changed and returns a copy of the array.
 * Or if no expressions have changed, returns NO_CHANGE.
 * @param arr
 * @param index1
 * @param exp1
 * @param index2
 * @param exp2
 * @param index3
 * @param exp3
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral3(
    objectIndex: number, arr: any[], index1: number, exp1: any, index2: number, exp2: any,
    index3: number, exp3: any): any[]|NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  let different = updateBinding2(arr, index1, exp1, index2, exp2);
  return updateArrBinding(arr, index3, exp3) || different ? arr.slice() : NO_CHANGE;
}

/**
 * Updates the expressions in the given array if they have changed and returns a copy of the array.
 * Or if no expressions have changed, returns NO_CHANGE.
 * @param arr
 * @param index1
 * @param exp1
 * @param index2
 * @param exp2
 * @param index3
 * @param exp3
 * @param index4
 * @param exp4
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral4(
    objectIndex: number, arr: any[], index1: number, exp1: any, index2: number, exp2: any,
    index3: number, exp3: any, index4: number, exp4: any): any[]|NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  return updateBinding4(arr, index1, exp1, index2, exp2, index3, exp3, index4, exp4) ? arr.slice() :
                                                                                       NO_CHANGE;
}

/**
 * Updates the expressions in the given array if they have changed and returns a copy of the array.
 * Or if no expressions have changed, returns NO_CHANGE.
 * @param arr
 * @param index1
 * @param exp1
 * @param index2
 * @param exp2
 * @param index3
 * @param exp3
 * @param index4
 * @param exp4
 * @param index5
 * @param exp5
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral5(
    objectIndex: number, arr: any[], index1: number, exp1: any, index2: number, exp2: any,
    index3: number, exp3: any, index4: number, exp4: any, index5: number, exp5: any): any[]|
    NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  let different = updateBinding4(arr, index1, exp1, index2, exp2, index3, exp3, index4, exp4);
  return updateArrBinding(arr, index5, exp5) || different ? arr.slice() : NO_CHANGE;
}

/**
 * Updates the expressions in the given array if they have changed and returns a copy of the array.
 * Or if no expressions have changed, returns NO_CHANGE.
 * @param arr
 * @param index1
 * @param exp1
 * @param index2
 * @param exp2
 * @param index3
 * @param exp3
 * @param index4
 * @param exp4
 * @param index5
 * @param exp5
 * @param index6
 * @param exp6
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral6(
    objectIndex: number, arr: any[], index1: number, exp1: any, index2: number, exp2: any,
    index3: number, exp3: any, index4: number, exp4: any, index5: number, exp5: any, index6: number,
    exp6: any): any[]|NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  let different = updateBinding4(arr, index1, exp1, index2, exp2, index3, exp3, index4, exp4);
  return updateBinding2(arr, index5, exp5, index6, exp6) || different ? arr.slice() : NO_CHANGE;
}

/**
 * Updates the expressions in the given array if they have changed and returns a copy of the array.
 * Or if no expressions have changed, returns NO_CHANGE.
 * @param arr
 * @param index1
 * @param exp1
 * @param index2
 * @param exp2
 * @param index3
 * @param exp3
 * @param index4
 * @param exp4
 * @param index5
 * @param exp5
 * @param index6
 * @param exp6
 * @param index7
 * @param exp7
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral7(
    objectIndex: number, arr: any[], index1: number, exp1: any, index2: number, exp2: any,
    index3: number, exp3: any, index4: number, exp4: any, index5: number, exp5: any, index6: number,
    exp6: any, index7: number, exp7: any): any[]|NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  let different = updateBinding4(arr, index1, exp1, index2, exp2, index3, exp3, index4, exp4);
  different = updateBinding2(arr, index5, exp5, index6, exp6) || different;
  return updateArrBinding(arr, index7, exp7) || different ? arr.slice() : NO_CHANGE;
}

/**
 * Updates the expressions in the given array if they have changed and returns a copy of the array.
 * Or if no expressions have changed, returns NO_CHANGE.
 * @param arr
 * @param index1
 * @param exp1
 * @param index2
 * @param exp2
 * @param index3
 * @param exp3
 * @param index4
 * @param exp4
 * @param index5
 * @param exp5
 * @param index6
 * @param exp6
 * @param index7
 * @param exp7
 * @param index8
 * @param exp8
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral8(
    objectIndex: number, arr: any[], index1: number, exp1: any, index2: number, exp2: any,
    index3: number, exp3: any, index4: number, exp4: any, index5: number, exp5: any, index6: number,
    exp6: any, index7: number, exp7: any, index8: number, exp8: any): any[]|NO_CHANGE {
  arr = getObjectCopy(objectIndex, arr);
  let different = updateBinding4(arr, index1, exp1, index2, exp2, index3, exp3, index4, exp4);
  return updateBinding4(arr, index5, exp5, index6, exp6, index7, exp7, index8, exp8) || different ?
      arr.slice() :
      NO_CHANGE;
}
