// #docplaster
// #docregion
import {NgFor} from '@angular/common';
import {Component} from '@angular/core';
import {Hero} from './hero';
// #enddocregion
import {HeroService} from './hero.service.1';
/*
// #docregion
import { HeroService } from './hero.service';
// #enddocregion
*/
// #docregion

@Component({
  selector: 'app-hero-list',
  template: `
    @for (hero of heroes; track hero) {
      <div>{{hero.id}} - {{hero.name}}</div>
    }
  `,
  imports: [NgFor],
})
export class HeroListComponent {
  heroes: Hero[];

  constructor(heroService: HeroService) {
    this.heroes = heroService.getHeroes();
  }
}
