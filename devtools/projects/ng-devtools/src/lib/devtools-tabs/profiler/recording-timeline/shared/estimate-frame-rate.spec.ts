/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {estimateFrameRate} from './estimate-frame-rate';

describe('estimateFrameRate', () => {
  it('should calculate the framerate from passed duration', () => {
    expect(estimateFrameRate(0)).toBe(60);
    expect(estimateFrameRate(15)).toBe(60);
    expect(estimateFrameRate(17)).toBe(30);
    expect(estimateFrameRate(31)).toBe(30);
    expect(estimateFrameRate(30)).toBe(30);
    expect(estimateFrameRate(33)).toBe(15);
    expect(estimateFrameRate(48)).toBe(15);
    expect(estimateFrameRate(49)).toBe(7);
    expect(estimateFrameRate(2000)).toBe(0);
  });
});
