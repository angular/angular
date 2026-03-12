/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideZoneChangeDetection} from '@angular/core';

import {init, syncUrlParamsToForm} from '../init';

import {AppComponent} from './app.component';

syncUrlParamsToForm();

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection(), provideProtractorTestingSupport()],
}).then(init);
