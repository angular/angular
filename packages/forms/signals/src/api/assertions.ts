/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FIELD_TREE} from './symbols';
import type {FieldTree} from './types';

/**
 * Asserts whether a value is a `FieldTree`.
 * @param value Value to be checked.
 *
 * @publicApi 22.1
 */
export function isFieldTree(value: unknown): value is FieldTree<unknown> {
  return typeof value === 'function' && (value as any)[FIELD_TREE] === true;
}
