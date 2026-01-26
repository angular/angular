/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal, untracked, ɵWritable} from '@angular/core';
import type {ValidationError} from '../api/rules/validation/validation_errors';
import type {FieldTree, TreeValidationResult, ValidationResult} from '../api/types';
import {isArray} from '../util/type_guards';
import type {FieldNode} from './node';
import {shortCircuitFalse} from './util';

/**
 * Helper function taking validation state, and returning own state of the node.
 * @param state
 */
export function calculateValidationSelfStatus(
  state: ValidationState,
): 'invalid' | 'unknown' | 'valid' {
  if (state.errors().length > 0) {
    return 'invalid';
  }
  if (state.pending()) {
    return 'unknown';
  }

  return 'valid';
}

export interface ValidationState {
  /**
   * The full set of synchronous tree errors visible to this field. This includes ones that are
   * targeted at a descendant field rather than at this field.
   */
  rawSyncTreeErrors: Signal<ValidationError.WithFieldTree[]>;

  /**
   * The full set of synchronous errors for this field, including synchronous tree errors and submission
   * errors. Submission errors are considered "synchronous" because they are imperatively added. From
   * the perspective of the field state they are either there or not, they are never in a pending
   * state.
   */
  syncErrors: Signal<ValidationError.WithFieldTree[]>;

  /**
   * Whether the field is considered valid according solely to its synchronous validators.
   * Errors resulting from a previous submit attempt are also considered for this state.
   */
  syncValid: Signal<boolean>;

  /**
   * The full set of asynchronous tree errors visible to this field. This includes ones that are
   * targeted at a descendant field rather than at this field, as well as sentinel 'pending' values
   * indicating that the validator is still running and an error could still occur.
   */
  rawAsyncErrors: Signal<(ValidationError.WithFieldTree | 'pending')[]>;

  /**
   * The asynchronous tree errors visible to this field that are specifically targeted at this field
   * rather than a descendant. This also includes all 'pending' sentinel values, since those could
   * theoretically result in errors for this field.
   */
  asyncErrors: Signal<(ValidationError.WithFieldTree | 'pending')[]>;

  /**
   * The combined set of all errors that currently apply to this field.
   */
  errors: Signal<ValidationError.WithFieldTree[]>;

  parseErrors: Signal<ValidationError.WithFormField[]>;

  /**
   * The combined set of all errors that currently apply to this field and its descendants.
   */
  errorSummary: Signal<ValidationError.WithFieldTree[]>;

  /**
   * Whether this field has any asynchronous validators still pending.
   */
  pending: Signal<boolean>;

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
  status: Signal<'valid' | 'invalid' | 'unknown'>;
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
  valid: Signal<boolean>;

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
  invalid: Signal<boolean>;

  /**
   * Indicates whether validation should be skipped for this field because it is hidden, disabled,
   * or readonly.
   */
  shouldSkipValidation: Signal<boolean>;
}

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
export class FieldValidationState implements ValidationState {
  constructor(readonly node: FieldNode) {}

  /**
   * The full set of synchronous tree errors visible to this field. This includes ones that are
   * targeted at a descendant field rather than at this field.
   */
  readonly rawSyncTreeErrors: Signal<ValidationError.WithFieldTree[]> = computed(() => {
    if (this.shouldSkipValidation()) {
      return [];
    }

    return [
      ...this.node.logicNode.logic.syncTreeErrors.compute(this.node.context),
      ...(this.node.structure.parent?.validationState.rawSyncTreeErrors() ?? []),
    ];
  });

  /**
   * The full set of synchronous errors for this field, including synchronous tree errors and
   * submission errors. Submission errors are considered "synchronous" because they are imperatively
   * added. From the perspective of the field state they are either there or not, they are never in a
   * pending state.
   */
  readonly syncErrors: Signal<ValidationError.WithFieldTree[]> = computed(() => {
    // Short-circuit running validators if validation doesn't apply to this field.
    if (this.shouldSkipValidation()) {
      return [];
    }

    return [
      ...this.node.logicNode.logic.syncErrors.compute(this.node.context),
      ...this.syncTreeErrors(),
      ...normalizeErrors(this.node.submitState.submissionErrors()),
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

    return this.node.structure.reduceChildren(
      this.syncErrors().length === 0,
      (child, value) => value && child.validationState.syncValid(),
      shortCircuitFalse,
    );
  });

  /**
   * The synchronous tree errors visible to this field that are specifically targeted at this field
   * rather than a descendant.
   */
  readonly syncTreeErrors: Signal<ValidationError.WithFieldTree[]> = computed(() =>
    this.rawSyncTreeErrors().filter((err) => err.fieldTree === this.node.fieldProxy),
  );

  /**
   * The full set of asynchronous tree errors visible to this field. This includes ones that are
   * targeted at a descendant field rather than at this field, as well as sentinel 'pending' values
   * indicating that the validator is still running and an error could still occur.
   */
  readonly rawAsyncErrors: Signal<(ValidationError.WithFieldTree | 'pending')[]> = computed(() => {
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
  readonly asyncErrors: Signal<(ValidationError.WithFieldTree | 'pending')[]> = computed(() => {
    if (this.shouldSkipValidation()) {
      return [];
    }
    return this.rawAsyncErrors().filter(
      (err) => err === 'pending' || err.fieldTree === this.node.fieldProxy,
    );
  });

  readonly parseErrors: Signal<ValidationError.WithFormField[]> = computed(() =>
    this.node.formFieldBindings().flatMap((field) => field.parseErrors()),
  );

  /**
   * The combined set of all errors that currently apply to this field.
   */
  readonly errors = computed(() => [
    ...this.parseErrors(),
    ...this.syncErrors(),
    ...this.asyncErrors().filter((err) => err !== 'pending'),
  ]);

  readonly errorSummary = computed(() => {
    const errors = this.node.structure.reduceChildren(this.errors(), (child, result) => [
      ...result,
      ...child.errorSummary(),
    ]);
    // Sort by DOM order on client-side only.
    if (typeof ngServerMode === 'undefined' || !ngServerMode) {
      untracked(() => errors.sort(compareErrorPosition));
    }
    return errors;
  });

  /**
   * Whether this field has any asynchronous validators still pending.
   */
  readonly pending = computed(() =>
    this.node.structure.reduceChildren(
      this.asyncErrors().includes('pending'),
      (child, value) => value || child.validationState.asyncErrors().includes('pending'),
    ),
  );

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
    let ownStatus = calculateValidationSelfStatus(this);

    return this.node.structure.reduceChildren<'valid' | 'invalid' | 'unknown'>(
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
function normalizeErrors<T extends ValidationResult>(error: T | readonly T[]): readonly T[] {
  if (error === undefined) {
    return [];
  }

  if (isArray(error)) {
    return error as readonly T[];
  }

  return [error as T];
}

/**
 * Sets the given field on the given error(s) if it does not already have a field.
 * @param error The error(s) to add the field to
 * @param fieldTree The default field to add
 * @returns The passed in error(s), with its field set.
 */
export function addDefaultField<E extends ValidationError.WithOptionalFieldTree>(
  error: E,
  fieldTree: FieldTree<unknown>,
): E & {fieldTree: FieldTree<unknown>};
export function addDefaultField<E extends ValidationError>(
  errors: TreeValidationResult<E>,
  fieldTree: FieldTree<unknown>,
): ValidationResult<E & {fieldTree: FieldTree<unknown>}>;
export function addDefaultField<E extends ValidationError>(
  errors: TreeValidationResult<E>,
  fieldTree: FieldTree<unknown>,
): ValidationResult<E & {fieldTree: FieldTree<unknown>}> {
  if (isArray(errors)) {
    for (const error of errors) {
      (error as ɵWritable<ValidationError.WithOptionalFieldTree>).fieldTree ??= fieldTree;
    }
  } else if (errors) {
    (errors as ɵWritable<ValidationError.WithOptionalFieldTree>).fieldTree ??= fieldTree;
  }
  return errors as ValidationResult<E & {fieldTree: FieldTree<unknown>}>;
}

function getFirstBoundElement(error: ValidationError.WithFieldTree) {
  if (error.formField) return error.formField.element;
  return error
    .fieldTree()
    .formFieldBindings()
    .reduce<HTMLElement | undefined>((el: HTMLElement | undefined, binding) => {
      if (!el || !binding.element) return el ?? binding.element;
      return el.compareDocumentPosition(binding.element) & Node.DOCUMENT_POSITION_PRECEDING
        ? binding.element
        : el;
    }, undefined);
}

/**
 * Compares the position of two validation errors by the position of their corresponding field
 * binding directive in the DOM.
 * - For errors with multiple field bindings, the earliest one in the DOM will be used for comparison.
 * - For errors that have no field bindings, they will be considered to come after all other errors.
 */
function compareErrorPosition(
  a: ValidationError.WithFieldTree,
  b: ValidationError.WithFieldTree,
): number {
  const aEl = getFirstBoundElement(a);
  const bEl = getFirstBoundElement(b);
  if (aEl === bEl) return 0;
  if (aEl === undefined || bEl === undefined) return aEl === undefined ? 1 : -1;
  return aEl.compareDocumentPosition(bEl) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
}
