import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { ProfilerFrame } from 'protocol';
import { GraphNode } from './record-formatter/record-formatter';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';
import { mergeFrames } from './record-formatter/frame-merger';

export enum VisualizationMode {
  FlameGraph,
  TreeMap,
  BarGraph,
}

const MAX_HEIGHT = 50;

@Component({
  selector: 'ng-recording-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnDestroy {
  @Input() set stream(data: Observable<ProfilerFrame[]>) {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._allRecords = [];
    this._maxDuration = -Infinity;
    this._subscription = data.subscribe({
      next: (frames: ProfilerFrame[]): void => {
        this._processFrames(frames);
      },
      complete: (): void => {
        this.visualizing = true;
      },
    });
  }
  @Output() exportProfile = new EventEmitter<void>();

  visualizationMode = VisualizationMode.BarGraph;
  changeDetection = false;
  frame: ProfilerFrame | null = null;

  private _maxDuration = -Infinity;
  private _subscription: Subscription;
  private _allRecords: ProfilerFrame[] = [];
  private _graphDataSubject = new BehaviorSubject<GraphNode[]>([]);
  visualizing = false;
  graphData$ = this._graphDataSubject.asObservable().pipe(share());

  selectFrames({ indexes }: { indexes: number[] }): void {
    this.frame = mergeFrames(indexes.map((index) => this._allRecords[index]));
  }

  get hasFrames(): boolean {
    return this._allRecords.length > 0;
  }

  estimateFrameRate(timeSpent: number): number {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(60 / 2 ** multiplier);
  }

  getColorByFrameRate(framerate: number): string {
    if (framerate >= 60) {
      return '#4db6ac';
    } else if (framerate < 60 && framerate >= 30) {
      return '#FFBE2F';
    } else if (framerate < 30 && framerate >= 15) {
      return '#ff8d00';
    }
    return '#FF625A';
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
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
      this._graphDataSubject.next(this._generateBars());
      return;
    }
    const multiplicationFactor = parseFloat((MAX_HEIGHT / this._maxDuration).toFixed(2));
    frames.forEach((frame) => this._graphDataSubject.value.push(this._getBarStyles(frame, multiplicationFactor)));

    // We need to pass a new reference, because the CDK virtual scroll
    // has OnPush strategy, so it doesn't update the UI otherwise.
    // If this turns out ot be a bottleneck, we can easily create an immutable reference.
    this._graphDataSubject.next(this._graphDataSubject.value.slice());
  }

  private _generateBars(): GraphNode[] {
    const maxValue = this._allRecords.reduce((acc: number, frame: ProfilerFrame) => Math.max(acc, frame.duration), 0);
    const multiplicationFactor = parseFloat((MAX_HEIGHT / maxValue).toFixed(2));
    this._maxDuration = Math.max(this._maxDuration, maxValue);
    return this._allRecords.map((r) => this._getBarStyles(r, multiplicationFactor));
  }

  private _getBarStyles(
    record: ProfilerFrame,
    multiplicationFactor: number
  ): { style: { [key: string]: string }; toolTip: string } {
    const height = record.duration * multiplicationFactor;
    const colorPercentage = Math.max(10, Math.round((height / MAX_HEIGHT) * 100));
    const backgroundColor = this.getColorByFrameRate(this.estimateFrameRate(record.duration));

    const style = {
      background: `-webkit-linear-gradient(bottom, ${backgroundColor} ${colorPercentage}%, transparent ${colorPercentage}%)`,
      cursor: 'pointer',
      'min-width': '25px',
      width: '25px',
      height: '50px',
    };
    const toolTip = `${record.source} TimeSpent: ${record.duration.toFixed(3)}ms`;
    return { style, toolTip };
  }
}
