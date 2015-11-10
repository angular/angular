var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var testability_1 = require('angular2/src/core/testability/testability');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var async_1 = require('angular2/src/facade/async');
// Schedules a microtasks (using a resolved promise .then())
function microTask(fn) {
    async_1.PromiseWrapper.resolve(null).then(function (_) { fn(); });
}
var MockNgZone = (function (_super) {
    __extends(MockNgZone, _super);
    function MockNgZone() {
        _super.call(this, { enableLongStackTrace: false });
        this._onTurnStartStream = new async_1.EventEmitter(false);
        this._onEventDoneStream = new async_1.EventEmitter(false);
    }
    Object.defineProperty(MockNgZone.prototype, "onTurnStart", {
        get: function () { return this._onTurnStartStream; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockNgZone.prototype, "onEventDone", {
        get: function () { return this._onEventDoneStream; },
        enumerable: true,
        configurable: true
    });
    MockNgZone.prototype.start = function () { async_1.ObservableWrapper.callNext(this._onTurnStartStream, null); };
    MockNgZone.prototype.finish = function () { async_1.ObservableWrapper.callNext(this._onEventDoneStream, null); };
    return MockNgZone;
})(ng_zone_1.NgZone);
function main() {
    testing_internal_1.describe('Testability', function () {
        var testability, execute, ngZone;
        testing_internal_1.beforeEach(function () {
            ngZone = new MockNgZone();
            testability = new testability_1.Testability(ngZone);
            execute = new testing_internal_1.SpyObject().spy('execute');
        });
        testing_internal_1.describe('Pending count logic', function () {
            testing_internal_1.it('should start with a pending count of 0', function () { testing_internal_1.expect(testability.getPendingRequestCount()).toEqual(0); });
            testing_internal_1.it('should fire whenstable callbacks if pending count is 0', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                testability.whenStable(execute);
                microTask(function () {
                    testing_internal_1.expect(execute).toHaveBeenCalled();
                    async.done();
                });
            }));
            testing_internal_1.it('should not fire whenstable callbacks synchronously if pending count is 0', function () {
                testability.whenStable(execute);
                testing_internal_1.expect(execute).not.toHaveBeenCalled();
            });
            testing_internal_1.it('should not call whenstable callbacks when there are pending counts', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                testability.increasePendingRequestCount();
                testability.increasePendingRequestCount();
                testability.whenStable(execute);
                microTask(function () {
                    testing_internal_1.expect(execute).not.toHaveBeenCalled();
                    testability.decreasePendingRequestCount();
                    microTask(function () {
                        testing_internal_1.expect(execute).not.toHaveBeenCalled();
                        async.done();
                    });
                });
            }));
            testing_internal_1.it('should fire whenstable callbacks when pending drops to 0', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                testability.increasePendingRequestCount();
                testability.whenStable(execute);
                microTask(function () {
                    testing_internal_1.expect(execute).not.toHaveBeenCalled();
                    testability.decreasePendingRequestCount();
                    microTask(function () {
                        testing_internal_1.expect(execute).toHaveBeenCalled();
                        async.done();
                    });
                });
            }));
            testing_internal_1.it('should not fire whenstable callbacks synchronously when pending drops to 0', function () {
                testability.increasePendingRequestCount();
                testability.whenStable(execute);
                testability.decreasePendingRequestCount();
                testing_internal_1.expect(execute).not.toHaveBeenCalled();
            });
        });
        testing_internal_1.describe('NgZone callback logic', function () {
            testing_internal_1.it('should start being ready', function () { testing_internal_1.expect(testability.isAngularEventPending()).toEqual(false); });
            testing_internal_1.it('should fire whenstable callback if event is already finished', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                ngZone.start();
                ngZone.finish();
                testability.whenStable(execute);
                microTask(function () {
                    testing_internal_1.expect(execute).toHaveBeenCalled();
                    async.done();
                });
            }));
            testing_internal_1.it('should not fire whenstable callbacks synchronously if event is already finished', function () {
                ngZone.start();
                ngZone.finish();
                testability.whenStable(execute);
                testing_internal_1.expect(execute).not.toHaveBeenCalled();
            });
            testing_internal_1.it('should fire whenstable callback when event finishes', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                ngZone.start();
                testability.whenStable(execute);
                microTask(function () {
                    testing_internal_1.expect(execute).not.toHaveBeenCalled();
                    ngZone.finish();
                    microTask(function () {
                        testing_internal_1.expect(execute).toHaveBeenCalled();
                        async.done();
                    });
                });
            }));
            testing_internal_1.it('should not fire whenstable callbacks synchronously when event finishes', function () {
                ngZone.start();
                testability.whenStable(execute);
                ngZone.finish();
                testing_internal_1.expect(execute).not.toHaveBeenCalled();
            });
            testing_internal_1.it('should not fire whenstable callback when event did not finish', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                ngZone.start();
                testability.increasePendingRequestCount();
                testability.whenStable(execute);
                microTask(function () {
                    testing_internal_1.expect(execute).not.toHaveBeenCalled();
                    testability.decreasePendingRequestCount();
                    microTask(function () {
                        testing_internal_1.expect(execute).not.toHaveBeenCalled();
                        ngZone.finish();
                        microTask(function () {
                            testing_internal_1.expect(execute).toHaveBeenCalled();
                            async.done();
                        });
                    });
                });
            }));
            testing_internal_1.it('should not fire whenstable callback when there are pending counts', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                ngZone.start();
                testability.increasePendingRequestCount();
                testability.increasePendingRequestCount();
                testability.whenStable(execute);
                microTask(function () {
                    testing_internal_1.expect(execute).not.toHaveBeenCalled();
                    ngZone.finish();
                    microTask(function () {
                        testing_internal_1.expect(execute).not.toHaveBeenCalled();
                        testability.decreasePendingRequestCount();
                        microTask(function () {
                            testing_internal_1.expect(execute).not.toHaveBeenCalled();
                            testability.decreasePendingRequestCount();
                            microTask(function () {
                                testing_internal_1.expect(execute).toHaveBeenCalled();
                                async.done();
                            });
                        });
                    });
                });
            }));
        });
    });
}
exports.main = main;
//# sourceMappingURL=testability_spec.js.map