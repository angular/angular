// #docregion
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';

import { HeroService } from './hero.service';

// #docregion example
/* avoid */

export class HeroArena {
  constructor(
    @Inject(HeroService) private heroService: HeroService,
    @Inject(Http) private http: HttpClient
  ) {}
}
// #enddocregion example
