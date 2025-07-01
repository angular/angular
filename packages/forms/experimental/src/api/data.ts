/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computed, ResourceRef, Signal} from '@angular/core';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import {MetadataKey, StaticMetadataKey} from './metadata';
import type {FieldContext, FieldPath, LogicFn} from './types';

export type DataDefinition<TData> = {__type: TData};

export interface DefineOptions<TKey> {
  readonly asMetadata?: StaticMetadataKey<TKey>;
}

export function define<TValue, TData>(
  path: FieldPath<TValue>,
  factory: (ctx: FieldContext<TValue>) => TData,
  opts?: DefineOptions<TData>,
): DataDefinition<TData> {
  assertPathIsCurrent(path);
  const key = opts?.asMetadata ?? MetadataKey.static<TData>();
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  pathNode.logic.addDataFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key as unknown as DataDefinition<TData>;
}

export function defineComputed<TValue, TData>(
  path: FieldPath<TValue>,
  fn: LogicFn<TValue, TData>,
  opts?: DefineOptions<Signal<TData>>,
): DataDefinition<Signal<TData>> {
  assertPathIsCurrent(path);
  const key = opts?.asMetadata ?? MetadataKey.static<Signal<TData>>();

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDataFactory(key, (ctx) => computed(() => fn(ctx as FieldContext<TValue>)));
  return key as unknown as DataDefinition<Signal<TData>>;
}

export interface DefineResourceOptions<TValue, TData, TRequest>
  extends DefineOptions<ResourceRef<TData>> {
  params: (ctx: FieldContext<TValue>) => TRequest;
  factory: (req: Signal<TRequest>) => ResourceRef<TData>;
}

export function defineResource<TValue, TData, TRequest>(
  path: FieldPath<TValue>,
  opts: DefineResourceOptions<TValue, TData, TRequest>,
): DataDefinition<ResourceRef<TData | undefined>> {
  assertPathIsCurrent(path);
  const key = opts.asMetadata ?? MetadataKey.static<ResourceRef<TData>>();

  const factory = (ctx: FieldContext<unknown>) => {
    const params = computed(() => opts.params(ctx as FieldContext<TValue>));
    // we can wrap/process the resource here
    return opts.factory(params);
  };

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDataFactory(key, factory);

  return key as unknown as DataDefinition<ResourceRef<TData | undefined>>;
}
