import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop with a handle
 */
@Component({
  selector: 'cdk-drag-drop-handle-example',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CdkDrag, CdkDragHandle],
})
export class CdkDragDropHandleExample {}
