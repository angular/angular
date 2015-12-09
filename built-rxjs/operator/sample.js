var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
function sample(notifier) {
    return this.lift(new SampleOperator(notifier));
}
exports.sample = sample;
var SampleOperator = (function () {
    function SampleOperator(notifier) {
        this.notifier = notifier;
    }
    SampleOperator.prototype.call = function (subscriber) {
        return new SampleSubscriber(subscriber, this.notifier);
    };
    return SampleOperator;
})();
var SampleSubscriber = (function (_super) {
    __extends(SampleSubscriber, _super);
    function SampleSubscriber(destination, notifier) {
        _super.call(this, destination);
        this.notifier = notifier;
        this.hasValue = false;
        this.add(notifier._subscribe(new SampleNotificationSubscriber(this)));
    }
    SampleSubscriber.prototype._next = function (value) {
        this.lastValue = value;
        this.hasValue = true;
    };
    SampleSubscriber.prototype.notifyNext = function () {
        if (this.hasValue) {
            this.destination.next(this.lastValue);
        }
    };
    return SampleSubscriber;
})(Subscriber_1.Subscriber);
var SampleNotificationSubscriber = (function (_super) {
    __extends(SampleNotificationSubscriber, _super);
    function SampleNotificationSubscriber(parent) {
        _super.call(this, null);
        this.parent = parent;
    }
    SampleNotificationSubscriber.prototype._next = function () {
        this.parent.notifyNext();
    };
    SampleNotificationSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    SampleNotificationSubscriber.prototype._complete = function () {
        //noop
    };
    return SampleNotificationSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=sample.js.map