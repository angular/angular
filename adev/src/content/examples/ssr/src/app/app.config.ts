// #docplaster
import {importProvidersFrom} from '@angular/core';
import {provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideClientHydration} from '@angular/platform-browser';
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withFetch} from '@angular/common/http';

import {routes} from './app.routes';

import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {InMemoryDataService} from './in-memory-data.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // TODO: Enable using Fetch API when disabling `HttpClientInMemoryWebApiModule`.
    provideHttpClient(/* withFetch()*/),
    provideClientHydration(),
    provideProtractorTestingSupport(), // essential for e2e testing

    // TODO: Remove from production apps
    importProvidersFrom(
      // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
      // and returns simulated server responses.
      // Remove it when a real server is ready to receive requests.
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {dataEncapsulation: false}),
    ),
    // ...
  ],
};
