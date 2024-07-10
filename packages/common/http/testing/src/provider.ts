/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpBackend, ɵREQUESTS_CONTRIBUTE_TO_STABILITY} from '@angular/common/http';
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
