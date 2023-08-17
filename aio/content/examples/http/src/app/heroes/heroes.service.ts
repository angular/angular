// #docplaster
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
// #docregion http-options
import { HttpHeaders } from '@angular/common/http';

// #enddocregion http-options

import { Observable, catchError, map } from 'rxjs';

import { Hero } from './hero';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

// #docregion http-options
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};
// #enddocregion http-options

@Injectable()
export class HeroesService {
  heroesUrl = 'api/heroes';  // URL to web api
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('HeroesService');
  }

  /** GET heroes from the server */
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        catchError(this.handleError('getHeroes', []))
      );
  }

  // #docregion searchHeroes, searchHeroesJsonp
  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
  // #enddocregion searchHeroesJsonp
    term = term.trim();

    // Add safe, URL encoded search parameter if there is a search term
    const options = term ?
     { params: new HttpParams().set('name', term) } : {};

    return this.http.get<Hero[]>(this.heroesUrl, options)
      .pipe(
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
  }
  // #enddocregion searchHeroes

  // This JSONP example doesn't run. It is for the JSONP documentation only.
  /** Imaginary API in a different domain that supports JSONP. */
  heroesSearchUrl = 'https://heroes.com/search';

  /** Does whatever is necessary to convert the result from API to Heroes */
  jsonpResultToHeroes(result: any) { return result as Hero[]; }

  /* GET heroes (using JSONP) whose name contains search term */
  searchHeroesJsonp(term: string): Observable<Hero[]> {
    // #docregion searchHeroesJsonp
    term = term.trim();

    const heroesUrl = `${this.heroesSearchUrl}?${term}`;
    return this.http.jsonp(heroesUrl, 'callback')
      .pipe(
        map(result => this.jsonpResultToHeroes(result)),
        catchError(this.handleError('searchHeroes', []))
      );
  }
  // #enddocregion searchHeroesJsonp

  //////// Save methods //////////

  // #docregion addHero
  /** POST: add a new hero to the database */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions)
      .pipe(
        catchError(this.handleError('addHero', hero))
      );
  }
  // #enddocregion addHero

  // #docregion deleteHero
  /** DELETE: delete the hero from the server */
  deleteHero(id: number): Observable<unknown> {
    const url = `${this.heroesUrl}/${id}`; // DELETE api/heroes/42
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError('deleteHero'))
      );
  }
  // #enddocregion deleteHero

  // #docregion updateHero
  /** PUT: update the hero on the server. Returns the updated hero upon success. */
  updateHero(hero: Hero): Observable<Hero> {
    // #enddocregion updateHero
    // #docregion update-headers
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'my-new-auth-token');
    // #enddocregion update-headers

    // #docregion updateHero
    return this.http.put<Hero>(this.heroesUrl, hero, httpOptions)
      .pipe(
        catchError(this.handleError('updateHero', hero))
      );
  }
  // #enddocregion updateHero
}
