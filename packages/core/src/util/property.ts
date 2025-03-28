/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function getClosureSafeProperty<T>(objWithPropertyToExtract: T): string {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === (getClosureSafeProperty as any)) {
      return key;
    }
  }
  // Cannot change it to `RuntimeError` because the `util` target cannot
  // circularly depend on the `core` target.
  throw Error(
    typeof ngDevMode !== 'undefined' && ngDevMode
      ? 'Could not find renamed property on target object.'
      : '',
  );
}

/**
 * Sets properties on a target object from a source object, but only if
 * the property doesn't already exist on the target object.
 * @param target The target to set properties on
 * @param source The source of the property keys and values to set
 */
export function fillProperties(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}
