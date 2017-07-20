// #docplaster
// #docregion , v2, rxjs-import
import 'rxjs/add/operator/switchMap';
// #enddocregion rxjs-import
import { Component, OnInit }      from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location }               from '@angular/common';

import { Hero }         from './hero';
import { HeroService }  from './hero.service';
// #docregion metadata
@Component({
  selector: 'hero-detail',
  templateUrl: './hero-detail.component.html',
  // #enddocregion metadata, v2
  styleUrls: [ './hero-detail.component.css' ]
  // #docregion metadata, v2
})
// #enddocregion metadata
// #docregion implement
export class HeroDetailComponent implements OnInit {
// #enddocregion implement
  hero: Hero;

  // #docregion ctor
  constructor(
    private heroService: HeroService,
    private route: ActivatedRoute,
    private location: Location
  ) {}
  // #enddocregion ctor

  // #docregion ngOnInit
  ngOnInit(): void {
    this.route.params
      .switchMap((params: Params) => this.heroService.getHero(+params['id']))
      .subscribe(hero => this.hero = hero);
  }
  // #enddocregion ngOnInit

  // #docregion goBack
  goBack(): void {
    this.location.back();
  }
// #enddocregion goBack
}
