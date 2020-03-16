import { Component, Input } from '@angular/core';
import { VisualizationMode } from '../timeline.component';
import { TimelineView } from '../record-formatter/record-formatter';
import { FlamegraphNode } from '../record-formatter/flamegraph-formatter';
import { WebtreegraphNode } from '../record-formatter/webtreegraph-formatter';

@Component({
  selector: 'ng-timeline-visualizer',
  templateUrl: './timeline-visualizer.component.html',
  styleUrls: ['./timeline-visualizer.component.css'],
})
export class TimelineVisualizerComponent {
  @Input() visualizationMode: VisualizationMode;
  @Input() records: FlamegraphNode[] | WebtreegraphNode[];

  cmpVisualizationModes = VisualizationMode;
}
