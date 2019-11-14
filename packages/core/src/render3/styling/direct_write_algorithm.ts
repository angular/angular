/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn, StyleSanitizeMode} from '../../sanitization/style_sanitizer';
import {global} from '../../util/global';
import {TNode, TNodeFlags} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {StylingMapArray} from '../interfaces/styling';
import {LView, TData} from '../interfaces/view';
import {NO_CHANGE} from '../tokens';
import {TEMPLATE_DIRECTIVE_INDEX, allocStylingMapArray, allocTStylingContext, getCachedValue, getInitialStylingValue, getPreviousBindingIndex, getValue, hasValueChanged, isDirectSanitizationRequired, isInitialValueOverlap, isStylingMapArray, isStylingValueDefined, normalizeIntoStylingMap, setCachedValue, setClassName, setStyleAttr, setValue, splitOnWhitespace} from '../util/styling_utils';

import {syncContextInitialStyling, updateClassViaContext, updateStyleViaContext} from './bindings';
import {StylingState} from './state';
import {updateStylingEntry} from './style_string_parser';



/**
 * Queues a style/class binding value to be applied using the direct-write mode (the fast path).
 *
 * The direct-write mode algorithm aims to concatenate all style/class binding entries
 * together into a single string value and write that directly to the style/className
 * attribute/property on the target element.
 *
 * The algorithm works by updating the binding value in the provided `LView` based on
 * the provided `bindingIndex` value. Once the value has been updated, the algorithm
 * will also figure out the concatenated string value that was set by all other style
 * /class bindings that were executed before the current binding.
 *
 * Let's say we have the following HTML code
 *
 * ```html
 * <div [style.width]="'100px'" [style.height]="'200px'">..</div>
 * ```
 *
 * Our `LView` will look like so:
 *
 * ```typescript
 * LView = [
 *   // ...
 *   '100px', // binding value for width
 *   'width:100px' // concatenated value for width and the previous entries (there are none)
 *   '200px', // binding value for height
 *   'width:100px; height:200px' // concatenated value for width and the previous entries (there are
 * none)
 *   //...
 * ]
 * ```
 *
 * Once the final binding runs (the `style.height` binding) then a final string value
 * of `width:100px; height:200px` will be applied to the element.
 *
 * Note that when this function is called it will not actually set the style or class
 * value on the element. Instead it will update a local cache which will then be applied
 * once the `stylingApply()` function is run. (The `stylingApply()` function is executed
 * once the element exits in change detection or when all host bindings are fired for the
 * same element.).
 *
 * @returns `true` when the binding has updated (due to a value change).
 */
export function setStylingValue(
    lView: LView, tNode: TNode, tData: TData, state: StylingState, value: any, bindingIndex: number,
    sanitizer: StyleSanitizeFn | null, isClassBased: boolean): boolean {
  const lastUpdatedBindingIndex =
      isClassBased ? state.lastClassBindingIndex : state.lastStyleBindingIndex;
  const previousValue = getValue(lView, bindingIndex);
  const updated = hasValueChanged(previousValue, value);
  if (lastUpdatedBindingIndex < 0 || updated) {
    // we use the TData-stored value because it has been normalized
    // in the event that camel-casing was present in the prop name...
    const prop = tData[bindingIndex] as string | null;

    // The flags tell us whether or not there is any overlap and in the
    // event that there is nothing then the binding values can be appended
    // directly on the string without parse-replacing old values.
    const overlapFlag = isClassBased ? TNodeFlags.hasClassPropAndMapBindings :
                                       TNodeFlags.hasStylePropAndMapBindings;
    const hasPotentialPropMapOverlap = (tNode.flags & overlapFlag) === overlapFlag;
    const hasInitialOverlap = isInitialValueOverlap(tData, bindingIndex);
    const appendOnly = !hasPotentialPropMapOverlap && !hasInitialOverlap;

    const previousBindingIndex = getPreviousBindingIndex(tData, bindingIndex);
    const sanitizationRequired = isDirectSanitizationRequired(tData, bindingIndex);
    let cachedStr =
        getCachedStr(lView, previousBindingIndex, isClassBased ? tNode.classes : tNode.styles);

    if (prop === null) {  // map-based entry
      const isMap = isStylingMap(value);
      const props = isStylingValueDefined(value) ?
          (isMap ? Object.keys(value) : splitOnWhitespace(value)) :
          null;
      const length = props ? props.length : 0;
      for (let i = 0; i < length; i++) {
        const prop = props ![i];
        const val = isMap ? (value as{[key: string]: string | null})[prop] : true;
        const valueToApply = (sanitizationRequired && sanitizer) ?
            sanitizer(prop, val, StyleSanitizeMode.ValidateAndSanitize) :
            val;

        // this algorithm does not delete values. Instead it just adds
        // and modifies existing values to build a complete string
        if (isStylingValueDefined(valueToApply)) {
          cachedStr = updateStylingEntry(cachedStr, prop, valueToApply, isClassBased, appendOnly);
        }
      }
    } else {  // prop-based entry
      const valueToApply = (sanitizationRequired && sanitizer) ?
          sanitizer(prop, value, StyleSanitizeMode.ValidateAndSanitize) :
          value;

      // this algorithm does not delete values. Instead it just adds
      // and modifies existing values to build a complete string
      if (isStylingValueDefined(valueToApply)) {
        cachedStr = updateStylingEntry(cachedStr, prop, valueToApply, isClassBased, appendOnly);
      }
    }

    // the previous cached value is retrieved and placed on
    // the state object below so that it can be compared against
    // just before the final style/class value is written to
    // the element. By checking against the previous value, the
    // algorithm is able to determine if any styles or classes
    // have been added externally from Angular (i.e. by another
    // library or plugin).
    const previousCachedStr = getCachedValue(lView, bindingIndex);

    // a NEGATIVE binding index value implies that the
    // value at this binding has changed. This way when the
    // next instruction runs it knows to concat the new string
    // together even if its binding value hasn't changed.
    if (isClassBased) {
      state.lastClassBindingIndex = -bindingIndex;
      state.lastClassConcatValue = previousCachedStr;
    } else {
      state.lastStyleBindingIndex = -bindingIndex;
      state.lastStyleConcatValue = previousCachedStr;
    }

    setValue(lView, bindingIndex, value);
    setCachedValue(lView, bindingIndex, cachedStr);
  }

  return updated;
}

function isStylingMap(value: any): value is {} {
  return value !== null && typeof value !== 'string';
}

function getCachedStr(lView: LView, bindingIndex: number, initialStyling: StylingMapArray | null) {
  return bindingIndex === 0 ? getInitialStylingValue(initialStyling) :
                              getCachedValue(lView, bindingIndex);
}

export function directWriteHasUpdates(state: StylingState) {
  return state.lastStyleBindingIndex < 0 || state.lastClassBindingIndex < 0;
}

/**
 * Flushes all style/class bindings to the element that were queued using the direct-write
 * algorithm.
 *
 * @returns whether or not any bindings need to be applied using the
 *          merge (`TStlyingContext`) algorithm depending if said
 *          bindings were unable to be applied using the direct write
 *          mode.
 */
export function directWriteStylingFlush(
    renderer: any, native: RElement, lView: LView, tNode: TNode, tData: TData, state: StylingState,
    firstUpdatePass: boolean): boolean {
  let flushContexts = false;

  if (state.lastStyleBindingIndex < 0) {
    const bindingIndex = Math.abs(state.lastStyleBindingIndex);
    const previouslyAppliedValue =
        firstUpdatePass ? getInitialStylingValue(tNode.styles) : state.lastStyleConcatValue;
    if (checkIfExternallyModified(native, previouslyAppliedValue, false)) {
      fallbackToMergeAlgorithm(native, lView, tNode, tData, false, bindingIndex, true, state);
      flushContexts = true;
    } else {
      const valueToWrite = getCachedValue(lView, bindingIndex);
      if (allowAttrWrite(valueToWrite, firstUpdatePass)) {
        setStyleAttr(renderer, native, valueToWrite);
      }
    }
  } else {
    flushContexts = state.stylesBitMask !== 0;
  }

  if (state.lastClassBindingIndex < 0) {
    const bindingIndex = Math.abs(state.lastClassBindingIndex);
    const previouslyAppliedValue =
        firstUpdatePass ? getInitialStylingValue(tNode.classes) : state.lastClassConcatValue;
    if (checkIfExternallyModified(native, previouslyAppliedValue, true)) {
      fallbackToMergeAlgorithm(native, lView, tNode, tData, true, bindingIndex, true, state);
      flushContexts = true;
    } else {
      const valueToWrite = getCachedValue(lView, bindingIndex);
      if (allowAttrWrite(valueToWrite, firstUpdatePass)) {
        setClassName(renderer, native, valueToWrite);
      }
    }
  } else {
    flushContexts = flushContexts || state.classesBitMask !== 0;
  }

  return flushContexts;
}

function allowAttrWrite(value: string, firstUpdatePass: boolean) {
  // we want to avoid having an empty string be set during the
  // first update pass because there is no need to apply that.
  return !firstUpdatePass || value.length !== 0;
}

/**
 * Returns an array of all style/class binding indices in order.
 */
export function generateStylingBindingIndices(tData: TData, tailBindingIndex: number): number[] {
  const bindingIndices: number[] = [];

  // we have the `typeof` check here in the event that a non-zero number
  // ends up filling the space in the TData (this is a failsafe in the
  // event that an error is thrown during binding registration).
  let bindingIndex = tailBindingIndex;
  while (typeof bindingIndex === 'number' && bindingIndex !== 0) {
    bindingIndices.push(0);
    bindingIndex = getPreviousBindingIndex(tData, bindingIndex);
  }

  // the list of entries is in reverse order so we need to populate the
  // array backwards
  bindingIndex = tailBindingIndex;
  for (let i = bindingIndices.length - 1; i >= 0; i--) {
    bindingIndices[i] = bindingIndex;
    bindingIndex = getPreviousBindingIndex(tData, bindingIndex);
  }

  return bindingIndices;
}

/**
 * Converts all direct-write style/class bindings into to work with the merge algorithm.
 *
 * By default, all style/class bindings use the direct-write algorithm when applying
 * their values. However, if any host-bindings are present then the direct-write
 * algorithm needs to fallback to the merge algorithm because it is not knowledgeable
 * enough to apply duplicate bindings.
 *
 * This function will execute a fallback operation which will create a new instance of
 * a `TStylingContext` and register all the existing style/class bindings that are
 * present in the provided `TData` into that newly created context.
 */
function fallbackToMergeAlgorithm(
    element: RElement, lView: LView, tNode: TNode, tData: TData, isClassBased: boolean,
    bindingIndex: number, firstUpdatePass: boolean, state: StylingState): void {
  const previousSourceIndex = state.sourceIndex;
  state.sourceIndex = 0;

  const context = allocTStylingContext(isClassBased ? tNode.classes : tNode.styles, false);
  const bindingIndices = generateStylingBindingIndices(tData, bindingIndex);
  syncContextInitialStyling(context, tNode, isClassBased);

  for (let i = 0; i < bindingIndices.length; i++) {
    const bindingIndex = bindingIndices[i];
    const prop = tData[bindingIndex] as string | null;
    let value = getValue(lView, bindingIndex);

    if (prop === null && !isStylingMapArray(value)) {  // map-based bindings
      const rawValue = value === NO_CHANGE ? null : value;
      value = normalizeIntoStylingMap(allocStylingMapArray(rawValue), value, !isClassBased);
    }

    if (isClassBased) {
      updateClassViaContext(
          context, tNode, lView, element, TEMPLATE_DIRECTIVE_INDEX, prop, bindingIndex, value, true,
          state, firstUpdatePass);
    } else {
      updateStyleViaContext(
          context, tNode, lView, element, TEMPLATE_DIRECTIVE_INDEX, prop, bindingIndex, value, null,
          true, state, firstUpdatePass);
    }
  }

  if (isClassBased) {
    state.lastClassBindingIndex = 0;
    state.classesBitMask = 1;
    tNode.classes = context;
    tNode.flags |= TNodeFlags.hasClassContextInUse;
  } else {
    state.lastStyleBindingIndex = 0;
    state.stylesBitMask = 1;
    tNode.styles = context;
    tNode.flags |= TNodeFlags.hasStyleContextInUse;
  }

  state.sourceIndex = previousSourceIndex;
}

/**
 * Determines whether or not an element style/className value has changed since the last update.
 *
 * This function helps Angular determine if a style or class attribute value was
 * modified by an external plugin or API outside of the style binding code. This
 * means any JS code that adds/removes class/style values on an element outside
 * of Angular's styling binding algorithm.
 *
 * @returns true when the value was modified externally.
 */
function checkIfExternallyModified(element: any, cachedValue: any, isClassBased: boolean) {
  // this means it was checked before and there is no reason
  // to compare the style/class values again. Either that or
  // web workers are being used.
  if (global.Node === 'undefined') return true;

  // comparing the DOM value against the cached value is the best way to
  // see if something has changed.
  const currentValue = (isClassBased ? element.className :
                                       (element.getAttribute && element.getAttribute('style'))) ||
      '';
  return currentValue !== (cachedValue || '');
}
