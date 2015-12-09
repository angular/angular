var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var queue_1 = require('../scheduler/queue');
var isDate_1 = require('../util/isDate');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
function timeoutWith(due, withObservable, scheduler) {
    if (scheduler === void 0) { scheduler = queue_1.queue; }
    var absoluteTimeout = isDate_1.isDate(due);
    var waitFor = absoluteTimeout ? (+due - scheduler.now()) : due;
    return this.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
}
exports.timeoutWith = timeoutWith;
var TimeoutWithOperator = (function () {
    function TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler) {
        this.waitFor = waitFor;
        this.absoluteTimeout = absoluteTimeout;
        this.withObservable = withObservable;
        this.scheduler = scheduler;
    }
    TimeoutWithOperator.prototype.call = function (subscriber) {
        return new TimeoutWithSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler);
    };
    return TimeoutWithOperator;
})();
var TimeoutWithSubscriber = (function (_super) {
    __extends(TimeoutWithSubscriber, _super);
    function TimeoutWithSubscriber(destination, absoluteTimeout, waitFor, withObservable, scheduler) {
        _super.call(this, null);
        this.destination = destination;
        this.absoluteTimeout = absoluteTimeout;
        this.waitFor = waitFor;
        this.withObservable = withObservable;
        this.scheduler = scheduler;
        this.timeoutSubscription = undefined;
        this.index = 0;
        this._previousIndex = 0;
        this._hasCompleted = false;
        destination.add(this);
        this.scheduleTimeout();
    }
    Object.defineProperty(TimeoutWithSubscriber.prototype, "previousIndex", {
        get: function () {
            return this._previousIndex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeoutWithSubscriber.prototype, "hasCompleted", {
        get: function () {
            return this._hasCompleted;
        },
        enumerable: true,
        configurable: true
    });
    TimeoutWithSubscriber.dispatchTimeout = function (state) {
        var source = state.subscriber;
        var currentIndex = state.index;
        if (!source.hasCompleted && source.previousIndex === currentIndex) {
            source.handleTimeout();
        }
    };
    TimeoutWithSubscriber.prototype.scheduleTimeout = function () {
        var currentIndex = this.index;
        var timeoutState = { subscriber: this, index: currentIndex };
        this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, timeoutState);
        this.index++;
        this._previousIndex = currentIndex;
    };
    TimeoutWithSubscriber.prototype._next = function (value) {
        this.destination.next(value);
        if (!this.absoluteTimeout) {
            this.scheduleTimeout();
        }
    };
    TimeoutWithSubscriber.prototype._error = function (err) {
        this.destination.error(err);
        this._hasCompleted = true;
    };
    TimeoutWithSubscriber.prototype._complete = function () {
        this.destination.complete();
        this._hasCompleted = true;
    };
    TimeoutWithSubscriber.prototype.handleTimeout = function () {
        if (!this.isUnsubscribed) {
            var withObservable = this.withObservable;
            this.unsubscribe();
            this.destination.add(this.timeoutSubscription = subscribeToResult_1.subscribeToResult(this, withObservable));
        }
    };
    return TimeoutWithSubscriber;
})(OuterSubscriber_1.OuterSubscriber);
//# sourceMappingURL=timeoutWith.js.map