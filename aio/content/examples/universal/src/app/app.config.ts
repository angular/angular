// #docplaster
import { importProvidersFrom } from '@angular/core';
import { provideProtractorTestingSupport } from '@angular/platform-browser';
// #docregion client-hydration
import { provideClientHydration} from '@angular/platform-browser';
// #enddocregion client-hydration
// #docregion core
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
// #enddocregion core

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
// #docregion client-hydration, core

export const appConfig: ApplicationConfig = {
  providers: [
    // #enddocregion client-hydration
    provideRouter(routes),
    provideHttpClient(),
    // #enddocregion core
    // #docregion client-hydration
    provideClientHydration(),
    // #enddocregion client-hydration
    provideProtractorTestingSupport(), // essential for e2e testing

    // #docregion in-mem
    // TODO: Remove from production apps
    importProvidersFrom(
      // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
      // and returns simulated server responses.
      // Remove it when a real server is ready to receive requests.
      HttpClientInMemoryWebApiModule.forRoot(
        InMemoryDataService, { dataEncapsulation: false }
      )
    ),
    // #enddocregion in-mem
    // #docregion client-hydration
    // ...
    // #docregion core
  ],
};
// #enddocregion client-hydration, core
