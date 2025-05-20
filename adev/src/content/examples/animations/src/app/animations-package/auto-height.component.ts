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
  templateUrl: 'auto-height.component.html',
  styleUrl: 'auto-height.component.css',
})
export class AutoHeightComponent {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update((isOpen) => !isOpen);
  }
}
