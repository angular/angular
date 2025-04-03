/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, Schema} from './api/types';
import {FieldPathNode} from './path_node';

let currentKey: symbol | undefined = undefined;

export class SchemaImpl {
  constructor(readonly schemaFn: Schema<any>) {}

  apply(path: FieldPathNode): void {
    let prevKey = currentKey;
    try {
      currentKey = path.key;
      this.schemaFn(path.fieldPathProxy);
    } finally {
      currentKey = prevKey;
    }
  }
}

export function assertPathIsCurrent(path: FieldPath<unknown>): void {
  if (currentKey !== FieldPathNode.extractFromPath(path).key) {
    throw new Error(`Wrong path!`);
  }
}
