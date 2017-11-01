// #docplaster
// #docregion
import 'rxjs/add/operator/mergeMap';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HeroService } from './hero.service';
import { Hero } from './hero';

// #docregion ngIfAs
@Component({
  template: `
    <h2>HEROES</h2>

    <div *ngIf="hero$ | async as hero">
      <div>
        ID: {{ hero.id }}
      </div>
      <div>
        Name: {{ hero.name }}
      </div>
    </div>
  `
})
// #enddocregion ngIfAs
export class HeroDetailComponent implements OnInit {
  hero$: Observable<Hero>;

  constructor(
    private route: ActivatedRoute,
    private service: HeroService
  ) {}

  ngOnInit() {
    this.hero$ = this.route.params
      .mergeMap((params: Params) => this.service.getHero(+params['id']));
  }
}
