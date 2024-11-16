// #docregion
import {Component} from '@angular/core';

import {Hero} from '../shared/hero.model';
import {NgFor} from '@angular/common';
import {HeroComponent} from '../hero/hero.component';

// #docregion example
/* avoid */

@Component({
  selector: 'toh-hero-list',
  template: `
    <section>
      Our list of heroes:
      @for (hero of heroes; track hero) {
        <toh-hero [hero]="hero"></toh-hero>
      }
      Total powers: {{totalPowers}}<br>
      Average power: {{totalPowers / heroes.length}}
    </section>
  `,
  imports: [NgFor, HeroComponent],
})
export class HeroListComponent {
  heroes: Hero[] = [];
  totalPowers: number = 0;
}
// #enddocregion example
