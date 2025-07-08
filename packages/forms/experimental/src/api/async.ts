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
import {FieldContext, FieldPath, FormTreeError, PathKind} from './types';

export interface AsyncValidatorOptions<
  TValue,
  TRequest,
  TData,
  TPathKind extends PathKind = PathKind.Root,
> {
  readonly params: (ctx: FieldContext<TValue, TPathKind>) => TRequest;
  readonly factory: (req: Signal<TRequest | undefined>) => ResourceRef<TData | undefined>;
  readonly errors: (
    data: TData,
    ctx: FieldContext<TValue, TPathKind>,
  ) => FormTreeError | FormTreeError[] | undefined;
}

export function validateAsync<TValue, TRequest, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: AsyncValidatorOptions<TValue, TRequest, TData, TPathKind>,
): void {
  assertPathIsCurrent(path);
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  const dataKey = defineResource(path, {
    request: (ctx) => {
      const node = ctx.stateOf(path) as FieldNode;
      if (node.validationState.shouldSkipValidation() || !node.syncValid()) {
        return undefined;
      }
      return opts.params(ctx as FieldContext<TValue, TPathKind>);
    },
    factory: opts.factory,
  });

  pathNode.logic.addAsyncErrorRule((ctx) => {
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
        return opts.errors(res.value()!, ctx as FieldContext<TValue, TPathKind>);
      case 'error':
        // Throw the resource's error:
        throw res.error();
    }
  });
}

export function validateHttp<TValue, TData = unknown, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: {
    request: (ctx: FieldContext<TValue, TPathKind>) => string | undefined;
    errors: (
      data: TData,
      ctx: FieldContext<TValue, TPathKind>,
    ) => FormTreeError | FormTreeError[] | undefined;
    options?: HttpResourceOptions<TData, unknown>;
  },
): void;

export function validateHttp<TValue, TData = unknown, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: {
    request: (ctx: FieldContext<TValue, TPathKind>) => HttpResourceRequest | undefined;
    errors: (
      data: TData,
      ctx: FieldContext<TValue, TPathKind>,
    ) => FormTreeError | FormTreeError[] | undefined;
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
