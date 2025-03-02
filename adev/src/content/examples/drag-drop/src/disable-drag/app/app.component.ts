import {Component} from '@angular/core';
import {CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop disabled
 */
@Component({
  selector: 'cdk-drag-drop-disabled-example',
  templateUrl: 'cdk-drag-drop-disabled-example.html',
  styleUrl: 'cdk-drag-drop-disabled-example.css',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
})
export class CdkDragDropDisabledExample {
  items = [
    {value: 'I can be dragged', disabled: false},
    {value: 'I cannot be dragged', disabled: true},
    {value: 'I can also be dragged', disabled: false},
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
