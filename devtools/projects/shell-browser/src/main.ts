/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {appConfig} from './app/app.config';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
