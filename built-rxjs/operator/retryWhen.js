var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var Subject_1 = require('../Subject');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
function retryWhen(notifier) {
    return this.lift(new RetryWhenOperator(notifier, this));
}
exports.retryWhen = retryWhen;
var RetryWhenOperator = (function () {
    function RetryWhenOperator(notifier, source) {
        this.notifier = notifier;
        this.source = source;
    }
    RetryWhenOperator.prototype.call = function (subscriber) {
        return new FirstRetryWhenSubscriber(subscriber, this.notifier, this.source);
    };
    return RetryWhenOperator;
})();
var FirstRetryWhenSubscriber = (function (_super) {
    __extends(FirstRetryWhenSubscriber, _super);
    function FirstRetryWhenSubscriber(destination, notifier, source) {
        _super.call(this);
        this.destination = destination;
        this.notifier = notifier;
        this.source = source;
        destination.add(this);
        this.lastSubscription = this;
    }
    FirstRetryWhenSubscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    FirstRetryWhenSubscriber.prototype.error = function (err) {
        var destination = this.destination;
        if (!this.isUnsubscribed) {
            _super.prototype.unsubscribe.call(this);
            if (!this.retryNotifications) {
                this.errors = new Subject_1.Subject();
                var notifications = tryCatch_1.tryCatch(this.notifier).call(this, this.errors);
                if (notifications === errorObject_1.errorObject) {
                    destination.error(errorObject_1.errorObject.e);
                }
                else {
                    this.retryNotifications = notifications;
                    var notificationSubscriber = new RetryNotificationSubscriber(this);
                    this.notificationSubscription = notifications.subscribe(notificationSubscriber);
                    destination.add(this.notificationSubscription);
                }
            }
            this.errors.next(err);
        }
    };
    FirstRetryWhenSubscriber.prototype.destinationError = function (err) {
        this.tearDown();
        this.destination.error(err);
    };
    FirstRetryWhenSubscriber.prototype._complete = function () {
        this.destinationComplete();
    };
    FirstRetryWhenSubscriber.prototype.destinationComplete = function () {
        this.tearDown();
        this.destination.complete();
    };
    FirstRetryWhenSubscriber.prototype.unsubscribe = function () {
        var lastSubscription = this.lastSubscription;
        if (lastSubscription === this) {
            _super.prototype.unsubscribe.call(this);
        }
        else {
            this.tearDown();
        }
    };
    FirstRetryWhenSubscriber.prototype.tearDown = function () {
        _super.prototype.unsubscribe.call(this);
        this.lastSubscription.unsubscribe();
        var notificationSubscription = this.notificationSubscription;
        if (notificationSubscription) {
            notificationSubscription.unsubscribe();
        }
    };
    FirstRetryWhenSubscriber.prototype.resubscribe = function () {
        var _a = this, destination = _a.destination, lastSubscription = _a.lastSubscription;
        destination.remove(lastSubscription);
        lastSubscription.unsubscribe();
        var nextSubscriber = new MoreRetryWhenSubscriber(this);
        this.lastSubscription = this.source.subscribe(nextSubscriber);
        destination.add(this.lastSubscription);
    };
    return FirstRetryWhenSubscriber;
})(Subscriber_1.Subscriber);
var MoreRetryWhenSubscriber = (function (_super) {
    __extends(MoreRetryWhenSubscriber, _super);
    function MoreRetryWhenSubscriber(parent) {
        _super.call(this, null);
        this.parent = parent;
    }
    MoreRetryWhenSubscriber.prototype._next = function (value) {
        this.parent.destination.next(value);
    };
    MoreRetryWhenSubscriber.prototype._error = function (err) {
        this.parent.errors.next(err);
    };
    MoreRetryWhenSubscriber.prototype._complete = function () {
        this.parent.destinationComplete();
    };
    return MoreRetryWhenSubscriber;
})(Subscriber_1.Subscriber);
var RetryNotificationSubscriber = (function (_super) {
    __extends(RetryNotificationSubscriber, _super);
    function RetryNotificationSubscriber(parent) {
        _super.call(this, null);
        this.parent = parent;
    }
    RetryNotificationSubscriber.prototype._next = function (value) {
        this.parent.resubscribe();
    };
    RetryNotificationSubscriber.prototype._error = function (err) {
        this.parent.destinationError(err);
    };
    RetryNotificationSubscriber.prototype._complete = function () {
        this.parent.destinationComplete();
    };
    return RetryNotificationSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=retryWhen.js.map