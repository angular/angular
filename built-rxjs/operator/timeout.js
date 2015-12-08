var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var queue_1 = require('../scheduler/queue');
var isDate_1 = require('../util/isDate');
function timeout(due, errorToSend, scheduler) {
    if (errorToSend === void 0) { errorToSend = null; }
    if (scheduler === void 0) { scheduler = queue_1.queue; }
    var absoluteTimeout = isDate_1.isDate(due);
    var waitFor = absoluteTimeout ? (+due - scheduler.now()) : due;
    return this.lift(new TimeoutOperator(waitFor, absoluteTimeout, errorToSend, scheduler));
}
exports.timeout = timeout;
var TimeoutOperator = (function () {
    function TimeoutOperator(waitFor, absoluteTimeout, errorToSend, scheduler) {
        this.waitFor = waitFor;
        this.absoluteTimeout = absoluteTimeout;
        this.errorToSend = errorToSend;
        this.scheduler = scheduler;
    }
    TimeoutOperator.prototype.call = function (subscriber) {
        return new TimeoutSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.errorToSend, this.scheduler);
    };
    return TimeoutOperator;
})();
var TimeoutSubscriber = (function (_super) {
    __extends(TimeoutSubscriber, _super);
    function TimeoutSubscriber(destination, absoluteTimeout, waitFor, errorToSend, scheduler) {
        _super.call(this, destination);
        this.absoluteTimeout = absoluteTimeout;
        this.waitFor = waitFor;
        this.errorToSend = errorToSend;
        this.scheduler = scheduler;
        this.index = 0;
        this._previousIndex = 0;
        this._hasCompleted = false;
        this.scheduleTimeout();
    }
    Object.defineProperty(TimeoutSubscriber.prototype, "previousIndex", {
        get: function () {
            return this._previousIndex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeoutSubscriber.prototype, "hasCompleted", {
        get: function () {
            return this._hasCompleted;
        },
        enumerable: true,
        configurable: true
    });
    TimeoutSubscriber.dispatchTimeout = function (state) {
        var source = state.subscriber;
        var currentIndex = state.index;
        if (!source.hasCompleted && source.previousIndex === currentIndex) {
            source.notifyTimeout();
        }
    };
    TimeoutSubscriber.prototype.scheduleTimeout = function () {
        var currentIndex = this.index;
        this.scheduler.schedule(TimeoutSubscriber.dispatchTimeout, this.waitFor, { subscriber: this, index: currentIndex });
        this.index++;
        this._previousIndex = currentIndex;
    };
    TimeoutSubscriber.prototype._next = function (value) {
        this.destination.next(value);
        if (!this.absoluteTimeout) {
            this.scheduleTimeout();
        }
    };
    TimeoutSubscriber.prototype._error = function (err) {
        this.destination.error(err);
        this._hasCompleted = true;
    };
    TimeoutSubscriber.prototype._complete = function () {
        this.destination.complete();
        this._hasCompleted = true;
    };
    TimeoutSubscriber.prototype.notifyTimeout = function () {
        this.error(this.errorToSend || new Error('timeout'));
    };
    return TimeoutSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=timeout.js.map