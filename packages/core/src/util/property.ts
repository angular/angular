/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function getClosureSafeProperty<T>(objWithPropertyToExtract: T, target: any): string {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === target) {
      return key;
    }
  }
  throw Error('Could not find renamed property on target object.');
}
