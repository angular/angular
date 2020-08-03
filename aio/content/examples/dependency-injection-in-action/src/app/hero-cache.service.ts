// #docregion
import { Injectable } from '@angular/core';

import { Hero } from './hero';
import { HeroService } from './hero.service';

// #docregion service
@Injectable()
export class HeroCacheService {
  hero: Hero;
  constructor(private heroService: HeroService) {}

  fetchCachedHero(id: number) {
    if (!this.hero) {
      this.hero = this.heroService.getHeroById(id);
    }
    return this.hero;
  }
}
// #enddocregion service
