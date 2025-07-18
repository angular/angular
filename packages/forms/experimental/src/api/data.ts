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
import {MetadataKey, StaticMetadataKey} from './metadata';
import type {FieldContext, FieldPath, LogicFn, PathKind} from './types';

export interface DefineOptions<TKey> {
  readonly asKey?: StaticMetadataKey<TKey>;
}

export function define<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
  opts?: DefineOptions<TData>,
): StaticMetadataKey<TData> {
  assertPathIsCurrent(path);
  const key = opts?.asKey ?? MetadataKey.static<Resource<TData>>();
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  pathNode.logic.addDataFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key as StaticMetadataKey<TData>;
}

export function defineComputed<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  fn: LogicFn<TValue, TData, TPathKind>,
  opts?: DefineOptions<Signal<TData>>,
): StaticMetadataKey<Signal<TData>> {
  assertPathIsCurrent(path);
  const key = opts?.asKey ?? MetadataKey.static<Signal<TData>>();

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
): StaticMetadataKey<ResourceRef<TData | undefined>> {
  assertPathIsCurrent(path);
  const key = opts.asKey ?? MetadataKey.static<ResourceRef<TData>>();

  const factory = (ctx: FieldContext<unknown>) => {
    const params = computed(() => opts.params(ctx as FieldContext<TValue, TPathKind>));
    // we can wrap/process the resource here
    return opts.factory(params);
  };

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDataFactory(key, factory);

  return key as StaticMetadataKey<ResourceRef<TData | undefined>>;
}
