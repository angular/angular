// #docplaster
// #docregion
// #docregion empty-class, full
import { Injectable } from '@angular/core';

// #enddocregion empty-class
import { Hero } from './hero';
import { HEROES } from './mock-heroes';

// #docregion empty-class, getHeroes-stub
@Injectable()
export class HeroService {
  // #enddocregion empty-class, getHeroes-stub, full
  /*
  // #docregion getHeroes-stub
  getHeroes(): void {} // stub
  // #enddocregion getHeroes-stub
  */
  // #docregion full
  getHeroes(): Hero[] {
    return HEROES;
  }
  // #docregion empty-class, getHeroes-stub
}
