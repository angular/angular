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
function windowToggle(openings, closingSelector) {
    return this.lift(new WindowToggleOperator(openings, closingSelector));
}
exports.windowToggle = windowToggle;
var WindowToggleOperator = (function () {
    function WindowToggleOperator(openings, closingSelector) {
        this.openings = openings;
        this.closingSelector = closingSelector;
    }
    WindowToggleOperator.prototype.call = function (subscriber) {
        return new WindowToggleSubscriber(subscriber, this.openings, this.closingSelector);
    };
    return WindowToggleOperator;
})();
var WindowToggleSubscriber = (function (_super) {
    __extends(WindowToggleSubscriber, _super);
    function WindowToggleSubscriber(destination, openings, closingSelector) {
        _super.call(this, destination);
        this.openings = openings;
        this.closingSelector = closingSelector;
        this.contexts = [];
        this.add(this.openings._subscribe(new WindowToggleOpeningsSubscriber(this)));
    }
    WindowToggleSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        var len = contexts.length;
        for (var i = 0; i < len; i++) {
            contexts[i].window.next(value);
        }
    };
    WindowToggleSubscriber.prototype._error = function (err) {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            contexts.shift().window.error(err);
        }
        this.destination.error(err);
    };
    WindowToggleSubscriber.prototype._complete = function () {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            var context = contexts.shift();
            context.window.complete();
            context.subscription.unsubscribe();
        }
        this.destination.complete();
    };
    WindowToggleSubscriber.prototype.openWindow = function (value) {
        var closingSelector = this.closingSelector;
        var closingNotifier = tryCatch_1.tryCatch(closingSelector)(value);
        if (closingNotifier === errorObject_1.errorObject) {
            this.error(closingNotifier.e);
        }
        else {
            var context = {
                window: new Subject_1.Subject(),
                subscription: new Subscription_1.Subscription()
            };
            this.contexts.push(context);
            this.destination.next(context.window);
            var subscriber = new WindowClosingNotifierSubscriber(this, context);
            var subscription = closingNotifier._subscribe(subscriber);
            this.add(context.subscription.add(subscription));
        }
    };
    WindowToggleSubscriber.prototype.closeWindow = function (context) {
        var window = context.window, subscription = context.subscription;
        var contexts = this.contexts;
        contexts.splice(contexts.indexOf(context), 1);
        window.complete();
        this.remove(subscription);
        subscription.unsubscribe();
    };
    return WindowToggleSubscriber;
})(Subscriber_1.Subscriber);
var WindowClosingNotifierSubscriber = (function (_super) {
    __extends(WindowClosingNotifierSubscriber, _super);
    function WindowClosingNotifierSubscriber(parent, windowContext) {
        _super.call(this, null);
        this.parent = parent;
        this.windowContext = windowContext;
    }
    WindowClosingNotifierSubscriber.prototype._next = function () {
        this.parent.closeWindow(this.windowContext);
    };
    WindowClosingNotifierSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    WindowClosingNotifierSubscriber.prototype._complete = function () {
        this.parent.closeWindow(this.windowContext);
    };
    return WindowClosingNotifierSubscriber;
})(Subscriber_1.Subscriber);
var WindowToggleOpeningsSubscriber = (function (_super) {
    __extends(WindowToggleOpeningsSubscriber, _super);
    function WindowToggleOpeningsSubscriber(parent) {
        _super.call(this);
        this.parent = parent;
    }
    WindowToggleOpeningsSubscriber.prototype._next = function (value) {
        this.parent.openWindow(value);
    };
    WindowToggleOpeningsSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    WindowToggleOpeningsSubscriber.prototype._complete = function () {
        // noop
    };
    return WindowToggleOpeningsSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=windowToggle.js.map