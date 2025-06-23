/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, SchemaFn, SchemaOrSchemaFn} from './api/types';
import {FieldPathNode} from './path_node';

let currentRoot: FieldPathNode | undefined = undefined;

let compiledSchemas = new Map<SchemaImpl, FieldPathNode>();

export class SchemaImpl {
  constructor(private schemaFn: SchemaFn<unknown>) {}

  compile(): FieldPathNode {
    debugger;
    if (compiledSchemas.has(this)) {
      return compiledSchemas.get(this)!;
    }
    const path = FieldPathNode.newRoot();
    compiledSchemas.set(this, path);
    let prevRoot = currentRoot;
    try {
      currentRoot = path;
      this.schemaFn(path.fieldPathProxy);
    } finally {
      currentRoot = prevRoot;
    }
    return path;
  }

  static create(schema: SchemaImpl | SchemaOrSchemaFn<any> | undefined) {
    if (schema === undefined) {
      return undefined;
    }
    if (schema instanceof SchemaImpl) {
      return schema;
    }
    return new SchemaImpl(schema as SchemaFn<unknown>);
  }

  static rootCompile(schema: SchemaImpl | SchemaOrSchemaFn<any> | undefined) {
    try {
      compiledSchemas.clear();
      if (schema === undefined) {
        return FieldPathNode.newRoot();
      }
      if (schema instanceof SchemaImpl) {
        return schema.compile();
      }
      return new SchemaImpl(schema as SchemaFn<unknown>).compile();
    } finally {
      compiledSchemas.clear();
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
