/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Resource} from '@angular/core';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import {MetadataKey} from './metadata';
import type {FieldContext, FieldPath, PathKind} from './types';

export interface DefineOptions<TKey> {
  readonly asKey?: MetadataKey<TKey>;
}

export function define<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
  opts?: DefineOptions<TData>,
): MetadataKey<TData> {
  assertPathIsCurrent(path);
  const key = opts?.asKey ?? MetadataKey.create<Resource<TData>>();
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  pathNode.logic.addDataFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key as MetadataKey<TData>;
}
