// #docplaster
// #docregion on-init
import { OnInit } from '@angular/core';

// #enddocregion on-init
import { Component } from '@angular/core';

import { Hero } from './hero';
// #docregion hero-service-import
import { HeroService } from './hero.service.2';
// #enddocregion hero-service-import

// Testable but never shown
@Component({
  selector: 'my-app',
  template: `
  <div *ngFor="let hero of heroes" (click)="onSelect(hero)">
    {{hero.name}}
  </div>
  <hero-detail [hero]="selectedHero"></hero-detail>
  `,
  // #docregion providers
  providers: [HeroService]
  // #enddocregion providers
})
// #docregion on-init
export class AppComponent implements OnInit {
  // #enddocregion on-init
  title = 'Tour of Heroes';
  // #docregion heroes-prop
  heroes: Hero[];
  // #enddocregion heroes-prop
  selectedHero: Hero;

  /*
  // #docregion new-service
  heroService = new HeroService(); // don't do this
  // #enddocregion new-service
  */
  // #docregion ctor
  constructor(private heroService: HeroService) { }
  // #enddocregion ctor
  // #docregion getHeroes
  getHeroes(): void {
    // #docregion get-heroes
    this.heroes = this.heroService.getHeroes();
    // #enddocregion get-heroes
  }
  // #enddocregion getHeroes

  // #docregion ng-on-init
  // #docregion on-init
  ngOnInit(): void {
    // #enddocregion on-init
    this.getHeroes();
    // #docregion on-init
  }
  // #enddocregion on-init
  // #enddocregion ng-on-init

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
  // #docregion on-init
}
