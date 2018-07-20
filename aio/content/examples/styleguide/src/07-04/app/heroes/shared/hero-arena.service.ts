// #docplaster
// #docregion
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Hero } from './hero.model';
import { HeroService } from './hero.service';

// #docregion example
@Injectable()
export class HeroArena {
  constructor(private heroService: HeroService, private http: HttpClient) {}
  // #enddocregion example
  // test harness
  getParticipants(): Observable<Hero[]> {
    return this.heroService.getHeroes();
  }
  // #docregion example
}
// #enddocregion example
