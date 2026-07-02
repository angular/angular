/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A version of `Array.isArray` that handles narrowing of readonly arrays properly.
 */
export function isArray(value: unknown): value is any[] | readonly any[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is an object.
 */
export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return (typeof value === 'object' || typeof value === 'function') && value != null;
}
