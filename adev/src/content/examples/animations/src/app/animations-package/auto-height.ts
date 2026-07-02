import {Component, signal} from '@angular/core';
import {trigger, transition, state, animate, style} from '@angular/animations';

@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
      state('true', style({height: '*'})),
      state('false', style({height: '0px'})),
      transition('false <=> true', animate(1000)),
    ]),
  ],
  templateUrl: 'auto-height.html',
  styleUrl: 'auto-height.css',
})
export class AutoHeight {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
