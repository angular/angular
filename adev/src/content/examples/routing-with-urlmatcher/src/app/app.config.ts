import {ApplicationConfig} from '@angular/core';
import {provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideProtractorTestingSupport(),
  ],
};
