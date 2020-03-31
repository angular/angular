import { Component, ElementRef, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import {
  FlamegraphNode,
  ROOT_LEVEL_ELEMENT_LABEL,
  FlamegraphFormatter,
} from '../../record-formatter/flamegraph-formatter/flamegraph-formatter';
import { RawData } from 'ngx-flamegraph/lib/utils';
import { ProfilerFrame } from 'protocol';

export interface GraphNode {
  name: string;
  value: number;
}

@Component({
  selector: 'ng-flamegraph-visualizer',
  templateUrl: './flamegraph-visualizer.component.html',
  styleUrls: ['./flamegraph-visualizer.component.scss'],
})
export class FlamegraphVisualizerComponent {
  profilerBars: FlamegraphNode[] = [];
  selectedEntry: FlamegraphNode | null = null;

  // graph options
  graphData: GraphNode[] = [];
  view: [number, number] = [235, 200];
  colorScheme = {
    domain: ['#E71D36', '#2EC4B6', '#FF9F1C', '#011627'],
  };

  private _formatter = new FlamegraphFormatter();
  private _showChangeDetection = false;
  private _frame: ProfilerFrame;

  @Input() set frame(frame: ProfilerFrame) {
    this.selectedEntry = null;
    this._frame = frame;
    this._selectFrame();
  }

  constructor(private _el: ElementRef) {}

  selectFrame(frame: RawData): void {
    if (frame.label === ROOT_LEVEL_ELEMENT_LABEL) {
      return;
    }
    this.selectedEntry = frame as FlamegraphNode;
    this.renderGraph(this.selectedEntry);
  }

  get availableWidth(): number {
    return this._el.nativeElement.querySelector('.level-profile-wrapper').offsetWidth;
  }

  formatPieChartData(flameGraphNode: FlamegraphNode): GraphNode[] {
    const graphData: GraphNode[] = [];
    flameGraphNode.original.directives.forEach((node) => {
      const changeDetection = node.changeDetection;
      if (changeDetection !== undefined) {
        graphData.push({
          name: `${node.name} changeDetection`,
          value: parseFloat(changeDetection.toFixed(2)),
        });
      }
      Object.keys(node.lifecycle).forEach((key) => {
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

  updateView(event: MatCheckboxChange): void {
    this._showChangeDetection = event.checked;
    this._selectFrame();
  }

  private _selectFrame(): void {
    this.profilerBars = [this._formatter.formatFrame(this._frame, this._showChangeDetection)];
  }
}
