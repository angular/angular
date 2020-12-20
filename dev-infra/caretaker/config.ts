/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../utils/config';

export interface CaretakerConfig {
  githubQueries?: {name: string; query: string;}[];
}

/** Retrieve and validate the config as `CaretakerConfig`. */
export function getCaretakerConfig() {
  // List of errors encountered validating the config.
  const errors: string[] = [];
  // The non-validated config object.
  const config: Partial<NgDevConfig<{caretaker: CaretakerConfig}>> = getConfig();

  assertNoErrors(errors);
  return config as Required<typeof config>;
}
