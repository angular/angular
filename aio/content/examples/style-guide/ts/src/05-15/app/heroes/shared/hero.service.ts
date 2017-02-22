// #docregion
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { Hero } from './hero.model';

@Injectable()
export class HeroService {
  getHeroes() {
    let heroes: Hero[] = [];
    return Observable.of(heroes);
  }
}
