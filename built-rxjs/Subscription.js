var noop_1 = require('./util/noop');
var Subscription = (function () {
    function Subscription(_unsubscribe) {
        this.isUnsubscribed = false;
        if (_unsubscribe) {
            this._unsubscribe = _unsubscribe;
        }
    }
    Subscription.prototype._unsubscribe = function () {
        noop_1.noop();
    };
    Subscription.prototype.unsubscribe = function () {
        if (this.isUnsubscribed) {
            return;
        }
        this.isUnsubscribed = true;
        var unsubscribe = this._unsubscribe;
        var subscriptions = this._subscriptions;
        this._subscriptions = void 0;
        if (unsubscribe) {
            unsubscribe.call(this);
        }
        if (subscriptions != null) {
            var index = -1;
            var len = subscriptions.length;
            while (++index < len) {
                subscriptions[index].unsubscribe();
            }
        }
    };
    Subscription.prototype.add = function (subscription) {
        // return early if:
        //  1. the subscription is null
        //  2. we're attempting to add our this
        //  3. we're attempting to add the static `empty` Subscription
        if (!subscription || (subscription === this) || (subscription === Subscription.EMPTY)) {
            return;
        }
        var sub = subscription;
        switch (typeof subscription) {
            case 'function':
                sub = new Subscription(subscription);
            case 'object':
                if (sub.isUnsubscribed || typeof sub.unsubscribe !== 'function') {
                    break;
                }
                else if (this.isUnsubscribed) {
                    sub.unsubscribe();
                }
                else {
                    var subscriptions = this._subscriptions || (this._subscriptions = []);
                    subscriptions.push(sub);
                }
                break;
            default:
                throw new Error('Unrecognized subscription ' + subscription + ' added to Subscription.');
        }
    };
    Subscription.prototype.remove = function (subscription) {
        // return early if:
        //  1. the subscription is null
        //  2. we're attempting to remove ourthis
        //  3. we're attempting to remove the static `empty` Subscription
        if (subscription == null || (subscription === this) || (subscription === Subscription.EMPTY)) {
            return;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.isUnsubscribed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
})();
exports.Subscription = Subscription;
//# sourceMappingURL=Subscription.js.map