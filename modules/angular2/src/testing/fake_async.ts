import {global} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {NgZoneZone} from 'angular2/src/core/zone/ng_zone';

var _scheduler;
var _microtasks: Function[] = [];
var _pendingPeriodicTimers: number[] = [];
var _pendingTimers: number[] = [];

interface FakeAsyncZone extends NgZoneZone {
  _inFakeAsyncZone: boolean;
}

/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * @param fn
 * @returns {Function} The function wrapped to be executed in the fakeAsync zone
 */
export function fakeAsync(fn: Function): Function {
  if ((<FakeAsyncZone>global.zone)._inFakeAsyncZone) {
    throw new Error('fakeAsync() calls can not be nested');
  }

  var fakeAsyncZone = <FakeAsyncZone>global.zone.fork({
    setTimeout: _setTimeout,
    clearTimeout: _clearTimeout,
    setInterval: _setInterval,
    clearInterval: _clearInterval,
    scheduleMicrotask: _scheduleMicrotask,
    _inFakeAsyncZone: true
  });

  return function(...args) {
    // TODO(tbosch): This class should already be part of the jasmine typings but it is not...
    _scheduler = new (<any>jasmine).DelayedFunctionScheduler();
    clearPendingTimers();

    let res = fakeAsyncZone.run(() => {
      let res = fn(...args);
      flushMicrotasks();
      return res;
    });

    if (_pendingPeriodicTimers.length > 0) {
      throw new BaseException(
          `${_pendingPeriodicTimers.length} periodic timer(s) still in the queue.`);
    }

    if (_pendingTimers.length > 0) {
      throw new BaseException(`${_pendingTimers.length} timer(s) still in the queue.`);
    }

    _scheduler = null;
    ListWrapper.clear(_microtasks);

    return res;
  }
}

// TODO we should fix tick to dequeue the failed timer instead of relying on clearPendingTimers
export function clearPendingTimers(): void {
  ListWrapper.clear(_microtasks);
  ListWrapper.clear(_pendingPeriodicTimers);
  ListWrapper.clear(_pendingTimers);
}


/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @param {number} millis Number of millisecond, defaults to 0
 */
export function tick(millis: number = 0): void {
  _assertInFakeAsyncZone();
  flushMicrotasks();
  _scheduler.tick(millis);
}

/**
 * Flush any pending microtasks.
 */
export function flushMicrotasks(): void {
  _assertInFakeAsyncZone();
  while (_microtasks.length > 0) {
    var microtask = ListWrapper.removeAt(_microtasks, 0);
    microtask();
  }
}

function _setTimeout(fn: Function, delay: number, ...args): number {
  var cb = _fnAndFlush(fn);
  var id = _scheduler.scheduleFunction(cb, delay, args);
  _pendingTimers.push(id);
  _scheduler.scheduleFunction(_dequeueTimer(id), delay);
  return id;
}

function _clearTimeout(id: number) {
  _dequeueTimer(id);
  return _scheduler.removeFunctionWithId(id);
}

function _setInterval(fn: Function, interval: number, ...args) {
  var cb = _fnAndFlush(fn);
  var id = _scheduler.scheduleFunction(cb, interval, args, true);
  _pendingPeriodicTimers.push(id);
  return id;
}

function _clearInterval(id: number) {
  ListWrapper.remove(_pendingPeriodicTimers, id);
  return _scheduler.removeFunctionWithId(id);
}

function _fnAndFlush(fn: Function): Function {
  return (...args) => {
    fn.apply(global, args);
    flushMicrotasks();
  }
}

function _scheduleMicrotask(microtask: Function): void {
  _microtasks.push(microtask);
}

function _dequeueTimer(id: number): Function {
  return function() { ListWrapper.remove(_pendingTimers, id); }
}

function _assertInFakeAsyncZone(): void {
  if (!global.zone || !(<FakeAsyncZone>global.zone)._inFakeAsyncZone) {
    throw new Error('The code should be running in the fakeAsync zone to call this function');
  }
}
