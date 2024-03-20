// #docplaster
// #docregion
import {Component, OnInit} from '@angular/core';

import {Hero} from './hero';
import {HeroService} from './hero.service';
import {NgFor} from '@angular/common';

/////// HeroesBaseComponent /////
// #docregion heroes-base
@Component({
  standalone: true,
  selector: 'app-unsorted-heroes',
  template: '@for (hero of heroes; track hero) {<div>{{hero.name}}</div>}',
  providers: [HeroService],
  imports: [NgFor],
})
export class HeroesBaseComponent implements OnInit {
  constructor(private heroService: HeroService) {}

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
  standalone: true,
  selector: 'app-sorted-heroes',
  template: '@for (hero of heroes; track hero) {<div>{{hero.name}}</div>}',
  providers: [HeroService],
  imports: [NgFor],
})
export class SortedHeroesComponent extends HeroesBaseComponent {
  constructor(heroService: HeroService) {
    super(heroService);
  }

  protected override afterGetHeroes() {
    this.heroes = this.heroes.sort((h1, h2) =>
      h1.name < h2.name ? -1 : h1.name > h2.name ? 1 : 0,
    );
  }
}
// #enddocregion sorted-heroes
