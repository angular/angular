/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, effect, input, output, signal} from '@angular/core';
import {ProfilerFrame} from '../../../../../../protocol';
import {Observable} from 'rxjs';

import {createFilter, Filter, noopFilter} from './filter';
import {mergeFrames} from './record-formatter/frame-merger';
import {VisualizationMode} from './shared/visualization-mode';

import {RecordingVisualizerComponent} from './recording-visualizer/recording-visualizer.component';
import {FrameSelectorComponent} from './frame-selector/frame-selector.component';
import {RecordingTimelineControlsComponent} from './recording-timeline-controls/recording-timeline-controls.component';
import {RecordingModalComponent} from './recording-modal/recording-modal.component';
import {VisualizerControlsComponent} from './visualizer-controls/visualizer-controls.component';
import {estimateFrameRate} from './shared/estimate-frame-rate';

@Component({
  selector: 'ng-recording-timeline',
  templateUrl: './recording-timeline.component.html',
  styleUrls: ['./recording-timeline.component.scss'],
  imports: [
    RecordingModalComponent,
    RecordingTimelineControlsComponent,
    FrameSelectorComponent,
    RecordingVisualizerComponent,
    VisualizerControlsComponent,
  ],
})
export class RecordingTimelineComponent {
  readonly stream = input.required<Observable<ProfilerFrame[]>>();
  readonly exportProfile = output<void>();

  readonly visualizationMode = signal(VisualizationMode.BarGraph);
  readonly changeDetection = signal(false);
  readonly selectFrames = signal<number[]>([]);
  readonly frame = computed(() => {
    const indexes = this.selectFrames();
    const data = this.frames();
    return mergeFrames(indexes.map((index) => data[index]).filter(Boolean));
  });

  private readonly _filter = signal<Filter>(noopFilter);
  protected readonly visualizing = signal(false);

  private readonly allFrames = signal<ProfilerFrame[]>([]);
  protected readonly frames = computed(() => {
    const filter = this._filter();
    return this.allFrames().filter((node) => filter(node));
  });

  readonly currentFrameRate = computed(() => estimateFrameRate(this.frame()?.duration ?? 0));

  readonly hasFrames = computed(() => this.allFrames().length > 0);

  constructor() {
    effect((cleanup) => {
      const data = this.stream();
      const subscription = data.subscribe({
        next: (frames: ProfilerFrame[]): void => {
          this.allFrames.set(frames);
        },
        complete: (): void => {
          this.visualizing.set(true);
        },
      });
      cleanup(() => subscription.unsubscribe());
    });
  }

  setFilter(filter: string): void {
    this._filter.set(createFilter(filter));
  }
}
