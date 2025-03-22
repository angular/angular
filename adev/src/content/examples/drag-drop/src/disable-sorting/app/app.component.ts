import {Component} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop disabled sorting
 */
@Component({
  selector: 'cdk-drag-drop-disabled-sorting-example',
  templateUrl: 'cdk-drag-drop-disabled-sorting-example.html',
  styleUrl: 'cdk-drag-drop-disabled-sorting-example.css',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class CdkDragDropDisabledSortingExample {
  items = ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'];

  basket = ['Oranges', 'Bananas', 'Cucumbers'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
