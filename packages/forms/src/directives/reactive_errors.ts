/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

import {
  formArrayNameExample,
  formControlNameExample,
  formGroupNameExample,
  ngModelGroupExample,
} from './error_examples';

export function controlParentException(nameOrIndex: string | number | null): Error {
  return new RuntimeError(
    RuntimeErrorCode.FORM_CONTROL_NAME_MISSING_PARENT,
    `formControlName must be used with a parent formGroup or formArray directive.  You'll want to add a formGroup/formArray
      directive and pass it an existing FormGroup/FormArray instance (you can create one in your class).

      ${describeFormControl(nameOrIndex)}

    Example:

    ${formControlNameExample}`,
  );
}

function describeFormControl(nameOrIndex: string | number | null): string {
  if (nameOrIndex == null || nameOrIndex === '') {
    return '';
  }

  const valueType = typeof nameOrIndex === 'string' ? 'name' : 'index';

  return `Affected Form Control ${valueType}: "${nameOrIndex}"`;
}

export function ngModelGroupException(): Error {
  return new RuntimeError(
    RuntimeErrorCode.FORM_CONTROL_NAME_INSIDE_MODEL_GROUP,
    `formControlName cannot be used with an ngModelGroup parent. It is only compatible with parents
      that also have a "form" prefix: formGroupName, formArrayName, or formGroup.

      Option 1:  Update the parent to be formGroupName (reactive form strategy)

      ${formGroupNameExample}

      Option 2: Use ngModel instead of formControlName (template-driven strategy)

      ${ngModelGroupExample}`,
  );
}

export function missingFormException(): Error {
  return new RuntimeError(
    RuntimeErrorCode.FORM_GROUP_MISSING_INSTANCE,
    `formGroup expects a FormGroup instance. Please pass one in.

      Example:

      ${formControlNameExample}`,
  );
}

export function groupParentException(): Error {
  return new RuntimeError(
    RuntimeErrorCode.FORM_GROUP_NAME_MISSING_PARENT,
    `formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup
    directive and pass it an existing FormGroup instance (you can create one in your class).

    Example:

    ${formGroupNameExample}`,
  );
}

export function arrayParentException(): Error {
  return new RuntimeError(
    RuntimeErrorCode.FORM_ARRAY_NAME_MISSING_PARENT,
    `formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup
      directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${formArrayNameExample}`,
  );
}

export const disabledAttrWarning = `
  It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true
  when you set up this control in your component class, the disabled attribute will actually be set in the DOM for
  you. We recommend using this approach to avoid 'changed after checked' errors.

  Example:
  // Specify the \`disabled\` property at control creation time:
  form = new FormGroup({
    first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
    last: new FormControl('Drew', Validators.required)
  });

  // Controls can also be enabled/disabled after creation:
  form.get('first')?.enable();
  form.get('last')?.disable();
`;

export const asyncValidatorsDroppedWithOptsWarning = `
  It looks like you're constructing using a FormControl with both an options argument and an
  async validators argument. Mixing these arguments will cause your async validators to be dropped.
  You should either put all your validators in the options object, or in separate validators
  arguments. For example:

  // Using validators arguments
  fc = new FormControl(42, Validators.required, myAsyncValidator);

  // Using AbstractControlOptions
  fc = new FormControl(42, {validators: Validators.required, asyncValidators: myAV});

  // Do NOT mix them: async validators will be dropped!
  fc = new FormControl(42, {validators: Validators.required}, /* Oops! */ myAsyncValidator);
`;

export function ngModelWarning(directiveName: string): string {
  return `
  It looks like you're using ngModel on the same form field as ${directiveName}.
  Support for using the ngModel input property and ngModelChange event with
  reactive form directives has been deprecated in Angular v6 and will be removed
  in a future version of Angular.

  For more information on this, see our API docs here:
  https://angular.io/api/forms/${
    directiveName === 'formControl' ? 'FormControlDirective' : 'FormControlName'
  }#use-with-ngmodel
  `;
}

function describeKey(isFormGroup: boolean, key: string | number): string {
  return isFormGroup ? `with name: '${key}'` : `at index: ${key}`;
}

export function noControlsError(isFormGroup: boolean): string {
  return `
    There are no form controls registered with this ${
      isFormGroup ? 'group' : 'array'
    } yet. If you're using ngModel,
    you may want to check next tick (e.g. use setTimeout).
  `;
}

export function missingControlError(isFormGroup: boolean, key: string | number): string {
  return `Cannot find form control ${describeKey(isFormGroup, key)}`;
}

export function missingControlValueError(isFormGroup: boolean, key: string | number): string {
  return `Must supply a value for form control ${describeKey(isFormGroup, key)}`;
}
