import {computed, resource} from '@angular/core';
import {validateAsync} from './async';
import {define} from './data';
import {validateTree} from './logic';
import {StandardSchemaV1} from './standard_schema_types';
import {Field, FieldPath} from './types';

export function validateStandardSchema<T>(
  path: FieldPath<T>,
  schema: NoInfer<StandardSchemaV1<T>>,
) {
  // Memoize the result so it can be passed through both sync & async validation.
  const schemaResult = define(path, ({value}) => {
    return computed(() => schema['~standard'].validate(value()));
  });

  validateTree(path, ({state, fieldOf}) => {
    // Skip sync validation if the result is a Promise.
    const result = state.data(schemaResult)!();
    if (isPromise(result)) {
      return [];
    }
    return (
      result.issues?.map((issue) => standardIssueToFormTreeError(false, fieldOf(path), issue)) ?? []
    );
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
      return issues.map((issue) => standardIssueToFormTreeError(true, fieldOf(path), issue));
    },
  });
}

export function standardIssueToFormTreeError(
  async: boolean,
  field: Field<unknown>,
  issue: StandardSchemaV1.Issue,
) {
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

export function isPromise(value: Object): value is Promise<unknown> {
  return (value as Promise<unknown>).then !== undefined;
}
