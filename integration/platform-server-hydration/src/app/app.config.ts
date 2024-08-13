import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {
  provideClientHydration,
  provideProtractorTestingSupport,
  withEventReplay,
} from '@angular/platform-browser';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideProtractorTestingSupport(),
  ],
};
