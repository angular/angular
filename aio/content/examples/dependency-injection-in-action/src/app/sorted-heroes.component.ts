// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';

import { Hero }              from './hero';
import { HeroService }       from './hero.service';

/////// HeroesBaseComponent /////
// #docregion heroes-base, injection
@Component({
  selector: 'unsorted-heroes',
  template: `<div *ngFor="let hero of heroes">{{hero.name}}</div>`,
  providers: [HeroService]
})
export class HeroesBaseComponent implements OnInit {
  constructor(private heroService: HeroService) { }
// #enddocregion injection

  heroes: Array<Hero>;

  ngOnInit() {
    this.heroes = this.heroService.getAllHeroes();
    this.afterGetHeroes();
  }

  // Post-process heroes in derived class override.
  protected afterGetHeroes() {}

// #docregion injection
}
// #enddocregion heroes-base,injection

/////// SortedHeroesComponent /////
// #docregion sorted-heroes
@Component({
  selector: 'sorted-heroes',
  template: `<div *ngFor="let hero of heroes">{{hero.name}}</div>`,
  providers: [HeroService]
})
export class SortedHeroesComponent extends HeroesBaseComponent {
  constructor(heroService: HeroService) {
    super(heroService);
  }

  protected afterGetHeroes() {
    this.heroes = this.heroes.sort((h1, h2) => {
      return h1.name < h2.name ? -1 :
            (h1.name > h2.name ? 1 : 0);
    });
  }
}
// #enddocregion sorted-heroes
