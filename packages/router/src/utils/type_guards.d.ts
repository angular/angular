/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EmptyError } from 'rxjs';
import { CanActivateChildFn, CanActivateFn, CanDeactivateFn, CanLoadFn, CanMatchFn } from '../models';
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
export declare function isFunction<T>(v: any): v is T;
export declare function isBoolean(v: any): v is boolean;
export declare function isCanLoad(guard: any): guard is {
    canLoad: CanLoadFn;
};
export declare function isCanActivate(guard: any): guard is {
    canActivate: CanActivateFn;
};
export declare function isCanActivateChild(guard: any): guard is {
    canActivateChild: CanActivateChildFn;
};
export declare function isCanDeactivate<T>(guard: any): guard is {
    canDeactivate: CanDeactivateFn<T>;
};
export declare function isCanMatch(guard: any): guard is {
    canMatch: CanMatchFn;
};
export declare function isEmptyError(e: Error): e is EmptyError;
