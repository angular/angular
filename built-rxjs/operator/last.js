var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var EmptyError_1 = require('../util/EmptyError');
function last(predicate, resultSelector, defaultValue) {
    return this.lift(new LastOperator(predicate, resultSelector, defaultValue, this));
}
exports.last = last;
var LastOperator = (function () {
    function LastOperator(predicate, resultSelector, defaultValue, source) {
        this.predicate = predicate;
        this.resultSelector = resultSelector;
        this.defaultValue = defaultValue;
        this.source = source;
    }
    LastOperator.prototype.call = function (observer) {
        return new LastSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source);
    };
    return LastOperator;
})();
var LastSubscriber = (function (_super) {
    __extends(LastSubscriber, _super);
    function LastSubscriber(destination, predicate, resultSelector, defaultValue, source) {
        _super.call(this, destination);
        this.predicate = predicate;
        this.resultSelector = resultSelector;
        this.defaultValue = defaultValue;
        this.source = source;
        this.hasValue = false;
        this.index = 0;
        if (typeof defaultValue !== 'undefined') {
            this.lastValue = defaultValue;
            this.hasValue = true;
        }
    }
    LastSubscriber.prototype._next = function (value) {
        var _a = this, predicate = _a.predicate, resultSelector = _a.resultSelector, destination = _a.destination;
        var index = this.index++;
        if (predicate) {
            var found = tryCatch_1.tryCatch(predicate)(value, index, this.source);
            if (found === errorObject_1.errorObject) {
                destination.error(errorObject_1.errorObject.e);
                return;
            }
            if (found) {
                if (resultSelector) {
                    var result = tryCatch_1.tryCatch(resultSelector)(value, index);
                    if (result === errorObject_1.errorObject) {
                        destination.error(errorObject_1.errorObject.e);
                        return;
                    }
                    this.lastValue = result;
                }
                else {
                    this.lastValue = value;
                }
                this.hasValue = true;
            }
        }
        else {
            this.lastValue = value;
            this.hasValue = true;
        }
    };
    LastSubscriber.prototype._complete = function () {
        var destination = this.destination;
        if (this.hasValue) {
            destination.next(this.lastValue);
            destination.complete();
        }
        else {
            destination.error(new EmptyError_1.EmptyError);
        }
    };
    return LastSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=last.js.map