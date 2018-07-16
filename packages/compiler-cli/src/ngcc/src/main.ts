/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {resolve} from 'path';

export function mainNgcc(args: string[]): number {
  const packagePath = resolve(args[0]);

  return 0;
}
