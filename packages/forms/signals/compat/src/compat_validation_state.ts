/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {ValidationError} from '../../src/api/rules';
import {calculateValidationSelfStatus, ValidationState} from '../../src/field/validation';
import {
  extractNestedReactiveErrors,
  type CompatValidationError,
} from '../../src/compat/validation_errors';
import {CompatFieldNode, getControlStatusSignal} from './compat_field_node';
import {CompatFieldNodeOptions} from './compat_structure';

// Readonly signal containing an empty array, used for optimization.
const EMPTY_ARRAY_SIGNAL = computed(() => []);

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

  constructor(
    private readonly node: CompatFieldNode,
    options: CompatFieldNodeOptions,
  ) {
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

  // Compat fields can't have validation rules applied to them; however, there are other
  // features that depend on this property, such as `markAsTouched()`.
  readonly shouldSkipValidation = computed(
    () => this.node.hidden() || this.node.disabled() || this.node.readonly(),
  );

  /**
   * Computes status based on whether the field is valid/invalid/pending.
   */
  readonly status: Signal<'valid' | 'invalid' | 'unknown'> = computed(() => {
    return calculateValidationSelfStatus(this);
  });
}
