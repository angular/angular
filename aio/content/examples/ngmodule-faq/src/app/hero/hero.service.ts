import { Injectable, OnDestroy } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay }      from 'rxjs/operators';

export class Hero {
  constructor(public id: number, public name: string) { }
}

const HEROES: Hero[] = [
  new Hero(11, 'Mr. Nice'),
  new Hero(12, 'Narco'),
  new Hero(13, 'Bombasto'),
  new Hero(14, 'Celeritas'),
  new Hero(15, 'Magneta'),
  new Hero(16, 'RubberMan')
];

const FETCH_LATENCY = 500;

/** Simulate a data service that retrieves heroes from a server */
@Injectable()
export class HeroService implements OnDestroy {

  constructor() { console.log('HeroService instance created.'); }
  ngOnDestroy() { console.log('HeroService instance destroyed.'); }

  getHeroes(): Observable<Hero[]> {
    return of(HEROES).pipe(delay(FETCH_LATENCY));
  }

  getHero(id: number | string): Observable<Hero> {
    return of(HEROES.find(hero => hero.id === +id))
      .pipe(delay(FETCH_LATENCY));
  }
}
