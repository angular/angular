/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare function isIterable(obj: any): obj is Iterable<any>;
export declare function isListLikeIterable(obj: any): boolean;
export declare function areIterablesEqual<T>(a: Iterable<T>, b: Iterable<T>, comparator: (a: T, b: T) => boolean): boolean;
export declare function iterateListLike<T>(obj: Iterable<T>, fn: (p: T) => void): void;
export declare function isJsObject(o: any): boolean;
