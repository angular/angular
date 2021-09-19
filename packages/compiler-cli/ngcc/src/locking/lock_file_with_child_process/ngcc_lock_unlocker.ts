/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodeJSFileSystem} from '../../../../src/ngtsc/file_system';
import {ConsoleLogger} from '../../../../src/ngtsc/logging';
import {removeLockFile} from './util';

/// <reference types="node" />

// This file is an entry-point for the child-process that is started by `LockFileWithChildProcess`
// to ensure that the lock-file is removed when the primary process exits unexpectedly.

// We have no choice but to use the node.js file-system here since we are in a separate process
// from the main ngcc run, which may be running a mock file-system from within a test.
const fs = new NodeJSFileSystem();

// We create a logger that has the same logging level as the parent process, since it should have
// been passed through as one of the args
const logLevel = parseInt(process.argv.pop()!, 10);
const logger = new ConsoleLogger(logLevel);

// We must store the parent PID now as it changes if the parent process is killed early
const ppid = process.ppid.toString();

// The path to the lock-file to remove should have been passed as one of the args
const lockFilePath = fs.resolve(process.argv.pop()!);

logger.debug(`Starting unlocker at process ${process.pid} on behalf of process ${ppid}`);
logger.debug(`The lock-file path is ${lockFilePath}`);

/**
 * When the parent process exits (for whatever reason) remove the loc-file if it exists and as long
 * as it was one that was created by the parent process.
 */
process.on('disconnect', () => {
  removeLockFile(fs, logger, lockFilePath, ppid);
});
