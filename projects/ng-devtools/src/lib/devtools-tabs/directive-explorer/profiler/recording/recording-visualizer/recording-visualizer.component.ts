import { Component, Input } from '@angular/core';
import { VisualizationMode } from '../timeline/timeline.component';

@Component({
  selector: 'ng-recording-visualizer',
  templateUrl: './recording-visualizer.component.html',
  styleUrls: ['./recording-visualizer.component.css'],
})
export class RecordingVisualizerComponent {
  @Input() visualizationMode: VisualizationMode;
  @Input() records;

  cmpVisualizationModes = VisualizationMode;
}
