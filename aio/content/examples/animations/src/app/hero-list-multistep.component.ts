import {
  Component,
  Input,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
  AnimationEvent
} from '@angular/animations';

import { Heroes } from './hero.service';

@Component({
  selector: 'hero-list-multistep',
  // #docregion template
  template: `
    <ul>
      <li *ngFor="let hero of heroes"
          (@flyInOut.start)="animationStarted($event)"
          (@flyInOut.done)="animationDone($event)"
          [@flyInOut]="'in'">
        {{hero.name}}
      </li>
    </ul>
  `,
  // #enddocregion template
  styleUrls: ['./hero-list.component.css'],
  /* The element here always has the state "in" when it
   * is present. We animate two transitions: From void
   * to in and from in to void, to achieve an animated
   * enter and leave transition. Each transition is
   * defined in terms of multiple keyframes, to give it
   * a bounce effect.
   */
  // #docregion animationdef
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        animate(300, keyframes([
          style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
          style({opacity: 1, transform: 'translateX(15px)',  offset: 0.3}),
          style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
        ]))
      ]),
      transition('* => void', [
        animate(300, keyframes([
          style({opacity: 1, transform: 'translateX(0)',     offset: 0}),
          style({opacity: 1, transform: 'translateX(-15px)', offset: 0.7}),
          style({opacity: 0, transform: 'translateX(100%)',  offset: 1.0})
        ]))
      ])
    ])
  ]
  // #enddocregion animationdef
})
export class HeroListMultistepComponent {
  @Input() heroes: Heroes;

  animationStarted(event: AnimationEvent) {
    console.warn('Animation started: ', event);
  }

  animationDone(event: AnimationEvent) {
    console.warn('Animation done: ', event);
  }
}
