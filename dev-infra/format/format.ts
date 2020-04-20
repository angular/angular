/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {prompt} from 'inquirer';
import * as multimatch from 'multimatch';
import {join} from 'path';

import {getAngularDevConfig, getRepoBaseDir} from '../utils/config';

import {FormatConfig} from './config';
import {runInParallel} from './run-commands-parallel';

/** By default, run the formatter on all javascript and typescript files. */
const DEFAULT_MATCHERS = ['**/*.{t,j}s'];

/**
 * Format provided files in place.
 */
export async function formatFiles(unfilteredFiles: string[]) {
  // Whether any files failed to format.
  let formatFailed = false;
  // All files which formatting should be applied to.
  const files = filterFilesByMatchers(unfilteredFiles);

  console.info(`Formatting ${files.length} file(s)`);


  // Run the formatter to format the files in place, split across (number of available
  // cpu threads - 1) processess. The task is done in multiple processess to speed up
  // the overall time of the task, as running across entire repositories takes a large
  // amount of time.
  // As a data point for illustration, using 8 process rather than 1 cut the execution
  // time from 276 seconds to 39 seconds for the same 2700 files
  await runInParallel(files, `${getFormatterBinary()} -i -style=file`, (file, code, _, stderr) => {
    if (code !== 0) {
      formatFailed = true;
      console.error(`Error running clang-format on: ${file}`);
      console.error(stderr);
      console.error();
    }
  });

  // The process should exit as a failure if any of the files failed to format.
  if (formatFailed) {
    console.error(`Formatting failed, see errors above for more information.`);
    process.exit(1);
  }
  console.info(`√  Formatting complete.`);
  process.exit(0);
}

/**
 * Check provided files for formatting correctness.
 */
export async function checkFiles(unfilteredFiles: string[]) {
  // All files which formatting should be applied to.
  const files = filterFilesByMatchers(unfilteredFiles);
  // Files which are currently not formatted correctly.
  const failures: string[] = [];

  console.info(`Checking format of ${files.length} file(s)`);

  // Run the formatter to check the format of files, split across (number of available
  // cpu threads - 1) processess. The task is done in multiple processess to speed up
  // the overall time of the task, as running across entire repositories takes a large
  // amount of time.
  // As a data point for illustration, using 8 process rather than 1 cut the execution
  // time from 276 seconds to 39 seconds for the same 2700 files.
  await runInParallel(files, `${getFormatterBinary()} --Werror -n -style=file`, (file, code) => {
    // Add any files failing format checks to the list.
    if (code !== 0) {
      failures.push(file);
    }
  });

  if (failures.length) {
    // Provide output expressing which files are failing formatting.
    console.group('\nThe following files are out of format:');
    for (const file of failures) {
      console.info(`  - ${file}`);
    }
    console.groupEnd();
    console.info();

    // If the command is run in a non-CI environment, prompt to format the files immediately.
    let runFormatter = false;
    if (!process.env['CI']) {
      runFormatter = (await prompt({
                       type: 'confirm',
                       name: 'runFormatter',
                       message: 'Format the files now?',
                     })).runFormatter;
    }

    if (runFormatter) {
      // Format the failing files as requested.
      await formatFiles(failures);
      process.exit(0);
    } else {
      // Inform user how to format files in the future.
      console.info();
      console.info(`To format the failing file run the following command:`);
      console.info(`  yarn ng-dev format files ${failures.join(' ')}`);
      process.exit(1);
    }
  } else {
    console.info('√  All files correctly formatted.');
    process.exit(0);
  }
}

/** Get the full path of the formatter binary to execute. */
function getFormatterBinary() {
  return join(getRepoBaseDir(), 'node_modules/.bin/clang-format');
}

/** Filter a list of files to only contain files which are expected to be formatted. */
function filterFilesByMatchers(allFiles: string[]) {
  const matchers =
      getAngularDevConfig<'format', FormatConfig>().format.matchers || DEFAULT_MATCHERS;
  const files = multimatch(allFiles, matchers, {dot: true});

  console.info(`Formatting enforced on ${files.length} of ${allFiles.length} file(s)`);
  return files;
}
