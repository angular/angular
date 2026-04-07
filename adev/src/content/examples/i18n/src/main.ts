// #docregion global-locale
import '@angular/common/locales/global/fr';
// #enddocregion global-locale

import {provideProtractorTestingSupport} from '@angular/platform-browser';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideProtractorTestingSupport(), // essential for e2e testing
  ],
});
