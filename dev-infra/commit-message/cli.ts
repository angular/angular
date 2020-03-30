/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
import {validateFile} from './validate-file';

/** Build the parser for the commit-message commands. */
export function buildCommitMessageParser(localYargs: yargs.Argv) {
  return localYargs.help().strict().command(
      'pre-commit-validate', 'Validate the most recent commit message', {}, () => {
        validateFile('.git/COMMIT_EDITMSG');
      });
}

if (require.main == module) {
  buildCommitMessageParser(yargs).parse();
}
