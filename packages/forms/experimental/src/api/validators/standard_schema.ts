/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, resource, ɵisPromise} from '@angular/core';
import type {StandardSchemaV1} from '@standard-schema/spec';
import {validateAsync} from '../async';
import {property, validateTree} from '../logic';
import {Field, FieldPath} from '../types';
import {StandardSchemaValidationError, ValidationError, WithField} from '../validation_errors';

/**
 * Validates a field using a `StandardSchemaV1` compatible validator (e.g. a zod validator).
 *
 * See https://github.com/standard-schema/standard-schema for more about standard schema.
 *
 * @param path The `FieldPath` to the field to validate.
 * @param schema The standard schema compatible validator to use for validation.
 * @template TValue The type of value stored in the field being validated.
 */
export function validateStandardSchema<TValue>(
  path: FieldPath<TValue>,
  schema: NoInfer<StandardSchemaV1<TValue>>,
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
export function standardIssueToFormTreeError(
  field: Field<unknown>,
  issue: StandardSchemaV1.Issue,
): WithField<StandardSchemaValidationError> {
  let target = field as Field<Record<PropertyKey, unknown>>;
  for (const pathPart of issue.path ?? []) {
    const pathKey = typeof pathPart === 'object' ? pathPart.key : pathPart;
    target = target[pathKey] as Field<Record<PropertyKey, unknown>>;
  }
  return ValidationError.standardSchema(issue, '', target);
}
