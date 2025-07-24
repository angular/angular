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
export function booleanAttribute(value: unknown): boolean {
  return typeof value === 'boolean' ? value : value != null && value !== 'false';
}

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
export function numberAttribute(value: unknown, fallbackValue = NaN): number {
  // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
  // and other non-number values as NaN, where Number just uses 0) but it considers the string
  // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
  const isNumberValue = !isNaN(parseFloat(value as any)) && !isNaN(Number(value));
  return isNumberValue ? Number(value) : fallbackValue;
}
