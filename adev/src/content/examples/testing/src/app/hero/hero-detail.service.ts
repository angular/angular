import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Hero} from '../model/hero';
import {HeroService} from '../model/hero.service';

// #docregion prototype
@Injectable({providedIn: 'root'})
export class HeroDetailService {
  private heroService = inject(HeroService);
  // #enddocregion prototype

  // Returns a clone which caller may modify safely
  getHero(id: number | string): Observable<Hero | null> {
    if (typeof id === 'string') {
      id = parseInt(id, 10);
    }
    return this.heroService.getHero(id).pipe(
      map((hero) => (hero ? Object.assign({}, hero) : null)), // clone or null
    );
  }

  saveHero(hero: Hero) {
    return this.heroService.updateHero(hero);
  }
  // #docregion prototype
}
// #enddocregion prototype
