var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('../spies');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var async_1 = require('angular2/src/facade/async');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
function main() {
    testing_internal_1.describe("AsyncPipe", function () {
        testing_internal_1.describe('Observable', function () {
            var emitter;
            var pipe;
            var ref;
            var message = new Object();
            testing_internal_1.beforeEach(function () {
                emitter = new async_1.EventEmitter();
                ref = new spies_1.SpyChangeDetectorRef();
                pipe = new core_1.AsyncPipe(ref);
            });
            testing_internal_1.describe("transform", function () {
                testing_internal_1.it("should return null when subscribing to an observable", function () { testing_internal_1.expect(pipe.transform(emitter)).toBe(null); });
                testing_internal_1.it("should return the latest available value wrapped", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(emitter);
                    async_1.ObservableWrapper.callNext(emitter, message);
                    async_1.TimerWrapper.setTimeout(function () {
                        testing_internal_1.expect(pipe.transform(emitter)).toEqual(new core_1.WrappedValue(message));
                        async.done();
                    }, 0);
                }));
                testing_internal_1.it("should return same value when nothing has changed since the last call", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(emitter);
                    async_1.ObservableWrapper.callNext(emitter, message);
                    async_1.TimerWrapper.setTimeout(function () {
                        pipe.transform(emitter);
                        testing_internal_1.expect(pipe.transform(emitter)).toBe(message);
                        async.done();
                    }, 0);
                }));
                testing_internal_1.it("should dispose of the existing subscription when subscribing to a new observable", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(emitter);
                    var newEmitter = new async_1.EventEmitter();
                    testing_internal_1.expect(pipe.transform(newEmitter)).toBe(null);
                    // this should not affect the pipe
                    async_1.ObservableWrapper.callNext(emitter, message);
                    async_1.TimerWrapper.setTimeout(function () {
                        testing_internal_1.expect(pipe.transform(newEmitter)).toBe(null);
                        async.done();
                    }, 0);
                }));
                testing_internal_1.it("should request a change detection check upon receiving a new value", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(emitter);
                    async_1.ObservableWrapper.callNext(emitter, message);
                    async_1.TimerWrapper.setTimeout(function () {
                        testing_internal_1.expect(ref.spy('markForCheck')).toHaveBeenCalled();
                        async.done();
                    }, 0);
                }));
            });
            testing_internal_1.describe("onDestroy", function () {
                testing_internal_1.it("should do nothing when no subscription", function () { testing_internal_1.expect(function () { return pipe.onDestroy(); }).not.toThrow(); });
                testing_internal_1.it("should dispose of the existing subscription", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(emitter);
                    pipe.onDestroy();
                    async_1.ObservableWrapper.callNext(emitter, message);
                    async_1.TimerWrapper.setTimeout(function () {
                        testing_internal_1.expect(pipe.transform(emitter)).toBe(null);
                        async.done();
                    }, 0);
                }));
            });
        });
        testing_internal_1.describe("Promise", function () {
            var message = new Object();
            var pipe;
            var completer;
            var ref;
            // adds longer timers for passing tests in IE
            var timer = (!lang_1.isBlank(dom_adapter_1.DOM) && testing_internal_1.browserDetection.isIE) ? 50 : 0;
            testing_internal_1.beforeEach(function () {
                completer = async_1.PromiseWrapper.completer();
                ref = new spies_1.SpyChangeDetectorRef();
                pipe = new core_1.AsyncPipe(ref);
            });
            testing_internal_1.describe("transform", function () {
                testing_internal_1.it("should return null when subscribing to a promise", function () { testing_internal_1.expect(pipe.transform(completer.promise)).toBe(null); });
                testing_internal_1.it("should return the latest available value", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(completer.promise);
                    completer.resolve(message);
                    async_1.TimerWrapper.setTimeout(function () {
                        testing_internal_1.expect(pipe.transform(completer.promise)).toEqual(new core_1.WrappedValue(message));
                        async.done();
                    }, timer);
                }));
                testing_internal_1.it("should return unwrapped value when nothing has changed since the last call", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(completer.promise);
                    completer.resolve(message);
                    async_1.TimerWrapper.setTimeout(function () {
                        pipe.transform(completer.promise);
                        testing_internal_1.expect(pipe.transform(completer.promise)).toBe(message);
                        async.done();
                    }, timer);
                }));
                testing_internal_1.it("should dispose of the existing subscription when subscribing to a new promise", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(completer.promise);
                    var newCompleter = async_1.PromiseWrapper.completer();
                    testing_internal_1.expect(pipe.transform(newCompleter.promise)).toBe(null);
                    // this should not affect the pipe, so it should return WrappedValue
                    completer.resolve(message);
                    async_1.TimerWrapper.setTimeout(function () {
                        testing_internal_1.expect(pipe.transform(newCompleter.promise)).toBe(null);
                        async.done();
                    }, timer);
                }));
                testing_internal_1.it("should request a change detection check upon receiving a new value", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    pipe.transform(completer.promise);
                    completer.resolve(message);
                    async_1.TimerWrapper.setTimeout(function () {
                        testing_internal_1.expect(ref.spy('markForCheck')).toHaveBeenCalled();
                        async.done();
                    }, timer);
                }));
                testing_internal_1.describe("onDestroy", function () {
                    testing_internal_1.it("should do nothing when no source", function () { testing_internal_1.expect(function () { return pipe.onDestroy(); }).not.toThrow(); });
                    testing_internal_1.it("should dispose of the existing source", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                        pipe.transform(completer.promise);
                        testing_internal_1.expect(pipe.transform(completer.promise)).toBe(null);
                        completer.resolve(message);
                        async_1.TimerWrapper.setTimeout(function () {
                            testing_internal_1.expect(pipe.transform(completer.promise)).toEqual(new core_1.WrappedValue(message));
                            pipe.onDestroy();
                            testing_internal_1.expect(pipe.transform(completer.promise)).toBe(null);
                            async.done();
                        }, timer);
                    }));
                });
            });
        });
        testing_internal_1.describe('null', function () {
            testing_internal_1.it('should return null when given null', function () {
                var pipe = new core_1.AsyncPipe(null);
                testing_internal_1.expect(pipe.transform(null, [])).toEqual(null);
            });
        });
        testing_internal_1.describe('other types', function () {
            testing_internal_1.it('should throw when given an invalid object', function () {
                var pipe = new core_1.AsyncPipe(null);
                testing_internal_1.expect(function () { return pipe.transform("some bogus object", []); }).toThrowError();
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=async_pipe_spec.js.map