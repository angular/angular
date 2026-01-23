/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HasRepo} from '../entities/traits.mjs';

export function addRepo<T>(entry: T, repo: string): T & HasRepo {
  return {
    ...entry,
    repo,
  };
}
