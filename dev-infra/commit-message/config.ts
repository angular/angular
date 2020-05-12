/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgDevConfig} from '../utils/config';

export interface CommitMessageConfig {
  maxLineLength: number;
  minBodyLength: number;
  types: string[];
  scopes: string[];
}

export const COMMIT_MESSAGE = {
  validator: isCommitMessageConfig,
};

/** Validate the configuration correctly provides commitMessage information. */
export function isCommitMessageConfig(
    config: any, errors: string[]): config is NgDevConfig<{commitMessage: CommitMessageConfig}> {
  if (config.commitMessage === undefined) {
    errors.push(`No configuration defined for "commitMessage"`);
  }
  return true;
}
