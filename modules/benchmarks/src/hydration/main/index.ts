/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  bootstrapApplication,
  provideClientHydration,
  provideProtractorTestingSupport,
} from '@angular/platform-browser';

import {init, syncUrlParamsToForm} from '../init';
import {AppComponent, setupTransferState} from '../table';

const params = syncUrlParamsToForm();
setupTransferState(params.cols, params.rows);

bootstrapApplication(AppComponent, {
  providers: [provideClientHydration(), provideProtractorTestingSupport()],
}).then((appRef) => init(appRef, true /* insertSsrContent */));
