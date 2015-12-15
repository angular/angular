'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var _scheduler;
var _microtasks = [];
var _pendingPeriodicTimers = [];
var _pendingTimers = [];
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
function fakeAsync(fn) {
    if (lang_1.global.zone._inFakeAsyncZone) {
        throw new Error('fakeAsync() calls can not be nested');
    }
    var fakeAsyncZone = lang_1.global.zone.fork({
        setTimeout: _setTimeout,
        clearTimeout: _clearTimeout,
        setInterval: _setInterval,
        clearInterval: _clearInterval,
        scheduleMicrotask: _scheduleMicrotask,
        _inFakeAsyncZone: true
    });
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // TODO(tbosch): This class should already be part of the jasmine typings but it is not...
        _scheduler = new jasmine.DelayedFunctionScheduler();
        clearPendingTimers();
        var res = fakeAsyncZone.run(function () {
            var res = fn.apply(void 0, args);
            flushMicrotasks();
            return res;
        });
        if (_pendingPeriodicTimers.length > 0) {
            throw new exceptions_1.BaseException(_pendingPeriodicTimers.length + " periodic timer(s) still in the queue.");
        }
        if (_pendingTimers.length > 0) {
            throw new exceptions_1.BaseException(_pendingTimers.length + " timer(s) still in the queue.");
        }
        _scheduler = null;
        collection_1.ListWrapper.clear(_microtasks);
        return res;
    };
}
exports.fakeAsync = fakeAsync;
/**
 * Clear the queue of pending timers and microtasks.
 *
 * Useful for cleaning up after an asynchronous test passes.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='pending'}
 */
function clearPendingTimers() {
    // TODO we should fix tick to dequeue the failed timer instead of relying on clearPendingTimers
    collection_1.ListWrapper.clear(_microtasks);
    collection_1.ListWrapper.clear(_pendingPeriodicTimers);
    collection_1.ListWrapper.clear(_pendingTimers);
}
exports.clearPendingTimers = clearPendingTimers;
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
function tick(millis) {
    if (millis === void 0) { millis = 0; }
    _assertInFakeAsyncZone();
    flushMicrotasks();
    _scheduler.tick(millis);
}
exports.tick = tick;
/**
 * Flush any pending microtasks.
 */
function flushMicrotasks() {
    _assertInFakeAsyncZone();
    while (_microtasks.length > 0) {
        var microtask = collection_1.ListWrapper.removeAt(_microtasks, 0);
        microtask();
    }
}
exports.flushMicrotasks = flushMicrotasks;
function _setTimeout(fn, delay) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, delay, args);
    _pendingTimers.push(id);
    _scheduler.scheduleFunction(_dequeueTimer(id), delay);
    return id;
}
function _clearTimeout(id) {
    _dequeueTimer(id);
    return _scheduler.removeFunctionWithId(id);
}
function _setInterval(fn, interval) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, interval, args, true);
    _pendingPeriodicTimers.push(id);
    return id;
}
function _clearInterval(id) {
    collection_1.ListWrapper.remove(_pendingPeriodicTimers, id);
    return _scheduler.removeFunctionWithId(id);
}
function _fnAndFlush(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        fn.apply(lang_1.global, args);
        flushMicrotasks();
    };
}
function _scheduleMicrotask(microtask) {
    _microtasks.push(microtask);
}
function _dequeueTimer(id) {
    return function () { collection_1.ListWrapper.remove(_pendingTimers, id); };
}
function _assertInFakeAsyncZone() {
    if (!lang_1.global.zone || !lang_1.global.zone._inFakeAsyncZone) {
        throw new Error('The code should be running in the fakeAsync zone to call this function');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9hc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL2Zha2VfYXN5bmMudHMiXSwibmFtZXMiOlsiZmFrZUFzeW5jIiwiY2xlYXJQZW5kaW5nVGltZXJzIiwidGljayIsImZsdXNoTWljcm90YXNrcyIsIl9zZXRUaW1lb3V0IiwiX2NsZWFyVGltZW91dCIsIl9zZXRJbnRlcnZhbCIsIl9jbGVhckludGVydmFsIiwiX2ZuQW5kRmx1c2giLCJfc2NoZWR1bGVNaWNyb3Rhc2siLCJfZGVxdWV1ZVRpbWVyIiwiX2Fzc2VydEluRmFrZUFzeW5jWm9uZSJdLCJtYXBwaW5ncyI6IkFBQUEscUJBQXFCLDBCQUEwQixDQUFDLENBQUE7QUFDaEQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFHM0QsSUFBSSxVQUFVLENBQUM7QUFDZixJQUFJLFdBQVcsR0FBZSxFQUFFLENBQUM7QUFDakMsSUFBSSxzQkFBc0IsR0FBYSxFQUFFLENBQUM7QUFDMUMsSUFBSSxjQUFjLEdBQWEsRUFBRSxDQUFDO0FBTWxDOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxtQkFBMEIsRUFBWTtJQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBaUJBLGFBQU1BLENBQUNBLElBQUtBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbERBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLHFDQUFxQ0EsQ0FBQ0EsQ0FBQ0E7SUFDekRBLENBQUNBO0lBRURBLElBQUlBLGFBQWFBLEdBQWtCQSxhQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNsREEsVUFBVUEsRUFBRUEsV0FBV0E7UUFDdkJBLFlBQVlBLEVBQUVBLGFBQWFBO1FBQzNCQSxXQUFXQSxFQUFFQSxZQUFZQTtRQUN6QkEsYUFBYUEsRUFBRUEsY0FBY0E7UUFDN0JBLGlCQUFpQkEsRUFBRUEsa0JBQWtCQTtRQUNyQ0Es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NEIsU0FBbUI7SUFDN0NDLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0FBQzlCQSxDQUFDQTtBQUVELHVCQUF1QixFQUFVO0lBQy9CQyxNQUFNQSxDQUFDQSxjQUFhLHdCQUFXLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQUE7QUFDL0RBLENBQUNBO0FBRUQ7SUFDRUMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsYUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBaUJBLGFBQU1BLENBQUNBLElBQUtBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkVBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLHdFQUF3RUEsQ0FBQ0EsQ0FBQ0E7SUFDNUZBLENBQUNBO0FBQ0hBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtnbG9iYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtOZ1pvbmVab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuXG52YXIgX3NjaGVkdWxlcjtcbnZhciBfbWljcm90YXNrczogRnVuY3Rpb25bXSA9IFtdO1xudmFyIF9wZW5kaW5nUGVyaW9kaWNUaW1lcnM6IG51bWJlcltdID0gW107XG52YXIgX3BlbmRpbmdUaW1lcnM6IG51bWJlcltdID0gW107XG5cbmludGVyZmFjZSBGYWtlQXN5bmNab25lIGV4dGVuZHMgTmdab25lWm9uZSB7XG4gIF9pbkZha2VBc3luY1pvbmU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogV3JhcHMgYSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBpbiB0aGUgZmFrZUFzeW5jIHpvbmU6XG4gKiAtIG1pY3JvdGFza3MgYXJlIG1hbnVhbGx5IGV4ZWN1dGVkIGJ5IGNhbGxpbmcgYGZsdXNoTWljcm90YXNrcygpYCxcbiAqIC0gdGltZXJzIGFyZSBzeW5jaHJvbm91cywgYHRpY2soKWAgc2ltdWxhdGVzIHRoZSBhc3luY2hyb25vdXMgcGFzc2FnZSBvZiB0aW1lLlxuICpcbiAqIElmIHRoZXJlIGFyZSBhbnkgcGVuZGluZyB0aW1lcnMgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24sIGFuIGV4Y2VwdGlvbiB3aWxsIGJlIHRocm93bi5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvZmFrZV9hc3luYy50cyByZWdpb249J2Jhc2ljJ31cbiAqXG4gKiBAcGFyYW0gZm5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIGZ1bmN0aW9uIHdyYXBwZWQgdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGZha2VBc3luYyB6b25lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmYWtlQXN5bmMoZm46IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICBpZiAoKDxGYWtlQXN5bmNab25lPmdsb2JhbC56b25lKS5faW5GYWtlQXN5bmNab25lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmYWtlQXN5bmMoKSBjYWxscyBjYW4gbm90IGJlIG5lc3RlZCcpO1xuICB9XG5cbiAgdmFyIGZha2VBc3luY1pvbmUgPSA8RmFrZUFzeW5jWm9uZT5nbG9iYWwuem9uZS5mb3JrKHtcbiAgICBzZXRUaW1lb3V0OiBfc2V0VGltZW91dCxcbiAgICBjbGVhclRpbWVvdXQ6IF9jbGVhclRpbWVvdXQsXG4gICAgc2V0SW50ZXJ2YWw6IF9zZXRJbnRlcnZhbCxcbiAgICBjbGVhckludGVydmFsOiBfY2xlYXJJbnRlcnZhbCxcbiAgICBzY2hlZHVsZU1pY3JvdGFzazogX3NjaGVkdWxlTWljcm90YXNrLFxuICAgIF9pbkZha2VBc3luY1pvbmU6IHRydWVcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAvLyBUT0RPKHRib3NjaCk6IFRoaXMgY2xhc3Mgc2hvdWxkIGFscmVhZHkgYmUgcGFydCBvZiB0aGUgamFzbWluZSB0eXBpbmdzIGJ1dCBpdCBpcyBub3QuLi5cbiAgICBfc2NoZWR1bGVyID0gbmV3ICg8YW55Pmphc21pbmUpLkRlbGF5ZWRGdW5jdGlvblNjaGVkdWxlcigpO1xuICAgIGNsZWFyUGVuZGluZ1RpbWVycygpO1xuXG4gICAgbGV0IHJlcyA9IGZha2VBc3luY1pvbmUucnVuKCgpID0+IHtcbiAgICAgIGxldCByZXMgPSBmbiguLi5hcmdzKTtcbiAgICAgIGZsdXNoTWljcm90YXNrcygpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcblxuICAgIGlmIChfcGVuZGluZ1BlcmlvZGljVGltZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGAke19wZW5kaW5nUGVyaW9kaWNUaW1lcnMubGVuZ3RofSBwZXJpb2RpYyB0aW1lcihzKSBzdGlsbCBpbiB0aGUgcXVldWUuYCk7XG4gICAgfVxuXG4gICAgaWYgKF9wZW5kaW5nVGltZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGAke19wZW5kaW5nVGltZXJzLmxlbmd0aH0gdGltZXIocykgc3RpbGwgaW4gdGhlIHF1ZXVlLmApO1xuICAgIH1cblxuICAgIF9zY2hlZHVsZXIgPSBudWxsO1xuICAgIExpc3RXcmFwcGVyLmNsZWFyKF9taWNyb3Rhc2tzKTtcblxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhciB0aGUgcXVldWUgb2YgcGVuZGluZyB0aW1lcnMgYW5kIG1pY3JvdGFza3MuXG4gKlxuICogVXNlZnVsIGZvciBjbGVhbmluZyB1cCBhZnRlciBhbiBhc3luY2hyb25vdXMgdGVzdCBwYXNzZXMuXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL2Zha2VfYXN5bmMudHMgcmVnaW9uPSdwZW5kaW5nJ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUGVuZGluZ1RpbWVycygpOiB2b2lkIHtcbiAgLy8gVE9ETyB3ZSBzaG91bGQgZml4IHRpY2sgdG8gZGVxdWV1ZSB0aGUgZmFpbGVkIHRpbWVyIGluc3RlYWQgb2YgcmVseWluZyBvbiBjbGVhclBlbmRpbmdUaW1lcnNcbiAgTGlzdFdyYXBwZXIuY2xlYXIoX21pY3JvdGFza3MpO1xuICBMaXN0V3JhcHBlci5jbGVhcihfcGVuZGluZ1BlcmlvZGljVGltZXJzKTtcbiAgTGlzdFdyYXBwZXIuY2xlYXIoX3BlbmRpbmdUaW1lcnMpO1xufVxuXG5cbi8qKlxuICogU2ltdWxhdGVzIHRoZSBhc3luY2hyb25vdXMgcGFzc2FnZSBvZiB0aW1lIGZvciB0aGUgdGltZXJzIGluIHRoZSBmYWtlQXN5bmMgem9uZS5cbiAqXG4gKiBUaGUgbWljcm90YXNrcyBxdWV1ZSBpcyBkcmFpbmVkIGF0IHRoZSB2ZXJ5IHN0YXJ0IG9mIHRoaXMgZnVuY3Rpb24gYW5kIGFmdGVyIGFueSB0aW1lciBjYWxsYmFja1xuICogaGFzIGJlZW4gZXhlY3V0ZWQuXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL2Zha2VfYXN5bmMudHMgcmVnaW9uPSdiYXNpYyd9XG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG1pbGxpcyBOdW1iZXIgb2YgbWlsbGlzZWNvbmQsIGRlZmF1bHRzIHRvIDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRpY2sobWlsbGlzOiBudW1iZXIgPSAwKTogdm9pZCB7XG4gIF9hc3NlcnRJbkZha2VBc3luY1pvbmUoKTtcbiAgZmx1c2hNaWNyb3Rhc2tzKCk7XG4gIF9zY2hlZHVsZXIudGljayhtaWxsaXMpO1xufVxuXG4vKipcbiAqIEZsdXNoIGFueSBwZW5kaW5nIG1pY3JvdGFza3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbHVzaE1pY3JvdGFza3MoKTogdm9pZCB7XG4gIF9hc3NlcnRJbkZha2VBc3luY1pvbmUoKTtcbiAgd2hpbGUgKF9taWNyb3Rhc2tzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgbWljcm90YXNrID0gTGlzdFdyYXBwZXIucmVtb3ZlQXQoX21pY3JvdGFza3MsIDApO1xuICAgIG1pY3JvdGFzaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9zZXRUaW1lb3V0KGZuOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgLi4uYXJncyk6IG51bWJlciB7XG4gIHZhciBjYiA9IF9mbkFuZEZsdXNoKGZuKTtcbiAgdmFyIGlkID0gX3NjaGVkdWxlci5zY2hlZHVsZUZ1bmN0aW9uKGNiLCBkZWxheSwgYXJncyk7XG4gIF9wZW5kaW5nVGltZXJzLnB1c2goaWQpO1xuICBfc2NoZWR1bGVyLnNjaGVkdWxlRnVuY3Rpb24oX2RlcXVldWVUaW1lcihpZCksIGRlbGF5KTtcbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBfY2xlYXJUaW1lb3V0KGlkOiBudW1iZXIpIHtcbiAgX2RlcXVldWVUaW1lcihpZCk7XG4gIHJldHVybiBfc2NoZWR1bGVyLnJlbW92ZUZ1bmN0aW9uV2l0aElkKGlkKTtcbn1cblxuZnVuY3Rpb24gX3NldEludGVydmFsKGZuOiBGdW5jdGlvbiwgaW50ZXJ2YWw6IG51bWJlciwgLi4uYXJncykge1xuICB2YXIgY2IgPSBfZm5BbmRGbHVzaChmbik7XG4gIHZhciBpZCA9IF9zY2hlZHVsZXIuc2NoZWR1bGVGdW5jdGlvbihjYiwgaW50ZXJ2YWwsIGFyZ3MsIHRydWUpO1xuICBfcGVuZGluZ1BlcmlvZGljVGltZXJzLnB1c2goaWQpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIF9jbGVhckludGVydmFsKGlkOiBudW1iZXIpIHtcbiAgTGlzdFdyYXBwZXIucmVtb3ZlKF9wZW5kaW5nUGVyaW9kaWNUaW1lcnMsIGlkKTtcbiAgcmV0dXJuIF9zY2hlZHVsZXIucmVtb3ZlRnVuY3Rpb25XaXRoSWQoaWQpO1xufVxuXG5mdW5jdGlvbiBfZm5BbmRGbHVzaChmbjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGZuLmFwcGx5KGdsb2JhbCwgYXJncyk7XG4gICAgZmx1c2hNaWNyb3Rhc2tzKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3NjaGVkdWxlTWljcm90YXNrKG1pY3JvdGFzazogRnVuY3Rpb24pOiB2b2lkIHtcbiAgX21pY3JvdGFza3MucHVzaChtaWNyb3Rhc2spO1xufVxuXG5mdW5jdGlvbiBfZGVxdWV1ZVRpbWVyKGlkOiBudW1iZXIpOiBGdW5jdGlvbiB7XG4gIHJldHVybiBmdW5jdGlvbigpIHsgTGlzdFdyYXBwZXIucmVtb3ZlKF9wZW5kaW5nVGltZXJzLCBpZCk7IH1cbn1cblxuZnVuY3Rpb24gX2Fzc2VydEluRmFrZUFzeW5jWm9uZSgpOiB2b2lkIHtcbiAgaWYgKCFnbG9iYWwuem9uZSB8fCAhKDxGYWtlQXN5bmNab25lPmdsb2JhbC56b25lKS5faW5GYWtlQXN5bmNab25lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY29kZSBzaG91bGQgYmUgcnVubmluZyBpbiB0aGUgZmFrZUFzeW5jIHpvbmUgdG8gY2FsbCB0aGlzIGZ1bmN0aW9uJyk7XG4gIH1cbn1cbiJdfQ==