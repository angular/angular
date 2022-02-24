/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatProgressSpinner} from './progress-spinner';

export * from './progress-spinner-module';
export {
  MatProgressSpinner,
  MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
  ProgressSpinnerMode,
  MatProgressSpinnerDefaultOptions,
  MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY,
} from './progress-spinner';

/**
 * @deprecated Import `MatProgressSpinner` instead. Note that the
 *    `mat-spinner` selector isn't deprecated.
 * @breaking-change 8.0.0
 */
// tslint:disable-next-line:variable-name
export const MatSpinner = MatProgressSpinner;
