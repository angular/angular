/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Resource, ResourceParamsStatus, type ChainOptions, type ChainResult} from './api';

export class ResourceDependencyError extends Error {
  readonly dependency: Resource<unknown>;

  constructor(dependency: Resource<unknown>, options?: ErrorOptions) {
    super('Dependency error', {...options, cause: dependency.error()});
    this.name = 'ResourceDependencyError';
    this.dependency = dependency;
  }
}

/**
 * Chains multiple resources together, returning their values if all are available, or a status
 * indicating why they are not.
 */
export function chain<T extends Resource<any>[]>(...args: [...T, ChainOptions]): ChainResult<T>;
export function chain<T extends Resource<any>[]>(...args: T): ChainResult<T>;
export function chain<T extends Resource<any>[]>(
  ...args: [...T, ChainOptions?] | T
): ChainResult<T> {
  let options: ChainOptions | undefined;
  let resources = args as T;

  if (args.length > 0) {
    const lastArg = args[args.length - 1];
    if (!isResource(lastArg)) {
      options = lastArg as ChainOptions;
      resources = args.slice(0, args.length - 1) as T;
    }
  }

  for (const resource of resources) {
    if (resource.status() === 'idle') {
      throw ResourceParamsStatus.IDLE;
    }
  }

  for (const resource of resources) {
    if (resource.status() === 'error') {
      throw new ResourceDependencyError(resource);
    }
  }

  for (const resource of resources) {
    const status = resource.status();
    if (status === 'loading') {
      throw ResourceParamsStatus.LOADING;
    }
    if (status === 'reloading' && !options?.allowStale) {
      throw ResourceParamsStatus.LOADING;
    }
  }

  return (() => resources.map((r) => r.value())) as ChainResult<T>;
}

function isResource(value: unknown): value is Resource<any> {
  return !!(
    value &&
    typeof value === 'object' &&
    'status' in value &&
    typeof value.status === 'function'
  );
}
