var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var Subscription_1 = require('../Subscription');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
/**
 * buffers values from the source by opening the buffer via signals from an observable provided to `openings`, and closing
 * and sending the buffers when an observable returned by the `closingSelector` emits.
 * @param {Observable<O>} openings An observable of notifications to start new buffers
 * @param {Function} an function, that takes the value emitted by the `openings` observable and returns an Observable, which,
 *  when it emits, signals that the associated buffer should be emitted and cleared.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
function bufferToggle(openings, closingSelector) {
    return this.lift(new BufferToggleOperator(openings, closingSelector));
}
exports.bufferToggle = bufferToggle;
var BufferToggleOperator = (function () {
    function BufferToggleOperator(openings, closingSelector) {
        this.openings = openings;
        this.closingSelector = closingSelector;
    }
    BufferToggleOperator.prototype.call = function (subscriber) {
        return new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector);
    };
    return BufferToggleOperator;
})();
var BufferToggleSubscriber = (function (_super) {
    __extends(BufferToggleSubscriber, _super);
    function BufferToggleSubscriber(destination, openings, closingSelector) {
        _super.call(this, destination);
        this.openings = openings;
        this.closingSelector = closingSelector;
        this.contexts = [];
        this.add(this.openings._subscribe(new BufferToggleOpeningsSubscriber(this)));
    }
    BufferToggleSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        var len = contexts.length;
        for (var i = 0; i < len; i++) {
            contexts[i].buffer.push(value);
        }
    };
    BufferToggleSubscriber.prototype._error = function (err) {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            var context = contexts.shift();
            context.subscription.unsubscribe();
            context.buffer = null;
            context.subscription = null;
        }
        this.contexts = null;
        this.destination.error(err);
    };
    BufferToggleSubscriber.prototype._complete = function () {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            var context = contexts.shift();
            this.destination.next(context.buffer);
            context.subscription.unsubscribe();
            context.buffer = null;
            context.subscription = null;
        }
        this.contexts = null;
        this.destination.complete();
    };
    BufferToggleSubscriber.prototype.openBuffer = function (value) {
        var closingSelector = this.closingSelector;
        var contexts = this.contexts;
        var closingNotifier = tryCatch_1.tryCatch(closingSelector)(value);
        if (closingNotifier === errorObject_1.errorObject) {
            this._error(closingNotifier.e);
        }
        else {
            var context = {
                buffer: [],
                subscription: new Subscription_1.Subscription()
            };
            contexts.push(context);
            var subscriber = new BufferToggleClosingsSubscriber(this, context);
            var subscription = closingNotifier._subscribe(subscriber);
            context.subscription.add(subscription);
            this.add(subscription);
        }
    };
    BufferToggleSubscriber.prototype.closeBuffer = function (context) {
        var contexts = this.contexts;
        if (contexts === null) {
            return;
        }
        var buffer = context.buffer, subscription = context.subscription;
        this.destination.next(buffer);
        contexts.splice(contexts.indexOf(context), 1);
        this.remove(subscription);
        subscription.unsubscribe();
    };
    return BufferToggleSubscriber;
})(Subscriber_1.Subscriber);
var BufferToggleOpeningsSubscriber = (function (_super) {
    __extends(BufferToggleOpeningsSubscriber, _super);
    function BufferToggleOpeningsSubscriber(parent) {
        _super.call(this, null);
        this.parent = parent;
    }
    BufferToggleOpeningsSubscriber.prototype._next = function (value) {
        this.parent.openBuffer(value);
    };
    BufferToggleOpeningsSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    BufferToggleOpeningsSubscriber.prototype._complete = function () {
        // noop
    };
    return BufferToggleOpeningsSubscriber;
})(Subscriber_1.Subscriber);
var BufferToggleClosingsSubscriber = (function (_super) {
    __extends(BufferToggleClosingsSubscriber, _super);
    function BufferToggleClosingsSubscriber(parent, context) {
        _super.call(this, null);
        this.parent = parent;
        this.context = context;
    }
    BufferToggleClosingsSubscriber.prototype._next = function () {
        this.parent.closeBuffer(this.context);
    };
    BufferToggleClosingsSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    BufferToggleClosingsSubscriber.prototype._complete = function () {
        this.parent.closeBuffer(this.context);
    };
    return BufferToggleClosingsSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=bufferToggle.js.map