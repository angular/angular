// #docplaster
// #docregion
import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Hero }           from './hero';

import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class HttpHeroService {
  private _heroesUrl = 'app/heroes';  // URL to web api

  constructor (private http: Http) {}

  getHeroes (): Observable<Hero[]> {
    return this.http.get(this._heroesUrl)
                    .map(this.extractData)
                    // .do(data => console.log(data)) // eyeball results in the console
                    .catch(this.handleError);
  }

  getHero(id: number | string) {
    return this.http
            .get('app/heroes/?id=${id}')
            .map((r: Response) => r.json().data as Hero[]);
  }

  addHero (name: string): Observable<Hero>  {
    let body = JSON.stringify({ name });
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this._heroesUrl, body, options)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  updateHero (hero: Hero): Observable<Hero>  {
    let body = JSON.stringify(hero);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.put(this._heroesUrl, body, options)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  private extractData(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    let body = res.json();
    return body.data || { };
  }

  private handleError (error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    let errMsg = error.message || 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
