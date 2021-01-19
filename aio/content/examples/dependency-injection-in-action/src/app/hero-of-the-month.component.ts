/* tslint:disable:one-line*/
// #docplaster
// #docregion injection-token
import { InjectionToken } from '@angular/core';

export const TITLE = new InjectionToken<string>('title');
// #enddocregion injection-token

// #docregion hero-of-the-month
import { Component, Inject } from '@angular/core';

import { DateLoggerService } from './date-logger.service';
import { Hero } from './hero';
import { HeroService } from './hero.service';
import { LoggerService } from './logger.service';
import { MinimalLogger } from './minimal-logger.service';
import { RUNNERS_UP,
         runnersUpFactory } from './runners-up';

// #enddocregion hero-of-the-month
// #docregion some-hero
const someHero = new Hero(42, 'Magma', 'Had a great month!', '555-555-5555');
// #enddocregion some-hero

// #docregion hero-of-the-month
@Component({
  selector: 'app-hero-of-the-month',
  templateUrl: './hero-of-the-month.component.html',
  providers: [
    // #docregion use-value
    { provide: Hero,          useValue:    someHero },
    // #docregion provide-injection-token
    { provide: TITLE,         useValue:   'Hero of the Month' },
    // #enddocregion provide-injection-token
    // #enddocregion use-value
    // #docregion use-class
    { provide: HeroService,   useClass:    HeroService },
    { provide: LoggerService, useClass:    DateLoggerService },
    // #enddocregion use-class
    // #docregion use-existing
    { provide: MinimalLogger, useExisting: LoggerService },
    // #enddocregion use-existing
    // #docregion provide-injection-token, use-factory
    { provide: RUNNERS_UP,    useFactory:  runnersUpFactory(2), deps: [Hero, HeroService] }
    // #enddocregion provide-injection-token, use-factory
  ]
})
export class HeroOfTheMonthComponent {
  logs: string[] = [];

  constructor(
      logger: MinimalLogger,
      public heroOfTheMonth: Hero,
      @Inject(RUNNERS_UP) public runnersUp: string,
      @Inject(TITLE) public title: string)
  {
    this.logs = logger.logs;
    logger.logInfo('starting up');
  }
}
// #enddocregion hero-of-the-month
