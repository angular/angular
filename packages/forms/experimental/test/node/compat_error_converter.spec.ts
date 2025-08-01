/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ValidationError} from '@angular/forms/experimental';
import {reactiveErrorsToSignalErrors} from '../../src/field/compat/compat_error_converter';

describe('reactiveErrorsToSignalErrors', () => {
  it('converts an error to a custom error', () => {
    expect(reactiveErrorsToSignalErrors({min: true})).toEqual([
      ValidationError.custom({kind: 'min', context: true}),
    ]);
  });

  it('converts multiple errors', () => {
    expect(reactiveErrorsToSignalErrors({min: true, 'max': {max: 1, actual: 0}})).toEqual([
      ValidationError.custom({kind: 'min', context: true}),
      ValidationError.custom({kind: 'max', context: {max: 1, actual: 0}}),
    ]);
  });
});
