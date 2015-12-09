var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
function switchMapTo(observable, projectResult) {
    return this.lift(new SwitchMapToOperator(observable, projectResult));
}
exports.switchMapTo = switchMapTo;
var SwitchMapToOperator = (function () {
    function SwitchMapToOperator(observable, resultSelector) {
        this.observable = observable;
        this.resultSelector = resultSelector;
    }
    SwitchMapToOperator.prototype.call = function (subscriber) {
        return new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector);
    };
    return SwitchMapToOperator;
})();
var SwitchMapToSubscriber = (function (_super) {
    __extends(SwitchMapToSubscriber, _super);
    function SwitchMapToSubscriber(destination, inner, resultSelector) {
        _super.call(this, destination);
        this.inner = inner;
        this.resultSelector = resultSelector;
        this.hasCompleted = false;
        this.index = 0;
    }
    SwitchMapToSubscriber.prototype._next = function (value) {
        var index = this.index++;
        var innerSubscription = this.innerSubscription;
        if (innerSubscription) {
            innerSubscription.unsubscribe();
        }
        this.add(this.innerSubscription = subscribeToResult_1.subscribeToResult(this, this.inner, value, index));
    };
    SwitchMapToSubscriber.prototype._complete = function () {
        var innerSubscription = this.innerSubscription;
        this.hasCompleted = true;
        if (!innerSubscription || innerSubscription.isUnsubscribed) {
            this.destination.complete();
        }
    };
    SwitchMapToSubscriber.prototype.notifyComplete = function (innerSub) {
        this.remove(innerSub);
        var prevSubscription = this.innerSubscription;
        if (prevSubscription) {
            prevSubscription.unsubscribe();
        }
        this.innerSubscription = null;
        if (this.hasCompleted) {
            this.destination.complete();
        }
    };
    SwitchMapToSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    SwitchMapToSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex) {
        var _a = this, resultSelector = _a.resultSelector, destination = _a.destination;
        if (resultSelector) {
            var result = tryCatch_1.tryCatch(resultSelector)(outerValue, innerValue, outerIndex, innerIndex);
            if (result === errorObject_1.errorObject) {
                destination.error(errorObject_1.errorObject.e);
            }
            else {
                destination.next(result);
            }
        }
        else {
            destination.next(innerValue);
        }
    };
    return SwitchMapToSubscriber;
})(OuterSubscriber_1.OuterSubscriber);
//# sourceMappingURL=switchMapTo.js.map