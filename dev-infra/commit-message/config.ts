/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../utils/config';

export interface CommitMessageConfig {
  maxLineLength: number;
  minBodyLength: number;
  minBodyLengthTypeExcludes?: string[];
  types: string[];
  scopes: string[];
}

/** Retrieve and validate the config as `CommitMessageConfig`. */
export function getCommitMessageConfig() {
  // List of errors encountered validating the config.
  const errors: string[] = [];
  // The non-validated config object.
  const config: Partial<NgDevConfig<{commitMessage: CommitMessageConfig}>> = getConfig();

  if (config.commitMessage === undefined) {
    errors.push(`No configuration defined for "commitMessage"`);
  }

  assertNoErrors(errors);
  return config as Required<typeof config>;
}
