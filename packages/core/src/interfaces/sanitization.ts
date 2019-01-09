/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Used to intercept and sanitize style values before they are written to the renderer.
 *
 * This function is designed to be called in two modes. When a value is not provided
 * then the function will return a boolean whether a property will be sanitized later.
 * If a value is provided then the sanitized version of that will be returned.
 */
export interface StyleSanitizeFn {
  /** This mode is designed to instruct whether the property will be used for sanitization
   * at a later point */
  (prop: string): boolean;
  /** This mode is designed to sanitize the provided value */
  (prop: string, value: string): string;
}
