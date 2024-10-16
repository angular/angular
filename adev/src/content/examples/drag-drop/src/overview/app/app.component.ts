import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Basic Drag&Drop
 */
@Component({
  selector: 'cdk-drag-drop-overview-example',
  templateUrl: 'cdk-drag-drop-overview-example.html',
  styleUrl: 'cdk-drag-drop-overview-example.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropOverviewExample {}
