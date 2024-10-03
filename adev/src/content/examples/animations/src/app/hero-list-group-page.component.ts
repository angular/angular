import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';
import {HeroListGroupsComponent} from './hero-list-groups.component';

@Component({
  selector: 'app-hero-list-groups-page',
  template: `
    <section>
      <h2>Hero List Group</h2>

      <app-hero-list-groups [heroes]="heroes" (remove)="onRemove($event)"></app-hero-list-groups>
    </section>
  `,
  imports: [HeroListGroupsComponent],
})
export class HeroListGroupPageComponent {
  heroes = HEROES.slice();

  onRemove(id: number) {
    this.heroes = this.heroes.filter((hero) => hero.id !== id);
  }
}
