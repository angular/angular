import {Component} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop custom placeholder
 */
@Component({
  selector: 'cdk-drag-drop-custom-placeholder-example',
  templateUrl: 'cdk-drag-drop-custom-placeholder-example.html',
  styleUrl: 'cdk-drag-drop-custom-placeholder-example.css',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder],
})
export class CdkDragDropCustomPlaceholderExample {
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX - The Rise of Skywalker',
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
}
