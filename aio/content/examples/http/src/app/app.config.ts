// #docplaster
// #docregion sketch
import { ApplicationConfig } from '@angular/core';
// #enddocregion sketch

import { provideProtractorTestingSupport } from '@angular/platform-browser';
// #docregion sketch
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
// #enddocregion sketch

import { HttpClientJsonpModule } from '@angular/common/http';
import { HttpClientXsrfModule } from '@angular/common/http';
import { httpInterceptorProviders } from '../app/http-interceptors/index';
import { noopInterceptorProvider } from '../app/http-interceptors/noop-interceptor';

// #region example helper services; not shown in docs
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from '../app/in-memory-data.service';

import { AuthService } from '../app/auth.service';
import { HttpErrorHandler } from '../app/http-error-handler.service';
import { MessageService } from '../app/message.service';
import { RequestCache, RequestCacheWithMap } from '../app/request-cache.service';
// #endregion example helper services; not shown in docs

// #docregion sketch

// #docregion interceptor-providers, jsonp, noop-provider, xsrf
export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(HttpClientModule),
// #enddocregion interceptor-providers, jsonp, noop-provider,  sketch, xsrf
// #docregion jsonp
    importProvidersFrom(HttpClientJsonpModule),
// #enddocregion jsonp
// #docregion noop-provider
    noopInterceptorProvider,
// #enddocregion noop-provider
// #docregion interceptor-providers
    httpInterceptorProviders,
// #enddocregion interceptor-providers
// #docregion xsrf
    importProvidersFrom(
        HttpClientXsrfModule.withOptions({
        cookieName: 'My-Xsrf-Cookie',
        headerName: 'My-Xsrf-Header',
      })
    ),
// #enddocregion xsrf

    AuthService,
    HttpErrorHandler,
    MessageService,
    { provide: RequestCache, useClass: RequestCacheWithMap },

    importProvidersFrom(
      // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
      // and returns simulated server responses.
      // Remove it when a real server is ready to receive requests.
      HttpClientInMemoryWebApiModule.forRoot(
        InMemoryDataService, {
          dataEncapsulation: false,
          passThruUnknownUrl: true,
          put204: false // return entity after PUT/update
        }
      )
    ),
    provideProtractorTestingSupport(), // essential for e2e testing
// #docregion interceptor-providers, jsonp, noop-provider, sketch, xsrf
  ]
};
