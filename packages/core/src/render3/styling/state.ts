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
 * To learn more about the algorithm see `instructions/styling.ts`.
 *
 * --------
 */

/**
 * Used as a state reference for update values between style/class binding instructions.
 */
export interface StylingState {
  /** The directive index that is currently active (`0` === template) */
  directiveIndex: number;

  /** The current classes tail of the binding source (the last class binding for a
   * template/directive) */
  sourceClassTail: number;

  /** The current styles tail of the binding source (the last style binding for a
   * template/directive) */
  sourceStyleTail: number;

  /** The current classes head of the binding source (the first class binding for a
   * template/directive) */
  sourceClassHead: number;

  /** The current styles head of the binding source (the first style binding for a
   * template/directive) */
  sourceStyleHead: number;

  /** The last class binding index that was applied */
  lastClassBindingIndex: number;

  /** The last style binding index that was applied */
  lastStyleBindingIndex: number;
}

const UNSET_VALUE = -1;

/* tslint:disable */
const _state: StylingState = {
  directiveIndex: UNSET_VALUE,
  lastClassBindingIndex: 0,
  lastStyleBindingIndex: 0,
  sourceClassTail: 0,
  sourceStyleTail: 0,
  sourceClassHead: 0,
  sourceStyleHead: 0,
};

/**
 * Returns (or instantiates) the styling state for the given element.
 *
 * Styling state is accessed and processed each time a style or class binding
 * is evaluated.
 *
 * If and when the provided `element` doesn't match the current element in the
 * state then this means that styling was recently cleared or the element has
 * changed in change detection. In both cases the styling state is fully reset.
 *
 * If and when the provided `directiveIndex` doesn't match the current directive
 * index in the state then this means that a new source has introduced itself into
 * the styling code (or, in other words, another directive or component has started
 * to apply its styling host bindings to the element).
 */
export function getStylingState(directiveIndex: number): StylingState {
  if (_state.directiveIndex !== directiveIndex) {
    if (_state.directiveIndex === UNSET_VALUE) {
      _state.lastClassBindingIndex = 0;
      _state.lastStyleBindingIndex = 0;
    }
    _state.directiveIndex = directiveIndex;
    _state.sourceClassHead = _state.sourceClassTail = _state.sourceStyleHead =
        _state.sourceStyleTail = 0;
  }
  return _state;
}

/**
 * Clears the styling state so that it can be used by another element's styling code.
 */
export function resetStylingState() {
  _state.directiveIndex = UNSET_VALUE;
}
