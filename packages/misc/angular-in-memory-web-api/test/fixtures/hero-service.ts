/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';
import {Hero} from './hero';

export abstract class HeroService {
  heroesUrl = 'api/heroes';  // URL to web api

  abstract getHeroes(): Observable<Hero[]>;
  abstract getHero(id: number): Observable<Hero>;
  abstract addHero(name: string): Observable<Hero>;
  abstract deleteHero(hero: Hero|number): Observable<Hero>;
  abstract searchHeroes(term: string): Observable<Hero[]>;
  abstract updateHero(hero: Hero): Observable<Hero>;
}
