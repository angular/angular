import {
  Component,
  Input,
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/core';

import { Heroes } from './hero.service';

@Component({
  moduleId: module.id,
  selector: 'hero-list-auto',
  // #docregion template
  template: `
    <ul>
      <li *ngFor="let hero of heroes"
          [@shrinkOut]="'in'">
        {{hero.name}}
      </li>
    </ul>
  `,
  // #enddocregion template
  styleUrls: ['./hero-list.component.css'],

  /* When the element leaves (transition "in => void" occurs),
   * get the element's current computed height and animate
   * it down to 0.
   */
  // #docregion animationdef
  animations: [
    trigger('shrinkOut', [
      state('in', style({height: '*'})),
      transition('* => void', [
        style({height: '*'}),
        animate(250, style({height: 0}))
      ])
    ])
  ]
  // #enddocregion animationdef
})
export class HeroListAutoComponent {
  @Input() heroes: Heroes;
}
