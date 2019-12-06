/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn, StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {LStylingData, TStylingNode} from '../interfaces/styling';
import {LView, TData} from '../interfaces/view';
import {renderStringify} from '../util/misc_utils';
import {concatStylingEntry, getBindingPropName, getConcatenatedValue, getNextBindingIndex, getPreviousBindingIndex, getStyleBindingSuffix, getStylingTail, getValue, hasConfig, hasValueChanged, hyphenate, isComponentHostBinding, isDirectSanitizationRequired, isDirectiveHostBinding, isDuplicateBinding, isStylingMap, isStylingValueDefined, setConcatenatedValue, setValue, splitOnWhitespace} from '../util/styling_utils';

import {removeClass} from './class_differ';
import {writeAndReconcileClass, writeAndReconcileStyle} from './reconcile';
import {StylingState} from './state';
import {removeStyle} from './style_differ';
import {printStylingTable} from './styling_debug_utils';



/**
 * --------
 *
 * This file contains the core style/class application algorithm for styling in Angular.
 *
 * To learn more about the algorithm see `instructions/styling.ts`.
 *
 * --------
 */

/**
 * Updates a style/class binding value in the provided `LView` and queues it to be applied to the
 * element once the styling is flushed
 *
 * In addition to updating the value in the `LView` instance, this function will
 * also mark what "source" was last used to update styling on this element. By
 * marking the source, the `flushBindings` function is able to determine exactly
 * where in the `LView` it needs to start when writing style/class values to the
 * element.
 *
 * Note that this function will not actually render any style/class values to
 * an element (see [flushStyling]).
 *
 * @returns `true` when the binding has updated (due to a value change). This
 *          also signals that the styles/classes need to be flushed once CD
 *          exits for the element currently being processed.
 */
export function updateBindingValue(
    lView: LView, tData: TData, state: StylingState, value: any, bindingIndex: number,
    isClassBased: boolean): boolean {
  const previousValue = getValue(lView, bindingIndex);
  const updated = hasValueChanged(previousValue, value);
  if (updated) {
    setValue(lView, bindingIndex, value);
    markLocationFromWhichStylesNeedToBeRecomputed(
        state, tData, bindingIndex, state.directiveIndex, isClassBased);
  }

  return updated;
}

function markLocationFromWhichStylesNeedToBeRecomputed(
    state: StylingState, tData: TData, bindingIndex: number, directiveIndex: number,
    isClassBased: boolean) {
  if (isBindingRegistered(tData, bindingIndex)) {
    const currentStartIndex = getBindingStartIndex(state, isClassBased);
    const currentDirectiveIndex = getDirectiveStartIndex(state, isClassBased);
    if (currentDirectiveIndex !== directiveIndex &&
        !isComponentHostBinding(tData, currentStartIndex)) {
      setDirectiveAndBindingStartIndices(state, state.directiveIndex, bindingIndex, isClassBased);
    }
  }
}

/**
 * Checks to see whether or not the binding got registered correctly.
 *
 * If an exception is thrown during the first update pass of a template
 * or host bindings call the registration of style/class bindings might
 * fail. This function is used to determine if that happened for a
 * given binding.
 */
function isBindingRegistered(tData: TData, bindingIndex: number): boolean {
  return tData[bindingIndex] !== null;
}

/**
 * Returns the currently concatenated string value at the given bindingIndex.
 */
function getConcatenatedStr(
    lView: LStylingData, bindingIndex: number, initialValue: string): string {
  return bindingIndex === 0 ? initialValue : getConcatenatedValue(lView, bindingIndex);
}

/**
 * Whether or not any style/class bindings are queued for flushing
 */
export function hasBindingsToFlush(state: StylingState): boolean {
  return state.lastStyleBindingIndex !== 0 || state.lastClassBindingIndex !== 0;
}

/**
 * Total amount of bits used to store the start directive and binding index values.
 *
 * Each time a binding is processed, the algorithm needs to know whether or not
 * that binding is the earliest binding to start the style/className concatenation
 * from. The earliest binding in case refers to what binding will take place
 * at the start of the concatenation string.
 *
 * ```
 * <div
 *    [style.width]="w"    // this binding will be concatenated last
 *    dir-that-sets-width> // this binding will be concatenated first (=> start index)
 * ```
 *
 * A 32-bit number is used to track both the starting directive and binding index
 * values used by the flushing algorithm for concatenation.
 */
const BINDING_START_BITS = 16;

/**
 * Bit mask for track the start directive and binding index values.
 *
 * See [BINDING_START_BITS] for more info.
 */
const BINDING_START_MASK = (1 << BINDING_START_BITS) - 1;

/**
 * Updates the start directive index and binding index.
 *
 * See [BINDING_START_BITS] for more info.
 */
function setDirectiveAndBindingStartIndices(
    state: StylingState, sourceIndex: number, bindingIndex: number, isClassBased: boolean): void {
  // +1 is added because we can't bit shift zero
  const value = (sourceIndex + 1) << BINDING_START_BITS | (bindingIndex & BINDING_START_MASK);
  if (isClassBased) {
    state.lastClassBindingIndex = value;
  } else {
    state.lastStyleBindingIndex = value;
  }
}

/**
 * Returns the binding start index value which is used to mark where to start concatenating
 * style/class values.
 */
function getBindingStartIndex(state: StylingState, isClassBased: boolean) {
  const value = isClassBased ? state.lastClassBindingIndex : state.lastStyleBindingIndex;
  return value & BINDING_START_MASK;
}

/**
 * Returns the directive start index value which is used to mark where to start concatenating
 * style/class values.
 */
function getDirectiveStartIndex(state: StylingState, isClassBased: boolean) {
  const value = isClassBased ? state.lastClassBindingIndex : state.lastStyleBindingIndex;

  // -1 is used because +1 is added when the directive index is set
  // because bit shifting zero value won't do anything
  return (value >> BINDING_START_BITS) - 1;
}

/**
 * Flushes all style/class bindings to the element that were queued via the
 * `updateBindingValue` function.
 *
 * All style/class values are stored in the provided `LView` instance and each
 * of these entries are continuously updated whenever `updateBindingValue` is called.
 * Due to the nature of the concatenation algorithm, all of the binding values are
 * concatenated together into a single style/className string value which is then
 * applied directly to the element in this function.
 */
export function flushBindings(
    renderer: any, native: RElement, lView: LView, tNode: TNode, tData: TData, state: StylingState,
    sanitizer: StyleSanitizeFn | null, firstUpdatePass: boolean, hostBindingsMode: boolean): void {
  flushStyleOrClassBindings(
      renderer, native, state, tNode, tData, lView, firstUpdatePass, hostBindingsMode, false,
      sanitizer, writeAndReconcileStyle);
  flushStyleOrClassBindings(
      renderer, native, state, tNode, tData, lView, firstUpdatePass, hostBindingsMode, true, null,
      writeAndReconcileClass);
}

function flushStyleOrClassBindings(
    renderer: any, native: RElement, state: StylingState, tNode: TNode, tData: TData, lView: LView,
    firstUpdatePass: boolean, hostBindingsMode: boolean, isClassBased: boolean,
    sanitizer: StyleSanitizeFn | null,
    reconcileFn: (renderer: any, native: RElement, previousValue: string, newValue: string) =>
        string | null): void {
  const startIndex = getBindingStartIndex(state, isClassBased);
  if (startIndex !== 0) {
    const tailIndex = getStylingTail(tNode, isClassBased);
    const previousValue = concatenateAndGetPrevious(
        tData, lView, tNode, startIndex, tailIndex, sanitizer, firstUpdatePass, isClassBased,
        hostBindingsMode);
    const newValue = getConcatenatedValue(lView, tailIndex);
    if (allowValueToBeApplied(tNode, previousValue, newValue, firstUpdatePass)) {
      // the write operation may apply the value directly to the element's className
      // or style value. Some browsers may reorder the style/class values on said
      // property, therefore, the previous value will need to be updated with this entry.
      const result = reconcileFn(renderer, native, previousValue, newValue);
      if (result !== null) {
        setConcatenatedValue(lView, tailIndex, result);
      }
    }
  }
}

/**
 * Constructs the concatenated style/class binding string and returns the previous
 * binding value that was applied to the element.
 *
 * @returns the previous style/class value that was applied to the element.
 */
function concatenateAndGetPrevious(
    tData: TData, lView: LView, tNode: TNode, startIndex: number, tailIndex: number,
    sanitizer: StyleSanitizeFn | null, firstUpdatePass: boolean, isClassBased: boolean,
    hostBindingsMode: boolean): string {
  const initialValue = isClassBased ? tNode.classes : tNode.styles;
  const templateBindingsFlag =
      isClassBased ? TNodeFlags.hasTemplateClassBindings : TNodeFlags.hasTemplateStyleBindings;
  const hasTemplateBindings = hasConfig(tNode, templateBindingsFlag);
  const templateBindingsWereJustApplied = hasTemplateBindings && hostBindingsMode;
  const previousConcatenatedValue = getConcatenatedStr(lView, tailIndex, initialValue);

  // even though we have the previous value we should build up the concat string
  // up to the final point so that it can be applied to element afterwards.
  processStylingBindingsUpToEnd(lView, tData, tNode, startIndex, sanitizer, isClassBased);

  // the previous value is what was applied to the element during the
  // last styling flush. If we are dealing with the first template pass
  // then there's a chance that the template bindings applied their
  // value just before this flush ran.
  const concatenatedValueIsPreviousValue = firstUpdatePass ? templateBindingsWereJustApplied : true;
  return concatenatedValueIsPreviousValue ? previousConcatenatedValue : initialValue;
}

/**
 * The concatenation string value that lives in the binding just before the provided `bindingIndex`
 */
function getPreviousConcatenatedStr(
    lView: LStylingData, tData: TData, tNode: TStylingNode, bindingIndex: number,
    isClassBased: boolean): string {
  const previousBindingIndex = getPreviousBindingIndex(tData, bindingIndex);
  return getConcatenatedStr(
      lView, previousBindingIndex, isClassBased ? tNode.classes : tNode.styles);
}

/**
 * Applies (or reapplies) each style/class binding entry into the provided `LView` (all the way
 * until the tail).
 */
export function processStylingBindingsUpToEnd(
    lView: LStylingData, tData: TData, tNode: TStylingNode, bindingIndex: number,
    sanitizer: StyleSanitizeFn | null, isClassBased: boolean): void {
  while (bindingIndex !== 0) {
    const value = getValue(lView, bindingIndex);
    processStylingBinding(lView, tNode, tData, value, bindingIndex, sanitizer, isClassBased);
    bindingIndex = getNextBindingIndex(tData, bindingIndex);
  }
}

/**
 * Updates the provided style/class value into the provided `LView` instance.
 *
 * This function is called for each binding in the `LView` that will be
 * concatenated together into a single style or className string (during
 * the styling flush operation).
 *
 * When called, this function will resolve the concatenated style/class value
 * for this binding value and all other binding values up to this point.
 *
 * Let's imagine we have the following HTML code:
 *
 * ```html
 * <div [class.foo]="fooExp" [class.bar]="barExp">...</div>
 * ```
 *
 * The `LView` would store the value and concatenated style/class information
 * for all bindings up to that point. Here's what that looks like:
 *
 * ```
 * LView [
 *   'fooExp' // true or false, (this is also the head of `tNode.classesBindingIndex)
 *   'foo',
 *   'barExp' // true or false (this is also the tail of `tNode.classesBindingIndex)
 *   'foo bar',
 * ]
 * ```
 *
 * Once all bindings are processed then the final concatenated style or className value
 * will exist at the tail end of the `LView` (see [TNode.stylesIndex] and [TNode.classesIndex]).
 */
function processStylingBinding(
    lView: LStylingData, tNode: TStylingNode, tData: TData, value: any, bindingIndex: number,
    sanitizer: StyleSanitizeFn | null, isClassBased: boolean): void {
  const prop = getBindingPropName(tData, bindingIndex);
  const suffix = getStyleBindingSuffix(tData, bindingIndex);
  const isDuplicateOfPrevious = isDuplicateBinding(tData, bindingIndex);
  const sanitizerToUse = isDirectSanitizationRequired(tData, bindingIndex) ? sanitizer : null;

  let concatenatedStr = getPreviousConcatenatedStr(lView, tData, tNode, bindingIndex, isClassBased);
  if (typeof prop === 'string') {  // prop-based entry
    const valueToApply =
        normalizeValueForConcatenation(prop, value, suffix, sanitizerToUse, false, isClassBased);
    concatenatedStr = addRemoveStylingEntryInConcatString(
        concatenatedStr, prop, valueToApply, isClassBased, isDuplicateOfPrevious);
  } else {  // map-based entry
    const isMap = isStylingMap(value);
    const props = isStylingValueDefined(value) ?
        (isMap ? Object.keys(value) : splitOnWhitespace(value)) :
        null;
    const length = props ? props.length : 0;
    for (let i = 0; i < length; i++) {
      let prop = props ![i];
      let valueToApply = isMap ? (value as{[key: string]: string | null})[prop] : true;
      valueToApply = normalizeValueForConcatenation(
          prop, valueToApply, suffix, sanitizerToUse, true, isClassBased);

      const propToApply = isClassBased ? prop : hyphenate(prop);
      concatenatedStr = addRemoveStylingEntryInConcatString(
          concatenatedStr, propToApply, valueToApply, isClassBased, isDuplicateOfPrevious);
    }
  }

  setConcatenatedValue(lView, bindingIndex, concatenatedStr);
}

/**
 * Sanitizes and normalizes the value that will be placed in the concatenation string.
 *
 * @returns a string value (when the value is allowed to be concatenated), otherwise a falsy
 *          value (which signals that the value should not be concatenated).
 */
function normalizeValueForConcatenation(
    prop: string, value: string | number | boolean | null, suffix: string,
    sanitizer: StyleSanitizeFn | null, validateAndSanitize: boolean, isClassBased: boolean): string|
    false|null {
  if (isStylingValueDefined(value) && value !== false) {
    if (isClassBased) {
      // `0` is not treated the same for classes than how it is
      // treated for styles (`0` is the same as `false`)
      value = value === 0 ? false : prop;
    } else if (sanitizer !== null) {
      const sanitizationFlag = validateAndSanitize ?
          StyleSanitizeMode
              .ValidateAndSanitize  // map-based values can't be validated ahead of time
          :
          StyleSanitizeMode.SanitizeOnly;  // prop-based values are checked during firstUpdatePass
                                           // if they need sanitization
      value = sanitizer(prop, value, sanitizationFlag);
    } else {
      value = renderStringify(value);
      if (suffix !== null && value.length !== 0) {
        value += suffix;
      }
    }
  }
  return value as null | string | false;
}

/**
 * Appends, removes or modifies a class or style entry in the provided className/style `str` string.
 *
 * @returns the final style or className string
 */
export function addRemoveStylingEntryInConcatString(
    str: string, prop: string, value: string | null | boolean, isClassBased: boolean,
    isDuplicateOfPrevious: boolean): string {
  if (isStylingValueDefined(value)) {
    const replaceValue = str.length !== 0 && isDuplicateOfPrevious;
    if (replaceValue) {
      str = isClassBased ? removeClass(str, prop) : removeStyle(str, prop);
    }
    if (value !== false && value !== null) {
      str = concatStylingEntry(str, prop, value as string | true, isClassBased);
    }
  }
  return str;
}

/**
 * Determines whether or not to write the style/class value to the element.
 */
function allowValueToBeApplied(
    tNode: TNode, previousValue: string, newValue: string, firstUpdatePass: boolean): boolean {
  // <ng-container> instances or comment nodes may show up in the algorithm.
  // if and when this happens it's fine to process styling, but adding the
  // styles/classes to the element won't be possible
  if (tNode.type !== TNodeType.Element) {
    return false;
  }

  // the new value may just be the same as the initial value
  // (which was set during element creation)
  if (firstUpdatePass && newValue === previousValue) {
    return false;
  }

  // we want to avoid having an empty string be set during the
  // first update pass because there is no need to apply that.
  return newValue.length === 0 ? !firstUpdatePass : true;
}
