/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Resource, ResourceRef, Signal} from '@angular/core';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import type {FieldContext, FieldPath, LogicFn, PathKind} from './types';

export class DataKey<TValue> {
  /** @internal */
  protected __phantom!: TValue;
}

export interface DefineOptions<TKey> {
  readonly asKey?: DataKey<TKey>;
}

export function define<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
  opts?: DefineOptions<TData>,
): DataKey<TData> {
  assertPathIsCurrent(path);
  const key = opts?.asKey ?? new DataKey<Resource<TData>>();
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  pathNode.logic.addDataFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key as DataKey<TData>;
}

export function defineComputed<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  fn: LogicFn<TValue, TData, TPathKind>,
  opts?: DefineOptions<Signal<TData>>,
): DataKey<Signal<TData>> {
  assertPathIsCurrent(path);
  const key = opts?.asKey ?? new DataKey<Signal<TData>>();

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDataFactory(key, (ctx) =>
    computed(() => fn(ctx as FieldContext<TValue, TPathKind>)),
  );
  return key;
}

export interface DefineResourceOptions<
  TValue,
  TData,
  TRequest,
  TPathKind extends PathKind = PathKind.Root,
> extends DefineOptions<ResourceRef<TData>> {
  params: (ctx: FieldContext<TValue, TPathKind>) => TRequest;
  factory: (req: Signal<TRequest>) => ResourceRef<TData>;
}

export function defineResource<TValue, TData, TRequest, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  opts: DefineResourceOptions<TValue, TData, TRequest, TPathKind>,
): DataKey<ResourceRef<TData | undefined>> {
  assertPathIsCurrent(path);
  const key = opts.asKey ?? new DataKey<ResourceRef<TData>>();

  const factory = (ctx: FieldContext<unknown>) => {
    const params = computed(() => opts.params(ctx as FieldContext<TValue, TPathKind>));
    // we can wrap/process the resource here
    return opts.factory(params);
  };

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDataFactory(key, factory);

  return key as DataKey<ResourceRef<TData | undefined>>;
}
