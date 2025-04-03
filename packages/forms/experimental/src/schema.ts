/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, Schema, SchemaFn} from './api/types';
import {FieldPathNode} from './path_node';

let currentKey: symbol | undefined = undefined;

export class SchemaImpl {
  constructor(readonly schemaFn: SchemaFn<any>) {}

  apply(path: FieldPathNode): void {
    let prevKey = currentKey;
    try {
      currentKey = path.key;
      this.schemaFn(path.formPathProxy);
    } finally {
      currentKey = prevKey;
    }
  }

  asSchema<T>(): Schema<T> {
    return this as unknown as Schema<T>;
  }

  /**
   * Get the `SchemaImpl` given a `Schema`.
   */
  static extractFromSchema(schema: Schema<unknown>): SchemaImpl {
    // `Schema` instances at runtime are really `SchemaImpl`s, so this is just a cast.
    return schema as unknown as SchemaImpl;
  }
}

export function assertPathIsCurrent(path: FieldPath<unknown>): void {
  if (currentKey !== FieldPathNode.extractFromPath(path).key) {
    throw new Error(`Wrong path!`);
  }
}
