/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Bar} from 'cli-progress';
import {cpus} from 'os';
import {exec} from 'shelljs';

const AVAILABLE_THREADS = Math.max(cpus().length - 1, 1);

type CallbackFunction = (file: string, code?: number, stdout?: string, stderr?: string) => void;

/**
 * Run the provided commands in parallel for each provided file.
 *
 * A promise is returned, completed when the command has completed running for each file.
 */
export function runInParallel(providedFiles: string[], cmd: string, callback: CallbackFunction) {
  return new Promise<void>((resolve) => {
    if (providedFiles.length === 0) {
      return resolve();
    }
    // The progress bar instance to use for progress tracking.
    const progressBar =
        new Bar({format: `[{bar}] ETA: {eta}s | {value}/{total} files`, clearOnComplete: true});
    // A local copy of the files to run the command on.
    const files = providedFiles.slice();
    // An array to represent the current usage state of each of the threads for parallelization.
    const threads = new Array<boolean>(AVAILABLE_THREADS).fill(false);

    // Recursively run the command on the next available file from the list using the provided
    // thread.
    function runCommandInThread(thread: number) {
      // Get the next file.
      const file = files.pop();
      // If no file was pulled from the array, return as there are no more files to run against.
      if (!file) {
        return;
      }

      exec(
          `${cmd} ${file}`,
          {async: true, silent: true},
          (code, stdout, stderr) => {
            // Run the provided callback function.
            callback(file, code, stdout, stderr);
            // Note in the progress bar another file being completed.
            progressBar.increment(1);
            // If more files exist in the list, run again to work on the next file,
            // using the same slot.
            if (files.length) {
              return runCommandInThread(thread);
            }
            // If not more files are available, mark the thread as unused.
            threads[thread] = false;
            // If all of the threads are false, as they are unused, mark the progress bar
            // completed and resolve the promise.
            if (threads.every(active => !active)) {
              progressBar.stop();
              resolve();
            }
          },
      );
      // Mark the thread as in use as the command execution has been started.
      threads[thread] = true;
    }

    // Start the progress bar
    progressBar.start(files.length, 0);
    // Start running the command on files from the least in each available thread.
    threads.forEach((_, idx) => runCommandInThread(idx));
  });
}
