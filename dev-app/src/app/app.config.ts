/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideHttpClient, withFetch} from '@angular/common/http';
import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {provideClientHydration} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideClientHydration(),
    provideHttpClient(withFetch()),
  ],
};
