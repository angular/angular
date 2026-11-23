/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Instruction emitted when we detect an invalid expression somewhere in the template, but
 * we don't want to trigger a type error for the generated code.
 *
 * @codeGenApi
 */
export function ɵɵinvalid(): any {
  // Note: we need to return `any` explicitly so the return value can be passed in anywhere.
  return undefined;
}
