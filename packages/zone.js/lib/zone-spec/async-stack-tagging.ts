/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface Console {
  scheduleAsyncTask(name: string, recurring?: boolean): number;
  startAsyncTask(task: number): void;
  finishAsyncTask(task: number): void;
  cancelAsyncTask(task: number): void;
}

interface Task {
  asyncId?: number;
}

class AsyncStackTaggingZoneSpec implements ZoneSpec {
  scheduleAsyncTask: Console['scheduleAsyncTask'];
  startAsyncTask: Console['startAsyncTask'];
  finishAsyncTask: Console['finishAsyncTask'];
  cancelAsyncTask: Console['finishAsyncTask'];

  constructor(namePrefix: string, consoleAsyncStackTaggingImpl: Console = console) {
    this.name = 'asyncStackTagging for ' + namePrefix;
    this.scheduleAsyncTask = consoleAsyncStackTaggingImpl?.scheduleAsyncTask ?? (() => {});
    this.startAsyncTask = consoleAsyncStackTaggingImpl?.startAsyncTask ?? (() => {});
    this.finishAsyncTask = consoleAsyncStackTaggingImpl?.finishAsyncTask ?? (() => {});
    this.cancelAsyncTask = consoleAsyncStackTaggingImpl?.cancelAsyncTask ?? (() => {});
  }

  // ZoneSpec implementation below.

  name: string;

  onScheduleTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task {
    task.asyncId = this.scheduleAsyncTask(
        task.source || task.type, task.data?.isPeriodic || task.type === 'eventTask');
    return delegate.scheduleTask(target, task);
  }

  onInvokeTask(
      delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task, applyThis: any,
      applyArgs?: any[]) {
    task.asyncId && this.startAsyncTask(task.asyncId);
    try {
      return delegate.invokeTask(targetZone, task, applyThis, applyArgs);
    } finally {
      task.asyncId && this.finishAsyncTask(task.asyncId);
      if (task.type !== 'eventTask' && !task.data?.isPeriodic) {
        task.asyncId = undefined;
      }
    }
  }

  onCancelTask(delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) {
    task.asyncId && this.cancelAsyncTask(task.asyncId);
    task.asyncId = undefined;
    return delegate.cancelTask(targetZone, task);
  }
}

// Export the class so that new instances can be created with proper
// constructor params.
(Zone as any)['AsyncStackTaggingZoneSpec'] = AsyncStackTaggingZoneSpec;
