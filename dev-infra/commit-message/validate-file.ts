/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {join} from 'path';

import {getRepoBaseDir} from '../utils/config';

import {validateCommitMessage} from './validate';

/** Validate commit message at the provided file path. */
export function validateFile(filePath: string) {
  const commitMessage = readFileSync(join(getRepoBaseDir(), filePath), 'utf8');
  if (validateCommitMessage(commitMessage)) {
    console.info('√  Valid commit message');
    return;
  }
  // If the validation did not return true, exit as a failure.
  process.exit(1);
}
