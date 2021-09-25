/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />

import cluster from 'cluster';

import {Logger} from '../../../../src/ngtsc/logging';
import {CreateCompileFn} from '../api';
import {stringifyTask} from '../tasks/utils';

import {MessageToWorker} from './api';
import {sendMessageToMaster} from './utils';

export async function startWorker(logger: Logger, createCompileFn: CreateCompileFn): Promise<void> {
  if (cluster.isMaster) {
    throw new Error('Tried to run cluster worker on the master process.');
  }

  const compile = createCompileFn(
      transformedFiles => sendMessageToMaster({
        type: 'transformed-files',
        files: transformedFiles.map(f => f.path),
      }),
      (_task, outcome, message) => sendMessageToMaster({type: 'task-completed', outcome, message}));


  // Listen for `ProcessTaskMessage`s and process tasks.
  cluster.worker.on('message', async (msg: MessageToWorker) => {
    try {
      switch (msg.type) {
        case 'process-task':
          logger.debug(
              `[Worker #${cluster.worker.id}] Processing task: ${stringifyTask(msg.task)}`);
          return await compile(msg.task);
        default:
          throw new Error(
              `[Worker #${cluster.worker.id}] Invalid message received: ${JSON.stringify(msg)}`);
      }
    } catch (err) {
      switch (err && err.code) {
        case 'ENOMEM':
          // Not being able to allocate enough memory is not necessarily a problem with processing
          // the current task. It could just mean that there are too many tasks being processed
          // simultaneously.
          //
          // Exit with an error and let the cluster master decide how to handle this.
          logger.warn(`[Worker #${cluster.worker.id}] ${err.stack || err.message}`);
          return process.exit(1);
        default:
          await sendMessageToMaster({
            type: 'error',
            error: (err instanceof Error) ? (err.stack || err.message) : err,
          });
      }
    }
  });

  // Return a promise that is never resolved.
  return new Promise(() => undefined);
}
