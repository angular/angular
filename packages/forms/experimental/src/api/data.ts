/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computed, Resource, ResourceRef, Signal} from '@angular/core';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import type {FieldContext, FieldPath, LogicFn} from './types';

export class DataKey<TValue> {
  /** @internal */
  protected __phantom!: TValue;
}

export interface DefineOptions<TKey> {
  readonly asKey?: DataKey<TKey>;
}

export function define<TValue, TData>(
  path: FieldPath<TValue>,
  factory: (ctx: FieldContext<TValue>) => TData,
  opts?: DefineOptions<TData>,
): DataKey<TData> {
  assertPathIsCurrent(path);
  const key = opts?.asKey ?? new DataKey<Resource<TData>>();
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  pathNode.logic.addDataFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key as DataKey<TData>;
}

export function defineComputed<TValue, TData>(
  path: FieldPath<TValue>,
  fn: LogicFn<TValue, TData>,
  opts?: DefineOptions<Signal<TData>>,
): DataKey<Signal<TData>> {
  assertPathIsCurrent(path);
  const key = opts?.asKey ?? new DataKey<Signal<TData>>();

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDataFactory(key, (ctx) => computed(() => fn(ctx as FieldContext<TValue>)));
  return key;
}

export interface DefineResourceOptions<TValue, TData, TRequest>
  extends DefineOptions<ResourceRef<TData>> {
  params: (ctx: FieldContext<TValue>) => TRequest;
  factory: (req: Signal<TRequest>) => ResourceRef<TData>;
}

export function defineResource<TValue, TData, TRequest>(
  path: FieldPath<TValue>,
  opts: DefineResourceOptions<TValue, TData, TRequest>,
): DataKey<ResourceRef<TData | undefined>> {
  assertPathIsCurrent(path);
  const key = opts.asKey ?? new DataKey<ResourceRef<TData>>();

  const factory = (ctx: FieldContext<unknown>) => {
    const request = computed(() => opts.params(ctx as FieldContext<TValue>));
    // we can wrap/process the resource here
    return opts.factory(request);
  };

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDataFactory(key, factory);

  return key as DataKey<ResourceRef<TData | undefined>>;
}
