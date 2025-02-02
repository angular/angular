// #docregion
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Hero} from './hero.model';

@Injectable()
// #docregion example
export class HeroService {
  private http = inject(HttpClient);

  getHeroes() {
    return this.http.get<Hero[]>('api/heroes');
  }
}
// #enddocregion example
