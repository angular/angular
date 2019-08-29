// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';

import { Hero } from '../hero';
// #docregion hero-service-import
import { HeroService } from '../hero.service';
// #enddocregion hero-service-import

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {

  selectedHero: Hero;

  // #docregion heroes
  heroes: Hero[];
  // #enddocregion heroes

  // #docregion ctor
  constructor(private heroService: HeroService) { }
  // #enddocregion ctor

  // #docregion ng-on-init
  ngOnInit() {
    this.getHeroes();
  }
  // #enddocregion ng-on-init

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }

  // #docregion getHeroes
  getHeroes(): void {
    this.heroService.getHeroes()
        .subscribe(heroes => this.heroes = heroes);
  }
  // #enddocregion getHeroes
}
