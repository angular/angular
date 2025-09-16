/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {XhrFactory} from '@angular/common';
import {HttpBackend} from '@angular/common/http';
import {inject, ModuleWithProviders, NgModule, Type} from '@angular/core';

import {HttpClientBackendService} from './http-client-backend-service';
import {InMemoryBackendConfig, InMemoryBackendConfigArgs, InMemoryDbService} from './interfaces';

// Internal - Creates the in-mem backend for the HttpClient module
// AoT requires factory to be exported
export function httpClientInMemBackendServiceFactory(): HttpBackend {
  return new HttpClientBackendService(
    inject(InMemoryDbService),
    inject(InMemoryBackendConfig),
    inject(XhrFactory),
  ) as HttpBackend;
}

@NgModule()
export class HttpClientInMemoryWebApiModule {
  /**
   *  Redirect the Angular `HttpClient` XHR calls
   *  to in-memory data store that implements `InMemoryDbService`.
   *  with class that implements InMemoryDbService and creates an in-memory database.
   *
   *  Usually imported in the root application module.
   *  Can import in a lazy feature module too, which will shadow modules loaded earlier
   *
   *  Note: If you use the `FetchBackend`, make sure forRoot is invoked after in the providers list
   *
   * @param dbCreator - Class that creates seed data for in-memory database. Must implement
   *     InMemoryDbService.
   * @param [options]
   *
   * @example
   * HttpInMemoryWebApiModule.forRoot(dbCreator);
   * HttpInMemoryWebApiModule.forRoot(dbCreator, {useValue: {delay:600}});
   */
  static forRoot(
    dbCreator: Type<InMemoryDbService>,
    options?: InMemoryBackendConfigArgs,
  ): ModuleWithProviders<HttpClientInMemoryWebApiModule> {
    return {
      ngModule: HttpClientInMemoryWebApiModule,
      providers: [
        {provide: InMemoryDbService, useClass: dbCreator},
        {provide: InMemoryBackendConfig, useValue: options},
        {
          provide: HttpBackend,
          useFactory: httpClientInMemBackendServiceFactory,
        },
      ],
    };
  }
  /**
   *
   * Enable and configure the in-memory web api in a lazy-loaded feature module.
   * Same as `forRoot`.
   * This is a feel-good method so you can follow the Angular style guide for lazy-loaded modules.
   */
  static forFeature(
    dbCreator: Type<InMemoryDbService>,
    options?: InMemoryBackendConfigArgs,
  ): ModuleWithProviders<HttpClientInMemoryWebApiModule> {
    return HttpClientInMemoryWebApiModule.forRoot(dbCreator, options);
  }
}
