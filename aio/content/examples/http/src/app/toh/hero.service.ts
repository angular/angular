// #docplaster
// #docregion
// Observable Version
// #docregion v1
import { Injectable }              from '@angular/core';
import { Http, Response }          from '@angular/http';
// #enddocregion v1
// #docregion import-request-options
import { Headers, RequestOptions } from '@angular/http';
// #enddocregion import-request-options
// #docregion v1

// #docregion rxjs-imports
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
// #enddocregion rxjs-imports

import { Hero } from './hero';

@Injectable()
export class HeroService {
  // #docregion endpoint
  private heroesUrl = 'api/heroes';  // URL to web API
  // #enddocregion endpoint

  // #docregion ctor
  constructor (private http: Http) {}
  // #enddocregion ctor

  // #docregion methods, error-handling, http-get
  getHeroes(): Observable<Hero[]> {
    return this.http.get(this.heroesUrl)
                    .map(this.extractData)
                    .catch(this.handleError);
  }
  // #enddocregion error-handling, http-get, v1

  // #docregion create, create-sig
  create(name: string): Observable<Hero> {
  // #enddocregion create-sig
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this.heroesUrl, { name }, options)
                    .map(this.extractData)
                    .catch(this.handleError);
  }
  // #enddocregion create

  // #docregion v1, extract-data
  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }
  // #enddocregion extract-data
  // #docregion error-handling

  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
  // #enddocregion error-handling, methods
}
// #enddocregion

/*
  // #docregion endpoint-json
  private heroesUrl = 'app/heroes.json'; // URL to JSON file
  // #enddocregion endpoint-json
*/
