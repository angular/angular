/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';

import {provideClientHydration, withEventReplay} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideClientHydration(withEventReplay())],
};
