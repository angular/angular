/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ClassFieldDescriptor} from './known_fields';
import {Reference} from './reference_kinds';

export interface ReferenceResult<D extends ClassFieldDescriptor> {
  references: Reference<D>[];
}
