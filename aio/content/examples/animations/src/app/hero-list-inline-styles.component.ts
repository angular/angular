// #docregion
// #docregion imports
import {
  Component,
  Input,
} from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';
// #enddocregion imports

import { Heroes } from './hero.service';

@Component({
 selector: 'hero-list-inline-styles',
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
 /**
  * Define two states, "inactive" and "active", and the end
  * styles that apply whenever the element is in those states.
  * Then define an animation for the inactive => active transition.
  * This animation has no end styles, but only styles that are
  * defined inline inside the transition and thus are only kept
  * as long as the animation is running.
  */
 // #docregion animationdef
 animations: [
   trigger('heroState', [
     // #docregion transitions
     transition('inactive => active', [
       style({
         backgroundColor: '#cfd8dc',
         transform: 'scale(1.3)'
       }),
       animate('80ms ease-in', style({
         backgroundColor: '#eee',
         transform: 'scale(1)'
       }))
     ]),
     // #enddocregion transitions
   ])
 ]
 // #enddocregion animationdef
})
export class HeroListInlineStylesComponent {
 @Input() heroes: Heroes;
}
