/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../utils/config';

export interface CaretakerConfig {
  /** Github queries showing a snapshot of pulls/issues caretakers need to monitor. */
  githubQueries?: {name: string; query: string;}[];
  /**
   * The Github group used to track current caretakers. A second group is assumed to exist with the
   * name "<group-name>-roster" containing a list of all users eligible for the caretaker group.
   * */
  caretakerGroup?: string;
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
