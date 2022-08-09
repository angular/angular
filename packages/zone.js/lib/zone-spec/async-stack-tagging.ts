/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface Console {
  createTask(name: string): ConsoleTask;
}

interface ConsoleTask {
  run<T>(f: () => T): T;
}

interface Task {
  consoleTask?: ConsoleTask;
}

class AsyncStackTaggingZoneSpec implements ZoneSpec {
  createTask: Console['createTask'];

  constructor(namePrefix: string, consoleAsyncStackTaggingImpl: Console = console) {
    this.name = 'asyncStackTagging for ' + namePrefix;
    this.createTask = consoleAsyncStackTaggingImpl?.createTask ?? (() => {});
  }

  // ZoneSpec implementation below.

  name: string;

  onScheduleTask(delegate: ZoneDelegate, _current: Zone, target: Zone, task: Task): Task {
    task.consoleTask = this.createTask(`Zone - ${task.source || task.type}`);
    return delegate.scheduleTask(target, task);
  }

  onInvokeTask(
      delegate: ZoneDelegate, _currentZone: Zone, targetZone: Zone, task: Task, applyThis: any,
      applyArgs?: any[]) {
    let ret;
    if (task.consoleTask) {
      ret = task.consoleTask.run(() => delegate.invokeTask(targetZone, task, applyThis, applyArgs));
    } else {
      ret = delegate.invokeTask(targetZone, task, applyThis, applyArgs);
    }
    return ret;
  }
}

// Export the class so that new instances can be created with proper
// constructor params.
(Zone as any)['AsyncStackTaggingZoneSpec'] = AsyncStackTaggingZoneSpec;
