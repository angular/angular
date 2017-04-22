// #docregion
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Hero } from './hero.model';

@Injectable()
// #docregion example
export class HeroService {
  constructor(private http: Http) { }

  getHeroes() {
    return this.http.get('api/heroes')
      .map((response: Response) => <Hero[]>response.json().data);
  }
}
// #enddocregion example
