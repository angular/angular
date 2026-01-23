/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {ValidationError} from '../../src/api/rules/validation/validation_errors';
import {calculateValidationSelfStatus, ValidationState} from '../../src/field/validation';
import type {CompatValidationError} from './api/compat_validation_error';
import {getControlStatusSignal} from './compat_field_node';
import {CompatFieldNodeOptions} from './compat_structure';
import {extractNestedReactiveErrors} from './compat_validation_error';

// Readonly signal containing an empty array, used for optimization.
const EMPTY_ARRAY_SIGNAL = computed(() => []);
const TRUE_SIGNAL = computed(() => true);

/**
 * Compat version of a validation state that wraps a FormControl, and proxies it's validation state.
 */
export class CompatValidationState implements ValidationState {
  readonly syncValid: Signal<boolean>;
  /**
   * All validation errors for this field.
   */
  readonly errors: Signal<CompatValidationError[]>;
  readonly pending: Signal<boolean>;
  readonly invalid: Signal<boolean>;
  readonly valid: Signal<boolean>;

  readonly parseErrors: Signal<ValidationError.WithFormField[]> = computed(() => []);

  constructor(options: CompatFieldNodeOptions) {
    this.syncValid = getControlStatusSignal(options, (c: AbstractControl) => c.status === 'VALID');
    this.errors = getControlStatusSignal(options, extractNestedReactiveErrors);
    this.pending = getControlStatusSignal(options, (c) => c.pending);

    this.valid = getControlStatusSignal(options, (c) => {
      return c.valid;
    });

    this.invalid = getControlStatusSignal(options, (c) => {
      return c.invalid;
    });
  }

  asyncErrors: Signal<(ValidationError.WithFieldTree | 'pending')[]> = EMPTY_ARRAY_SIGNAL;
  errorSummary: Signal<ValidationError.WithFieldTree[]> = EMPTY_ARRAY_SIGNAL;

  // Those are irrelevant for compat mode, as it has no children
  rawSyncTreeErrors = EMPTY_ARRAY_SIGNAL;
  syncErrors = EMPTY_ARRAY_SIGNAL;
  rawAsyncErrors = EMPTY_ARRAY_SIGNAL;
  shouldSkipValidation = TRUE_SIGNAL;

  /**
   * Computes status based on whether the field is valid/invalid/pending.
   */
  readonly status: Signal<'valid' | 'invalid' | 'unknown'> = computed(() => {
    return calculateValidationSelfStatus(this);
  });
}
