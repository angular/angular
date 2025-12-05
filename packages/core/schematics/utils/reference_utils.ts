/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PropertyRead, AST} from '@angular/compiler';
import {ClassFieldDescriptor} from '../migrations/signal-migration/src';
import {
  HostBindingReference,
  TemplateReference,
} from '../migrations/signal-migration/src/passes/reference_resolution/reference_kinds';

/**
 * Gets whether the given read is used to access
 * the specified field.
 *
 * E.g. whether `<my-read>.toArray` is detected.
 */
export function checkNonTsReferenceAccessesField(
  ref: HostBindingReference<ClassFieldDescriptor> | TemplateReference<ClassFieldDescriptor>,
  fieldName: string,
): PropertyRead | null {
  const readFromPath = ref.from.readAstPath.at(-1) as PropertyRead | AST | undefined;
  const parentRead = ref.from.readAstPath.at(-2) as PropertyRead | AST | undefined;

  if (ref.from.read !== readFromPath) {
    return null;
  }
  if (!(parentRead instanceof PropertyRead) || parentRead.name !== fieldName) {
    return null;
  }

  return parentRead;
}
