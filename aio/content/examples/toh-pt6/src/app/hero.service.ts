// #docplaster
// #docregion , imports
import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

// #docregion rxjs
import 'rxjs/add/operator/toPromise';
// #enddocregion rxjs

import { Hero } from './hero';
// #enddocregion imports

@Injectable()
export class HeroService {

  // #docregion update
  private headers = new Headers({'Content-Type': 'application/json'});
  // #enddocregion update
  // #docregion getHeroes
  private heroesUrl = 'api/heroes';  // URL to web api

  constructor(private http: Http) { }

  getHeroes(): Promise<Hero[]> {
    return this.http.get(this.heroesUrl)
    // #docregion to-promise
               .toPromise()
    // #enddocregion to-promise
    // #docregion to-data
               .then(response => response.json().data as Hero[])
    // #enddocregion to-data
    // #docregion catch
               .catch(this.handleError);
    // #enddocregion catch
  }

  // #enddocregion getHeroes

  // #docregion getHero
  getHero(id: number): Promise<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json().data as Hero)
      .catch(this.handleError);
  }
  // #enddocregion getHero

  // #docregion delete
  delete(id: number): Promise<void> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.delete(url, {headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
  // #enddocregion delete

  // #docregion create
  create(name: string): Promise<Hero> {
    return this.http
      .post(this.heroesUrl, JSON.stringify({name: name}), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Hero)
      .catch(this.handleError);
  }
  // #enddocregion create
  // #docregion update

  update(hero: Hero): Promise<Hero> {
    const url = `${this.heroesUrl}/${hero.id}`;
    return this.http
      .put(url, JSON.stringify(hero), {headers: this.headers})
      .toPromise()
      .then(() => hero)
      .catch(this.handleError);
  }
  // #enddocregion update

  // #docregion getHeroes, handleError
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  // #enddocregion getHeroes, handleError
}

