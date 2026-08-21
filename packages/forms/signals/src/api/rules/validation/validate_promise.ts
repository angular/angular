/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebounceTimer, resource, Signal} from '@angular/core';
import {
  FieldContext,
  FieldValidatorPromise,
  LogicFn,
  PathKind,
  SchemaPath,
  SchemaPathRules,
  TreeValidationResult,
} from '../../types';
import {validateAsync} from './validate_async';

/**
 * Adds async validation to the field corresponding to the given path using a promise-returning validator function.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param logic A validator function that returns the validation errors asynchronously.
 * @param config Optional, configuration for the async validation behavior:
 * - `debounce`: Configures the debounce behavior for the async validation.
 * - `when`: A condition that determines whether the async validation should run.
 * - `onError`: A callback to handle errors that occur during async validation.
 * @template TValue The type of value stored in the field being validated.
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array).
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @see [Custom validation rules](guide/forms/signals/validation#using-validatepromise)
 * @category validation
 * @publicApi 22.0
 */
export function validatePromise<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<FieldValidatorPromise<TValue, TPathKind>>,
  config?: {
    debounce?: DebounceTimer<FieldContext<TValue, TPathKind> | undefined>;
    when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
    onError?: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;
  },
): void {
  const configOpts = config ?? {};
  const debounce =
    typeof configOpts.debounce === 'function'
      ? (
          value: {ctx: FieldContext<TValue, TPathKind>; value: TValue} | undefined,
          lastValue: unknown,
        ) => (configOpts.debounce as Function)(value?.ctx, lastValue)
      : configOpts.debounce;

  validateAsync(path, {
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
          return (await logic(params.ctx)) as TreeValidationResult | undefined;
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
  });
}
