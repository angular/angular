// #docplaster
import {Component} from '@angular/core';
import {trigger, transition, animate, style} from '@angular/animations';

@Component({
  selector: 'app-insert-remove',
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [style({opacity: 0}), animate('200ms', style({opacity: 1}))]),
      transition(':leave', [animate('200ms', style({opacity: 0}))]),
    ]),
  ],
  templateUrl: 'insert-remove.html',
  styleUrls: ['insert-remove.css'],
})
export class InsertRemove {
  isShown = false;

  toggle() {
    this.isShown = !this.isShown;
  }
}
