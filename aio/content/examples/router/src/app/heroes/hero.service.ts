// #docregion
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { MessageService } from '../message.service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {

  constructor(private messageService: MessageService) { }

  getHeroes(): Observable<Hero[]> {
    // TODO: 메시지는 히어로 목록을 가져온 _뒤에_ 보내기
    this.messageService.add('HeroService: fetched heroes');
    return of(HEROES);
  }

  getHero(id: number | string) {
    return this.getHeroes().pipe(
      // `id` 앞에 사용된 `+`는 문자열을 숫자로 변환합니다.
      map((heroes: Hero[]) => heroes.find(hero => hero.id === +id))
    );
  }
}

