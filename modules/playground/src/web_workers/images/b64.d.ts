/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare module 'B64' {
  export function fromByteArray(arr: Uint8Array): string;
  export function toByteArray(str: string): Uint8Array;
}