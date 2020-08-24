import { Component, Input } from '@angular/core';
import { BargraphNode, BarGraphFormatter } from '../../record-formatter/bargraph-formatter';
import { ProfilerFrame } from 'protocol';

export interface GraphNode {
  directive: string;
  method: string;
  value: number;
}

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
})
export class BargraphVisualizerComponent {
  barColor = '#FFC400';
  profileRecords: BargraphNode[];
  selectedEntry: BargraphNode | null = null;
  selectedDirectives: GraphNode[] = [];
  parentHierarchy: { name: string }[] = [];

  private _formatter = new BarGraphFormatter();

  @Input() set frame(data: ProfilerFrame) {
    this.profileRecords = this._formatter.formatFrame(data);
    this.selectedEntry = null;
  }

  formatPieChartData(bargraphNode: BargraphNode): GraphNode[] {
    const graphData: GraphNode[] = [];
    bargraphNode.original.directives.forEach((node) => {
      const { changeDetection } = node;
      if (changeDetection) {
        graphData.push({
          directive: node.name,
          method: 'changes',
          value: parseFloat(changeDetection.toFixed(2)),
        });
      }
      Object.keys(node.lifecycle).forEach((key) => {
        graphData.push({
          directive: node.name,
          method: key,
          value: +node.lifecycle[key].toFixed(2),
        });
      });
    });
    return graphData;
  }

  selectNode(data: BargraphNode): void {
    const index = this.profileRecords.findIndex((element) => element.label === data.label);
    this.selectedEntry = this.profileRecords[index];
    this.parentHierarchy = this.selectedEntry.parents.map((element) => {
      return { name: element.directives[0].name };
    });
    this.selectedDirectives = this.formatPieChartData(this.selectedEntry);
  }

  formatToolTip(data: any): string {
    return `${data.data.name} ${data.data.value}ms`;
  }
}
