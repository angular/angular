import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { ProfilerFrame } from 'protocol';
import { FlamegraphFormatter, FlamegraphNode } from './record-formatter/flamegraph-formatter';
import { BarGraphFormatter, BargraphNode } from './record-formatter/bargraph-formatter';
import { AppEntry, TimelineView, GraphNode } from './record-formatter/record-formatter';
import { TreeMapFormatter, TreeMapNode } from './record-formatter/tree-map-formatter';

export enum VisualizationMode {
  FlameGraph,
  TreeMap,
  BarGraph,
}

const formatters = {
  [VisualizationMode.FlameGraph]: new FlamegraphFormatter(),
  [VisualizationMode.TreeMap]: new TreeMapFormatter(),
  [VisualizationMode.BarGraph]: new BarGraphFormatter(),
};

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
    this.unFormattedRecords = data;
    this.formatRecords();
  }

  @Output() exportProfile = new EventEmitter<void>();

  @Input() unFormattedRecords: ProfilerFrame[];

  profileRecords: TimelineView<FlamegraphNode> | TimelineView<TreeMapNode> | TimelineView<BargraphNode> = {
    timeline: [],
  };
  currentView = 0;

  cmpVisualizationModes = VisualizationMode;
  visualizationMode = VisualizationMode.BarGraph;
  graphData: GraphNode<FlamegraphNode | TreeMapNode | BargraphNode>[] = [];

  get formatter(): FlamegraphFormatter | TreeMapFormatter | BarGraphFormatter {
    return formatters[this.visualizationMode];
  }

  get recordsView(): AppEntry<FlamegraphNode> | AppEntry<TreeMapNode> | AppEntry<BargraphNode> {
    return this.profileRecords.timeline[this.currentView] || { app: [], timeSpent: 0, source: '' };
  }

  frameRate(timeSpent: number): number {
    const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
    return Math.floor(64 / 2 ** multiplier);
  }

  move(value: number): void {
    const newVal = this.currentView + value;
    if (newVal > -1 && newVal < this.profileRecords.timeline.length) {
      this.currentView = newVal;
      this.barContainer.nativeElement.children[newVal].scrollIntoView({
        behavior: 'auto',
        block: 'end',
        inline: 'nearest',
      });
    }
  }

  updateView(value: number): void {
    this.currentView = value;
  }

  formatRecords(): void {
    this.profileRecords = this.formatter.format(this.unFormattedRecords);
    this.renderBarChart(this.profileRecords.timeline);
  }

  renderBarChart(timeline: AppEntry<FlamegraphNode | TreeMapNode | BargraphNode>[]): void {
    const maxValue = timeline.reduce(
      (acc: number, node: AppEntry<FlamegraphNode | TreeMapNode | BargraphNode>) => Math.max(acc, node.timeSpent),
      0
    );
    const multiplicationFactor = parseFloat((MAX_HEIGHT / maxValue).toFixed(2));
    this.graphData = timeline.map((d) => {
      const height = d.timeSpent * multiplicationFactor;
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
      const toolTip = `${d.source} TimeSpent: ${d.timeSpent.toFixed(3)}ms`;
      return { ...d, style, toolTip };
    });
  }
}
