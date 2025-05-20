/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceRef, ResourceStatus, Signal} from '@angular/core';
import {FieldContext, FieldPath, FormTreeError, ValidationResult} from './types';
import {assertPathIsCurrent} from '../schema';
import {FieldPathNode} from '../path_node';
import {defineResource} from './data';
import {FieldNode} from '../field_node';

export interface AsyncValidatorOptions<TValue, TRequest, TData> {
  readonly params: (ctx: FieldContext<TValue>) => TRequest;
  readonly factory: (req: Signal<TRequest | undefined>) => ResourceRef<TData | undefined>;
  readonly error: (
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
      const node = ctx.resolve(path).$state as FieldNode;
      if (node.shouldSkipValidation() || !node.syncValid()) {
        return undefined;
      }
      return opts.params(ctx);
    },
    factory: opts.factory,
  });

  pathNode.logic.asyncErrors.push((ctx) => {
    const res = ctx.data(dataKey);
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
        return opts.error(res.value()!, ctx);
      case 'error':
        // Throw the resource's error:
        throw res.error();
    }
  });
}
