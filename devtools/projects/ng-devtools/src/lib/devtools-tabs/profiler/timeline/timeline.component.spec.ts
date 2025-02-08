/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TimelineComponent} from './timeline.component';

describe('TimelineComponent', () => {
  it('should calculate the framerate from passed duration', () => {
    expect(TimelineComponent.estimateFrameRate(0)).toBe(60);
    expect(TimelineComponent.estimateFrameRate(15)).toBe(60);
    expect(TimelineComponent.estimateFrameRate(17)).toBe(30);
    expect(TimelineComponent.estimateFrameRate(31)).toBe(30);
    expect(TimelineComponent.estimateFrameRate(30)).toBe(30);
    expect(TimelineComponent.estimateFrameRate(33)).toBe(15);
    expect(TimelineComponent.estimateFrameRate(48)).toBe(15);
    expect(TimelineComponent.estimateFrameRate(49)).toBe(7);
    expect(TimelineComponent.estimateFrameRate(2000)).toBe(0);
  });
});
