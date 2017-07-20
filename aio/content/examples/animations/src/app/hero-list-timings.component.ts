import {
  Component,
  Input
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import { Heroes } from './hero.service';

@Component({
  selector: 'hero-list-timings',
  template: `
    <ul>
      <li *ngFor="let hero of heroes"
          [@flyInOut]="'in'"
          (click)="hero.toggleState()">
         {{hero.name}}
      </li>
    </ul>
  `,
  styleUrls: ['./hero-list.component.css'],
  /* The element here always has the state "in" when it
   * is present. We animate two transitions: From void
   * to in and from in to void, to achieve an animated
   * enter and leave transition. The element enters from
   * the left and leaves to the right using translateX,
   * and fades in/out using opacity. We use different easings
   * for enter and leave.
   */
  // #docregion animationdef
  animations: [
    trigger('flyInOut', [
      state('in', style({opacity: 1, transform: 'translateX(0)'})),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-100%)'
        }),
        animate('0.2s ease-in')
      ]),
      transition('* => void', [
        animate('0.2s 10 ease-out', style({
          opacity: 0,
          transform: 'translateX(100%)'
        }))
      ])
    ])
  ]
  // #enddocregion animationdef
})
export class HeroListTimingsComponent {
  @Input() heroes: Heroes;
}
