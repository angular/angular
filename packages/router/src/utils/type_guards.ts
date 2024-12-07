/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EmptyError} from 'rxjs';

import {CanActivateChildFn, CanActivateFn, CanDeactivateFn, CanLoadFn, CanMatchFn} from '../models';
import {
  NAVIGATION_CANCELING_ERROR,
  NavigationCancelingError,
  RedirectingNavigationCancelingError,
} from '../navigation_canceling_error';
import {isUrlTree} from '../url_tree';

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

export function isBoolean(v: any): v is boolean {
  return typeof v === 'boolean';
}

export function isCanLoad(guard: any): guard is {canLoad: CanLoadFn} {
  return guard && isFunction<CanLoadFn>(guard.canLoad);
}

export function isCanActivate(guard: any): guard is {canActivate: CanActivateFn} {
  return guard && isFunction<CanActivateFn>(guard.canActivate);
}

export function isCanActivateChild(guard: any): guard is {canActivateChild: CanActivateChildFn} {
  return guard && isFunction<CanActivateChildFn>(guard.canActivateChild);
}

export function isCanDeactivate<T>(guard: any): guard is {canDeactivate: CanDeactivateFn<T>} {
  return guard && isFunction<CanDeactivateFn<T>>(guard.canDeactivate);
}
export function isCanMatch(guard: any): guard is {canMatch: CanMatchFn} {
  return guard && isFunction<CanMatchFn>(guard.canMatch);
}

export function isEmptyError(e: Error): e is EmptyError {
  return e instanceof EmptyError || e?.name === 'EmptyError';
}
