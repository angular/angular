import {Component} from '@angular/core';

import {Hero} from '../shared/hero.model';

@Component({
  selector: 'toh-hero-list',
  template: `
    <section>
      Our list of heroes:
      @for (hero of heroes; track hero) {
        <toh-hero>
        </toh-hero>
      }
      Total powers: {{totalPowers}}<br>
      Average power: {{avgPower}}
    </section>
    `,
})
export class HeroListComponent {
  heroes: Hero[] = [];
  totalPowers = 1;

  get avgPower() {
    return this.totalPowers / this.heroes.length;
  }
}
