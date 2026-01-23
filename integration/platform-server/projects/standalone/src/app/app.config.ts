import {provideHttpClient} from '@angular/common/http';
import {ApplicationConfig} from '@angular/core';
import {provideClientHydration, withIncrementalHydration} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideZoneChangeDetection} from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration()),
    provideHttpClient(),
  ],
};
