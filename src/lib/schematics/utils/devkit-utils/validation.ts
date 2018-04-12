/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { tags } from '@angular-devkit/core';
import { SchematicsException } from '@angular-devkit/schematics';

export function validateName(name: string): void {
  if (name && /^\d/.test(name)) {
    throw new SchematicsException(tags.oneLine`name (${name})
        can not start with a digit.`);
  }
}
