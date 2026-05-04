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
 * Adds logic to a field to conditionally make it readonly. A readonly field does not contribute to
 * the validation, touched/dirty, or other state of its parent field.
 *
 * @param path The target path to make readonly.
 * @param configOrLogic Optional configuration object containing `when`, or the logic directly (deprecated).
 *  - `when`: A reactive function that returns `true` when the field is readonly.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @publicApi 22.0
 */
export function readonly<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  configOrLogic?:
    | {when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>}
    | NoInfer<LogicFn<TValue, boolean, TPathKind>>,
) {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);

  let logic: LogicFn<TValue, boolean, TPathKind>;
  if (typeof configOrLogic === 'object' && configOrLogic !== null && 'when' in configOrLogic) {
    logic = configOrLogic.when ?? (() => true);
  } else if (typeof configOrLogic === 'function') {
    logic = configOrLogic;
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(
        `[Signal Forms] Passing a function directly to 'readonly' is deprecated. Use '{ when: ... }' instead.`,
      );
    }
  } else {
    logic = () => true;
  }

  pathNode.builder.addReadonlyRule(logic);
}
