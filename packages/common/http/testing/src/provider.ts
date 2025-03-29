/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpBackend, ɵREQUESTS_CONTRIBUTE_TO_STABILITY} from '../../index';
import {Provider} from '@angular/core';

import {HttpTestingController} from './api';
import {HttpClientTestingBackend} from './backend';

export function provideHttpClientTesting(): Provider[] {
  return [
    HttpClientTestingBackend,
    {provide: HttpBackend, useExisting: HttpClientTestingBackend},
    {provide: HttpTestingController, useExisting: HttpClientTestingBackend},
    {provide: ɵREQUESTS_CONTRIBUTE_TO_STABILITY, useValue: false},
  ];
}
