/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {httpResource, HttpResourceOptions, HttpResourceRequest} from '@angular/common/http';
import {computed, ResourceRef, Signal} from '@angular/core';
import {FieldNode} from '../field/node';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import {setMetadata} from './logic';
import {MetadataKey} from './metadata';
import {FieldContext, FieldPath, PathKind, TreeValidationResult, ValidationResult} from './types';
import {addDefaultField} from './validation_errors';

/**
 * A function that takes the result of an async operation and the current field context, and maps it
 * to a list of validation errors.
 *
 * @param result The result of the async operation.
 * @param ctx The context for the field the validator is attached to.
 * @return A validation error, or list of validation errors to report based on the result of the async operation.
 *   The returned errors can optionally specify a field that the error should be targeted to.
 *   A targeted error will show up as an error on its target field rather than the field being validated.
 *   If a field is not given, the error is assumed to apply to the field being validated.
 * @template TValue The type of value stored in the field being validated.
 * @template TResult The type of result returned by the async operation
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 */
export type MapToErrorsFn<TValue, TResult, TPathKind extends PathKind = PathKind.Root> = (
  result: TResult,
  ctx: FieldContext<TValue, TPathKind>,
) => ValidationResult | TreeValidationResult;

/**
 * Options that indicate how to create a resource for async validation for a field,
 * and map its result to validation errors.
 *
 * @template TValue The type of value stored in the field being validated.
 * @template TParams The type of parameters to the resource.
 * @template TResult The type of result returned by the resource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 */
export interface AsyncValidatorOptions<
  TValue,
  TParams,
  TResult,
  TPathKind extends PathKind = PathKind.Root,
> {
  /**
   * A function that receives the field context and returns the params for the resource.
   *
   * @param ctx The field context for the field being validated.
   * @returns The params for the resource.
   */
  readonly params: (ctx: FieldContext<TValue, TPathKind>) => TParams;

  /**
   * A function that receives the resource params and returns a resource of the given params.
   * The given params should be used as is to create the resource.
   * The forms system will report the params as `undefined` when this validation doesn't need to be run.
   *
   * @param params The params to use for constructing the resource
   * @returns A reference to the constructed resource.
   */
  readonly factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult | undefined>;

  /**
   * A function that takes the resource result, and the current field context and maps it to a list
   * of validation errors.
   *
   * @param result The resource result.
   * @param ctx The context for the field the validator is attached to.
   * @return A validation error, or list of validation errors to report based on the resource result.
   *   The returned errors can optionally specify a field that the error should be targeted to.
   *   A targeted error will show up as an error on its target field rather than the field being validated.
   *   If a field is not given, the error is assumed to apply to the field being validated.
   */
  readonly errors: MapToErrorsFn<TValue, TResult, TPathKind>;
}

/**
 * Options that indicate how to create an httpResource for async validation for a field,
 * and map its result to validation errors.
 *
 * @template TValue The type of value stored in the field being validated.
 * @template TResult The type of result returned by the httpResource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
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
  readonly errors: MapToErrorsFn<TValue, TResult, TPathKind>;

  /**
   * The options to use when creating the httpResource.
   */
  readonly options?: HttpResourceOptions<TResult, unknown>;
}

/**
 * Adds async validation to the field corresponding to the given path based on a resource.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param opts The async validation options.
 * @template TValue The type of value stored in the field being validated.
 * @template TParams The type of parameters to the resource.
 * @template TResult The type of result returned by the resource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 */
export function validateAsync<TValue, TParams, TResult, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: AsyncValidatorOptions<TValue, TParams, TResult, TPathKind>,
): void {
  assertPathIsCurrent(path);
  const RESOURCE = MetadataKey.create<ResourceRef<TResult>>();
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  setMetadata(path, RESOURCE, (ctx) => {
    const params = computed(() => {
      const node = ctx.stateOf(path) as FieldNode;
      if (node.validationState.shouldSkipValidation() || !node.syncValid()) {
        return undefined;
      }
      return opts.params(ctx);
    });
    return opts.factory(params);
  });

  pathNode.logic.addAsyncErrorRule((ctx) => {
    const res = ctx.state.metadata(RESOURCE)!;
    switch (res.status()) {
      case 'idle':
        return undefined;
      case 'loading':
      case 'reloading':
        return 'pending';
      case 'resolved':
      case 'local':
        if (!res.hasValue()) {
          return undefined;
        }
        const errors = opts.errors(res.value()!, ctx as FieldContext<TValue, TPathKind>);
        return addDefaultField(errors, ctx.field);
      case 'error':
        // TODO: Design error handling for async validation. For now, just throw the error.
        throw res.error();
    }
  });
}

/**
 * Adds async validation to the field corresponding to the given path based on an httpResource.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param opts The http validation options.
 * @template TValue The type of value stored in the field being validated.
 * @template TResult The type of result returned by the httpResource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 */
export function validateHttp<TValue, TResult = unknown, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: HttpValidatorOptions<TValue, TResult, TPathKind>,
) {
  validateAsync(path, {
    params: opts.request,
    factory: (request: Signal<any>) => httpResource(request, opts.options),
    errors: opts.errors,
  });
}
