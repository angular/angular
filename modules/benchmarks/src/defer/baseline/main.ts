/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {init, syncUrlParamsToForm} from '../init';

import {AppComponent} from './app.component';
import {provideZoneChangeDetection} from '@angular/core';

syncUrlParamsToForm();

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection(), provideProtractorTestingSupport()],
}).then(init);
