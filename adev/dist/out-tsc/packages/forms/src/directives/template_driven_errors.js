/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵRuntimeError as RuntimeError} from '@angular/core';
import {
  formControlNameExample,
  formGroupNameExample,
  ngModelGroupExample,
  ngModelWithFormGroupExample,
} from './error_examples';
export function modelParentException() {
  return new RuntimeError(
    1350 /* RuntimeErrorCode.NGMODEL_IN_FORM_GROUP */,
    `
    ngModel cannot be used to register form controls with a parent formGroup directive.  Try using
    formGroup's partner directive "formControlName" instead.  Example:

    ${formControlNameExample}

    Or, if you'd like to avoid registering this form control, indicate that it's standalone in ngModelOptions:

    Example:

    ${ngModelWithFormGroupExample}`,
  );
}
export function formGroupNameException() {
  return new RuntimeError(
    1351 /* RuntimeErrorCode.NGMODEL_IN_FORM_GROUP_NAME */,
    `
    ngModel cannot be used to register form controls with a parent formGroupName or formArrayName directive.

    Option 1: Use formControlName instead of ngModel (reactive strategy):

    ${formGroupNameExample}

    Option 2:  Update ngModel's parent be ngModelGroup (template-driven strategy):

    ${ngModelGroupExample}`,
  );
}
export function missingNameException() {
  return new RuntimeError(
    1352 /* RuntimeErrorCode.NGMODEL_WITHOUT_NAME */,
    `If ngModel is used within a form tag, either the name attribute must be set or the form
    control must be defined as 'standalone' in ngModelOptions.

    Example 1: <input [(ngModel)]="person.firstName" name="first">
    Example 2: <input [(ngModel)]="person.firstName" [ngModelOptions]="{standalone: true}">`,
  );
}
export function modelGroupParentException() {
  return new RuntimeError(
    1353 /* RuntimeErrorCode.NGMODELGROUP_IN_FORM_GROUP */,
    `
    ngModelGroup cannot be used with a parent formGroup directive.

    Option 1: Use formGroupName instead of ngModelGroup (reactive strategy):

    ${formGroupNameExample}

    Option 2:  Use a regular form tag instead of the formGroup directive (template-driven strategy):

    ${ngModelGroupExample}`,
  );
}
//# sourceMappingURL=template_driven_errors.js.map
