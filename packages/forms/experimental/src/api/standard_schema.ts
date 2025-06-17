import {computed, resource} from '@angular/core';
import {validateAsync} from './async';
import {define} from './data';
import {validateTree} from './logic';
import {StandardSchemaV1} from './standard_schema_types';
import {Field, FieldPath} from './types';

/**
 * Validates a field using a `StandardSchemaV1` compatible validator (e.g. a zod validator).
 *
 * @param path The `FieldPath` to the field to validate.
 * @param schema The standard schema copatible validator to use for validation.
 * @template T The type of the field being validated.
 */
export function validateStandardSchema<T>(
  path: FieldPath<T>,
  schema: NoInfer<StandardSchemaV1<T>>,
) {
  // We create both a sync and async validator because the standard schema validator can return
  // either a sync result or a Promise, and we need to handle both cases. The sync validator
  // handles the sync result, and the async validator handles the Promise.
  // We memoize the result of the validation function here, so that it is only run once for both
  // validators, it can then be passed through both sync & async validation.
  const schemaResult = define(path, ({value}) => {
    return computed(() => schema['~standard'].validate(value()));
  });

  validateTree(path, ({state, fieldOf}) => {
    // Skip sync validation if the result is a Promise.
    const result = state.data(schemaResult)!();
    if (isPromise(result)) {
      return [];
    }
    return result.issues?.map((issue) => standardIssueToFormTreeError(fieldOf(path), issue)) ?? [];
  });

  validateAsync(path, {
    params: ({state}) => {
      // Skip async validation if the result is *not* a Promise.
      const result = state.data(schemaResult)!();
      return isPromise(result) ? result : undefined;
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
 * @returns A `FormTreeError` representing the issue.
 */
export function standardIssueToFormTreeError(field: Field<unknown>, issue: StandardSchemaV1.Issue) {
  let target = field as Field<Record<PropertyKey, unknown>>;
  for (const pathPart of issue.path ?? []) {
    const pathKey = typeof pathPart === 'object' ? pathPart.key : pathPart;
    target = target[pathKey] as Field<Record<PropertyKey, unknown>>;
  }
  return {
    kind: '~standard',
    field: target,
    issue,
  };
}

/**
 * Checks if a value is a Promise.
 * Use this function rather than `instanceof Promise` because the value could be a thenable rather
 * than a proper `Promise` (e.g. from nodejs)
 *
 * @param value The value to check.
 * @returns `true` if the value is a Promise, `false` otherwise.
 */
export function isPromise(value: Object): value is Promise<unknown> {
  return typeof (value as Promise<unknown>).then === 'function';
}
