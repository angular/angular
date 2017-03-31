// #docplaster
// #docregion
import { InjectionToken } from '@angular/core';

import { Hero }        from './hero';
import { HeroService } from './hero.service';

// #docregion runners-up
export const RUNNERS_UP = new InjectionToken<string>('RunnersUp');
// #enddocregion runners-up

// #docregion factory-synopsis
export function runnersUpFactory(take: number) {
  return (winner: Hero, heroService: HeroService): string => {
    /* ... */
// #enddocregion factory-synopsis
    return heroService
          .getAllHeroes()
          .filter((hero) => hero.name !== winner.name)
          .map(hero => hero.name)
          .slice(0, Math.max(0, take))
          .join(', ');
// #docregion factory-synopsis
  };
};
// #enddocregion factory-synopsis
