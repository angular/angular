import { Component, Input } from '@angular/core';
import { BargraphNode } from '../../record-formatter/bargraph-formatter';

export interface GraphNode {
  name: string;
  value: number;
}

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
})
export class BargraphVisualizerComponent {
  view: [number, number] = [600, 600];
  colorScheme = {
    domain: ['rgb(237, 213, 94)'],
  };
  profileRecords: BargraphNode[];
  selectedEntry: BargraphNode | null = null;
  pieChartView: [number, number] = [235, 200];
  pieChartColorScheme = {
    domain: ['#E71D36', '#2EC4B6', '#FF9F1C', '#011627'],
  };
  pieChartData: GraphNode[] = [];
  parentHierarchy: { name: string }[] = [];

  @Input() set records(data: BargraphNode[]) {
    this.profileRecords = data;
    this.selectedEntry = null;
    this.view = [1000, data.length * 30];
  }

  formatPieChartData(bargraphNode: BargraphNode): GraphNode[] {
    const graphData: GraphNode[] = [];
    bargraphNode.original.directives.forEach((node) => {
      graphData.push({
        name: `${node.name} changeDetection`,
        value: +node.changeDetection.toFixed(2),
      });
      Object.keys(node.lifecycle).forEach((key) => {
        graphData.push({
          name: `${node.name} ${key}`,
          value: +node.lifecycle[key].toFixed(2),
        });
      });
    });
    return graphData;
  }

  selectNode(data: any): void {
    const index = this.profileRecords.findIndex((element) => element.name === data.name);
    this.selectedEntry = this.profileRecords[index];
    this.parentHierarchy = this.selectedEntry.parents.map((element) => {
      return { name: element.directives[0].name };
    });
    this.pieChartData = this.formatPieChartData(this.selectedEntry);
  }

  formatToolTip(data: any): string {
    return `${data.data.name} ${data.data.value}ms`;
  }
}
