var testing_internal_1 = require('angular2/testing_internal');
var async_1 = require('angular2/src/facade/async');
function main() {
    testing_internal_1.describe('EventEmitter', function () {
        var emitter;
        testing_internal_1.beforeEach(function () { emitter = new async_1.EventEmitter(); });
        testing_internal_1.it("should call the next callback", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            async_1.ObservableWrapper.subscribe(emitter, function (value) {
                testing_internal_1.expect(value).toEqual(99);
                async.done();
            });
            async_1.ObservableWrapper.callNext(emitter, 99);
        }));
        testing_internal_1.it("should call the throw callback", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            async_1.ObservableWrapper.subscribe(emitter, function (_) { }, function (error) {
                testing_internal_1.expect(error).toEqual("Boom");
                async.done();
            });
            async_1.ObservableWrapper.callError(emitter, "Boom");
        }));
        testing_internal_1.it("should work when no throw callback is provided", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            async_1.ObservableWrapper.subscribe(emitter, function (_) { }, function (_) { async.done(); });
            async_1.ObservableWrapper.callError(emitter, "Boom");
        }));
        testing_internal_1.it("should call the return callback", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            async_1.ObservableWrapper.subscribe(emitter, function (_) { }, function (_) { }, function () { async.done(); });
            async_1.ObservableWrapper.callComplete(emitter);
        }));
        testing_internal_1.it("should subscribe to the wrapper asynchronously", function () {
            var called = false;
            async_1.ObservableWrapper.subscribe(emitter, function (value) { called = true; });
            async_1.ObservableWrapper.callNext(emitter, 99);
            testing_internal_1.expect(called).toBe(false);
        });
        testing_internal_1.it('delivers events asynchronously', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var e = new async_1.EventEmitter();
            var log = [];
            async_1.ObservableWrapper.subscribe(e, function (x) {
                log.push(x);
                testing_internal_1.expect(log).toEqual([1, 3, 2]);
                async.done();
            });
            log.push(1);
            async_1.ObservableWrapper.callNext(e, 2);
            log.push(3);
        }));
        testing_internal_1.it('delivers events synchronously', function () {
            var e = new async_1.EventEmitter(false);
            var log = [];
            async_1.ObservableWrapper.subscribe(e, function (x) { log.push(x); });
            log.push(1);
            async_1.ObservableWrapper.callNext(e, 2);
            log.push(3);
            testing_internal_1.expect(log).toEqual([1, 2, 3]);
        });
        testing_internal_1.it('reports whether it has subscribers', function () {
            var e = new async_1.EventEmitter(false);
            testing_internal_1.expect(async_1.ObservableWrapper.hasSubscribers(e)).toBe(false);
            async_1.ObservableWrapper.subscribe(e, function (_) { });
            testing_internal_1.expect(async_1.ObservableWrapper.hasSubscribers(e)).toBe(true);
        });
        // TODO: vsavkin: add tests cases
        // should call dispose on the subscription if generator returns {done:true}
        // should call dispose on the subscription on throw
        // should call dispose on the subscription on return
    });
    testing_internal_1.describe("ObservableWrapper", function () {
        testing_internal_1.it('should correctly check isObservable for EventEmitter', function () {
            var e = new async_1.EventEmitter(false);
            testing_internal_1.expect(async_1.ObservableWrapper.isObservable(e)).toBe(true);
        });
        testing_internal_1.it('should correctly check isObservable for Subject', function () {
            var e = new async_1.Subject();
            testing_internal_1.expect(async_1.ObservableWrapper.isObservable(e)).toBe(true);
        });
    });
    // See ECMAScript 6 Spec 25.4.4.1
    testing_internal_1.describe("PromiseWrapper", function () {
        testing_internal_1.describe("#all", function () {
            testing_internal_1.it("should combine lists of Promises", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var one = async_1.PromiseWrapper.completer();
                var two = async_1.PromiseWrapper.completer();
                var all = async_1.PromiseWrapper.all([one.promise, two.promise]);
                var allCalled = false;
                async_1.PromiseWrapper.then(one.promise, function (_) {
                    testing_internal_1.expect(allCalled).toBe(false);
                    two.resolve('two');
                    return null;
                });
                async_1.PromiseWrapper.then(all, function (_) {
                    allCalled = true;
                    async.done();
                    return null;
                });
                one.resolve('one');
            }));
            [null, true, false, 10, 'thing', {}, []].forEach(function (abruptCompletion) {
                testing_internal_1.it("should treat \"" + abruptCompletion + "\" as an \"abrupt completion\"", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var one = async_1.PromiseWrapper.completer();
                    var all = async_1.PromiseWrapper.all([one.promise, abruptCompletion]);
                    async_1.PromiseWrapper.then(all, function (val) {
                        testing_internal_1.expect(val[1]).toEqual(abruptCompletion);
                        async.done();
                    });
                    one.resolve('one');
                }));
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=async_spec.js.map