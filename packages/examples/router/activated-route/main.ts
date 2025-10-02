/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js';

import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {ActivatedRouteComponent} from './activated_route_component';

const appConfig: ApplicationConfig = {
  providers: [provideRouter([]), provideZoneChangeDetection(), provideProtractorTestingSupport()],
};

bootstrapApplication(ActivatedRouteComponent, appConfig).catch((err) => console.error(err));
