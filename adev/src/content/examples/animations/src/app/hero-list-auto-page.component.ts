import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';
import {HeroListAutoComponent} from './hero-list-auto.component';

@Component({
  selector: 'app-hero-list-auto-page',
  template: `
    <section>
      <h2>Automatic Calculation</h2>

      <app-hero-list-auto [heroes]="heroes" (remove)="onRemove($event)"></app-hero-list-auto>
    </section>
  `,
  imports: [HeroListAutoComponent],
})
export class HeroListAutoCalcPageComponent {
  heroes = HEROES.slice();

  onRemove(id: number) {
    this.heroes = this.heroes.filter((hero) => hero.id !== id);
  }
}
