import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Drag&Drop position locking
 */
@Component({
  selector: 'cdk-drag-drop-axis-lock-example',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropAxisLockExample {}
