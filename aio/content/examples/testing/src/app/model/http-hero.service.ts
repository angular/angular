// The OLD Http module. See HeroService for use of the current HttpClient
// #docplaster
// #docregion
import { Injectable }     from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Hero }           from './hero';

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class HttpHeroService {
  _heroesUrl = 'app/heroes';  // URL to web api

  constructor(private http: HttpClient) {}

  getHeroes(): Observable<Hero[]> {
    return this.http.get(this._heroesUrl, {observe: 'response'}).pipe(
      map(this.extractData),
      // tap(data => console.log(data)), // eyeball results in the console
      catchError(this.handleError)
    );
  }

  getHero(id: number | string) {
    return this.http.get<Hero[]>(`app/heroes/?id=${id}`);
  }

  addHero(name: string): Observable<Hero>  {
    let body = JSON.stringify({ name });
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this._heroesUrl, body, { headers: headers }).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  updateHero(hero: Hero): Observable<Hero>  {
    let body = JSON.stringify(hero);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put(this._heroesUrl, body, { headers: headers }).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  private extractData(res: HttpResponse<Hero[]>): Hero[] {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    return res.body || [];
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    let errMsg = error.message || 'Server error';
    console.error(errMsg); // log to console instead
    return throwError(errMsg);
  }
}
