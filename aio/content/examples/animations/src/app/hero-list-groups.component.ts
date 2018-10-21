import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group
} from '@angular/animations';

import { Hero } from './hero';

@Component({
  selector: 'app-hero-list-groups',
  template: `
    <ul class="heroes">
      <li *ngFor="let hero of heroes"
          [@flyInOut]="'in'" (click)="removeHero(hero.id)">
          <div class="inner">
            <span class="badge">{{ hero.id }}</span>
            <span>{{ hero.name }}</span>
          </div>
      </li>
    </ul>
  `,
  styleUrls: ['./hero-list-page.component.css'],
  // #docregion animationdef
  animations: [
    trigger('flyInOut', [
      state('in', style({
        width: 120,
        transform: 'translateX(0)', opacity: 1
      })),
      transition('void => *', [
        style({ width: 10, transform: 'translateX(50px)', opacity: 0 }),
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
   @Input() heroes: Hero[];

   @Output() remove = new EventEmitter<number>();

   removeHero(id: number) {
     this.remove.emit(id);
   }
}
