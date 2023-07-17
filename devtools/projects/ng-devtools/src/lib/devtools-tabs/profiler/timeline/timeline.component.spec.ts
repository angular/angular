/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TimelineComponent} from './timeline.component';

describe('TimelineComponent', () => {
  let comp: TimelineComponent;

  beforeEach(() => {
    comp = new TimelineComponent();
  });

  it('should calculate the framerate from passed duration', () => {
    expect(comp.estimateFrameRate(0)).toBe(60);
    expect(comp.estimateFrameRate(15)).toBe(60);
    expect(comp.estimateFrameRate(17)).toBe(30);
    expect(comp.estimateFrameRate(31)).toBe(30);
    expect(comp.estimateFrameRate(30)).toBe(30);
    expect(comp.estimateFrameRate(33)).toBe(15);
    expect(comp.estimateFrameRate(48)).toBe(15);
    expect(comp.estimateFrameRate(49)).toBe(7);
    expect(comp.estimateFrameRate(2000)).toBe(0);
  });
});
