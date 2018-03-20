// #docplaster
// #docregion
// TODO SOMEDAY: Feature Componetized like HeroCenter
import { Component, OnInit }   from '@angular/core';
import { Router }              from '@angular/router';
import { Observable }          from 'rxjs';

import { Hero, HeroService }   from './hero.service';

@Component({
  // #docregion template
  template: `
    <h2>HEROES</h2>
    <ul class="items">
      <li *ngFor="let hero of heroes$ | async">
        // #docregion nav-to-detail
        <a [routerLink]="['/hero', hero.id]">
          <span class="badge">{{ hero.id }}</span>{{ hero.name }}
        </a>
        // #enddocregion nav-to-detail
      </li>
    </ul>

    <button routerLink="/sidekicks">Go to sidekicks</button>
  `
  // #enddocregion template
})
export class HeroListComponent implements OnInit {
  heroes$: Observable<Hero[]>;

  // #docregion ctor
  constructor(
    private router: Router,
    private service: HeroService
  ) {}
  // #enddocregion ctor

  ngOnInit() {
    this.heroes$ = this.service.getHeroes();
  }
}
// #enddocregion

/* A link parameters array
// #docregion link-parameters-array
['/hero', hero.id] // { 15 }
// #enddocregion link-parameters-array
*/
