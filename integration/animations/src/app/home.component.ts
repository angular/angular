import {Component, AnimationCallbackEvent} from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  CdkDragPlaceholder,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class HomeComponent {
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
  ];

  testItems = ['A', 'B'];

  showFallback = true;

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

  hideAndIntercept() {
    const el = document.querySelector('.fallback-el');
    if (el) {
      el.addEventListener(
        'animationend',
        (e) => {
          e.stopImmediatePropagation();
        },
        true,
      );
    }
    this.showFallback = false;
  }

  shuffleTest() {
    this.testItems = ['B', 'A'];
  }

  removeTest() {
    this.testItems = ['A'];
  }

  onTestLeave(event: AnimationCallbackEvent) {
    event.animationComplete();
  }
}
