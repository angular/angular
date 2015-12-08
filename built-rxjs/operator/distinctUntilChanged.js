var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
function distinctUntilChanged(compare) {
    return this.lift(new DistinctUntilChangedOperator(compare));
}
exports.distinctUntilChanged = distinctUntilChanged;
var DistinctUntilChangedOperator = (function () {
    function DistinctUntilChangedOperator(compare) {
        this.compare = compare;
    }
    DistinctUntilChangedOperator.prototype.call = function (subscriber) {
        return new DistinctUntilChangedSubscriber(subscriber, this.compare);
    };
    return DistinctUntilChangedOperator;
})();
var DistinctUntilChangedSubscriber = (function (_super) {
    __extends(DistinctUntilChangedSubscriber, _super);
    function DistinctUntilChangedSubscriber(destination, compare) {
        _super.call(this, destination);
        this.hasValue = false;
        if (typeof compare === 'function') {
            this.compare = compare;
        }
    }
    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
        return x === y;
    };
    DistinctUntilChangedSubscriber.prototype._next = function (value) {
        var result = false;
        if (this.hasValue) {
            result = tryCatch_1.tryCatch(this.compare)(this.value, value);
            if (result === errorObject_1.errorObject) {
                this.destination.error(errorObject_1.errorObject.e);
                return;
            }
        }
        else {
            this.hasValue = true;
        }
        if (Boolean(result) === false) {
            this.value = value;
            this.destination.next(value);
        }
    };
    return DistinctUntilChangedSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=distinctUntilChanged.js.map