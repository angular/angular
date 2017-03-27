// #docregion
import { Component } from '@angular/core';

import { Hero } from '../shared/hero.model';
// #docregion example
/* avoid */

@Component({
  selector: 'toh-hero-list',
  template: `
    <section>
      Our list of heroes:
      <hero-profile *ngFor="let hero of heroes" [hero]="hero">
      </hero-profile>
      Total powers: {{totalPowers}}<br>
      Average power: {{totalPowers / heroes.length}}
    </section>
  `
})
export class HeroListComponent {
  heroes: Hero[];
  totalPowers: number;
}
// #enddocregion example
