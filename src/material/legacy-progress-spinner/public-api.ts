/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatLegacyProgressSpinner} from './progress-spinner';

export {MatLegacyProgressSpinnerModule} from './progress-spinner-module';
export {MatLegacyProgressSpinner} from './progress-spinner';

export {
  MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS as MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS,
  MatProgressSpinnerDefaultOptions as MatLegacyProgressSpinnerDefaultOptions,
  MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY as MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY,
  ProgressSpinnerMode as LegacyProgressSpinnerMode,
} from '@angular/material/progress-spinner';

/**
 * @deprecated Import Progress Spinner instead. Note that the
 *    `mat-spinner` selector isn't deprecated.
 * @breaking-change 8.0.0
 */
// tslint:disable-next-line:variable-name
export const MatLegacySpinner = MatLegacyProgressSpinner;
