/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DISABLED_REASON, MetadataKey, REQUIRED} from '../logic_node';
import {FormPathImpl} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import type {FormError, FormPath, LogicFn} from './types';
import {ValidationResult} from './types';

/**
 * Adds logic to a from to conditionally disable a field.
 *
 * @param path The path of the field that may be disabled.
 * @param predicate A prdicate function that returns `true` if the field should be disabled.
 * The predicate recevies the following arguments:
 * 1) The value of the field that may be disabled.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 * @param reason A user-facing message describing why the field is disabled.
 */
export function disabled<T>(
  path: FormPath<T>,
  predicate: NoInfer<LogicFn<T, boolean>>,
  reason?: string,
): void {
  assertPathIsCurrent(path);

  const pathImpl = FormPathImpl.extractFromPath(path);
  const reasonFn: LogicFn<T, string> = (ctx) => (predicate(ctx) ? (reason ?? '') : '');
  pathImpl.logic.disabled.push(pathImpl.maybeWrapWithPredicate(predicate, false));
  pathImpl.logic.getMetadata(DISABLED_REASON).push(pathImpl.maybeWrapWithPredicate(reasonFn, ''));
}

/**
 * Adds logic to a from to conditionally hide a field. A hidden field does not contribute to the
 * validation, tocuhed/dirty state, or other logic of the form in any way.
 *
 * @param path The path of the field that may be hidden.
 * @param predicate A prdicate function that returns `true` if the field should be hidden.
 * The predicate recevies the following arguments:
 * 1) The value of the field that may be hidden.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 */
export function hidden<T>(path: FormPath<T>, predicate: NoInfer<LogicFn<T, boolean>>): void {
  assertPathIsCurrent(path);

  const pathImpl = FormPathImpl.extractFromPath(path);
  pathImpl.logic.hidden.push(pathImpl.maybeWrapWithPredicate(predicate, false));
}

/**
 * Adds logic to a from to conditionally add validation errors to a field.
 *
 * @param path The path of the field that may be hidden.
 * @param fn A function that returns a validation result representing 0 or more errors to associate
 * with the field. The function
 * recevies the following arguments:
 * 1) The value of the field that may have errors.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 */
export function validate<T>(
  path: FormPath<T>,
  validator: NoInfer<LogicFn<T, ValidationResult>>,
): void {
  assertPathIsCurrent(path);

  const pathImpl = FormPathImpl.extractFromPath(path);
  pathImpl.logic.errors.push(
    pathImpl.maybeWrapWithPredicate(validator, /* default value */ undefined),
  );
}

/**
 * Adds logic to a from to conditionally make a field required. A required field has metadata to
 * indicate that it is required, and has a validation error if its value is empty.
 *
 * @param path The path of the field that may be required.
 * @param requiredPredicate An optional prdicate function that returns `true` if the field should be
 * required. The predicate recevies the following arguments:
 * 1) The value of the field that may be required.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 * If the predicate function is not provided, the field is always required.
 * @param message An optional user-facing message to add to the error, or a function to generate the
 * user-facing message. The function recevies the following arguments
 * 1) The value of the field that has an error.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 * @param emptyPredicate An optional function that specifies custom logic to determine if a value is
 * empty.
 */
export function required<T>(
  path: FormPath<T>,
  requiredPredicate: NoInfer<LogicFn<T, boolean>> = () => true,
  message?: string | NoInfer<LogicFn<T, string>>,
  emptyPredicate: (value: T) => boolean = (value) => value == null || value === '',
): void {
  metadata(path, REQUIRED, requiredPredicate);
  validate(path, (arg) => {
    if (requiredPredicate(arg) && emptyPredicate(arg.value())) {
      message = typeof message === 'function' ? message(arg) : message;
      const result = {kind: 'required'} as FormError;
      if (message) {
        result.message = message;
      }
      return result;
    }
    return undefined;
  });
}

/**
 * Adds metadata to a field.
 *
 * @param path The path of the field to receive the metadata.
 * @param key The metadata key
 * @param data A function that returns the metadata value. The function receives the following arguments:
 * 1) The value of the field to receive the metadata.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 */
export function metadata<T, M>(
  path: FormPath<T>,
  key: MetadataKey<M>,
  data: NoInfer<LogicFn<T, M>>,
): void {
  assertPathIsCurrent(path);

  const pathImpl = FormPathImpl.extractFromPath(path);
  pathImpl.logic.getMetadata(key).push(pathImpl.maybeWrapWithPredicate(data, key.defaultValue));
}

/**
 * Adds logic to a from to conditionally add a validation error to a field.
 * The added FormError will be of `kind: 'custom'`
 *
 * @param path The path of the field that may have an error.
 * @param predicate An optional prdicate function that returns `true` if the field should have an
 * error. The predicate recevies the following arguments:
 * 1) The value of the field that may have an error.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 * @param message An optional user-facing message to add to the error, or a function to generate the
 * user-facing message. The function recevies the following arguments
 * 1) The value of the field that has an error.
 * 2..n) The `Form` nodes for each of the roots available on the path.
 */
export function error<T>(
  path: FormPath<T>,
  predicate: NoInfer<LogicFn<T, boolean>>,
  message?: string | NoInfer<LogicFn<T, string>>,
): void {
  assertPathIsCurrent(path);

  if (typeof message === 'function') {
    validate(path, (arg) => {
      return predicate(arg) ? {kind: 'custom', message: message(arg)} : undefined;
    });
  } else {
    const err = message === undefined ? {kind: 'custom'} : {kind: 'custom', message};
    validate(path, (arg) => {
      return predicate(arg) ? err : undefined;
    });
  }
}
