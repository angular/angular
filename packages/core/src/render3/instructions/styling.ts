/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {SafeValue} from '../../sanitization/bypass';
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {throwErrorIfNoChangesMode} from '../errors';
import {setInputsForProperty} from '../instructions/shared';
import {AttributeMarker, TAttributes, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {StylingMapArray, StylingMapArrayIndex, TStylingContext} from '../interfaces/styling';
import {isDirectiveHost} from '../interfaces/type_checks';
import {LView, RENDERER, TVIEW} from '../interfaces/view';
import {getActiveDirectiveId, getCheckNoChangesMode, getCurrentStyleSanitizer, getLView, getSelectedIndex, incrementBindingIndex, nextBindingIndex, resetCurrentStyleSanitizer, setCurrentStyleSanitizer, setElementExitFn} from '../state';
import {applyStylingMapDirectly, applyStylingValueDirectly, flushStyling, setClass, setStyle, updateClassViaContext, updateStyleViaContext} from '../styling/bindings';
import {activateStylingMapFeature} from '../styling/map_based_bindings';
import {attachStylingDebugObject} from '../styling/styling_debug';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/misc_utils';
import {addItemToStylingMap, allocStylingMapArray, allocTStylingContext, allowDirectStyling, concatString, forceClassesAsString, forceStylesAsString, getInitialStylingValue, getStylingMapArray, getValue, hasClassInput, hasStyleInput, hasValueChanged, hasValueChangedUnwrapSafeValue, isHostStylingActive, isStylingContext, isStylingMapArray, isStylingValueDefined, normalizeIntoStylingMap, patchConfig, selectClassBasedInputName, setValue, stylingMapToString} from '../util/styling_utils';
import {getNativeByTNode, getTNode} from '../util/view_utils';




/**
 * Sets the current style sanitizer function which will then be used
 * within all follow-up prop and map-based style binding instructions
 * for the given element.
 *
 * Note that once styling has been applied to the element (i.e. once
 * `advance(n)` is executed or the hostBindings/template function exits)
 * then the active `sanitizerFn` will be set to `null`. This means that
 * once styling is applied to another element then a another call to
 * `styleSanitizer` will need to be made.
 *
 * @param sanitizerFn The sanitization function that will be used to
 *       process style prop/value entries.
 *
 * @codeGenApi
 */
export function ɵɵstyleSanitizer(sanitizer: StyleSanitizeFn | null): void {
  setCurrentStyleSanitizer(sanitizer);
}

/**
 * Update a style binding on an element with the provided value.
 *
 * If the style value is falsy then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `styleMap` or any static styles that are
 * present from when the element was created with `styling`).
 *
 * Note that the styling element is updated as part of `stylingApply`.
 *
 * @param prop A valid CSS property.
 * @param value New value to write (`null` or an empty string to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 *
 * Note that this will apply the provided style value to the host element if this function is called
 * within a host binding function.
 *
 * @codeGenApi
 */
export function ɵɵstyleProp(
    prop: string, value: string | number | SafeValue | null,
    suffix?: string | null): typeof ɵɵstyleProp {
  stylePropInternal(getSelectedIndex(), prop, value, suffix);
  return ɵɵstyleProp;
}

/**
 * Update a class binding on an element with the provided value.
 *
 * This instruction is meant to handle the `[class.foo]="exp"` case and,
 * therefore, the class binding itself must already be allocated using
 * `styling` within the creation block.
 *
 * @param prop A valid CSS class (only one).
 * @param value A true/false value which will turn the class on or off.
 *
 * Note that this will apply the provided class value to the host element if this function
 * is called within a host binding function.
 *
 * @codeGenApi
 */
export function ɵɵclassProp(className: string, value: boolean | null): typeof ɵɵclassProp {
  // if a value is interpolated then it may render a `NO_CHANGE` value.
  // in this case we do not need to do anything, but the binding index
  // still needs to be incremented because all styling binding values
  // are stored inside of the lView.
  const bindingIndex = nextBindingIndex();
  const lView = getLView();
  const elementIndex = getSelectedIndex();
  const tNode = getTNode(elementIndex, lView);
  const firstUpdatePass = lView[TVIEW].firstUpdatePass;

  // we check for this in the instruction code so that the context can be notified
  // about prop or map bindings so that the direct apply check can decide earlier
  // if it allows for context resolution to be bypassed.
  if (firstUpdatePass) {
    patchConfig(tNode, TNodeFlags.hasClassPropBindings);
    patchHostStylingFlag(tNode, isHostStyling(), true);
  }

  const updated = stylingProp(tNode, firstUpdatePass, lView, bindingIndex, className, value, true);
  if (ngDevMode) {
    ngDevMode.classProp++;
    if (updated) {
      ngDevMode.classPropCacheMiss++;
    }
  }
  return ɵɵclassProp;
}


/**
 * Update style bindings using an object literal on an element.
 *
 * This instruction is meant to apply styling via the `[style]="exp"` template bindings.
 * When styles are applied to the element they will then be updated with respect to
 * any styles/classes set via `styleProp`. If any styles are set to falsy
 * then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 *
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * Note that this will apply the provided styleMap value to the host element if this function
 * is called within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵstyleMap(styles: {[styleName: string]: any} | NO_CHANGE | null): void {
  const index = getSelectedIndex();
  const lView = getLView();
  const tNode = getTNode(index, lView);
  const firstUpdatePass = lView[TVIEW].firstUpdatePass;
  const context = getStylesContext(tNode);
  const hasDirectiveInput = hasStyleInput(tNode);

  // if a value is interpolated then it may render a `NO_CHANGE` value.
  // in this case we do not need to do anything, but the binding index
  // still needs to be incremented because all styling binding values
  // are stored inside of the lView.
  const bindingIndex = incrementBindingIndex(2);
  const hostBindingsMode = isHostStyling();

  // inputs are only evaluated from a template binding into a directive, therefore,
  // there should not be a situation where a directive host bindings function
  // evaluates the inputs (this should only happen in the template function)
  if (!hostBindingsMode && hasDirectiveInput && styles !== NO_CHANGE) {
    updateDirectiveInputValue(context, lView, tNode, bindingIndex, styles, false, firstUpdatePass);
    styles = NO_CHANGE;
  }

  // we check for this in the instruction code so that the context can be notified
  // about prop or map bindings so that the direct apply check can decide earlier
  // if it allows for context resolution to be bypassed.
  if (firstUpdatePass) {
    patchConfig(tNode, TNodeFlags.hasStyleMapBindings);
    patchHostStylingFlag(tNode, isHostStyling(), false);
  }

  stylingMap(
      context, tNode, firstUpdatePass, lView, bindingIndex, styles, false, hasDirectiveInput);
}

/**
 * Update class bindings using an object literal or class-string on an element.
 *
 * This instruction is meant to apply styling via the `[class]="exp"` template bindings.
 * When classes are applied to the element they will then be updated with
 * respect to any styles/classes set via `classProp`. If any
 * classes are set to falsy then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 * Note that this will the provided classMap value to the host element if this function is called
 * within a host binding.
 *
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 *
 * @codeGenApi
 */
export function ɵɵclassMap(classes: {[className: string]: any} | NO_CHANGE | string | null): void {
  classMapInternal(getSelectedIndex(), classes);
}

