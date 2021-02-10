// #docplaster
// #docregion
import { Injectable } from '@angular/core';

// #docregion import-observable
import { Observable, of } from 'rxjs';
// #enddocregion import-observable

// #docregion import-heroes
import { Hero } from './hero';
import { HEROES } from './mock-heroes';
// #enddocregion import-heroes
// #docregion import-message-service
import { MessageService } from './message.service';
// #enddocregion import-message-service

@Injectable({
  providedIn: 'root',
})
export class HeroService {

  // #docregion ctor
  constructor(private messageService: MessageService) { }
  // #enddocregion ctor

  // #docregion getHeroes, getHeroes-1
  getHeroes(): Observable<Hero[]> {
    const heroes = of(HEROES);
    // #enddocregion getHeroes-1
    this.messageService.add('HeroService: fetched heroes');
    // #docregion getHeroes-1
    return heroes;
  }
  // #enddocregion getHeroes, getHeroes-1
}
// #enddocregion
