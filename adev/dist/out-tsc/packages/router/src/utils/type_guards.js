/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {EmptyError} from 'rxjs';
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
export function isFunction(v) {
  return typeof v === 'function';
}
export function isBoolean(v) {
  return typeof v === 'boolean';
}
export function isCanLoad(guard) {
  return guard && isFunction(guard.canLoad);
}
export function isCanActivate(guard) {
  return guard && isFunction(guard.canActivate);
}
export function isCanActivateChild(guard) {
  return guard && isFunction(guard.canActivateChild);
}
export function isCanDeactivate(guard) {
  return guard && isFunction(guard.canDeactivate);
}
export function isCanMatch(guard) {
  return guard && isFunction(guard.canMatch);
}
export function isEmptyError(e) {
  return e instanceof EmptyError || e?.name === 'EmptyError';
}
//# sourceMappingURL=type_guards.js.map
