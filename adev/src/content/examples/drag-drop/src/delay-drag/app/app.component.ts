import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Delay dragging
 */
@Component({
  selector: 'cdk-drag-drop-delay-example',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropDelayExample {}
