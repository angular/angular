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
import {isArray} from '../util/is_array';
import type {FieldNode} from './node';
import {reduceChildren, shortCircuitFalse} from './util';

/**
 * The validation state associated with a `FieldNode`.
 *
 * This class collects together various types of errors to represent the full validation state of
 * the field. There are 4 types of errors that need to be combined to determine validity:
 * 1. The synchronous errors produced by the schema logic.
 * 2. The synchronous tree errors produced by the schema logic. Tree errors may apply to a different
 *    field than the one that the logic that produced them is bound to. They support targeting the
 *    error at an arbitrary descendant field.
 * 3. The asynchronous tree errors produced by the schema logic. These work like synchronous tree
 *    errors, except the error list may also contain a special sentinel value indicating that a
 *    validator is still running.
 * 4. Server errors are not produced by the schema logic, but instead get imperatively added when a
 *    form submit fails with errors.
 */
export class FieldValidationState {
  constructor(private readonly node: FieldNode) {}

  /**
   * The full set of synchronous tree errors visible to this field. This includes ones that are
   * targeted at a descendant field rather than at this field.
   */
  private readonly rawSyncTreeErrors: Signal<WithField<ValidationError>[]> = computed(() => {
    if (this.shouldSkipValidation()) {
      return [];
    }

    return [
      ...this.node.logicNode.logic.syncTreeErrors.compute(this.node.context),
      ...(this.node.structure.parent?.validationState.rawSyncTreeErrors() ?? []),
    ];
  });

  /**
   * The full set of synchronous errors for this field, including synchronous tree errors and server
   * errors. Server errors are considered "synchronous" because they are imperatively added. From
   * the perspective of the field state they are either there or not, they are never in a pending
   * state.
   */
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

  /**
   * Whether the field is considered valid according solely to its synchronous validators.
   * Errors resulting from a previous submit attempt are also considered for this state.
   */
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

  /**
   * The synchronous tree errors visible to this field that are specifically targeted at this field
   * rather than a descendant.
   */
  readonly syncTreeErrors: Signal<WithField<ValidationError>[]> = computed(() =>
    this.rawSyncTreeErrors().filter((err) => err.field === this.node.fieldProxy),
  );

  /**
   * The full set of asynchronous tree errors visible to this field. This includes ones that are
   * targeted at a descendant field rather than at this field, as well as sentinel 'pending' values
   * indicating that the validator is still running and an error could still occur.
   */
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
   * The asynchronous tree errors visible to this field that are specifically targeted at this field
   * rather than a descendant. This also includes all 'pending' sentinel values, since those could
   * theoretically result in errors for this field.
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
   * The combined set of all errors that currently apply to this field.
   */
  readonly errors = computed(() => [
    ...this.syncErrors(),
    ...this.asyncErrors()
      .filter((err) => err !== 'pending')
      .map(stripField),
  ]);

  /**
   * Whether this field has any asynchronous validators still pending.
   */
  readonly pending = computed(() => this.asyncErrors().includes('pending'));

  /**
   * The validation status of the field.
   * - The status is 'valid' if neither the field nor any of its children has any errors or pending
   *   validators.
   * - The status is 'invalid' if the field or any of its children has an error
   *   (regardless of pending validators)
   * - The status is 'unknown' if neither the field nor any of its children has any errors,
   *   but the field or any of its children does have a pending validator.
   *
   * A field is considered valid if *all* of the following are true:
   *  - It has no errors or pending validators
   *  - All of its children are considered valid
   * A field is considered invalid if *any* of the following are true:
   *  - It has an error
   *  - Any of its children is considered invalid
   * A field is considered to have unknown validity status if it is not valid or invalid.
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

  /**
   * Whether the field is considered valid.
   *
   * A field is considered valid if *all* of the following are true:
   *  - It has no errors or pending validators
   *  - All of its children are considered valid
   *
   * Note: `!valid()` is *not* the same as `invalid()`. Both `valid()` and `invalid()` can be false
   * if there are currently no errors, but validators are still pending.
   */
  readonly valid = computed(() => this.status() === 'valid');

  /**
   * Whether the field is considered invalid.
   *
   * A field is considered invalid if *any* of the following are true:
   *  - It has an error
   *  - Any of its children is considered invalid
   *
   * Note: `!invalid()` is *not* the same as `valid()`. Both `valid()` and `invalid()` can be false
   * if there are currently no errors, but validators are still pending.
   */
  readonly invalid = computed(() => this.status() === 'invalid');

  /**
   * Indicates whether validation should be skipped for this field because it is hidden, disabled,
   * or readonly.
   */
  readonly shouldSkipValidation = computed(
    () => this.node.hidden() || this.node.disabled() || this.node.readonly(),
  );
}

/** Normalizes a validation result to a list of validation errors. */
function normalizeErrors(error: ValidationResult): readonly ValidationError[] {
  if (error === undefined) {
    return [];
  }

  if (isArray(error)) {
    return error;
  }

  return [error as ValidationError];
}
