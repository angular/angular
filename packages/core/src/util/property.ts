/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function getClosureSafeProperty(
    objWithPropertyToExtract: Record<string, typeof getClosureSafeProperty>): string {
  const key = Object.keys(objWithPropertyToExtract)[0];
  if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
      objWithPropertyToExtract[key] !== getClosureSafeProperty) {
    throw Error('Could not find renamed property on target object.');
  }
  return key;
}

/**
 * Sets properties on a target object from a source object, but only if
 * the property doesn't already exist on the target object.
 * @param target The target to set properties on
 * @param source The source of the property keys and values to set
 */
export function fillProperties(target: {[key: string]: string}, source: {[key: string]: string}) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}
