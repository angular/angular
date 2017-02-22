// #docregion
import { Inject } from '@angular/core';
import { Http } from '@angular/http';

import { HeroService } from './hero.service';
// #docregion example
/* avoid */

export class HeroArena {
  constructor(
      @Inject(HeroService) private heroService: HeroService,
      @Inject(Http) private http: Http) {}
}
// #enddocregion example
