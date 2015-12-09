var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var noop_1 = require('../util/noop');
function takeUntil(notifier) {
    return this.lift(new TakeUntilOperator(notifier));
}
exports.takeUntil = takeUntil;
var TakeUntilOperator = (function () {
    function TakeUntilOperator(notifier) {
        this.notifier = notifier;
    }
    TakeUntilOperator.prototype.call = function (subscriber) {
        return new TakeUntilSubscriber(subscriber, this.notifier);
    };
    return TakeUntilOperator;
})();
var TakeUntilSubscriber = (function (_super) {
    __extends(TakeUntilSubscriber, _super);
    function TakeUntilSubscriber(destination, notifier) {
        _super.call(this, destination);
        this.notifier = notifier;
        this.notificationSubscriber = null;
        this.notificationSubscriber = new TakeUntilInnerSubscriber(destination);
        this.add(notifier.subscribe(this.notificationSubscriber));
    }
    TakeUntilSubscriber.prototype._complete = function () {
        this.destination.complete();
        this.notificationSubscriber.unsubscribe();
    };
    return TakeUntilSubscriber;
})(Subscriber_1.Subscriber);
var TakeUntilInnerSubscriber = (function (_super) {
    __extends(TakeUntilInnerSubscriber, _super);
    function TakeUntilInnerSubscriber(destination) {
        _super.call(this, null);
        this.destination = destination;
    }
    TakeUntilInnerSubscriber.prototype._next = function (unused) {
        this.destination.complete();
    };
    TakeUntilInnerSubscriber.prototype._error = function (err) {
        this.destination.error(err);
    };
    TakeUntilInnerSubscriber.prototype._complete = function () {
        noop_1.noop();
    };
    return TakeUntilInnerSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=takeUntil.js.map