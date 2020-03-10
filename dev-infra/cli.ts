#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {join} from 'path';
import {verify} from './pullapprove/verify';
import {validateCommitMessage} from './commit-message/validate';
import {getRepoBaseDir} from './utils/config';

const args = process.argv.slice(2);


// TODO(josephperrott): Set up proper cli flag/command handling
switch (args[0]) {
  case 'pullapprove:verify':
    verify();
    break;
  case 'commit-message:pre-commit-validate':
    const commitMessage = readFileSync(join(getRepoBaseDir(), '.git/COMMIT_EDITMSG'), 'utf8');
    if (validateCommitMessage(commitMessage)) {
      console.info('√  Valid commit message');
    }
    break;
  default:
    console.info('No commands were matched');
}
