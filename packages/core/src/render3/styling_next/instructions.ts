/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {setInputsForProperty} from '../instructions/shared';
import {AttributeMarker, TAttributes, TNode, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {BINDING_INDEX, LView, RENDERER, TVIEW} from '../interfaces/view';
import {getActiveDirectiveId, getActiveDirectiveSuperClassDepth, getActiveDirectiveSuperClassHeight, getCurrentStyleSanitizer, getLView, getPreviousOrParentTNode, getSelectedIndex, setCurrentStyleSanitizer} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/misc_utils';
import {getNativeByTNode, getTNode} from '../util/view_utils';

import {flushStyling, updateClassBinding, updateStyleBinding} from './bindings';
import {StylingMapArray, StylingMapArrayIndex, TStylingContext} from './interfaces';
import {activateStylingMapFeature, addItemToStylingMap, normalizeIntoStylingMap, stylingMapToString} from './map_based_bindings';
import {attachStylingDebugObject} from './styling_debug';
import {allocTStylingContext, concatString, forceClassesAsString, forceStylesAsString, getInitialStylingValue, getStylingMapArray, hasClassInput, hasStyleInput, hasValueChanged, isContextLocked, isStylingContext, updateLastDirectiveIndex as _updateLastDirectiveIndex} from './util';



/**
 * --------
 *
 * This file contains the core logic for how styling instructions are processed in Angular.
 *
 * To learn more about the algorithm see `TStylingContext`.
 *
 * --------
 */

/**
 * Temporary function to bridge styling functionality between this new
 * refactor (which is here inside of `styling_next/`) and the old
 * implementation (which lives inside of `styling/`).
 *
 * This function is executed during the creation block of an element.
 * Because the existing styling implementation issues a call to the
 * `styling()` instruction, this instruction will also get run. The
 * central idea here is that the directive index values are bound
 * into the context. The directive index is temporary and is only
 * required until the `select(n)` instruction is fully functional.
 *
 * @codeGenApi
 */
export function ɵɵstyling() {
  const tView = getLView()[TVIEW];
  if (tView.firstTemplatePass) {
    updateLastDirectiveIndex(getPreviousOrParentTNode(), getActiveDirectiveStylingIndex());
  }
}

/**
 * Sets the current style sanitizer function which will then be used
 * within all follow-up prop and map-based style binding instructions
 * for the given element.
 *
 * Note that once styling has been applied to the element (i.e. once
 * `select(n)` is executed or the hostBindings/template function exits)
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
 * within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵstyleProp(
    prop: string, value: string | number | String | null, suffix?: string | null): void {
  stylePropInternal(getSelectedIndex(), prop, value, suffix);
}

export function stylePropInternal(
    elementIndex: number, prop: string, value: string | number | String | null,
    suffix?: string | null | undefined) {
  const lView = getLView();

  // if a value is interpolated then it may render a `NO_CHANGE` value.
  // in this case we do not need to do anything, but the binding index
  // still needs to be incremented because all styling binding values
  // are stored inside of the lView.
  const bindingIndex = lView[BINDING_INDEX]++;

  const updated = _stylingProp(
      elementIndex, bindingIndex, prop, resolveStylePropValue(value, suffix), false,
      deferStylingUpdate());
  if (ngDevMode) {
    ngDevMode.styleProp++;
    if (updated) {
      ngDevMode.stylePropCacheMiss++;
    }
  }
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
 * is called within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵclassProp(className: string, value: boolean | null): void {
  const lView = getLView();

  // if a value is interpolated then it may render a `NO_CHANGE` value.
  // in this case we do not need to do anything, but the binding index
  // still needs to be incremented because all styling binding values
  // are stored inside of the lView.
  const bindingIndex = lView[BINDING_INDEX]++;

  const updated =
      _stylingProp(getSelectedIndex(), bindingIndex, className, value, true, deferStylingUpdate());
  if (ngDevMode) {
    ngDevMode.classProp++;
    if (updated) {
      ngDevMode.classPropCacheMiss++;
    }
  }
}

/**
 * Shared function used to update a prop-based styling binding for an element.
 */
function _stylingProp(
    elementIndex: number, bindingIndex: number, prop: string,
    value: boolean | number | String | string | null | undefined | NO_CHANGE, isClassBased: boolean,
    defer: boolean): boolean {
  const lView = getLView();
  const tNode = getTNode(elementIndex, lView);
  const native = getNativeByTNode(tNode, lView) as RElement;

  let updated = false;
  if (value !== NO_CHANGE) {
    if (isClassBased) {
      updated = updateClassBinding(
          getClassesContext(tNode), lView, native, prop, bindingIndex,
          value as string | boolean | null, defer, false);
    } else {
      const sanitizer = getCurrentStyleSanitizer();
      updated = updateStyleBinding(
          getStylesContext(tNode), lView, native, prop, bindingIndex, value as string | null,
          sanitizer, defer, false);
    }
  }

  return updated;
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
  const context = getStylesContext(tNode);
  const directiveIndex = getActiveDirectiveStylingIndex();

  // if a value is interpolated then it may render a `NO_CHANGE` value.
  // in this case we do not need to do anything, but the binding index
  // still needs to be incremented because all styling binding values
  // are stored inside of the lView.
  const bindingIndex = lView[BINDING_INDEX]++;

  // inputs are only evaluated from a template binding into a directive, therefore,
  // there should not be a situation where a directive host bindings function
  // evaluates the inputs (this should only happen in the template function)
  if (!directiveIndex && hasStyleInput(tNode) && styles !== NO_CHANGE) {
    updateDirectiveInputValue(context, lView, tNode, bindingIndex, styles, false);
    styles = NO_CHANGE;
  }

  const updated = _stylingMap(index, context, bindingIndex, styles, false, deferStylingUpdate());
  if (ngDevMode) {
    ngDevMode.styleMap++;
    if (updated) {
      ngDevMode.styleMapCacheMiss++;
    }
  }
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

export function classMapInternal(
    elementIndex: number, classes: {[className: string]: any} | NO_CHANGE | string | null) {
  const lView = getLView();
  const tNode = getTNode(elementIndex, lView);
  const context = getClassesContext(tNode);
  const directiveIndex = getActiveDirectiveStylingIndex();

  // if a value is interpolated then it may render a `NO_CHANGE` value.
  // in this case we do not need to do anything, but the binding index
  // still needs to be incremented because all styling binding values
  // are stored inside of the lView.
  const bindingIndex = lView[BINDING_INDEX]++;

  // inputs are only evaluated from a template binding into a directive, therefore,
  // there should not be a situation where a directive host bindings function
  // evaluates the inputs (this should only happen in the template function)
  if (!directiveIndex && hasClassInput(tNode) && classes !== NO_CHANGE) {
    updateDirectiveInputValue(context, lView, tNode, bindingIndex, classes, true);
    classes = NO_CHANGE;
  }

  const updated =
      _stylingMap(elementIndex, context, bindingIndex, classes, true, deferStylingUpdate());
  if (ngDevMode) {
    ngDevMode.classMap++;
    if (updated) {
      ngDevMode.classMapCacheMiss++;
    }
  }
}

/**
 * Shared function used to update a map-based styling binding for an element.
 *
 * When this function is called it will activate support for `[style]` and
 * `[class]` bindings in Angular.
 */
function _stylingMap(
    elementIndex: number, context: TStylingContext, bindingIndex: number,
    value: {[key: string]: any} | string | null, isClassBased: boolean, defer: boolean) {
  activateStylingMapFeature();
  const lView = getLView();

  let valueHasChanged = false;
  if (value !== NO_CHANGE) {
    const tNode = getTNode(elementIndex, lView);
    const native = getNativeByTNode(tNode, lView) as RElement;
    const oldValue = lView[bindingIndex];
    valueHasChanged = hasValueChanged(oldValue, value);
    const stylingMapArr = normalizeIntoStylingMap(oldValue, value, !isClassBased);
    if (isClassBased) {
      updateClassBinding(
          context, lView, native, null, bindingIndex, stylingMapArr, defer, valueHasChanged);
    } else {
      const sanitizer = getCurrentStyleSanitizer();
      updateStyleBinding(
          context, lView, native, null, bindingIndex, stylingMapArr, sanitizer, defer,
          valueHasChanged);
    }
  }

  return valueHasChanged;
}

/**
 * Writes a value to a directive's `style` or `class` input binding (if it has changed).
 *
 * If a directive has a `@Input` binding that is set on `style` or `class` then that value
 * will take priority over the underlying style/class styling bindings. This value will
 * be updated for the binding each time during change detection.
 *
 * When this occurs this function will attempt to write the value to the input binding
 * depending on the following situations:
 *
 * - If `oldValue !== newValue`
 * - If `newValue` is `null` (but this is skipped if it is during the first update pass--
 *    which is when the context is not locked yet)
 */
function updateDirectiveInputValue(
    context: TStylingContext, lView: LView, tNode: TNode, bindingIndex: number, newValue: any,
    isClassBased: boolean): void {
  const oldValue = lView[bindingIndex];
  if (oldValue !== newValue) {
    // even if the value has changed we may not want to emit it to the
    // directive input(s) in the event that it is falsy during the
    // first update pass.
    if (newValue || isContextLocked(context)) {
      const inputs = tNode.inputs ![isClassBased ? 'class' : 'style'] !;
      const initialValue = getInitialStylingValue(context);
      const value = normalizeStylingDirectiveInputValue(initialValue, newValue, isClassBased);
      setInputsForProperty(lView, inputs, value);
    }
    lView[bindingIndex] = newValue;
  }
}

/**
 * Returns the appropriate directive input value for `style` or `class`.
 *
 * Earlier versions of Angular expect a binding value to be passed into directive code
 * exactly as it is unless there is a static value present (in which case both values
 * will be stringified and concatenated).
 */
function normalizeStylingDirectiveInputValue(
    initialValue: string, bindingValue: string | {[key: string]: any} | null,
    isClassBased: boolean) {
  let value = bindingValue;

  // we only concat values if there is an initial value, otherwise we return the value as is.
  // Note that this is to satisfy backwards-compatibility in Angular.
  if (initialValue.length > 0) {
    if (isClassBased) {
      value = concatString(initialValue, forceClassesAsString(bindingValue));
    } else {
      value = concatString(
          initialValue, forceStylesAsString(bindingValue as{[key: string]: any} | null | undefined),
          ';');
    }
  }
  return value;
}

/**
 * Flushes all styling code to the element.
 *
 * This function is designed to be called from the template and hostBindings
 * functions and may be called multiple times depending whether multiple
 * sources of styling exist. If called multiple times, only the last call
 * to `stlyingApply()` will render styling to the element.
 *
 * @codeGenApi
 */
export function ɵɵstylingApply() {
  const elementIndex = getSelectedIndex();
  const lView = getLView();
  const tNode = getTNode(elementIndex, lView);
  const renderer = getRenderer(tNode, lView);
  const native = getNativeByTNode(tNode, lView) as RElement;
  const directiveIndex = getActiveDirectiveStylingIndex();
  const sanitizer = getCurrentStyleSanitizer();
  flushStyling(
      renderer, lView, getClassesContext(tNode), getStylesContext(tNode), native, directiveIndex,
      sanitizer);
  setCurrentStyleSanitizer(null);
}

function getRenderer(tNode: TNode, lView: LView) {
  return tNode.type === TNodeType.Element ? lView[RENDERER] : null;
}

/**
 * Searches and assigns provided all static style/class entries (found in the `attrs` value)
 * and registers them in their respective styling contexts.
 */
export function registerInitialStylingOnTNode(
    tNode: TNode, attrs: TAttributes, startIndex: number): boolean {
  let hasAdditionalInitialStyling = false;
  let styles = getStylingMapArray(tNode.styles);
  let classes = getStylingMapArray(tNode.classes);
  let mode = -1;
  for (let i = startIndex; i < attrs.length; i++) {
    const attr = attrs[i] as string;
    if (typeof attr == 'number') {
      mode = attr;
    } else if (mode == AttributeMarker.Classes) {
      classes = classes || [''];
      addItemToStylingMap(classes, attr, true);
      hasAdditionalInitialStyling = true;
    } else if (mode == AttributeMarker.Styles) {
      const value = attrs[++i] as string | null;
      styles = styles || [''];
      addItemToStylingMap(styles, attr, value);
      hasAdditionalInitialStyling = true;
    }
  }

  if (classes && classes.length > StylingMapArrayIndex.ValuesStartPosition) {
    if (!tNode.classes) {
      tNode.classes = classes;
    }
    updateRawValueOnContext(tNode.classes, stylingMapToString(classes, true));
  }

  if (styles && styles.length > StylingMapArrayIndex.ValuesStartPosition) {
    if (!tNode.styles) {
      tNode.styles = styles;
    }
    updateRawValueOnContext(tNode.styles, stylingMapToString(styles, false));
  }

  return hasAdditionalInitialStyling;
}

function updateRawValueOnContext(context: TStylingContext | StylingMapArray, value: string) {
  const stylingMapArr = getStylingMapArray(context) !;
  stylingMapArr[StylingMapArrayIndex.RawValuePosition] = value;
}

export function getActiveDirectiveStylingIndex(): number {
  // whenever a directive's hostBindings function is called a uniqueId value
  // is assigned. Normally this is enough to help distinguish one directive
  // from another for the styling context, but there are situations where a
  // sub-class directive could inherit and assign styling in concert with a
  // parent directive. To help the styling code distinguish between a parent
  // sub-classed directive the inheritance depth is taken into account as well.
  return getActiveDirectiveId() + getActiveDirectiveSuperClassDepth();
}

/**
 * Temporary function that will update the max directive index value in
 * both the classes and styles contexts present on the provided `tNode`.
 *
 * This code is only used because the `select(n)` code functionality is not
 * yet 100% functional. The `select(n)` instruction cannot yet evaluate host
 * bindings function code in sync with the associated template function code.
 * For this reason the styling algorithm needs to track the last directive index
 * value so that it knows exactly when to render styling to the element since
 * `stylingApply()` is called multiple times per CD (`stylingApply` will be
 * removed once `select(n)` is fixed).
 */
function updateLastDirectiveIndex(tNode: TNode, directiveIndex: number) {
  _updateLastDirectiveIndex(getClassesContext(tNode), directiveIndex);
  _updateLastDirectiveIndex(getStylesContext(tNode), directiveIndex);
}

function getStylesContext(tNode: TNode): TStylingContext {
  return getContext(tNode, false);
}

function getClassesContext(tNode: TNode): TStylingContext {
  return getContext(tNode, true);
}

/**
 * Returns/instantiates a styling context from/to a `tNode` instance.
 */
function getContext(tNode: TNode, isClassBased: boolean) {
  let context = isClassBased ? tNode.classes : tNode.styles;
  if (!isStylingContext(context)) {
    context = allocTStylingContext(context);
    if (ngDevMode) {
      attachStylingDebugObject(context as TStylingContext);
    }
    if (isClassBased) {
      tNode.classes = context;
    } else {
      tNode.styles = context;
    }
  }
  return context as TStylingContext;
}

function resolveStylePropValue(
    value: string | number | String | null | NO_CHANGE, suffix: string | null | undefined): string|
    null|undefined|NO_CHANGE {
  if (value === NO_CHANGE) return value;

  let resolvedValue: string|null = null;
  if (value !== null) {
    if (suffix) {
      // when a suffix is applied then it will bypass
      // sanitization entirely (b/c a new string is created)
      resolvedValue = renderStringify(value) + suffix;
    } else {
      // sanitization happens by dealing with a String value
      // this means that the string value will be passed through
      // into the style rendering later (which is where the value
      // will be sanitized before it is applied)
      resolvedValue = value as any as string;
    }
  }
  return resolvedValue;
}

/**
 * Whether or not a style/class binding update should be applied later.
 *
 * This function will decide whether a binding should be applied immediately
 * or later (just before the styles/classes are flushed to the element). The
 * reason why this feature exists is because of super/sub directive inheritance.
 * Angular will evaluate host bindings on the super directive first and the sub
 * directive, but the styling bindings on the sub directive are of higher priority
 * than the super directive. For this reason all styling bindings that take place
 * in this circumstance will need to be deferred until later so that they can be
 * applied together and in a different order (the algorithm handles that part).
 */
function deferStylingUpdate(): boolean {
  return getActiveDirectiveSuperClassHeight() > 0;
}
