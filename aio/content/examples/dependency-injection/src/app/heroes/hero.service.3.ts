// #docregion
import { Injectable } from '@angular/core';
import { HEROES }     from './mock-heroes';

@Injectable({
  // 이 서비스를 애플리케이션 최상위 인젝터에 등록합니다.
  providedIn: 'root',
})
export class HeroService {
  getHeroes() { return HEROES; }
}
