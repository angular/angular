var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var Subject_1 = require('../Subject');
var Subscription_1 = require('../Subscription');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
function windowWhen(closingSelector) {
    return this.lift(new WindowOperator(closingSelector));
}
exports.windowWhen = windowWhen;
var WindowOperator = (function () {
    function WindowOperator(closingSelector) {
        this.closingSelector = closingSelector;
    }
    WindowOperator.prototype.call = function (subscriber) {
        return new WindowSubscriber(subscriber, this.closingSelector);
    };
    return WindowOperator;
})();
var WindowSubscriber = (function (_super) {
    __extends(WindowSubscriber, _super);
    function WindowSubscriber(destination, closingSelector) {
        _super.call(this, destination);
        this.closingSelector = closingSelector;
        this.window = new Subject_1.Subject();
        this.openWindow();
    }
    WindowSubscriber.prototype._next = function (value) {
        this.window.next(value);
    };
    WindowSubscriber.prototype._error = function (err) {
        this.window.error(err);
        this.destination.error(err);
        this._unsubscribeClosingNotification();
    };
    WindowSubscriber.prototype._complete = function () {
        this.window.complete();
        this.destination.complete();
        this._unsubscribeClosingNotification();
    };
    WindowSubscriber.prototype.unsubscribe = function () {
        _super.prototype.unsubscribe.call(this);
        this._unsubscribeClosingNotification();
    };
    WindowSubscriber.prototype._unsubscribeClosingNotification = function () {
        var closingNotification = this.closingNotification;
        if (closingNotification) {
            closingNotification.unsubscribe();
        }
    };
    WindowSubscriber.prototype.openWindow = function () {
        var prevClosingNotification = this.closingNotification;
        if (prevClosingNotification) {
            this.remove(prevClosingNotification);
            prevClosingNotification.unsubscribe();
        }
        var prevWindow = this.window;
        if (prevWindow) {
            prevWindow.complete();
        }
        this.destination.next(this.window = new Subject_1.Subject());
        var closingNotifier = tryCatch_1.tryCatch(this.closingSelector)();
        if (closingNotifier === errorObject_1.errorObject) {
            var err = closingNotifier.e;
            this.destination.error(err);
            this.window.error(err);
        }
        else {
            var closingNotification = this.closingNotification = new Subscription_1.Subscription();
            this.add(closingNotification.add(closingNotifier._subscribe(new WindowClosingNotifierSubscriber(this))));
        }
    };
    return WindowSubscriber;
})(Subscriber_1.Subscriber);
var WindowClosingNotifierSubscriber = (function (_super) {
    __extends(WindowClosingNotifierSubscriber, _super);
    function WindowClosingNotifierSubscriber(parent) {
        _super.call(this, null);
        this.parent = parent;
    }
    WindowClosingNotifierSubscriber.prototype._next = function () {
        this.parent.openWindow();
    };
    WindowClosingNotifierSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    WindowClosingNotifierSubscriber.prototype._complete = function () {
        this.parent.openWindow();
    };
    return WindowClosingNotifierSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=windowWhen.js.map