/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LanguageServiceTestEnv, Project} from '../testing';

let sharedEnv: LanguageServiceTestEnv | null = null;

export function getSharedEnv(): LanguageServiceTestEnv {
  if (!sharedEnv) {
    sharedEnv = LanguageServiceTestEnv.setup();
  }
  return sharedEnv;
}

export function resetSharedEnv(): void {
  sharedEnv = null;
}
