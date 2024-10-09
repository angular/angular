/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

interface ConsoleWithAsyncTagging {
  createTask(name: string): ConsoleTask;
}

interface ConsoleTask {
  run<T>(f: () => T): T;
}

interface ZoneConsoleTask extends Task {
  consoleTask?: ConsoleTask;
}

export class AsyncStackTaggingZoneSpec implements ZoneSpec {
  createTask: ConsoleWithAsyncTagging['createTask'];

  constructor(
    namePrefix: string,
    consoleAsyncStackTaggingImpl: ConsoleWithAsyncTagging = console as any,
  ) {
    this.name = 'asyncStackTagging for ' + namePrefix;
    this.createTask = consoleAsyncStackTaggingImpl?.createTask ?? (() => null);
  }

  // ZoneSpec implementation below.
  name: string;

  onScheduleTask(
    delegate: ZoneDelegate,
    _current: Zone,
    target: Zone,
    task: ZoneConsoleTask,
  ): Task {
    task.consoleTask = this.createTask(`Zone - ${task.source || task.type}`);
    return delegate.scheduleTask(target, task);
  }

  onInvokeTask(
    delegate: ZoneDelegate,
    _currentZone: Zone,
    targetZone: Zone,
    task: ZoneConsoleTask,
    applyThis: any,
    applyArgs?: any[],
  ) {
    let ret;
    if (task.consoleTask) {
      ret = task.consoleTask.run(() => delegate.invokeTask(targetZone, task, applyThis, applyArgs));
    } else {
      ret = delegate.invokeTask(targetZone, task, applyThis, applyArgs);
    }
    return ret;
  }
}
