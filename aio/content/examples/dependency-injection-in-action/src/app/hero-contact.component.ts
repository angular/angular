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
      @Host() // HeroCacheService 인스턴스 탐색 범위를 호스트 컴포넌트까지로 제한합니다.
      private heroCache: HeroCacheService,

<<<<<<< HEAD
      @Host()     // LoggerService를 찾을 범위를 제한합니다. 애플리케이션 전역 인스턴스는 가려집니다.
      @Optional() // 서비스 인스턴스가 존재하지 않는 것도 허용합니다.
      private loggerService: LoggerService
=======
      @Host()     // limit search for logger; hides the application-wide logger
      @Optional() // ok if the logger doesn't exist
      private loggerService?: LoggerService
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
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
