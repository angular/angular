/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {reactiveErrorsToSignalErrors, CompatValidationError} from '../src/compat_validation_error';

describe('reactiveErrorsToSignalErrors', () => {
  it('converts an error to a custom error', () => {
    expect(reactiveErrorsToSignalErrors({min: true})).toEqual([
      new CompatValidationError({kind: 'min', context: true}),
    ]);
  });

  it('converts multiple errors', () => {
    expect(reactiveErrorsToSignalErrors({min: true, 'max': {max: 1, actual: 0}})).toEqual([
      new CompatValidationError({kind: 'min', context: true}),
      new CompatValidationError({kind: 'max', context: {max: 1, actual: 0}}),
    ]);
  });
});
