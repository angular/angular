/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XhrFactory} from '@angular/common';
import {HttpBackend} from '@angular/common/http';
import {ModuleWithProviders, NgModule, Type} from '@angular/core';

import {httpClientInMemBackendServiceFactory} from './http-client-in-memory-web-api-module';
import {InMemoryBackendConfig, InMemoryBackendConfigArgs, InMemoryDbService} from './interfaces';

@NgModule()
export class InMemoryWebApiModule {
  /**
   *  Redirect BOTH Angular `Http` and `HttpClient` XHR calls
   *  to in-memory data store that implements `InMemoryDbService`.
   *  with class that implements InMemoryDbService and creates an in-memory database.
   *
   *  Usually imported in the root application module.
   *  Can import in a lazy feature module too, which will shadow modules loaded earlier
   *
   * @param dbCreator - Class that creates seed data for in-memory database. Must implement
   *     InMemoryDbService.
   * @param [options]
   *
   * @example
   * InMemoryWebApiModule.forRoot(dbCreator);
   * InMemoryWebApiModule.forRoot(dbCreator, {useValue: {delay:600}});
   */
  static forRoot(dbCreator: Type<InMemoryDbService>, options?: InMemoryBackendConfigArgs):
      ModuleWithProviders<InMemoryWebApiModule> {
    return {
      ngModule: InMemoryWebApiModule,
      providers: [
        {provide: InMemoryDbService, useClass: dbCreator},
        {provide: InMemoryBackendConfig, useValue: options}, {
          provide: HttpBackend,
          useFactory: httpClientInMemBackendServiceFactory,
          deps: [InMemoryDbService, InMemoryBackendConfig, XhrFactory]
        }
      ]
    };
  }

  /**
   *
   * Enable and configure the in-memory web api in a lazy-loaded feature module.
   * Same as `forRoot`.
   * This is a feel-good method so you can follow the Angular style guide for lazy-loaded modules.
   */
  static forFeature(dbCreator: Type<InMemoryDbService>, options?: InMemoryBackendConfigArgs):
      ModuleWithProviders<InMemoryWebApiModule> {
    return InMemoryWebApiModule.forRoot(dbCreator, options);
  }
}
