import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() set records(data: ProfilerFrame[]) {
    this.profilerFrames = data.filter((frame) => frame.duration > 0);
    this.renderBarChart(this.profilerFrames);
  }
  @Input() profilerFrames: ProfilerFrame[] = [];
  @Output() exportProfile = new EventEmitter<void>();

  visualizationMode = VisualizationMode.BarGraph;
  graphData: GraphNode[] = [];
  currentFrameIndex = 0;

  get frame(): ProfilerFrame {
    return this.profilerFrames[this.currentFrameIndex];
  }

  estimateFrameRate(timeSpent: number): number {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(60 / 2 ** multiplier);
  }

  move(value: number): void {
    const newVal = this.currentFrameIndex + value;
    if (newVal > -1 && newVal < this.profilerFrames.length) {
      this.currentFrameIndex = newVal;
    }
  }

  selectFrame(index: number): void {
    this.currentFrameIndex = index;
  }

  getColorByFrameRate(framerate: number): string {
    if (framerate >= 60) {
      return 'green';
    } else if (framerate < 60 && framerate >= 30) {
      return 'orange';
    } else if (framerate < 30 && framerate >= 15) {
      return 'darkorange';
    }
    return 'red';
  }

  renderBarChart(records: ProfilerFrame[]): void {
    const maxValue = records.reduce((acc: number, frame: ProfilerFrame) => Math.max(acc, frame.duration), 0);
    const multiplicationFactor = parseFloat((MAX_HEIGHT / maxValue).toFixed(2));
    this.graphData = records.map((r) => {
      const height = r.duration * multiplicationFactor;
      const colorPercentage = Math.round((height / MAX_HEIGHT) * 100);
      const backgroundColor = this.getColorByFrameRate(this.estimateFrameRate(r.duration));

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
