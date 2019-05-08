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
export const enum CompilerNewStylingState {
  UseOld = 0,
  UseBothNewAndOld = 1,
  OnlyUseNew = 2,
}

let _stylingState = CompilerNewStylingState.UseOld;

/**
 * Temporary function used to inform the existing styling algorithm
 * code to delegate all styling instruction calls to the new refactored
 * styling code.
 */
export function compilerUseNewStyling(state: CompilerNewStylingState) {
  _stylingState = state;
}

export function compilerIsNewStylingInUse() {
  return _stylingState > CompilerNewStylingState.UseOld;
}

export function compilerAllowOldStyling() {
  return _stylingState < CompilerNewStylingState.OnlyUseNew;
}
