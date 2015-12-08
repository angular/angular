var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
function skipUntil(notifier) {
    return this.lift(new SkipUntilOperator(notifier));
}
exports.skipUntil = skipUntil;
var SkipUntilOperator = (function () {
    function SkipUntilOperator(notifier) {
        this.notifier = notifier;
    }
    SkipUntilOperator.prototype.call = function (subscriber) {
        return new SkipUntilSubscriber(subscriber, this.notifier);
    };
    return SkipUntilOperator;
})();
var SkipUntilSubscriber = (function (_super) {
    __extends(SkipUntilSubscriber, _super);
    function SkipUntilSubscriber(destination, notifier) {
        _super.call(this, destination);
        this.notifier = notifier;
        this.notificationSubscriber = null;
        this.notificationSubscriber = new NotificationSubscriber(this);
        this.add(this.notifier.subscribe(this.notificationSubscriber));
    }
    SkipUntilSubscriber.prototype._next = function (value) {
        if (this.notificationSubscriber.hasValue) {
            this.destination.next(value);
        }
    };
    SkipUntilSubscriber.prototype._error = function (err) {
        this.destination.error(err);
    };
    SkipUntilSubscriber.prototype._complete = function () {
        if (this.notificationSubscriber.hasCompleted) {
            this.destination.complete();
        }
        this.notificationSubscriber.unsubscribe();
    };
    SkipUntilSubscriber.prototype.unsubscribe = function () {
        if (this._isUnsubscribed) {
            return;
        }
        else if (this._subscription) {
            this._subscription.unsubscribe();
            this._isUnsubscribed = true;
        }
        else {
            _super.prototype.unsubscribe.call(this);
        }
    };
    return SkipUntilSubscriber;
})(Subscriber_1.Subscriber);
var NotificationSubscriber = (function (_super) {
    __extends(NotificationSubscriber, _super);
    function NotificationSubscriber(parent) {
        _super.call(this, null);
        this.parent = parent;
        this.hasValue = false;
        this.hasCompleted = false;
    }
    NotificationSubscriber.prototype._next = function (unused) {
        this.hasValue = true;
    };
    NotificationSubscriber.prototype._error = function (err) {
        this.parent.error(err);
        this.hasValue = true;
    };
    NotificationSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
    };
    return NotificationSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=skipUntil.js.map