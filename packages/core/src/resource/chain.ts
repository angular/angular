/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Resource, type ChainOptions, type ChainResult, type ResourceValues} from './api';
import {ResourceParams} from './params_status';

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
      return {exitStatus: ResourceParams.idle()};
    }
  }

  for (const resource of resources) {
    if (resource.status() === 'error') {
      const e = new ResourceDependencyError(resource);
      return {exitStatus: ResourceParams.error(e)};
    }
  }

  for (const resource of resources) {
    const status = resource.status();
    if (status === 'loading') {
      return {exitStatus: ResourceParams.loading()};
    }
    if (status === 'reloading' && !options?.allowStale) {
      return {exitStatus: ResourceParams.loading()};
    }
  }

  return {
    values: () => resources.map((r) => r.value()) as ResourceValues<T>,
  };
}

function isResource(value: unknown): value is Resource<any> {
  return !!(
    value &&
    typeof value === 'object' &&
    'status' in value &&
    typeof value.status === 'function'
  );
}
