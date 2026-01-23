/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {init, syncUrlParamsToForm} from '../init';
import {AppComponent} from '../table';

syncUrlParamsToForm();

bootstrapApplication(AppComponent, {
  providers: [provideProtractorTestingSupport()],
}).then((appRef) => init(appRef, false /* insertSsrContent */));
