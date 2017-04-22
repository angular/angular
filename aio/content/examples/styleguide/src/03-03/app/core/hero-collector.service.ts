// #docplaster
// #docregion
// #docregion example
import { Injectable } from '@angular/core';

import { Hero } from './hero.model';

@Injectable()
export class HeroCollectorService {
  hero: Hero;

  constructor() { }
  // #enddocregion example
  // testing harness
  getHero() {
    this.hero = {
      name: 'RubberMan',
      power: 'He is so elastic'
    };

    return this.hero;
  }
  // #docregion example
}
// #enddocregion example
