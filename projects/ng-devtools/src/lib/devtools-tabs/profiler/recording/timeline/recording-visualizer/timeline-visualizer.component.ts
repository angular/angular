import { Component, Input } from '@angular/core';
import { VisualizationMode } from '../timeline.component';
import { FlamegraphNode } from '../record-formatter/flamegraph-formatter';
import { TreeMapNode } from '../record-formatter/tree-map-formatter';
import { BargraphNode } from '../record-formatter/bargraph-formatter';

@Component({
  selector: 'ng-timeline-visualizer',
  templateUrl: './timeline-visualizer.component.html',
  styleUrls: ['./timeline-visualizer.component.scss'],
})
export class TimelineVisualizerComponent {
  @Input() visualizationMode: VisualizationMode;
  @Input() records: FlamegraphNode[] | TreeMapNode[] | BargraphNode[];

  cmpVisualizationModes = VisualizationMode;
}
