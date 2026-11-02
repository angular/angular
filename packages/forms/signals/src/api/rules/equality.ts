/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import type {PathKind, SchemaPath, SchemaPathRules} from '../types';

/**
 * Adds logic to a field to set a custom equality function for change detection.
 *
 * This is useful for types where reference equality doesn't work, such as immutable objects
 * (e.g., `Temporal.PlainDate`). The equality function will be used by the field's value signal
 * to determine if a new value is considered different from the previous value.
 *
 * @param path The target path to add the equality logic to.
 * @param logic A function that takes two values and returns `true` if they are considered equal.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Custom equality](guide/forms/signals/form-logic#custom-equality)
 *
 * @category logic
 * @publicApi 22.0
 */
export function equality<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: (a: TValue, b: TValue) => boolean,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addEqualityRule(() => logic);
}
