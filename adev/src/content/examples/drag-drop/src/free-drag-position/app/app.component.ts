import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Programmatically setting the free drag position
 */
@Component({
  selector: 'cdk-drag-drop-free-drag-position-example',
  templateUrl: 'cdk-drag-drop-free-drag-position-example.html',
  styleUrl: 'cdk-drag-drop-free-drag-position-example.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropFreeDragPositionExample {
  dragPosition = {x: 0, y: 0};

  changePosition() {
    this.dragPosition = {x: this.dragPosition.x + 50, y: this.dragPosition.y + 50};
  }
}
