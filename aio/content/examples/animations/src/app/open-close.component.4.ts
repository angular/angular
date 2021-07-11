// #docplaster
// #docregion
import { Component } from '@angular/core';
import { trigger, transition, state, animate, style } from '@angular/animations';

// #docregion toggle-animation
@Component({
// #enddocregion toggle-animation
  selector: 'app-open-close-toggle',
  templateUrl: 'open-close.component.4.html',
  styleUrls: ['open-close.component.css'],
  // #docregion toggle-animation
  animations: [
    trigger('childAnimation', [
      // ...
// #enddocregion toggle-animation
      state('open', style({
        width: '250px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
      state('closed', style({
        width: '100px',
        opacity: 0.8,
        backgroundColor: 'blue'
      })),
      transition('* => *', [
        animate('1s')
      ]),
// #docregion toggle-animation
    ]),
  ],
})
export class OpenCloseChildComponent {
  isDisabled = false;
  isOpen = false;
// #enddocregion toggle-animation
  toggleAnimations() {
    this.isDisabled = !this.isDisabled;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
// #docregion toggle-animation
}
// #enddocregion toggle-animation
