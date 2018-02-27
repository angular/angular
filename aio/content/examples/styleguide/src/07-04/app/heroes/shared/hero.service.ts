// #docregion
import { Injectable } from '@angular/core';

import { of } from 'rxjs';

import { Hero } from './hero.model';

@Injectable()
export class HeroService {
  getHeroes() {
    let heroes: Hero[] = [];
    return of(heroes);
  }
}
