import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';
import {HeroListAuto} from './hero-list-auto';

@Component({
  selector: 'app-hero-list-auto-page',
  template: `
    <section>
      <h2>Automatic Calculation</h2>

      <app-hero-list-auto [heroes]="heroes" (remove)="onRemove($event)"></app-hero-list-auto>
    </section>
  `,
  imports: [HeroListAuto],
})
export class HeroListAutoCalcPage {
  heroes = HEROES.slice();

  onRemove(id: number) {
    this.heroes = this.heroes.filter((hero) => hero.id !== id);
  }
}
