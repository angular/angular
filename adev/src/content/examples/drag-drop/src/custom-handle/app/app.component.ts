import {Component} from '@angular/core';
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop with a handle
 */
@Component({
  selector: 'cdk-drag-drop-handle-example',
  templateUrl: 'cdk-drag-drop-handle-example.html',
  styleUrl: 'cdk-drag-drop-handle-example.css',
  standalone: true,
  imports: [CdkDrag, CdkDragHandle],
})
export class CdkDragDropHandleExample {}
