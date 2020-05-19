/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {MessageFromWorker, MessageToWorker} from './api';



/** Expose a `Promise` instance as well as APIs for resolving/rejecting it. */
export class Deferred<T> {
  /**
   * Resolve the associated promise with the specified value.
   * If the value is a rejection (constructed with `Promise.reject()`), the promise will be rejected
   * instead.
   *
   * @param value The value to resolve the promise with.
   */
  resolve!: (value: T) => void;

  /**
   * Rejects the associated promise with the specified reason.
   *
   * @param reason The rejection reason.
   */
  reject!: (reason: any) => void;

  /** The `Promise` instance associated with this deferred. */
  promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}

/**
 * Send a message to the cluster master.
 * (This function should be invoked from cluster workers only.)
 *
 * @param msg The message to send to the cluster master.
 * @return A promise that is resolved once the message has been sent.
 */
export const sendMessageToMaster = (msg: MessageFromWorker): Promise<void> => {
  if (cluster.isMaster) {
    throw new Error('Unable to send message to the master process: Already on the master process.');
  }

  return new Promise((resolve, reject) => {
    if (process.send === undefined) {
      // Theoretically, this should never happen on a worker process.
      throw new Error('Unable to send message to the master process: Missing `process.send()`.');
    }

    process.send(msg, (err: Error|null) => (err === null) ? resolve() : reject(err));
  });
};

/**
 * Send a message to a cluster worker.
 * (This function should be invoked from the cluster master only.)
 *
 * @param workerId The ID of the recipient worker.
 * @param msg The message to send to the worker.
 * @return A promise that is resolved once the message has been sent.
 */
export const sendMessageToWorker = (workerId: number, msg: MessageToWorker): Promise<void> => {
  if (!cluster.isMaster) {
    throw new Error('Unable to send message to worker process: Sender is not the master process.');
  }

  const worker = cluster.workers[workerId];

  if ((worker === undefined) || worker.isDead() || !worker.isConnected()) {
    throw new Error(
        'Unable to send message to worker process: Recipient does not exist or has disconnected.');
  }

  return new Promise((resolve, reject) => {
    worker.send(msg, (err: Error|null) => (err === null) ? resolve() : reject(err));
  });
};
