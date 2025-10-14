/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Transforms a value (typically a string) to a boolean.
 * Intended to be used as a transform function of an input.
 *
 *  @usageNotes
 *  ```ts
 *  status = input({ transform: booleanAttribute });
 *  ```
 * @param value Value to be transformed.
 *
 * @publicApi
 */
export declare function booleanAttribute(value: unknown): boolean;
/**
 * Transforms a value (typically a string) to a number.
 * Intended to be used as a transform function of an input.
 * @param value Value to be transformed.
 * @param fallbackValue Value to use if the provided value can't be parsed as a number.
 *
 *  @usageNotes
 *  ```ts
 *  status = input({ transform: numberAttribute });
 *  ```
 *
 * @publicApi
 */
export declare function numberAttribute(value: unknown, fallbackValue?: number): number;
