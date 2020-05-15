import { Component, Input } from '@angular/core';

export interface GraphNode {
  directive: string;
  method: string;
  value: number;
}

@Component({
  selector: 'ng-execution-details',
  templateUrl: './execution-details.component.html',
  styleUrls: ['./execution-details.component.scss'],
})
export class ExecutionDetailsComponent {
  @Input() data: GraphNode[];
}
