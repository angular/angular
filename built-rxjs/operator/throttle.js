var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fromPromise_1 = require('../observable/fromPromise');
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var isPromise_1 = require('../util/isPromise');
var errorObject_1 = require('../util/errorObject');
function throttle(durationSelector) {
    return this.lift(new ThrottleOperator(durationSelector));
}
exports.throttle = throttle;
var ThrottleOperator = (function () {
    function ThrottleOperator(durationSelector) {
        this.durationSelector = durationSelector;
    }
    ThrottleOperator.prototype.call = function (subscriber) {
        return new ThrottleSubscriber(subscriber, this.durationSelector);
    };
    return ThrottleOperator;
})();
var ThrottleSubscriber = (function (_super) {
    __extends(ThrottleSubscriber, _super);
    function ThrottleSubscriber(destination, durationSelector) {
        _super.call(this, destination);
        this.durationSelector = durationSelector;
    }
    ThrottleSubscriber.prototype._next = function (value) {
        if (!this.throttled) {
            var destination = this.destination;
            var duration = tryCatch_1.tryCatch(this.durationSelector)(value);
            if (duration === errorObject_1.errorObject) {
                destination.error(errorObject_1.errorObject.e);
                return;
            }
            if (isPromise_1.isPromise(duration)) {
                duration = fromPromise_1.PromiseObservable.create(duration);
            }
            this.add(this.throttled = duration._subscribe(new ThrottleDurationSelectorSubscriber(this)));
            destination.next(value);
        }
    };
    ThrottleSubscriber.prototype._error = function (err) {
        this.clearThrottle();
        _super.prototype._error.call(this, err);
    };
    ThrottleSubscriber.prototype._complete = function () {
        this.clearThrottle();
        _super.prototype._complete.call(this);
    };
    ThrottleSubscriber.prototype.clearThrottle = function () {
        var throttled = this.throttled;
        if (throttled) {
            throttled.unsubscribe();
            this.remove(throttled);
            this.throttled = null;
        }
    };
    return ThrottleSubscriber;
})(Subscriber_1.Subscriber);
var ThrottleDurationSelectorSubscriber = (function (_super) {
    __extends(ThrottleDurationSelectorSubscriber, _super);
    function ThrottleDurationSelectorSubscriber(parent) {
        _super.call(this, null);
        this.parent = parent;
    }
    ThrottleDurationSelectorSubscriber.prototype._next = function (unused) {
        this.parent.clearThrottle();
    };
    ThrottleDurationSelectorSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    ThrottleDurationSelectorSubscriber.prototype._complete = function () {
        this.parent.clearThrottle();
    };
    return ThrottleDurationSelectorSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=throttle.js.map