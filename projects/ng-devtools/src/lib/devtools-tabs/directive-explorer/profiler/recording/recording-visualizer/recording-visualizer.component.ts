import { Component, Input } from '@angular/core';
import { AppTreeLevel, ComponentEntry } from '../timeline/format-records';

const MIN = [249, 225, 225];
const MAX = [223, 113, 109];

@Component({
  selector: 'ng-recording-visualizer',
  templateUrl: './recording-visualizer.component.html',
  styleUrls: ['./recording-visualizer.component.css'],
})
export class RecordingVisualizerComponent {
  profilerBars: AppTreeLevel[] = [];
  selectedEntry: ComponentEntry = null;

  private _maxDuration = 0;
  private _minDuration = 0;

  @Input() sidebarDisabled = false;
  @Input() set bars(data: AppTreeLevel[]) {
    this.selectedEntry = null;
    this.profilerBars = data;
    this._maxDuration = -Infinity;
    this._minDuration = Infinity;
    this.profilerBars.forEach(b => {
      b.forEach(e => {
        if (this._maxDuration < e.duration) {
          this._maxDuration = e.duration;
        }
        if (this._minDuration > e.duration) {
          this._minDuration = e.duration;
        }
      });
    });
  }

  getWidth(profile: ComponentEntry, bar: AppTreeLevel): number {
    if (bar.length === 1) {
      return 100;
    }
    const rowSum = bar.reduce((a, c) => a + c.duration, 0);
    if (rowSum === 0) {
      return 100 / bar.length;
    }
    return 100 * (profile.duration / rowSum);
  }

  getColor(profile: ComponentEntry): string {
    const abs = this._maxDuration - this._minDuration;
    const val = this._maxDuration - profile.duration;
    let ratio = val / abs;
    if (isNaN(ratio)) {
      ratio = 1;
    }
    return `rgb(${MAX[0] + (MIN[0] - MAX[0]) * ratio}, ${MAX[1] + (MIN[1] - MAX[1]) * ratio}, ${MAX[2] +
      (MIN[2] - MAX[2]) * ratio})`;
  }
}
