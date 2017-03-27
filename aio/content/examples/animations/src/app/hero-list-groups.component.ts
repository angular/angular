import {
  Component,
  Input
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group
} from '@angular/animations';

import { Heroes } from './hero.service';

@Component({
  selector: 'hero-list-groups',
  template: `
    <ul>
      <li *ngFor="let hero of heroes"
          [@flyInOut]="'in'">
        {{hero.name}}
      </li>
    </ul>
  `,
  styleUrls: ['./hero-list.component.css'],
  styles: [`
    li {
      padding: 0 !important;
      text-align: center;
    }
  `],
  /* The element here always has the state "in" when it
   * is present. We animate two transitions: From void
   * to in and from in to void, to achieve an animated
   * enter and leave transition.
   *
   * The transitions have  *parallel group* that allow
   * animating several properties at the same time but
   * with different timing configurations. On enter
   * (void => *) we start the opacity animation 0.1s
   * earlier than the translation/width animation.
   * On leave (* => void) we do the opposite -
   * the translation/width animation begins immediately
   * and the opacity animation 0.1s later.
   */
  // #docregion animationdef
  animations: [
    trigger('flyInOut', [
      state('in', style({width: 120, transform: 'translateX(0)', opacity: 1})),
      transition('void => *', [
        style({width: 10, transform: 'translateX(50px)', opacity: 0}),
        group([
          animate('0.3s 0.1s ease', style({
            transform: 'translateX(0)',
            width: 120
          })),
          animate('0.3s ease', style({
            opacity: 1
          }))
        ])
      ]),
      transition('* => void', [
        group([
          animate('0.3s ease', style({
            transform: 'translateX(50px)',
            width: 10
          })),
          animate('0.3s 0.2s ease', style({
            opacity: 0
          }))
        ])
      ])
    ])
  ]
  // #enddocregion animationdef
})
export class HeroListGroupsComponent {
  @Input() heroes: Heroes;
}
