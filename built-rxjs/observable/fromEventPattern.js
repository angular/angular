var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
var Subscription_1 = require('../Subscription');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var FromEventPatternObservable = (function (_super) {
    __extends(FromEventPatternObservable, _super);
    function FromEventPatternObservable(addHandler, removeHandler, selector) {
        _super.call(this);
        this.addHandler = addHandler;
        this.removeHandler = removeHandler;
        this.selector = selector;
    }
    FromEventPatternObservable.create = function (addHandler, removeHandler, selector) {
        return new FromEventPatternObservable(addHandler, removeHandler, selector);
    };
    FromEventPatternObservable.prototype._subscribe = function (subscriber) {
        var addHandler = this.addHandler;
        var removeHandler = this.removeHandler;
        var selector = this.selector;
        var handler = selector ? function (e) {
            var result = tryCatch_1.tryCatch(selector).apply(null, arguments);
            if (result === errorObject_1.errorObject) {
                subscriber.error(result.e);
            }
            else {
                subscriber.next(result);
            }
        } : function (e) { subscriber.next(e); };
        var result = tryCatch_1.tryCatch(addHandler)(handler);
        if (result === errorObject_1.errorObject) {
            subscriber.error(result.e);
        }
        subscriber.add(new Subscription_1.Subscription(function () {
            //TODO: determine whether or not to forward to error handler
            removeHandler(handler);
        }));
    };
    return FromEventPatternObservable;
})(Observable_1.Observable);
exports.FromEventPatternObservable = FromEventPatternObservable;
//# sourceMappingURL=fromEventPattern.js.map