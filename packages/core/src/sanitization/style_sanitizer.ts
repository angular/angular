/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SafeValue} from './bypass';

/*
 * ========== WARNING ==========
 *
 * Style sanitization in Angular (for `[style.prop]` and `[style]` bindings)
 * is no longer required and has been removed. The reason why this feature
 * has been removed is because style-based sanitization is no longer
 * required with modern browsers.
 *
 * The contents of this file are still in flux. Various APIs and symbols will
 * be removed in a future version of Angular. Please hold off from modifying this
 * file for the time being.
 *
 * =============================
 */

/**
 * A series of flags to instruct a style sanitizer to either validate
 * or sanitize a value.
 *
 * Because sanitization is dependent on the style property (i.e. style
 * sanitization for `width` is much different than for `background-image`)
 * the sanitization function (e.g. `StyleSanitizerFn`) needs to check a
 * property value first before it actually sanitizes any values.
 *
 * This enum exist to allow a style sanitization function to either only
 * do validation (check the property to see whether a value will be
 * sanitized or not) or to sanitize the value (or both).
 *
 * @publicApi
 */
export const enum StyleSanitizeMode {
  /** Just check to see if the property is required to be sanitized or not */
  ValidateProperty = 0b01,
  /** Skip checking the property; just sanitize the value */
  SanitizeOnly = 0b10,
  /** Check the property and (if true) then sanitize the value */
  ValidateAndSanitize = 0b11,
}

/**
 * Used to intercept and sanitize style values before they are written to the renderer.
 *
 * This function is designed to be called in two modes. When a value is not provided
 * then the function will return a boolean whether a property will be sanitized later.
 * If a value is provided then the sanitized version of that will be returned.
 */
export interface StyleSanitizeFn {
  (prop: string, value: string|SafeValue|null, mode?: StyleSanitizeMode): any;
}
