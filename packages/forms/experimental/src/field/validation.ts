/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import type {ValidationResult} from '../api/types';
import {stripField, WithField, type ValidationError} from '../api/validation_errors';
import type {FieldNode} from './node';
import {reduceChildren, shortCircuitFalse} from './util';

/**
 * State of a `FieldNode` that's associated with form validation.
 */
export class FieldValidationState {
  constructor(private readonly node: FieldNode) {}

  private readonly rawSyncTreeErrors: Signal<WithField<ValidationError>[]> = computed(() => {
    if (this.shouldSkipValidation()) {
      return [];
    }

    return [
      ...this.node.logicNode.logic.syncTreeErrors.compute(this.node.context),
      ...(this.node.structure.parent?.validationState.rawSyncTreeErrors() ?? []),
    ];
  });

  readonly syncErrors: Signal<ValidationError[]> = computed(() => {
    // Short-circuit running validators if validation doesn't apply to this field.
    if (this.shouldSkipValidation()) {
      return [];
    }

    return [
      ...this.node.logicNode.logic.syncErrors.compute(this.node.context),
      ...this.syncTreeErrors().map(stripField),
      ...normalizeErrors(this.node.submitState.serverErrors()),
    ];
  });

  readonly syncValid: Signal<boolean> = computed(() => {
    // Short-circuit checking children if validation doesn't apply to this field.
    if (this.shouldSkipValidation()) {
      return true;
    }

    return reduceChildren(
      this.node,
      this.syncErrors().length === 0,
      (child, value) => value && child.validationState.syncValid(),
      shortCircuitFalse,
    );
  });

  readonly syncTreeErrors: Signal<WithField<ValidationError>[]> = computed(
    () =>
      this.rawSyncTreeErrors().filter(
        (err) => err.field === this.node.fieldProxy,
      ) as WithField<ValidationError>[],
  );

  readonly rawAsyncErrors: Signal<(WithField<ValidationError> | 'pending')[]> = computed(() => {
    // Short-circuit running validators if validation doesn't apply to this field.
    if (this.shouldSkipValidation()) {
      return [];
    }

    return [
      // TODO: add field in `validateAsync` and remove this map
      ...this.node.logicNode.logic.asyncErrors.compute(this.node.context),
      // TODO: does it make sense to filter this to errors in this subtree?
      ...(this.node.structure.parent?.validationState.rawAsyncErrors() ?? []),
    ];
  });

  /**
   * All asynchronous validation errors & pending statuses for this field.
   */
  readonly asyncErrors: Signal<(WithField<ValidationError> | 'pending')[]> = computed(() => {
    if (this.shouldSkipValidation()) {
      return [];
    }
    return this.rawAsyncErrors().filter(
      (err) => err === 'pending' || err.field! === this.node.fieldProxy,
    ) as Array<WithField<ValidationError> | 'pending'>;
  });

  /**
   * All validation errors for this field.
   */
  readonly errors = computed(() => [
    ...this.syncErrors(),
    ...this.asyncErrors()
      .filter((err) => err !== 'pending')
      .map(stripField),
  ]);

  readonly pending = computed(() => this.asyncErrors().includes('pending'));

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
    // Short-circuit checking children if validation doesn't apply to this field.
    if (this.shouldSkipValidation()) {
      return 'valid';
    }
    let ownStatus: 'valid' | 'invalid' | 'unknown' = 'valid';
    if (this.errors().length > 0) {
      ownStatus = 'invalid';
    } else if (this.pending()) {
      ownStatus = 'unknown';
    }

    return reduceChildren<'valid' | 'invalid' | 'unknown'>(
      this.node,
      ownStatus,
      (child, value) => {
        if (value === 'invalid' || child.validationState.status() === 'invalid') {
          return 'invalid';
        } else if (value === 'unknown' || child.validationState.status() === 'unknown') {
          return 'unknown';
        }
        return 'valid';
      },
      (v) => v === 'invalid', // short-circuit on 'invalid'
    );
  });

  readonly valid = computed(() => this.status() === 'valid');
  readonly invalid = computed(() => this.status() === 'invalid');

  /**
   * Whether validation should be skipped for this field.
   *
   * Defined in terms of other conditions based on the field logic.
   */
  shouldSkipValidation(): boolean {
    return this.node.hidden() || this.node.disabled() || this.node.readonly();
  }
}

function normalizeErrors(error: ValidationResult): ValidationError[] {
  if (error === undefined) {
    return [];
  }

  if (Array.isArray(error)) {
    return error;
  }

  return [error as ValidationError];
}
