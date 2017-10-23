// #docplaster
// #docregion
// TODO: Feature Componetized like HeroCenter
import { Component, OnInit }   from '@angular/core';
import { Router }              from '@angular/router';
import { Observable }          from 'rxjs';

import { HeroService }   from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.1.html',
  styleUrls: ['./hero-list.component.css']
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
