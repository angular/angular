/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {Hero} from './hero';
import {HeroService} from './hero-service';

const cudOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable()
export class HttpClientHeroService extends HeroService {
  constructor(private http: HttpClient) {
    super();
  }

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl).pipe(catchError(this.handleError));
  }

  // This get-by-id will 404 when id not found
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(catchError(this.handleError));
  }

  // This get-by-id does not 404; returns undefined when id not found
  // getHero<Data>(id: number): Observable<Hero> {
  //   const url = `${this._heroesUrl}/?id=${id}`;
  //   return this.http.get<Hero[]>(url)
  //     .map(heroes => heroes[0] as Hero)
  //     .catch(this.handleError);
  // }

  addHero(name: string): Observable<Hero> {
    const hero = {name};

    return this.http.post<Hero>(this.heroesUrl, hero, cudOptions)
        .pipe(catchError(this.handleError));
  }

  deleteHero(hero: Hero|number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, cudOptions).pipe(catchError(this.handleError));
  }

  searchHeroes(term: string): Observable<Hero[]> {
    term = term.trim();
    // add safe, encoded search parameter if term is present
    const options = term ? {params: new HttpParams().set('name', term)} : {};

    return this.http.get<Hero[]>(this.heroesUrl, options).pipe(catchError(this.handleError));
  }

  updateHero(hero: Hero): Observable<Hero> {
    return this.http.put<Hero>(this.heroesUrl, hero, cudOptions).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    // and reformat for user consumption
    return throwError(error);
  }
}
