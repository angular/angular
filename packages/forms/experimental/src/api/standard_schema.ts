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

  validateTree(path, ({data, resolve}) => {
    // Skip sync validation if the result is a Promise.
    const result = data(schemaResult)();
    if (isPromise(result)) {
      return [];
    }
    return (
      result.issues?.map((issue) => standardIssueToFormTreeError(false, resolve(path), issue)) ?? []
    );
  });

  validateAsync(path, {
    request: ({data}) => {
      // Skip async validation if the result is *not* a Promise.
      const result = data(schemaResult)();
      return isPromise(result) ? result : undefined;
    },
    factory: (request) => {
      return resource({
        request,
        loader: async ({request}) => (await request)?.issues ?? [],
      });
    },
    error: (issues, {resolve}) => {
      return issues.map((issue) => standardIssueToFormTreeError(true, resolve(path), issue));
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
    async, // TODO: remove; for testing only
    kind: '~standard',
    field: target,
    issue,
  };
}

export function isPromise(value: Object): value is Promise<unknown> {
  return (value as Promise<unknown>).then !== undefined;
}
