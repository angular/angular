/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClientModule} from '../../index';
import {NgModule} from '@angular/core';

import {provideHttpClientTesting} from './provider';

/**
 * Configures `HttpClientTestingBackend` as the `HttpBackend` used by `HttpClient`.
 *
 * Inject `HttpTestingController` to expect and flush requests in your tests.
 *
 * @publicApi
 *
 * @deprecated Add `provideHttpClientTesting()` to your providers instead.
 */
@NgModule({
  imports: [HttpClientModule],
  providers: [provideHttpClientTesting()],
})
export class HttpClientTestingModule {}
