/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, Schema, SchemaOrSchemaFn} from './api/types';
import {FieldPathNode, FieldRootPathNode} from './path_node';

let currentRoot: FieldRootPathNode | undefined = undefined;

export function compileSchema(schemaFn: SchemaOrSchemaFn<any> | undefined): FieldRootPathNode {
  if (schemaFn === undefined) {
    return new FieldRootPathNode();
  }
  if (isCompiledSchema(schemaFn)) {
    return schemaFn;
  }
  const prevRoot = currentRoot;
  try {
    currentRoot = new FieldRootPathNode();
    schemaFn(currentRoot.fieldPathProxy);
    return currentRoot as Schema<unknown>;
  } finally {
    currentRoot = prevRoot;
  }
}

export function isCompiledSchema(obj: unknown): obj is Schema<unknown> {
  return obj instanceof FieldRootPathNode;
}

export function assertPathIsCurrent(path: FieldPath<unknown>): void {
  if (currentRoot !== FieldPathNode.unwrapFieldPath(path).root) {
    throw new Error(`🚨👮 Wrong path! 👮🚨

This error happens when using a path from outside of schema:

applyWhen(
      path,
      condition,
      (pathWhenTrue /* <-- Use this, not path  */) => {
        // ✅ This works
        applyEach(pathWhenTrue.friends, friendSchema);
        // 🚨 👮 🚓  You have to use nested path
        // This produces a this error:
        applyEach(path /*has to be pathWhenTrue*/.friends, friendSchema);
      }
    );

    `);
  }
}
