/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


declare global {
  const ngDevMode: boolean;
}

declare let global: any;

if (typeof ngDevMode == 'undefined') {
  if (typeof window != 'undefined') (window as any).ngDevMode = true;
  if (typeof self != 'undefined') (self as any).ngDevMode = true;
  if (typeof global != 'undefined') (global as any).ngDevMode = true;
}

export const _ngDevMode = true;
