/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebounceTimer, Resource} from '@angular/core';
import {
  FieldContext,
  LogicFn,
  PathKind,
  SchemaPath,
  SchemaPathRules,
  TreeValidationResult,
} from '../../types';
import {registerAsyncValidation} from './async_validation';
import {MapToErrorsFn} from './validate_async';

/**
 * Options for validating a field with a resource created from a resource of request params.
 *
 * @template TValue The field value type.
 * @template TParams The request params type.
 * @template TResult The validation resource's result type.
 * @template TPathKind The kind of path being validated.
 * @see validateResource
 * @publicApi 22.3
 */
export interface ResourceValidatorOptions<
  TValue,
  TParams,
  TResult,
  TPathKind extends PathKind = PathKind.Root,
> {
  /** Receives the field context and returns request params. `undefined` skips validation. */
  readonly params: (ctx: FieldContext<TValue, TPathKind>) => TParams;

  /** A duration or custom timer delaying subsequent params changes. The initial value is immediate. */
  readonly debounce?: DebounceTimer<TParams | undefined>;

  /** Maps params or resource failures to validation errors for this field or targeted fields. */
  readonly onError: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;

  /** Maps a defined, completed resource result to validation errors. */
  readonly onSuccess: MapToErrorsFn<TValue, TResult, TPathKind>;

  /** Whether this validator should run, in addition to synchronous validation and field gating. */
  readonly when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;

  /**
   * Creates the validation resource once per field, in the field's injection context.
   *
   * The params resource exposes loading and error states explicitly. Its settled value is
   * `undefined` when validation should be skipped. Use `chain` in a core resource's params
   * callback, or `settledResourceValue` to obtain non-throwing params for another resource
   * implementation. The field stays pending while params or the validation resource are loading.
   *
   * Return a resource that reacts to the params resource. If it provides a `reload()` method,
   * `reloadValidation()` calls it to reload this validator.
   */
  readonly factory: (params: Resource<TParams | undefined>) => Resource<TResult | undefined>;
}

/**
 * Adds asynchronous validation using a resource factory.
 *
 * Validation runs once synchronous validation passes. The field stays pending while params or the
 * resource are loading. `onSuccess` maps results to validation errors, and `onError` handles failures.
 * Returning `undefined` from `params` skips validation.
 *
 * @param path The field to validate.
 * @param opts The params, resource factory, and validation callbacks.
 * @template TValue The field value type.
 * @template TParams The request params type.
 * @template TResult The validation resource's result type.
 * @template TPathKind The kind of path being validated.
 * @see validateAsyncLoader
 * @see [Async validation](guide/forms/signals/async-operations)
 * @category validation
 * @publicApi 22.3
 */
export function validateResource<
  TValue,
  TParams,
  TResult,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: ResourceValidatorOptions<TValue, TParams, TResult, TPathKind>,
): void {
  registerAsyncValidation(path, opts);
}
