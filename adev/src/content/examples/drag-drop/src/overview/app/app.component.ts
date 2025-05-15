import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';

/**
 * @title Basic Drag&Drop
 */
@Component({
  selector: 'cdk-drag-drop-overview-example',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropOverviewExample {}
