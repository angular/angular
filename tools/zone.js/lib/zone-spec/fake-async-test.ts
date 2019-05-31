/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

(function(global: any) {
interface ScheduledFunction {
  endTime: number;
  id: number;
  func: Function;
  args: any[];
  delay: number;
  isPeriodic: boolean;
  isRequestAnimationFrame: boolean;
}

interface MicroTaskScheduledFunction {
  func: Function;
  args?: any[];
  target: any;
}

interface MacroTaskOptions {
  source: string;
  isPeriodic?: boolean;
  callbackArgs?: any;
}

const OriginalDate = global.Date;
class FakeDate {
  constructor() {
    if (arguments.length === 0) {
      const d = new OriginalDate();
      d.setTime(FakeDate.now());
      return d;
    } else {
      const args = Array.prototype.slice.call(arguments);
      return new OriginalDate(...args);
    }
  }

  static now() {
    const fakeAsyncTestZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
    if (fakeAsyncTestZoneSpec) {
      return fakeAsyncTestZoneSpec.getCurrentRealTime() + fakeAsyncTestZoneSpec.getCurrentTime();
    }
    return OriginalDate.now.apply(this, arguments);
  }
}

(FakeDate as any).UTC = OriginalDate.UTC;
(FakeDate as any).parse = OriginalDate.parse;

// keep a reference for zone patched timer function
const timers = {
  setTimeout: global.setTimeout,
  setInterval: global.setInterval,
  clearTimeout: global.clearTimeout,
  clearInterval: global.clearInterval
};

class Scheduler {
  // Next scheduler id.
  public static nextId: number = 1;

  // Scheduler queue with the tuple of end time and callback function - sorted by end time.
  private _schedulerQueue: ScheduledFunction[] = [];
  // Current simulated time in millis.
  private _currentTime: number = 0;
  // Current real time in millis.
  private _currentRealTime: number = OriginalDate.now();

  constructor() {}

  getCurrentTime() {
    return this._currentTime;
  }

  getCurrentRealTime() {
    return this._currentRealTime;
  }

  setCurrentRealTime(realTime: number) {
    this._currentRealTime = realTime;
  }

  scheduleFunction(
      cb: Function, delay: number, args: any[] = [], isPeriodic: boolean = false,
      isRequestAnimationFrame: boolean = false, id: number = -1): number {
    let currentId: number = id < 0 ? Scheduler.nextId++ : id;
    let endTime = this._currentTime + delay;

    // Insert so that scheduler queue remains sorted by end time.
    let newEntry: ScheduledFunction = {
      endTime: endTime,
      id: currentId,
      func: cb,
      args: args,
      delay: delay,
      isPeriodic: isPeriodic,
      isRequestAnimationFrame: isRequestAnimationFrame
    };
    let i = 0;
    for (; i < this._schedulerQueue.length; i++) {
      let currentEntry = this._schedulerQueue[i];
      if (newEntry.endTime < currentEntry.endTime) {
        break;
      }
    }
    this._schedulerQueue.splice(i, 0, newEntry);
    return currentId;
  }

  removeScheduledFunctionWithId(id: number): void {
    for (let i = 0; i < this._schedulerQueue.length; i++) {
      if (this._schedulerQueue[i].id == id) {
        this._schedulerQueue.splice(i, 1);
        break;
      }
    }
  }

  tick(millis: number = 0, doTick?: (elapsed: number) => void): void {
    let finalTime = this._currentTime + millis;
    let lastCurrentTime = 0;
    if (this._schedulerQueue.length === 0 && doTick) {
      doTick(millis);
      return;
    }
    while (this._schedulerQueue.length > 0) {
      let current = this._schedulerQueue[0];
      if (finalTime < current.endTime) {
        // Done processing the queue since it's sorted by endTime.
        break;
      } else {
        // Time to run scheduled function. Remove it from the head of queue.
        let current = this._schedulerQueue.shift()!;
        lastCurrentTime = this._currentTime;
        this._currentTime = current.endTime;
        if (doTick) {
          doTick(this._currentTime - lastCurrentTime);
        }
        let retval = current.func.apply(
            global, current.isRequestAnimationFrame ? [this._currentTime] : current.args);
        if (!retval) {
          // Uncaught exception in the current scheduled function. Stop processing the queue.
          break;
        }
      }
    }
    lastCurrentTime = this._currentTime;
    this._currentTime = finalTime;
    if (doTick) {
      doTick(this._currentTime - lastCurrentTime);
    }
  }

  flush(limit = 20, flushPeriodic = false, doTick?: (elapsed: number) => void): number {
    if (flushPeriodic) {
      return this.flushPeriodic(doTick);
    } else {
      return this.flushNonPeriodic(limit, doTick);
    }
  }

  private flushPeriodic(doTick?: (elapsed: number) => void): number {
    if (this._schedulerQueue.length === 0) {
      return 0;
    }
    // Find the last task currently queued in the scheduler queue and tick
    // till that time.
    const startTime = this._currentTime;
    const lastTask = this._schedulerQueue[this._schedulerQueue.length - 1];
    this.tick(lastTask.endTime - startTime, doTick);
    return this._currentTime - startTime;
  }

  private flushNonPeriodic(limit: number, doTick?: (elapsed: number) => void): number {
    const startTime = this._currentTime;
    let lastCurrentTime = 0;
    let count = 0;
    while (this._schedulerQueue.length > 0) {
      count++;
      if (count > limit) {
        throw new Error(
            'flush failed after reaching the limit of ' + limit +
            ' tasks. Does your code use a polling timeout?');
      }

      // flush only non-periodic timers.
      // If the only remaining tasks are periodic(or requestAnimationFrame), finish flushing.
      if (this._schedulerQueue.filter(task => !task.isPeriodic && !task.isRequestAnimationFrame)
              .length === 0) {
        break;
      }

      const current = this._schedulerQueue.shift()!;
      lastCurrentTime = this._currentTime;
      this._currentTime = current.endTime;
      if (doTick) {
        // Update any secondary schedulers like Jasmine mock Date.
        doTick(this._currentTime - lastCurrentTime);
      }
      const retval = current.func.apply(global, current.args);
      if (!retval) {
        // Uncaught exception in the current scheduled function. Stop processing the queue.
        break;
      }
    }
    return this._currentTime - startTime;
  }
}

class FakeAsyncTestZoneSpec implements ZoneSpec {
  static assertInZone(): void {
    if (Zone.current.get('FakeAsyncTestZoneSpec') == null) {
      throw new Error('The code should be running in the fakeAsync zone to call this function');
    }
  }

  private _scheduler: Scheduler = new Scheduler();
  private _microtasks: MicroTaskScheduledFunction[] = [];
  private _lastError: Error|null = null;
  private _uncaughtPromiseErrors: {rejection: any}[] =
      (Promise as any)[(Zone as any).__symbol__('uncaughtPromiseErrors')];

  pendingPeriodicTimers: number[] = [];
  pendingTimers: number[] = [];

  private patchDateLocked = false;

  constructor(
      namePrefix: string, private trackPendingRequestAnimationFrame = false,
      private macroTaskOptions?: MacroTaskOptions[]) {
    this.name = 'fakeAsyncTestZone for ' + namePrefix;
    // in case user can't access the construction of FakeAsyncTestSpec
    // user can also define macroTaskOptions by define a global variable.
    if (!this.macroTaskOptions) {
      this.macroTaskOptions = global[Zone.__symbol__('FakeAsyncTestMacroTask')];
    }
  }

  private _fnAndFlush(fn: Function, completers: {onSuccess?: Function, onError?: Function}):
      Function {
    return (...args: any[]): boolean => {
      fn.apply(global, args);

      if (this._lastError === null) {  // Success
        if (completers.onSuccess != null) {
          completers.onSuccess.apply(global);
        }
        // Flush microtasks only on success.
        this.flushMicrotasks();
      } else {  // Failure
        if (completers.onError != null) {
          completers.onError.apply(global);
        }
      }
      // Return true if there were no errors, false otherwise.
      return this._lastError === null;
    };
  }

  private static _removeTimer(timers: number[], id: number): void {
    let index = timers.indexOf(id);
    if (index > -1) {
      timers.splice(index, 1);
    }
  }

  private _dequeueTimer(id: number): Function {
    return () => {
      FakeAsyncTestZoneSpec._removeTimer(this.pendingTimers, id);
    };
  }

  private _requeuePeriodicTimer(fn: Function, interval: number, args: any[], id: number): Function {
    return () => {
      // Requeue the timer callback if it's not been canceled.
      if (this.pendingPeriodicTimers.indexOf(id) !== -1) {
        this._scheduler.scheduleFunction(fn, interval, args, true, false, id);
      }
    };
  }

  private _dequeuePeriodicTimer(id: number): Function {
    return () => {
      FakeAsyncTestZoneSpec._removeTimer(this.pendingPeriodicTimers, id);
    };
  }

  private _setTimeout(fn: Function, delay: number, args: any[], isTimer = true): number {
    let removeTimerFn = this._dequeueTimer(Scheduler.nextId);
    // Queue the callback and dequeue the timer on success and error.
    let cb = this._fnAndFlush(fn, {onSuccess: removeTimerFn, onError: removeTimerFn});
    let id = this._scheduler.scheduleFunction(cb, delay, args, false, !isTimer);
    if (isTimer) {
      this.pendingTimers.push(id);
    }
    return id;
  }

  private _clearTimeout(id: number): void {
    FakeAsyncTestZoneSpec._removeTimer(this.pendingTimers, id);
    this._scheduler.removeScheduledFunctionWithId(id);
  }

  private _setInterval(fn: Function, interval: number, args: any[]): number {
    let id = Scheduler.nextId;
    let completers = {onSuccess: null as any, onError: this._dequeuePeriodicTimer(id)};
    let cb = this._fnAndFlush(fn, completers);

    // Use the callback created above to requeue on success.
    completers.onSuccess = this._requeuePeriodicTimer(cb, interval, args, id);

    // Queue the callback and dequeue the periodic timer only on error.
    this._scheduler.scheduleFunction(cb, interval, args, true);
    this.pendingPeriodicTimers.push(id);
    return id;
  }

  private _clearInterval(id: number): void {
    FakeAsyncTestZoneSpec._removeTimer(this.pendingPeriodicTimers, id);
    this._scheduler.removeScheduledFunctionWithId(id);
  }

  private _resetLastErrorAndThrow(): void {
    let error = this._lastError || this._uncaughtPromiseErrors[0];
    this._uncaughtPromiseErrors.length = 0;
    this._lastError = null;
    throw error;
  }

  getCurrentTime() {
    return this._scheduler.getCurrentTime();
  }

  getCurrentRealTime() {
    return this._scheduler.getCurrentRealTime();
  }

  setCurrentRealTime(realTime: number) {
    this._scheduler.setCurrentRealTime(realTime);
  }

  static patchDate() {
    if (!!global[Zone.__symbol__('disableDatePatching')]) {
      // we don't want to patch global Date
      // because in some case, global Date
      // is already being patched, we need to provide
      // an option to let user still use their
      // own version of Date.
      return;
    }

    if (global['Date'] === FakeDate) {
      // already patched
      return;
    }
    global['Date'] = FakeDate;
    FakeDate.prototype = OriginalDate.prototype;

    // try check and reset timers
    // because jasmine.clock().install() may
    // have replaced the global timer
    FakeAsyncTestZoneSpec.checkTimerPatch();
  }

  static resetDate() {
    if (global['Date'] === FakeDate) {
      global['Date'] = OriginalDate;
    }
  }

  static checkTimerPatch() {
    if (global.setTimeout !== timers.setTimeout) {
      global.setTimeout = timers.setTimeout;
      global.clearTimeout = timers.clearTimeout;
    }
    if (global.setInterval !== timers.setInterval) {
      global.setInterval = timers.setInterval;
      global.clearInterval = timers.clearInterval;
    }
  }

  lockDatePatch() {
    this.patchDateLocked = true;
    FakeAsyncTestZoneSpec.patchDate();
  }
  unlockDatePatch() {
    this.patchDateLocked = false;
    FakeAsyncTestZoneSpec.resetDate();
  }

  tick(millis: number = 0, doTick?: (elapsed: number) => void): void {
    FakeAsyncTestZoneSpec.assertInZone();
    this.flushMicrotasks();
    this._scheduler.tick(millis, doTick);
    if (this._lastError !== null) {
      this._resetLastErrorAndThrow();
    }
  }

  flushMicrotasks(): void {
    FakeAsyncTestZoneSpec.assertInZone();
    const flushErrors = () => {
      if (this._lastError !== null || this._uncaughtPromiseErrors.length) {
        // If there is an error stop processing the microtask queue and rethrow the error.
        this._resetLastErrorAndThrow();
      }
    };
    while (this._microtasks.length > 0) {
      let microtask = this._microtasks.shift()!;
      microtask.func.apply(microtask.target, microtask.args);
    }
    flushErrors();
  }

  flush(limit?: number, flushPeriodic?: boolean, doTick?: (elapsed: number) => void): number {
    FakeAsyncTestZoneSpec.assertInZone();
    this.flushMicrotasks();
    const elapsed = this._scheduler.flush(limit, flushPeriodic, doTick);
    if (this._lastError !== null) {
      this._resetLastErrorAndThrow();
    }
    return elapsed;
  }

  // ZoneSpec implementation below.

  name: string;

  properties: {[key: string]: any} = {'FakeAsyncTestZoneSpec': this};

  onScheduleTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task {
    switch (task.type) {
      case 'microTask':
        let args = task.data && (task.data as any).args;
        // should pass additional arguments to callback if have any
        // currently we know process.nextTick will have such additional
        // arguments
        let additionalArgs: any[]|undefined;
        if (args) {
          let callbackIndex = (task.data as any).cbIdx;
          if (typeof args.length === 'number' && args.length > callbackIndex + 1) {
            additionalArgs = Array.prototype.slice.call(args, callbackIndex + 1);
          }
        }
        this._microtasks.push({
          func: task.invoke,
          args: additionalArgs,
          target: task.data && (task.data as any).target
        });
        break;
      case 'macroTask':
        switch (task.source) {
          case 'setTimeout':
            task.data!['handleId'] = this._setTimeout(
                task.invoke, task.data!['delay']!,
                Array.prototype.slice.call((task.data as any)['args'], 2));
            break;
          case 'setImmediate':
            task.data!['handleId'] = this._setTimeout(
                task.invoke, 0, Array.prototype.slice.call((task.data as any)['args'], 1));
            break;
          case 'setInterval':
            task.data!['handleId'] = this._setInterval(
                task.invoke, task.data!['delay']!,
                Array.prototype.slice.call((task.data as any)['args'], 2));
            break;
          case 'XMLHttpRequest.send':
            throw new Error(
                'Cannot make XHRs from within a fake async test. Request URL: ' +
                (task.data as any)['url']);
          case 'requestAnimationFrame':
          case 'webkitRequestAnimationFrame':
          case 'mozRequestAnimationFrame':
            // Simulate a requestAnimationFrame by using a setTimeout with 16 ms.
            // (60 frames per second)
            task.data!['handleId'] = this._setTimeout(
                task.invoke, 16, (task.data as any)['args'],
                this.trackPendingRequestAnimationFrame);
            break;
          default:
            // user can define which macroTask they want to support by passing
            // macroTaskOptions
            const macroTaskOption = this.findMacroTaskOption(task);
            if (macroTaskOption) {
              const args = task.data && (task.data as any)['args'];
              const delay = args && args.length > 1 ? args[1] : 0;
              let callbackArgs = macroTaskOption.callbackArgs ? macroTaskOption.callbackArgs : args;
              if (!!macroTaskOption.isPeriodic) {
                // periodic macroTask, use setInterval to simulate
                task.data!['handleId'] = this._setInterval(task.invoke, delay, callbackArgs);
                task.data!.isPeriodic = true;
              } else {
                // not periodic, use setTimeout to simulate
                task.data!['handleId'] = this._setTimeout(task.invoke, delay, callbackArgs);
              }
              break;
            }
            throw new Error('Unknown macroTask scheduled in fake async test: ' + task.source);
        }
        break;
      case 'eventTask':
        task = delegate.scheduleTask(target, task);
        break;
    }
    return task;
  }

  onCancelTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): any {
    switch (task.source) {
      case 'setTimeout':
      case 'requestAnimationFrame':
      case 'webkitRequestAnimationFrame':
      case 'mozRequestAnimationFrame':
        return this._clearTimeout(<number>task.data!['handleId']);
      case 'setInterval':
        return this._clearInterval(<number>task.data!['handleId']);
      default:
        // user can define which macroTask they want to support by passing
        // macroTaskOptions
        const macroTaskOption = this.findMacroTaskOption(task);
        if (macroTaskOption) {
          const handleId: number = <number>task.data!['handleId'];
          return macroTaskOption.isPeriodic ? this._clearInterval(handleId) :
                                              this._clearTimeout(handleId);
        }
        return delegate.cancelTask(target, task);
    }
  }

  onInvoke(
      delegate: ZoneDelegate, current: Zone, target: Zone, callback: Function, applyThis: any,
      applyArgs?: any[], source?: string): any {
    try {
      FakeAsyncTestZoneSpec.patchDate();
      return delegate.invoke(target, callback, applyThis, applyArgs, source);
    } finally {
      if (!this.patchDateLocked) {
        FakeAsyncTestZoneSpec.resetDate();
      }
    }
  }

  findMacroTaskOption(task: Task) {
    if (!this.macroTaskOptions) {
      return null;
    }
    for (let i = 0; i < this.macroTaskOptions.length; i++) {
      const macroTaskOption = this.macroTaskOptions[i];
      if (macroTaskOption.source === task.source) {
        return macroTaskOption;
      }
    }
    return null;
  }

  onHandleError(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any):
      boolean {
    this._lastError = error;
    return false;  // Don't propagate error to parent zone.
  }
}

// Export the class so that new instances can be created with proper
// constructor params.
(Zone as any)['FakeAsyncTestZoneSpec'] = FakeAsyncTestZoneSpec;
})(global);
