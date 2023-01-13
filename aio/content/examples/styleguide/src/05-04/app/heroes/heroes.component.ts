import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Hero, HeroService } from './shared';

// #docregion example
@Component({
  selector: 'toh-heroes',
  templateUrl: './heroes.component.html',
  styleUrls:  ['./heroes.component.css']
})
export class HeroesComponent {
  heroes: Observable<Hero[]>;
  selectedHero!: Hero;

  constructor(private heroService: HeroService) {
    this.heroes = this.heroService.getHeroes();
  }
}
// #enddocregion example
