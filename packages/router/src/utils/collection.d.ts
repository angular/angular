/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable } from 'rxjs';
export declare function shallowEqualArrays(a: readonly any[], b: readonly any[]): boolean;
export declare function shallowEqual(a: {
    [key: string | symbol]: any;
}, b: {
    [key: string | symbol]: any;
}): boolean;
/**
 * Gets the keys of an object, including `symbol` keys.
 */
export declare function getDataKeys(obj: Object): Array<string | symbol>;
/**
 * Test equality for arrays of strings or a string.
 */
export declare function equalArraysOrString(a: string | readonly string[], b: string | readonly string[]): boolean;
/**
 * Return the last element of an array.
 */
export declare function last<T>(a: readonly T[]): T | null;
export declare function wrapIntoObservable<T>(value: T | Promise<T> | Observable<T>): Observable<T>;
