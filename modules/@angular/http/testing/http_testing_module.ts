/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';

import {MockBackend} from './mock_backend';


/**
 * Http setup factory function used for testing.
 *
 * @stable
 */
export function setupHttpTesting(backend: ConnectionBackend, defaultOptions: RequestOptions) {
  return new Http(backend, defaultOptions);
}

/**
 * @whatItDoes Sets up the http module to be used for testing.
 *
 * @howToUse
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestModule({
 *     imports: [HttpTestingModule]
 *   });
 * });
 * ```
 *
 * @description
 *
 * The modules sets up the Http module to be used for testing.
 * It provides a mock implementation of {@link Http} relying on {@link MockBackend}.
 *
 * @stable
 */
@NgModule({
  providers: [
    MockBackend, BaseRequestOptions,
    {provide: Http, useFactory: setupHttpTesting, deps: [MockBackend, BaseRequestOptions]}
  ]
})
export class HttpTestingModule {
}
