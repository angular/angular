/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
import {validateFile} from './validate-file';
import {validateCommitRange} from './validate-range';

/** Build the parser for the commit-message commands. */
export function buildCommitMessageParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .command(
          'pre-commit-validate', 'Validate the most recent commit message', {},
          () => {
            validateFile('.git/COMMIT_EDITMSG');
          })
      .command(
          'validate-range', 'Validate a range of commit messages', {
            'range': {
              description: 'The range of commits to check, e.g. --range abc123..xyz456',
              demandOption: '  A range must be provided, e.g. --range abc123..xyz456',
              type: 'string',
              requiresArg: true,
            },
          },
          argv => {
            // If on CI, and not pull request number is provided, assume the branch
            // being run on is an upstream branch.
            if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
              console.info(
                  `Since valid commit messages are enforced by PR linting on CI, we do not\n` +
                  `need to validate commit messages on CI runs on upstream branches.\n\n` +
                  `Skipping check of provided commit range`);
              return;
            }
            validateCommitRange(argv.range);
          });
}

if (require.main == module) {
  buildCommitMessageParser(yargs).parse();
}
