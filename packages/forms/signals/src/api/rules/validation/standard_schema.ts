/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {resource, ɵisPromise} from '@angular/core';
import type {StandardSchemaV1} from '@standard-schema/spec';
import {addDefaultField} from '../../../field/validation';
import type {LogicFn, ReadonlyFieldTree, SchemaPath, SchemaPathTree} from '../../types';
import {createMetadataKey, metadata} from '../metadata';
import {validateAsync} from './validate_async';
import {validateTree} from './validate_tree';
import {
  BaseNgValidationError,
  type ValidationErrorOptions,
  type WithFieldTree,
  type WithOptionalFieldTree,
  type WithoutFieldTree,
} from './validation_errors';

/**
 * Utility type that removes a string index key when its value is `unknown`,
 * i.e. `{[key: string]: unknown}`. It allows specific string keys to pass through, even if their
 * value is `unknown`, e.g. `{key: unknown}`.
 *
 * @experimental 21.0.0
 */
export type RemoveStringIndexUnknownKey<K, V> = string extends K
  ? unknown extends V
    ? never
    : K
  : K;

/**
 * Utility type that recursively ignores unknown string index properties on the given object.
 * We use this on the `TSchema` type in `validateStandardSchema` in order to accommodate Zod's
 * `looseObject` which includes `{[key: string]: unknown}` as part of the type.
 *
 * @experimental 21.0.0
 */
export type IgnoreUnknownProperties<T> =
  T extends Record<PropertyKey, unknown>
    ? {
        [K in keyof T as RemoveStringIndexUnknownKey<K, T[K]>]: IgnoreUnknownProperties<T[K]>;
      }
    : T;

/**
 * Validates a field using a `StandardSchemaV1` compatible validator (e.g. a Zod validator).
 *
 * See https://github.com/standard-schema/standard-schema for more about standard schema.
 *
 * @param path The `FieldPath` to the field to validate.
 * @param schema The standard schema compatible validator to use for validation, or a LogicFn that returns the schema.
 * @template TSchema The type validated by the schema. This may be either the full `TValue` type,
 *   or a partial of it.
 * @template TValue The type of value stored in the field being validated.
 *
 * @see [Signal Form Schema Validation](guide/forms/signals/validation#integration-with-schema-validation-libraries)
 * @category validation
 * @experimental 21.0.0
 */
export function validateStandardSchema<TSchema, TModel extends IgnoreUnknownProperties<TSchema>>(
  path: SchemaPath<TModel> & SchemaPathTree<TModel>,
  schema: StandardSchemaV1<TSchema> | LogicFn<TModel, StandardSchemaV1<unknown> | undefined>,
) {
  // We create both a sync and async validator because the standard schema validator can return
  // either a sync result or a Promise, and we need to handle both cases. The sync validator
  // handles the sync result, and the async validator handles the Promise.
  // We memoize the result of the validation function here, so that it is only run once for both
  // validators, it can then be passed through both sync & async validation.
  type Result = StandardSchemaV1.Result<TSchema> | Promise<StandardSchemaV1.Result<TSchema>>;
  const VALIDATOR_MEMO = metadata(
    path as SchemaPath<TModel>,
    createMetadataKey<Result | undefined>(),
    (ctx) => {
      const resolvedSchema = typeof schema === 'function' ? schema(ctx) : schema;
      return resolvedSchema
        ? (resolvedSchema['~standard'].validate(ctx.value()) as Result)
        : undefined;
    },
  );

  validateTree<TModel>(path, ({state, fieldTreeOf}) => {
    // Skip sync validation if the result is a Promise or undefined.
    const result = state.metadata(VALIDATOR_MEMO)!();
    if (!result || ɵisPromise(result)) {
      return [];
    }
    return (
      result?.issues?.map((issue) =>
        standardIssueToFormTreeError(fieldTreeOf<TModel>(path), issue),
      ) ?? []
    );
  });

  validateAsync<
    TModel,
    Promise<StandardSchemaV1.Result<TSchema>> | undefined,
    readonly StandardSchemaV1.Issue[]
  >(path, {
    params: ({state}) => {
      // Skip async validation if the result is *not* a Promise.
      const result = state.metadata(VALIDATOR_MEMO)!();
      return result && ɵisPromise(result) ? result : undefined;
    },
    factory: (params) => {
      return resource({
        params,
        loader: async ({params}) => (await params)?.issues ?? [],
      });
    },
    onSuccess: (issues, {fieldTreeOf}) => {
      return issues.map((issue) => standardIssueToFormTreeError(fieldTreeOf<TModel>(path), issue));
    },
    onError: () => {},
  });
}

/**
 * Create a standard schema issue error associated with the target field
 * @param issue The standard schema issue
 * @param options The validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function standardSchemaError(
  issue: StandardSchemaV1.Issue,
  options: WithFieldTree<ValidationErrorOptions>,
): StandardSchemaValidationError;
/**
 * Create a standard schema issue error
 * @param issue The standard schema issue
 * @param options The optional validation error options
 *
 * @category validation
 * @experimental 21.0.0
 */
export function standardSchemaError(
  issue: StandardSchemaV1.Issue,
  options?: ValidationErrorOptions,
): WithoutFieldTree<StandardSchemaValidationError>;
export function standardSchemaError(
  issue: StandardSchemaV1.Issue,
  options?: ValidationErrorOptions,
): WithOptionalFieldTree<StandardSchemaValidationError> {
  return new StandardSchemaValidationError(issue, options);
}

/**
 * Converts a `StandardSchemaV1.Issue` to a `FormTreeError`.
 *
 * @param fieldTree The root field to which the issue's path is relative.
 * @param issue The `StandardSchemaV1.Issue` to convert.
 * @returns A `ValidationError` representing the issue.
 */
function standardIssueToFormTreeError(
  fieldTree: ReadonlyFieldTree<unknown>,
  issue: StandardSchemaV1.Issue,
): StandardSchemaValidationError {
  let target = fieldTree as ReadonlyFieldTree<Record<PropertyKey, unknown>>;
  for (const pathPart of issue.path ?? []) {
    const pathKey = typeof pathPart === 'object' ? pathPart.key : pathPart;
    target = target[pathKey] as ReadonlyFieldTree<Record<PropertyKey, unknown>>;
  }
  return addDefaultField(standardSchemaError(issue, {message: issue.message}), target);
}

/**
 * An error used to indicate an issue validating against a standard schema.
 *
 * @category validation
 * @experimental 21.0.0
 */
export class StandardSchemaValidationError extends BaseNgValidationError {
  override readonly kind = 'standardSchema';

  constructor(
    readonly issue: StandardSchemaV1.Issue,
    options?: ValidationErrorOptions,
  ) {
    super(options);
  }
}
