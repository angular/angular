/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

/**
 * --------
 *
 * // TODO(matsko): add updateMask info
 *
 * This file contains all state-based logic for styling in Angular.
 *
 * Styling in Angular is evaluated with a series of styling-specific
 * template instructions which are called one after another each time
 * change detection occurs in Angular.
 *
 * Styling makes use of various temporary, state-based variables between
 * instructions so that it can better cache and optimize its values.
 * These values are usually populated and cleared when an element is
 * exited in change detection (once all the instructions are run for
 * that element).
 *
 * There are, however, situations where the state-based values
 * need to be stored and used at a later point. This ONLY occurs when
 * there are template-level as well as host-binding-level styling
 * instructions on the same element. The example below shows exactly
 * what could be:
 *
 * ```html
 * <!-- two sources of styling: the template and the directive -->
 * <div [style.width]="width" dir-that-sets-height></div>
 * ```
 *
 * If and when this situation occurs, the current styling state is
 * stored in a storage map value and then later accessed once the
 * host bindings are evaluated. Once styling for the current element
 * is over then the map entry will be cleared.
 *
 * To learn more about the algorithm see `TStylingContext`.
 *
 * --------
 */

let _stylingState: StylingState|null = null;
const _stateStorage = new Map<any, StylingState>();

// this value is not used outside this file and is only here
// as a caching check for when the element changes.
let _stylingElement: any = null;

/**
 * Used as a state reference for update values between style/class binding instructions.
 */
export interface StylingState {
  classesBitMask: number;
  classesIndex: number;
  stylesBitMask: number;
  stylesIndex: number;
}

export const STYLING_INDEX_START_VALUE = 1;
export const BIT_MASK_START_VALUE = 0;

export function getStylingState(element: any, readFromMap?: boolean): StylingState {
  if (!_stylingElement || element !== _stylingElement) {
    _stylingElement = element;
    if (readFromMap) {
      _stylingState = _stateStorage.get(element) || null;
      ngDevMode && ngDevMode.stylingReadPersistedState++;
    }
    _stylingState = _stylingState || {
      classesBitMask: BIT_MASK_START_VALUE,
      classesIndex: STYLING_INDEX_START_VALUE,
      stylesBitMask: BIT_MASK_START_VALUE,
      stylesIndex: STYLING_INDEX_START_VALUE,
    };
  }
  return _stylingState !;
}

export function resetStylingState() {
  _stylingState = null;
  _stylingElement = null;
}

export function storeStylingState(element: any, state: StylingState) {
  ngDevMode && ngDevMode.stylingWritePersistedState++;
  _stateStorage.set(element, state);
}

export function deleteStylingStateFromStorage(element: any) {
  _stateStorage.delete(element);
}

export function resetAllStylingState() {
  resetStylingState();
  _stateStorage.clear();
}
