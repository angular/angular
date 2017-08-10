// #docplaster
// #docregion
import { Component }             from '@angular/core';

import { HeroService }          from './hero.service';
import { LoggerService }        from './logger.service';

//////// HeroBiosComponent ////
// #docregion simple
@Component({
  selector: 'hero-bios',
  template: `
    <hero-bio [heroId]="1"></hero-bio>
    <hero-bio [heroId]="2"></hero-bio>
    <hero-bio [heroId]="3"></hero-bio>`,
  providers: [HeroService]
})
export class HeroBiosComponent {
// #enddocregion simple
// #docregion ctor
  constructor(logger: LoggerService) {
    logger.logInfo('Creating HeroBiosComponent');
  }
// #enddocregion ctor
// #docregion simple
}
// #enddocregion simple

//////// HeroBiosAndContactsComponent ////
// #docregion hero-bios-and-contacts
@Component({
  selector: 'hero-bios-and-contacts',
  // #docregion template
  template: `
    <hero-bio [heroId]="1"> <hero-contact></hero-contact> </hero-bio>
    <hero-bio [heroId]="2"> <hero-contact></hero-contact> </hero-bio>
    <hero-bio [heroId]="3"> <hero-contact></hero-contact> </hero-bio>`,
  // #enddocregion template
  // #docregion class-provider
  providers: [HeroService]
  // #enddocregion class-provider
})
export class HeroBiosAndContactsComponent {
  constructor(logger: LoggerService) {
    logger.logInfo('Creating HeroBiosAndContactsComponent');
  }
}
// #enddocregion hero-bios-and-contacts
