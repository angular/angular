/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {Logger} from '../../logging/logger';
import {CompileFn, CreateCompileFn} from '../api';
import {stringifyTask} from '../utils';

import {MessageToWorker} from './api';
import {sendMessageToMaster} from './utils';


/**
 * A cluster worker is responsible for processing one task (i.e. one format property for a specific
 * entry-point) at a time and reporting results back to the cluster master.
 */
export class ClusterWorker {
  private compile: CompileFn;

  constructor(private logger: Logger, createCompileFn: CreateCompileFn) {
    if (cluster.isMaster) {
      throw new Error('Tried to instantiate `ClusterWorker` on the master process.');
    }

    this.compile = createCompileFn(
        (_task, outcome, message) =>
            sendMessageToMaster({type: 'task-completed', outcome, message}));
  }

  run(): Promise<void> {
    // Listen for `ProcessTaskMessage`s and process tasks.
    cluster.worker.on('message', (msg: MessageToWorker) => {
      try {
        switch (msg.type) {
          case 'process-task':
            this.logger.debug(
                `[Worker #${cluster.worker.id}] Processing task: ${stringifyTask(msg.task)}`);
            return this.compile(msg.task);
          default:
            throw new Error(
                `[Worker #${cluster.worker.id}] Invalid message received: ${JSON.stringify(msg)}`);
        }
      } catch (err) {
        sendMessageToMaster({
          type: 'error',
          error: (err instanceof Error) ? (err.stack || err.message) : err,
        });
      }
    });

    // Return a promise that is never resolved.
    return new Promise(() => undefined);
  }
}
