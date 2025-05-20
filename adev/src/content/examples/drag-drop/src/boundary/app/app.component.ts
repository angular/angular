import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop boundary
 */
@Component({
  selector: 'cdk-drag-drop-boundary-example',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropBoundaryExample {}
