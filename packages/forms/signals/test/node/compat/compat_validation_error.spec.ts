/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {
  CompatValidationError,
  extractNestedReactiveErrors,
  reactiveErrorsToSignalErrors,
  signalErrorsToValidationErrors,
} from '../../../src/compat/validation_errors';
import {ValidationError} from '../../../src/api/rules';

describe('destroy$', () => {
  it('converts an error to a custom error', () => {
    const control = new FormControl();
    expect(reactiveErrorsToSignalErrors({min: true}, control)).toEqual([
      new CompatValidationError({kind: 'min', context: true, control}),
    ]);
  });

  it('converts multiple errors', () => {
    const control = new FormControl();
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

describe('signalErrorsToValidationErrors', () => {
  it('should return null for empty errors array', () => {
    expect(signalErrorsToValidationErrors([])).toBeNull();
  });

  it('should convert standard ValidationError to an object matching its kind', () => {
    const error: ValidationError = {kind: 'required', message: 'Field is required'};
    expect(signalErrorsToValidationErrors([error])).toEqual({
      required: error,
    });
  });

  it('should unwrap CompatValidationError context', () => {
    const control = new FormControl();
    const errorDetails = {min: 10, actual: 5};
    const compatError = new CompatValidationError({
      kind: 'min',
      context: errorDetails,
      control,
    });

    expect(signalErrorsToValidationErrors([compatError])).toEqual({
      min: errorDetails,
    });
  });

  it('should handle mixed standard and compat errors', () => {
    const control = new FormControl();
    const requiredError: ValidationError = {kind: 'required'};
    const minDetails = {min: 10, actual: 5};
    const minCompatError = new CompatValidationError({
      kind: 'min',
      context: minDetails,
      control,
    });

    const result = signalErrorsToValidationErrors([requiredError, minCompatError]);
    expect(result).toEqual({
      required: requiredError,
      min: minDetails,
    });
  });

  it('should let the last error of the same kind win', () => {
    const error1: ValidationError = {kind: 'custom', message: 'error 1'};
    const error2: ValidationError = {kind: 'custom', message: 'error 2'};

    expect(signalErrorsToValidationErrors([error1, error2])).toEqual({
      custom: error2,
    });
  });
});
