/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Schema, SchemaOrSchemaFn} from './api/types';
import {FieldRootPathNode} from './path_node';

/**
 * Creates a schema.
 * @param s The schema deifinition.
 * @returns A schema based on the given definition:
 *   - If the given definition was a `Schema`, simply returns it.
 *   - If the given definition was a `SchemaFn`, returns a `Schema` containing its logic.
 *   - If the given definition was `undefined`, returns a `Schema` with no logic.
 */
export function createSchema(s: SchemaOrSchemaFn<any> | undefined) {
  if (isSchema(s)) {
    return s;
  }
  return new FieldRootPathNode(s);
}

/**
 * Checks whether the given object is a `Schema`.
 */
export function isSchema(obj: unknown): obj is Schema<unknown> {
  return obj instanceof FieldRootPathNode;
}

/**
 * Gets the `FieldRootPathNode` for the given schema. Also accepts a FieldRootPathNode for
 * convenience.
 */
export function pathFromSchema(schema: Schema<any> | FieldRootPathNode): FieldRootPathNode {
  return schema as FieldRootPathNode;
}
