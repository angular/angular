/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const noop = function() {};

// Determine in which scope to look for globals.
let scope: any = noop;
if (typeof window == 'object') {
  scope = window;
} else if (typeof global == 'object') {
  scope = global;
} else if (typeof self == 'object') {
  scope = self;
}

// These exports allow `instanceof` checks for things which may not exist.
export const FormData = scope['FormData'] || noop;
export const Blob = scope['Blob'] || noop;
export const ArrayBuffer = scope['ArrayBuffer'] || noop;
export const URLSearchParams = scope['URLSearchParams'] || noop;