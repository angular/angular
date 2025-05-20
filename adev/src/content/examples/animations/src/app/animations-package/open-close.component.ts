import {Component, signal} from '@angular/core';
import {trigger, transition, state, animate, style, keyframes} from '@angular/animations';

@Component({
  selector: 'app-open-close',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '200px',
          opacity: 1,
          backgroundColor: 'yellow',
        }),
      ),
      state(
        'closed',
        style({
          height: '100px',
          opacity: 0.5,
          backgroundColor: 'green',
        }),
      ),
      // ...
      transition('* => *', [
        animate(
          '1s',
          keyframes([
            style({opacity: 0.1, offset: 0.1}),
            style({opacity: 0.6, offset: 0.2}),
            style({opacity: 1, offset: 0.5}),
            style({opacity: 0.2, offset: 0.7}),
          ]),
        ),
      ]),
    ]),
  ],
  templateUrl: 'open-close.component.html',
  styleUrl: 'open-close.component.css',
})
export class OpenCloseComponent {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
