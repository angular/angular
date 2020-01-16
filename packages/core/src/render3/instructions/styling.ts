/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {SafeValue, unwrapSafeValue} from '../../sanitization/bypass';
import {stylePropNeedsSanitization, ɵɵsanitizeStyle} from '../../sanitization/sanitization';
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {ArrayMap, arrayMapGet, arrayMapSet} from '../../util/array_utils';
import {assertDefined, assertEqual, assertLessThan, throwError} from '../../util/assert';
import {EMPTY_ARRAY} from '../../util/empty';
import {concatStringsWithSpace, stringify} from '../../util/stringify';
import {assertFirstUpdatePass} from '../assert';
import {bindingUpdated} from '../bindings';
import {AttributeMarker, TAttributes, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {RElement, Renderer3} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {TStylingKey, TStylingRange, getTStylingRangeNext, getTStylingRangeNextDuplicate, getTStylingRangePrev, getTStylingRangePrevDuplicate} from '../interfaces/styling';
import {HEADER_OFFSET, LView, RENDERER, TData, TVIEW, TView} from '../interfaces/view';
import {applyStyling} from '../node_manipulation';
import {getCurrentStyleSanitizer, getLView, getSelectedIndex, incrementBindingIndex, setCurrentStyleSanitizer} from '../state';
import {insertTStylingBinding} from '../styling/style_binding_list';
import {getLastParsedKey, getLastParsedValue, parseClassName, parseClassNameNext, parseStyle, parseStyleNext} from '../styling/styling_parser';
import {NO_CHANGE} from '../tokens';
import {getNativeByIndex} from '../util/view_utils';
import {setDirectiveInputsWhichShadowsStyling} from './property';


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
    prop: string, value: string | number | SafeValue | undefined | null,
    suffix?: string | null): typeof ɵɵstyleProp {
  checkStylingProperty(prop, value, suffix, false);
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
export function ɵɵclassProp(
    className: string, value: boolean | undefined | null): typeof ɵɵclassProp {
  checkStylingProperty(className, value, null, true);
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
export function ɵɵstyleMap(
    styles: {[styleName: string]: any} | Map<string, string|number|null|undefined>| string |
    undefined | null): void {
  checkStylingMap(styleArrayMapSet, styleStringParser, styles, false);
}


/**
 * Parse text as style and add values to ArrayMap.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only reference from `ɵɵstyleMap`.
 *
 * @param arrayMap ArrayMap to add parsed values to.
 * @param text text to parse.
 */
export function styleStringParser(arrayMap: ArrayMap<any>, text: string): void {
  for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
    styleArrayMapSet(arrayMap, getLastParsedKey(text), getLastParsedValue(text));
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
export function ɵɵclassMap(
    classes: {[className: string]: boolean | undefined | null} |
    Map<string, boolean|undefined|null>| Set<string>| string[] | string | undefined | null): void {
  checkStylingMap(arrayMapSet, classStringParser, classes, true);
}

/**
 * Parse text as class and add values to ArrayMap.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only reference from `ɵɵclassMap`.
 *
 * @param arrayMap ArrayMap to add parsed values to.
 * @param text text to parse.
 */
export function classStringParser(arrayMap: ArrayMap<any>, text: string): void {
  for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
    arrayMapSet(arrayMap, getLastParsedKey(text), true);
  }
}

/**
 * Common code between `ɵɵclassProp` and `ɵɵstyleProp`.
 *
 * @param prop property name.
 * @param value binding value.
 * @param suffixOrSanitizer suffix or sanitization function
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
export function checkStylingProperty(
    prop: string, value: any | NO_CHANGE,
    suffixOrSanitizer: SanitizerFn | string | undefined | null, isClassBased: boolean): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  // Styling instructions use 2 slots per binding.
  // 1. one for the value / TStylingKey
  // 2. one for the intermittent-value / TStylingRange
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingPropertyFirstUpdatePass(tView, prop, bindingIndex, isClassBased);
  }
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    // This is a work around. Once PR#34480 lands the sanitizer is passed explicitly and this line
    // can be removed.
    let styleSanitizer: StyleSanitizeFn|null;
    if (suffixOrSanitizer == null) {
      if (styleSanitizer = getCurrentStyleSanitizer()) {
        suffixOrSanitizer = styleSanitizer as any;
      }
    }
    const tNode = tView.data[getSelectedIndex() + HEADER_OFFSET] as TNode;
    updateStyling(
        tView, tNode, lView, lView[RENDERER], prop,
        lView[bindingIndex + 1] = normalizeAndApplySuffixOrSanitizer(value, suffixOrSanitizer),
        isClassBased, bindingIndex);
  }
}

/**
* Common code between `ɵɵclassMap` and `ɵɵstyleMap`.
*
* @param tStylingMapKey See `STYLE_MAP_STYLING_KEY` and `CLASS_MAP_STYLING_KEY`.
* @param value binding value.
* @param isClassBased `true` if `class` change (`false` if `style`)
*/
export function checkStylingMap(
    arrayMapSet: (arrayMap: ArrayMap<any>, key: string, value: any) => void,
    stringParser: (styleArrayMap: ArrayMap<any>, text: string) => void, value: any|NO_CHANGE,
    isClassBased: boolean): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingPropertyFirstUpdatePass(tView, null, bindingIndex, isClassBased);
  }
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
    // if so as not to read unnecessarily.
    const tNode = tView.data[getSelectedIndex() + HEADER_OFFSET] as TNode;
    if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
      // VE does not concatenate the static portion like we are doing here.
      // Instead VE just ignores the static completely if dynamic binding is present.
      // Because of locality we have already set the static portion because we don't know if there
      // is a dynamic portion until later. If we would ignore the static portion it would look like
      // tha the binding has removed it. This would confuse `[ngStyle]`/`[ngClass]` to do the wrong
      // thing as it would think tha the static portion was removed. For this reason we
      // concatenate it so that `[ngStyle]`/`[ngClass]`  can continue to work on changed.
      let staticPrefix = isClassBased ? tNode.classes : tNode.styles;
      ngDevMode && isClassBased === false && staticPrefix !== null &&
          assertEqual(
              staticPrefix.endsWith(';'), true, 'Expecting static portion to end with \';\'');
      if (typeof value === 'string') {
        value = concatStringsWithSpace(staticPrefix, value as string);
      }
      // Given `<div [style] my-dir>` such that `my-dir` has `@Input('style')`.
      // This takes over the `[style]` binding. (Same for `[class]`)
      setDirectiveInputsWhichShadowsStyling(tNode, lView, value, isClassBased);
    } else {
      updateStylingMap(
          tView, tNode, lView, lView[RENDERER], lView[bindingIndex + 1],
          lView[bindingIndex + 1] = toStylingArrayMap(arrayMapSet, stringParser, value),
          isClassBased, bindingIndex);
    }
  }
}

/**
 * Determines when the binding is in `hostBindings` section
 *
 * @param tView Current `TView`
 * @param bindingIndex index of binding which we would like if it is in `hostBindings`
 */
function isInHostBindings(tView: TView, bindingIndex: number): boolean {
  // All host bindings are placed after the expando section.
  return bindingIndex >= tView.expandoStartIndex;
}

/**
* Collects the necessary information to insert the binding into a linked list of style bindings
* using `insertTStylingBinding`.
*
* @param tView `TView` where the binding linked list will be stored.
* @param prop Property/key of the binding.
* @param suffix Optional suffix or Sanitization function.
* @param bindingIndex Index of binding associated with the `prop`
* @param isClassBased `true` if `class` change (`false` if `style`)
*/
function stylingPropertyFirstUpdatePass(
    tView: TView, tStylingKey: TStylingKey, bindingIndex: number, isClassBased: boolean): void {
  ngDevMode && assertFirstUpdatePass(tView);
  const tData = tView.data;
  if (tData[bindingIndex + 1] === null) {
    // The above check is necessary because we don't clear first update pass until first successful
    // (no exception) template execution. This prevents the styling instruction from double adding
    // itself to the list.
    // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
    // if so as not to read unnecessarily.
    const tNode = tData[getSelectedIndex() + HEADER_OFFSET] as TNode;
    const isHostBindings = isInHostBindings(tView, bindingIndex);
    if (hasStylingInputShadow(tNode, isClassBased) && tStylingKey === null && !isHostBindings) {
      // `tStylingKey === null` implies that we are either `[style]` or `[class]` binding.
      // If there is a directive which uses `@Input('style')` or `@Input('class')` than
      // we need to neutralize this binding since that directive is shadowing it.
      // We turn this into a noop by setting the key to `false`
      tStylingKey = false;
    }
    insertTStylingBinding(tData, tNode, tStylingKey, bindingIndex, isHostBindings, isClassBased);
  }
}

/**
 * Convert user input to `ArrayMap`.
 *
 * This function takes user input which could be `string`, Object literal, or iterable and converts
 * it into a consistent representation. The output of this is `ArrayMap` (which is an array where
 * even indexes contain keys and odd indexes contain values for those keys).
 *
 * The advantage of converting to `ArrayMap` is that we can perform diff in a input independent way.
 * (ie we can compare `foo bar` to `['bar', 'baz'] and determine a set of changes which need to be
 * applied)
 *
 * The fact that `ArrayMap` is sorted is very important because it allows us to compute the
 * difference in linear fashion without the need to allocate any additional data.
 *
 * For example if we kept this as a `Map` we would have to iterate over previous `Map` to determine
 * which values need to be delete, over the new `Map` to determine additions, and we would have to
 * keep additional `Map` to keep track of duplicates or items which have not yet been visited.
 *
 * @param stringParser The parser is passed in so that it will be tree shakable. See
 *        `styleStringParser` and `classStringParser`
 * @param value The value to parse/convert to `ArrayMap`
 */
export function toStylingArrayMap(
    arrayMapSet: (arrayMap: ArrayMap<any>, key: string, value: any) => void,
    stringParser: (styleArrayMap: ArrayMap<any>, text: string) => void, value: string|string[]|
    {[key: string]: any}|Map<any, any>|Set<any>|null|undefined): ArrayMap<any> {
  if (value === null || value === undefined || value === '') return EMPTY_ARRAY as any;
  const styleArrayMap: ArrayMap<any> = [] as any;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      arrayMapSet(styleArrayMap, value[i], true);
    }
  } else if (typeof value === 'object') {
    if (value instanceof Map) {
      value.forEach((v, k) => arrayMapSet(styleArrayMap, k, v));
    } else if (value instanceof Set) {
      value.forEach((k) => arrayMapSet(styleArrayMap, k, true));
    } else {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          arrayMapSet(styleArrayMap, key, value[key]);
        }
      }
    }
  } else if (typeof value === 'string') {
    stringParser(styleArrayMap, value);
  } else {
    ngDevMode && throwError('Unsupported styling type ' + typeof value);
  }
  return styleArrayMap;
}

/**
 * Set a `value` for a `key` taking style sanitization into account.
 *
 * See: `arrayMapSet` for details
 *
 * @param arrayMap ArrayMap to add to.
 * @param key Style key to add. (This key will be checked if it needs sanitization)
 * @param value The value to set (If key needs sanitization it will be sanitized)
 */
function styleArrayMapSet(arrayMap: ArrayMap<any>, key: string, value: any) {
  if (stylePropNeedsSanitization(key)) {
    value = ɵɵsanitizeStyle(value);
  }
  arrayMapSet(arrayMap, key, value);
}

/**
 * Update map based styling.
 *
 * Map based styling could be anything which contains more than one binding. For example `string`,
 * `Map`, `Set` or object literal. Dealing with all of these types would complicate the logic so
 * instead this function expects that the complex input is first converted into normalized
 * `ArrayMap`. The advantage of normalization is that we get the values sorted, which makes it very
 * cheap to compute deltas between the previous and current value.
 *
 * @param tView Associated `TView.data` contains the linked list of binding priorities.
 * @param tNode `TNode` where the binding is located.
 * @param lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param renderer Renderer to use if any updates.
 * @param oldArrayMap Previous value represented as `ArrayMap`
 * @param newArrayMap Current value represented as `ArrayMap`
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStylingMap(
    tView: TView, tNode: TNode, lView: LView, renderer: Renderer3, oldArrayMap: ArrayMap<any>,
    newArrayMap: ArrayMap<any>, isClassBased: boolean, bindingIndex: number) {
  if (oldArrayMap as ArrayMap<any>| NO_CHANGE === NO_CHANGE) {
    // ON first execution the oldArrayMap is NO_CHANGE => treat is as empty ArrayMap.
    oldArrayMap = EMPTY_ARRAY as any;
  }
  let oldIndex = 0;
  let newIndex = 0;
  let oldKey: string|null = 0 < oldArrayMap.length ? oldArrayMap[0] : null;
  let newKey: string|null = 0 < newArrayMap.length ? newArrayMap[0] : null;
  while (oldKey !== null || newKey !== null) {
    ngDevMode && assertLessThan(oldIndex, 999, 'Are we stuck in infinite loop?');
    ngDevMode && assertLessThan(newIndex, 999, 'Are we stuck in infinite loop?');
    const oldValue = oldIndex < oldArrayMap.length ? oldArrayMap[oldIndex + 1] : undefined;
    const newValue = newIndex < newArrayMap.length ? newArrayMap[newIndex + 1] : undefined;
    let setKey: string|null = null;
    let setValue: any = undefined;
    if (oldKey === newKey) {
      // UPDATE: Keys are equal => new value is overwriting old value.
      oldIndex += 2;
      newIndex += 2;
      if (oldValue !== newValue) {
        setKey = newKey;
        setValue = newValue;
      }
    } else if (newKey === null || oldKey !== null && oldKey < newKey !) {
      // DELETE: oldKey key is missing or we did not find the oldKey in the newValue.
      oldIndex += 2;
      setKey = oldKey;
    } else {
      // CREATE: newKey is less than oldKey (or no oldKey) => we have new key.
      ngDevMode && assertDefined(newKey, 'Expecting to have a valid key');
      newIndex += 2;
      setKey = newKey;
      setValue = newValue;
    }
    if (setKey !== null) {
      updateStyling(tView, tNode, lView, renderer, setKey, setValue, isClassBased, bindingIndex);
    }
    oldKey = oldIndex < oldArrayMap.length ? oldArrayMap[oldIndex] : null;
    newKey = newIndex < newArrayMap.length ? newArrayMap[newIndex] : null;
  }
}

/**
 * Update a simple (property name) styling.
 *
 * This function takes `prop` and updates the DOM to that value. The function takes the binding
 * value as well as binding priority into consideration to determine which value should be written
 * to DOM. (For example it may be determined that there is a higher priority overwrite which blocks
 * the DOM write, or if the value goes to `undefined` a lower priority overwrite may be consulted.)
 *
 * @param tView Associated `TView.data` contains the linked list of binding priorities.
 * @param tNode `TNode` where the binding is located.
 * @param lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param renderer Renderer to use if any updates.
 * @param prop Either style property name or a class name.
 * @param value Either style vale for `prop` or `true`/`false` if `prop` is class.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStyling(
    tView: TView, tNode: TNode, lView: LView, renderer: Renderer3, prop: string,
    value: string | undefined | null | boolean, isClassBased: boolean, bindingIndex: number) {
  if (tNode.type !== TNodeType.Element) {
    // It is possible to have styling on non-elements (such as ng-container).
    // This is rare, but it does happen. In such a case, just ignore the binding.
    return;
  }
  const tData = tView.data;
  const tRange = tData[bindingIndex + 1] as TStylingRange;
  const higherPriorityValue = getTStylingRangeNextDuplicate(tRange) ?
      findStylingValue(tData, null, lView, prop, getTStylingRangeNext(tRange), isClassBased) :
      undefined;
  if (!isStylingValuePresent(higherPriorityValue)) {
    // We don't have a next duplicate, or we did not find a duplicate value.
    if (!isStylingValuePresent(value)) {
      // We should delete current value or restore to lower priority value.
      if (getTStylingRangePrevDuplicate(tRange)) {
        // We have a possible prev duplicate, let's retrieve it.
        value =
            findStylingValue(tData, tNode, lView, prop, getTStylingRangePrev(tRange), isClassBased);
      }
    }
    const rNode = getNativeByIndex(getSelectedIndex(), lView) as RElement;
    applyStyling(renderer, isClassBased, rNode, prop, value);
  }
}

/**
 * Search for styling value with higher priority which is overwriting current value.
 *
 * When value is being applied at a location related values need to be consulted.
 * - If there is a higher priority binding, we should be using that one instead.
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp1`
 *   requires that we check `exp2` to see if it is set to value other than `undefined`.
 * - If there is a lower priority binding and we are changing to `undefined`
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp2` to
 *   `undefined` requires that we check `exp` (and static values) and use that as new value.
 *
 * NOTE: The styling stores two values.
 * 1. The raw value which came from the application is stored at `index + 0` location. (This value
 *    is used for dirty checking).
 * 2. The normalized value (converted to `ArrayMap` if map and sanitized) is stored at `index + 1`.
 *    The advantage of storing the sanitized value is that once the value is written we don't need
 *    to worry about sanitizing it later or keeping track of the sanitizer.
 *
 * @param tData `TData` used for traversing the priority.
 * @param tNode `TNode` to use for resolving static styling. Also controls search direction.
 *   - `TNode` search previous and quit as soon as `isStylingValuePresent(value)` is true.
 *      If no value found consult `tNode.styleMap`/`tNode.classMap` for default value.
 *   - `null` search next and go all the way to end. Return last value where
 *     `isStylingValuePresent(value)` is true.
 * @param lView `LView` used for retrieving the actual values.
 * @param prop Property which we are interested in.
 * @param index Starting index in the linked list of styling bindings where the search should start.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function findStylingValue(
    tData: TData, tNode: TNode | null, lView: LView, prop: string, index: number,
    isClassBased: boolean): any {
  let value: any = undefined;
  while (index > 0) {
    const key = tData[index] as TStylingKey;
    const currentValue = key === null ? arrayMapGet(lView[index + 1], prop) :
                                        key === prop ? lView[index + 1] : undefined;
    if (isStylingValuePresent(currentValue)) {
      value = currentValue;
      if (tNode !== null) {
        return value;
      }
    }
    const tRange = tData[index + 1] as TStylingRange;
    index = tNode !== null ? getTStylingRangePrev(tRange) : getTStylingRangeNext(tRange);
  }
  if (tNode !== null) {
    // in case where we are going in previous direction AND we did not find anything, we need to
    // consult static styling
    let staticArrayMap = isClassBased ? tNode.classesMap : tNode.stylesMap;
    if (staticArrayMap === undefined) {
      // This is the first time we are here, and we need to initialize it.
      initializeStylingStaticArrayMap(tNode);
      staticArrayMap = isClassBased ? tNode.classesMap : tNode.stylesMap;
    }
    if (staticArrayMap !== null) {
      value = arrayMapGet(staticArrayMap !, prop);
    }
  }
  return value;
}

/**
 * Determines if the binding value should be used (or if the value is 'undefined' and hence priority
 * resolution should be used.)
 *
 * @param value Binding style value.
 */
function isStylingValuePresent(value: any): boolean {
  // Currently only `undefined` value is considered non-binding. That is `undefined` says I don't
  // have an opinion as to what this binding should be and you should consult other bindings by
  // priority to determine the valid value.
  // This is extracted into a single function so that we have a single place to control this.
  return value !== undefined;
}

/**
 * Lazily computes `tNode.classesMap`/`tNode.stylesMap`.
 *
 * This code is here because we don't want to included it in `elementStart` as it would make hello
 * world bigger even if no styling would be present. Instead we initialize the values here so that
 * tree shaking will only bring it in if styling is present.
 *
 * @param tNode `TNode` to initialize.
 */
export function initializeStylingStaticArrayMap(tNode: TNode) {
  ngDevMode && assertEqual(tNode.classesMap, undefined, 'Already initialized!');
  ngDevMode && assertEqual(tNode.stylesMap, undefined, 'Already initialized!');
  let styleMap: ArrayMap<any>|null = null;
  let classMap: ArrayMap<any>|null = null;
  const mergeAttrs = tNode.mergedAttrs || EMPTY_ARRAY as TAttributes;
  let mode: AttributeMarker = AttributeMarker.ImplicitAttributes;
  for (let i = 0; i < mergeAttrs.length; i++) {
    let item = mergeAttrs[i];
    if (typeof item === 'number') {
      mode = item;
    } else if (mode === AttributeMarker.Classes) {
      classMap = classMap || [] as any;
      arrayMapSet(classMap !, item as string, true);
    } else if (mode === AttributeMarker.Styles) {
      styleMap = styleMap || [] as any;
      arrayMapSet(styleMap !, item as string, mergeAttrs[++i] as string);
    }
  }
  tNode.classesMap = classMap;
  tNode.stylesMap = styleMap;
}

/**
 * Sanitizes or adds suffix to the value.
 *
 * If value is `null`/`undefined` no suffix is added
 * @param value
 * @param suffixOrSanitizer
 */
function normalizeAndApplySuffixOrSanitizer(
    value: any, suffixOrSanitizer: SanitizerFn | string | undefined | null): string|null|undefined|
    boolean {
  if (value === null || value === undefined) {
    // do nothing
  } else if (typeof suffixOrSanitizer === 'function') {
    // sanitize the value.
    value = suffixOrSanitizer(value);
  } else if (typeof suffixOrSanitizer === 'string') {
    value = value + suffixOrSanitizer;
  } else if (typeof value === 'object') {
    value = stringify(unwrapSafeValue(value));
  }
  return value;
}


/**
 * Tests if the `TNode` has input shadow.
 *
 * An input shadow is when a directive steals (shadows) the input by using `@Input('style')` or
 * `@Input('class')` as input.
 *
 * @param tNode `TNode` which we would like to see if it has shadow.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
export function hasStylingInputShadow(tNode: TNode, isClassBased: boolean) {
  return (tNode.flags & (isClassBased ? TNodeFlags.hasClassInput : TNodeFlags.hasStyleInput)) !== 0;
}
