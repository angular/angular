// #docplaster
// #docregion
import { Component, Host, Optional } from '@angular/core';

import { HeroCacheService } from './hero-cache.service';
import { LoggerService }    from './logger.service';

// #docregion component
@Component({
  selector: 'app-hero-contact',
  template: `
  <div>Phone #: {{phoneNumber}}
  <span *ngIf="hasLogger">!!!</span></div>`
})
export class HeroContactComponent {

  hasLogger = false;

  constructor(
  // #docregion ctor-params
      @Host() // HeroCacheService의 인스턴스 범위를 호스트 컴포넌트까지로 제한합니다.
      private heroCache: HeroCacheService,

      @Host()     // LoggerService를 찾습니다. 이 데코레이터를 사용하면 애플리케이션 전역 인스턴스는 가려집니다.
      @Optional() // 서비스 인스턴스가 존재하지 않는 것도 허용합니다.
      private loggerService: LoggerService
  // #enddocregion ctor-params
  ) {
    if (loggerService) {
      this.hasLogger = true;
      loggerService.logInfo('HeroContactComponent can log!');
    }
  // #docregion ctor
  }
  // #enddocregion ctor

  get phoneNumber() { return this.heroCache.hero.phone; }

}
// #enddocregion component
