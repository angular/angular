// #docplaster
// #docregion
// TODO SOMEDAY: Feature Componetized like CrisisCenter
// #docregion rxjs-imports
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
// #enddocregion rxjs-imports
import { Component, OnInit } from '@angular/core';
// #docregion import-router
import { Router, ActivatedRoute, Params } from '@angular/router';
// #enddocregion import-router

import { Hero, HeroService }  from './hero.service';

@Component({
  // #docregion template
  template: `
    <h2>HEROES</h2>
    <ul class="items">
      <li *ngFor="let hero of heroes | async"
        [class.selected]="isSelected(hero)"
        (click)="onSelect(hero)">
        <span class="badge">{{ hero.id }}</span> {{ hero.name }}
      </li>
    </ul>

    <button routerLink="/sidekicks">Go to sidekicks</button>
  `
  // #enddocregion template
})
// #docregion ctor
export class HeroListComponent implements OnInit {
  heroes: Observable<Hero[]>;

  private selectedId: number;

  constructor(
    private service: HeroService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.heroes = this.route.params
      .switchMap((params: Params) => {
        this.selectedId = +params['id'];
        return this.service.getHeroes();
      });
  }
  // #enddocregion ctor

  // #docregion isSelected
  isSelected(hero: Hero) { return hero.id === this.selectedId; }
  // #enddocregion isSelected

  // #docregion select
  onSelect(hero: Hero) {
    this.router.navigate(['/hero', hero.id]);
  }
  // #enddocregion select
// #docregion ctor
}
// #enddocregion
