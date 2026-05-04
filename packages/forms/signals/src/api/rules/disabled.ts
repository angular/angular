/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import type {FieldContext, LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../types';

/**
 * Adds logic to a field to conditionally disable it. A disabled field does not contribute to the
 * validation, touched/dirty, or other state of its parent field.
 *
 * @param path The target path to add the disabled logic to.
 * @param configOrLogic Optional configuration object containing `when`, or the logic directly (deprecated).
 *  - `when`: A reactive function that returns `true` (or a string reason) when the field is disabled,
 *    and `false` when it is not disabled. Can also be a static string reason.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @publicApi 22.0
 */
export function disabled<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  configOrLogic?:
    | {when?: string | NoInfer<LogicFn<TValue, boolean | string, TPathKind>>}
    | string
    | NoInfer<LogicFn<TValue, boolean | string, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);

  let logic: string | LogicFn<TValue, boolean | string, TPathKind> | undefined;
  if (typeof configOrLogic === 'function' || typeof configOrLogic === 'string') {
    logic = configOrLogic;
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(
        `[Signal Forms] Passing a function or string directly to 'disabled' is deprecated. Use '{ when: ... }' instead.`,
      );
    }
  } else if (configOrLogic !== undefined) {
    logic = configOrLogic.when;
  } else {
    logic = undefined;
  }

  pathNode.builder.addDisabledReasonRule((ctx) => {
    let result: boolean | string = true;
    if (typeof logic === 'string') {
      result = logic;
    } else if (logic) {
      result = logic(ctx as FieldContext<TValue, TPathKind>);
    }
    if (typeof result === 'string') {
      return {fieldTree: ctx.fieldTree, message: result};
    }
    return result ? {fieldTree: ctx.fieldTree} : undefined;
  });
}
