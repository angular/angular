import { Component, ElementRef, Input } from '@angular/core';
import { FlamegraphNode } from '../../record-formatter/flamegraph-formatter/flamegraph-formatter';
import { RawData } from 'ngx-flamegraph/lib/utils';

export interface GraphNode {
  name: string;
  value: number;
}

@Component({
  selector: 'ng-flamegraph-visualizer',
  templateUrl: './flamegraph-visualizer.component.html',
  styleUrls: ['./flamegraph-visualizer.component.css'],
})
export class FlamegraphVisualizerComponent {
  profilerBars: FlamegraphNode[] = [];
  selectedEntry: FlamegraphNode = null;

  // graph options
  graphData = [];
  view: [number, number] = [235, 200];
  colorScheme = {
    domain: ['#E71D36', '#2EC4B6', '#FF9F1C', '#011627'],
  };

  @Input() set bars(data: FlamegraphNode[]) {
    this.selectedEntry = null;
    this.profilerBars = data;
  }

  constructor(private _el: ElementRef) {}

  selectFrame(frame: RawData): void {
    this.selectedEntry = frame as FlamegraphNode;
    this.renderGraph(this.selectedEntry);
  }

  get availableWidth(): number {
    return this._el.nativeElement.querySelector('.level-profile-wrapper').offsetWidth;
  }

  formatPieChartData(flameGraphNode: FlamegraphNode): GraphNode[] {
    const graphData: GraphNode[] = [];
    flameGraphNode.original.directives.forEach(node => {
      graphData.push({
        name: `${node.name} changeDetection`,
        value: +node.changeDetection.toFixed(2),
      });
      Object.keys(node.lifecycle).forEach(key => {
        graphData.push({
          name: `${node.name} ${key}`,
          value: +node.lifecycle[key].toFixed(2),
        });
      });
    });
    return graphData;
  }

  renderGraph(node: FlamegraphNode): void {
    this.graphData = this.formatPieChartData(node);
  }

  formatToolTip(data: any): string {
    return `${data.data.name} ${data.data.value}ms`;
  }
}
