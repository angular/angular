/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DebounceTimer,
  Resource,
  resource,
  Signal,
  computed,
  debounced,
  ɵchain,
} from '@angular/core';
import {FieldNode} from '../../../field/node';
import {addDefaultField} from '../../../field/validation';
import {FieldPathNode} from '../../../schema/path_node';
import {assertPathIsCurrent} from '../../../schema/schema';
import {
  FieldContext,
  FieldValidatorAsync,
  LogicFn,
  PathKind,
  SchemaPath,
  SchemaPathRules,
  TreeValidationResult,
} from '../../types';
import {IS_ASYNC_VALIDATION_RESOURCE, createManagedMetadataKey, metadata} from '../metadata';

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
 * @publicApi 22.0
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
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @see [Custom async validation](guide/forms/signals/async-operations#custom-async-validation-with-validateasync)
 *
 * @category validation
 * @publicApi 22.0
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
   * Duration in milliseconds to wait before triggering the async operation, or a function that
   * returns a promise that resolves when the update should proceed.
   */
  readonly debounce?: DebounceTimer<TParams | undefined>;

  /**
   * A function that receives the resource params and returns a resource of the given params.
   * The given params should be used as is to create the resource.
   * The forms system will report the params as `undefined` when this validation doesn't need to be run.
   *
   * @param params The params to use for constructing the resource
   * @returns A reference to the constructed resource.
   */
  readonly factory: (params: Signal<TParams | undefined>) => Resource<TResult | undefined>;
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
  /**
   * A function that receives the field context and returns true if the async validation should be run.
   */
  readonly when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
}

/**
 * Adds async validation to the field corresponding to the given path based on a resource.
 * Async validation for a field only runs once all synchronous validation is passing.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param opts The async validation options.
 * @template TValue The type of value stored in the field being validated.
 * @template TParams The type of parameters to the resource.
 * @template TResult The type of result returned by the resource.
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array).
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @see [Custom async validation](guide/forms/signals/async-operations#custom-async-validation-with-validateasync)
 * @see [Custom validation rules](guide/forms/signals/validation#using-validateasync)
 * @category validation
 * @publicApi 22.0
 */
export function validateAsync<TValue, TParams, TResult, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: AsyncValidatorOptions<TValue, TParams, TResult, TPathKind>,
): void;

/**
 * Adds async validation to the field corresponding to the given path using a simple validator function.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param logic A validator function that returns the validation errors asynchronously.
 * @param config Optional, allows providing any of the following options for the async validation over the simple validator function:
 *  - `debounce`: Duration in milliseconds to wait before triggering the async operation, or a function that
 *    returns a promise that resolves when the update should proceed.
 *  - `when`: A function that receives the field context and returns true if the async validation should be run.
 *  - `onError`: A function to handle errors thrown by the async validator (HTTP errors, network errors, etc.).
 *    Receives the error and the field context, returns a list of validation errors.
 * @template TValue The type of value stored in the field being validated.
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array).
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @see [Custom async validation](guide/forms/signals/async-operations#custom-async-validation-with-validateasync)
 * @see [Custom validation rules](guide/forms/signals/validation#using-validateasync)
 * @category validation
 * @publicApi 22.0
 */
export function validateAsync<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<FieldValidatorAsync<TValue, TPathKind>>,
  config?: {
    debounce?: DebounceTimer<FieldContext<TValue, TPathKind> | undefined>;
    when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
    onError?: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;
  },
): void;

/**
 * Internal implementation for registering async validation on a field via resource options
 * or a simple validator function.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param optsOrLogic Either an object with full resource validator options or a simple async validator function.
 * @param config Optional, allows providing any of the following options for the async validation over the simple validator function:
 *  - `debounce`: Duration in milliseconds to wait before triggering the async operation, or a function that
 *    returns a promise that resolves when the update should proceed.
 *  - `when`: A function that receives the field context and returns true if the async validation should be run.
 *  - `onError`: A function to handle errors thrown by the async validator (HTTP errors, network errors, etc.).
 *    Receives the error and the field context, returns a list of validation errors.
 * @template TValue The type of value stored in the field being validated.
 * @template TParams The type of parameters to the resource.
 * @template TResult The type of result returned by the resource.
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array).
 *
 * @internal
 */
export function validateAsync<
  TValue,
  TParams = unknown,
  TResult = unknown,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  optsOrLogic:
    | AsyncValidatorOptions<TValue, TParams, TResult, TPathKind>
    | FieldValidatorAsync<TValue, TPathKind>,
  config?: {
    debounce?: DebounceTimer<FieldContext<TValue, TPathKind> | undefined>;
    when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
    onError?: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;
  },
): void {
  assertPathIsCurrent(path);

  if (typeof optsOrLogic === 'function') {
    const logic = optsOrLogic;
    const configOpts = config ?? {};

    // Check if debounce option is a function, wrap it to pass the field context and last value.
    const debounce =
      typeof configOpts.debounce === 'function'
        ? (
            value: {ctx: FieldContext<TValue, TPathKind>; value: TValue} | undefined,
            lastValue: unknown,
          ) => (configOpts.debounce as Function)(value?.ctx, lastValue)
        : configOpts.debounce;

    // Map the simple validator function to the full AsyncValidatorOptions structure.
    // Reading `ctx.value()` inside `params` ensures signal dependencies are tracked
    // so the resource loader re-runs whenever the field value changes.
    const mappedOpts: AsyncValidatorOptions<
      TValue,
      {ctx: FieldContext<TValue, TPathKind>; value: TValue} | undefined,
      TreeValidationResult | undefined,
      TPathKind
    > = {
      params: (ctx: FieldContext<TValue, TPathKind>) => ({
        ctx,
        value: ctx.value(),
      }),
      debounce: debounce as DebounceTimer<
        {ctx: FieldContext<TValue, TPathKind>; value: TValue} | undefined
      >,
      factory: (
        paramsSignal: Signal<{ctx: FieldContext<TValue, TPathKind>; value: TValue} | undefined>,
      ) =>
        resource({
          params: () => paramsSignal(),
          loader: async ({
            params,
          }: {
            params: {ctx: FieldContext<TValue, TPathKind>; value: TValue} | undefined;
          }) => {
            if (!params) return undefined;
            const res = await logic(params.ctx);
            return res as TreeValidationResult | undefined;
          },
        }),
      onSuccess: (result: TreeValidationResult | undefined) => result,
      onError:
        configOpts.onError ??
        ((error: unknown) => ({
          kind: 'asyncError',
          message: String(error ?? 'Async validation failed'),
        })),
      when: configOpts.when,
    };

    registerAsyncResourceValidator(path, mappedOpts);
    return;
  }

  registerAsyncResourceValidator(path, optsOrLogic);
}

/**
 * Registers an async resource validator for the given path and options.
 *
 * @template TValue The type of value stored in the field being validated.
 * @template TParams The type of parameters to the resource.
 * @template TResult The type of result returned by the resource
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array)
 * @param path
 * @param opts
 */
function registerAsyncResourceValidator<
  TValue,
  TParams,
  TResult,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  opts: AsyncValidatorOptions<TValue, TParams, TResult, TPathKind>,
): void {
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  const RESOURCE = createManagedMetadataKey<ReturnType<typeof opts.factory>, TParams | undefined>(
    (_state, params) => {
      if (opts.debounce !== undefined) {
        const debouncedResource = debounced(() => params(), opts.debounce);
        const wrappedParams = computed(() => ɵchain(debouncedResource));
        return opts.factory(wrappedParams);
      }
      return opts.factory(params);
    },
  );
  RESOURCE[IS_ASYNC_VALIDATION_RESOURCE] = true;

  metadata(path, RESOURCE, (ctx) => {
    const node = ctx.stateOf(path) as FieldNode;
    const validationState = node.validationState;
    if (validationState.shouldSkipValidation() || !validationState.syncValid()) {
      return undefined;
    }
    if (opts.when && !opts.when(ctx)) {
      return undefined;
    }
    return opts.params(ctx);
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
