import {Component} from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  CdkDragPlaceholder,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

// We want to verify that dragging an item does not result in any items disappearing
// when they have an enter/leave animation.

@Component({
  selector: 'app-root',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
}
