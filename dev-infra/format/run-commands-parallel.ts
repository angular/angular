/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Bar} from 'cli-progress';
import * as multimatch from 'multimatch';
import {cpus} from 'os';
import {exec} from 'shelljs';

import {info} from '../utils/console';

import {Formatter, FormatterAction, getActiveFormatters} from './formatters/index';

const AVAILABLE_THREADS = Math.max(cpus().length - 1, 1);

/**
 * Run the provided commands in parallel for each provided file.
 *
 * Running the formatter is split across (number of available cpu threads - 1) processess.
 * The task is done in multiple processess to speed up the overall time of the task, as running
 * across entire repositories takes a large amount of time.
 * As a data point for illustration, using 8 process rather than 1 cut the execution
 * time from 276 seconds to 39 seconds for the same 2700 files.
 *
 * A promise is returned, completed when the command has completed running for each file.
 * The promise resolves with a list of failures, or `false` if no formatters have matched.
 */
export function runFormatterInParallel(allFiles: string[], action: FormatterAction) {
  return new Promise<false|string[]>((resolve) => {
    const formatters = getActiveFormatters();
    const failures: string[] = [];
    const pendingCommands: {formatter: Formatter, file: string}[] = [];

    for (const formatter of formatters) {
      pendingCommands.push(
          ...multimatch.call(undefined, allFiles, formatter.getFileMatcher(), {dot: true})
              .map(file => ({formatter, file})));
    }

    // If no commands are generated, resolve the promise as `false` as no files
    // were run against the any formatters.
    if (pendingCommands.length === 0) {
      return resolve(false);
    }

    switch (action) {
      case 'format':
        info(`Formatting ${pendingCommands.length} file(s)`);
        break;
      case 'check':
        info(`Checking format of ${pendingCommands.length} file(s)`);
        break;
      default:
        throw Error(`Invalid format action "${action}": allowed actions are "format" and "check"`);
    }

    // The progress bar instance to use for progress tracking.
    const progressBar =
        new Bar({format: `[{bar}] ETA: {eta}s | {value}/{total} files`, clearOnComplete: true});
    // A local copy of the files to run the command on.
    // An array to represent the current usage state of each of the threads for parallelization.
    const threads = new Array<boolean>(AVAILABLE_THREADS).fill(false);

    // Recursively run the command on the next available file from the list using the provided
    // thread.
    function runCommandInThread(thread: number) {
      const nextCommand = pendingCommands.pop();
      // If no file was pulled from the array, return as there are no more files to run against.
      if (nextCommand === undefined) {
        threads[thread] = false;
        return;
      }

      // Get the file and formatter for the next command.
      const {file, formatter} = nextCommand;

      exec(
          `${formatter.commandFor(action)} ${file}`,
          {async: true, silent: true},
          (code, stdout, stderr) => {
            // Run the provided callback function.
            const failed = formatter.callbackFor(action)(file, code, stdout, stderr);
            if (failed) {
              failures.push(file);
            }
            // Note in the progress bar another file being completed.
            progressBar.increment(1);
            // If more files exist in the list, run again to work on the next file,
            // using the same slot.
            if (pendingCommands.length) {
              return runCommandInThread(thread);
            }
            // If not more files are available, mark the thread as unused.
            threads[thread] = false;
            // If all of the threads are false, as they are unused, mark the progress bar
            // completed and resolve the promise.
            if (threads.every(active => !active)) {
              progressBar.stop();
              resolve(failures);
            }
          },
      );
      // Mark the thread as in use as the command execution has been started.
      threads[thread] = true;
    }

    // Start the progress bar
    progressBar.start(pendingCommands.length, 0);
    // Start running the command on files from the least in each available thread.
    threads.forEach((_, idx) => runCommandInThread(idx));
  });
}
