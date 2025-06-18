/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RecordingTimelineComponent} from './recording-timeline.component';

describe('TimelineComponent', () => {
  it('should calculate the framerate from passed duration', () => {
    expect(RecordingTimelineComponent.estimateFrameRate(0)).toBe(60);
    expect(RecordingTimelineComponent.estimateFrameRate(15)).toBe(60);
    expect(RecordingTimelineComponent.estimateFrameRate(17)).toBe(30);
    expect(RecordingTimelineComponent.estimateFrameRate(31)).toBe(30);
    expect(RecordingTimelineComponent.estimateFrameRate(30)).toBe(30);
    expect(RecordingTimelineComponent.estimateFrameRate(33)).toBe(15);
    expect(RecordingTimelineComponent.estimateFrameRate(48)).toBe(15);
    expect(RecordingTimelineComponent.estimateFrameRate(49)).toBe(7);
    expect(RecordingTimelineComponent.estimateFrameRate(2000)).toBe(0);
  });
});
