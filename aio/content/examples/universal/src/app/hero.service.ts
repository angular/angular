import { Injectable, Inject, Optional } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { Hero } from './hero';

const headers = new HttpHeaders({'Content-Type': 'application/json'});

@Injectable()
export class HeroService {

  private heroesUrl = 'api/heroes';  // URL to web api

  // #docregion ctor
  constructor(
    private http: HttpClient,
    @Optional() @Inject(APP_BASE_HREF) origin: string) {
    this.heroesUrl = (origin || '') + this.heroesUrl;
  }
  // #enddocregion ctor

  getHeroes(): Observable<Hero[]> {
    return this.http.get(this.heroesUrl)
               .map((data: any) => data.data as Hero[])
               .catch(this.handleError);
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get(url)
      .map((data: any) => data.data as Hero)
      .catch(this.handleError);
  }

  delete(id: number): Observable<void> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.delete(url, { headers })
      .catch(this.handleError);
  }

  create(name: string): Observable<Hero> {
    return this.http
      .post(this.heroesUrl, { name: name }, { headers })
      .map((data: any) => data.data)
      .catch(this.handleError);
  }

  update(hero: Hero): Observable<Hero> {
    const url = `${this.heroesUrl}/${hero.id}`;
    return this.http
      .put(url, hero, { headers })
      .catch(this.handleError);
  }

  private handleError(error: any): Observable<any> {
    console.error('An error occurred', error); // for demo purposes only
    throw error;
  }
}
