/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function getTypeOf(instance: any /** TODO #9100 */) {
  return instance.constructor;
}

export function instantiateType(type: Function, params: any[] = []) {
  var instance = Object.create(type.prototype);
  instance.constructor.apply(instance, params);
  return instance;
}
