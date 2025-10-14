/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Declares an `@let` at a specific data slot. Returns itself to allow chaining.
 *
 * @param index Index at which to declare the `@let`.
 *
 * @codeGenApi
 */
export declare function ɵɵdeclareLet(index: number): typeof ɵɵdeclareLet;
/**
 * Instruction that stores the value of a `@let` declaration on the current view.
 * Returns the value to allow usage inside variable initializers.
 *
 * @codeGenApi
 */
export declare function ɵɵstoreLet<T>(value: T): T;
/**
 * Retrieves the value of a `@let` declaration defined in a parent view.
 *
 * @param index Index of the declaration within the view.
 *
 * @codeGenApi
 */
export declare function ɵɵreadContextLet<T>(index: number): T;
