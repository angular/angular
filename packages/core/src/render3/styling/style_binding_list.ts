/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KeyValueArray, keyValueArrayIndexOf} from '../../util/array_utils';
import {assertEqual, assertIndexInRange, assertNotEqual} from '../../util/assert';
import {assertFirstUpdatePass} from '../assert';
import {TNode} from '../interfaces/node';
import {getTStylingRangeNext, getTStylingRangePrev, setTStylingRangeNext, setTStylingRangeNextDuplicate, setTStylingRangePrev, setTStylingRangePrevDuplicate, toTStylingRange, TStylingKey, TStylingKeyPrimitive, TStylingRange} from '../interfaces/styling';
import {TData} from '../interfaces/view';
import {getTView} from '../state';


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
let __unused_const_as_closure_does_not_like_standalone_comment_blocks__: undefined;

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
    tData: TData, tNode: TNode, tStylingKeyWithStatic: TStylingKey, index: number,
    isHostBinding: boolean, isClassBinding: boolean): void {
  ngDevMode && assertFirstUpdatePass(getTView());
  let tBindings = isClassBinding ? tNode.classBindings : tNode.styleBindings;
  let tmplHead = getTStylingRangePrev(tBindings);
  let tmplTail = getTStylingRangeNext(tBindings);

  tData[index] = tStylingKeyWithStatic;
  let isKeyDuplicateOfStatic = false;
  let tStylingKey: TStylingKeyPrimitive;
  if (Array.isArray(tStylingKeyWithStatic)) {
    // We are case when the `TStylingKey` contains static fields as well.
    const staticKeyValueArray = tStylingKeyWithStatic as KeyValueArray<any>;
    tStylingKey = staticKeyValueArray[1];  // unwrap.
    // We need to check if our key is present in the static so that we can mark it as duplicate.
    if (tStylingKey === null ||
        keyValueArrayIndexOf(staticKeyValueArray, tStylingKey as string) > 0) {
      // tStylingKey is present in the statics, need to mark it as duplicate.
      isKeyDuplicateOfStatic = true;
    }
  } else {
    tStylingKey = tStylingKeyWithStatic;
  }
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
    ngDevMode &&
        assertEqual(
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
  if (isKeyDuplicateOfStatic) {
    tData[index + 1] = setTStylingRangePrevDuplicate(tData[index + 1] as TStylingRange);
  }
  markDuplicates(tData, tStylingKey, index, true, isClassBinding);
  markDuplicates(tData, tStylingKey, index, false, isClassBinding);
  markDuplicateOfResidualStyling(tNode, tStylingKey, tData, index, isClassBinding);

  tBindings = toTStylingRange(tmplHead, tmplTail);
  if (isClassBinding) {
    tNode.classBindings = tBindings;
  } else {
    tNode.styleBindings = tBindings;
  }
}

/**
 * Look into the residual styling to see if the current `tStylingKey` is duplicate of residual.
 *
 * @param tNode `TNode` where the residual is stored.
 * @param tStylingKey `TStylingKey` to store.
 * @param tData `TData` associated with the current `LView`.
 * @param index location of where `tStyleValue` should be stored (and linked into list.)
 * @param isClassBinding True if the associated `tStylingKey` as a `class` styling.
 *                       `tNode.classBindings` should be used (or `tNode.styleBindings` otherwise.)
 */
function markDuplicateOfResidualStyling(
    tNode: TNode, tStylingKey: TStylingKey, tData: TData, index: number, isClassBinding: boolean) {
  const residual = isClassBinding ? tNode.residualClasses : tNode.residualStyles;
  if (residual != null /* or undefined */ && typeof tStylingKey == 'string' &&
      keyValueArrayIndexOf(residual, tStylingKey) >= 0) {
    // We have duplicate in the residual so mark ourselves as duplicate.
    tData[index + 1] = setTStylingRangeNextDuplicate(tData[index + 1] as TStylingRange);
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
 * @param tData `TData` where the linked list is stored.
 * @param tStylingKey `TStylingKeyPrimitive` which contains the value to compare to other keys in
 *        the linked list.
 * @param index Starting location in the linked list to search from
 * @param isPrevDir Direction.
 *        - `true` for previous (lower priority);
 *        - `false` for next (higher priority).
 */
function markDuplicates(
    tData: TData, tStylingKey: TStylingKeyPrimitive, index: number, isPrevDir: boolean,
    isClassBinding: boolean) {
  const tStylingAtIndex = tData[index + 1] as TStylingRange;
  const isMap = tStylingKey === null;
  let cursor =
      isPrevDir ? getTStylingRangePrev(tStylingAtIndex) : getTStylingRangeNext(tStylingAtIndex);
  let foundDuplicate = false;
  // We keep iterating as long as we have a cursor
  // AND either:
  // - we found what we are looking for, OR
  // - we are a map in which case we have to continue searching even after we find what we were
  //   looking for since we are a wild card and everything needs to be flipped to duplicate.
  while (cursor !== 0 && (foundDuplicate === false || isMap)) {
    ngDevMode && assertIndexInRange(tData, cursor);
    const tStylingValueAtCursor = tData[cursor] as TStylingKey;
    const tStyleRangeAtCursor = tData[cursor + 1] as TStylingRange;
    if (isStylingMatch(tStylingValueAtCursor, tStylingKey)) {
      foundDuplicate = true;
      tData[cursor + 1] = isPrevDir ? setTStylingRangeNextDuplicate(tStyleRangeAtCursor) :
                                      setTStylingRangePrevDuplicate(tStyleRangeAtCursor);
    }
    cursor = isPrevDir ? getTStylingRangePrev(tStyleRangeAtCursor) :
                         getTStylingRangeNext(tStyleRangeAtCursor);
  }
  if (foundDuplicate) {
    // if we found a duplicate, than mark ourselves.
    tData[index + 1] = isPrevDir ? setTStylingRangePrevDuplicate(tStylingAtIndex) :
                                   setTStylingRangeNextDuplicate(tStylingAtIndex);
  }
}

/**
 * Determines if two `TStylingKey`s are a match.
 *
 * When computing whether a binding contains a duplicate, we need to compare if the instruction
 * `TStylingKey` has a match.
 *
 * Here are examples of `TStylingKey`s which match given `tStylingKeyCursor` is:
 * - `color`
 *    - `color`    // Match another color
 *    - `null`     // That means that `tStylingKey` is a `classMap`/`styleMap` instruction
 *    - `['', 'color', 'other', true]` // wrapped `color` so match
 *    - `['', null, 'other', true]`       // wrapped `null` so match
 *    - `['', 'width', 'color', 'value']` // wrapped static value contains a match on `'color'`
 * - `null`       // `tStylingKeyCursor` always match as it is `classMap`/`styleMap` instruction
 *
 * @param tStylingKeyCursor
 * @param tStylingKey
 */
function isStylingMatch(tStylingKeyCursor: TStylingKey, tStylingKey: TStylingKeyPrimitive) {
  ngDevMode &&
      assertNotEqual(
          Array.isArray(tStylingKey), true, 'Expected that \'tStylingKey\' has been unwrapped');
  if (
      tStylingKeyCursor === null ||  // If the cursor is `null` it means that we have map at that
                                     // location so we must assume that we have a match.
      tStylingKey == null ||  // If `tStylingKey` is `null` then it is a map therefor assume that it
                              // contains a match.
      (Array.isArray(tStylingKeyCursor) ? tStylingKeyCursor[1] : tStylingKeyCursor) ===
          tStylingKey  // If the keys match explicitly than we are a match.
  ) {
    return true;
  } else if (Array.isArray(tStylingKeyCursor) && typeof tStylingKey === 'string') {
    // if we did not find a match, but `tStylingKeyCursor` is `KeyValueArray` that means cursor has
    // statics and we need to check those as well.
    return keyValueArrayIndexOf(tStylingKeyCursor, tStylingKey) >=
        0;  // see if we are matching the key
  }
  return false;
}
