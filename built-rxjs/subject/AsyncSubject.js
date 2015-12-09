var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subject_1 = require('../Subject');
var AsyncSubject = (function (_super) {
    __extends(AsyncSubject, _super);
    function AsyncSubject() {
        _super.call(this);
        this._value = void 0;
        this._hasNext = false;
        this._isScalar = false;
    }
    AsyncSubject.prototype._subscribe = function (subscriber) {
        if (this.completeSignal && this._hasNext) {
            subscriber.next(this._value);
        }
        return _super.prototype._subscribe.call(this, subscriber);
    };
    AsyncSubject.prototype._next = function (value) {
        this._value = value;
        this._hasNext = true;
    };
    AsyncSubject.prototype._complete = function () {
        var index = -1;
        var observers = this.observers;
        var len = observers.length;
        // optimization -- block next, complete, and unsubscribe while dispatching
        this.observers = void 0; // optimization
        this.isUnsubscribed = true;
        if (this._hasNext) {
            while (++index < len) {
                var o = observers[index];
                o.next(this._value);
                o.complete();
            }
        }
        else {
            while (++index < len) {
                observers[index].complete();
            }
        }
        this.isUnsubscribed = false;
    };
    return AsyncSubject;
})(Subject_1.Subject);
exports.AsyncSubject = AsyncSubject;
//# sourceMappingURL=AsyncSubject.js.map