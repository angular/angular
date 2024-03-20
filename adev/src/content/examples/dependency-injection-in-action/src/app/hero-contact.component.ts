// #docplaster
// #docregion
import {Component, Host, Optional} from '@angular/core';

import {HeroCacheService} from './hero-cache.service';
import {LoggerService} from './logger.service';
import {NgIf} from '@angular/common';

// #docregion component
@Component({
  standalone: true,
  selector: 'app-hero-contact',
  template: `
  <div>Phone #: {{phoneNumber}}
    @if (hasLogger) {
      <span>!!!</span>
    }
  </div>`,
  imports: [NgIf],
})
export class HeroContactComponent {
  hasLogger = false;

  constructor(
    // #docregion ctor-params
    @Host() // limit to the host component's instance of the HeroCacheService
    private heroCache: HeroCacheService,

    @Host() // limit search for logger; hides the application-wide logger
    @Optional() // ok if the logger doesn't exist
    private loggerService?: LoggerService, // #enddocregion ctor-params
  ) {
    if (loggerService) {
      this.hasLogger = true;
      loggerService.logInfo('HeroContactComponent can log!');
    }
  }

  get phoneNumber() {
    return this.heroCache.hero.phone;
  }
}
// #enddocregion component
