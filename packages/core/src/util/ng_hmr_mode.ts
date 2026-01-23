/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

declare global {
  /**
   * Indicates whether HMR is enabled for the application.
   *
   * `ngHmrMode` is a global flag set by Angular's CLI.
   *
   * @remarks
   * - **Internal Angular Flag**: This is an *internal* Angular flag (not a public API), avoid relying on it in application code.
   * - **Avoid Direct Use**: This variable is intended for runtime configuration; it should not be accessed directly in application code.
   */
  var ngHmrMode: boolean | undefined;
}

// Export an empty object to ensure this file is treated as an ES module, allowing augmentation of the global scope.
export {};
