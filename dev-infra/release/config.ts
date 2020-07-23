/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../utils/config';

export interface ReleaseConfig {
  tagPrefix?: string;
}

/** Retrieve and validate the config as `ReleaseConfig`. */
export function getReleaseConfig() {
  // List of errors encountered validating the config.
  const errors: string[] = [];
  // The unvalidated config object.
  const config: Partial<NgDevConfig<{release: ReleaseConfig}>> = getConfig();

  assertNoErrors(errors);
  return config as Required<typeof config>;
}
