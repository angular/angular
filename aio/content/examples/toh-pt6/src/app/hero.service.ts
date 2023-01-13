// #docplaster
// #docregion
import { Injectable } from '@angular/core';
// #docregion import-httpclient
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #enddocregion import-httpclient

import { Observable, of } from 'rxjs';
// #docregion import-rxjs-operators
import { catchError, map, tap } from 'rxjs/operators';
// #enddocregion import-rxjs-operators

import { Hero } from './hero';
import { MessageService } from './message.service';


@Injectable({ providedIn: 'root' })
export class HeroService {

  // #docregion heroesUrl
  private heroesUrl = 'api/heroes';  // URL to web api
  // #enddocregion heroesUrl

  // #docregion http-options
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  // #enddocregion http-options

  // #docregion ctor
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }
  // #enddocregion ctor

  // #docregion getHeroes, getHeroes-1
  /** GET heroes from the server */
  // #docregion getHeroes-2
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
  // #enddocregion getHeroes-1
      .pipe(
        // #enddocregion getHeroes-2
        tap(_ => this.log('fetched heroes')),
        // #docregion getHeroes-2
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  // #docregion getHeroes-1
  }
  // #enddocregion getHeroes, getHeroes-1, getHeroes-2

  /** GET hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  // #docregion getHero
  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }
  // #enddocregion getHero

  // #docregion searchHeroes
  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
         this.log(`found heroes matching "${term}"`) :
         this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
  // #enddocregion searchHeroes

  //////// Save methods //////////

  // #docregion addHero
  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }
  // #enddocregion addHero

  // #docregion deleteHero
  /** DELETE: delete the hero from the server */
  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }
  // #enddocregion deleteHero

  // #docregion updateHero
  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }
  // #enddocregion updateHero

  // #docregion handleError
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  // #enddocregion handleError

  // #docregion log
  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
  // #enddocregion log
}
