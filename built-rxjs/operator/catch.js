var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
/**
 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
 * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which
 *  is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable
 *  is returned by the `selector` will be used to continue the observable chain.
 * @return {Observable} an observable that originates from either the source or the observable returned by the
 *  catch `selector` function.
 */
function _catch(selector) {
    var catchOperator = new CatchOperator(selector);
    var caught = this.lift(catchOperator);
    catchOperator.caught = caught;
    return caught;
}
exports._catch = _catch;
var CatchOperator = (function () {
    function CatchOperator(selector) {
        this.selector = selector;
    }
    CatchOperator.prototype.call = function (subscriber) {
        return new CatchSubscriber(subscriber, this.selector, this.caught);
    };
    return CatchOperator;
})();
var CatchSubscriber = (function (_super) {
    __extends(CatchSubscriber, _super);
    function CatchSubscriber(destination, selector, caught) {
        _super.call(this, null);
        this.destination = destination;
        this.selector = selector;
        this.caught = caught;
        this.lastSubscription = this;
        this.destination.add(this);
    }
    CatchSubscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    CatchSubscriber.prototype._error = function (err) {
        var result = tryCatch_1.tryCatch(this.selector)(err, this.caught);
        if (result === errorObject_1.errorObject) {
            this.destination.error(errorObject_1.errorObject.e);
        }
        else {
            this.lastSubscription.unsubscribe();
            this.lastSubscription = result.subscribe(this.destination);
        }
    };
    CatchSubscriber.prototype._complete = function () {
        this.lastSubscription.unsubscribe();
        this.destination.complete();
    };
    CatchSubscriber.prototype._unsubscribe = function () {
        this.lastSubscription.unsubscribe();
    };
    return CatchSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=catch.js.map