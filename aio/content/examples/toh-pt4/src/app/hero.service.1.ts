/* Newly generated and synchronous versions */
// #docplaster
// #docregion, new
import { Injectable } from '@angular/core';

// #enddocregion new
import { Hero } from './hero';
import { HEROES } from './mock-heroes';

// #docregion new
@Injectable({
  providedIn: 'root',
})
export class HeroService {

  constructor() { }

  // #enddocregion new
  // #docregion getHeroes
  getHeroes(): Hero[] {
    return HEROES;
  }
  // #enddocregion getHeroes
  // #docregion new
}
// #enddocregion, new
