import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop position locking
 */
@Component({
  selector: 'cdk-drag-drop-axis-lock-example',
  templateUrl: 'cdk-drag-drop-axis-lock-example.html',
  styleUrl: 'cdk-drag-drop-axis-lock-example.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropAxisLockExample {}
