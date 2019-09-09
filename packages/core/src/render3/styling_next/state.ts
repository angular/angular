/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {RElement} from '../interfaces/renderer';
import {TEMPLATE_DIRECTIVE_INDEX} from './util';

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
 * To learn more about the algorithm see `TStylingContext`.
 *
 * --------
 */

/**
 * Used as a state reference for update values between style/class binding instructions.
 *
 * In addition to storing the element and bit-mask related values, the state also
 * stores the `sourceIndex` value. The `sourceIndex` value is an incremented value
 * that identifies what "source" (i.e. the template, a specific directive by index or
 * component) is currently applying its styling bindings to the element.
 */
export interface StylingState {
  /** The element that is currently being processed */
  element: RElement|null;

  /** The directive index that is currently active (`0` === template) */
  directiveIndex: number;

  /** The source (column) index that is currently active (`0` === template) */
  sourceIndex: number;

  /** The classes update bit mask value that is processed during each class binding */
  classesBitMask: number;

  /** The classes update bit index value that is processed during each class binding */
  classesIndex: number;

  /** The styles update bit mask value that is processed during each style binding */
  stylesBitMask: number;

  /** The styles update bit index value that is processed during each style binding */
  stylesIndex: number;
}

// these values will get filled in the very first time this is accessed...
const _state: StylingState = {
  element: null,
  directiveIndex: -1,
  sourceIndex: -1,
  classesBitMask: -1,
  classesIndex: -1,
  stylesBitMask: -1,
  stylesIndex: -1,
};

const BIT_MASK_START_VALUE = 0;

// the `0` start value is reserved for [map]-based entries
const INDEX_START_VALUE = 1;

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
export function getStylingState(element: RElement, directiveIndex: number): StylingState {
  if (_state.element !== element) {
    _state.element = element;
    _state.directiveIndex = directiveIndex;
    _state.sourceIndex = directiveIndex === TEMPLATE_DIRECTIVE_INDEX ? 0 : 1;
    _state.classesBitMask = BIT_MASK_START_VALUE;
    _state.classesIndex = INDEX_START_VALUE;
    _state.stylesBitMask = BIT_MASK_START_VALUE;
    _state.stylesIndex = INDEX_START_VALUE;
  } else if (_state.directiveIndex !== directiveIndex) {
    _state.directiveIndex = directiveIndex;
    _state.sourceIndex++;
  }
  return _state;
}

/**
 * Clears the styling state so that it can be used by another element's styling code.
 */
export function resetStylingState() {
  _state.element = null;
}
