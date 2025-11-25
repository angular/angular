/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {SignalFormsConfig} from '../../../src/api/di';

/**
 * A value that can be used for `SignalFormsConfig.classes` to automatically add
 * the `ng-*` status classes from reactive forms.
 *
 * @experimental 21.0.1
 */
export const NG_STATUS_CLASSES: SignalFormsConfig['classes'] = {
  'ng-touched': (state) => state.touched(),
  'ng-untouched': (state) => !state.touched(),
  'ng-dirty': (state) => state.dirty(),
  'ng-pristine': (state) => !state.dirty(),
  'ng-valid': (state) => state.valid(),
  'ng-invalid': (state) => state.invalid(),
  'ng-pending': (state) => state.pending(),
};
