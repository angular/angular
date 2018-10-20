// #docregion
import { Injectable } from '@angular/core';
import { HeroModule } from './hero.module';
import { HEROES }     from './mock-heroes';

@Injectable({
  // 이 서비스의 인스턴스는 HeroModule에 있는 인젝터가 생성합니다.

  providedIn: HeroModule,
})
export class HeroService {
  getHeroes() { return HEROES; }
}
