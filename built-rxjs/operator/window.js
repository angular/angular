var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var Subject_1 = require('../Subject');
function window(closingNotifier) {
    return this.lift(new WindowOperator(closingNotifier));
}
exports.window = window;
var WindowOperator = (function () {
    function WindowOperator(closingNotifier) {
        this.closingNotifier = closingNotifier;
    }
    WindowOperator.prototype.call = function (subscriber) {
        return new WindowSubscriber(subscriber, this.closingNotifier);
    };
    return WindowOperator;
})();
var WindowSubscriber = (function (_super) {
    __extends(WindowSubscriber, _super);
    function WindowSubscriber(destination, closingNotifier) {
        _super.call(this, destination);
        this.closingNotifier = closingNotifier;
        this.window = new Subject_1.Subject();
        this.add(closingNotifier._subscribe(new WindowClosingNotifierSubscriber(this)));
        this.openWindow();
    }
    WindowSubscriber.prototype._next = function (value) {
        this.window.next(value);
    };
    WindowSubscriber.prototype._error = function (err) {
        this.window.error(err);
        this.destination.error(err);
    };
    WindowSubscriber.prototype._complete = function () {
        this.window.complete();
        this.destination.complete();
    };
    WindowSubscriber.prototype.openWindow = function () {
        var prevWindow = this.window;
        if (prevWindow) {
            prevWindow.complete();
        }
        this.destination.next(this.window = new Subject_1.Subject());
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
        this.parent._error(err);
    };
    WindowClosingNotifierSubscriber.prototype._complete = function () {
        this.parent._complete();
    };
    return WindowClosingNotifierSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=window.js.map