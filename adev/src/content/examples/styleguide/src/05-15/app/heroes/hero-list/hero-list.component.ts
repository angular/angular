// #docregion example
import {Component, inject, OnInit} from '@angular/core';

import {Hero, HeroService} from '../shared';

@Component({
  selector: 'toh-hero-list',
  template: `...`,
})
export class HeroListComponent implements OnInit {
  heroes: Hero[] = [];
  private heroService = inject(HeroService);

  getHeroes() {
    this.heroes = [];
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes));
  }
  ngOnInit() {
    this.getHeroes();
  }
}
// #enddocregion example
