/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

/**
 * A temporary enum of states that inform the core whether or not
 * to defer all styling instruction calls to the old or new
 * styling implementation.
 */
export const enum CompilerStylingMode {
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
export function compilerSetStylingMode(mode: CompilerStylingMode) {
  _stylingMode = mode;
}

export function compilerIsNewStylingInUse() {
  return _stylingMode > CompilerStylingMode.UseOld;
}

export function compilerAllowOldStyling() {
  return _stylingMode < CompilerStylingMode.UseNew;
}
