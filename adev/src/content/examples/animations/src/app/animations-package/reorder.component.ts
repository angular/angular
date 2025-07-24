// #docplaster
import {Component, signal} from '@angular/core';
import {trigger, transition, animate, query, style} from '@angular/animations';

@Component({
  selector: 'app-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['reorder.component.css'],
  animations: [
    trigger('itemAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateX(-10px)'}),
        animate('300ms', style({opacity: 1, transform: 'translateX(none)'})),
      ]),
      transition(':leave', [
        style({opacity: 1, transform: 'translateX(none)'}),
        animate('300ms', style({opacity: 0, transform: 'translateX(-10px)'})),
      ]),
    ]),
  ],
})
export class ReorderComponent {
  show = signal(true);
  items = ['stuff', 'things', 'cheese', 'paper', 'scissors', 'rock'];

  randomize() {
    const randItems = [...this.items];
    const newItems = [];
    for (let i of this.items) {
      const max: number = this.items.length - newItems.length;
      const randNum = Math.floor(Math.random() * max);
      newItems.push(...randItems.splice(randNum, 1));
    }

    this.items = newItems;
  }
}
