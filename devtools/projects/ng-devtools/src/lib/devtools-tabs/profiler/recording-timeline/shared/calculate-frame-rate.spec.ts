/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {calculateFrameRate} from './calculate-frame-rate';

describe('calculateFrameRate', () => {
  it('should calculate the framerate from passed duration', () => {
    expect(calculateFrameRate(0)).toBe(60);
    expect(calculateFrameRate(15)).toBe(60);
    expect(calculateFrameRate(17)).toBe(59);
    expect(calculateFrameRate(30)).toBe(33);
    expect(calculateFrameRate(31)).toBe(32);
    expect(calculateFrameRate(33)).toBe(30);
    expect(calculateFrameRate(48)).toBe(21);
    expect(calculateFrameRate(49)).toBe(20);
    expect(calculateFrameRate(2000)).toBe(1);
    expect(calculateFrameRate(5000)).toBe(0);
  });
});
