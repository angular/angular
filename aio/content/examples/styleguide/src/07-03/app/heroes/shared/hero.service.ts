// #docregion
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { Hero } from './hero.model';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  getHeroes() {
    const heroes: Hero[] = [];
    return of(heroes);
  }
}
