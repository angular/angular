// #docplaster
// #docregion
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { HeroService } from './index';

// #docregion example
@Injectable()
export class HeroArena {
  constructor(
    private heroService: HeroService,
    private http: Http) {}
    // #enddocregion example
    // test harness
    getParticipants() {
      return this.heroService.getHeroes();
    }
    // #docregion example
}
// #enddocregion example
