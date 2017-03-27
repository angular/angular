// #docplaster
// #docregion
// #docregion just-get-heroes
import { Injectable } from '@angular/core';

import { Hero } from './hero';
import { HEROES } from './mock-heroes';

@Injectable()
export class HeroService {
  // #docregion get-heroes
  getHeroes(): Promise<Hero[]> {
    return Promise.resolve(HEROES);
  }
  // #enddocregion get-heroes, just-get-heroes
  // #enddocregion

  // See the "Take it slow" appendix
  // #docregion get-heroes-slowly
  getHeroesSlowly(): Promise<Hero[]> {
    return new Promise(resolve => {
      // Simulate server latency with 2 second delay
      setTimeout(() => resolve(this.getHeroes()), 2000);
    });
  }
  // #enddocregion get-heroes-slowly
  // #docregion
  // #docregion just-get-heroes
}
