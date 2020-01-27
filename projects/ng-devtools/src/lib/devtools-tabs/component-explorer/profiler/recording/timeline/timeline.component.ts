import { Component, Input, ViewChild } from '@angular/core';
import { AppEntry, formatRecords, TimelineView } from './format-records';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { AppRecord } from 'protocol';

@Component({
  selector: 'ng-recording-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent {
  @Input() set records(data: AppRecord[]) {
    this.timeline = formatRecords(data);
  }

  @Input() view: 'aggregated' | 'timeline' = 'aggregated';
  @ViewChild(MatSlider) slider: MatSlider;

  timeline: TimelineView = {
    aggregated: {
      app: [],
      timeSpent: 0,
      source: ''
    },
    timeline: []
  };
  currentView = 1;

  get recordsView(): AppEntry {
    if (this.view === 'timeline') {
      return this.timeline.timeline[this.currentView];
    }
    return this.timeline.aggregated;
  }

  updateView($event: MatSliderChange) {
    if ($event.value === undefined || $event.value > this.timeline.timeline.length) {
      return;
    }
    this.currentView = $event.value;
    this.slider.value = this.currentView;
  }

  move(number: number) {
    const newVal = this.currentView + number;
    if (newVal > 0 && newVal < this.timeline.timeline.length) {
      this.currentView = newVal;
      this.slider.value = this.currentView;
    }
  }
}
