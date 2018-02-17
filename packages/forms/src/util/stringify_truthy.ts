/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Stringify a truthy value. (preserve `null`/`undefined`).
 */
export function stringifyTruthy(value: string|number): string;
export function stringifyTruthy(value: string|number|undefined): string|undefined;
export function stringifyTruthy(value: string|number|null): string|null;
export function stringifyTruthy(value: string|number|null|undefined): string|null|undefined;
export function stringifyTruthy(value: any): string|null|undefined {
  return value == null ? value : String(value);
}