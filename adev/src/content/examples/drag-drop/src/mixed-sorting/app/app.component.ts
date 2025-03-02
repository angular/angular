import {Component} from '@angular/core';
import {CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop horizontal wrapping list
 */
@Component({
  selector: 'cdk-drag-drop-mixed-sorting-example',
  templateUrl: 'cdk-drag-drop-mixed-sorting-example.html',
  styleUrl: 'cdk-drag-drop-mixed-sorting-example.css',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropMixedSortingExample {
  items = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
