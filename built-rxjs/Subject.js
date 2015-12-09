var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('./Observable');
var Subscriber_1 = require('./Subscriber');
var Subscription_1 = require('./Subscription');
var SubjectSubscription_1 = require('./subject/SubjectSubscription');
var rxSubscriber_1 = require('./symbol/rxSubscriber');
var subscriptionAdd = Subscription_1.Subscription.prototype.add;
var subscriptionRemove = Subscription_1.Subscription.prototype.remove;
var subscriptionUnsubscribe = Subscription_1.Subscription.prototype.unsubscribe;
var subscriberNext = Subscriber_1.Subscriber.prototype.next;
var subscriberError = Subscriber_1.Subscriber.prototype.error;
var subscriberComplete = Subscriber_1.Subscriber.prototype.complete;
var _subscriberNext = Subscriber_1.Subscriber.prototype._next;
var _subscriberError = Subscriber_1.Subscriber.prototype._error;
var _subscriberComplete = Subscriber_1.Subscriber.prototype._complete;
var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        _super.apply(this, arguments);
        this.observers = [];
        this.isUnsubscribed = false;
        this.dispatching = false;
        this.errorSignal = false;
        this.completeSignal = false;
    }
    Subject.prototype[rxSubscriber_1.rxSubscriber] = function () {
        return this;
    };
    Subject.create = function (source, destination) {
        return new BidirectionalSubject(source, destination);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new BidirectionalSubject(this, this.destination || this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (subscriber.isUnsubscribed) {
            return;
        }
        else if (this.errorSignal) {
            subscriber.error(this.errorInstance);
            return;
        }
        else if (this.completeSignal) {
            subscriber.complete();
            return;
        }
        else if (this.isUnsubscribed) {
            throw new Error('Cannot subscribe to a disposed Subject.');
        }
        this.observers.push(subscriber);
        return new SubjectSubscription_1.SubjectSubscription(this, subscriber);
    };
    Subject.prototype.add = function (subscription) {
        subscriptionAdd.call(this, subscription);
    };
    Subject.prototype.remove = function (subscription) {
        subscriptionRemove.call(this, subscription);
    };
    Subject.prototype.unsubscribe = function () {
        this.observers = void 0;
        subscriptionUnsubscribe.call(this);
    };
    Subject.prototype.next = function (value) {
        if (this.isUnsubscribed) {
            return;
        }
        this.dispatching = true;
        this._next(value);
        this.dispatching = false;
        if (this.errorSignal) {
            this.error(this.errorInstance);
        }
        else if (this.completeSignal) {
            this.complete();
        }
    };
    Subject.prototype.error = function (err) {
        if (this.isUnsubscribed || this.completeSignal) {
            return;
        }
        this.errorSignal = true;
        this.errorInstance = err;
        if (this.dispatching) {
            return;
        }
        this._error(err);
        this.unsubscribe();
    };
    Subject.prototype.complete = function () {
        if (this.isUnsubscribed || this.errorSignal) {
            return;
        }
        this.completeSignal = true;
        if (this.dispatching) {
            return;
        }
        this._complete();
        this.unsubscribe();
    };
    Subject.prototype._next = function (value) {
        var index = -1;
        var observers = this.observers.slice(0);
        var len = observers.length;
        while (++index < len) {
            observers[index].next(value);
        }
    };
    Subject.prototype._error = function (err) {
        var index = -1;
        var observers = this.observers;
        var len = observers.length;
        // optimization -- block next, complete, and unsubscribe while dispatching
        this.observers = void 0;
        this.isUnsubscribed = true;
        while (++index < len) {
            observers[index].error(err);
        }
        this.isUnsubscribed = false;
    };
    Subject.prototype._complete = function () {
        var index = -1;
        var observers = this.observers;
        var len = observers.length;
        // optimization -- block next, complete, and unsubscribe while dispatching
        this.observers = void 0; // optimization
        this.isUnsubscribed = true;
        while (++index < len) {
            observers[index].complete();
        }
        this.isUnsubscribed = false;
    };
    return Subject;
})(Observable_1.Observable);
exports.Subject = Subject;
var BidirectionalSubject = (function (_super) {
    __extends(BidirectionalSubject, _super);
    function BidirectionalSubject(source, destination) {
        _super.call(this);
        this.source = source;
        this.destination = destination;
    }
    BidirectionalSubject.prototype._subscribe = function (subscriber) {
        var operator = this.operator;
        return this.source._subscribe.call(this.source, operator ? operator.call(subscriber) : subscriber);
    };
    BidirectionalSubject.prototype.next = function (value) {
        subscriberNext.call(this, value);
    };
    BidirectionalSubject.prototype.error = function (err) {
        subscriberError.call(this, err);
    };
    BidirectionalSubject.prototype.complete = function () {
        subscriberComplete.call(this);
    };
    BidirectionalSubject.prototype._next = function (value) {
        _subscriberNext.call(this, value);
    };
    BidirectionalSubject.prototype._error = function (err) {
        _subscriberError.call(this, err);
    };
    BidirectionalSubject.prototype._complete = function () {
        _subscriberComplete.call(this);
    };
    return BidirectionalSubject;
})(Subject);
//# sourceMappingURL=Subject.js.map