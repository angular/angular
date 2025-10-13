import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop with a handle
 */
@Component({
  selector: 'cdk-drag-drop-handle-example',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  imports: [CdkDrag, CdkDragHandle],
})
export class CdkDragDropHandleExample {}
