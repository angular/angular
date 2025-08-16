/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent, OtherAppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import {provideZonelessChangeDetection} from '@angular/core';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
bootstrapApplication(OtherAppComponent, {
  providers: [provideZonelessChangeDetection()],
}).catch((err) => console.error(err));
