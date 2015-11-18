var testing_internal_1 = require('angular2/testing_internal');
var async_1 = require('angular2/src/facade/async');
var exceptions_1 = require('angular2/src/facade/exceptions');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var needsLongerTimers = testing_internal_1.browserDetection.isSlow || testing_internal_1.browserDetection.isEdge;
var resultTimer = 1000;
var testTimeout = testing_internal_1.browserDetection.isEdge ? 1200 : 100;
// Schedules a macrotask (using a timer)
function macroTask(fn, timer) {
    if (timer === void 0) { timer = 1; }
    // adds longer timers for passing tests in IE and Edge
    _zone.runOutsideAngular(function () { return async_1.TimerWrapper.setTimeout(fn, needsLongerTimers ? timer : 1); });
}
// Schedules a microtasks (using a resolved promise .then())
function microTask(fn) {
    async_1.PromiseWrapper.resolve(null).then(function (_) { fn(); });
}
var _log;
var _errors;
var _traces;
var _zone;
function logOnError() {
    async_1.ObservableWrapper.subscribe(_zone.onError, function (ngErr) {
        _errors.push(ngErr.error);
        _traces.push(ngErr.stackTrace);
    });
}
function logOnTurnStart() {
    async_1.ObservableWrapper.subscribe(_zone.onTurnStart, _log.fn('onTurnStart'));
}
function logOnTurnDone() {
    async_1.ObservableWrapper.subscribe(_zone.onTurnDone, _log.fn('onTurnDone'));
}
function logOnEventDone() {
    async_1.ObservableWrapper.subscribe(_zone.onEventDone, _log.fn('onEventDone'));
}
function main() {
    testing_internal_1.describe("NgZone", function () {
        function createZone(enableLongStackTrace) {
            return new ng_zone_1.NgZone({ enableLongStackTrace: enableLongStackTrace });
        }
        testing_internal_1.beforeEach(function () {
            _log = new testing_internal_1.Log();
            _errors = [];
            _traces = [];
        });
        testing_internal_1.describe('long stack trace', function () {
            testing_internal_1.beforeEach(function () { _zone = createZone(true); });
            commonTests();
            testing_internal_1.it('should produce long stack traces', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                macroTask(function () {
                    logOnError();
                    var c = async_1.PromiseWrapper.completer();
                    _zone.run(function () {
                        async_1.TimerWrapper.setTimeout(function () {
                            async_1.TimerWrapper.setTimeout(function () {
                                c.resolve(null);
                                throw new exceptions_1.BaseException('ccc');
                            }, 0);
                        }, 0);
                    });
                    c.promise.then(function (_) {
                        testing_internal_1.expect(_traces.length).toBe(1);
                        testing_internal_1.expect(_traces[0].length).toBeGreaterThan(1);
                        async.done();
                    });
                });
            }), testTimeout);
            testing_internal_1.it('should produce long stack traces (when using microtasks)', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                macroTask(function () {
                    logOnError();
                    var c = async_1.PromiseWrapper.completer();
                    _zone.run(function () {
                        microTask(function () {
                            microTask(function () {
                                c.resolve(null);
                                throw new exceptions_1.BaseException("ddd");
                            });
                        });
                    });
                    c.promise.then(function (_) {
                        testing_internal_1.expect(_traces.length).toBe(1);
                        testing_internal_1.expect(_traces[0].length).toBeGreaterThan(1);
                        async.done();
                    });
                });
            }), testTimeout);
        });
        testing_internal_1.describe('short stack trace', function () {
            testing_internal_1.beforeEach(function () { _zone = createZone(false); });
            commonTests();
            testing_internal_1.it('should disable long stack traces', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                macroTask(function () {
                    logOnError();
                    var c = async_1.PromiseWrapper.completer();
                    _zone.run(function () {
                        async_1.TimerWrapper.setTimeout(function () {
                            async_1.TimerWrapper.setTimeout(function () {
                                c.resolve(null);
                                throw new exceptions_1.BaseException('ccc');
                            }, 0);
                        }, 0);
                    });
                    c.promise.then(function (_) {
                        testing_internal_1.expect(_traces.length).toBe(1);
                        testing_internal_1.expect(_traces[0].length).toEqual(1);
                        async.done();
                    });
                });
            }), testTimeout);
        });
    });
}
exports.main = main;
function commonTests() {
    testing_internal_1.describe('hasPendingMicrotasks', function () {
        testing_internal_1.it('should be false', function () { testing_internal_1.expect(_zone.hasPendingMicrotasks).toBe(false); });
        testing_internal_1.it('should be true', function () {
            _zone.run(function () { microTask(function () { }); });
            testing_internal_1.expect(_zone.hasPendingMicrotasks).toBe(true);
        });
    });
    testing_internal_1.describe('hasPendingTimers', function () {
        testing_internal_1.it('should be false', function () { testing_internal_1.expect(_zone.hasPendingTimers).toBe(false); });
        testing_internal_1.it('should be true', function () {
            _zone.run(function () { async_1.TimerWrapper.setTimeout(function () { }, 0); });
            testing_internal_1.expect(_zone.hasPendingTimers).toBe(true);
        });
    });
    testing_internal_1.describe('hasPendingAsyncTasks', function () {
        testing_internal_1.it('should be false', function () { testing_internal_1.expect(_zone.hasPendingAsyncTasks).toBe(false); });
        testing_internal_1.it('should be true when microtask is scheduled', function () {
            _zone.run(function () { microTask(function () { }); });
            testing_internal_1.expect(_zone.hasPendingAsyncTasks).toBe(true);
        });
        testing_internal_1.it('should be true when timer is scheduled', function () {
            _zone.run(function () { async_1.TimerWrapper.setTimeout(function () { }, 0); });
            testing_internal_1.expect(_zone.hasPendingAsyncTasks).toBe(true);
        });
    });
    testing_internal_1.describe('isInInnerZone', function () {
        testing_internal_1.it('should return whether the code executes in the inner zone', function () {
            testing_internal_1.expect(testing_internal_1.isInInnerZone()).toEqual(false);
            _zone.run(function () { testing_internal_1.expect(testing_internal_1.isInInnerZone()).toEqual(true); });
        }, testTimeout);
    });
    testing_internal_1.describe('run', function () {
        testing_internal_1.it('should return the body return value from run', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            macroTask(function () { testing_internal_1.expect(_zone.run(function () { return 6; })).toEqual(6); });
            macroTask(function () { async.done(); });
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result()).toEqual('onTurnStart; run; onTurnDone');
                async.done();
            });
        }), testTimeout);
        testing_internal_1.it('should call onEventDone once at the end of event', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            // The test is set up in a way that causes the zone loop to run onTurnDone twice
            // then verified that onEventDone is only called once at the end
            logOnEventDone();
            var times = 0;
            async_1.ObservableWrapper.subscribe(_zone.onTurnDone, function (_) {
                times++;
                _log.add("onTurnDone " + times);
                if (times < 2) {
                    // Scheduling a microtask causes a second digest
                    _zone.run(function () { microTask(function () { }); });
                }
            });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result()).toEqual('run; onTurnDone 1; onTurnDone 2; onEventDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call standalone onEventDone', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnEventDone();
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result()).toEqual('run; onEventDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should run subscriber listeners in the subscription zone (outside)', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            // Each subscriber fires a microtask outside the Angular zone. The test
            // then verifies that those microtasks do not cause additional digests.
            var turnStart = false;
            async_1.ObservableWrapper.subscribe(_zone.onTurnStart, function (_) {
                if (turnStart)
                    throw 'Should not call this more than once';
                _log.add('onTurnStart');
                microTask(function () { });
                turnStart = true;
            });
            var turnDone = false;
            async_1.ObservableWrapper.subscribe(_zone.onTurnDone, function (_) {
                if (turnDone)
                    throw 'Should not call this more than once';
                _log.add('onTurnDone');
                microTask(function () { });
                turnDone = true;
            });
            var eventDone = false;
            async_1.ObservableWrapper.subscribe(_zone.onEventDone, function (_) {
                if (eventDone)
                    throw 'Should not call this more than once';
                _log.add('onEventDone');
                microTask(function () { });
                eventDone = true;
            });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result()).toEqual('onTurnStart; run; onTurnDone; onEventDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should run subscriber listeners in the subscription zone (inside)', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            // the only practical use-case to run a callback inside the zone is
            // change detection after "onTurnDone". That's the only case tested.
            var turnDone = false;
            async_1.ObservableWrapper.subscribe(_zone.onTurnDone, function (_) {
                _log.add('onTurnDone');
                if (turnDone)
                    return;
                _zone.run(function () { microTask(function () { }); });
                turnDone = true;
            });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result()).toEqual('run; onTurnDone; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should run async tasks scheduled inside onEventDone outside Angular zone', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            async_1.ObservableWrapper.subscribe(_zone.onEventDone, function (_) {
                _log.add('onEventDone');
                // If not implemented correctly, this time will cause another digest,
                // which is not what we want.
                async_1.TimerWrapper.setTimeout(function () { _log.add('asyncTask'); }, 5);
            });
            logOnTurnDone();
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                async_1.TimerWrapper.setTimeout(function () {
                    testing_internal_1.expect(_log.result()).toEqual('run; onTurnDone; onEventDone; asyncTask');
                    async.done();
                }, 50);
            });
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart once before a turn and onTurnDone once after the turn', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            macroTask(function () {
                _zone.run(function () {
                    _log.add('run start');
                    microTask(_log.fn('async'));
                    _log.add('run end');
                });
            });
            macroTask(function () {
                // The microtask (async) is executed after the macrotask (run)
                testing_internal_1.expect(_log.result()).toEqual('onTurnStart; run start; run end; async; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should not run onTurnStart and onTurnDone for nested Zone.run', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            macroTask(function () {
                _zone.run(function () {
                    _log.add('start run');
                    _zone.run(function () {
                        _log.add('nested run');
                        microTask(_log.fn('nested run microtask'));
                    });
                    _log.add('end run');
                });
            });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual('onTurnStart; start run; nested run; end run; nested run microtask; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should not run onTurnStart and onTurnDone for nested Zone.run invoked from onTurnDone', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            async_1.ObservableWrapper.subscribe(_zone.onTurnDone, function (_) {
                _log.add('onTurnDone:started');
                _zone.run(function () { return _log.add('nested run'); });
                _log.add('onTurnDone:finished');
            });
            macroTask(function () { _zone.run(function () { _log.add('start run'); }); });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual('start run; onTurnDone:started; nested run; onTurnDone:finished');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone before and after each top-level run', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            macroTask(function () { _zone.run(_log.fn('run1')); });
            macroTask(function () { _zone.run(_log.fn('run2')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual('onTurnStart; run1; onTurnDone; onTurnStart; run2; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone before and after each turn', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            var a;
            var b;
            macroTask(function () {
                _zone.run(function () {
                    a = async_1.PromiseWrapper.completer();
                    b = async_1.PromiseWrapper.completer();
                    _log.add('run start');
                    a.promise.then(_log.fn('a then'));
                    b.promise.then(_log.fn('b then'));
                });
            });
            macroTask(function () {
                _zone.run(function () {
                    a.resolve('a');
                    b.resolve('b');
                });
            });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual('onTurnStart; run start; onTurnDone; onTurnStart; a then; b then; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should run a function outside of the angular zone', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            macroTask(function () { _zone.runOutsideAngular(_log.fn('run')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result()).toEqual('run');
                async.done();
            });
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone when an inner microtask is scheduled from outside angular', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            var completer;
            macroTask(function () { _zone.runOutsideAngular(function () { completer = async_1.PromiseWrapper.completer(); }); });
            macroTask(function () { _zone.run(function () { completer.promise.then(_log.fn('executedMicrotask')); }); });
            macroTask(function () {
                _zone.runOutsideAngular(function () {
                    _log.add('scheduling a microtask');
                    completer.resolve(null);
                });
            });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual(
                // First VM turn => setup Promise then
                'onTurnStart; onTurnDone; ' +
                    // Second VM turn (outside of anguler)
                    'scheduling a microtask; ' +
                    // Third VM Turn => execute the microtask (inside angular)
                    'onTurnStart; executedMicrotask; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart before executing a microtask scheduled in onTurnDone as well as ' +
            'onTurnDone after executing the task', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var ran = false;
            logOnTurnStart();
            async_1.ObservableWrapper.subscribe(_zone.onTurnDone, function (_) {
                _log.add('onTurnDone(begin)');
                if (!ran) {
                    _zone.run(function () {
                        microTask(function () {
                            ran = true;
                            _log.add('executedMicrotask');
                        });
                    });
                }
                _log.add('onTurnDone(end)');
            });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual(
                // First VM turn => 'run' macrotask
                'onTurnStart; run; onTurnDone(begin); onTurnDone(end); ' +
                    // Second VM Turn => microtask enqueued from onTurnDone
                    'onTurnStart; executedMicrotask; onTurnDone(begin); onTurnDone(end)');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone for a scheduleMicrotask in onTurnDone triggered by ' +
            'a scheduleMicrotask in run', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var ran = false;
            logOnTurnStart();
            async_1.ObservableWrapper.subscribe(_zone.onTurnDone, function (_) {
                _log.add('onTurnDone(begin)');
                if (!ran) {
                    _log.add('onTurnDone(scheduleMicrotask)');
                    _zone.run(function () {
                        microTask(function () {
                            ran = true;
                            _log.add('onTurnDone(executeMicrotask)');
                        });
                    });
                }
                _log.add('onTurnDone(end)');
            });
            macroTask(function () {
                _zone.run(function () {
                    _log.add('scheduleMicrotask');
                    microTask(_log.fn('run(executeMicrotask)'));
                });
            });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual(
                // First VM Turn => a macrotask + the microtask it enqueues
                'onTurnStart; scheduleMicrotask; run(executeMicrotask); onTurnDone(begin); onTurnDone(scheduleMicrotask); onTurnDone(end); ' +
                    // Second VM Turn => the microtask enqueued from onTurnDone
                    'onTurnStart; onTurnDone(executeMicrotask); onTurnDone(begin); onTurnDone(end)');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should execute promises scheduled in onTurnStart before promises scheduled in run', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var donePromiseRan = false;
            var startPromiseRan = false;
            async_1.ObservableWrapper.subscribe(_zone.onTurnStart, function (_) {
                _log.add('onTurnStart(begin)');
                if (!startPromiseRan) {
                    _log.add('onTurnStart(schedulePromise)');
                    _zone.run(function () { microTask(_log.fn('onTurnStart(executePromise)')); });
                    startPromiseRan = true;
                }
                _log.add('onTurnStart(end)');
            });
            async_1.ObservableWrapper.subscribe(_zone.onTurnDone, function (_) {
                _log.add('onTurnDone(begin)');
                if (!donePromiseRan) {
                    _log.add('onTurnDone(schedulePromise)');
                    _zone.run(function () { microTask(_log.fn('onTurnDone(executePromise)')); });
                    donePromiseRan = true;
                }
                _log.add('onTurnDone(end)');
            });
            macroTask(function () {
                _zone.run(function () {
                    _log.add('run start');
                    async_1.PromiseWrapper.resolve(null)
                        .then(function (_) {
                        _log.add('promise then');
                        async_1.PromiseWrapper.resolve(null).then(_log.fn('promise foo'));
                        return async_1.PromiseWrapper.resolve(null);
                    })
                        .then(_log.fn('promise bar'));
                    _log.add('run end');
                });
            });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual(
                // First VM turn: enqueue a microtask in onTurnStart
                'onTurnStart(begin); onTurnStart(schedulePromise); onTurnStart(end); ' +
                    // First VM turn: execute the macrotask which enqueues microtasks
                    'run start; run end; ' +
                    // First VM turn: execute enqueued microtasks
                    'onTurnStart(executePromise); promise then; promise foo; promise bar; ' +
                    // First VM turn: onTurnEnd, enqueue a microtask
                    'onTurnDone(begin); onTurnDone(schedulePromise); onTurnDone(end); ' +
                    // Second VM turn: execute the microtask from onTurnEnd
                    'onTurnStart(begin); onTurnStart(end); onTurnDone(executePromise); onTurnDone(begin); onTurnDone(end)');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone before and after each turn, respectively', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var completerA;
            var completerB;
            logOnTurnStart();
            logOnTurnDone();
            macroTask(function () {
                _zone.run(function () {
                    completerA = async_1.PromiseWrapper.completer();
                    completerB = async_1.PromiseWrapper.completer();
                    completerA.promise.then(_log.fn('a then'));
                    completerB.promise.then(_log.fn('b then'));
                    _log.add('run start');
                });
            });
            macroTask(function () { _zone.run(function () { completerA.resolve(null); }); }, 20);
            macroTask(function () { _zone.run(function () { completerB.resolve(null); }); }, 500);
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual(
                // First VM turn
                'onTurnStart; run start; onTurnDone; ' +
                    // Second VM turn
                    'onTurnStart; a then; onTurnDone; ' +
                    // Third VM turn
                    'onTurnStart; b then; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone before and after (respectively) all turns in a chain', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            macroTask(function () {
                _zone.run(function () {
                    _log.add('run start');
                    microTask(function () {
                        _log.add('async1');
                        microTask(_log.fn('async2'));
                    });
                    _log.add('run end');
                });
            });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual('onTurnStart; run start; run end; async1; async2; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        testing_internal_1.it('should call onTurnStart and onTurnDone for promises created outside of run body', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnTurnStart();
            logOnTurnDone();
            var promise;
            macroTask(function () {
                _zone.runOutsideAngular(function () {
                    promise = async_1.PromiseWrapper.resolve(4).then(function (x) { return async_1.PromiseWrapper.resolve(x); });
                });
                _zone.run(function () {
                    promise.then(_log.fn('promise then'));
                    _log.add('zone run');
                });
            });
            macroTask(function () {
                testing_internal_1.expect(_log.result())
                    .toEqual('onTurnStart; zone run; onTurnDone; onTurnStart; promise then; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
    });
    testing_internal_1.describe('exceptions', function () {
        testing_internal_1.it('should call the on error callback when it is defined', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            macroTask(function () {
                logOnError();
                var exception = new exceptions_1.BaseException('sync');
                _zone.run(function () { throw exception; });
                testing_internal_1.expect(_errors.length).toBe(1);
                testing_internal_1.expect(_errors[0]).toBe(exception);
                async.done();
            });
        }), testTimeout);
        testing_internal_1.it('should call onError for errors from microtasks', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            logOnError();
            var exception = new exceptions_1.BaseException('async');
            macroTask(function () { _zone.run(function () { microTask(function () { throw exception; }); }); });
            macroTask(function () {
                testing_internal_1.expect(_errors.length).toBe(1);
                testing_internal_1.expect(_errors[0]).toEqual(exception);
                async.done();
            }, resultTimer);
        }), testTimeout);
    });
}
//# sourceMappingURL=ng_zone_spec.js.map