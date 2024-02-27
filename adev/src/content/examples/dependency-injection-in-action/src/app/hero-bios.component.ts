// #docplaster
// #docregion
import {Component} from '@angular/core';

import {HeroService} from './hero.service';
import {LoggerService} from './logger.service';
import {HeroBioComponent} from './hero-bio.component';
import {HeroContactComponent} from './hero-contact.component';

//////// HeroBiosComponent ////
// #docregion simple
@Component({
  standalone: true,
  selector: 'app-hero-bios',
  template: `
    <app-hero-bio [heroId]="1"></app-hero-bio>
    <app-hero-bio [heroId]="2"></app-hero-bio>
    <app-hero-bio [heroId]="3"></app-hero-bio>`,
  providers: [HeroService],
  imports: [HeroBioComponent],
})
export class HeroBiosComponent {
  // #enddocregion simple
  constructor(logger: LoggerService) {
    logger.logInfo('Creating HeroBiosComponent');
  }
  // #docregion simple
}
// #enddocregion simple

//////// HeroBiosAndContactsComponent ////
// #docregion hero-bios-and-contacts
@Component({
  standalone: true,
  selector: 'app-hero-bios-and-contacts',
  // #docregion template
  template: `
    <app-hero-bio [heroId]="1"> <app-hero-contact></app-hero-contact> </app-hero-bio>
    <app-hero-bio [heroId]="2"> <app-hero-contact></app-hero-contact> </app-hero-bio>
    <app-hero-bio [heroId]="3"> <app-hero-contact></app-hero-contact> </app-hero-bio>`,
  // #enddocregion template
  providers: [HeroService],
  imports: [HeroBioComponent, HeroContactComponent],
})
export class HeroBiosAndContactsComponent {
  constructor(logger: LoggerService) {
    logger.logInfo('Creating HeroBiosAndContactsComponent');
  }
}
// #enddocregion hero-bios-and-contacts
