// #docplaster
// #docregion
// #docregion rxjs-operator-import
import { switchMap } from 'rxjs/operators';
// #enddocregion rxjs-operator-import
import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

import { slideInDownAnimation } from '../animations';

import { Hero, HeroService }  from './hero.service';

@Component({
  template: `
  <h2>HEROES</h2>
  <div *ngIf="hero$ | async as hero">
    <h3>"{{ hero.name }}"</h3>
    <div>
      <label>Id: </label>{{ hero.id }}</div>
    <div>
      <label>Name: </label>
      <input [(ngModel)]="hero.name" placeholder="name"/>
    </div>
    <p>
      <button (click)="gotoHeroes(hero)">Back</button>
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

  hero$: Observable<Hero>;

  // #docregion ctor
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HeroService
  ) {}
  // #enddocregion ctor

  // #docregion ngOnInit
  ngOnInit() {
    this.hero$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getHero(params.get('id')))
    );
  }
  // #enddocregion ngOnInit

  // #docregion gotoHeroes
  gotoHeroes(hero: Hero) {
    let heroId = hero ? hero.id : null;
    // Pass along the hero id if available
    // so that the HeroList component can select that hero.
    // Include a junk 'foo' property for fun.
    this.router.navigate(['/heroes', { id: heroId, foo: 'foo' }]);
  }
  // #enddocregion gotoHeroes
}
