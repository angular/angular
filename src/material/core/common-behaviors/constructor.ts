/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * This is a permissive type for abstract class constructors.
 * @docs-private
 */
export type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;
