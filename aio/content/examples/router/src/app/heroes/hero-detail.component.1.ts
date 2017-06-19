// #docplaster
// #docregion
// #docregion rxjs-operator-import
import 'rxjs/add/operator/switchMap';
// #enddocregion rxjs-operator-import
import { Component, OnInit } from '@angular/core';
// #docregion imports
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
// #enddocregion imports

import { Hero, HeroService } from './hero.service';

@Component({
  template: `
  <h2>HEROES</h2>
  <div *ngIf="hero">
    <h3>"{{ hero.name }}"</h3>
    <div>
      <label>Id: </label>{{ hero.id }}</div>
    <div>
      <label>Name: </label>
      <input [(ngModel)]="hero.name" placeholder="name"/>
    </div>
    <p>
      <button (click)="gotoHeroes()">Back</button>
    </p>
  </div>
  `
})
export class HeroDetailComponent implements OnInit  {
  hero: Hero;

  // #docregion ctor
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HeroService
  ) {}
  // #enddocregion ctor

  // #docregion ngOnInit
  ngOnInit() {
    this.route.paramMap
      .switchMap((params: ParamMap) =>
        this.service.getHero(params.get('id')))
      .subscribe((hero: Hero) => this.hero = hero);
  }
  // #enddocregion ngOnInit

  // #docregion gotoHeroes
  gotoHeroes() {
    this.router.navigate(['/heroes']);
  }
  // #enddocregion gotoHeroes
}
