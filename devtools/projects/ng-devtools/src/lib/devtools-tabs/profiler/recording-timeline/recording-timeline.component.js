/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import {createFilter, noopFilter} from './filter';
import {mergeFrames} from './record-formatter/frame-merger';
import {VisualizationMode} from './shared/visualization-mode';
import {RecordingVisualizerComponent} from './recording-visualizer/recording-visualizer.component';
import {FrameSelectorComponent} from './frame-selector/frame-selector.component';
import {RecordingTimelineControlsComponent} from './recording-timeline-controls/recording-timeline-controls.component';
import {VisualizerControlsComponent} from './visualizer-controls/visualizer-controls.component';
import {estimateFrameRate} from './shared/estimate-frame-rate';
let RecordingTimelineComponent = class RecordingTimelineComponent {
  constructor() {
    this.stream = input.required();
    this.exportProfile = output();
    this.visualizationMode = signal(VisualizationMode.BarGraph);
    this.changeDetection = signal(false);
    this.selectFrames = signal([]);
    this.frame = computed(() => {
      const indexes = this.selectFrames();
      const data = this.frames();
      return mergeFrames(indexes.map((index) => data[index]).filter(Boolean));
    });
    this._filter = signal(noopFilter);
    this.visualizing = signal(false);
    // Ensure that `allFrames` is always cleaned if the stream changes.
    // This is a safe guard in case the component is not destroyed when a recording is cleared
    // (i.e. don't rely on the UI).
    this.allFrames = linkedSignal({
      source: this.stream,
      computation: () => [],
    });
    this.frames = computed(() => {
      const filter = this._filter();
      return this.allFrames().filter((node) => filter(node));
    });
    this.currentFrameRate = computed(() => estimateFrameRate(this.frame()?.duration ?? 0));
    this.hasFrames = computed(() => this.allFrames().length > 0);
    effect((cleanup) => {
      const data = this.stream();
      const subscription = data.subscribe({
        next: (frames) => {
          this.allFrames.update((all) => all.concat(frames));
        },
        complete: () => {
          this.visualizing.set(true);
        },
      });
      cleanup(() => subscription.unsubscribe());
    });
  }
  setFilter(filter) {
    this._filter.set(createFilter(filter));
  }
};
RecordingTimelineComponent = __decorate(
  [
    Component({
      selector: 'ng-recording-timeline',
      templateUrl: './recording-timeline.component.html',
      styleUrls: ['./recording-timeline.component.scss'],
      imports: [
        RecordingTimelineControlsComponent,
        FrameSelectorComponent,
        RecordingVisualizerComponent,
        VisualizerControlsComponent,
      ],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  RecordingTimelineComponent,
);
export {RecordingTimelineComponent};
//# sourceMappingURL=recording-timeline.component.js.map
