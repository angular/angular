/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceRef, Signal, WritableSignal, linkedSignal} from '@angular/core';
import {FieldNode} from '../../../field/node';
import {PENDING_VALIDATION_PARAMS, addDefaultField} from '../../../field/validation';
import {FieldPathNode} from '../../../schema/path_node';
import {assertPathIsCurrent} from '../../../schema/schema';
import {
  FieldContext,
  PathKind,
  SchemaPath,
  SchemaPathRules,
  TreeValidationResult,
} from '../../types';
import {createManagedMetadataKey, metadata} from '../metadata';

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
 *
 * @experimental 21.0.0
 */
export type MapToErrorsFn<TValue, TResult, TPathKind extends PathKind = PathKind.Root> = (
  result: TResult,
  ctx: FieldContext<TValue, TPathKind>,
) => TreeValidationResult;

/**
 * Options that indicate how to create a resource for async validation for a field,
 * and map its result to validation errors.
 *
 * @template TValue The type of value stored in the field being validated.
 * @template TParams The type of parameters to the resource.
 * @template TResult The type of result returned by the resource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @category validation
 * @experimental 21.0.0
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
   * A function to handle errors thrown by httpResource (HTTP errors, network errors, etc.).
   * Receives the error and the field context, returns a list of validation errors.
   */
  readonly onError: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;
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
  readonly onSuccess: MapToErrorsFn<TValue, TResult, TPathKind>;
}

/**
 * Adds async validation to the field corresponding to the given path based on a resource.
 * Async validation for a field only runs once all synchronous validation is passing.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param opts The async validation options.
 * @template TValue The type of value stored in the field being validated.
 * @template TParams The type of parameters to the resource.
 * @template TResult The type of result returned by the resource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @category validation
 * @experimental 21.0.0
 */
export function validateAsync<TValue, TParams, TResult, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: AsyncValidatorOptions<TValue, TParams, TResult, TPathKind>,
): void {
  assertPathIsCurrent(path);
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  // Wrap the parameters in a linked signal so they can be overridden with `undefined` to cancel the
  // validation on submission.
  const PARAMS = createManagedMetadataKey<WritableSignal<TParams | undefined>, TParams>(
    linkedSignal,
  );
  metadata(path, PARAMS, (ctx) => opts.params(ctx));
  // Add the linked signal to the list of all pending validations.
  metadata(path, PENDING_VALIDATION_PARAMS, (ctx) => ctx.state.metadata(PARAMS));

  const RESOURCE = createManagedMetadataKey<ReturnType<typeof opts.factory>, TParams | undefined>(
    opts.factory,
  );
  metadata(path, RESOURCE, (ctx) => {
    const node = ctx.stateOf(path) as FieldNode;
    const validationState = node.validationState;
    if (validationState.shouldSkipValidation() || !validationState.syncValid()) {
      return undefined;
    }
    return ctx.state.metadata(PARAMS)!();
  });

  pathNode.builder.addAsyncErrorRule((ctx) => {
    const res = ctx.state.metadata(RESOURCE)!;
    let errors;
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
        errors = opts.onSuccess(res.value()!, ctx as FieldContext<TValue, TPathKind>);
        return addDefaultField(errors, ctx.fieldTree);
      case 'error':
        errors = opts.onError(res.error(), ctx as FieldContext<TValue, TPathKind>);
        return addDefaultField(errors, ctx.fieldTree);
    }
  });
}
