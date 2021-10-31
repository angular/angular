// #docplaster
// #docregion
import { Component } from '@angular/core';

import { Hero } from '../shared/hero.model';

// #docregion example
@Component({
  selector: 'toh-hero-list',
  template: `
    <section>
      Our list of heroes:
      <toh-hero *ngFor="let hero of heroes" [hero]="hero">
      </toh-hero>
      Total powers: {{totalPowers}}<br>
      Average power: {{avgPower}}
    </section>
  `
})
export class HeroListComponent {
  heroes: Hero[];
  totalPowers = 0;

  // #enddocregion example
  // testing harness
  constructor() {
    this.heroes = [];
  }

  // #docregion example
  get avgPower() {
    return this.totalPowers / this.heroes.length;
  }
}
// #enddocregion example
