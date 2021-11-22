import { Component, Input } from '@angular/core';
import { SelectedDirective } from './timeline-visualizer.component';

@Component({
  selector: 'ng-execution-details',
  templateUrl: './execution-details.component.html',
  styleUrls: ['./execution-details.component.scss'],
})
export class ExecutionDetailsComponent {
  @Input() data: SelectedDirective[];
}
