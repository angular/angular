// #docplaster
// #docregion
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
// #docregion retry-import
import 'rxjs/add/operator/retry';
// #enddocregion retry-import
import { Injectable }              from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable }              from 'rxjs/Observable';

import { Hero } from './hero';

@Injectable()
export class HeroService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private heroesUrl = 'api/heroes';

  constructor(
    private http: Http
  ) {}

  getHeroes(fail?: boolean): Observable<Hero[]> {
    return this.http.get(`${this.heroesUrl}${fail ? '/failed' : ''}`)
      .retry(3)
      .map(response => response.json().data as Hero[])
      .catch((error: any) => {
        console.log(`An error occurred: ${error}`);

        return Observable.of([]);
      });
  }
}
