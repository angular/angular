var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fromPromise_1 = require('../observable/fromPromise');
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var isPromise_1 = require('../util/isPromise');
var errorObject_1 = require('../util/errorObject');
function debounce(durationSelector) {
    return this.lift(new DebounceOperator(durationSelector));
}
exports.debounce = debounce;
var DebounceOperator = (function () {
    function DebounceOperator(durationSelector) {
        this.durationSelector = durationSelector;
    }
    DebounceOperator.prototype.call = function (observer) {
        return new DebounceSubscriber(observer, this.durationSelector);
    };
    return DebounceOperator;
})();
var DebounceSubscriber = (function (_super) {
    __extends(DebounceSubscriber, _super);
    function DebounceSubscriber(destination, durationSelector) {
        _super.call(this, destination);
        this.durationSelector = durationSelector;
        this.debouncedSubscription = null;
        this.lastValue = null;
        this._index = 0;
    }
    Object.defineProperty(DebounceSubscriber.prototype, "index", {
        get: function () {
            return this._index;
        },
        enumerable: true,
        configurable: true
    });
    DebounceSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        var currentIndex = ++this._index;
        var debounce = tryCatch_1.tryCatch(this.durationSelector)(value);
        if (debounce === errorObject_1.errorObject) {
            destination.error(errorObject_1.errorObject.e);
        }
        else {
            if (isPromise_1.isPromise(debounce)) {
                debounce = fromPromise_1.PromiseObservable.create(debounce);
            }
            this.lastValue = value;
            this.clearDebounce();
            this.add(this.debouncedSubscription = debounce._subscribe(new DurationSelectorSubscriber(this, currentIndex)));
        }
    };
    DebounceSubscriber.prototype._complete = function () {
        this.debouncedNext();
        this.destination.complete();
    };
    DebounceSubscriber.prototype.debouncedNext = function () {
        this.clearDebounce();
        if (this.lastValue != null) {
            this.destination.next(this.lastValue);
            this.lastValue = null;
        }
    };
    DebounceSubscriber.prototype.clearDebounce = function () {
        var debouncedSubscription = this.debouncedSubscription;
        if (debouncedSubscription) {
            debouncedSubscription.unsubscribe();
            this.remove(debouncedSubscription);
            this.debouncedSubscription = null;
        }
    };
    return DebounceSubscriber;
})(Subscriber_1.Subscriber);
var DurationSelectorSubscriber = (function (_super) {
    __extends(DurationSelectorSubscriber, _super);
    function DurationSelectorSubscriber(parent, currentIndex) {
        _super.call(this, null);
        this.parent = parent;
        this.currentIndex = currentIndex;
    }
    DurationSelectorSubscriber.prototype.debounceNext = function () {
        var parent = this.parent;
        if (this.currentIndex === parent.index) {
            parent.debouncedNext();
            if (!this.isUnsubscribed) {
                this.unsubscribe();
            }
        }
    };
    DurationSelectorSubscriber.prototype._next = function (unused) {
        this.debounceNext();
    };
    DurationSelectorSubscriber.prototype._error = function (err) {
        this.parent.error(err);
    };
    DurationSelectorSubscriber.prototype._complete = function () {
        this.debounceNext();
    };
    return DurationSelectorSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=debounce.js.map