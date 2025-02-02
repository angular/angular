// #docregion
import {Component, inject, OnInit} from '@angular/core';

import {Hero, HeroService} from './shared';

@Component({
  selector: 'toh-heroes',
  template: `
      <pre>{{heroes | json}}</pre>
    `,
  standalone: false,
})
export class HeroesComponent {
  heroes: Hero[] = [];

  private heroService = inject(HeroService);

  constructor() {
    this.heroService.getHeroes().then((heroes) => (this.heroes = heroes));
  }
}
