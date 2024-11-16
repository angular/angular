import {provideHttpClient} from '@angular/common/http';
import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';

import {routes} from './app.routes';
import {InMemoryDataService} from './in-memory-data.service';
import {HeroService} from './model/hero.service';
import {UserService} from './model/user.service';
import {TwainService} from './twain/twain.service';

export const appProviders = [
  provideRouter(routes),
  provideHttpClient(),
  provideProtractorTestingSupport(),
  importProvidersFrom(
    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {dataEncapsulation: false}),
  ),
  HeroService,
  TwainService,
  UserService,
];

export const appConfig: ApplicationConfig = {
  providers: appProviders,
};
