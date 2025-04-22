/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, Schema} from './api/types';
import {FieldPathNode} from './path_node';

let currentRoot: FieldPathNode | undefined = undefined;

export class SchemaImpl {
  constructor(readonly schemaFn: Schema<any>) {}

  apply(path: FieldPathNode): void {
    let prevRoot = currentRoot;
    try {
      currentRoot = path.root;
      this.schemaFn(path.fieldPathProxy);
    } finally {
      currentRoot = prevRoot;
    }
  }
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
