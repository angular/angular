// #docplaster
import {Component} from '@angular/core';
import {trigger, transition, animate, style} from '@angular/animations';

@Component({
  selector: 'app-insert-remove',
  animations: [
    // #docregion enter-leave-trigger
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [style({opacity: 0}), animate('100ms', style({opacity: 1}))]),
      transition(':leave', [animate('100ms', style({opacity: 0}))]),
    ]),
    // #enddocregion enter-leave-trigger
  ],
  templateUrl: 'insert-remove.component.html',
  styleUrls: ['insert-remove.component.css'],
})
export class InsertRemoveComponent {
  isShown = false;

  toggle() {
    this.isShown = !this.isShown;
  }
}
