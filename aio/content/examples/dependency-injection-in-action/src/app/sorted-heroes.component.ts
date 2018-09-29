// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';

import { Hero }              from './hero';
import { HeroService }       from './hero.service';

/////// HeroesBaseComponent /////
// #docregion heroes-base, injection
@Component({
  selector: 'app-unsorted-heroes',
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

  // 히어로 목록을 처리하는 로직은 자식 클래스에서 오버라이드합니다.
  protected afterGetHeroes() {}

// #docregion injection
}
// #enddocregion heroes-base,injection

/////// SortedHeroesComponent /////
// #docregion sorted-heroes
@Component({
  selector: 'app-sorted-heroes',
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
