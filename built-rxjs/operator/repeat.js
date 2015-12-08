var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var empty_1 = require('../observable/empty');
function repeat(count) {
    if (count === void 0) { count = -1; }
    if (count === 0) {
        return new empty_1.EmptyObservable();
    }
    else {
        return this.lift(new RepeatOperator(count, this));
    }
}
exports.repeat = repeat;
var RepeatOperator = (function () {
    function RepeatOperator(count, source) {
        this.count = count;
        this.source = source;
    }
    RepeatOperator.prototype.call = function (subscriber) {
        return new FirstRepeatSubscriber(subscriber, this.count, this.source);
    };
    return RepeatOperator;
})();
var FirstRepeatSubscriber = (function (_super) {
    __extends(FirstRepeatSubscriber, _super);
    function FirstRepeatSubscriber(destination, count, source) {
        _super.call(this);
        this.destination = destination;
        this.count = count;
        this.source = source;
        destination.add(this);
        this.lastSubscription = this;
    }
    FirstRepeatSubscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    FirstRepeatSubscriber.prototype._error = function (err) {
        this.destination.error(err);
    };
    FirstRepeatSubscriber.prototype.complete = function () {
        if (!this.isUnsubscribed) {
            this.resubscribe(this.count);
        }
    };
    FirstRepeatSubscriber.prototype.unsubscribe = function () {
        var lastSubscription = this.lastSubscription;
        if (lastSubscription === this) {
            _super.prototype.unsubscribe.call(this);
        }
        else {
            lastSubscription.unsubscribe();
        }
    };
    FirstRepeatSubscriber.prototype.resubscribe = function (count) {
        var _a = this, destination = _a.destination, lastSubscription = _a.lastSubscription;
        destination.remove(lastSubscription);
        lastSubscription.unsubscribe();
        if (count - 1 === 0) {
            destination.complete();
        }
        else {
            var nextSubscriber = new MoreRepeatSubscriber(this, count - 1);
            this.lastSubscription = this.source.subscribe(nextSubscriber);
            destination.add(this.lastSubscription);
        }
    };
    return FirstRepeatSubscriber;
})(Subscriber_1.Subscriber);
var MoreRepeatSubscriber = (function (_super) {
    __extends(MoreRepeatSubscriber, _super);
    function MoreRepeatSubscriber(parent, count) {
        _super.call(this);
        this.parent = parent;
        this.count = count;
    }
    MoreRepeatSubscriber.prototype._next = function (value) {
        this.parent.destination.next(value);
    };
    MoreRepeatSubscriber.prototype._error = function (err) {
        this.parent.destination.error(err);
    };
    MoreRepeatSubscriber.prototype._complete = function () {
        var count = this.count;
        this.parent.resubscribe(count < 0 ? -1 : count);
    };
    return MoreRepeatSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=repeat.js.map