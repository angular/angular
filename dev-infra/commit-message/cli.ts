/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {RestoreCommitMessageModule} from './restore-commit-message/cli';
import {ValidateFileModule} from './validate-file/cli';
import {ValidateRangeModule} from './validate-range/cli';

/** Build the parser for the commit-message commands. */
export function buildCommitMessageParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .command(RestoreCommitMessageModule)
      .command(ValidateFileModule)
      .command(ValidateRangeModule);
}
