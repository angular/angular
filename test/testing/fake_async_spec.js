var testing_internal_1 = require('angular2/testing_internal');
var async_1 = require('angular2/src/facade/async');
var exceptions_1 = require('angular2/src/facade/exceptions');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
function main() {
    testing_internal_1.describe('fake async', function () {
        testing_internal_1.it('should run synchronous code', function () {
            var ran = false;
            testing_internal_1.fakeAsync(function () { ran = true; })();
            testing_internal_1.expect(ran).toEqual(true);
        });
        testing_internal_1.it('should pass arguments to the wrapped function', function () {
            testing_internal_1.fakeAsync(function (foo, bar) {
                testing_internal_1.expect(foo).toEqual('foo');
                testing_internal_1.expect(bar).toEqual('bar');
            })('foo', 'bar');
        });
        testing_internal_1.it('should work with inject()', testing_internal_1.inject([change_detection_1.Parser], testing_internal_1.fakeAsync(function (parser) { testing_internal_1.expect(parser).toBeAnInstanceOf(change_detection_1.Parser); })));
        testing_internal_1.it('should throw on nested calls', function () {
            testing_internal_1.expect(function () { testing_internal_1.fakeAsync(function () { testing_internal_1.fakeAsync(function () { return null; })(); })(); })
                .toThrowError('fakeAsync() calls can not be nested');
        });
        testing_internal_1.it('should flush microtasks before returning', function () {
            var thenRan = false;
            testing_internal_1.fakeAsync(function () { async_1.PromiseWrapper.resolve(null).then(function (_) { thenRan = true; }); })();
            testing_internal_1.expect(thenRan).toEqual(true);
        });
        testing_internal_1.it('should propagate the return value', function () { testing_internal_1.expect(testing_internal_1.fakeAsync(function () { return 'foo'; })()).toEqual('foo'); });
        testing_internal_1.describe('Promise', function () {
            testing_internal_1.it('should run asynchronous code', testing_internal_1.fakeAsync(function () {
                var thenRan = false;
                async_1.PromiseWrapper.resolve(null).then(function (_) { thenRan = true; });
                testing_internal_1.expect(thenRan).toEqual(false);
                testing_internal_1.flushMicrotasks();
                testing_internal_1.expect(thenRan).toEqual(true);
            }));
            testing_internal_1.it('should run chained thens', testing_internal_1.fakeAsync(function () {
                var log = new testing_internal_1.Log();
                async_1.PromiseWrapper.resolve(null).then(function (_) { return log.add(1); }).then(function (_) { return log.add(2); });
                testing_internal_1.expect(log.result()).toEqual('');
                testing_internal_1.flushMicrotasks();
                testing_internal_1.expect(log.result()).toEqual('1; 2');
            }));
            testing_internal_1.it('should run Promise created in Promise', testing_internal_1.fakeAsync(function () {
                var log = new testing_internal_1.Log();
                async_1.PromiseWrapper.resolve(null).then(function (_) {
                    log.add(1);
                    async_1.PromiseWrapper.resolve(null).then(function (_) { return log.add(2); });
                });
                testing_internal_1.expect(log.result()).toEqual('');
                testing_internal_1.flushMicrotasks();
                testing_internal_1.expect(log.result()).toEqual('1; 2');
            }));
            // TODO(vicb): check why this doesn't work in JS - linked to open issues on GH ?
            testing_internal_1.xit('should complain if the test throws an exception during async calls', function () {
                testing_internal_1.expect(function () {
                    testing_internal_1.fakeAsync(function () {
                        async_1.PromiseWrapper.resolve(null).then(function (_) { throw new exceptions_1.BaseException('async'); });
                        testing_internal_1.flushMicrotasks();
                    })();
                }).toThrowError('async');
            });
            testing_internal_1.it('should complain if a test throws an exception', function () {
                testing_internal_1.expect(function () { testing_internal_1.fakeAsync(function () { throw new exceptions_1.BaseException('sync'); })(); })
                    .toThrowError('sync');
            });
        });
        testing_internal_1.describe('timers', function () {
            testing_internal_1.it('should run queued zero duration timer on zero tick', testing_internal_1.fakeAsync(function () {
                var ran = false;
                async_1.TimerWrapper.setTimeout(function () { ran = true; }, 0);
                testing_internal_1.expect(ran).toEqual(false);
                testing_internal_1.tick();
                testing_internal_1.expect(ran).toEqual(true);
            }));
            testing_internal_1.it('should run queued timer after sufficient clock ticks', testing_internal_1.fakeAsync(function () {
                var ran = false;
                async_1.TimerWrapper.setTimeout(function () { ran = true; }, 10);
                testing_internal_1.tick(6);
                testing_internal_1.expect(ran).toEqual(false);
                testing_internal_1.tick(6);
                testing_internal_1.expect(ran).toEqual(true);
            }));
            testing_internal_1.it('should run queued timer only once', testing_internal_1.fakeAsync(function () {
                var cycles = 0;
                async_1.TimerWrapper.setTimeout(function () { cycles++; }, 10);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(1);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(1);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(1);
            }));
            testing_internal_1.it('should not run cancelled timer', testing_internal_1.fakeAsync(function () {
                var ran = false;
                var id = async_1.TimerWrapper.setTimeout(function () { ran = true; }, 10);
                async_1.TimerWrapper.clearTimeout(id);
                testing_internal_1.tick(10);
                testing_internal_1.expect(ran).toEqual(false);
            }));
            testing_internal_1.it('should throw an error on dangling timers', function () {
                testing_internal_1.expect(function () { testing_internal_1.fakeAsync(function () { async_1.TimerWrapper.setTimeout(function () { }, 10); })(); })
                    .toThrowError('1 timer(s) still in the queue.');
            });
            testing_internal_1.it('should throw an error on dangling periodic timers', function () {
                testing_internal_1.expect(function () { testing_internal_1.fakeAsync(function () { async_1.TimerWrapper.setInterval(function () { }, 10); })(); })
                    .toThrowError('1 periodic timer(s) still in the queue.');
            });
            testing_internal_1.it('should run periodic timers', testing_internal_1.fakeAsync(function () {
                var cycles = 0;
                var id = async_1.TimerWrapper.setInterval(function () { cycles++; }, 10);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(1);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(2);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(3);
                async_1.TimerWrapper.clearInterval(id);
            }));
            testing_internal_1.it('should not run cancelled periodic timer', testing_internal_1.fakeAsync(function () {
                var ran = false;
                var id = async_1.TimerWrapper.setInterval(function () { ran = true; }, 10);
                async_1.TimerWrapper.clearInterval(id);
                testing_internal_1.tick(10);
                testing_internal_1.expect(ran).toEqual(false);
            }));
            testing_internal_1.it('should be able to cancel periodic timers from a callback', testing_internal_1.fakeAsync(function () {
                var cycles = 0;
                var id;
                id = async_1.TimerWrapper.setInterval(function () {
                    cycles++;
                    async_1.TimerWrapper.clearInterval(id);
                }, 10);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(1);
                testing_internal_1.tick(10);
                testing_internal_1.expect(cycles).toEqual(1);
            }));
            testing_internal_1.it('should process microtasks before timers', testing_internal_1.fakeAsync(function () {
                var log = new testing_internal_1.Log();
                async_1.PromiseWrapper.resolve(null).then(function (_) { return log.add('microtask'); });
                async_1.TimerWrapper.setTimeout(function () { return log.add('timer'); }, 9);
                var id = async_1.TimerWrapper.setInterval(function () { return log.add('periodic timer'); }, 10);
                testing_internal_1.expect(log.result()).toEqual('');
                testing_internal_1.tick(10);
                testing_internal_1.expect(log.result()).toEqual('microtask; timer; periodic timer');
                async_1.TimerWrapper.clearInterval(id);
            }));
            testing_internal_1.it('should process micro-tasks created in timers before next timers', testing_internal_1.fakeAsync(function () {
                var log = new testing_internal_1.Log();
                async_1.PromiseWrapper.resolve(null).then(function (_) { return log.add('microtask'); });
                async_1.TimerWrapper.setTimeout(function () {
                    log.add('timer');
                    async_1.PromiseWrapper.resolve(null).then(function (_) { return log.add('t microtask'); });
                }, 9);
                var id = async_1.TimerWrapper.setInterval(function () {
                    log.add('periodic timer');
                    async_1.PromiseWrapper.resolve(null).then(function (_) { return log.add('pt microtask'); });
                }, 10);
                testing_internal_1.tick(10);
                testing_internal_1.expect(log.result())
                    .toEqual('microtask; timer; t microtask; periodic timer; pt microtask');
                testing_internal_1.tick(10);
                testing_internal_1.expect(log.result())
                    .toEqual('microtask; timer; t microtask; periodic timer; pt microtask; periodic timer; pt microtask');
                async_1.TimerWrapper.clearInterval(id);
            }));
        });
        testing_internal_1.describe('outside of the fakeAsync zone', function () {
            testing_internal_1.it('calling flushMicrotasks should throw', function () {
                testing_internal_1.expect(function () { testing_internal_1.flushMicrotasks(); })
                    .toThrowError('The code should be running in the fakeAsync zone to call this function');
            });
            testing_internal_1.it('calling tick should throw', function () {
                testing_internal_1.expect(function () { testing_internal_1.tick(); })
                    .toThrowError('The code should be running in the fakeAsync zone to call this function');
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=fake_async_spec.js.map