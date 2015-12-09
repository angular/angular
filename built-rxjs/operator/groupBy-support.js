var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscription_1 = require('../Subscription');
var Observable_1 = require('../Observable');
var RefCountSubscription = (function (_super) {
    __extends(RefCountSubscription, _super);
    function RefCountSubscription() {
        _super.call(this);
        this.attemptedToUnsubscribePrimary = false;
        this.count = 0;
    }
    RefCountSubscription.prototype.setPrimary = function (subscription) {
        this.primary = subscription;
    };
    RefCountSubscription.prototype.unsubscribe = function () {
        if (!this.isUnsubscribed && !this.attemptedToUnsubscribePrimary) {
            this.attemptedToUnsubscribePrimary = true;
            if (this.count === 0) {
                _super.prototype.unsubscribe.call(this);
                this.primary.unsubscribe();
            }
        }
    };
    return RefCountSubscription;
})(Subscription_1.Subscription);
exports.RefCountSubscription = RefCountSubscription;
var GroupedObservable = (function (_super) {
    __extends(GroupedObservable, _super);
    function GroupedObservable(key, groupSubject, refCountSubscription) {
        _super.call(this);
        this.key = key;
        this.groupSubject = groupSubject;
        this.refCountSubscription = refCountSubscription;
    }
    GroupedObservable.prototype._subscribe = function (subscriber) {
        var subscription = new Subscription_1.Subscription();
        if (this.refCountSubscription && !this.refCountSubscription.isUnsubscribed) {
            subscription.add(new InnerRefCountSubscription(this.refCountSubscription));
        }
        subscription.add(this.groupSubject.subscribe(subscriber));
        return subscription;
    };
    return GroupedObservable;
})(Observable_1.Observable);
exports.GroupedObservable = GroupedObservable;
var InnerRefCountSubscription = (function (_super) {
    __extends(InnerRefCountSubscription, _super);
    function InnerRefCountSubscription(parent) {
        _super.call(this);
        this.parent = parent;
        parent.count++;
    }
    InnerRefCountSubscription.prototype.unsubscribe = function () {
        if (!this.parent.isUnsubscribed && !this.isUnsubscribed) {
            _super.prototype.unsubscribe.call(this);
            this.parent.count--;
            if (this.parent.count === 0 && this.parent.attemptedToUnsubscribePrimary) {
                this.parent.unsubscribe();
                this.parent.primary.unsubscribe();
            }
        }
    };
    return InnerRefCountSubscription;
})(Subscription_1.Subscription);
exports.InnerRefCountSubscription = InnerRefCountSubscription;
//# sourceMappingURL=groupBy-support.js.map