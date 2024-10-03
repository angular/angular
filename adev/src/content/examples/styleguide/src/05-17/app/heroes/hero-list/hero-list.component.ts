// #docplaster
// #docregion
import {Component} from '@angular/core';
import {HeroComponent} from '../hero/hero.component';
import {Hero} from '../shared/hero.model';
import {NgFor} from '@angular/common';

// #docregion example
@Component({
  selector: 'toh-hero-list',
  template: `
    <section>
      Our list of heroes:
      @for (hero of heroes; track hero) {
        <toh-hero [hero]="hero"></toh-hero>
      }
      Total powers: {{totalPowers}}<br>
      Average power: {{avgPower}}
    </section>
  `,
  imports: [NgFor, HeroComponent],
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
