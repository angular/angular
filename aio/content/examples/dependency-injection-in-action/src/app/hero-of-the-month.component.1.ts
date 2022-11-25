// Illustrative (not used), mini-version of the actual HeroOfTheMonthComponent
// Injecting with the MinimalLogger "interface-class"
import { Component, NgModule } from '@angular/core';
import { LoggerService } from './logger.service';
import { MinimalLogger } from './minimal-logger.service';

// #docregion
@Component({
  selector: 'app-hero-of-the-month',
  templateUrl: './hero-of-the-month.component.html',
  // TODO: move this aliasing, `useExisting` provider to the AppModule
  providers: [{ provide: MinimalLogger, useExisting: LoggerService }]
})
export class HeroOfTheMonthComponent {
  logs: string[] = [];
  constructor(logger: MinimalLogger) {
    logger.logInfo('starting up');
  }
}
// #enddocregion

// This NgModule exists only to avoid the Angular language service's "undeclared component" error
@NgModule({
  declarations: [ HeroOfTheMonthComponent ]
})
export class NoopModule {}
