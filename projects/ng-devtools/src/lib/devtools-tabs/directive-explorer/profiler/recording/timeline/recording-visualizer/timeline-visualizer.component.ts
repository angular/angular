import { Component, Input } from '@angular/core';
import { VisualizationMode } from '../timeline.component';

@Component({
  selector: 'ng-timeline-visualizer',
  templateUrl: './timeline-visualizer.component.html',
  styleUrls: ['./timeline-visualizer.component.css'],
})
export class TimelineVisualizerComponent {
  @Input() visualizationMode: VisualizationMode;
  @Input() records;

  cmpVisualizationModes = VisualizationMode;
}
