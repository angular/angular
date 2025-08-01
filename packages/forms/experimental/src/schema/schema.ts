/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPath, SchemaFn, SchemaOrSchemaFn} from '../api/types';
import {FieldPathNode} from './path_node';

let currentRoot: FieldPathNode | undefined = undefined;

let compiledSchemas = new Map<SchemaImpl, FieldPathNode>();

export class SchemaImpl {
  constructor(private schemaFn: SchemaFn<unknown>) {}

  /**
   * Compiles this schema within the current compilation context. If the schema was previoulsy
   * compiled within this context, we reuse the cached FieldPathNode, otherwise we create a new one
   * and cache it in the compilation context.
   */
  compile(): FieldPathNode {
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
      // Use a try/finally to ensrue we restore the previous root upon completion,
      // even if there are errors while compiling the shcema.
      currentRoot = prevRoot;
    }
    return path;
  }

  /**
   * Creates a SchemaImpl from the given SchemaOrSchemaFn.
   */
  static create(schema: SchemaImpl | SchemaOrSchemaFn<any>) {
    if (schema instanceof SchemaImpl) {
      return schema;
    }
    return new SchemaImpl(schema as SchemaFn<unknown>);
  }

  /**
   * Compiles the given schema in a fresh compilation context. This clears the cached results of any
   * previous compilations.
   */
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
      // Use a try/finally to ensure we properly reset the compilation context upon completion,
      // even if there are errors while compiling the shcema.
      compiledSchemas.clear();
    }
  }
}

export function isSchemaOrSchemaFn(schema: unknown): schema is SchemaOrSchemaFn<unknown> {
  return schema instanceof SchemaImpl || typeof schema === 'function';
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
