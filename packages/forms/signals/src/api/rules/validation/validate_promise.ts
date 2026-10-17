/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebounceTimer, ResourceSnapshot, resource, Signal} from '@angular/core';
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
 * Options that configure promise-based async validation for a field.
 *
 * @template TValue The type of value stored in the field being validated.
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array).
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @see [Custom validation rules](guide/forms/signals/validation#using-validatepromise)
 *
 * @category validation
 * @publicApi 22.2
 */
export interface PromiseValidatorOptions<TValue, TPathKind extends PathKind = PathKind.Root> {
  /**
   * Duration in milliseconds to wait before triggering the async operation, or a function that
   * receives the current and previous value and returns a promise that resolves when the update
   * should proceed.
   */
  readonly debounce?: DebounceTimer<TValue | undefined>;

  /**
   * A function that receives the field context and returns true if the async validation should be run.
   */
  readonly when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;

  /**
   * A callback to handle errors that occur during async validation.
   * Receives the error and the field context, returns a list of validation errors.
   */
  readonly onError?: (error: unknown, ctx: FieldContext<TValue, TPathKind>) => TreeValidationResult;
}

/**
 * Adds async validation to the field corresponding to the given path using a promise-returning validator function.
 *
 * @param path A path indicating the field to bind the async validation logic to.
 * @param logic A validator function that returns the validation errors asynchronously.
 * @param opts Optional, configuration for the async validation behavior:
 * - `debounce`: Configures the debounce behavior for the async validation.
 * - `when`: A condition that determines whether the async validation should run.
 * - `onError`: A callback to handle errors that occur during async validation.
 * @template TValue The type of value stored in the field being validated.
 * @template TPathKind The kind of path being validated (a root path, child path, or item of an array).
 *
 * @see [Signal Form Async Validation](guide/forms/signals/validation#async-validation)
 * @see [Custom validation rules](guide/forms/signals/validation#using-validatepromise)
 * @category validation
 * @publicApi 22.2
 */
export function validatePromise<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<FieldValidatorPromise<TValue>>,
  opts?: PromiseValidatorOptions<TValue, TPathKind>,
): void {
  const options = opts ?? {};
  type Params = {value: TValue};
  const debounceOption = options.debounce;
  const debounce =
    typeof debounceOption === 'function'
      ? (params: Params | undefined, lastValue: ResourceSnapshot<Params | undefined>) => {
          const mappedLastValue =
            lastValue.status === 'error'
              ? lastValue
              : ({
                  status: lastValue.status,
                  value: lastValue.value?.value,
                } as ResourceSnapshot<TValue | undefined>);

          return (debounceOption as Function)(params?.value, mappedLastValue);
        }
      : debounceOption;

  validateAsync(path, {
    params: (ctx: FieldContext<TValue, TPathKind>): Params => ({value: ctx.value()}),
    debounce: debounce as DebounceTimer<Params | undefined>,
    factory: (paramsSignal: Signal<Params | undefined>) =>
      resource({
        params: () => paramsSignal(),
        loader: async ({params}: {params: Params | undefined}) => {
          if (!params) return undefined;
          return (await logic(params.value)) as TreeValidationResult | undefined;
        },
      }),
    onSuccess: (result: TreeValidationResult | undefined) => result,
    onError:
      options.onError ??
      ((error: unknown) => ({
        kind: 'asyncError',
        message: String(error ?? 'Async validation failed'),
      })),
    when: options.when,
  });
}
