/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HasModuleName} from '../entities/traits';

export function addModuleName<T>(entry: T, moduleName: string): T & HasModuleName {
  return {
    ...entry,
    moduleName,
  };
}
