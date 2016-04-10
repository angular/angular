import {global} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper} from 'angular2/src/facade/collection';

var _scheduler;
var _microtasks: Function[] = [];
var _pendingPeriodicTimers: number[] = [];
var _pendingTimers: number[] = [];

class FakeAsyncZoneSpec implements ZoneSpec {
  static assertInZone(): void {
    if (!Zone.current.get('inFakeAsyncZone')) {
      throw new Error('The code should be running in the fakeAsync zone to call this function');
    }
  }

  name: string = 'fakeAsync';

  properties: {[key: string]: any} = {'inFakeAsyncZone': true};

  onScheduleTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task {
    switch (task.type) {
      case 'microTask':
        _microtasks.push(task.invoke);
        break;
      case 'macroTask':
        switch (task.source) {
          case 'setTimeout':
            task.data['handleId'] = _setTimeout(task.invoke, task.data['delay'], task.data['args']);
            break;
          case 'setInterval':
            task.data['handleId'] =
                _setInterval(task.invoke, task.data['delay'], task.data['args']);
            break;
          default:
            task = delegate.scheduleTask(target, task);
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
        return _clearTimeout(task.data['handleId']);
      case 'setInterval':
        return _clearInterval(task.data['handleId']);
      default:
        return delegate.scheduleTask(target, task);
    }
  }
}

/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @param fn
 * @returns {Function} The function wrapped to be executed in the fakeAsync zone
 */
export function fakeAsync(fn: Function): Function {
  if (Zone.current.get('inFakeAsyncZone')) {
    throw new Error('fakeAsync() calls can not be nested');
  }

  var fakeAsyncZone = Zone.current.fork(new FakeAsyncZoneSpec());

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

/**
 * Clear the queue of pending timers and microtasks.
 *
 * Useful for cleaning up after an asynchronous test passes.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='pending'}
 */
export function clearPendingTimers(): void {
  // TODO we should fix tick to dequeue the failed timer instead of relying on clearPendingTimers
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
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @param {number} millis Number of millisecond, defaults to 0
 */
export function tick(millis: number = 0): void {
  FakeAsyncZoneSpec.assertInZone();
  flushMicrotasks();
  _scheduler.tick(millis);
}

/**
 * Flush any pending microtasks.
 */
export function flushMicrotasks(): void {
  FakeAsyncZoneSpec.assertInZone();
  while (_microtasks.length > 0) {
    var microtask = ListWrapper.removeAt(_microtasks, 0);
    microtask();
  }
}

function _setTimeout(fn: Function, delay: number, args: any[]): number {
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

function _dequeueTimer(id: number): Function {
  return function() { ListWrapper.remove(_pendingTimers, id); }
}
