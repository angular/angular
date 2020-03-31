import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { ProfilerFrame } from 'protocol';
import { GraphNode } from './record-formatter/record-formatter';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @ViewChild('barContainer') barContainer: ElementRef;

  @Input() set records(data: ProfilerFrame[]) {
    this.profilerFrames = data.filter((frame) => frame.duration > 0);
    this.renderBarChart(this.profilerFrames);
  }
  @Output() exportProfile = new EventEmitter<void>();
  @Input() profilerFrames: ProfilerFrame[] = [];

  cmpVisualizationModes = VisualizationMode;
  visualizationMode = VisualizationMode.BarGraph;
  graphData: GraphNode[] = [];
  currentFrameIndex = 0;

  get frame(): ProfilerFrame {
    return this.profilerFrames[this.currentFrameIndex];
  }

  frameRate(timeSpent: number): number {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(64 / 2 ** multiplier);
  }

  move(value: number): void {
    const newVal = this.currentFrameIndex + value;
    if (newVal > -1 && newVal < this.profilerFrames.length) {
      this.currentFrameIndex = newVal;
      this.barContainer.nativeElement.children[newVal].scrollIntoView({
        behavior: 'auto',
        block: 'end',
        inline: 'nearest',
      });
    }
  }

  selectFrame(index: number): void {
    this.currentFrameIndex = index;
  }

  renderBarChart(records: ProfilerFrame[]): void {
    const maxValue = records.reduce((acc: number, frame: ProfilerFrame) => Math.max(acc, frame.duration), 0);
    const multiplicationFactor = parseFloat((MAX_HEIGHT / maxValue).toFixed(2));
    this.graphData = records.map((r) => {
      const height = r.duration * multiplicationFactor;
      const colorPercentage = Math.round((height / MAX_HEIGHT) * 100);
      let backgroundColor = 'rgb(237, 213, 94)';
      if (height > 33) {
        backgroundColor = 'rgb(240, 117, 117)';
      } else if (height > 16) {
        backgroundColor = 'rgb(238, 189, 99)';
      }

      const style = {
        'margin-left': '1px',
        'margin-right': '1px',
        background: `-webkit-linear-gradient(bottom, ${backgroundColor} ${colorPercentage}%, #f3f3f3 ${colorPercentage}%)`,
        border: '1px solid #d0d0d0',
        cursor: 'pointer',
        'min-width': '25px',
        width: '25px',
        height: '50px',
      };
      const toolTip = `${r.source} TimeSpent: ${r.duration.toFixed(3)}ms`;
      return { style, toolTip };
    });
  }
}
