var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
function switchMap(project, resultSelector) {
    return this.lift(new SwitchMapOperator(project, resultSelector));
}
exports.switchMap = switchMap;
var SwitchMapOperator = (function () {
    function SwitchMapOperator(project, resultSelector) {
        this.project = project;
        this.resultSelector = resultSelector;
    }
    SwitchMapOperator.prototype.call = function (subscriber) {
        return new SwitchMapSubscriber(subscriber, this.project, this.resultSelector);
    };
    return SwitchMapOperator;
})();
var SwitchMapSubscriber = (function (_super) {
    __extends(SwitchMapSubscriber, _super);
    function SwitchMapSubscriber(destination, project, resultSelector) {
        _super.call(this, destination);
        this.project = project;
        this.resultSelector = resultSelector;
        this.hasCompleted = false;
        this.index = 0;
    }
    SwitchMapSubscriber.prototype._next = function (value) {
        var index = this.index++;
        var destination = this.destination;
        var result = tryCatch_1.tryCatch(this.project)(value, index);
        if (result === errorObject_1.errorObject) {
            destination.error(result.e);
        }
        else {
            var innerSubscription = this.innerSubscription;
            if (innerSubscription) {
                innerSubscription.unsubscribe();
            }
            this.add(this.innerSubscription = subscribeToResult_1.subscribeToResult(this, result, value, index));
        }
    };
    SwitchMapSubscriber.prototype._complete = function () {
        var innerSubscription = this.innerSubscription;
        this.hasCompleted = true;
        if (!innerSubscription || innerSubscription.isUnsubscribed) {
            this.destination.complete();
        }
    };
    SwitchMapSubscriber.prototype.notifyComplete = function (innerSub) {
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
    SwitchMapSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    SwitchMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex) {
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
    return SwitchMapSubscriber;
})(OuterSubscriber_1.OuterSubscriber);
//# sourceMappingURL=switchMap.js.map