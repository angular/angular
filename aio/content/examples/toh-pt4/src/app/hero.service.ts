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

@Injectable()
export class HeroService {

  // #docregion ctor
  constructor(private messageService: MessageService) { }
  // #enddocregion ctor

  // #docregion getHeroes, getHeroes-1
  getHeroes(): Observable<Hero[]> {
    // #enddocregion getHeroes-1
    // Todo: send the message _after_ fetching the heroes
    this.messageService.add('HeroService: fetched heroes');
    // #docregion getHeroes-1
    return of(HEROES);
  }
  // #enddocregion getHeroes, getHeroes-1
}
// #enddocregion
