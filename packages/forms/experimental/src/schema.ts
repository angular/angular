/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Schema, SchemaOrSchemaFn} from './api/types';
import {FieldRootPathNode} from './path_node';

export function createSchema(s: SchemaOrSchemaFn<any> | undefined) {
  if (isSchema(s)) {
    return s;
  }
  return new FieldRootPathNode(s);
}

export function isSchema(obj: unknown): obj is Schema<unknown> {
  return obj instanceof FieldRootPathNode;
}
