/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {CustomValidationError} from '../../api/validation_errors';
import {AbstractControl} from '@angular/forms';
import {reactiveErrorsToSignalErrors} from './compat_error_converter';
import {getControlStatusSignal} from './compat_field_node';
import {CompatFieldNodeOptions} from './compat_structure';

/**
 * State of a `FieldNode` that's associated with form validation.
 */
export class CompatValidationState {
  readonly syncValid: Signal<boolean>;
  /**
   * All validation errors for this field.
   */
  readonly errors: Signal<CustomValidationError[]>;
  readonly pending: Signal<boolean>;
  readonly invalid: Signal<boolean>;
  readonly valid: Signal<boolean>;

  // readonly shouldSkipValidation = signal(true).asReadonly();

  constructor(options: CompatFieldNodeOptions) {
    this.syncValid = getControlStatusSignal(options, (c: AbstractControl) => c.status === 'VALID');
    this.errors = getControlStatusSignal(options, (c) => reactiveErrorsToSignalErrors(c.errors));
    this.pending = getControlStatusSignal(options, (c) => c.pending);

    this.valid = getControlStatusSignal(options, (c) => {
      return c.valid;
    });

    this.invalid = getControlStatusSignal(options, (c) => {
      return c.invalid;
    });
  }

  /**
   * The validation status of the field.
   * - The status is 'valid' if neither the field nor any of its children has any errors or pending
   *   validators.
   * - The status is 'invalid' if the field or any of its children has an error
   *   (regardless of pending validators)
   * - The status is 'pending' if neither the field nor any of its children has any errors,
   *   but the field or any of its children does have a pending validator.
   *
   * This field considers itself valid if *all* of the following are true:
   *  - it has no errors
   *  - all of its children consider themselves valid
   */
  readonly status: Signal<'valid' | 'invalid' | 'unknown'> = computed(() => {
    if (this.errors().length > 0) {
      return 'invalid';
    } else if (this.pending()) {
      return 'unknown';
    }

    return 'valid';
  });
}
