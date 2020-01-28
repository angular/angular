/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StylingRange, getTStylingRangeNext, getTStylingRangePrev, toTStylingRange} from '@angular/core/src/render3/interfaces/styling';

describe('TStylingRange', () => {
  const MAX_VALUE = StylingRange.UNSIGNED_MASK;

  it('should throw on negative values', () => {
    expect(() => toTStylingRange(0, -1)).toThrow();
    expect(() => toTStylingRange(-1, 0)).toThrow();
  });

  it('should throw on overflow', () => {
    expect(() => toTStylingRange(0, MAX_VALUE + 1)).toThrow();
    expect(() => toTStylingRange(MAX_VALUE + 1, 0)).toThrow();
  });

  it('should retrieve the same value which went in just below overflow', () => {
    const range = toTStylingRange(MAX_VALUE, MAX_VALUE);
    expect(getTStylingRangePrev(range)).toEqual(MAX_VALUE);
    expect(getTStylingRangeNext(range)).toEqual(MAX_VALUE);
  });
});