// #docplaster
// #docregion
// TODO SOMEDAY: Feature Componetized like CrisisCenter
// #docregion rxjs-imports
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-imports
import { Component, OnInit } from '@angular/core';
// #docregion import-router
import { ActivatedRoute, ParamMap } from '@angular/router';
// #enddocregion import-router

import { Hero, HeroService }  from './hero.service';

@Component({
  // #docregion template
  template: `
    <h2>HEROES</h2>
    <ul class="items">
      <li *ngFor="let hero of heroes$ | async"
        [class.selected]="hero.id === selectedId">
        <a [routerLink]="['/hero', hero.id]">
          <span class="badge">{{ hero.id }}</span>{{ hero.name }}
        </a>
      </li>
    </ul>

    <button routerLink="/sidekicks">Go to sidekicks</button>
  `
  // #enddocregion template
})
// #docregion ctor
export class HeroListComponent implements OnInit {
  heroes$: Observable<Hero[]>;

  private selectedId: number;

  constructor(
    private service: HeroService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.heroes$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        // (+) before `params.get()` turns the string into a number
        this.selectedId = +params.get('id');
        return this.service.getHeroes();
      })
    );
  }
  // #enddocregion ctor
// #docregion ctor
}
// #enddocregion
