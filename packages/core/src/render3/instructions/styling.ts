/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SafeValue, unwrapSafeValue} from '../../sanitization/bypass';
import {KeyValueArray, keyValueArrayGet, keyValueArraySet} from '../../util/array_utils';
import {assertDefined, assertEqual, assertLessThan, assertNotEqual, throwError} from '../../util/assert';
import {EMPTY_ARRAY} from '../../util/empty';
import {concatStringsWithSpace, stringify} from '../../util/stringify';
import {assertFirstUpdatePass} from '../assert';
import {bindingUpdated} from '../bindings';
import {DirectiveDef} from '../interfaces/definition';
import {AttributeMarker, TAttributes, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {RElement} from '../interfaces/renderer_dom';
import {getTStylingRangeNext, getTStylingRangeNextDuplicate, getTStylingRangePrev, getTStylingRangePrevDuplicate, TStylingKey, TStylingRange} from '../interfaces/styling';
import {LView, RENDERER, TData, TView} from '../interfaces/view';
import {applyStyling} from '../node_manipulation';
import {getCurrentDirectiveDef, getLView, getSelectedIndex, getTView, incrementBindingIndex} from '../state';
import {insertTStylingBinding} from '../styling/style_binding_list';
import {getLastParsedKey, getLastParsedValue, parseClassName, parseClassNameNext, parseStyle, parseStyleNext} from '../styling/styling_parser';
import {NO_CHANGE} from '../tokens';
import {getNativeByIndex} from '../util/view_utils';

import {setDirectiveInputsWhichShadowsStyling} from './property';


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
 *
 * Note that this will apply the provided style value to the host element if this function is called
 * within a host binding function.
 *
 * @codeGenApi
 */
export function ɵɵstyleProp(
    prop: string, value: string|number|SafeValue|undefined|null,
    suffix?: string|null): typeof ɵɵstyleProp {
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
export function ɵɵclassProp(className: string, value: boolean|undefined|null): typeof ɵɵclassProp {
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
export function ɵɵstyleMap(styles: {[styleName: string]: any}|string|undefined|null): void {
  checkStylingMap(styleKeyValueArraySet, styleStringParser, styles, false);
}


/**
 * Parse text as style and add values to KeyValueArray.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only referenced from `ɵɵstyleMap`.
 *
 * @param keyValueArray KeyValueArray to add parsed values to.
 * @param text text to parse.
 */
export function styleStringParser(keyValueArray: KeyValueArray<any>, text: string): void {
  for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
    styleKeyValueArraySet(keyValueArray, getLastParsedKey(text), getLastParsedValue(text));
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
export function ɵɵclassMap(classes: {[className: string]: boolean|undefined|null}|string|undefined|
                           null): void {
  checkStylingMap(classKeyValueArraySet, classStringParser, classes, true);
}

/**
 * Parse text as class and add values to KeyValueArray.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only referenced from `ɵɵclassMap`.
 *
 * @param keyValueArray KeyValueArray to add parsed values to.
 * @param text text to parse.
 */
export function classStringParser(keyValueArray: KeyValueArray<any>, text: string): void {
  for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
    keyValueArraySet(keyValueArray, getLastParsedKey(text), true);
  }
}

/**
 * Common code between `ɵɵclassProp` and `ɵɵstyleProp`.
 *
 * @param prop property name.
 * @param value binding value.
 * @param suffix suffix for the property (e.g. `em` or `px`)
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
export function checkStylingProperty(
    prop: string, value: any|NO_CHANGE, suffix: string|undefined|null,
    isClassBased: boolean): void {
  const lView = getLView();
  const tView = getTView();
  // Styling instructions use 2 slots per binding.
  // 1. one for the value / TStylingKey
  // 2. one for the intermittent-value / TStylingRange
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingFirstUpdatePass(tView, prop, bindingIndex, isClassBased);
  }
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    const tNode = tView.data[getSelectedIndex()] as TNode;
    updateStyling(
        tView, tNode, lView, lView[RENDERER], prop,
        lView[bindingIndex + 1] = normalizeSuffix(value, suffix), isClassBased, bindingIndex);
  }
}

/**
 * Common code between `ɵɵclassMap` and `ɵɵstyleMap`.
 *
 * @param keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 *        function so that `style` can be processed. This is done for tree shaking purposes.
 * @param stringParser Parser used to parse `value` if `string`. (Passed in as `style` and `class`
 *        have different parsers.)
 * @param value bound value from application
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
export function checkStylingMap(
    keyValueArraySet: (keyValueArray: KeyValueArray<any>, key: string, value: any) => void,
    stringParser: (styleKeyValueArray: KeyValueArray<any>, text: string) => void,
    value: any|NO_CHANGE, isClassBased: boolean): void {
  const tView = getTView();
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingFirstUpdatePass(tView, null, bindingIndex, isClassBased);
  }
  const lView = getLView();
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
    // if so as not to read unnecessarily.
    const tNode = tView.data[getSelectedIndex()] as TNode;
    if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
      if (ngDevMode) {
        // verify that if we are shadowing then `TData` is appropriately marked so that we skip
        // processing this binding in styling resolution.
        const tStylingKey = tView.data[bindingIndex];
        assertEqual(
            Array.isArray(tStylingKey) ? tStylingKey[1] : tStylingKey, false,
            'Styling linked list shadow input should be marked as \'false\'');
      }
      // VE does not concatenate the static portion like we are doing here.
      // Instead VE just ignores the static completely if dynamic binding is present.
      // Because of locality we have already set the static portion because we don't know if there
      // is a dynamic portion until later. If we would ignore the static portion it would look like
      // the binding has removed it. This would confuse `[ngStyle]`/`[ngClass]` to do the wrong
      // thing as it would think that the static portion was removed. For this reason we
      // concatenate it so that `[ngStyle]`/`[ngClass]`  can continue to work on changed.
      let staticPrefix = isClassBased ? tNode.classesWithoutHost : tNode.stylesWithoutHost;
      ngDevMode && isClassBased === false && staticPrefix !== null &&
          assertEqual(
              staticPrefix.endsWith(';'), true, 'Expecting static portion to end with \';\'');
      if (staticPrefix !== null) {
        // We want to make sure that falsy values of `value` become empty strings.
        value = concatStringsWithSpace(staticPrefix, value ? value : '');
      }
      // Given `<div [style] my-dir>` such that `my-dir` has `@Input('style')`.
      // This takes over the `[style]` binding. (Same for `[class]`)
      setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased);
    } else {
      updateStylingMap(
          tView, tNode, lView, lView[RENDERER], lView[bindingIndex + 1],
          lView[bindingIndex + 1] = toStylingKeyValueArray(keyValueArraySet, stringParser, value),
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
 * @param tStylingKey Property/key of the binding.
 * @param bindingIndex Index of binding associated with the `prop`
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
function stylingFirstUpdatePass(
    tView: TView, tStylingKey: TStylingKey, bindingIndex: number, isClassBased: boolean): void {
  ngDevMode && assertFirstUpdatePass(tView);
  const tData = tView.data;
  if (tData[bindingIndex + 1] === null) {
    // The above check is necessary because we don't clear first update pass until first successful
    // (no exception) template execution. This prevents the styling instruction from double adding
    // itself to the list.
    // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
    // if so as not to read unnecessarily.
    const tNode = tData[getSelectedIndex()] as TNode;
    ngDevMode && assertDefined(tNode, 'TNode expected');
    const isHostBindings = isInHostBindings(tView, bindingIndex);
    if (hasStylingInputShadow(tNode, isClassBased) && tStylingKey === null && !isHostBindings) {
      // `tStylingKey === null` implies that we are either `[style]` or `[class]` binding.
      // If there is a directive which uses `@Input('style')` or `@Input('class')` than
      // we need to neutralize this binding since that directive is shadowing it.
      // We turn this into a noop by setting the key to `false`
      tStylingKey = false;
    }
    tStylingKey = wrapInStaticStylingKey(tData, tNode, tStylingKey, isClassBased);
    insertTStylingBinding(tData, tNode, tStylingKey, bindingIndex, isHostBindings, isClassBased);
  }
}

/**
 * Adds static styling information to the binding if applicable.
 *
 * The linked list of styles not only stores the list and keys, but also stores static styling
 * information on some of the keys. This function determines if the key should contain the styling
 * information and computes it.
 *
 * See `TStylingStatic` for more details.
 *
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param stylingKey `TStylingKeyPrimitive` which may need to be wrapped into `TStylingKey`
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
export function wrapInStaticStylingKey(
    tData: TData, tNode: TNode, stylingKey: TStylingKey, isClassBased: boolean): TStylingKey {
  const hostDirectiveDef = getCurrentDirectiveDef(tData);
  let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
  if (hostDirectiveDef === null) {
    // We are in template node.
    // If template node already had styling instruction then it has already collected the static
    // styling and there is no need to collect them again. We know that we are the first styling
    // instruction because the `TNode.*Bindings` points to 0 (nothing has been inserted yet).
    const isFirstStylingInstructionInTemplate =
        (isClassBased ? tNode.classBindings : tNode.styleBindings) as any as number === 0;
    if (isFirstStylingInstructionInTemplate) {
      // It would be nice to be able to get the statics from `mergeAttrs`, however, at this point
      // they are already merged and it would not be possible to figure which property belongs where
      // in the priority.
      stylingKey = collectStylingFromDirectives(null, tData, tNode, stylingKey, isClassBased);
      stylingKey = collectStylingFromTAttrs(stylingKey, tNode.attrs, isClassBased);
      // We know that if we have styling binding in template we can't have residual.
      residual = null;
    }
  } else {
    // We are in host binding node and there was no binding instruction in template node.
    // This means that we need to compute the residual.
    const directiveStylingLast = tNode.directiveStylingLast;
    const isFirstStylingInstructionInHostBinding =
        directiveStylingLast === -1 || tData[directiveStylingLast] !== hostDirectiveDef;
    if (isFirstStylingInstructionInHostBinding) {
      stylingKey =
          collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased);
      if (residual === null) {
        // - If `null` than either:
        //    - Template styling instruction already ran and it has consumed the static
        //      styling into its `TStylingKey` and so there is no need to update residual. Instead
        //      we need to update the `TStylingKey` associated with the first template node
        //      instruction. OR
        //    - Some other styling instruction ran and determined that there are no residuals
        let templateStylingKey = getTemplateHeadTStylingKey(tData, tNode, isClassBased);
        if (templateStylingKey !== undefined && Array.isArray(templateStylingKey)) {
          // Only recompute if `templateStylingKey` had static values. (If no static value found
          // then there is nothing to do since this operation can only produce less static keys, not
          // more.)
          templateStylingKey = collectStylingFromDirectives(
              null, tData, tNode, templateStylingKey[1] /* unwrap previous statics */,
              isClassBased);
          templateStylingKey =
              collectStylingFromTAttrs(templateStylingKey, tNode.attrs, isClassBased);
          setTemplateHeadTStylingKey(tData, tNode, isClassBased, templateStylingKey);
        }
      } else {
        // We only need to recompute residual if it is not `null`.
        // - If existing residual (implies there was no template styling). This means that some of
        //   the statics may have moved from the residual to the `stylingKey` and so we have to
        //   recompute.
        // - If `undefined` this is the first time we are running.
        residual = collectResidual(tData, tNode, isClassBased);
      }
    }
  }
  if (residual !== undefined) {
    isClassBased ? (tNode.residualClasses = residual) : (tNode.residualStyles = residual);
  }
  return stylingKey;
}

/**
 * Retrieve the `TStylingKey` for the template styling instruction.
 *
 * This is needed since `hostBinding` styling instructions are inserted after the template
 * instruction. While the template instruction needs to update the residual in `TNode` the
 * `hostBinding` instructions need to update the `TStylingKey` of the template instruction because
 * the template instruction is downstream from the `hostBindings` instructions.
 *
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @return `TStylingKey` if found or `undefined` if not found.
 */
function getTemplateHeadTStylingKey(tData: TData, tNode: TNode, isClassBased: boolean): TStylingKey|
    undefined {
  const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
  if (getTStylingRangeNext(bindings) === 0) {
    // There does not seem to be a styling instruction in the `template`.
    return undefined;
  }
  return tData[getTStylingRangePrev(bindings)] as TStylingKey;
}

/**
 * Update the `TStylingKey` of the first template instruction in `TNode`.
 *
 * Logically `hostBindings` styling instructions are of lower priority than that of the template.
 * However, they execute after the template styling instructions. This means that they get inserted
 * in front of the template styling instructions.
 *
 * If we have a template styling instruction and a new `hostBindings` styling instruction is
 * executed it means that it may need to steal static fields from the template instruction. This
 * method allows us to update the first template instruction `TStylingKey` with a new value.
 *
 * Assume:
 * ```
 * <div my-dir style="color: red" [style.color]="tmplExp"></div>
 *
 * @Directive({
 *   host: {
 *     'style': 'width: 100px',
 *     '[style.color]': 'dirExp',
 *   }
 * })
 * class MyDir {}
 * ```
 *
 * when `[style.color]="tmplExp"` executes it creates this data structure.
 * ```
 *  ['', 'color', 'color', 'red', 'width', '100px'],
 * ```
 *
 * The reason for this is that the template instruction does not know if there are styling
 * instructions and must assume that there are none and must collect all of the static styling.
 * (both
 * `color' and 'width`)
 *
 * When `'[style.color]': 'dirExp',` executes we need to insert a new data into the linked list.
 * ```
 *  ['', 'color', 'width', '100px'],  // newly inserted
 *  ['', 'color', 'color', 'red', 'width', '100px'], // this is wrong
 * ```
 *
 * Notice that the template statics is now wrong as it incorrectly contains `width` so we need to
 * update it like so:
 * ```
 *  ['', 'color', 'width', '100px'],
 *  ['', 'color', 'color', 'red'],    // UPDATE
 * ```
 *
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param tStylingKey New `TStylingKey` which is replacing the old one.
 */
function setTemplateHeadTStylingKey(
    tData: TData, tNode: TNode, isClassBased: boolean, tStylingKey: TStylingKey): void {
  const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
  ngDevMode &&
      assertNotEqual(
          getTStylingRangeNext(bindings), 0,
          'Expecting to have at least one template styling binding.');
  tData[getTStylingRangePrev(bindings)] = tStylingKey;
}

/**
 * Collect all static values after the current `TNode.directiveStylingLast` index.
 *
 * Collect the remaining styling information which has not yet been collected by an existing
 * styling instruction.
 *
 * @param tData `TData` where the `DirectiveDefs` are stored.
 * @param tNode `TNode` which contains the directive range.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectResidual(tData: TData, tNode: TNode, isClassBased: boolean): KeyValueArray<any>|
    null {
  let residual: KeyValueArray<any>|null|undefined = undefined;
  const directiveEnd = tNode.directiveEnd;
  ngDevMode &&
      assertNotEqual(
          tNode.directiveStylingLast, -1,
          'By the time this function gets called at least one hostBindings-node styling instruction must have executed.');
  // We add `1 + tNode.directiveStart` because we need to skip the current directive (as we are
  // collecting things after the last `hostBindings` directive which had a styling instruction.)
  for (let i = 1 + tNode.directiveStylingLast; i < directiveEnd; i++) {
    const attrs = (tData[i] as DirectiveDef<any>).hostAttrs;
    residual = collectStylingFromTAttrs(residual, attrs, isClassBased) as KeyValueArray<any>| null;
  }
  return collectStylingFromTAttrs(residual, tNode.attrs, isClassBased) as KeyValueArray<any>| null;
}

/**
 * Collect the static styling information with lower priority than `hostDirectiveDef`.
 *
 * (This is opposite of residual styling.)
 *
 * @param hostDirectiveDef `DirectiveDef` for which we want to collect lower priority static
 *        styling. (Or `null` if template styling)
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param stylingKey Existing `TStylingKey` to update or wrap.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectStylingFromDirectives(
    hostDirectiveDef: DirectiveDef<any>|null, tData: TData, tNode: TNode, stylingKey: TStylingKey,
    isClassBased: boolean): TStylingKey {
  // We need to loop because there can be directives which have `hostAttrs` but don't have
  // `hostBindings` so this loop catches up to the current directive..
  let currentDirective: DirectiveDef<any>|null = null;
  const directiveEnd = tNode.directiveEnd;
  let directiveStylingLast = tNode.directiveStylingLast;
  if (directiveStylingLast === -1) {
    directiveStylingLast = tNode.directiveStart;
  } else {
    directiveStylingLast++;
  }
  while (directiveStylingLast < directiveEnd) {
    currentDirective = tData[directiveStylingLast] as DirectiveDef<any>;
    ngDevMode && assertDefined(currentDirective, 'expected to be defined');
    stylingKey = collectStylingFromTAttrs(stylingKey, currentDirective.hostAttrs, isClassBased);
    if (currentDirective === hostDirectiveDef) break;
    directiveStylingLast++;
  }
  if (hostDirectiveDef !== null) {
    // we only advance the styling cursor if we are collecting data from host bindings.
    // Template executes before host bindings and so if we would update the index,
    // host bindings would not get their statics.
    tNode.directiveStylingLast = directiveStylingLast;
  }
  return stylingKey;
}

/**
 * Convert `TAttrs` into `TStylingStatic`.
 *
 * @param stylingKey existing `TStylingKey` to update or wrap.
 * @param attrs `TAttributes` to process.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectStylingFromTAttrs(
    stylingKey: TStylingKey|undefined, attrs: TAttributes|null,
    isClassBased: boolean): TStylingKey {
  const desiredMarker = isClassBased ? AttributeMarker.Classes : AttributeMarker.Styles;
  let currentMarker = AttributeMarker.ImplicitAttributes;
  if (attrs !== null) {
    for (let i = 0; i < attrs.length; i++) {
      const item = attrs[i] as number | string;
      if (typeof item === 'number') {
        currentMarker = item;
      } else {
        if (currentMarker === desiredMarker) {
          if (!Array.isArray(stylingKey)) {
            stylingKey = stylingKey === undefined ? [] : ['', stylingKey] as any;
          }
          keyValueArraySet(
              stylingKey as KeyValueArray<any>, item, isClassBased ? true : attrs[++i]);
        }
      }
    }
  }
  return stylingKey === undefined ? null : stylingKey;
}

/**
 * Convert user input to `KeyValueArray`.
 *
 * This function takes user input which could be `string`, Object literal, or iterable and converts
 * it into a consistent representation. The output of this is `KeyValueArray` (which is an array
 * where
 * even indexes contain keys and odd indexes contain values for those keys).
 *
 * The advantage of converting to `KeyValueArray` is that we can perform diff in an input
 * independent
 * way.
 * (ie we can compare `foo bar` to `['bar', 'baz'] and determine a set of changes which need to be
 * applied)
 *
 * The fact that `KeyValueArray` is sorted is very important because it allows us to compute the
 * difference in linear fashion without the need to allocate any additional data.
 *
 * For example if we kept this as a `Map` we would have to iterate over previous `Map` to determine
 * which values need to be deleted, over the new `Map` to determine additions, and we would have to
 * keep additional `Map` to keep track of duplicates or items which have not yet been visited.
 *
 * @param keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 *        function so that `style` can be processed. This is done
 *        for tree shaking purposes.
 * @param stringParser The parser is passed in so that it will be tree shakable. See
 *        `styleStringParser` and `classStringParser`
 * @param value The value to parse/convert to `KeyValueArray`
 */
export function toStylingKeyValueArray(
    keyValueArraySet: (keyValueArray: KeyValueArray<any>, key: string, value: any) => void,
    stringParser: (styleKeyValueArray: KeyValueArray<any>, text: string) => void,
    value: string|string[]|{[key: string]: any}|SafeValue|null|undefined): KeyValueArray<any> {
  if (value == null /*|| value === undefined */ || value === '') return EMPTY_ARRAY as any;
  const styleKeyValueArray: KeyValueArray<any> = [] as any;
  const unwrappedValue = unwrapSafeValue(value) as string | string[] | {[key: string]: any};
  if (Array.isArray(unwrappedValue)) {
    for (let i = 0; i < unwrappedValue.length; i++) {
      keyValueArraySet(styleKeyValueArray, unwrappedValue[i], true);
    }
  } else if (typeof unwrappedValue === 'object') {
    for (const key in unwrappedValue) {
      if (unwrappedValue.hasOwnProperty(key)) {
        keyValueArraySet(styleKeyValueArray, key, unwrappedValue[key]);
      }
    }
  } else if (typeof unwrappedValue === 'string') {
    stringParser(styleKeyValueArray, unwrappedValue);
  } else {
    ngDevMode &&
        throwError('Unsupported styling type ' + typeof unwrappedValue + ': ' + unwrappedValue);
  }
  return styleKeyValueArray;
}

/**
 * Set a `value` for a `key`.
 *
 * See: `keyValueArraySet` for details
 *
 * @param keyValueArray KeyValueArray to add to.
 * @param key Style key to add.
 * @param value The value to set.
 */
export function styleKeyValueArraySet(keyValueArray: KeyValueArray<any>, key: string, value: any) {
  keyValueArraySet(keyValueArray, key, unwrapSafeValue(value));
}

/**
 * Class-binding-specific function for setting the `value` for a `key`.
 *
 * See: `keyValueArraySet` for details
 *
 * @param keyValueArray KeyValueArray to add to.
 * @param key Style key to add.
 * @param value The value to set.
 */
export function classKeyValueArraySet(keyValueArray: KeyValueArray<any>, key: unknown, value: any) {
  // We use `classList.add` to eventually add the CSS classes to the DOM node. Any value passed into
  // `add` is stringified and added to the `class` attribute, e.g. even null, undefined or numbers
  // will be added. Stringify the key here so that our internal data structure matches the value in
  // the DOM. The only exceptions are empty strings and strings that contain spaces for which
  // the browser throws an error. We ignore such values, because the error is somewhat cryptic.
  const stringKey = String(key);
  if (stringKey !== '' && !stringKey.includes(' ')) {
    keyValueArraySet(keyValueArray, stringKey, value);
  }
}

/**
 * Update map based styling.
 *
 * Map based styling could be anything which contains more than one binding. For example `string`,
 * or object literal. Dealing with all of these types would complicate the logic so
 * instead this function expects that the complex input is first converted into normalized
 * `KeyValueArray`. The advantage of normalization is that we get the values sorted, which makes it
 * very cheap to compute deltas between the previous and current value.
 *
 * @param tView Associated `TView.data` contains the linked list of binding priorities.
 * @param tNode `TNode` where the binding is located.
 * @param lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param renderer Renderer to use if any updates.
 * @param oldKeyValueArray Previous value represented as `KeyValueArray`
 * @param newKeyValueArray Current value represented as `KeyValueArray`
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStylingMap(
    tView: TView, tNode: TNode, lView: LView, renderer: Renderer,
    oldKeyValueArray: KeyValueArray<any>, newKeyValueArray: KeyValueArray<any>,
    isClassBased: boolean, bindingIndex: number) {
  if (oldKeyValueArray as KeyValueArray<any>| NO_CHANGE === NO_CHANGE) {
    // On first execution the oldKeyValueArray is NO_CHANGE => treat it as empty KeyValueArray.
    oldKeyValueArray = EMPTY_ARRAY as any;
  }
  let oldIndex = 0;
  let newIndex = 0;
  let oldKey: string|null = 0 < oldKeyValueArray.length ? oldKeyValueArray[0] : null;
  let newKey: string|null = 0 < newKeyValueArray.length ? newKeyValueArray[0] : null;
  while (oldKey !== null || newKey !== null) {
    ngDevMode && assertLessThan(oldIndex, 999, 'Are we stuck in infinite loop?');
    ngDevMode && assertLessThan(newIndex, 999, 'Are we stuck in infinite loop?');
    const oldValue =
        oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex + 1] : undefined;
    const newValue =
        newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex + 1] : undefined;
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
    } else if (newKey === null || oldKey !== null && oldKey < newKey!) {
      // DELETE: oldKey key is missing or we did not find the oldKey in the newValue
      // (because the keyValueArray is sorted and `newKey` is found later alphabetically).
      // `"background" < "color"` so we need to delete `"background"` because it is not found in the
      // new array.
      oldIndex += 2;
      setKey = oldKey;
    } else {
      // CREATE: newKey's is earlier alphabetically than oldKey's (or no oldKey) => we have new key.
      // `"color" > "background"` so we need to add `color` because it is in new array but not in
      // old array.
      ngDevMode && assertDefined(newKey, 'Expecting to have a valid key');
      newIndex += 2;
      setKey = newKey;
      setValue = newValue;
    }
    if (setKey !== null) {
      updateStyling(tView, tNode, lView, renderer, setKey, setValue, isClassBased, bindingIndex);
    }
    oldKey = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex] : null;
    newKey = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex] : null;
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
 * @param value Either style value for `prop` or `true`/`false` if `prop` is class.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStyling(
    tView: TView, tNode: TNode, lView: LView, renderer: Renderer, prop: string,
    value: string|undefined|null|boolean, isClassBased: boolean, bindingIndex: number) {
  if (!(tNode.type & TNodeType.AnyRNode)) {
    // It is possible to have styling on non-elements (such as ng-container).
    // This is rare, but it does happen. In such a case, just ignore the binding.
    return;
  }
  const tData = tView.data;
  const tRange = tData[bindingIndex + 1] as TStylingRange;
  const higherPriorityValue = getTStylingRangeNextDuplicate(tRange) ?
      findStylingValue(tData, tNode, lView, prop, getTStylingRangeNext(tRange), isClassBased) :
      undefined;
  if (!isStylingValuePresent(higherPriorityValue)) {
    // We don't have a next duplicate, or we did not find a duplicate value.
    if (!isStylingValuePresent(value)) {
      // We should delete current value or restore to lower priority value.
      if (getTStylingRangePrevDuplicate(tRange)) {
        // We have a possible prev duplicate, let's retrieve it.
        value = findStylingValue(tData, null, lView, prop, bindingIndex, isClassBased);
      }
    }
    const rNode = getNativeByIndex(getSelectedIndex(), lView) as RElement;
    applyStyling(renderer, isClassBased, rNode, prop, value);
  }
}

/**
 * Search for styling value with higher priority which is overwriting current value, or a
 * value of lower priority to which we should fall back if the value is `undefined`.
 *
 * When value is being applied at a location, related values need to be consulted.
 * - If there is a higher priority binding, we should be using that one instead.
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp1`
 *   requires that we check `exp2` to see if it is set to value other than `undefined`.
 * - If there is a lower priority binding and we are changing to `undefined`
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp2` to
 *   `undefined` requires that we check `exp1` (and static values) and use that as new value.
 *
 * NOTE: The styling stores two values.
 * 1. The raw value which came from the application is stored at `index + 0` location. (This value
 *    is used for dirty checking).
 * 2. The normalized value is stored at `index + 1`.
 *
 * @param tData `TData` used for traversing the priority.
 * @param tNode `TNode` to use for resolving static styling. Also controls search direction.
 *   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
 *      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
 *   - `null` search prev and go all the way to end. Return last value where
 *     `isStylingValuePresent(value)` is true.
 * @param lView `LView` used for retrieving the actual values.
 * @param prop Property which we are interested in.
 * @param index Starting index in the linked list of styling bindings where the search should start.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function findStylingValue(
    tData: TData, tNode: TNode|null, lView: LView, prop: string, index: number,
    isClassBased: boolean): any {
  // `TNode` to use for resolving static styling. Also controls search direction.
  //   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
  //      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
  //   - `null` search prev and go all the way to end. Return last value where
  //     `isStylingValuePresent(value)` is true.
  const isPrevDirection = tNode === null;
  let value: any = undefined;
  while (index > 0) {
    const rawKey = tData[index] as TStylingKey;
    const containsStatics = Array.isArray(rawKey);
    // Unwrap the key if we contain static values.
    const key = containsStatics ? (rawKey as string[])[1] : rawKey;
    const isStylingMap = key === null;
    let valueAtLViewIndex = lView[index + 1];
    if (valueAtLViewIndex === NO_CHANGE) {
      // In firstUpdatePass the styling instructions create a linked list of styling.
      // On subsequent passes it is possible for a styling instruction to try to read a binding
      // which
      // has not yet executed. In that case we will find `NO_CHANGE` and we should assume that
      // we have `undefined` (or empty array in case of styling-map instruction) instead. This
      // allows the resolution to apply the value (which may later be overwritten when the
      // binding actually executes.)
      valueAtLViewIndex = isStylingMap ? EMPTY_ARRAY : undefined;
    }
    let currentValue = isStylingMap ? keyValueArrayGet(valueAtLViewIndex, prop) :
                                      (key === prop ? valueAtLViewIndex : undefined);
    if (containsStatics && !isStylingValuePresent(currentValue)) {
      currentValue = keyValueArrayGet(rawKey as KeyValueArray<any>, prop);
    }
    if (isStylingValuePresent(currentValue)) {
      value = currentValue;
      if (isPrevDirection) {
        return value;
      }
    }
    const tRange = tData[index + 1] as TStylingRange;
    index = isPrevDirection ? getTStylingRangePrev(tRange) : getTStylingRangeNext(tRange);
  }
  if (tNode !== null) {
    // in case where we are going in next direction AND we did not find anything, we need to
    // consult residual styling
    let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
    if (residual != null /** OR residual !=== undefined */) {
      value = keyValueArrayGet(residual!, prop);
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
 * Normalizes and/or adds a suffix to the value.
 *
 * If value is `null`/`undefined` no suffix is added
 * @param value
 * @param suffix
 */
function normalizeSuffix(value: any, suffix: string|undefined|null): string|null|undefined|boolean {
  if (value == null || value === '') {
    // do nothing
    // Do not add the suffix if the value is going to be empty.
    // As it produce invalid CSS, which the browsers will automatically omit but Domino will not.
    // Example: `"left": "px;"` instead of `"left": ""`.
  } else if (typeof suffix === 'string') {
    value = value + suffix;
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
