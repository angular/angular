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
  configKey: 'commitMessage',
  validator,
};

/** Validate the configuration correctly provides commitMessage information. */
export function validator(
    config: any, errors: string[]): config is NgDevConfig<{commitMessage: CommitMessageConfig}> {
  return true;
}
