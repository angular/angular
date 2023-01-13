import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import {Hero} from './hero';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({providedIn: 'root'})
export class HeroService {
  readonly heroesUrl = 'api/heroes';  // URL to web api

  constructor(private http: HttpClient) {}

  /** GET heroes from the server */
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
               .pipe(
                   tap(heroes => this.log('fetched heroes')),
                   catchError(this.handleError('getHeroes'))) as Observable<Hero[]>;
  }

  /** GET hero by id. Return `undefined` when id not found */
  getHero<Data>(id: number|string): Observable<Hero> {
    if (typeof id === 'string') {
      id = parseInt(id, 10);
    }
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url).pipe(
        map(heroes => heroes[0]),  // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`)));
  }

  //////// Save methods //////////

  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions)
        .pipe(
            tap((addedHero) => this.log(`added hero w/ id=${addedHero.id}`)),
            catchError(this.handleError<Hero>('addHero')));
  }
  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero|number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, httpOptions)
        .pipe(
            tap(_ => this.log(`deleted hero id=${id}`)),
            catchError(this.handleError<Hero>('deleteHero')));
  }

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, httpOptions)
        .pipe(
            tap(_ => this.log(`updated hero id=${hero.id}`)),
            catchError(this.handleError<any>('updateHero')));
  }
  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   *
   * @param operation - name of the operation that failed
   */
  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error);  // log to console instead

      // If a native error is caught, do not transform it. We only want to
      // transform response errors that are not wrapped in an `Error`.
      if (error.error instanceof Event) {
        throw error.error;
      }

      const message = `server returned code ${error.status} with body "${error.error}"`;
      // TODO: better job of transforming error for user consumption
      throw new Error(`${operation} failed: ${message}`);
    };
  }

  private log(message: string) {
    console.log('HeroService: ' + message);
  }
}
