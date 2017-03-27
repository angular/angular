// #docplaster
// #docregion
// #docregion rxjs-operator-import
import 'rxjs/add/operator/switchMap';
// #enddocregion rxjs-operator-import
import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { slideInDownAnimation } from '../animations';

import { Hero, HeroService }  from './hero.service';

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
  `,
  animations: [ slideInDownAnimation ]
})
export class HeroDetailComponent implements OnInit {
// #docregion host-bindings
  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display')   display = 'block';
  @HostBinding('style.position')  position = 'absolute';
// #enddocregion host-bindings

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
    this.route.params
      // (+) converts string 'id' to a number
      .switchMap((params: Params) => this.service.getHero(+params['id']))
      .subscribe((hero: Hero) => this.hero = hero);
  }
  // #enddocregion ngOnInit

  // #docregion gotoHeroes
  gotoHeroes() {
    let heroId = this.hero ? this.hero.id : null;
    // Pass along the hero id if available
    // so that the HeroList component can select that hero.
    // Include a junk 'foo' property for fun.
    this.router.navigate(['/heroes', { id: heroId, foo: 'foo' }]);
  }
  // #enddocregion gotoHeroes
}
