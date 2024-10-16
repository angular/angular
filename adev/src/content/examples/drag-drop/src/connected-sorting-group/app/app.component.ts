import {Component} from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop connected sorting group
 */
@Component({
  selector: 'cdk-drag-drop-connected-sorting-group-example',
  templateUrl: 'cdk-drag-drop-connected-sorting-group-example.html',
  styleUrl: 'cdk-drag-drop-connected-sorting-group-example.css',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class CdkDragDropConnectedSortingGroupExample {
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

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
