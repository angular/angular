/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {CanActivate, CanActivateChild, CanDeactivate} from '../interfaces';

/**
 * Simple function check, but generic so type inference will flow. Example:
 *
 * function product(a: number, b: number) {
 *   return a * b;
 * }
 *
 * if (isFunction<product>(fn)) {
 *   return fn(1, 2);
 * } else {
 *   throw "Must provide the `product` function";
 * }
 */
export function isFunction<T>(v: any): v is T {
  return typeof v === 'function';
}

export function isCanActivate(guard: any): guard is CanActivate {
  return guard && isFunction<CanActivate>(guard.canActivate);
}

export function isCanActivateChild(guard: any): guard is CanActivateChild {
  return guard && isFunction<CanActivateChild>(guard.canActivate);
}

export function isCanDeactivate(guard: any): guard is CanDeactivate<Type<any>> {
  return guard && isFunction<CanDeactivate<Type<any>>>(guard.canDeactivate);
}
