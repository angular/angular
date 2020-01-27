import { Component, Input } from '@angular/core';
import { AppTreeLevel, ComponentEntry } from '../timeline/format-records';

const min = [249, 225, 225];
const max = [223, 113, 109];

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

  getWidth(profile: ComponentEntry, bar: AppTreeLevel) {
    if (bar.length === 1) {
      return 100;
    }
    const rowSum = bar.reduce((a, c) => a + c.duration, 0);
    if (rowSum === 0) {
      return 100 / bar.length;
    }
    return 100 * (profile.duration / rowSum);
  }

  getColor(profile: ComponentEntry) {
    const abs = this._maxDuration - this._minDuration;
    const val = this._maxDuration - profile.duration;
    let ratio = val / abs;
    if (isNaN(ratio)) {
      ratio = 1;
    }
    return `rgb(${max[0] + (min[0] - max[0]) * ratio}, ${max[1] + (min[1] - max[1]) * ratio}, ${max[2] +
      (min[2] - max[2]) * ratio})`;
  }
}
