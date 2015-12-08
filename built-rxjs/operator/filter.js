var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var bindCallback_1 = require('../util/bindCallback');
/**
 * Similar to the well-known `Array.prototype.filter` method, this operator filters values down to a set
 * allowed by a `select` function
 *
 * @param {Function} select a function that is used to select the resulting values
 *  if it returns `true`, the value is emitted, if `false` the value is not passed to the resulting observable
 * @param {any} [thisArg] an optional argument to determine the value of `this` in the `select` function
 * @returns {Observable} an observable of values allowed by the select function
 */
function filter(select, thisArg) {
    return this.lift(new FilterOperator(select, thisArg));
}
exports.filter = filter;
var FilterOperator = (function () {
    function FilterOperator(select, thisArg) {
        this.select = bindCallback_1.bindCallback(select, thisArg, 2);
    }
    FilterOperator.prototype.call = function (subscriber) {
        return new FilterSubscriber(subscriber, this.select);
    };
    return FilterOperator;
})();
var FilterSubscriber = (function (_super) {
    __extends(FilterSubscriber, _super);
    function FilterSubscriber(destination, select) {
        _super.call(this, destination);
        this.count = 0;
        this.select = select;
    }
    FilterSubscriber.prototype._next = function (x) {
        var result = tryCatch_1.tryCatch(this.select)(x, this.count++);
        if (result === errorObject_1.errorObject) {
            this.destination.error(errorObject_1.errorObject.e);
        }
        else if (Boolean(result)) {
            this.destination.next(x);
        }
    };
    return FilterSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=filter.js.map