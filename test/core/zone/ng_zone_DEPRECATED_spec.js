// TODO(yjbanov): this file tests the deprecated NgZone API. Delete it when
// the old API is cleaned up.
var test_lib_1 = require('angular2/test_lib');
var async_1 = require('angular2/src/facade/async');
var exceptions_1 = require('angular2/src/facade/exceptions');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var needsLongerTimers = test_lib_1.browserDetection.isSlow || test_lib_1.browserDetection.isEdge;
var resultTimer = 1000;
var testTimeout = test_lib_1.browserDetection.isEdge ? 1200 : 100;
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
function logError(error, stackTrace) {
    _errors.push(error);
    _traces.push(stackTrace);
}
function main() {
    test_lib_1.describe("NgZone", function () {
        function createZone(enableLongStackTrace) {
            var zone = new ng_zone_1.NgZone({ enableLongStackTrace: enableLongStackTrace });
            zone.overrideOnTurnStart(_log.fn('onTurnStart'));
            zone.overrideOnTurnDone(_log.fn('onTurnDone'));
            return zone;
        }
        test_lib_1.beforeEach(function () {
            _log = new test_lib_1.Log();
            _errors = [];
            _traces = [];
        });
        test_lib_1.describe('long stack trace', function () {
            test_lib_1.beforeEach(function () { _zone = createZone(true); });
            commonTests();
            test_lib_1.it('should produce long stack traces', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
                macroTask(function () {
                    _zone.overrideOnErrorHandler(logError);
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
                        test_lib_1.expect(_traces.length).toBe(1);
                        test_lib_1.expect(_traces[0].length).toBeGreaterThan(1);
                        async.done();
                    });
                });
            }), testTimeout);
            test_lib_1.it('should produce long stack traces (when using microtasks)', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
                macroTask(function () {
                    _zone.overrideOnErrorHandler(logError);
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
                        test_lib_1.expect(_traces.length).toBe(1);
                        test_lib_1.expect(_traces[0].length).toBeGreaterThan(1);
                        async.done();
                    });
                });
            }), testTimeout);
        });
        test_lib_1.describe('short stack trace', function () {
            test_lib_1.beforeEach(function () { _zone = createZone(false); });
            commonTests();
            test_lib_1.it('should disable long stack traces', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
                macroTask(function () {
                    _zone.overrideOnErrorHandler(logError);
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
                        test_lib_1.expect(_traces.length).toBe(1);
                        test_lib_1.expect(_traces[0].length).toEqual(1);
                        async.done();
                    });
                });
            }), testTimeout);
        });
    });
}
exports.main = main;
function commonTests() {
    test_lib_1.describe('isInInnerZone', function () {
        test_lib_1.it('should return whether the code executes in the inner zone', function () {
            test_lib_1.expect(test_lib_1.isInInnerZone()).toEqual(false);
            _zone.run(function () { test_lib_1.expect(test_lib_1.isInInnerZone()).toEqual(true); });
        }, testTimeout);
    });
    test_lib_1.describe('run', function () {
        test_lib_1.it('should return the body return value from run', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            macroTask(function () { test_lib_1.expect(_zone.run(function () { return 6; })).toEqual(6); });
            macroTask(function () { async.done(); });
        }), testTimeout);
        test_lib_1.it('should call onTurnStart and onTurnDone', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                test_lib_1.expect(_log.result()).toEqual('onTurnStart; run; onTurnDone');
                async.done();
            });
        }), testTimeout);
        test_lib_1.it('should call onEventDone once at the end of event', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            // The test is set up in a way that causes the zone loop to run onTurnDone twice
            // then verified that onEventDone is only called once at the end
            _zone.overrideOnTurnStart(null);
            _zone.overrideOnEventDone(function () { _log.add('onEventDone'); });
            var times = 0;
            _zone.overrideOnTurnDone(function () {
                times++;
                _log.add("onTurnDone " + times);
                if (times < 2) {
                    // Scheduling a microtask causes a second digest
                    microTask(function () { });
                }
            });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                test_lib_1.expect(_log.result()).toEqual('run; onTurnDone 1; onTurnDone 2; onEventDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should call standalone onEventDone', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            _zone.overrideOnTurnStart(null);
            _zone.overrideOnEventDone(function () { _log.add('onEventDone'); });
            _zone.overrideOnTurnDone(null);
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                test_lib_1.expect(_log.result()).toEqual('run; onEventDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should not allow onEventDone to cause further digests', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            _zone.overrideOnTurnStart(null);
            var eventDone = false;
            _zone.overrideOnEventDone(function () {
                if (eventDone)
                    throw 'Should not call this more than once';
                _log.add('onEventDone');
                // If not implemented correctly, this microtask will cause another digest,
                // which is not what we want.
                microTask(function () { });
                eventDone = true;
            });
            _zone.overrideOnTurnDone(function () { _log.add('onTurnDone'); });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                test_lib_1.expect(_log.result()).toEqual('run; onTurnDone; onEventDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should run async tasks scheduled inside onEventDone outside Angular zone', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            _zone.overrideOnTurnStart(null);
            _zone.overrideOnEventDone(function () {
                _log.add('onEventDone');
                // If not implemented correctly, this time will cause another digest,
                // which is not what we want.
                async_1.TimerWrapper.setTimeout(function () { _log.add('asyncTask'); }, 5);
            });
            _zone.overrideOnTurnDone(function () { _log.add('onTurnDone'); });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                async_1.TimerWrapper.setTimeout(function () {
                    test_lib_1.expect(_log.result()).toEqual('run; onTurnDone; onEventDone; asyncTask');
                    async.done();
                }, 50);
            });
        }), testTimeout);
        test_lib_1.it('should call onTurnStart once before a turn and onTurnDone once after the turn', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            macroTask(function () {
                _zone.run(function () {
                    _log.add('run start');
                    microTask(_log.fn('async'));
                    _log.add('run end');
                });
            });
            macroTask(function () {
                // The microtask (async) is executed after the macrotask (run)
                test_lib_1.expect(_log.result()).toEqual('onTurnStart; run start; run end; async; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should not run onTurnStart and onTurnDone for nested Zone.run', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
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
                test_lib_1.expect(_log.result())
                    .toEqual('onTurnStart; start run; nested run; end run; nested run microtask; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should not run onTurnStart and onTurnDone for nested Zone.run invoked from onTurnDone', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            _zone.overrideOnTurnStart(null);
            _zone.overrideOnTurnDone(function () {
                _log.add('onTurnDone:started');
                _zone.run(function () { return _log.add('nested run'); });
                _log.add('onTurnDone:finished');
            });
            macroTask(function () { _zone.run(function () { _log.add('start run'); }); });
            macroTask(function () {
                test_lib_1.expect(_log.result())
                    .toEqual('start run; onTurnDone:started; nested run; onTurnDone:finished');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should call onTurnStart and onTurnDone before and after each top-level run', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            macroTask(function () { _zone.run(_log.fn('run1')); });
            macroTask(function () { _zone.run(_log.fn('run2')); });
            macroTask(function () {
                test_lib_1.expect(_log.result())
                    .toEqual('onTurnStart; run1; onTurnDone; onTurnStart; run2; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should call onTurnStart and onTurnDone before and after each turn', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
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
                test_lib_1.expect(_log.result())
                    .toEqual('onTurnStart; run start; onTurnDone; onTurnStart; a then; b then; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should run a function outside of the angular zone', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            macroTask(function () { _zone.runOutsideAngular(_log.fn('run')); });
            macroTask(function () {
                test_lib_1.expect(_log.result()).toEqual('run');
                async.done();
            });
        }), testTimeout);
        test_lib_1.it('should call onTurnStart and onTurnDone when an inner microtask is scheduled from outside angular', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
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
                test_lib_1.expect(_log.result())
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
        test_lib_1.it('should call onTurnStart before executing a microtask scheduled in onTurnDone as well as ' +
            'onTurnDone after executing the task', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            var ran = false;
            _zone.overrideOnTurnStart(_log.fn('onTurnStart'));
            _zone.overrideOnTurnDone(function () {
                _log.add('onTurnDone(begin)');
                if (!ran) {
                    microTask(function () {
                        ran = true;
                        _log.add('executedMicrotask');
                    });
                }
                _log.add('onTurnDone(end)');
            });
            macroTask(function () { _zone.run(_log.fn('run')); });
            macroTask(function () {
                test_lib_1.expect(_log.result())
                    .toEqual(
                // First VM turn => 'run' macrotask
                'onTurnStart; run; onTurnDone(begin); onTurnDone(end); ' +
                    // Second VM Turn => microtask enqueued from onTurnDone
                    'onTurnStart; executedMicrotask; onTurnDone(begin); onTurnDone(end)');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should call onTurnStart and onTurnDone for a scheduleMicrotask in onTurnDone triggered by ' +
            'a scheduleMicrotask in run', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            var ran = false;
            _zone.overrideOnTurnStart(_log.fn('onTurnStart'));
            _zone.overrideOnTurnDone(function () {
                _log.add('onTurnDone(begin)');
                if (!ran) {
                    _log.add('onTurnDone(scheduleMicrotask)');
                    microTask(function () {
                        ran = true;
                        _log.add('onTurnDone(executeMicrotask)');
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
                test_lib_1.expect(_log.result())
                    .toEqual(
                // First VM Turn => a macrotask + the microtask it enqueues
                'onTurnStart; scheduleMicrotask; run(executeMicrotask); onTurnDone(begin); onTurnDone(scheduleMicrotask); onTurnDone(end); ' +
                    // Second VM Turn => the microtask enqueued from onTurnDone
                    'onTurnStart; onTurnDone(executeMicrotask); onTurnDone(begin); onTurnDone(end)');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should execute promises scheduled in onTurnStart before promises scheduled in run', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            var donePromiseRan = false;
            var startPromiseRan = false;
            _zone.overrideOnTurnStart(function () {
                _log.add('onTurnStart(begin)');
                if (!startPromiseRan) {
                    _log.add('onTurnStart(schedulePromise)');
                    microTask(_log.fn('onTurnStart(executePromise)'));
                    startPromiseRan = true;
                }
                _log.add('onTurnStart(end)');
            });
            _zone.overrideOnTurnDone(function () {
                _log.add('onTurnDone(begin)');
                if (!donePromiseRan) {
                    _log.add('onTurnDone(schedulePromise)');
                    microTask(_log.fn('onTurnDone(executePromise)'));
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
                test_lib_1.expect(_log.result())
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
        test_lib_1.it('should call onTurnStart and onTurnDone before and after each turn, respectively', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            var completerA;
            var completerB;
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
                test_lib_1.expect(_log.result())
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
        test_lib_1.it('should call onTurnStart and onTurnDone before and after (respectively) all turns in a chain', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
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
                test_lib_1.expect(_log.result())
                    .toEqual('onTurnStart; run start; run end; async1; async2; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should call onTurnStart and onTurnDone for promises created outside of run body', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
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
                test_lib_1.expect(_log.result())
                    .toEqual('onTurnStart; zone run; onTurnDone; onTurnStart; promise then; onTurnDone');
                async.done();
            }, resultTimer);
        }), testTimeout);
    });
    test_lib_1.describe('exceptions', function () {
        test_lib_1.it('should call the on error callback when it is defined', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            macroTask(function () {
                _zone.overrideOnErrorHandler(logError);
                var exception = new exceptions_1.BaseException('sync');
                _zone.run(function () { throw exception; });
                test_lib_1.expect(_errors.length).toBe(1);
                test_lib_1.expect(_errors[0]).toBe(exception);
                async.done();
            });
        }), testTimeout);
        test_lib_1.it('should call onError for errors from microtasks', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            _zone.overrideOnErrorHandler(logError);
            var exception = new exceptions_1.BaseException('async');
            macroTask(function () { _zone.run(function () { microTask(function () { throw exception; }); }); });
            macroTask(function () {
                test_lib_1.expect(_errors.length).toBe(1);
                test_lib_1.expect(_errors[0]).toEqual(exception);
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should call onError when onTurnDone throws and the zone is sync', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            var exception = new exceptions_1.BaseException('fromOnTurnDone');
            _zone.overrideOnErrorHandler(logError);
            _zone.overrideOnTurnDone(function () { throw exception; });
            macroTask(function () { _zone.run(function () { }); });
            macroTask(function () {
                test_lib_1.expect(_errors.length).toBe(1);
                test_lib_1.expect(_errors[0]).toEqual(exception);
                async.done();
            }, resultTimer);
        }), testTimeout);
        test_lib_1.it('should call onError when onTurnDone throws and the zone is async', test_lib_1.inject([test_lib_1.AsyncTestCompleter], function (async) {
            var asyncRan = false;
            var exception = new exceptions_1.BaseException('fromOnTurnDone');
            _zone.overrideOnErrorHandler(logError);
            _zone.overrideOnTurnDone(function () { throw exception; });
            macroTask(function () { _zone.run(function () { microTask(function () { asyncRan = true; }); }); });
            macroTask(function () {
                test_lib_1.expect(asyncRan).toBe(true);
                test_lib_1.expect(_errors.length).toBe(1);
                test_lib_1.expect(_errors[0]).toEqual(exception);
                async.done();
            }, resultTimer);
        }), testTimeout);
    });
}
//# sourceMappingURL=ng_zone_DEPRECATED_spec.js.map