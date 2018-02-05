/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual} from './assert';
import {NO_CHANGE, bind, getTView} from './instructions';


/**
 * Updates an expression in an object literal if the expression has changed.
 * Used in objectLiteral instructions.
 *
 * @param obj Object to update
 * @param key Key to set in object
 * @param exp Expression to set at key
 * @returns Whether or not there has been a change
 */
function updateBinding(obj: any, key: string | number, exp: any): boolean {
  if (bind(exp) !== NO_CHANGE) {
    obj[key] = exp;
    return true;
  }
  return false;
}

/** Updates two expressions in an object literal if they have changed. */
function updateBinding2(obj: any, key1: number, exp1: any, key2: number, exp2: any): boolean {
  let different = updateBinding(obj, key1, exp1);
  return updateBinding(obj, key2, exp2) || different;
}

/** Updates four expressions in an object literal if they have changed. */
function updateBinding4(
    obj: any, key1: number, exp1: any, key2: number, exp2: any, key3: number, exp3: any,
    key4: number, exp4: any): boolean {
  let different = updateBinding2(obj, key1, exp1, key2, exp2);
  return updateBinding2(obj, key3, exp3, key4, exp4) || different;
}

/**
 * Gets a blueprint of an object or array if one has already been saved, or copies the
 * object and saves it for the next change detection run if it hasn't.
 */
function getMutableBlueprint(index: number, obj: any): any {
  const tView = getTView();
  const objectLiterals = tView.objectLiterals;
  if (objectLiterals && index < objectLiterals.length) {
    return objectLiterals[index];
  } else {
    ngDevMode && objectLiterals && assertEqual(index, objectLiterals.length, 'index');
    return (objectLiterals || (tView.objectLiterals = []))[index] = copyObject(obj);
  }
}

/** Copies an object or array */
function copyObject(obj: any): any {
  return Array.isArray(obj) ? obj.slice() : {...obj};
}

/**
 * Updates the expression in the given object if it has changed and returns a copy of the object.
 * Or if the expression hasn't changed, returns NO_CHANGE.
 *
 * @param objIndex Index of object blueprint in objectLiterals
 * @param  obj Object to update
 * @param key Key to set in object
 * @param exp Expression to set at key
 * @returns A copy of the object or NO_CHANGE
 */
export function objectLiteral1(objIndex: number, obj: any, key: string | number, exp: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  if (bind(exp) === NO_CHANGE) {
    return NO_CHANGE;
  } else {
    obj[key] = exp;
    // Must copy to change identity when binding changes
    return copyObject(obj);
  }
}

/**
 * Updates the expressions in the given object if they have changed and returns a copy of the
 * object.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param objIndex
 * @param obj
 * @param key1
 * @param exp1
 * @param key2
 * @param exp2
 * @returns A copy of the array or NO_CHANGE
 */
export function objectLiteral2(
    objIndex: number, obj: any, key1: number, exp1: any, key2: number, exp2: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  return updateBinding2(obj, key1, exp1, key2, exp2) ? copyObject(obj) : NO_CHANGE;
}

/**
 * Updates the expressions in the given object if they have changed and returns a copy of the
 * object.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param objIndex
 * @param obj
 * @param key1
 * @param exp1
 * @param key2
 * @param exp2
 * @param key3
 * @param exp3
 * @returns A copy of the object or NO_CHANGE
 */
export function objectLiteral3(
    objIndex: number, obj: any, key1: number, exp1: any, key2: number, exp2: any, key3: number,
    exp3: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  let different = updateBinding2(obj, key1, exp1, key2, exp2);
  return updateBinding(obj, key3, exp3) || different ? copyObject(obj) : NO_CHANGE;
}

/**
 * Updates the expressions in the given object if they have changed and returns a copy of the
 * object.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param objIndex
 * @param obj
 * @param key1
 * @param exp1
 * @param key2
 * @param exp2
 * @param key3
 * @param exp3
 * @param key4
 * @param exp4
 * @returns A copy of the object or NO_CHANGE
 */
export function objectLiteral4(
    objIndex: number, obj: any, key1: number, exp1: any, key2: number, exp2: any, key3: number,
    exp3: any, key4: number, exp4: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  return updateBinding4(obj, key1, exp1, key2, exp2, key3, exp3, key4, exp4) ? copyObject(obj) :
                                                                               NO_CHANGE;
}

/**
 * Updates the expressions in the given object if they have changed and returns a copy of the
 * object.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param objIndex
 * @param obj
 * @param key1
 * @param exp1
 * @param key2
 * @param exp2
 * @param key3
 * @param exp3
 * @param key4
 * @param exp4
 * @param key5
 * @param exp5
 * @returns A copy of the object or NO_CHANGE
 */
export function objectLiteral5(
    objIndex: number, obj: any, key1: number, exp1: any, key2: number, exp2: any, key3: number,
    exp3: any, key4: number, exp4: any, key5: number, exp5: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  let different = updateBinding4(obj, key1, exp1, key2, exp2, key3, exp3, key4, exp4);
  return updateBinding(obj, key5, exp5) || different ? copyObject(obj) : NO_CHANGE;
}

/**
 * Updates the expressions in the given object if they have changed and returns a copy of the
 * object.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param objIndex
 * @param obj
 * @param key1
 * @param exp1
 * @param key2
 * @param exp2
 * @param key3
 * @param exp3
 * @param key4
 * @param exp4
 * @param key5
 * @param exp5
 * @param key6
 * @param exp6
 * @returns A copy of the object or NO_CHANGE
 */
export function objectLiteral6(
    objIndex: number, obj: any, key1: number, exp1: any, key2: number, exp2: any, key3: number,
    exp3: any, key4: number, exp4: any, key5: number, exp5: any, key6: number, exp6: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  let different = updateBinding4(obj, key1, exp1, key2, exp2, key3, exp3, key4, exp4);
  return updateBinding2(obj, key5, exp5, key6, exp6) || different ? copyObject(obj) : NO_CHANGE;
}

/**
 * Updates the expressions in the given object if they have changed and returns a copy of the
 * object.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param objIndex
 * @param obj
 * @param key1
 * @param exp1
 * @param key2
 * @param exp2
 * @param key3
 * @param exp3
 * @param key4
 * @param exp4
 * @param key5
 * @param exp5
 * @param key6
 * @param exp6
 * @param key7
 * @param exp7
 * @returns A copy of the object or NO_CHANGE
 */
export function objectLiteral7(
    objIndex: number, obj: any, key1: number, exp1: any, key2: number, exp2: any, key3: number,
    exp3: any, key4: number, exp4: any, key5: number, exp5: any, key6: number, exp6: any,
    key7: number, exp7: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  let different = updateBinding4(obj, key1, exp1, key2, exp2, key3, exp3, key4, exp4);
  different = updateBinding2(obj, key5, exp5, key6, exp6) || different;
  return updateBinding(obj, key7, exp7) || different ? copyObject(obj) : NO_CHANGE;
}

/**
 * Updates the expressions in the given object if they have changed and returns a copy of the
 * object.
 * Or if no expressions have changed, returns NO_CHANGE.
 *
 * @param objIndex
 * @param obj
 * @param key1
 * @param exp1
 * @param key2
 * @param exp2
 * @param key3
 * @param exp3
 * @param key4
 * @param exp4
 * @param key5
 * @param exp5
 * @param key6
 * @param exp6
 * @param key7
 * @param exp7
 * @param key8
 * @param exp8
 * @returns A copy of the object or NO_CHANGE
 */
export function objectLiteral8(
    objIndex: number, obj: any, key1: number, exp1: any, key2: number, exp2: any, key3: number,
    exp3: any, key4: number, exp4: any, key5: number, exp5: any, key6: number, exp6: any,
    key7: number, exp7: any, key8: number, exp8: any): any {
  obj = getMutableBlueprint(objIndex, obj);
  let different = updateBinding4(obj, key1, exp1, key2, exp2, key3, exp3, key4, exp4);
  return updateBinding4(obj, key5, exp5, key6, exp6, key7, exp7, key8, exp8) || different ?
      copyObject(obj) :
      NO_CHANGE;
}
