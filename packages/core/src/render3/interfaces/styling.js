/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertNumber, assertNumberInRange} from '../../util/assert';
export function toTStylingRange(prev, next) {
  ngDevMode && assertNumberInRange(prev, 0, 32767 /* StylingRange.UNSIGNED_MASK */);
  ngDevMode && assertNumberInRange(next, 0, 32767 /* StylingRange.UNSIGNED_MASK */);
  return (prev << 17) /* StylingRange.PREV_SHIFT */ | (next << 2) /* StylingRange.NEXT_SHIFT */;
}
export function getTStylingRangePrev(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (
    (tStylingRange >> 17) /* StylingRange.PREV_SHIFT */ & 32767 /* StylingRange.UNSIGNED_MASK */
  );
}
export function getTStylingRangePrevDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (
    (tStylingRange & 2) /* StylingRange.PREV_DUPLICATE */ == 2 /* StylingRange.PREV_DUPLICATE */
  );
}
export function setTStylingRangePrev(tStylingRange, previous) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  ngDevMode && assertNumberInRange(previous, 0, 32767 /* StylingRange.UNSIGNED_MASK */);
  return (
    (tStylingRange & ~4294836224) /* StylingRange.PREV_MASK */ |
    (previous << 17) /* StylingRange.PREV_SHIFT */
  );
}
export function setTStylingRangePrevDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return tStylingRange | 2 /* StylingRange.PREV_DUPLICATE */;
}
export function getTStylingRangeNext(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (tStylingRange & 131068) /* StylingRange.NEXT_MASK */ >> 2 /* StylingRange.NEXT_SHIFT */;
}
export function setTStylingRangeNext(tStylingRange, next) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  ngDevMode && assertNumberInRange(next, 0, 32767 /* StylingRange.UNSIGNED_MASK */);
  return (
    (tStylingRange & ~131068) /* StylingRange.NEXT_MASK */ | //
    (next << 2) /* StylingRange.NEXT_SHIFT */
  );
}
export function getTStylingRangeNextDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return (
    (tStylingRange & 1) /* StylingRange.NEXT_DUPLICATE */ === 1 /* StylingRange.NEXT_DUPLICATE */
  );
}
export function setTStylingRangeNextDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  return tStylingRange | 1 /* StylingRange.NEXT_DUPLICATE */;
}
export function getTStylingRangeTail(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, 'expected number');
  const next = getTStylingRangeNext(tStylingRange);
  return next === 0 ? getTStylingRangePrev(tStylingRange) : next;
}
//# sourceMappingURL=styling.js.map
