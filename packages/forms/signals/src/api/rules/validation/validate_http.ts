/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {httpResource, HttpResourceOptions, HttpResourceRequest} from '@angular/common/http';
import {Signal} from '@angular/core';
import {
  FieldContext,
  SchemaPath,
  PathKind,
  TreeValidationResult,
  SchemaPathRules,
} from '../../types';
import {MapToErrorsFn, validateAsync} from './validate_async';

/**
 * Options that indicate how to create an httpResource for async validation for a field,
 * and map its result to validation errors.
 *
 * @template TValue The type of value stored in the field being validated.
 * @template TResult The type of result returned by the httpResource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 *
 * @category validation
 * @experimental 21.0.0
 */
export interface HttpValidatorOptions<TValue, TResult, TPathKind extends PathKind = PathKind.Root> {
  /**
   * A function that receives the field context and returns the url or request for the httpResource.
   * If given a URL, the underlying httpResource will perform an HTTP GET on it.
   *
   * @param ctx The field context for the field being validated.
   * @returns The URL or request for creating the httpResource.
   */
  readonly request:
    | ((ctx: FieldContext<TValue, TPathKind>) => string | undefined)
    | ((ctx: FieldContext<TValue, TPathKind>) => HttpResourceRequest | undefined);

  /**
   * A function that takes the httpResource result, and the current field context and maps it to a
   * list of validation errors.
   *
   * @param result The httpResource result.
   * @param ctx The context for the field the validator is attached to.
   * @return A validation error, or list of validation errors to report based on the httpResource result.
   *   The returned errors can optionally specify a field that the error should be targeted to.
   *   A targeted error will show up as an error on its target field rather than the field being validated.
   *   If a field is not given, the error is assumed to apply to the field being validated.
   */
  readonly onSuccess: MapToErrorsFn<TValue, TResult, TPathKind>;

  /**
   * A function to handle errors thrown by httpResource (HTTP errors, network errors, etc.).
   * Receives the error and the field context, returns a list of validation errors.
   */
  readonly onError: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;
  /**
   * The options to use when creating the httpResource.
   */
  readonly options?: HttpResourceOptions<TResult, unknown>;
}

/**
 * Adds async validation to the field corresponding to the given path based on an httpResource.
 * Async validation for a field only runs once all synchronous validation is passing.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param opts The http validation options.
 * @template TValue The type of value stored in the field being validated.
 * @template TResult The type of result returned by the httpResource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @category validation
 * @experimental 21.0.0
 */
export function validateHttp<TValue, TResult = unknown, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: HttpValidatorOptions<TValue, TResult, TPathKind>,
) {
  validateAsync(path, {
    params: opts.request,
    factory: (request: Signal<any>) => httpResource(request, opts.options),
    onSuccess: opts.onSuccess,
    onError: opts.onError,
  });
}
