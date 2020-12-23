import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BargraphNode, BarGraphFormatter } from '../../record-formatter/bargraph-formatter';
import { ProfilerFrame } from 'protocol';
import { SelectedDirective, SelectedEntry } from '../timeline-visualizer.component';

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
})
export class BargraphVisualizerComponent {
  barColor = '#FFC400';
  profileRecords: BargraphNode[];

  @Output() nodeSelect = new EventEmitter<SelectedEntry>();

  private _formatter = new BarGraphFormatter();

  @Input() set frame(data: ProfilerFrame) {
    this.profileRecords = this._formatter.formatFrame(data);
  }

  formatEntryData(bargraphNode: BargraphNode): SelectedDirective[] {
    const graphData: SelectedDirective[] = [];
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

  selectNode(node: BargraphNode): void {
    this.nodeSelect.emit({
      entry: node,
      parentHierarchy: node.parents.map((element) => {
        return { name: element.directives[0].name };
      }),
      selectedDirectives: this.formatEntryData(node),
    });
  }
}
