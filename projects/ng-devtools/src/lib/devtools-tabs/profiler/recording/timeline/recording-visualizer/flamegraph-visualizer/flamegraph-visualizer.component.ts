import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

import {
  FlamegraphNode,
  ROOT_LEVEL_ELEMENT_LABEL,
  FlamegraphFormatter,
} from '../../record-formatter/flamegraph-formatter/flamegraph-formatter';
import { RawData } from 'ngx-flamegraph/lib/utils';
import { ProfilerFrame } from 'protocol';
import { SelectedDirective, SelectedEntry } from '../timeline-visualizer.component';

export interface GraphNode {
  directive: string;
  method: string;
  value: number;
}

@Component({
  selector: 'ng-flamegraph-visualizer',
  templateUrl: './flamegraph-visualizer.component.html',
  styleUrls: ['./flamegraph-visualizer.component.scss'],
})
export class FlamegraphVisualizerComponent {
  profilerBars: FlamegraphNode[] = [];
  view: [number, number] = [235, 200];

  colors = {
    hue: [50, 0],
    saturation: 280,
    lightness: 75,
  };

  private _formatter = new FlamegraphFormatter();
  private _showChangeDetection = false;
  private _frame: ProfilerFrame;

  @Output() nodeSelect = new EventEmitter<SelectedEntry>();

  @Input() set frame(frame: ProfilerFrame) {
    this._frame = frame;
    this._selectFrame();
  }

  @Input() set changeDetection(changeDetection: boolean) {
    this._showChangeDetection = changeDetection;
    this._selectFrame();
  }

  constructor(private _el: ElementRef) {}

  get availableWidth(): number {
    return this._el.nativeElement.querySelector('.level-profile-wrapper').offsetWidth;
  }

  selectFrame(frame: RawData): void {
    if (frame.label === ROOT_LEVEL_ELEMENT_LABEL) {
      return;
    }

    const flameGraphNode = frame as FlamegraphNode;
    const directiveData = this.formatEntryData(flameGraphNode);

    this.nodeSelect.emit({
      entry: flameGraphNode,
      selectedDirectives: directiveData,
    });
  }

  formatEntryData(flameGraphNode: FlamegraphNode): SelectedDirective[] {
    const graphData: SelectedDirective[] = [];
    flameGraphNode.original.directives.forEach((node) => {
      const changeDetection = node.changeDetection;
      if (changeDetection !== undefined) {
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

  private _selectFrame(): void {
    this.profilerBars = [this._formatter.formatFrame(this._frame, this._showChangeDetection)];
  }
}
