/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Function used to sanitize the value before writing it into the renderer.
 */
export type SanitizerFn = (value: any) => string;
