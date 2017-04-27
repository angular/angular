// #docplaster
// #docregion
// #docregion operator-import
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
// #docregion operator
import { Component, OnInit }   from '@angular/core';

import { HeroService }   from './hero.service';
import { Hero }          from './hero';

@Component({
  template: `
    <h2>HEROES</h2>
    <ul class="items">
      <li *ngFor="let hero of heroes">
        <span class="badge">{{ hero.id }}</span> {{ hero.name }}
      </li>
    </ul>
  `
})
export class HeroListComponent implements OnInit {
  heroes: Hero[];

  constructor(
    private service: HeroService
  ) {}

  ngOnInit() {
    this.service.getHeroes()
      .do(heroes => {
        console.log(heroes.length);
      })
      .filter(heroes => heroes.length > 2)
      .subscribe(heroes => this.heroes = heroes);
  }
}
// #enddocregion operator-import

// #docregion import-all
import 'rxjs/Rx';
// #enddocregion import-all
