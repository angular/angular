/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {Sanitizer} from '../../sanitization/security';
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';

/**
 * --------
 *
 * This file contains temporary code to incorporate the new styling refactor
 * code to work alongside the existing instruction set.
 *
 * This file will be removed once `select(n)` is fully functional (once
 * it is able to evaluate host bindings in sync element-by-element
 * with template code).
 *
 * --------
 */

/**
 * A temporary enum of states that inform the core whether or not
 * to defer all styling instruction calls to the old or new
 * styling implementation.
 */
export const enum RuntimeStylingMode {
  UseOld = 0,
  UseBothOldAndNew = 1,
  UseNew = 2,
}

let _stylingMode = 0;

/**
 * Temporary function used to inform the existing styling algorithm
 * code to delegate all styling instruction calls to the new refactored
 * styling code.
 */
export function runtimeSetStylingMode(mode: RuntimeStylingMode) {
  _stylingMode = mode;
}

export function runtimeIsNewStylingInUse() {
  return _stylingMode > RuntimeStylingMode.UseOld;
}

export function runtimeAllowOldStyling() {
  return _stylingMode < RuntimeStylingMode.UseNew;
}

let _currentSanitizer: Sanitizer|StyleSanitizeFn|null;
export function setCurrentStyleSanitizer(sanitizer: Sanitizer | StyleSanitizeFn | null) {
  _currentSanitizer = sanitizer;
}

export function getCurrentStyleSanitizer() {
  return _currentSanitizer;
}
