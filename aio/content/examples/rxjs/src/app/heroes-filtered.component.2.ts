// #docplaster
// #docregion
import { _do } from 'rxjs/operator/do';
import { filter } from 'rxjs/operator/filter';
import { Component, OnInit }   from '@angular/core';

import { HeroService }   from './hero.service';
import { Hero }          from './hero';

@Component({
  template: `
    <h2>HEROES</h2>
    <ul class="items">
      <li *ngFor="let hero of heroes">
        <span class="badge">{{ hero.id }}</span> {{ hero.name }}
      </li>
    </ul>
  `
})
export class HeroListComponent implements OnInit {
  heroes: Hero[];

  constructor(
    private service: HeroService
  ) {}

  ngOnInit() {
    const heroes$ = this.service.getHeroes();
    const loggedHeroes$ = _do.call(heroes$, (heroes: Hero[]) => {
      console.log(heroes.length);
    });
    const filteredHeroes$ = filter.call(loggedHeroes$, (heroes: Hero[]) => heroes.length > 2);

    filteredHeroes$.subscribe((heroes: Hero[]) => this.heroes = heroes);
  }
}
