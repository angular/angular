/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  reactiveErrorsToSignalErrors,
  ReactiveValidationError,
} from '../../src/field/compat/compat_validation_error';

describe('reactiveErrorsToSignalErrors', () => {
  it('converts an error to a custom error', () => {
    expect(reactiveErrorsToSignalErrors({min: true})).toEqual([
      new ReactiveValidationError({kind: 'min', context: true}),
    ]);
  });

  it('converts multiple errors', () => {
    expect(reactiveErrorsToSignalErrors({min: true, 'max': {max: 1, actual: 0}})).toEqual([
      new ReactiveValidationError({kind: 'min', context: true}),
      new ReactiveValidationError({kind: 'max', context: {max: 1, actual: 0}}),
    ]);
  });
});
