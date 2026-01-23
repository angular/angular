/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyValueArray} from '../../util/array_utils';
import {assertNumber, assertNumberInRange} from '../../util/assert';

/**
 * Value stored in the `TData` which is needed to re-concatenate the styling.
 *
 * See: `TStylingKeyPrimitive` and `TStylingStatic`
 */
export type TStylingKey = TStylingKeyPrimitive | TStylingStatic;

/**
 * The primitive portion (`TStylingStatic` removed) of the value stored in the `TData` which is
 * needed to re-concatenate the styling.
 *
 * - `string`: Stores the property name. Used with `ɵɵstyleProp`/`ɵɵclassProp` instruction.
 * - `null`: Represents map, so there is no name. Used with `ɵɵstyleMap`/`ɵɵclassMap`.
 * - `false`: Represents an ignore case. This happens when `ɵɵstyleProp`/`ɵɵclassProp` instruction
 *   is combined with directive which shadows its input `@Input('class')`. That way the binding
 *   should not participate in the styling resolution.
 */
export type TStylingKeyPrimitive = string | null | false;

/**
 * Store the static values for the styling binding.
 *
 * The `TStylingStatic` is just `KeyValueArray` where key `""` (stored at location 0) contains the
 * `TStylingKey` (stored at location 1). In other words this wraps the `TStylingKey` such that the
 * `""` contains the wrapped value.
 *
 * When instructions are resolving styling they may need to look forward or backwards in the linked
 * list to resolve the value. For this reason we have to make sure that he linked list also contains
 * the static values. However the list only has space for one item per styling instruction. For this
 * reason we store the static values here as part of the `TStylingKey`. This means that the
 * resolution function when looking for a value needs to first look at the binding value, and than
 * at `TStylingKey` (if it exists).
 *
 * Imagine we have:
 *
 * ```angular-ts
 * <div class="TEMPLATE" my-dir>
 *
 * @Directive({
 *   host: {
 *     class: 'DIR',
 *     '[class.dynamic]': 'exp' // ɵɵclassProp('dynamic', ctx.exp);
 *   }
 * })
 * ```
 *
 * In the above case the linked list will contain one item:
 *
 * ```ts
 *   // assume binding location: 10 for `ɵɵclassProp('dynamic', ctx.exp);`
 *   tData[10] = <TStylingStatic>[
 *     '': 'dynamic', // This is the wrapped value of `TStylingKey`
 *     'DIR': true,   // This is the default static value of directive binding.
 *   ];
 *   tData[10 + 1] = 0; // We don't have prev/next.
 *
 *   lView[10] = undefined;     // assume `ctx.exp` is `undefined`
 *   lView[10 + 1] = undefined; // Just normalized `lView[10]`
 * ```
 *
 * So when the function is resolving styling value, it first needs to look into the linked list
 * (there is none) and than into the static `TStylingStatic` too see if there is a default value for
 * `dynamic` (there is not). Therefore it is safe to remove it.
 *
 * If setting `true` case:
 * ```ts
 *   lView[10] = true;     // assume `ctx.exp` is `true`
 *   lView[10 + 1] = true; // Just normalized `lView[10]`
 * ```
 * So when the function is resolving styling value, it first needs to look into the linked list
 * (there is none) and than into `TNode.residualClass` (TNode.residualStyle) which contains
 * ```ts
 *   tNode.residualClass = [
 *     'TEMPLATE': true,
 *   ];
 * ```
 *
 * This means that it is safe to add class.
 */
export interface TStylingStatic extends KeyValueArray<any> {}

/**
 * This is a branded number which contains previous and next index.
 *
 * When we come across styling instructions we need to store the `TStylingKey` in the correct
 * order so that we can re-concatenate the styling value in the desired priority.
 *
 * The insertion can happen either at the:
 * - end of template as in the case of coming across additional styling instruction in the template
 * - in front of the template in the case of coming across additional instruction in the
 *   `hostBindings`.
 *
 * We use `TStylingRange` to store the previous and next index into the `TData` where the template
 * bindings can be found.
 *
 * - bit 0 is used to mark that the previous index has a duplicate for current value.
 * - bit 1 is used to mark that the next index has a duplicate for the current value.
 * - bits 2-16 are used to encode the next/tail of the template.
 * - bits 17-32 are used to encode the previous/head of template.
 *
 * NODE: *duplicate* false implies that it is statically known that this binding will not collide
 * with other bindings and therefore there is no need to check other bindings. For example the
 * bindings in `<div [style.color]="exp" [style.width]="exp">` will never collide and will have
 * their bits set accordingly. Previous duplicate means that we may need to check previous if the
 * current binding is `null`. Next duplicate means that we may need to check next bindings if the
 * current binding is not `null`.
 *
 * NOTE: `0` has special significance and represents `null` as in no additional pointer.
 */
export type TStylingRange = number & {
  __brand__: 'TStylingRange';
};

/**
 * Shift and masks constants for encoding two numbers into and duplicate info into a single number.
 */
export const enum StylingRange {
  /// Number of bits to shift for the previous pointer
  PREV_SHIFT = 17,
  /// Previous pointer mask.
  PREV_MASK = 0xfffe0000,

  /// Number of bits to shift for the next pointer
  NEXT_SHIFT = 2,
  /// Next pointer mask.
  NEXT_MASK = 0x001fffc,

  // Mask to remove negative bit. (interpret number as positive)
  UNSIGNED_MASK = 0x7fff,

  /**
   * This bit is set if the previous bindings contains a binding which could possibly cause a
   * duplicate. For example: `<div [style]="map" [style.width]="width">`, the `width` binding will
   * have previous duplicate set. The implication is that if `width` binding becomes `null`, it is
   * necessary to defer the value to `map.width`. (Because `width` overwrites `map.width`.)
   */
  /* tslint:disable-next-line:no-duplicate-enum-values */
  PREV_DUPLICATE = 0x02,

  /**
   * This bit is set to if the next binding contains a binding which could possibly cause a
   * duplicate. For example: `<div [style]="map" [style.width]="width">`, the `map` binding will
   * have next duplicate set. The implication is that if `map.width` binding becomes not `null`, it
   * is necessary to defer the value to `width`. (Because `width` overwrites `map.width`.)
   */
  NEXT_DUPLICATE = 0x01,
}

export function toTStylingRange(prev: number, next: number): TStylingRange {
  ngDevMode && assertNumberInRange(prev, 0, StylingRange.UNSIGNED_MASK);
  ngDevMode && assertNumberInRange(next, 0, StylingRange.UNSIGNED_MASK);
  return ((prev << StylingRange.PREV_SHIFT) | (next << StylingRange.NEXT_SHIFT)) as TStylingRange;
}

export function getTStylingRangePrev(tStylingRange: TStylingRange): number {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (tStylingRange >> StylingRange.PREV_SHIFT) & StylingRange.UNSIGNED_MASK;
}

export function getTStylingRangePrevDuplicate(tStylingRange: TStylingRange): boolean {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (tStylingRange & StylingRange.PREV_DUPLICATE) == StylingRange.PREV_DUPLICATE;
}

export function setTStylingRangePrev(
  tStylingRange: TStylingRange,
  previous: number,
): TStylingRange {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  ngDevMode && assertNumberInRange(previous, 0, StylingRange.UNSIGNED_MASK);
  return ((tStylingRange & ~StylingRange.PREV_MASK) |
    (previous << StylingRange.PREV_SHIFT)) as TStylingRange;
}

export function setTStylingRangePrevDuplicate(tStylingRange: TStylingRange): TStylingRange {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (tStylingRange | StylingRange.PREV_DUPLICATE) as TStylingRange;
}

export function getTStylingRangeNext(tStylingRange: TStylingRange): number {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (tStylingRange & StylingRange.NEXT_MASK) >> StylingRange.NEXT_SHIFT;
}

export function setTStylingRangeNext(tStylingRange: TStylingRange, next: number): TStylingRange {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  ngDevMode && assertNumberInRange(next, 0, StylingRange.UNSIGNED_MASK);
  return ((tStylingRange & ~StylingRange.NEXT_MASK) | //
    (next << StylingRange.NEXT_SHIFT)) as TStylingRange;
}

export function getTStylingRangeNextDuplicate(tStylingRange: TStylingRange): boolean {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (tStylingRange & StylingRange.NEXT_DUPLICATE) === StylingRange.NEXT_DUPLICATE;
}

export function setTStylingRangeNextDuplicate(tStylingRange: TStylingRange): TStylingRange {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (tStylingRange | StylingRange.NEXT_DUPLICATE) as TStylingRange;
}

export function getTStylingRangeTail(tStylingRange: TStylingRange): number {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  const next = getTStylingRangeNext(tStylingRange);
  return next === 0 ? getTStylingRangePrev(tStylingRange) : next;
}
