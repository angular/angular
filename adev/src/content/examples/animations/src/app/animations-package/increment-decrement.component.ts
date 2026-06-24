// #docplaster
// #docregion
import {Component, signal} from '@angular/core';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';

@Component({
  selector: 'app-increment-decrement',
  templateUrl: 'increment-decrement.component.html',
  styleUrls: ['increment-decrement.component.css'],
  animations: [
    trigger('incrementAnimation', [
      transition(':increment', [
        animate('300ms ease-out', style({color: 'green', transform: 'scale(1.3, 1.2)'})),
      ]),
      transition(':decrement', [
        animate('300ms ease-out', style({color: 'red', transform: 'scale(0.8, 0.9)'})),
      ]),
    ]),
  ],
})
export class IncrementDecrementComponent {
  num = signal(0);

  modify(n: number) {
    this.num.update((v) => (v += n));
  }
}
