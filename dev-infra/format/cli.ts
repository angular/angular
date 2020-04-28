/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {allChangedFilesSince, allFiles} from '../utils/repo-files';

import {checkFiles, formatFiles} from './format';

/** Build the parser for the format commands. */
export function buildFormatParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .demandCommand()
      .option('check', {
        type: 'boolean',
        default: process.env['CI'] ? true : false,
        description: 'Run the formatter to check formatting rather than updating code format'
      })
      .command(
          'all', 'Run the formatter on all files in the repository', {},
          ({check}) => {
            const executionCmd = check ? checkFiles : formatFiles;
            executionCmd(allFiles());
          })
      .command(
          'changed [shaOrRef]', 'Run the formatter on files changed since the provided sha/ref', {},
          ({shaOrRef, check}) => {
            const sha = shaOrRef || 'master';
            const executionCmd = check ? checkFiles : formatFiles;
            executionCmd(allChangedFilesSince(sha));
          })
      .command(
          'files <files..>', 'Run the formatter on provided files', {},
          ({check, files}) => {
            const executionCmd = check ? checkFiles : formatFiles;
            executionCmd(files);
          })
      // TODO(josephperrott): remove this hidden command after deprecation period.
      .command('deprecation-warning [originalCommand]', false, {}, ({originalCommand}) => {
        console.warn(`\`yarn ${
            originalCommand}\` is deprecated in favor of running the formatter via ng-dev`);
        console.warn();
        console.warn(`As a replacement of \`yarn ${originalCommand}\`, run:`);
        switch (originalCommand) {
          case 'bazel:format':
          case 'bazel:lint-fix':
            console.warn(`  yarn ng-dev format all`);
            break;
          case 'bazel:lint':
            console.warn(`  yarn ng-dev format all --check`);
            break;
          default:
            console.warn(`Error: Unrecognized previous command.`);
        }
        console.warn();
        console.warn(`You can find more usage information by running:`);
        console.warn(`  yarn ng-dev format --help`);
        console.warn();
        console.warn(`For more on the rationale and effects of this deprecation visit:`);
        console.warn(`  https://github.com/angular/angular/pull/36842#issue-410321447`);
      });
}

if (require.main === module) {
  buildFormatParser(yargs).parse();
}
