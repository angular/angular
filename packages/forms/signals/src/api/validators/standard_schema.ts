/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, resource, ɵisPromise} from '@angular/core';
import type {StandardSchemaV1} from '@standard-schema/spec';
import {addDefaultField} from '../../field/validation';
import {validateAsync} from '../async';
import {property, validateTree} from '../logic';
import {Field, FieldPath} from '../types';
import {standardSchemaError, StandardSchemaValidationError} from '../validation_errors';

/**
 * Utility type that removes a string index key when its value is `unknown`,
 * i.e. `{[key: string]: unknown}`. It allows specific string keys to pass through, even if their
 * value is `unknown`, e.g. `{key: unknown}`.
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
 * @param schema The standard schema compatible validator to use for validation.
 * @template TSchema The type validated by the schema. This may be either the full `TValue` type,
 *   or a partial of it.
 * @template TValue The type of value stored in the field being validated.
 */
export function validateStandardSchema<TSchema, TValue extends IgnoreUnknownProperties<TSchema>>(
  path: FieldPath<TValue>,
  schema: StandardSchemaV1<TSchema>,
) {
  // We create both a sync and async validator because the standard schema validator can return
  // either a sync result or a Promise, and we need to handle both cases. The sync validator
  // handles the sync result, and the async validator handles the Promise.
  // We memoize the result of the validation function here, so that it is only run once for both
  // validators, it can then be passed through both sync & async validation.
  const VALIDATOR_MEMO = property(path, ({value}) => {
    return computed(() => schema['~standard'].validate(value()));
  });
  validateTree(path, ({state, fieldOf}) => {
    // Skip sync validation if the result is a Promise.
    const result = state.property(VALIDATOR_MEMO)!();
    if (ɵisPromise(result)) {
      return [];
    }
    return result.issues?.map((issue) => standardIssueToFormTreeError(fieldOf(path), issue)) ?? [];
  });
  validateAsync(path, {
    params: ({state}) => {
      // Skip async validation if the result is *not* a Promise.
      const result = state.property(VALIDATOR_MEMO)!();
      return ɵisPromise(result) ? result : undefined;
    },
    factory: (params) => {
      return resource({
        params,
        loader: async ({params}) => (await params)?.issues ?? [],
      });
    },
    errors: (issues, {fieldOf}) => {
      return issues.map((issue) => standardIssueToFormTreeError(fieldOf(path), issue));
    },
  });
}

/**
 * Converts a `StandardSchemaV1.Issue` to a `FormTreeError`.
 *
 * @param field The root field to which the issue's path is relative.
 * @param issue The `StandardSchemaV1.Issue` to convert.
 * @returns A `ValidationError` representing the issue.
 */
function standardIssueToFormTreeError(
  field: Field<unknown>,
  issue: StandardSchemaV1.Issue,
): StandardSchemaValidationError {
  let target = field as Field<Record<PropertyKey, unknown>>;
  for (const pathPart of issue.path ?? []) {
    const pathKey = typeof pathPart === 'object' ? pathPart.key : pathPart;
    target = target[pathKey] as Field<Record<PropertyKey, unknown>>;
  }
  return addDefaultField(standardSchemaError(issue), target);
}
