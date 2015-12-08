var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
function retry(count) {
    if (count === void 0) { count = 0; }
    return this.lift(new RetryOperator(count, this));
}
exports.retry = retry;
var RetryOperator = (function () {
    function RetryOperator(count, source) {
        this.count = count;
        this.source = source;
    }
    RetryOperator.prototype.call = function (subscriber) {
        return new FirstRetrySubscriber(subscriber, this.count, this.source);
    };
    return RetryOperator;
})();
var FirstRetrySubscriber = (function (_super) {
    __extends(FirstRetrySubscriber, _super);
    function FirstRetrySubscriber(destination, count, source) {
        _super.call(this);
        this.destination = destination;
        this.count = count;
        this.source = source;
        destination.add(this);
        this.lastSubscription = this;
    }
    FirstRetrySubscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    FirstRetrySubscriber.prototype.error = function (error) {
        if (!this.isUnsubscribed) {
            this.unsubscribe();
            this.resubscribe();
        }
    };
    FirstRetrySubscriber.prototype._complete = function () {
        this.unsubscribe();
        this.destination.complete();
    };
    FirstRetrySubscriber.prototype.resubscribe = function (retried) {
        if (retried === void 0) { retried = 0; }
        var _a = this, lastSubscription = _a.lastSubscription, destination = _a.destination;
        destination.remove(lastSubscription);
        lastSubscription.unsubscribe();
        var nextSubscriber = new RetryMoreSubscriber(this, this.count, retried + 1);
        this.lastSubscription = this.source.subscribe(nextSubscriber);
        destination.add(this.lastSubscription);
    };
    return FirstRetrySubscriber;
})(Subscriber_1.Subscriber);
var RetryMoreSubscriber = (function (_super) {
    __extends(RetryMoreSubscriber, _super);
    function RetryMoreSubscriber(parent, count, retried) {
        if (retried === void 0) { retried = 0; }
        _super.call(this, null);
        this.parent = parent;
        this.count = count;
        this.retried = retried;
    }
    RetryMoreSubscriber.prototype._next = function (value) {
        this.parent.destination.next(value);
    };
    RetryMoreSubscriber.prototype._error = function (err) {
        var parent = this.parent;
        var retried = this.retried;
        var count = this.count;
        if (count && retried === count) {
            parent.destination.error(err);
        }
        else {
            parent.resubscribe(retried);
        }
    };
    RetryMoreSubscriber.prototype._complete = function () {
        this.parent.destination.complete();
    };
    return RetryMoreSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=retry.js.map