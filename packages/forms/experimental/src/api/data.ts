/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import {MetadataKey} from './metadata';
import type {FieldContext, FieldPath, PathKind} from './types';

export function setMetadata<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  key: MetadataKey<TData>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
) {
  assertPathIsCurrent(path);
  const pathNode = FieldPathNode.unwrapFieldPath(path);

  pathNode.logic.addDataFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
}
