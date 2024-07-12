/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TimelineComponent} from './timeline.component';
import {Subject} from 'rxjs';
import {Component} from '@angular/core';
import {TimelineControlsComponent} from './timeline-controls.component';
import {TimelineVisualizerComponent} from './recording-visualizer/timeline-visualizer.component';
import {FrameSelectorComponent} from './frame-selector.component';

@Component({
  standalone: true,
  selector: 'ng-timeline-controls',
  template: '',
})
class MockTimelineControlsComponent {}

@Component({
  standalone: true,
  selector: 'ng-timeline-visualizer',
  template: '',
})
class MockTimelineVisualizerComponent {}

@Component({
  standalone: true,
  selector: 'ng-frame-selector',
  template: '',
})
class MockFrameSelectorComponent {}

describe('TimelineComponent', () => {
  let fixture: ComponentFixture<TimelineComponent>;
  let comp: TimelineComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimelineComponent],
    }).overrideComponent(TimelineComponent, {
      remove: {
        imports: [TimelineControlsComponent, TimelineVisualizerComponent, FrameSelectorComponent],
      },
      add: {
        imports: [
          MockTimelineControlsComponent,
          MockTimelineVisualizerComponent,
          MockFrameSelectorComponent,
        ],
      },
    });
    fixture = TestBed.createComponent(TimelineComponent);
    comp = fixture.componentInstance;
    fixture.componentRef.setInput('stream', new Subject());
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
