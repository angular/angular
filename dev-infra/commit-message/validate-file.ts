/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {resolve} from 'path';

import {getRepoBaseDir} from '../utils/config';
import {info} from '../utils/console';

import {validateCommitMessage} from './validate';

/** Validate commit message at the provided file path. */
export function validateFile(filePath: string) {
  // Read the commit message from the specified file and remove any comments (i.e. lines starting
  // with `#`). Comments are automatically removed by git and are not part of the final commit
  // message.
  const commitMessage = readFileSync(resolve(getRepoBaseDir(), filePath), 'utf8')
      .split('\n').filter(line => !line.startsWith('#')).join('\n');
  if (validateCommitMessage(commitMessage)) {
    info('√  Valid commit message');
    return;
  }
  // If the validation did not return true, exit as a failure.
  process.exit(1);
}
