/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import type {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../types';

/**
 * Adds logic to a field to conditionally hide it. A hidden field does not contribute to the
 * validation, touched/dirty, or other state of its parent field.
 *
 * If a field may be hidden it is recommended to guard it with an `@if` in the template:
 * ```
 * @if (!email().hidden()) {
 *   <label for="email">Email</label>
 *   <input id="email" type="email" [control]="email" />
 * }
 * ```
 *
 * @param path The target path to add the hidden logic to.
 * @param logic A reactive function that returns `true` when the field is hidden.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function hidden<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<LogicFn<TValue, boolean, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addHiddenRule(logic);
}
