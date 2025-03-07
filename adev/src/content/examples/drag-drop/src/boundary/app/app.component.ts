import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop boundary
 */
@Component({
  selector: 'cdk-drag-drop-boundary-example',
  templateUrl: 'cdk-drag-drop-boundary-example.html',
  styleUrl: 'cdk-drag-drop-boundary-example.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropBoundaryExample {}
