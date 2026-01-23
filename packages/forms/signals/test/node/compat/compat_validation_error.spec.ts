/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {CompatValidationError} from '../../../compat/src/api/compat_validation_error';
import {
  extractNestedReactiveErrors,
  reactiveErrorsToSignalErrors,
} from '../../../compat/src/compat_validation_error';

describe('destroy$', () => {
  const control = new FormControl();
  it('converts an error to a custom error', () => {
    expect(reactiveErrorsToSignalErrors({min: true}, control)).toEqual([
      new CompatValidationError({kind: 'min', context: true, control}),
    ]);
  });

  it('converts multiple errors', () => {
    expect(reactiveErrorsToSignalErrors({min: true, max: {max: 1, actual: 0}}, control)).toEqual([
      new CompatValidationError({kind: 'min', context: true, control}),
      new CompatValidationError({kind: 'max', context: {max: 1, actual: 0}, control}),
    ]);
  });
});

describe('extracts validation errors', () => {
  const failingValidator: ValidatorFn = (): ValidationErrors => {
    return {fail: true};
  };

  it('should extract errors from nested controls', () => {
    const cityControl = new FormControl('', failingValidator);
    const catControl = new FormControl('', failingValidator);
    const fg = new FormGroup({
      name: new FormControl(''),
      address: new FormGroup({
        city: cityControl,
      }),
      cats: new FormArray([catControl]),
    });

    expect(extractNestedReactiveErrors(fg)).toEqual([
      new CompatValidationError({kind: 'fail', context: true, control: cityControl}),
      new CompatValidationError({kind: 'fail', context: true, control: catControl}),
    ]);
  });

  it('should extract errors from the actual control', () => {
    const control = new FormControl(1, failingValidator);
    const errors = extractNestedReactiveErrors(control);
    expect(errors).toEqual([new CompatValidationError({kind: 'fail', context: true, control})]);
  });

  it('should extract errors from the a group', () => {
    const control = new FormGroup([], failingValidator);
    const errors = extractNestedReactiveErrors(control);
    expect(errors).toEqual([new CompatValidationError({kind: 'fail', context: true, control})]);
  });
});
