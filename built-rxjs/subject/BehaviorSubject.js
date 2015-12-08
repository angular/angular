var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subject_1 = require('../Subject');
var throwError_1 = require('../util/throwError');
var ObjectUnsubscribedError_1 = require('../util/ObjectUnsubscribedError');
var BehaviorSubject = (function (_super) {
    __extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        _super.call(this);
        this._value = _value;
        this._hasError = false;
    }
    BehaviorSubject.prototype.getValue = function () {
        if (this._hasError) {
            throwError_1.throwError(this._err);
        }
        else if (this.isUnsubscribed) {
            throwError_1.throwError(new ObjectUnsubscribedError_1.ObjectUnsubscribedError());
        }
        else {
            return this._value;
        }
    };
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: true,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        if (!subscription) {
            return;
        }
        else if (!subscription.isUnsubscribed) {
            subscriber.next(this._value);
        }
        return subscription;
    };
    BehaviorSubject.prototype._next = function (value) {
        _super.prototype._next.call(this, this._value = value);
    };
    BehaviorSubject.prototype._error = function (err) {
        this._hasError = true;
        _super.prototype._error.call(this, this._err = err);
    };
    return BehaviorSubject;
})(Subject_1.Subject);
exports.BehaviorSubject = BehaviorSubject;
//# sourceMappingURL=BehaviorSubject.js.map