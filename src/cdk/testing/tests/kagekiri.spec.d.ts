/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Note: kagekiri is a dev dependency that is used only in our tests to test using a custom
// querySelector function. Do not use this in published code.
declare module 'kagekiri' {
  export function querySelectorAll(selector: string, root: Element): NodeListOf<Element>;
}
