/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {prompt} from 'inquirer';
import {runFormatterInParallel} from './run-commands-parallel';

/**
 * Format provided files in place.
 */
export async function formatFiles(files: string[]) {
  // Whether any files failed to format.
  let failures = await runFormatterInParallel(files, 'format');

  if (failures === false) {
    console.info('No files matched for formatting.');
    process.exit(0);
  }

  // The process should exit as a failure if any of the files failed to format.
  if (failures.length !== 0) {
    console.error(`Formatting failed, see errors above for more information.`);
    process.exit(1);
  }
  console.info(`√  Formatting complete.`);
  process.exit(0);
}

/**
 * Check provided files for formatting correctness.
 */
export async function checkFiles(files: string[]) {
  // Files which are currently not formatted correctly.
  const failures = await runFormatterInParallel(files, 'check');

  if (failures === false) {
    console.info('No files matched for formatting check.');
    process.exit(0);
  }

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
