/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {SafeValue} from '../../sanitization/bypass';
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {assertEqual, assertGreaterThan, assertLessThan} from '../../util/assert';
import {concatStringsWithSpace} from '../../util/stringify';
import {assertFirstUpdatePass} from '../assert';
import {bindingUpdated} from '../bindings';
import {TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {TStylingKey, TStylingMapKey, TStylingSanitizationKey, TStylingSuffixKey, getTStylingRangeTail} from '../interfaces/styling';
import {HEADER_OFFSET, RENDERER, TVIEW, TView} from '../interfaces/view';
import {getCheckNoChangesMode, getClassBindingChanged, getCurrentStyleSanitizer, getLView, getSelectedIndex, getStyleBindingChanged, incrementBindingIndex, isActiveHostElement, markStylingBindingDirty, setCurrentStyleSanitizer, setElementExitFn} from '../state';
import {writeAndReconcileClass, writeAndReconcileStyle} from '../styling/reconcile';
import {CLASS_MAP_STYLING_KEY, IGNORE_DUE_TO_INPUT_SHADOW, STYLE_MAP_STYLING_KEY, flushStyleBinding, insertTStylingBinding} from '../styling/style_binding_list';
import {NO_CHANGE} from '../tokens';
import {unwrapRNode} from '../util/view_utils';

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
    prop: string, value: string | number | SafeValue | null,
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
export function ɵɵclassProp(className: string, value: boolean | null): typeof ɵɵclassProp {
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
export function ɵɵstyleMap(styles: {[styleName: string]: any} | string | null): void {
  checkStylingMap(STYLE_MAP_STYLING_KEY, styles, false);
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
export function ɵɵclassMap(classes: {[className: string]: any} | string | null): void {
  checkStylingMap(CLASS_MAP_STYLING_KEY, classes, true);
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
    prop: string, value: string | number | SafeValue | null,
    suffixOrSanitizer: SanitizerFn | string | undefined | null, isClassBased: boolean): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  // Styling instructions use 2 slots per binding.
  // 1. one for the value / TStylingKey
  // 2. one for the intermittent-value / TStylingRange
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    // This is a work around. Once PR#34480 lands the sanitizer is passed explicitly and this line
    // can be removed.
    let styleSanitizer: StyleSanitizeFn|null;
    if (suffixOrSanitizer == null) {
      if (styleSanitizer = getCurrentStyleSanitizer()) {
        suffixOrSanitizer = styleSanitizer as any;
      }
    }
    stylingPropertyFirstUpdatePass(tView, prop, suffixOrSanitizer, bindingIndex, isClassBased);
  }
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    lView[bindingIndex] = value;
    markStylingBindingDirty(bindingIndex, isClassBased);
    setElementExitFn(flushStylingOnElementExit);
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
    tStylingMapKey: TStylingMapKey, value: {[className: string]: any} | string | null,
    isClassBased: boolean): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingPropertyFirstUpdatePass(tView, tStylingMapKey, null, bindingIndex, isClassBased);
  }
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    const tNode = tView.data[getSelectedIndex() + HEADER_OFFSET] as TNode;
    if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
      // VE concatenates the static portion with the dynamic portion.
      // We are doing the same.
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
      lView[bindingIndex] = value;
      markStylingBindingDirty(bindingIndex, isClassBased);
      setElementExitFn(flushStylingOnElementExit);
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
    tView: TView, prop: TStylingMapKey, suffix: null, bindingIndex: number,
    isClassBased: boolean): void;
function stylingPropertyFirstUpdatePass(
    tView: TView, prop: string, suffix: SanitizerFn | string | null | undefined,
    bindingIndex: number, isClassBased: boolean): void;
function stylingPropertyFirstUpdatePass(
    tView: TView, prop: string | TStylingMapKey,
    suffixOrSanitization: SanitizerFn | string | null | undefined, bindingIndex: number,
    isClassBased: boolean): void {
  ngDevMode && assertFirstUpdatePass(tView);
  const tData = tView.data;
  if (tData[bindingIndex + 1] === null) {
    // The above check is necessary because we don't clear first update pass until first successful
    // (ne exception) template execution. This prevents the styling instruction from double adding
    // itself to the list.
    const tNode = tData[getSelectedIndex() + HEADER_OFFSET] as TNode;
    if (hasStylingInputShadow(tNode, isClassBased) && typeof prop === 'object' &&
        !isInHostBindings(tView, bindingIndex)) {
      // typeof prop === 'object' implies that we are either `STYLE_MAP_STYLING_KEY` or
      // `CLASS_MAP_STYLING_KEY` which means that we are either `[style]` or `[class]` binding.
      // If there is a directive which uses `@Input('style')` or `@Input('class')` than
      // we need to neutralize this binding since that directive is shadowing it.
      // We turn this into a noop using `IGNORE_DOE_TO_INPUT_SHADOW`
      prop = IGNORE_DUE_TO_INPUT_SHADOW;
    }
    const tStylingKey: TStylingKey = suffixOrSanitization == null ? prop : ({
      key: prop as string, extra: suffixOrSanitization
    } as TStylingSuffixKey | TStylingSanitizationKey);
    insertTStylingBinding(
        tData, tNode, tStylingKey, bindingIndex, isActiveHostElement(), isClassBased);
  }
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

/**
* Flushes styling into DOM element from the bindings.
*
* The function starts at `LFrame.stylingBindingChanged` and computes new styling information from
* the bindings progressing towards the tail of the list. At the end the resulting style is written
* into the DOM Element.
*
* This function is invoked from:
* 1. Template `advance` instruction.
* 2. HostBinding instruction.
*/
function flushStylingOnElementExit() {
  ngDevMode && assertEqual(
                   getStyleBindingChanged() > 0 || getClassBindingChanged() > 0, true,
                   'Only expected to be here if binding has changed.');
  ngDevMode &&
      assertEqual(
          getCheckNoChangesMode(), false, 'Should never get here during check no changes mode');
  const lView = getLView();
  const tView = lView[TVIEW];
  const tData = tView.data;
  const elementIndex = getSelectedIndex() + HEADER_OFFSET;
  const tNode = tData[elementIndex] as TNode;
  const renderer = lView[RENDERER];
  const element = unwrapRNode(lView[elementIndex]) as RElement;

  const classBindingIndex = getClassBindingChanged();
  if (classBindingIndex > 0) {
    const classLastWrittenValueIndex = getTStylingRangeTail(tNode.classBindings) + 1;
    ngDevMode &&
        assertGreaterThan(
            classLastWrittenValueIndex, 1,
            'Ignoring `class` binding because there is no `class` metadata associated with the element. ' +
                '(Was exception thrown during `firstUpdatePass` which prevented the metadata creation?)');
    ngDevMode &&
        assertLessThan(classLastWrittenValueIndex, lView.length, 'Reading past end of LView');
    const lastValue: string|NO_CHANGE = lView[classLastWrittenValueIndex];
    const newValue = flushStyleBinding(tData, tNode, lView, classBindingIndex, true);
    if (lastValue !== newValue) {
      if (tNode.type === TNodeType.Element) {
        writeAndReconcileClass(
            renderer, element, lastValue === NO_CHANGE ? tNode.classes || '' : lastValue as string,
            newValue);
      }
      lView[classLastWrittenValueIndex] = newValue;
    }
  }

  const styleBindingIndex = getStyleBindingChanged();
  if (styleBindingIndex > 0) {
    const styleLastWrittenValueIndex = getTStylingRangeTail(tNode.styleBindings) + 1;
    ngDevMode &&
        assertGreaterThan(
            styleLastWrittenValueIndex, 1,
            'Ignoring `style` binding because there is no `style` metadata associated with the element. ' +
                '(Was exception thrown during `firstUpdatePass` which prevented the metadata creation?)');
    ngDevMode &&
        assertLessThan(styleLastWrittenValueIndex, lView.length, 'Reading past end of LView');
    const lastValue: string|NO_CHANGE = lView[styleLastWrittenValueIndex];
    const newValue = flushStyleBinding(tData, tNode, lView, styleBindingIndex, false);
    if (lastValue !== newValue) {
      if (tNode.type === TNodeType.Element) {
        writeAndReconcileStyle(
            renderer, element, lastValue === NO_CHANGE ? tNode.styles || '' : lastValue as string,
            newValue);
      }
      lView[styleLastWrittenValueIndex] = newValue;
    }
  }
  ngDevMode && ngDevMode.flushStyling++;
}
