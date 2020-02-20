import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { AppEntry, formatFlamegraphRecords, TimelineView } from './format-records';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { ProfilerFrame } from 'protocol';

@Component({
  selector: 'ng-recording-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @Input() set records(data: ProfilerFrame[]) {
    this.profileRecords = formatFlamegraphRecords(data);
  }

  @ViewChild(MatSlider) slider: MatSlider;

  profileRecords: TimelineView = {
    timeline: [],
  };
  currentView = 1;

  get recordsView(): AppEntry {
    return this.profileRecords.timeline[this.currentView] || { app: [], timeSpent: 0, source: '' };
  }

  frameRate(timeSpent: number) {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(64 / 2 ** multiplier);
  }

  updateView($event: MatSliderChange) {
    if ($event.value === undefined || $event.value > this.profileRecords.timeline.length) {
      return;
    }
    this.currentView = $event.value;
    this.slider.value = this.currentView;
  }

  move(number: number): void {
    const newVal = this.currentView + number;
    if (newVal > 0 && newVal < this.profileRecords.timeline.length) {
      this.currentView = newVal;
      this.slider.value = this.currentView;
    }
  }
}
