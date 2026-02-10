import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';
import {HeroListGroups} from './hero-list-groups';

@Component({
  selector: 'app-hero-list-groups-page',
  template: `
    <section>
      <h2>Hero List Group</h2>

      <app-hero-list-groups [heroes]="heroes" (remove)="onRemove($event)" />
    </section>
  `,
  imports: [HeroListGroups],
})
export class HeroListGroupPage {
  heroes = HEROES.slice();

  onRemove(id: number) {
    this.heroes = this.heroes.filter((hero) => hero.id !== id);
  }
}
