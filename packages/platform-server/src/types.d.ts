/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Type definitions for `domino` and `xhr2`. These modules were previously referenced
// through `require`. We switched these to actual ESM imports in order to emit full-ESM
// as package output. To not introduce a dependency on the `domino` or `xhr2` types, we
// define local module typings and set them to `any`.

declare module 'domino' {
  export const createWindow: any;
  export const createDocument: any;
  export const impl: any;
}

declare module 'xhr2' {
  export const XMLHttpRequest: any;
}
