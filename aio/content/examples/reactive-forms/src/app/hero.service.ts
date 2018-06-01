// #docregion
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Hero, heroes } from './data-model';

@Injectable()
export class HeroService {

  delayMs = 500;

  // get : 서버의 쿼리 과정을 흉내냄
  getHeroes(): Observable<Hero[]> {
    return of(heroes).pipe(delay(this.delayMs)); // 약간 딜레이시키고 반환
  }

  // update : 서버의 저장 과정을 흉내냄
  updateHero(hero: Hero): Observable<Hero>  {
    const oldHero = heroes.find(h => h.id === hero.id);
    const newHero = Object.assign(oldHero, hero); // 캐시에 있는 히어로 데이터를 복사
    return of(newHero).pipe(delay(this.delayMs)); // 약간 딜레이시키고 반환
  }
}
