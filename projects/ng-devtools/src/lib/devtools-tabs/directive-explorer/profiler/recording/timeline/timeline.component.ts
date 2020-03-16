import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { ProfilerFrame } from 'protocol';
import { FlamegraphFormatter, FlamegraphNode } from './record-formatter/flamegraph-formatter';
import { AppEntry, TimelineView } from './record-formatter/record-formatter';
import { WebtreegraphFormatter, WebtreegraphNode } from './record-formatter/webtreegraph-formatter';

export enum VisualizationMode {
  FlameGraph,
  WebTreeGraph,
}

const formatters = {
  [VisualizationMode.FlameGraph]: new FlamegraphFormatter(),
  [VisualizationMode.WebTreeGraph]: new WebtreegraphFormatter(),
};

@Component({
  selector: 'ng-recording-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @Input() set records(data: ProfilerFrame[]) {
    this.unFormattedRecords = data;
    this.formatRecords();
  }

  @Output() exportProfile = new EventEmitter<void>();

  @ViewChild(MatSlider) slider: MatSlider;

  @Input() unFormattedRecords: ProfilerFrame[];

  profileRecords: TimelineView<FlamegraphNode> | TimelineView<WebtreegraphNode> = {
    timeline: [],
  };
  currentView = 1;

  cmpVisualizationModes = VisualizationMode;
  visualizationMode = VisualizationMode.FlameGraph;

  get formatter(): FlamegraphFormatter | WebtreegraphFormatter {
    return formatters[this.visualizationMode];
  }

  get recordsView(): AppEntry<FlamegraphNode> | AppEntry<WebtreegraphNode> {
    return this.profileRecords.timeline[this.currentView] || { app: [], timeSpent: 0, source: '' };
  }

  frameRate(timeSpent: number): number {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(64 / 2 ** multiplier);
  }

  updateView($event: MatSliderChange): void {
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

  formatRecords(): void {
    this.profileRecords = this.formatter.format(this.unFormattedRecords);
  }
}
