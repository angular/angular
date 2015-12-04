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
// TODO we should fix tick to dequeue the failed timer instead of relying on clearPendingTimers
function clearPendingTimers() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9hc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL2Zha2VfYXN5bmMudHMiXSwibmFtZXMiOlsiZmFrZUFzeW5jIiwiY2xlYXJQZW5kaW5nVGltZXJzIiwidGljayIsImZsdXNoTWljcm90YXNrcyIsIl9zZXRUaW1lb3V0IiwiX2NsZWFyVGltZW91dCIsIl9zZXRJbnRlcnZhbCIsIl9jbGVhckludGVydmFsIiwiX2ZuQW5kRmx1c2giLCJfc2NoZWR1bGVNaWNyb3Rhc2siLCJfZGVxdWV1ZVRpbWVyIiwiX2Fzc2VydEluRmFrZUFzeW5jWm9uZSJdLCJtYXBwaW5ncyI6IkFBQUEscUJBQXFCLDBCQUEwQixDQUFDLENBQUE7QUFDaEQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFHM0QsSUFBSSxVQUFVLENBQUM7QUFDZixJQUFJLFdBQVcsR0FBZSxFQUFFLENBQUM7QUFDakMsSUFBSSxzQkFBc0IsR0FBYSxFQUFFLENBQUM7QUFDMUMsSUFBSSxjQUFjLEdBQWEsRUFBRSxDQUFDO0FBTWxDOzs7Ozs7Ozs7R0FTRztBQUNILG1CQUEwQixFQUFZO0lBQ3BDQSxFQUFFQSxDQUFDQSxDQUFpQkEsYUFBTUEsQ0FBQ0EsSUFBS0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNsREEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EscUNBQXFDQSxDQUFDQSxDQUFDQTtJQUN6REEsQ0FBQ0E7SUFFREEsSUFBSUEsYUFBYUEsR0FBa0JBLGFBQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2xEQSxVQUFVQSxFQUFFQSxXQUFXQTtRQUN2QkEsWUFBWUEsRUFBRUEsYUFBYUE7UUFDM0JBLFdBQVdBLEVBQUVBLFlBQVlBO1FBQ3pCQSxhQUFhQSxFQUFFQSxjQUFjQTtRQUM3QkEsaUJBQWlCQSxFQUFFQSxrQkFBa0JBO1FBQ3JDQSxnQkFB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LElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0FBQzlCQSxDQUFDQTtBQUVELHVCQUF1QixFQUFVO0lBQy9CQyxNQUFNQSxDQUFDQSxjQUFhLHdCQUFXLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQUE7QUFDL0RBLENBQUNBO0FBRUQ7SUFDRUMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsYUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBaUJBLGFBQU1BLENBQUNBLElBQUtBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkVBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLHdFQUF3RUEsQ0FBQ0EsQ0FBQ0E7SUFDNUZBLENBQUNBO0FBQ0hBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtnbG9iYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtOZ1pvbmVab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuXG52YXIgX3NjaGVkdWxlcjtcbnZhciBfbWljcm90YXNrczogRnVuY3Rpb25bXSA9IFtdO1xudmFyIF9wZW5kaW5nUGVyaW9kaWNUaW1lcnM6IG51bWJlcltdID0gW107XG52YXIgX3BlbmRpbmdUaW1lcnM6IG51bWJlcltdID0gW107XG5cbmludGVyZmFjZSBGYWtlQXN5bmNab25lIGV4dGVuZHMgTmdab25lWm9uZSB7XG4gIF9pbkZha2VBc3luY1pvbmU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogV3JhcHMgYSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBpbiB0aGUgZmFrZUFzeW5jIHpvbmU6XG4gKiAtIG1pY3JvdGFza3MgYXJlIG1hbnVhbGx5IGV4ZWN1dGVkIGJ5IGNhbGxpbmcgYGZsdXNoTWljcm90YXNrcygpYCxcbiAqIC0gdGltZXJzIGFyZSBzeW5jaHJvbm91cywgYHRpY2soKWAgc2ltdWxhdGVzIHRoZSBhc3luY2hyb25vdXMgcGFzc2FnZSBvZiB0aW1lLlxuICpcbiAqIElmIHRoZXJlIGFyZSBhbnkgcGVuZGluZyB0aW1lcnMgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24sIGFuIGV4Y2VwdGlvbiB3aWxsIGJlIHRocm93bi5cbiAqXG4gKiBAcGFyYW0gZm5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIGZ1bmN0aW9uIHdyYXBwZWQgdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGZha2VBc3luYyB6b25lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmYWtlQXN5bmMoZm46IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICBpZiAoKDxGYWtlQXN5bmNab25lPmdsb2JhbC56b25lKS5faW5GYWtlQXN5bmNab25lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmYWtlQXN5bmMoKSBjYWxscyBjYW4gbm90IGJlIG5lc3RlZCcpO1xuICB9XG5cbiAgdmFyIGZha2VBc3luY1pvbmUgPSA8RmFrZUFzeW5jWm9uZT5nbG9iYWwuem9uZS5mb3JrKHtcbiAgICBzZXRUaW1lb3V0OiBfc2V0VGltZW91dCxcbiAgICBjbGVhclRpbWVvdXQ6IF9jbGVhclRpbWVvdXQsXG4gICAgc2V0SW50ZXJ2YWw6IF9zZXRJbnRlcnZhbCxcbiAgICBjbGVhckludGVydmFsOiBfY2xlYXJJbnRlcnZhbCxcbiAgICBzY2hlZHVsZU1pY3JvdGFzazogX3NjaGVkdWxlTWljcm90YXNrLFxuICAgIF9pbkZha2VBc3luY1pvbmU6IHRydWVcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAvLyBUT0RPKHRib3NjaCk6IFRoaXMgY2xhc3Mgc2hvdWxkIGFscmVhZHkgYmUgcGFydCBvZiB0aGUgamFzbWluZSB0eXBpbmdzIGJ1dCBpdCBpcyBub3QuLi5cbiAgICBfc2NoZWR1bGVyID0gbmV3ICg8YW55Pmphc21pbmUpLkRlbGF5ZWRGdW5jdGlvblNjaGVkdWxlcigpO1xuICAgIGNsZWFyUGVuZGluZ1RpbWVycygpO1xuXG4gICAgbGV0IHJlcyA9IGZha2VBc3luY1pvbmUucnVuKCgpID0+IHtcbiAgICAgIGxldCByZXMgPSBmbiguLi5hcmdzKTtcbiAgICAgIGZsdXNoTWljcm90YXNrcygpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcblxuICAgIGlmIChfcGVuZGluZ1BlcmlvZGljVGltZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGAke19wZW5kaW5nUGVyaW9kaWNUaW1lcnMubGVuZ3RofSBwZXJpb2RpYyB0aW1lcihzKSBzdGlsbCBpbiB0aGUgcXVldWUuYCk7XG4gICAgfVxuXG4gICAgaWYgKF9wZW5kaW5nVGltZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGAke19wZW5kaW5nVGltZXJzLmxlbmd0aH0gdGltZXIocykgc3RpbGwgaW4gdGhlIHF1ZXVlLmApO1xuICAgIH1cblxuICAgIF9zY2hlZHVsZXIgPSBudWxsO1xuICAgIExpc3RXcmFwcGVyLmNsZWFyKF9taWNyb3Rhc2tzKTtcblxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cblxuLy8gVE9ETyB3ZSBzaG91bGQgZml4IHRpY2sgdG8gZGVxdWV1ZSB0aGUgZmFpbGVkIHRpbWVyIGluc3RlYWQgb2YgcmVseWluZyBvbiBjbGVhclBlbmRpbmdUaW1lcnNcbmV4cG9ydCBmdW5jdGlvbiBjbGVhclBlbmRpbmdUaW1lcnMoKTogdm9pZCB7XG4gIExpc3RXcmFwcGVyLmNsZWFyKF9taWNyb3Rhc2tzKTtcbiAgTGlzdFdyYXBwZXIuY2xlYXIoX3BlbmRpbmdQZXJpb2RpY1RpbWVycyk7XG4gIExpc3RXcmFwcGVyLmNsZWFyKF9wZW5kaW5nVGltZXJzKTtcbn1cblxuXG4vKipcbiAqIFNpbXVsYXRlcyB0aGUgYXN5bmNocm9ub3VzIHBhc3NhZ2Ugb2YgdGltZSBmb3IgdGhlIHRpbWVycyBpbiB0aGUgZmFrZUFzeW5jIHpvbmUuXG4gKlxuICogVGhlIG1pY3JvdGFza3MgcXVldWUgaXMgZHJhaW5lZCBhdCB0aGUgdmVyeSBzdGFydCBvZiB0aGlzIGZ1bmN0aW9uIGFuZCBhZnRlciBhbnkgdGltZXIgY2FsbGJhY2tcbiAqIGhhcyBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaWxsaXMgTnVtYmVyIG9mIG1pbGxpc2Vjb25kLCBkZWZhdWx0cyB0byAwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aWNrKG1pbGxpczogbnVtYmVyID0gMCk6IHZvaWQge1xuICBfYXNzZXJ0SW5GYWtlQXN5bmNab25lKCk7XG4gIGZsdXNoTWljcm90YXNrcygpO1xuICBfc2NoZWR1bGVyLnRpY2sobWlsbGlzKTtcbn1cblxuLyoqXG4gKiBGbHVzaCBhbnkgcGVuZGluZyBtaWNyb3Rhc2tzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmx1c2hNaWNyb3Rhc2tzKCk6IHZvaWQge1xuICBfYXNzZXJ0SW5GYWtlQXN5bmNab25lKCk7XG4gIHdoaWxlIChfbWljcm90YXNrcy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIG1pY3JvdGFzayA9IExpc3RXcmFwcGVyLnJlbW92ZUF0KF9taWNyb3Rhc2tzLCAwKTtcbiAgICBtaWNyb3Rhc2soKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfc2V0VGltZW91dChmbjogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIC4uLmFyZ3MpOiBudW1iZXIge1xuICB2YXIgY2IgPSBfZm5BbmRGbHVzaChmbik7XG4gIHZhciBpZCA9IF9zY2hlZHVsZXIuc2NoZWR1bGVGdW5jdGlvbihjYiwgZGVsYXksIGFyZ3MpO1xuICBfcGVuZGluZ1RpbWVycy5wdXNoKGlkKTtcbiAgX3NjaGVkdWxlci5zY2hlZHVsZUZ1bmN0aW9uKF9kZXF1ZXVlVGltZXIoaWQpLCBkZWxheSk7XG4gIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gX2NsZWFyVGltZW91dChpZDogbnVtYmVyKSB7XG4gIF9kZXF1ZXVlVGltZXIoaWQpO1xuICByZXR1cm4gX3NjaGVkdWxlci5yZW1vdmVGdW5jdGlvbldpdGhJZChpZCk7XG59XG5cbmZ1bmN0aW9uIF9zZXRJbnRlcnZhbChmbjogRnVuY3Rpb24sIGludGVydmFsOiBudW1iZXIsIC4uLmFyZ3MpIHtcbiAgdmFyIGNiID0gX2ZuQW5kRmx1c2goZm4pO1xuICB2YXIgaWQgPSBfc2NoZWR1bGVyLnNjaGVkdWxlRnVuY3Rpb24oY2IsIGludGVydmFsLCBhcmdzLCB0cnVlKTtcbiAgX3BlbmRpbmdQZXJpb2RpY1RpbWVycy5wdXNoKGlkKTtcbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBfY2xlYXJJbnRlcnZhbChpZDogbnVtYmVyKSB7XG4gIExpc3RXcmFwcGVyLnJlbW92ZShfcGVuZGluZ1BlcmlvZGljVGltZXJzLCBpZCk7XG4gIHJldHVybiBfc2NoZWR1bGVyLnJlbW92ZUZ1bmN0aW9uV2l0aElkKGlkKTtcbn1cblxuZnVuY3Rpb24gX2ZuQW5kRmx1c2goZm46IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBmbi5hcHBseShnbG9iYWwsIGFyZ3MpO1xuICAgIGZsdXNoTWljcm90YXNrcygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9zY2hlZHVsZU1pY3JvdGFzayhtaWNyb3Rhc2s6IEZ1bmN0aW9uKTogdm9pZCB7XG4gIF9taWNyb3Rhc2tzLnB1c2gobWljcm90YXNrKTtcbn1cblxuZnVuY3Rpb24gX2RlcXVldWVUaW1lcihpZDogbnVtYmVyKTogRnVuY3Rpb24ge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7IExpc3RXcmFwcGVyLnJlbW92ZShfcGVuZGluZ1RpbWVycywgaWQpOyB9XG59XG5cbmZ1bmN0aW9uIF9hc3NlcnRJbkZha2VBc3luY1pvbmUoKTogdm9pZCB7XG4gIGlmICghZ2xvYmFsLnpvbmUgfHwgISg8RmFrZUFzeW5jWm9uZT5nbG9iYWwuem9uZSkuX2luRmFrZUFzeW5jWm9uZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGNvZGUgc2hvdWxkIGJlIHJ1bm5pbmcgaW4gdGhlIGZha2VBc3luYyB6b25lIHRvIGNhbGwgdGhpcyBmdW5jdGlvbicpO1xuICB9XG59XG4iXX0=