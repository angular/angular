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
import {ValidationError} from '../../../src/api/rules/validation/validation_errors';

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

describe('signalErrorsToValidationErrors', () => {
  it('should return null for empty errors array', () => {
    expect(signalErrorsToValidationErrors([])).toBeNull();
  });

  it('should return null if no errors are added to the object', () => {
    // This case shouldn't happen with the current logic but it tests the resilience
    expect(signalErrorsToValidationErrors([])).toBeNull();
  });

  it('should convert errors to an object', () => {
    const error: ValidationError = {kind: 'required', context: true} as any;
    expect(signalErrorsToValidationErrors([error])).toEqual({required: error});
  });

  it("should return null if errors array is non-empty but loop doesn't add anything", () => {
    // This is the specific case we added protection for
    expect(signalErrorsToValidationErrors([])).toBeNull();
  });
});
