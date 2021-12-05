// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';

import { Hero } from './hero';
import { HeroService } from './hero.service';

/////// HeroesBaseComponent /////
// #docregion heroes-base
@Component({
  selector: 'app-unsorted-heroes',
  template: '<div *ngFor="let hero of heroes">{{hero.name}}</div>',
  providers: [HeroService]
})
export class HeroesBaseComponent implements OnInit {
  constructor(private heroService: HeroService) { }

  heroes: Hero[] = [];

  ngOnInit() {
    this.heroes = this.heroService.getAllHeroes();
    this.afterGetHeroes();
  }

  // Post-process heroes in derived class override.
  protected afterGetHeroes() {}

}
// #enddocregion heroes-base

/////// SortedHeroesComponent /////
// #docregion sorted-heroes
@Component({
  selector: 'app-sorted-heroes',
  template: '<div *ngFor="let hero of heroes">{{hero.name}}</div>',
  providers: [HeroService]
})
export class SortedHeroesComponent extends HeroesBaseComponent {
  constructor(heroService: HeroService) {
    super(heroService);
  }

  protected override afterGetHeroes() {
    this.heroes = this.heroes.sort((h1, h2) => h1.name < h2.name ? -1 :
            (h1.name > h2.name ? 1 : 0));
  }
}
// #enddocregion sorted-heroes
