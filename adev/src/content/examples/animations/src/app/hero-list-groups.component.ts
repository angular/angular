import {Component, output, input} from '@angular/core';
import {trigger, state, style, animate, transition, group} from '@angular/animations';

import {Hero} from './hero';

@Component({
  selector: 'app-hero-list-groups',
  template: `
    <ul class="heroes">
      @for (hero of heroes(); track hero) {
        <li [@flyInOut]="'in'">
          <button class="inner" type="button" (click)="removeHero(hero.id)">
            <span class="badge">{{ hero.id }}</span>
            <span class="name">{{ hero.name }}</span>
          </button>
        </li>
      }
    </ul>
  `,
  styleUrls: ['./hero-list-page.component.css'],
  // #docregion animationdef
  animations: [
    trigger('flyInOut', [
      state(
        'in',
        style({
          width: '*',
          transform: 'translateX(0)',
          opacity: 1,
        }),
      ),
      transition(':enter', [
        style({width: 10, transform: 'translateX(50px)', opacity: 0}),
        group([
          animate(
            '0.3s 0.1s ease',
            style({
              transform: 'translateX(0)',
              width: '*',
            }),
          ),
          animate(
            '0.3s ease',
            style({
              opacity: 1,
            }),
          ),
        ]),
      ]),
      transition(':leave', [
        group([
          animate(
            '0.3s ease',
            style({
              transform: 'translateX(50px)',
              width: 10,
            }),
          ),
          animate(
            '0.3s 0.2s ease',
            style({
              opacity: 0,
            }),
          ),
        ]),
      ]),
    ]),
  ],
  // #enddocregion animationdef
})
export class HeroListGroupsComponent {
  heroes = input<Hero[]>([]);

  remove = output<number>();

  removeHero(id: number) {
    this.remove.emit(id);
  }
}
