/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {TruncatePipe} from './truncate';
import {bootstrapApplication} from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection()],
};

bootstrapApplication(TruncatePipe, appConfig).catch((err) => console.error(err));
