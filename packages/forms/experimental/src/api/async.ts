/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {httpResource, HttpResourceOptions, HttpResourceRequest} from '@angular/common/http';
import {ResourceRef, Signal} from '@angular/core';
import {FieldNode} from '../field/node';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import {defineResource} from './data';
import {FieldContext, FieldPath, FormTreeError} from './types';

export interface AsyncValidatorOptions<TValue, TRequest, TData> {
  readonly params: (ctx: FieldContext<TValue>) => TRequest;
  readonly factory: (req: Signal<TRequest | undefined>) => ResourceRef<TData | undefined>;
  readonly errors: (
    data: TData,
    ctx: FieldContext<TValue>,
  ) => FormTreeError | FormTreeError[] | undefined;
}

export function validateAsync<TValue, TRequest, TData>(
  path: FieldPath<TValue>,
  opts: AsyncValidatorOptions<TValue, TRequest, TData>,
): void {
  assertPathIsCurrent(path);
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  const dataKey = defineResource(path, {
    params: (ctx) => {
      const node = ctx.stateOf(path) as FieldNode;
      if (node.validationState.shouldSkipValidation() || !node.syncValid()) {
        return undefined;
      }
      return opts.params(ctx);
    },
    factory: opts.factory,
  });

  pathNode.logic.asyncErrors.push((ctx) => {
    const res = ctx.state.data(dataKey)!;
    switch (res.status()) {
      case 'idle':
        return undefined;
      case 'loading':
      case 'reloading':
        return 'pending';
      case 'resolved':
      case 'local':
        if (!res.hasValue()) {
          return undefined;
        }
        return opts.errors(res.value()!, ctx);
      case 'error':
        // Throw the resource's error:
        throw res.error();
    }
  });
}

export function validateHttp<TValue, TData = unknown>(
  path: FieldPath<TValue>,
  opts: {
    request: (ctx: FieldContext<TValue>) => string | undefined;
    errors: (data: TData, ctx: FieldContext<TValue>) => FormTreeError | FormTreeError[] | undefined;
    options?: HttpResourceOptions<TData, unknown>;
  },
): void;

export function validateHttp<TValue, TData = unknown>(
  path: FieldPath<TValue>,
  opts: {
    request: (ctx: FieldContext<TValue>) => HttpResourceRequest | undefined;
    errors: (data: TData, ctx: FieldContext<TValue>) => FormTreeError | FormTreeError[] | undefined;
    options?: HttpResourceOptions<TData, unknown>;
  },
): void;

export function validateHttp<TValue>(path: FieldPath<TValue>, opts: any) {
  validateAsync(path, {
    params: opts.request,
    factory: (request: Signal<any>) => httpResource(request, opts.options),
    errors: opts.errors,
  });
}
