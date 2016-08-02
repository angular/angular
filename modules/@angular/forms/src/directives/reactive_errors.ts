/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseException} from '../facade/exceptions';

import {AbstractControlDirective} from './abstract_control_directive';
import {FormErrorExamples as Examples} from './error_examples';
import {FormArrayName} from './reactive_directives/form_array_name';
import {FormGroupDirective} from './reactive_directives/form_group_directive';
import {FormGroupName} from './reactive_directives/form_group_name';

export class ReactiveErrors {
  static hasInvalidParent(parent: AbstractControlDirective): boolean {
    return !(parent instanceof FormGroupName) && !(parent instanceof FormGroupDirective) &&
        !(parent instanceof FormArrayName);
  }

  static controlParentException(): void {
    throw new BaseException(
        `formControlName must be used with a parent formGroup directive.  You'll want to add a formGroup
       directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${Examples.formControlName}`);
  }

  static ngModelGroupException(): void {
    throw new BaseException(
        `formControlName cannot be used with an ngModelGroup parent. It is only compatible with parents
       that also have a "form" prefix: formGroupName, formArrayName, or formGroup.

       Option 1:  Update the parent to be formGroupName (reactive form strategy)

        ${Examples.formGroupName}

        Option 2: Use ngModel instead of formControlName (template-driven strategy)

        ${Examples.ngModelGroup}`);
  }
  static missingFormException(): void {
    throw new BaseException(`formGroup expects a FormGroup instance. Please pass one in.

       Example:

       ${Examples.formControlName}`);
  }

  static groupParentException(): void {
    throw new BaseException(
        `formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup
      directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${Examples.formGroupName}`);
  }

  static arrayParentException(): void {
    throw new BaseException(
        `formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup
       directive and pass it an existing FormGroup instance (you can create one in your class).

        Example:

        ${Examples.formArrayName}`);
  }
}
