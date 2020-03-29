import { Component, Input } from '@angular/core';
import { BargraphNode } from '../../record-formatter/bargraph-formatter';

@Component({
  selector: 'ng-bargraph-visualizer',
  templateUrl: './bargraph-visualizer.component.html',
  styleUrls: ['./bargraph-visualizer.component.scss'],
})
export class BargraphVisualizerComponent {
  view: [number, number] = [600, 600];
  colorScheme = {
    domain: ['rgb(237, 213, 94)', 'rgb(240, 117, 117)', 'rgb(238, 189, 99)'],
  };
  profileRecords: BargraphNode[];

  @Input() set records(data: BargraphNode[]) {
    this.profileRecords = data;
    this.view = [1000, data.length * 30];
  }
}
