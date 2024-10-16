import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Delay dragging
 */
@Component({
  selector: 'cdk-drag-drop-delay-example',
  templateUrl: 'cdk-drag-drop-delay-example.html',
  styleUrl: 'cdk-drag-drop-delay-example.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropDelayExample {}
