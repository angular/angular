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
  if (cluster.isMaster || !cluster.worker) {
    throw new Error('Tried to run cluster worker on the master process.');
  }

  const worker = cluster.worker;
  const compile = createCompileFn(
      transformedFiles => sendMessageToMaster({
        type: 'transformed-files',
        files: transformedFiles.map(f => f.path),
      }),
      (_task, outcome, message) => sendMessageToMaster({type: 'task-completed', outcome, message}));

  // Listen for `ProcessTaskMessage`s and process tasks.
  worker.on('message', async (msg: MessageToWorker) => {
    try {
      switch (msg.type) {
        case 'process-task':
          logger.debug(`[Worker #${worker.id}] Processing task: ${stringifyTask(msg.task)}`);
          return await compile(msg.task);
        default:
          throw new Error(
              `[Worker #${worker.id}] Invalid message received: ${JSON.stringify(msg)}`);
      }
    } catch (err: any) {
      switch (err && err.code) {
        case 'ENOMEM':
          // Not being able to allocate enough memory is not necessarily a problem with processing
          // the current task. It could just mean that there are too many tasks being processed
          // simultaneously.
          //
          // Exit with an error and let the cluster master decide how to handle this.
          logger.warn(`[Worker #${worker.id}] ${err.stack || err.message}`);
          return process.exit(1);
        default:
          await sendMessageToMaster({
            type: 'error',
            error: (err instanceof Error) ? (err.stack || err.message) : err,
          });
      }
    }
  });

  // Notify the master that the worker is now ready and can receive messages.
  await sendMessageToMaster({type: 'ready'});


  // Return a promise that is never resolved.
  return new Promise(() => undefined);
}
