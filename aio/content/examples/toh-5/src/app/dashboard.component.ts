// #docplaster
// #docregion , imports
import { Component, OnInit } from '@angular/core';

import { Hero } from './hero';
import { HeroService } from './hero.service';
// #enddocregion imports

// #docregion metadata
@Component({
  selector: 'my-dashboard',
  templateUrl: './dashboard.component.html',
  // #enddocregion metadata
  // #docregion css
  styleUrls: [ './dashboard.component.css' ]
  // #enddocregion css
  // #docregion metadata
})
// #enddocregion metadata
// #docregion class
export class DashboardComponent implements OnInit {

  heroes: Hero[] = [];

  // #docregion ctor
  constructor(private heroService: HeroService) { }
  // #enddocregion ctor

  ngOnInit(): void {
    this.heroService.getHeroes()
      .then(heroes => this.heroes = heroes.slice(1, 5));
  }
}
