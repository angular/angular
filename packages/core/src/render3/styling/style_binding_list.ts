/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {unwrapSafeValue} from '../../sanitization/bypass';
import {stylePropNeedsSanitization, ɵɵsanitizeStyle} from '../../sanitization/sanitization';
import {assertEqual, assertString, throwError} from '../../util/assert';
import {CharCode} from '../../util/char_code';
import {concatStringsWithSpace} from '../../util/stringify';
import {assertFirstUpdatePass} from '../assert';
import {TNode} from '../interfaces/node';
import {SanitizerFn} from '../interfaces/sanitization';
import {TStylingKey, TStylingMapKey, TStylingRange, getTStylingRangeNext, getTStylingRangePrev, getTStylingRangePrevDuplicate, setTStylingRangeNext, setTStylingRangeNextDuplicate, setTStylingRangePrev, setTStylingRangePrevDuplicate, toTStylingRange} from '../interfaces/styling';
import {LView, TData, TVIEW} from '../interfaces/view';
import {getLView} from '../state';
import {NO_CHANGE} from '../tokens';
import {splitClassList, toggleClass} from './class_differ';
import {StyleChangesMap, parseKeyValue, removeStyle} from './style_differ';
import {getLastParsedKey, parseClassName, parseClassNameNext, parseStyle, parseStyleNext} from './styling_parser';



/**
 * NOTE: The word `styling` is used interchangeably as style or class styling.
 *
 * This file contains code to link styling instructions together so that they can be replayed in
 * priority order. The file exists because Ivy styling instruction execution order does not match
 * that of the priority order. The purpose of this code is to create a linked list so that the
 * instructions can be traversed in priority order when computing the styles.
 *
 * Assume we are dealing with the following code:
 * ```
 * @Component({
 *   template: `
 *     <my-cmp [style]=" {color: '#001'} "
 *             [style.color]=" #002 "
 *             dir-style-color-1
 *             dir-style-color-2> `
 * })
 * class ExampleComponent {
 *   static ngComp = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#001'});
 *     ɵɵstyleProp('color', '#002');
 *     ...
 *   }
 * }
 *
 * @Directive({
 *   selector: `[dir-style-color-1]',
 * })
 * class Style1Directive {
 *   @HostBinding('style') style = {color: '#005'};
 *   @HostBinding('style.color') color = '#006';
 *
 *   static ngDir = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#005'});
 *     ɵɵstyleProp('color', '#006');
 *     ...
 *   }
 * }
 *
 * @Directive({
 *   selector: `[dir-style-color-2]',
 * })
 * class Style2Directive {
 *   @HostBinding('style') style = {color: '#007'};
 *   @HostBinding('style.color') color = '#008';
 *
 *   static ngDir = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#007'});
 *     ɵɵstyleProp('color', '#008');
 *     ...
 *   }
 * }
 *
 * @Directive({
 *   selector: `my-cmp',
 * })
 * class MyComponent {
 *   @HostBinding('style') style = {color: '#003'};
 *   @HostBinding('style.color') color = '#004';
 *
 *   static ngComp = ... {
 *     ...
 *     // Compiler ensures that `ɵɵstyleProp` is after `ɵɵstyleMap`
 *     ɵɵstyleMap({color: '#003'});
 *     ɵɵstyleProp('color', '#004');
 *     ...
 *   }
 * }
 * ```
 *
 * The Order of instruction execution is:
 *
 * NOTE: the comment binding location is for illustrative purposes only.
 *
 * ```
 * // Template: (ExampleComponent)
 *     ɵɵstyleMap({color: '#001'});   // Binding index: 10
 *     ɵɵstyleProp('color', '#002');  // Binding index: 12
 * // MyComponent
 *     ɵɵstyleMap({color: '#003'});   // Binding index: 20
 *     ɵɵstyleProp('color', '#004');  // Binding index: 22
 * // Style1Directive
 *     ɵɵstyleMap({color: '#005'});   // Binding index: 24
 *     ɵɵstyleProp('color', '#006');  // Binding index: 26
 * // Style2Directive
 *     ɵɵstyleMap({color: '#007'});   // Binding index: 28
 *     ɵɵstyleProp('color', '#008');  // Binding index: 30
 * ```
 *
 * The correct priority order of concatenation is:
 *
 * ```
 * // MyComponent
 *     ɵɵstyleMap({color: '#003'});   // Binding index: 20
 *     ɵɵstyleProp('color', '#004');  // Binding index: 22
 * // Style1Directive
 *     ɵɵstyleMap({color: '#005'});   // Binding index: 24
 *     ɵɵstyleProp('color', '#006');  // Binding index: 26
 * // Style2Directive
 *     ɵɵstyleMap({color: '#007'});   // Binding index: 28
 *     ɵɵstyleProp('color', '#008');  // Binding index: 30
 * // Template: (ExampleComponent)
 *     ɵɵstyleMap({color: '#001'});   // Binding index: 10
 *     ɵɵstyleProp('color', '#002');  // Binding index: 12
 * ```
 *
 * What color should be rendered?
 *
 * Once the items are correctly sorted in the list, the answer is simply the last item in the
 * concatenation list which is `#002`.
 *
 * To do so we keep a linked list of all of the bindings which pertain to this element.
 * Notice that the bindings are inserted in the order of execution, but the `TView.data` allows
 * us to traverse them in the order of priority.
 *
 * |Idx|`TView.data`|`LView`          | Notes
 * |---|------------|-----------------|--------------
 * |...|            |                 |
 * |10 |`null`      |`{color: '#001'}`| `ɵɵstyleMap('color', {color: '#001'})`
 * |11 |`30 | 12`   | ...             |
 * |12 |`color`     |`'#002'`         | `ɵɵstyleProp('color', '#002')`
 * |13 |`10 | 0`    | ...             |
 * |...|            |                 |
 * |20 |`null`      |`{color: '#003'}`| `ɵɵstyleMap('color', {color: '#003'})`
 * |21 |`0 | 22`    | ...             |
 * |22 |`color`     |`'#004'`         | `ɵɵstyleProp('color', '#004')`
 * |23 |`20 | 24`   | ...             |
 * |24 |`null`      |`{color: '#005'}`| `ɵɵstyleMap('color', {color: '#005'})`
 * |25 |`22 | 26`   | ...             |
 * |26 |`color`     |`'#006'`         | `ɵɵstyleProp('color', '#006')`
 * |27 |`24 | 28`   | ...             |
 * |28 |`null`      |`{color: '#007'}`| `ɵɵstyleMap('color', {color: '#007'})`
 * |29 |`26 | 30`   | ...             |
 * |30 |`color`     |`'#008'`         | `ɵɵstyleProp('color', '#008')`
 * |31 |`28 | 10`   | ...             |
 *
 * The above data structure allows us to re-concatenate the styling no matter which data binding
 * changes.
 *
 * NOTE: in addition to keeping track of next/previous index the `TView.data` also stores prev/next
 * duplicate bit. The duplicate bit if true says there either is a binding with the same name or
 * there is a map (which may contain the name). This information is useful in knowing if other
 * styles with higher priority need to be searched for overwrites.
 *
 * NOTE: See `should support example in 'tnode_linked_list.ts' documentation` in
 * `tnode_linked_list_spec.ts` for working example.
 */


/**
 * Insert new `tStyleValue` at `TData` and link existing style bindings such that we maintain linked
 * list of styles and compute the duplicate flag.
 *
 * Note: this function is executed during `firstUpdatePass` only to populate the `TView.data`.
 *
 * The function works by keeping track of `tStylingRange` which contains two pointers pointing to
 * the head/tail of the template portion of the styles.
 *  - if `isHost === false` (we are template) then insertion is at tail of `TStylingRange`
 *  - if `isHost === true` (we are host binding) then insertion is at head of `TStylingRange`
 *
 * @param tData The `TData` to insert into.
 * @param tNode `TNode` associated with the styling element.
 * @param tStylingKey See `TStylingKey`.
 * @param index location of where `tStyleValue` should be stored (and linked into list.)
 * @param isHostBinding `true` if the insertion is for a `hostBinding`. (insertion is in front of
 *               template.)
 * @param isClassBinding True if the associated `tStylingKey` as a `class` styling.
 *                       `tNode.classBindings` should be used (or `tNode.styleBindings` otherwise.)
 */
export function insertTStylingBinding(
    tData: TData, tNode: TNode, tStylingKey: TStylingKey, index: number, isHostBinding: boolean,
    isClassBinding: boolean): void {
  ngDevMode && assertFirstUpdatePass(getLView()[TVIEW]);
  let tBindings = isClassBinding ? tNode.classBindings : tNode.styleBindings;
  let tmplHead = getTStylingRangePrev(tBindings);
  let tmplTail = getTStylingRangeNext(tBindings);

  tData[index] = tStylingKey;
  if (isHostBinding) {
    // We are inserting host bindings

    // If we don't have template bindings then `tail` is 0.
    const hasTemplateBindings = tmplTail !== 0;
    // This is important to know because that means that the `head` can't point to the first
    // template bindings (there are none.) Instead the head points to the tail of the template.
    if (hasTemplateBindings) {
      // template head's "prev" will point to last host binding or to 0 if no host bindings yet
      const previousNode = getTStylingRangePrev(tData[tmplHead + 1] as TStylingRange);
      tData[index + 1] = toTStylingRange(previousNode, tmplHead);
      // if a host binding has already been registered, we need to update the next of that host
      // binding to point to this one
      if (previousNode !== 0) {
        // We need to update the template-tail value to point to us.
        tData[previousNode + 1] =
            setTStylingRangeNext(tData[previousNode + 1] as TStylingRange, index);
      }
      // The "previous" of the template binding head should point to this host binding
      tData[tmplHead + 1] = setTStylingRangePrev(tData[tmplHead + 1] as TStylingRange, index);
    } else {
      tData[index + 1] = toTStylingRange(tmplHead, 0);
      // if a host binding has already been registered, we need to update the next of that host
      // binding to point to this one
      if (tmplHead !== 0) {
        // We need to update the template-tail value to point to us.
        tData[tmplHead + 1] = setTStylingRangeNext(tData[tmplHead + 1] as TStylingRange, index);
      }
      // if we don't have template, the head points to template-tail, and needs to be advanced.
      tmplHead = index;
    }
  } else {
    // We are inserting in template section.
    // We need to set this binding's "previous" to the current template tail
    tData[index + 1] = toTStylingRange(tmplTail, 0);
    ngDevMode && assertEqual(
                     tmplHead !== 0 && tmplTail === 0, false,
                     'Adding template bindings after hostBindings is not allowed.');
    if (tmplHead === 0) {
      tmplHead = index;
    } else {
      // We need to update the previous value "next" to point to this binding
      tData[tmplTail + 1] = setTStylingRangeNext(tData[tmplTail + 1] as TStylingRange, index);
    }
    tmplTail = index;
  }

  // Now we need to update / compute the duplicates.
  // Starting with our location search towards head (least priority)
  markDuplicates(
      tData, tStylingKey, index, (isClassBinding ? tNode.classes : tNode.styles) || '', true,
      isClassBinding);
  markDuplicates(tData, tStylingKey, index, '', false, isClassBinding);

  tBindings = toTStylingRange(tmplHead, tmplTail);
  if (isClassBinding) {
    tNode.classBindings = tBindings;
  } else {
    tNode.styleBindings = tBindings;
  }
}

/**
 * Marks `TStyleValue`s as duplicates if another style binding in the list has the same
 * `TStyleValue`.
 *
 * NOTE: this function is intended to be called twice once with `isPrevDir` set to `true` and once
 * with it set to `false` to search both the previous as well as next items in the list.
 *
 * No duplicate case
 * ```
 *   [style.color]
 *   [style.width.px] <<- index
 *   [style.height.px]
 * ```
 *
 * In the above case adding `[style.width.px]` to the existing `[style.color]` produces no
 * duplicates because `width` is not found in any other part of the linked list.
 *
 * Duplicate case
 * ```
 *   [style.color]
 *   [style.width.em]
 *   [style.width.px] <<- index
 * ```
 * In the above case adding `[style.width.px]` will produce a duplicate with `[style.width.em]`
 * because `width` is found in the chain.
 *
 * Map case 1
 * ```
 *   [style.width.px]
 *   [style.color]
 *   [style]  <<- index
 * ```
 * In the above case adding `[style]` will produce a duplicate with any other bindings because
 * `[style]` is a Map and as such is fully dynamic and could produce `color` or `width`.
 *
 * Map case 2
 * ```
 *   [style]
 *   [style.width.px]
 *   [style.color]  <<- index
 * ```
 * In the above case adding `[style.color]` will produce a duplicate because there is already a
 * `[style]` binding which is a Map and as such is fully dynamic and could produce `color` or
 * `width`.
 *
 * NOTE: Once `[style]` (Map) is added into the system all things are mapped as duplicates.
 * NOTE: We use `style` as example, but same logic is applied to `class`es as well.
 *
 * @param tData
 * @param tStylingKey
 * @param index
 * @param staticValues
 * @param isPrevDir
 */
function markDuplicates(
    tData: TData, tStylingKey: TStylingKey, index: number, staticValues: string, isPrevDir: boolean,
    isClassBinding: boolean) {
  const tStylingAtIndex = tData[index + 1] as TStylingRange;
  const key: string|null = typeof tStylingKey === 'object' ? tStylingKey.key : tStylingKey;
  const isMap = key === null;
  let cursor =
      isPrevDir ? getTStylingRangePrev(tStylingAtIndex) : getTStylingRangeNext(tStylingAtIndex);
  let foundDuplicate = false;
  // We keep iterating as long as we have a cursor
  // AND either: We found what we are looking for, or we are a map in which case we have to
  // continue searching even after we find what we were looking for since we are a wild card
  // and everything needs to be flipped to duplicate.
  while (cursor !== 0 && (foundDuplicate === false || isMap)) {
    const tStylingValueAtCursor = tData[cursor] as TStylingKey;
    const tStyleRangeAtCursor = tData[cursor + 1] as TStylingRange;
    const keyAtCursor = typeof tStylingValueAtCursor === 'object' ? tStylingValueAtCursor.key :
                                                                    tStylingValueAtCursor;
    if (keyAtCursor === null || key == null || keyAtCursor === key) {
      foundDuplicate = true;
      tData[cursor + 1] = isPrevDir ? setTStylingRangeNextDuplicate(tStyleRangeAtCursor) :
                                      setTStylingRangePrevDuplicate(tStyleRangeAtCursor);
    }
    cursor = isPrevDir ? getTStylingRangePrev(tStyleRangeAtCursor) :
                         getTStylingRangeNext(tStyleRangeAtCursor);
  }
  // We also need to process the static values.
  if (staticValues !== '' &&  // If we have static values to search
      !foundDuplicate         // If we have duplicate don't bother since we are already marked as
                              // duplicate
      ) {
    if (isMap) {
      // if we are a Map (and we have statics) we must assume duplicate
      foundDuplicate = true;
    } else if (staticValues != null) {
      // If we found non-map than we iterate over its keys to determine if any of them match ours
      // If we find a match than we mark it as duplicate.
      for (let i = isClassBinding ? parseClassName(staticValues) : parseStyle(staticValues);  //
           i >= 0;                                                                            //
           i = isClassBinding ? parseClassNameNext(staticValues, i) :
                                parseStyleNext(staticValues, i)) {
        if (getLastParsedKey(staticValues) === key) {
          foundDuplicate = true;
          break;
        }
      }
    }
  }
  if (foundDuplicate) {
    // if we found a duplicate, than mark ourselves.
    tData[index + 1] = isPrevDir ? setTStylingRangePrevDuplicate(tStylingAtIndex) :
                                   setTStylingRangeNextDuplicate(tStylingAtIndex);
  }
}

/**
 * Computes the new styling value starting at `index` styling binding.
 *
 * @param tData `TData` containing the styling binding linked list.
 *              - `TData[index]` contains the binding name.
 *              - `TData[index + 1]` contains the `TStylingRange` a linked list of other bindings.
 * @param tNode `TNode` containing the initial styling values.
 * @param lView `LView` containing the styling values.
 *              - `LView[index]` contains the binding value.
 *              - `LView[index + 1]` contains the concatenated value up to this point.
 * @param index the location in `TData`/`LView` where the styling search should start.
 * @param isClassBinding `true` if binding to `className`; `false` when binding to `style`.
 */
export function flushStyleBinding(
    tData: TData, tNode: TNode, lView: LView, index: number, isClassBinding: boolean): string {
  const tStylingRangeAtIndex = tData[index + 1] as TStylingRange;
  // When styling changes we don't have to start at the begging. Instead we start at the change
  // value and look up the previous concatenation as a starting point going forward.
  const lastUnchangedValueIndex = getTStylingRangePrev(tStylingRangeAtIndex);
  let text = lastUnchangedValueIndex === 0 ?
      (isClassBinding ? tNode.classes : tNode.styles) :
      lView[lastUnchangedValueIndex + 1] as string | NO_CHANGE;
  if (text === null || text === NO_CHANGE) text = '';
  ngDevMode && assertString(text, 'Last unchanged value value should be a string');
  let cursor = index;
  while (cursor !== 0) {
    const value = lView[cursor];
    const key = tData[cursor] as TStylingKey;
    const stylingRange = tData[cursor + 1] as TStylingRange;
    lView[cursor + 1] = text = appendStyling(
        text as string, key, value, null, getTStylingRangePrevDuplicate(stylingRange),
        isClassBinding);
    cursor = getTStylingRangeNext(stylingRange);
  }
  return text as string;
}


/**
 * Append new styling to the currently concatenated styling text.
 *
 * This function concatenates the existing `className`/`cssText` text with the binding value.
 *
 * @param text Text to concatenate to.
 * @param stylingKey `TStylingKey` holding the key (className or style property name).
 * @param value The value for the key.
 *         - `isClassBinding === true`
 *              - `boolean` if `true` then add the key to the class list string.
 *              - `Array` add each string value to the class list string.
 *              - `Object` add object key to the class list string if the key value is truthy.
 *         - `isClassBinding === false`
 *              - `Array` Not supported.
 *              - `Object` add object key/value to the styles.
 * @param sanitizer Optional sanitizer to use. If `null` the `stylingKey` sanitizer will be used.
 *        This is provided so that `ɵɵstyleMap()`/`ɵɵclassMap()` can recursively call
 *        `appendStyling` without having ta package the sanitizer into `TStylingSanitizationKey`.
 * @param hasPreviousDuplicate determines if there is a chance of duplicate.
 *         - `true` the existing `text` should be searched for duplicates and if any found they
 *           should be removed.
 *         - `false` Fast path, just concatenate the strings.
 * @param isClassBinding Determines if the `text` is `className` or `cssText`.
 * @returns new styling string with the concatenated values.
 */
export function appendStyling(
    text: string, stylingKey: TStylingKey, value: any, sanitizer: SanitizerFn | null,
    hasPreviousDuplicate: boolean, isClassBinding: boolean): string {
  let key: string;
  let suffixOrSanitizer: string|SanitizerFn|undefined|null = sanitizer;
  if (typeof stylingKey === 'object') {
    if (stylingKey.key === null) {
      return value != null ? stylingKey.extra(text, value, hasPreviousDuplicate) : text;
    } else {
      suffixOrSanitizer = stylingKey.extra;
      key = stylingKey.key;
    }
  } else {
    key = stylingKey;
  }
  if (isClassBinding) {
    ngDevMode && assertEqual(typeof stylingKey === 'string', true, 'Expecting key to be string');
    if (hasPreviousDuplicate) {
      text = toggleClass(text, stylingKey as string, !!value);
    } else if (value) {
      text = concatStringsWithSpace(text, stylingKey as string);
    }
  } else {
    if (value === undefined) {
      // If undefined than treat it as if we have no value. This means that we will fallback to the
      // previous value (if any).
      // `<div style="width: 10px" [style.width]="{width: undefined}">` => `width: 10px`.
      return text;
    }
    if (hasPreviousDuplicate) {
      text = removeStyle(text, key);
    }
    if (value !== false && value !== null) {
      // `<div style="width: 10px" [style.width]="{width: null}">` => ``. (remove it)
      // `<div style="width: 10px" [style.width]="{width: false}">` => ``. (remove it)
      value = typeof suffixOrSanitizer === 'function' ? suffixOrSanitizer(value) :
                                                        unwrapSafeValue(value);
      const keyValue = key + ': ' +
          (typeof suffixOrSanitizer === 'string' ? value + suffixOrSanitizer : value) + ';';
      text = concatStringsWithSpace(text, keyValue);
    }
  }
  return text;
}

/**
 * `ɵɵclassMap()` inserts `CLASS_MAP_STYLING_KEY` as a key to the `insertTStylingBinding()`.
 *
 * The purpose of this key is to add class map abilities to the concatenation in a tree shakable
 * way. If `ɵɵclassMap()` is not referenced than `CLASS_MAP_STYLING_KEY` will become eligible for
 * tree shaking.
 *
 * This key supports: `strings`, `object` (as Map) and `Array`. In each case it is necessary to
 * break the classes into parts and concatenate the parts into the `text`. The concatenation needs
 * to be done in parts as each key is individually subject to overwrites.
 */
export const CLASS_MAP_STYLING_KEY: TStylingMapKey = {
  key: null,
  extra: (text: string, value: any, hasPreviousDuplicate: boolean): string => {
    if (Array.isArray(value)) {
      // We support Arrays
      for (let i = 0; i < value.length; i++) {
        text = appendStyling(text, value[i], true, null, hasPreviousDuplicate, true);
      }
    } else if (typeof value === 'object') {
      // We support maps
      for (let key in value) {
        if (key !== '') {
          // We have to guard for `""` empty string as key since it will break search and replace.
          text = appendStyling(text, key, value[key], null, hasPreviousDuplicate, true);
        }
      }
    } else if (typeof value === 'string') {
      // We support strings
      if (hasPreviousDuplicate) {
        // We need to parse and process it.
        const changes = new Map<string, boolean|null>();
        splitClassList(value, changes, false);
        changes.forEach((_, key) => text = appendStyling(text, key, true, null, true, true));
      } else {
        // No duplicates, just append it.
        text = concatStringsWithSpace(text, value);
      }
    } else {
      // All other cases are not supported.
      ngDevMode && throwError('Unsupported value for class binding: ' + value);
    }
    return text;
  }
};

/**
 * `ɵɵstyleMap()` inserts `STYLE_MAP_STYLING_KEY` as a key to the `insertTStylingBinding()`.
 *
 * The purpose of this key is to add style map abilities to the concatenation in a tree shakable
 * way. If `ɵɵstyleMap()` is not referenced than `STYLE_MAP_STYLING_KEY` will become eligible for
 * tree shaking. (`STYLE_MAP_STYLING_KEY` also pulls in the sanitizer as `ɵɵstyleMap()` could have
 * a sanitizable property.)
 *
 * This key supports: `strings`, and `object` (as Map). In each case it is necessary to
 * break the style into parts and concatenate the parts into the `text`. The concatenation needs
 * to be done in parts as each key is individually subject to overwrites.
 */
export const STYLE_MAP_STYLING_KEY: TStylingMapKey = {
  key: null,
  extra: (text: string, value: any, hasPreviousDuplicate: boolean): string => {
    if (Array.isArray(value)) {
      // We don't support Arrays
      ngDevMode && throwError('Style bindings do not support array bindings: ' + value);
    } else if (typeof value === 'object') {
      // We support maps
      for (let key in value) {
        if (key !== '') {
          // We have to guard for `""` empty string as key since it will break search and replace.
          text = appendStyling(
              text, key, value[key], stylePropNeedsSanitization(key) ? ɵɵsanitizeStyle : null,
              hasPreviousDuplicate, false);
        }
      }
    } else if (typeof value === 'string') {
      // We support strings
      if (hasPreviousDuplicate) {
        // We need to parse and process it.
        const changes: StyleChangesMap =
            new Map<string, {old: string | null, new: string | null}>();
        parseKeyValue(value, changes, false);
        changes.forEach(
            (value, key) => text = appendStyling(
                text, key, value.old, stylePropNeedsSanitization(key) ? ɵɵsanitizeStyle : null,
                true, false));
      } else {
        // No duplicates, just append it.
        if (value.charCodeAt(value.length - 1) !== CharCode.SEMI_COLON) {
          value += ';';
        }
        text = concatStringsWithSpace(text, value);
      }
    } else {
      // All other cases are not supported.
      ngDevMode && throwError('Unsupported value for style binding: ' + value);
    }
    return text;
  }
};


/**
 * If we have `<div [class] my-dir>` such that `my-dir` has `@Input('class')`, the `my-dir` captures
 * the `[class]` binding, so that it no longer participates in the style bindings. For this case
 * we use `IGNORE_DO_TO_INPUT_SHADOW` so that `flushStyleBinding` ignores it.
 */
export const IGNORE_DUE_TO_INPUT_SHADOW: TStylingMapKey = {
  key: null,
  extra: (text: string, value: any, hasPreviousDuplicate: boolean): string => { return text;}
};