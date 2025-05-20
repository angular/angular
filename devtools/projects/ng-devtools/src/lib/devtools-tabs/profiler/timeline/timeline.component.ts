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
import {GraphNode} from './record-formatter/record-formatter';
import {VisualizationMode} from './visualization-mode';
import {TimelineVisualizerComponent} from './recording-visualizer/timeline-visualizer.component';
import {FrameSelectorComponent} from './frame-selector.component';
import {TimelineControlsComponent} from './timeline-controls.component';
import {RecordingModalComponent} from './recording-modal.component';

const MAX_HEIGHT = 50;

@Component({
  selector: 'ng-recording-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  imports: [
    RecordingModalComponent,
    TimelineControlsComponent,
    FrameSelectorComponent,
    TimelineVisualizerComponent,
  ],
})
export class TimelineComponent {
  readonly stream = input.required<Observable<ProfilerFrame[]>>();
  readonly exportProfile = output<void>();

  readonly visualizationMode = signal(VisualizationMode.BarGraph);
  readonly changeDetection = signal(false);
  readonly selectFrames = signal<number[]>([]);
  readonly frame = computed(() => {
    const indexes = this.selectFrames();
    const data = this.graphData();
    return mergeFrames(indexes.map((index) => data[index]?.frame).filter(Boolean));
  });

  private readonly _filter = signal<Filter>(noopFilter);
  private _maxDuration = -Infinity;
  private _allRecords: ProfilerFrame[] = [];
  readonly visualizing = signal(false);
  private readonly _graphData = signal<GraphNode[]>([]);
  readonly graphData = computed(() => {
    const nodes = this._graphData();
    const filter = this._filter();
    return nodes.filter((node) => filter(node));
  });

  readonly currentFrameRate = computed(() =>
    TimelineComponent.estimateFrameRate(this.frame()?.duration ?? 0),
  );

  readonly hasFrames = computed(() => this._graphData().length > 0);

  constructor() {
    effect((cleanup) => {
      const data = this.stream();
      this._allRecords = [];
      this._maxDuration = -Infinity;
      const _subscription = data.subscribe({
        next: (frames: ProfilerFrame[]): void => {
          this._processFrames(frames);
        },
        complete: (): void => {
          this.visualizing.set(true);
        },
      });
      cleanup(() => _subscription.unsubscribe());
    });
  }

  static estimateFrameRate(timeSpent: number): number {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(60 / 2 ** multiplier);
  }

  setFilter(filter: string): void {
    this._filter.set(createFilter(filter));
  }

  getColorByFrameRate(framerate: number): string {
    if (framerate >= 60) {
      return '#d6f0d1';
    } else if (framerate < 60 && framerate >= 30) {
      return '#f2dca2';
    } else if (framerate < 30 && framerate >= 15) {
      return '#f9cc9d';
    }
    return '#fad1d1';
  }

  private _processFrames(frames: ProfilerFrame[]): void {
    let regenerate = false;
    for (const frame of frames) {
      if (frame.duration >= this._maxDuration) {
        regenerate = true;
      }
      this._allRecords.push(frame);
    }
    if (regenerate) {
      this._graphData.set(this._generateBars());
      return;
    }
    const multiplicationFactor = parseFloat((MAX_HEIGHT / this._maxDuration).toFixed(2));
    this._graphData.update((value) => {
      frames.forEach((frame) => value.push(this._getBarStyles(frame, multiplicationFactor)));
      return [...value];
    });
  }

  private _generateBars(): GraphNode[] {
    const maxValue = this._allRecords.reduce(
      (acc: number, frame: ProfilerFrame) => Math.max(acc, frame.duration),
      0,
    );
    const multiplicationFactor = parseFloat((MAX_HEIGHT / maxValue).toFixed(2));
    this._maxDuration = Math.max(this._maxDuration, maxValue);
    return this._allRecords.map((r) => this._getBarStyles(r, multiplicationFactor));
  }

  private _getBarStyles(frame: ProfilerFrame, multiplicationFactor: number): GraphNode {
    const height = frame.duration * multiplicationFactor;
    const colorPercentage = Math.max(10, Math.round((height / MAX_HEIGHT) * 100));
    const backgroundColor = this.getColorByFrameRate(
      TimelineComponent.estimateFrameRate(frame.duration),
    );

    const style = {
      'background-image': `-webkit-linear-gradient(bottom, ${backgroundColor} ${colorPercentage}%, transparent ${colorPercentage}%)`,
      cursor: 'pointer',
      'min-width': '25px',
      width: '25px',
      height: '50px',
    };
    const toolTip = `${frame.source} TimeSpent: ${frame.duration.toFixed(3)}ms`;
    return {style, toolTip, frame};
  }
}
