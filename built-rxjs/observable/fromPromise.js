var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
var Subscription_1 = require('../Subscription');
var queue_1 = require('../scheduler/queue');
var PromiseObservable = (function (_super) {
    __extends(PromiseObservable, _super);
    function PromiseObservable(promise, scheduler) {
        if (scheduler === void 0) { scheduler = queue_1.queue; }
        _super.call(this);
        this.promise = promise;
        this.scheduler = scheduler;
        this._isScalar = false;
    }
    PromiseObservable.create = function (promise, scheduler) {
        if (scheduler === void 0) { scheduler = queue_1.queue; }
        return new PromiseObservable(promise, scheduler);
    };
    PromiseObservable.prototype._subscribe = function (subscriber) {
        var _this = this;
        var scheduler = this.scheduler;
        var promise = this.promise;
        if (scheduler === queue_1.queue) {
            if (this._isScalar) {
                subscriber.next(this.value);
                subscriber.complete();
            }
            else {
                promise.then(function (value) {
                    _this._isScalar = true;
                    _this.value = value;
                    subscriber.next(value);
                    subscriber.complete();
                }, function (err) { return subscriber.error(err); })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    setTimeout(function () { throw err; });
                });
            }
        }
        else {
            var subscription = new Subscription_1.Subscription();
            if (this._isScalar) {
                var value = this.value;
                subscription.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));
            }
            else {
                promise.then(function (value) {
                    _this._isScalar = true;
                    _this.value = value;
                    subscription.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));
                }, function (err) { return subscription.add(scheduler.schedule(dispatchError, 0, { err: err, subscriber: subscriber })); })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    scheduler.schedule(function () { throw err; });
                });
            }
            return subscription;
        }
    };
    return PromiseObservable;
})(Observable_1.Observable);
exports.PromiseObservable = PromiseObservable;
function dispatchNext(_a) {
    var value = _a.value, subscriber = _a.subscriber;
    subscriber.next(value);
    subscriber.complete();
}
function dispatchError(_a) {
    var err = _a.err, subscriber = _a.subscriber;
    subscriber.error(err);
}
//# sourceMappingURL=fromPromise.js.map