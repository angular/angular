// #docplaster
// #docregion
// TODO SOMEDAY: Feature Componetized like HeroCenter
import { Component, OnInit }   from '@angular/core';
import { Router }              from '@angular/router';

import { Hero, HeroService }   from './hero.service';

@Component({
  // #docregion template
  template: `
    <h2>HEROES</h2>
    <ul class="items">
      <li *ngFor="let hero of heroes | async"
        (click)="onSelect(hero)">
        <span class="badge">{{ hero.id }}</span> {{ hero.name }}
      </li>
    </ul>

    <button routerLink="/sidekicks">Go to sidekicks</button>
  `
  // #enddocregion template
})
export class HeroListComponent implements OnInit {
  heroes: Promise<Hero[]>;

  // #docregion ctor
  constructor(
    private router: Router,
    private service: HeroService
  ) {}
  // #enddocregion ctor

  ngOnInit() {
    this.heroes = this.service.getHeroes();
  }

  // #docregion select
  onSelect(hero: Hero) {
    // #docregion nav-to-detail
    this.router.navigate(['/hero', hero.id]);
    // #enddocregion nav-to-detail
  }
  // #enddocregion select
}
// #enddocregion

/* A link parameters array
// #docregion link-parameters-array
['/hero', hero.id] // { 15 }
// #enddocregion link-parameters-array
*/
