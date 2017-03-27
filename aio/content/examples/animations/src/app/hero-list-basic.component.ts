// #docplaster
// #docregion
// #docregion imports
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
// #enddocregion imports

import { Heroes } from './hero.service';

@Component({
  selector: 'hero-list-basic',
  // #enddocregion
  /* The click event calls hero.toggleState(), which
   * causes the state of that hero to switch from
   * active to inactive or vice versa.
   */
  // #docregion
  // #docregion template
  template: `
    <ul>
      <li *ngFor="let hero of heroes"
          [@heroState]="hero.state"
          (click)="hero.toggleState()">
        {{hero.name}}
      </li>
    </ul>
  `,
  // #enddocregion template
  styleUrls: ['./hero-list.component.css'],
  // #enddocregion
  /**
   * Define two states, "inactive" and "active", and the end
   * styles that apply whenever the element is in those states.
   * Then define animations for transitioning between the states,
   * one in each direction
   */
  // #docregion
  // #docregion animationdef
  animations: [
    trigger('heroState', [
      // #docregion states
      state('inactive', style({
        backgroundColor: '#eee',
        transform: 'scale(1)'
      })),
      state('active',   style({
        backgroundColor: '#cfd8dc',
        transform: 'scale(1.1)'
      })),
      // #enddocregion states
      // #docregion transitions
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
      // #enddocregion transitions
    ])
  ]
  // #enddocregion animationdef
})
export class HeroListBasicComponent {
  @Input() heroes: Heroes;
}
