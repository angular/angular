/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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

interface MacroTaskOptions {
  source: string;
  isPeriodic?: boolean;
  callbackArgs?: any;
}

const OriginalDate = global.Date;
// Since when we compile this file to `es2015`, and if we define
// this `FakeDate` as `class FakeDate`, and then set `FakeDate.prototype`
// there will be an error which is `Cannot assign to read only property 'prototype'`
// so we need to use function implementation here.
function FakeDate() {
  if (arguments.length === 0) {
    const d = new OriginalDate();
    d.setTime(FakeDate.now());
    return d;
  } else {
    const args = Array.prototype.slice.call(arguments);
    return new OriginalDate(...args);
  }
}

FakeDate.now = function(this: unknown) {
  const fakeTimeTestZoneSpec = Zone.current.get('FakeTimeTestZoneSpec');
  if (fakeTimeTestZoneSpec) {
    return fakeTimeTestZoneSpec.getFakeSystemTime();
  }
  return OriginalDate.now.apply(this, arguments);
};

FakeDate.UTC = OriginalDate.UTC;
FakeDate.parse = OriginalDate.parse;

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
  private _currentTickClockTime: number = 0;
  // Current fake system base time in millis.
  private _currentFakeBaseSystemTime: number = OriginalDate.now();
  // track requeuePeriodicTimer
  private _currentTickClockRequeuePeriodicEntries: any[] = [];

  constructor() {}

  getCurrentTickClockTime() {
    return this._currentTickClockTime;
  }

  getFakeSystemTime() {
    return this._currentFakeBaseSystemTime + this._currentTickClockTime;
  }

  setFakeBaseSystemTime(fakeBaseSystemTime: number) {
    this._currentFakeBaseSystemTime = fakeBaseSystemTime;
  }

  getRealSystemTime() {
    return OriginalDate.now();
  }

  scheduleFunction(cb: Function, delay: number, options?: {
    args?: any[],
    isPeriodic?: boolean,
    isRequestAnimationFrame?: boolean,
    id?: number,
    isRequeuePeriodic?: boolean
  }): number {
    options = {
      ...{
        args: [],
        isPeriodic: false,
        isRequestAnimationFrame: false,
        id: -1,
        isRequeuePeriodic: false
      },
      ...options
    };
    let currentId = options.id! < 0 ? Scheduler.nextId++ : options.id!;
    let endTime = this._currentTickClockTime + delay;

    // Insert so that scheduler queue remains sorted by end time.
    let newEntry: ScheduledFunction = {
      endTime: endTime,
      id: currentId,
      func: cb,
      args: options.args!,
      delay: delay,
      isPeriodic: options.isPeriodic!,
      isRequestAnimationFrame: options.isRequestAnimationFrame!
    };
    if (options.isRequeuePeriodic!) {
      this._currentTickClockRequeuePeriodicEntries.push(newEntry);
    }
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

  removeAll(): void {
    this._schedulerQueue = [];
  }

  getTimerCount(): number {
    return this._schedulerQueue.length;
  }

  tickClockToNext(step: number = 1, doTickClock?: (elapsed: number) => void, tickClockOptions?: {
    processNewMacroTasksSynchronously: boolean
  }) {
    if (this._schedulerQueue.length < step) {
      return;
    }
    // Find the last task currently queued in the scheduler queue and tickClock
    // till that time.
    const startTime = this._currentTickClockTime;
    const targetTask = this._schedulerQueue[step - 1];
    this.tickClock(targetTask.endTime - startTime, doTickClock, tickClockOptions);
  }

  async tickClock(millis: number = 0, doTickClock?: (elapsed: number) => void, tickClockOptions?: {
    processNewMacroTasksSynchronously: boolean
  }): Promise<void> {
    let finalTime = this._currentTickClockTime + millis;
    let lastCurrentTime = 0;
    tickClockOptions = Object.assign({processNewMacroTasksSynchronously: true}, tickClockOptions);
    // we need to copy the schedulerQueue so nested timeout
    // will not be wrongly called in the current tickClock
    // https://github.com/angular/angular/issues/33799
    const schedulerQueue = tickClockOptions.processNewMacroTasksSynchronously ?
        this._schedulerQueue :
        this._schedulerQueue.slice();
    if (schedulerQueue.length === 0 && doTickClock) {
      doTickClock(millis);
      return;
    }
    while (schedulerQueue.length > 0) {
      // clear requeueEntries before each loop
      this._currentTickClockRequeuePeriodicEntries = [];
      let current = schedulerQueue[0];
      if (finalTime < current.endTime) {
        // Done processing the queue since it's sorted by endTime.
        break;
      } else {
        // Time to run scheduled function. Remove it from the head of queue.
        let current = schedulerQueue.shift()!;
        if (!tickClockOptions.processNewMacroTasksSynchronously) {
          const idx = this._schedulerQueue.indexOf(current);
          if (idx >= 0) {
            this._schedulerQueue.splice(idx, 1);
          }
        }
        lastCurrentTime = this._currentTickClockTime;
        this._currentTickClockTime = current.endTime;
        if (doTickClock) {
          doTickClock(this._currentTickClockTime - lastCurrentTime);
        }
        let retval = await current.func.apply(
            global, current.isRequestAnimationFrame ? [this._currentTickClockTime] : current.args);
        if (!retval) {
          // Uncaught exception in the current scheduled function. Stop processing the queue.
          break;
        }

        // check is there any requeue periodic entry is added in
        // current loop, if there is, we need to add to current loop
        if (!tickClockOptions.processNewMacroTasksSynchronously) {
          this._currentTickClockRequeuePeriodicEntries.forEach(newEntry => {
            let i = 0;
            for (; i < schedulerQueue.length; i++) {
              const currentEntry = schedulerQueue[i];
              if (newEntry.endTime < currentEntry.endTime) {
                break;
              }
            }
            schedulerQueue.splice(i, 0, newEntry);
          });
        }
      }
    }
    lastCurrentTime = this._currentTickClockTime;
    this._currentTickClockTime = finalTime;
    if (doTickClock) {
      doTickClock(this._currentTickClockTime - lastCurrentTime);
    }
  }

  flushOnlyPendingTimers(doTickClock?: (elapsed: number) => void): number {
    if (this._schedulerQueue.length === 0) {
      return 0;
    }
    // Find the last task currently queued in the scheduler queue and tickClock
    // till that time.
    const startTime = this._currentTickClockTime;
    const lastTask = this._schedulerQueue[this._schedulerQueue.length - 1];
    this.tickClock(
        lastTask.endTime - startTime, doTickClock, {processNewMacroTasksSynchronously: false});
    return this._currentTickClockTime - startTime;
  }

  flush(limit = 20, flushPeriodic = false, doTickClock?: (elapsed: number) => void): number {
    if (flushPeriodic) {
      return this.flushPeriodic(doTickClock);
    } else {
      return this.flushNonPeriodic(limit, doTickClock);
    }
  }

  private flushPeriodic(doTickClock?: (elapsed: number) => void): number {
    if (this._schedulerQueue.length === 0) {
      return 0;
    }
    // Find the last task currently queued in the scheduler queue and tickClock
    // till that time.
    const startTime = this._currentTickClockTime;
    const lastTask = this._schedulerQueue[this._schedulerQueue.length - 1];
    this.tickClock(lastTask.endTime - startTime, doTickClock);
    return this._currentTickClockTime - startTime;
  }

  private flushNonPeriodic(limit: number, doTickClock?: (elapsed: number) => void): number {
    const startTime = this._currentTickClockTime;
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
      lastCurrentTime = this._currentTickClockTime;
      this._currentTickClockTime = current.endTime;
      if (doTickClock) {
        // Update any secondary schedulers like Jasmine mock Date.
        doTickClock(this._currentTickClockTime - lastCurrentTime);
      }
      const retval = current.func.apply(global, current.args);
      if (!retval) {
        // Uncaught exception in the current scheduled function. Stop processing the queue.
        break;
      }
    }
    return this._currentTickClockTime - startTime;
  }
}

class FakeTimeTestZoneSpec implements ZoneSpec {
  static assertInZone(): void {
    if (Zone.current.get('FakeTimeTestZoneSpec') == null) {
      throw new Error('The code should be running in the fakeTime zone to call this function');
    }
  }

  private _scheduler: Scheduler = new Scheduler();
  private _lastError: Error|null = null;
  private _uncaughtPromiseErrors: {rejection: any}[] =
      (Promise as any)[(Zone as any).__symbol__('uncaughtPromiseErrors')];

  pendingPeriodicTimers: number[] = [];
  pendingTimers: number[] = [];

  private patchDateLocked = false;

  constructor(
      namePrefix: string, private trackPendingRequestAnimationFrame = false,
      private macroTaskOptions?: MacroTaskOptions[]) {
    this.name = 'fakeTimeTestZone for ' + namePrefix;
    // in case user can't access the construction of FakeTimeTestSpec
    // user can also define macroTaskOptions by define a global variable.
    if (!this.macroTaskOptions) {
      this.macroTaskOptions = global[Zone.__symbol__('FakeTimeTestMacroTask')];
    }
  }

  private _fnAndFlush(fn: Function, completers: {onSuccess?: Function, onError?: Function}):
      Function {
    return async(...args: any[]): Promise<boolean> => {
      fn.apply(global, args);

      if (this._lastError === null) {  // Success
        if (completers.onSuccess != null) {
          completers.onSuccess.apply(global);
        }
        // Flush microtasks only on success.
        await this.flushMicrotasks();
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
      FakeTimeTestZoneSpec._removeTimer(this.pendingTimers, id);
    };
  }

  private _requeuePeriodicTimer(fn: Function, interval: number, args: any[], id: number): Function {
    return () => {
      // Requeue the timer callback if it's not been canceled.
      if (this.pendingPeriodicTimers.indexOf(id) !== -1) {
        this._scheduler.scheduleFunction(
            fn, interval, {args, isPeriodic: true, id, isRequeuePeriodic: true});
      }
    };
  }

  private _dequeuePeriodicTimer(id: number): Function {
    return () => {
      FakeTimeTestZoneSpec._removeTimer(this.pendingPeriodicTimers, id);
    };
  }

  private _setTimeout(fn: Function, delay: number, args: any[], isTimer = true): number {
    let removeTimerFn = this._dequeueTimer(Scheduler.nextId);
    // Queue the callback and dequeue the timer on success and error.
    let cb = this._fnAndFlush(fn, {onSuccess: removeTimerFn, onError: removeTimerFn});
    let id = this._scheduler.scheduleFunction(cb, delay, {args, isRequestAnimationFrame: !isTimer});
    if (isTimer) {
      this.pendingTimers.push(id);
    }
    return id;
  }

  private _clearTimeout(id: number): void {
    FakeTimeTestZoneSpec._removeTimer(this.pendingTimers, id);
    this._scheduler.removeScheduledFunctionWithId(id);
  }

  private _setInterval(fn: Function, interval: number, args: any[]): number {
    let id = Scheduler.nextId;
    let completers = {onSuccess: null as any, onError: this._dequeuePeriodicTimer(id)};
    let cb = this._fnAndFlush(fn, completers);

    // Use the callback created above to requeue on success.
    completers.onSuccess = this._requeuePeriodicTimer(cb, interval, args, id);

    // Queue the callback and dequeue the periodic timer only on error.
    this._scheduler.scheduleFunction(cb, interval, {args, isPeriodic: true});
    this.pendingPeriodicTimers.push(id);
    return id;
  }

  private _clearInterval(id: number): void {
    FakeTimeTestZoneSpec._removeTimer(this.pendingPeriodicTimers, id);
    this._scheduler.removeScheduledFunctionWithId(id);
  }

  private _resetLastErrorAndThrow(): void {
    let error = this._lastError || this._uncaughtPromiseErrors[0];
    this._uncaughtPromiseErrors.length = 0;
    this._lastError = null;
    throw error;
  }

  getCurrentTickClockTime() {
    return this._scheduler.getCurrentTickClockTime();
  }

  getFakeSystemTime() {
    return this._scheduler.getFakeSystemTime();
  }

  setFakeBaseSystemTime(realTime: number) {
    this._scheduler.setFakeBaseSystemTime(realTime);
  }

  getRealSystemTime() {
    return this._scheduler.getRealSystemTime();
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
    FakeTimeTestZoneSpec.checkTimerPatch();
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
    FakeTimeTestZoneSpec.patchDate();
  }
  unlockDatePatch() {
    this.patchDateLocked = false;
    FakeTimeTestZoneSpec.resetDate();
  }

  async tickClockToNext(
      steps: number = 1, doTickClock?: (elapsed: number) => void, tickClockOptions: {
        processNewMacroTasksSynchronously: boolean
      } = {processNewMacroTasksSynchronously: true}): Promise<void> {
    if (steps <= 0) {
      return;
    }
    FakeTimeTestZoneSpec.assertInZone();
    await this.flushMicrotasks();
    this._scheduler.tickClockToNext(steps, doTickClock, tickClockOptions);
    if (this._lastError !== null) {
      this._resetLastErrorAndThrow();
    }
  }

  async tickClock(millis: number = 0, doTickClock?: (elapsed: number) => void, tickClockOptions: {
    processNewMacroTasksSynchronously: boolean
  } = {processNewMacroTasksSynchronously: true}): Promise<void> {
    FakeTimeTestZoneSpec.assertInZone();
    await this.flushMicrotasks();
    await this._scheduler.tickClock(millis, doTickClock, tickClockOptions);
    if (this._lastError !== null) {
      this._resetLastErrorAndThrow();
    }
  }

  async flushMicrotasks(): Promise<void> {
    FakeTimeTestZoneSpec.assertInZone();
    // This await will cause any outstanding microtasks to be completed.
    await 0;
    if (this._lastError !== null || this._uncaughtPromiseErrors.length) {
      // If there is an error stop processing the microtask queue and rethrow the error.
      this._resetLastErrorAndThrow();
    }
  }

  async flush(limit?: number, flushPeriodic?: boolean, doTickClock?: (elapsed: number) => void):
      Promise<number> {
    FakeTimeTestZoneSpec.assertInZone();
    await this.flushMicrotasks();
    const elapsed = this._scheduler.flush(limit, flushPeriodic, doTickClock);
    if (this._lastError !== null) {
      this._resetLastErrorAndThrow();
    }
    return elapsed;
  }

  async flushOnlyPendingTimers(doTickClock?: (elapsed: number) => void): Promise<number> {
    FakeTimeTestZoneSpec.assertInZone();
    await this.flushMicrotasks();
    const elapsed = this._scheduler.flushOnlyPendingTimers(doTickClock);
    if (this._lastError !== null) {
      this._resetLastErrorAndThrow();
    }
    return elapsed;
  }

  removeAllTimers() {
    FakeTimeTestZoneSpec.assertInZone();
    this._scheduler.removeAll();
    this.pendingPeriodicTimers = [];
    this.pendingTimers = [];
  }

  getTimerCount() {
    return this._scheduler.getTimerCount();
  }

  // ZoneSpec implementation below.

  name: string;

  properties: {[key: string]: any} = {'FakeTimeTestZoneSpec': this};

  onScheduleTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task {
    switch (task.type) {
      case 'microTask':
        // console.log('microtask sheduled');
        task = delegate.scheduleTask(target, task);
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
      FakeTimeTestZoneSpec.patchDate();
      return delegate.invoke(target, callback, applyThis, applyArgs, source);
    } finally {
      if (!this.patchDateLocked) {
        FakeTimeTestZoneSpec.resetDate();
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
(Zone as any)['FakeTimeTestZoneSpec'] = FakeTimeTestZoneSpec;
})(typeof window === 'object' && window || typeof self === 'object' && self || global);

Zone.__load_patch('fakeTime', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  const FakeTimeTestZoneSpec = Zone && (Zone as any)['FakeTimeTestZoneSpec'];
  type ProxyZoneSpecType = {
    setDelegate(delegateSpec: ZoneSpec): void; getDelegate(): ZoneSpec; resetDelegate(): void;
  };

  function getProxyZoneSpec(): {get(): ProxyZoneSpecType; assertPresent: () => ProxyZoneSpecType} {
    return Zone && (Zone as any)['ProxyZoneSpec'];
  }

  let _fakeTimeTestZoneSpec: any = null;

  /**
   * Clears out the shared fake async zone for a test.
   * To be called in a global `beforeEach`.
   *
   * @experimental
   */
  function resetFakeTimeZone() {
    if (_fakeTimeTestZoneSpec) {
      _fakeTimeTestZoneSpec.unlockDatePatch();
    }
    _fakeTimeTestZoneSpec = null;
    // in node.js testing we may not have ProxyZoneSpec in which case there is nothing to reset.
    getProxyZoneSpec() && getProxyZoneSpec().assertPresent().resetDelegate();
  }

  /**
   * Wraps an async function to be executed in the fakeTime zone:
   * - microtasks are flushed by awaiting a call to `flushMicrotasks()`,
   * - timers are mocked: `tickClock()` simulates the asynchronous passage of time.
   *
   * If there are any pending timers at the end of the function, an exception will be thrown.
   *
   * Can be used to wrap inject() calls.
   *
   * ## Example
   *
   * {@example core/testing/ts/fake_async.ts region='basic'}
   *
   * @param fn
   * @returns The function wrapped to be executed in the fakeTime zone
   *
   * @experimental
   */
  function fakeTime(fn: (...args: any[]) => Promise<any>): (...args: any[]) => Promise<any> {
    // Not using an arrow function to preserve context passed from call site
    const fakeTimeFn = async function(this: unknown, ...args: any[]) {
      const ProxyZoneSpec = getProxyZoneSpec();
      if (!ProxyZoneSpec) {
        throw new Error(
            'ProxyZoneSpec is needed for the async() test helper but could not be found. ' +
            'Please make sure that your environment includes zone.js/plugins/proxy');
      }
      const proxyZoneSpec = ProxyZoneSpec.assertPresent();
      if (Zone.current.get('FakeTimeTestZoneSpec')) {
        throw new Error('fakeTime() calls can not be nested');
      }
      try {
        // in case jasmine.clock init a fakeTimeTestZoneSpec
        if (!_fakeTimeTestZoneSpec) {
          if (proxyZoneSpec.getDelegate() instanceof FakeTimeTestZoneSpec) {
            throw new Error('fakeTime() calls can not be nested');
          }

          _fakeTimeTestZoneSpec = new FakeTimeTestZoneSpec();
        }

        let res: any;
        const lastProxyZoneSpec = proxyZoneSpec.getDelegate();
        proxyZoneSpec.setDelegate(_fakeTimeTestZoneSpec);
        _fakeTimeTestZoneSpec.lockDatePatch();
        try {
          res = await fn.apply(this, args);
          await flushMicrotasks();
        } finally {
          proxyZoneSpec.setDelegate(lastProxyZoneSpec);
        }

        if (_fakeTimeTestZoneSpec.pendingPeriodicTimers.length > 0) {
          throw new Error(
              `${_fakeTimeTestZoneSpec.pendingPeriodicTimers.length} ` +
              `periodic timer(s) still in the queue.`);
        }

        if (_fakeTimeTestZoneSpec.pendingTimers.length > 0) {
          throw new Error(
              `${_fakeTimeTestZoneSpec.pendingTimers.length} timer(s) still in the queue.`);
        }
        return res;
      } finally {
        resetFakeTimeZone();
      }
    };
    (fakeTimeFn as any).isFakeTime = true;
    return fakeTimeFn;
  }

  function _getFakeTimeZoneSpec(): any {
    if (_fakeTimeTestZoneSpec == null) {
      _fakeTimeTestZoneSpec = Zone.current.get('FakeTimeTestZoneSpec');
      if (_fakeTimeTestZoneSpec == null) {
        throw new Error('The code should be running in the fakeTime zone to call this function');
      }
    }
    return _fakeTimeTestZoneSpec;
  }

  /**
   * Simulates the asynchronous passage of time for the timers in the fakeTime zone.
   *
   * The microtasks queue is drained at the very start of this function and after any timer callback
   * has been executed.
   *
   * ## Example
   *
   * {@example core/testing/ts/fake_async.ts region='basic'}
   *
   * @experimental
   */
  async function tickClock(millis: number = 0, ignoreNestedTimeout = false): Promise<void> {
    return _getFakeTimeZoneSpec().tickClock(millis, null, ignoreNestedTimeout);
  }

  /**
   * Simulates the asynchronous passage of time for the timers in the fakeTime zone by
   * draining the macrotask queue until it is empty. The returned value is the milliseconds
   * of time that would have been elapsed.
   *
   * @param maxTurns
   * @returns The simulated time elapsed, in millis.
   *
   * @experimental
   */
  async function flush(maxTurns?: number): Promise<number> {
    return _getFakeTimeZoneSpec().flush(maxTurns);
  }

  /**
   * Discard all remaining periodic tasks.
   *
   * @experimental
   */
  function discardPeriodicTasks(): void {
    const zoneSpec = _getFakeTimeZoneSpec();
    const pendingTimers = zoneSpec.pendingPeriodicTimers;
    zoneSpec.pendingPeriodicTimers.length = 0;
  }

  /**
   * Flush any pending microtasks.
   *
   * @experimental
   */
  function flushMicrotasks(): Promise<void> {
    return _getFakeTimeZoneSpec().flushMicrotasks();
  }
  (Zone as any)[api.symbol('fakeTimeTest')] =
      {resetFakeTimeZone, flushMicrotasks, discardPeriodicTasks, tickClock, flush, fakeTime};
}, true);
