/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {resource, ResourceLoader} from '@angular/core';
import {PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {ResourceValidatorOptions, validateResource} from './validate_resource';

/**
 * Options for asynchronous validation using a Promise-like resource loader.
 *
 * @template TValue The field value type.
 * @template TParams The request params type.
 * @template TResult The loader's result type.
 * @template TPathKind The kind of path being validated.
 * @see validateAsyncLoader
 * @publicApi 22.3
 */
export interface AsyncLoaderValidatorOptions<
  TValue,
  TParams,
  TResult,
  TPathKind extends PathKind = PathKind.Root,
> extends Omit<ResourceValidatorOptions<TValue, TParams, TResult, TPathKind>, 'factory'> {
  /**
   * Loads the validation result for defined, settled params. Receives core's `abortSignal` and
   * `previous.status`. The loader runs outside the reactive context; dependencies belong in `params`.
   * Observable or streaming sources should use `validateResource` instead.
   */
  readonly loader: ResourceLoader<TResult, TParams | undefined>;
}

/**
 * Adds asynchronous validation using a loader, without requiring a resource factory.
 *
 * Creates a core resource internally. Loading, request replacement, errors, and reloads follow
 * core resource semantics. Returning `undefined` from `params` skips the loader. Validation runs
 * only once synchronous validation passes, and remains pending during debounce and loading.
 *
 * @param path The field to validate.
 * @param opts The params, Promise-like loader, and validation callbacks.
 * @template TValue The field value type.
 * @template TParams The request params type.
 * @template TResult The loader's result type.
 * @template TPathKind The kind of path being validated.
 * @see validateResource
 * @see [Async validation](guide/forms/signals/async-operations)
 * @category validation
 * @publicApi 22.3
 */
export function validateAsyncLoader<
  TValue,
  TParams,
  TResult,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: AsyncLoaderValidatorOptions<TValue, TParams, TResult, TPathKind>,
): void {
  validateResource(path, {
    ...opts,
    factory: (params) =>
      resource<TResult, TParams | undefined>({
        params: ({chain}) => chain(params),
        loader: opts.loader,
      }),
  });
}
