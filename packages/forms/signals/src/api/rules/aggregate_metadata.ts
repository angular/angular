/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import {AggregateMetadataKey} from './metadata';
import type {SchemaPath, LogicFn, PathKind, SchemaPathRules} from '../types';

/**
 * Adds a value to an {@link AggregateMetadataKey} of a field.
 *
 * @param path The target path to set the aggregate metadata on.
 * @param key The aggregate metadata key
 * @param logic A function that receives the `FieldContext` and returns a value to add to the aggregate metadata.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TMetadataItem The type of value the metadata aggregates over.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function aggregateMetadata<
  TValue,
  TMetadataItem,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  key: AggregateMetadataKey<any, TMetadataItem>,
  logic: NoInfer<LogicFn<TValue, TMetadataItem, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addAggregateMetadataRule(key, logic);
}
